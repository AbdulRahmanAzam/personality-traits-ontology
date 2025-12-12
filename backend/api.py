from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from owlready2 import get_ontology
from scipy import stats
import os

app = FastAPI(
    title="Big Five Personality Assessment API",
    description="API for IPIP-50 personality assessment using OWL ontology",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global ontology instance
onto = None
ns = None

def load_ontology():
    """Load the ontology on startup."""
    global onto, ns
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ontology_path = os.path.join(script_dir, "bigfive.rdf")
    onto = get_ontology(f"file://{ontology_path}").load()
    # onto = get_ontology(f"file://{ontology_path}").load()
    # onto = get_ontology(f"file://{ontology_path}").load(format="turtle")

    ns = onto.get_namespace("http://www.personality-ontology.org/bigfive#")

@app.on_event("startup")
async def startup_event():
    load_ontology()

# Pydantic models
class QuestionResponse(BaseModel):
    id: int
    text: str
    trait: str
    reversed: bool

class LikertOption(BaseModel):
    value: int
    label: str

class QuestionsData(BaseModel):
    questions: List[QuestionResponse]
    likertOptions: List[LikertOption]

class AssessmentRequest(BaseModel):
    responses: Dict[str, int]  # {questionId: score}
    userData: Dict[str, str]

class TraitResult(BaseModel):
    name: str
    rawScore: int
    maxScore: int
    percentile: float
    tScore: float
    interpretation: str
    populationMean: float
    populationStd: float

class PredictionResult(BaseModel):
    score: float
    interpretation: str
    contributingTraits: List[Dict]

class AssessmentResult(BaseModel):
    traits: Dict[str, TraitResult]
    predictions: Dict[str, PredictionResult]


def get_trait_map():
    """Map trait instances to trait names."""
    return {
        ns.ExtraversionTrait: 'extraversion',
        ns.AgreeablenessTrait: 'agreeableness',
        ns.ConscientiousnessTrait: 'conscientiousness',
        ns.NeuroticismTrait: 'neuroticism',
        ns.OpennessTrait: 'openness'
    }


@app.get("/")
async def root():
    return {"message": "Big Five Personality Assessment API", "status": "running"}


@app.get("/api/questions", response_model=QuestionsData)
async def get_questions():
    """Fetch all 50 IPIP questions from the ontology."""
    if not ns:
        raise HTTPException(status_code=500, detail="Ontology not loaded")
    
    trait_map = get_trait_map()
    questions = []
    
    # Get positively keyed questions
    for q in ns.PositivelyKeyedQuestion.instances():
        trait_instance = q.measuresTrait[0] if q.measuresTrait else None
        if trait_instance in trait_map:
            q_id = q.questionID[0] if q.questionID else None
            q_text = q.questionText[0] if q.questionText else ''
            if q_id and q_text:
                questions.append(QuestionResponse(
                    id=q_id,
                    text=q_text,
                    trait=trait_map[trait_instance][0].upper(),  # E, A, C, N, O
                    reversed=False
                ))
    
    # Get negatively keyed questions
    for q in ns.NegativelyKeyedQuestion.instances():
        trait_instance = q.measuresTrait[0] if q.measuresTrait else None
        if trait_instance in trait_map:
            q_id = q.questionID[0] if q.questionID else None
            q_text = q.questionText[0] if q.questionText else ''
            if q_id and q_text:
                questions.append(QuestionResponse(
                    id=q_id,
                    text=q_text,
                    trait=trait_map[trait_instance][0].upper(),  # E, A, C, N, O
                    reversed=True
                ))
    
    # Sort by question ID
    questions.sort(key=lambda x: x.id)
    
    # Get Likert options from ontology
    likert_options = []
    for opt in ns.LikertOption.instances():
        value = opt.likertValue[0] if opt.likertValue else None
        label = opt.likertLabel[0] if opt.likertLabel else ''
        if value is not None:
            likert_options.append(LikertOption(value=value, label=label))
    
    likert_options.sort(key=lambda x: x.value)
    
    return QuestionsData(questions=questions, likertOptions=likert_options)


@app.get("/api/likert-options")
async def get_likert_options():
    """Get Likert scale options from ontology."""
    if not ns:
        raise HTTPException(status_code=500, detail="Ontology not loaded")
    
    options = []
    for opt in ns.LikertOption.instances():
        value = opt.likertValue[0] if opt.likertValue else None
        label = opt.likertLabel[0] if opt.likertLabel else ''
        if value is not None:
            options.append({"value": value, "label": label})
    
    options.sort(key=lambda x: x["value"])
    return {"likertOptions": options}


@app.post("/api/submit", response_model=AssessmentResult)
async def submit_assessment(request: AssessmentRequest):
    """Process assessment responses and return results."""
    if not ns:
        raise HTTPException(status_code=500, detail="Ontology not loaded")
    
    responses = {int(k): v for k, v in request.responses.items()}
    
    # Load questions grouped by trait
    trait_map = get_trait_map()
    questions_by_trait = {
        'extraversion': {'positive': [], 'negative': []},
        'agreeableness': {'positive': [], 'negative': []},
        'conscientiousness': {'positive': [], 'negative': []},
        'neuroticism': {'positive': [], 'negative': []},
        'openness': {'positive': [], 'negative': []}
    }
    
    for q in ns.PositivelyKeyedQuestion.instances():
        trait_instance = q.measuresTrait[0] if q.measuresTrait else None
        if trait_instance in trait_map:
            q_id = q.questionID[0] if q.questionID else None
            if q_id:
                questions_by_trait[trait_map[trait_instance]]['positive'].append(q_id)
    
    for q in ns.NegativelyKeyedQuestion.instances():
        trait_instance = q.measuresTrait[0] if q.measuresTrait else None
        if trait_instance in trait_map:
            q_id = q.questionID[0] if q.questionID else None
            if q_id:
                questions_by_trait[trait_map[trait_instance]]['negative'].append(q_id)
    
    # Load norms from ontology
    norms = {}
    norm_map = {
        ns.ExtraversionNorm: 'extraversion',
        ns.AgreeablenessNorm: 'agreeableness',
        ns.ConscientiousnessNorm: 'conscientiousness',
        ns.NeuroticismNorm: 'neuroticism',
        ns.OpennessNorm: 'openness'
    }
    
    for norm_instance, trait_name in norm_map.items():
        if norm_instance:
            norms[trait_name] = {
                'mean': norm_instance.populationMean[0] if norm_instance.populationMean else 0,
                'std': norm_instance.populationStd[0] if norm_instance.populationStd else 1
            }
    
    # Load score categories
    score_categories = []
    for cat in ns.ScoreCategory.instances():
        score_categories.append({
            'name': cat.categoryName[0] if cat.categoryName else '',
            'min': cat.categoryMinPercentile[0] if cat.categoryMinPercentile else 0,
            'max': cat.categoryMaxPercentile[0] if cat.categoryMaxPercentile else 100
        })
    score_categories.sort(key=lambda x: x['min'])
    
    # Calculate trait scores
    trait_results = {}
    trait_names = {
        'extraversion': 'Extraversion',
        'agreeableness': 'Agreeableness',
        'conscientiousness': 'Conscientiousness',
        'neuroticism': 'Neuroticism',
        'openness': 'Openness'
    }
    
    for trait, questions in questions_by_trait.items():
        # Calculate raw score
        raw_score = 0
        for q_id in questions['positive']:
            raw_score += responses.get(q_id, 3)
        for q_id in questions['negative']:
            raw_score += (6 - responses.get(q_id, 3))  # Reverse score
        
        # Calculate percentile and T-score
        norm = norms[trait]
        z_score = (raw_score - norm['mean']) / norm['std']
        percentile = round(stats.norm.cdf(z_score) * 100, 1)
        t_score = round(50 + (10 * z_score), 1)
        
        # Get interpretation
        interpretation = "Very High"
        for cat in score_categories:
            if cat['min'] <= percentile < cat['max']:
                interpretation = cat['name']
                break
        
        trait_results[trait] = TraitResult(
            name=trait_names[trait],
            rawScore=raw_score,
            maxScore=50,
            percentile=percentile,
            tScore=t_score,
            interpretation=interpretation,
            populationMean=norm['mean'],
            populationStd=norm['std']
        )
    
    # Load correlations and calculate predictions
    correlations = {
        'job_performance': {},
        'academic_performance': {},
        'leadership_effectiveness': {}
    }
    
    outcome_map = {
        ns.JobPerformanceOutcome: 'job_performance',
        ns.AcademicPerformanceOutcome: 'academic_performance',
        ns.LeadershipEffectivenessOutcome: 'leadership_effectiveness'
    }
    
    for corr in ns.CorrelationFinding.instances():
        outcome_instance = corr.forOutcome[0] if corr.forOutcome else None
        trait_instance = corr.regardingTrait[0] if corr.regardingTrait else None
        
        if outcome_instance in outcome_map and trait_instance in trait_map:
            outcome_name = outcome_map[outcome_instance]
            trait_name = trait_map[trait_instance]
            correlations[outcome_name][trait_name] = {
                'value': corr.correlationValue[0] if corr.correlationValue else 0,
                'num_studies': corr.numberOfStudies[0] if corr.numberOfStudies else 0
            }
    
    # Calculate predictions
    predictions = {}
    outcome_names = {
        'job_performance': 'Job Performance',
        'academic_performance': 'Academic Performance',
        'leadership_effectiveness': 'Leadership Effectiveness'
    }
    
    for outcome, trait_correlations in correlations.items():
        if not trait_correlations:
            continue
        
        weighted_sum = 0
        total_weight = 0
        contributing = []
        
        for trait, corr_data in trait_correlations.items():
            if trait in trait_results:
                normalized_score = trait_results[trait].percentile / 100
                weight = abs(corr_data['value'])
                contribution = normalized_score * corr_data['value']
                weighted_sum += contribution
                total_weight += weight
                contributing.append({
                    'trait': trait_names[trait],
                    'correlation': corr_data['value'],
                    'numStudies': corr_data['num_studies']
                })
        
        if total_weight > 0:
            prediction_score = 50 + (weighted_sum / total_weight) * 50
            
            if prediction_score < 30:
                interp = "Below Average"
            elif prediction_score < 45:
                interp = "Slightly Below Average"
            elif prediction_score < 55:
                interp = "Average"
            elif prediction_score < 70:
                interp = "Above Average"
            else:
                interp = "Well Above Average"
            
            predictions[outcome] = PredictionResult(
                score=round(prediction_score, 1),
                interpretation=interp,
                contributingTraits=contributing
            )
    
    return AssessmentResult(traits=trait_results, predictions=predictions)


@app.get("/api/traits")
async def get_traits():
    """Get trait information from ontology."""
    if not ns:
        raise HTTPException(status_code=500, detail="Ontology not loaded")
    
    traits = []
    trait_classes = [
        (ns.ExtraversionTrait, 'Extraversion', '#ef4444'),
        (ns.AgreeablenessTrait, 'Agreeableness', '#22c55e'),
        (ns.ConscientiousnessTrait, 'Conscientiousness', '#3b82f6'),
        (ns.NeuroticismTrait, 'Neuroticism', '#f59e0b'),
        (ns.OpennessTrait, 'Openness', '#8b5cf6')
    ]
    
    for trait_instance, name, color in trait_classes:
        if trait_instance:
            traits.append({
                'key': name[0],
                'name': name,
                'color': color,
                'label': trait_instance.label[0] if trait_instance.label else name
            })
    
    return {"traits": traits}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
