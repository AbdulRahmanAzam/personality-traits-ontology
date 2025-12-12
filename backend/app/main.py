from owlready2 import *
from scipy import stats
from typing import Dict, List, Optional
import os


class BigFiveAssessment:
    """
    Big Five Personality Assessment using IPIP-50 scale.
    Integrates with OWL ontology for questions, norms, and correlations.
    """
    
    def __init__(self, ontology_path: str):
        """Load ontology and extract data from it."""
        self.onto = get_ontology(ontology_path).load()
        self.ns = self.onto.get_namespace("http://www.personality-ontology.org/bigfive#")
        
        # Load data from ontology
        self.questions = self._load_questions()
        self.norms = self._load_norms()
        self.correlations = self._load_correlations()
        self.score_categories = self._load_score_categories()
    
    def _load_questions(self) -> Dict:
        """Load questions from ontology, grouped by trait and keying."""
        questions = {
            'extraversion': {'positive': [], 'negative': []},
            'agreeableness': {'positive': [], 'negative': []},
            'conscientiousness': {'positive': [], 'negative': []},
            'neuroticism': {'positive': [], 'negative': []},
            'openness': {'positive': [], 'negative': []}
        }
        
        # Map trait instances to trait names
        trait_map = {
            self.ns.ExtraversionTrait: 'extraversion',
            self.ns.AgreeablenessTrait: 'agreeableness',
            self.ns.ConscientiousnessTrait: 'conscientiousness',
            self.ns.NeuroticismTrait: 'neuroticism',
            self.ns.OpennessTrait: 'openness'
        }
        
        # Query positively keyed questions
        for q in self.ns.PositivelyKeyedQuestion.instances():
            trait_instance = q.measuresTrait[0] if q.measuresTrait else None
            if trait_instance in trait_map:
                trait_name = trait_map[trait_instance]
                q_id = q.questionID[0] if q.questionID else None
                if q_id:
                    questions[trait_name]['positive'].append({
                        'id': q_id,
                        'text': q.questionText[0] if q.questionText else ''
                    })
        
        # Query negatively keyed questions
        for q in self.ns.NegativelyKeyedQuestion.instances():
            trait_instance = q.measuresTrait[0] if q.measuresTrait else None
            if trait_instance in trait_map:
                trait_name = trait_map[trait_instance]
                q_id = q.questionID[0] if q.questionID else None
                if q_id:
                    questions[trait_name]['negative'].append({
                        'id': q_id,
                        'text': q.questionText[0] if q.questionText else ''
                    })
        
        return questions
    
    def _load_norms(self) -> Dict:
        """Load population norms from ontology."""
        norms = {}
        
        norm_map = {
            self.ns.ExtraversionNorm: 'extraversion',
            self.ns.AgreeablenessNorm: 'agreeableness',
            self.ns.ConscientiousnessNorm: 'conscientiousness',
            self.ns.NeuroticismNorm: 'neuroticism',
            self.ns.OpennessNorm: 'openness'
        }
        
        for norm_instance, trait_name in norm_map.items():
            if norm_instance:
                norms[trait_name] = {
                    'mean': norm_instance.populationMean[0] if norm_instance.populationMean else 0,
                    'std': norm_instance.populationStd[0] if norm_instance.populationStd else 1,
                    'sample_size': norm_instance.sampleSize[0] if norm_instance.sampleSize else 0
                }
        
        return norms
    
    def _load_correlations(self) -> Dict:
        """Load correlation findings from ontology for performance predictions."""
        correlations = {
            'job_performance': {},
            'academic_performance': {},
            'leadership_effectiveness': {}
        }
        
        # Map outcome instances to outcome names
        outcome_map = {
            self.ns.JobPerformanceOutcome: 'job_performance',
            self.ns.AcademicPerformanceOutcome: 'academic_performance',
            self.ns.LeadershipEffectivenessOutcome: 'leadership_effectiveness'
        }
        
        # Map trait instances to trait names
        trait_map = {
            self.ns.ExtraversionTrait: 'extraversion',
            self.ns.AgreeablenessTrait: 'agreeableness',
            self.ns.ConscientiousnessTrait: 'conscientiousness',
            self.ns.NeuroticismTrait: 'neuroticism',
            self.ns.OpennessTrait: 'openness'
        }
        
        # Query all correlation findings
        for corr in self.ns.CorrelationFinding.instances():
            outcome_instance = corr.forOutcome[0] if corr.forOutcome else None
            trait_instance = corr.regardingTrait[0] if corr.regardingTrait else None
            
            if outcome_instance in outcome_map and trait_instance in trait_map:
                outcome_name = outcome_map[outcome_instance]
                trait_name = trait_map[trait_instance]
                corr_value = corr.correlationValue[0] if corr.correlationValue else 0
                
                correlations[outcome_name][trait_name] = {
                    'value': corr_value,
                    'ci_lower': corr.confidenceIntervalLower[0] if corr.confidenceIntervalLower else None,
                    'ci_upper': corr.confidenceIntervalUpper[0] if corr.confidenceIntervalUpper else None,
                    'num_studies': corr.numberOfStudies[0] if corr.numberOfStudies else 0
                }
        
        return correlations
    
    def _load_score_categories(self) -> List[Dict]:
        """Load score interpretation categories from ontology."""
        categories = []
        
        for cat in self.ns.ScoreCategory.instances():
            categories.append({
                'name': cat.categoryName[0] if cat.categoryName else '',
                'min_percentile': cat.categoryMinPercentile[0] if cat.categoryMinPercentile else 0,
                'max_percentile': cat.categoryMaxPercentile[0] if cat.categoryMaxPercentile else 100
            })
        
        # Sort by min percentile
        categories.sort(key=lambda x: x['min_percentile'])
        return categories
    
    def get_all_questions(self) -> List[Dict]:
        """Get all 50 questions in order for the assessment."""
        all_questions = []
        
        for trait, keyed in self.questions.items():
            for q in keyed['positive']:
                all_questions.append({
                    'id': q['id'],
                    'text': q['text'],
                    'trait': trait,
                    'reverse_scored': False
                })
            for q in keyed['negative']:
                all_questions.append({
                    'id': q['id'],
                    'text': q['text'],
                    'trait': trait,
                    'reverse_scored': True
                })
        
        # Sort by question ID
        all_questions.sort(key=lambda x: x['id'])
        return all_questions
    
    def reverse_score(self, score: int) -> int:
        """Reverse score for negatively keyed items (1↔5, 2↔4, 3↔3)."""
        return 6 - score
    
    def calculate_raw_trait_score(self, responses: Dict[int, int], trait: str) -> int:
        """
        Calculate raw score for a trait (range: 10-50).
        
        Args:
            responses: {question_id: score} where score is 1-5
            trait: trait name (e.g., 'extraversion')
        
        Returns:
            Raw score (10-50)
        """
        questions = self.questions[trait]
        total = 0
        
        for q in questions['positive']:
            total += responses.get(q['id'], 3)  # Default to neutral if missing
        
        for q in questions['negative']:
            total += self.reverse_score(responses.get(q['id'], 3))
        
        return total
    
    def calculate_percentile(self, raw_score: int, trait: str) -> float:
        """Calculate percentile based on population norms."""
        norms = self.norms[trait]
        z_score = (raw_score - norms['mean']) / norms['std']
        percentile = stats.norm.cdf(z_score) * 100
        return round(percentile, 1)
    
    def calculate_t_score(self, raw_score: int, trait: str) -> float:
        """Calculate T-score (standardized: mean=50, std=10)."""
        norms = self.norms[trait]
        z_score = (raw_score - norms['mean']) / norms['std']
        t_score = 50 + (10 * z_score)
        return round(t_score, 1)
    
    def get_interpretation(self, percentile: float) -> str:
        """Get interpretation category based on percentile using ontology categories."""
        for category in self.score_categories:
            if category['min_percentile'] <= percentile < category['max_percentile']:
                return category['name']
        return "Very High"  # Default for percentile = 100
    
    def process_assessment(self, responses: Dict[int, int]) -> Dict:
        """
        Process all 50 responses and return complete results.
        
        Args:
            responses: {question_id: score} where score is 1-5 (Likert scale)
        
        Returns:
            Complete results with trait scores, interpretations, and predictions
        """
        results = {'traits': {}}
        
        for trait in self.questions.keys():
            raw_score = self.calculate_raw_trait_score(responses, trait)
            percentile = self.calculate_percentile(raw_score, trait)
            
            results['traits'][trait] = {
                'raw_score': raw_score,
                'max_score': 50,
                'percentile': percentile,
                't_score': self.calculate_t_score(raw_score, trait),
                'interpretation': self.get_interpretation(percentile),
                'population_mean': self.norms[trait]['mean'],
                'population_std': self.norms[trait]['std']
            }
        
        # Add performance predictions based on ontology correlations
        results['predictions'] = self.predict_performance(results['traits'])
        
        return results
    
    def predict_performance(self, trait_results: Dict) -> Dict:
        """
        Predict performance outcomes using correlations from ontology.
        
        Uses weighted combination of trait percentiles and correlation values.
        """
        predictions = {}
        
        for outcome, trait_correlations in self.correlations.items():
            if not trait_correlations:
                continue
            
            # Calculate weighted prediction
            weighted_sum = 0
            total_weight = 0
            details = []
            
            for trait, corr_data in trait_correlations.items():
                if trait in trait_results:
                    # Normalize percentile to 0-1 range
                    normalized_score = trait_results[trait]['percentile'] / 100
                    weight = abs(corr_data['value'])
                    
                    # Apply correlation direction
                    contribution = normalized_score * corr_data['value']
                    weighted_sum += contribution
                    total_weight += weight
                    
                    details.append({
                        'trait': trait,
                        'correlation': corr_data['value'],
                        'num_studies': corr_data['num_studies']
                    })
            
            if total_weight > 0:
                # Scale prediction to 0-100 range
                prediction_score = 50 + (weighted_sum / total_weight) * 50
                predictions[outcome] = {
                    'score': round(prediction_score, 1),
                    'interpretation': self._interpret_prediction(prediction_score),
                    'contributing_traits': details
                }
        
        return predictions
    
    def _interpret_prediction(self, score: float) -> str:
        """Interpret prediction score."""
        if score < 30:
            return "Below Average"
        elif score < 45:
            return "Slightly Below Average"
        elif score < 55:
            return "Average"
        elif score < 70:
            return "Above Average"
        else:
            return "Well Above Average"


# Usage Example
if __name__ == "__main__":
    # Get the ontology path relative to this file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ontology_path = os.path.join(script_dir, "..", "ontology2.owl")
    
    # Initialize assessment
    assessment = BigFiveAssessment(ontology_path)
    
    # Print available questions
    print("=== IPIP-50 Questions ===")
    questions = assessment.get_all_questions()
    for q in questions[:5]:  # Show first 5
        print(f"Q{q['id']}: {q['text']} ({q['trait']}, reverse={q['reverse_scored']})")
    print(f"... and {len(questions) - 5} more questions\n")
    
    # Sample responses (all 50 questions, scale 1-5)
    sample_responses = {
        # Extraversion: positive=[1,11,21,31,41], negative=[6,16,26,36,46]
        1: 4, 11: 4, 21: 3, 31: 4, 41: 3,
        6: 2, 16: 3, 26: 2, 36: 3, 46: 2,
        # Agreeableness: positive=[7,17,27,37,47], negative=[2,12,22,32,42]
        7: 5, 17: 4, 27: 4, 37: 4, 47: 4,
        2: 1, 12: 1, 22: 2, 32: 2, 42: 3,
        # Conscientiousness: positive=[3,13,23,33,43], negative=[8,18,28,38,48]
        3: 4, 13: 5, 23: 3, 33: 4, 43: 4,
        8: 2, 18: 2, 28: 3, 38: 1, 48: 2,
        # Neuroticism: positive=[4,14,24,34,44], negative=[9,19,29,39,49]
        4: 2, 14: 3, 24: 2, 34: 2, 44: 3,
        9: 4, 19: 3, 29: 4, 39: 3, 49: 4,
        # Openness: positive=[5,15,25,35,45], negative=[10,20,30,40,50]
        5: 4, 15: 5, 25: 4, 35: 4, 45: 3,
        10: 2, 20: 2, 30: 1, 40: 2, 50: 2
    }
    
    # Process assessment
    results = assessment.process_assessment(sample_responses)
    
    # Display trait results
    print("=== Personality Profile ===")
    for trait, scores in results['traits'].items():
        print(f"\n{trait.upper()}")
        print(f"  Raw Score: {scores['raw_score']}/{scores['max_score']}")
        print(f"  Percentile: {scores['percentile']}%")
        print(f"  T-Score: {scores['t_score']}")
        print(f"  Interpretation: {scores['interpretation']}")
    
    # Display predictions
    print("\n=== Performance Predictions ===")
    for outcome, prediction in results['predictions'].items():
        print(f"\n{outcome.replace('_', ' ').title()}")
        print(f"  Predicted Score: {prediction['score']}")
        print(f"  Interpretation: {prediction['interpretation']}")
        print(f"  Based on {len(prediction['contributing_traits'])} trait correlations")