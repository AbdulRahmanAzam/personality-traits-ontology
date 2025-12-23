# Big Five Personality Assessment

A full-stack personality assessment application using the IPIP-50 questionnaire with OWL ontology-driven architecture.

## Features

- **50-item IPIP personality questionnaire** - Measures Big Five traits
- **Ontology-driven architecture** - Questions, norms, and scoring loaded from OWL ontology
- **Big Five trait scoring** - Percentiles, T-scores, and interpretations
- **Outcome predictions** - Job performance, academic performance, leadership effectiveness
- **PDF report generation** - Professional assessment reports
- **AI-powered guidance** - Personalized career and growth recommendations using RAG + Groq LLM
- **MongoDB persistence** - Store and retrieve assessment results

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB (optional, for data persistence)

### Backend

```powershell
# Windows (PowerShell)
cd backend
.\run.ps1

# Or manually:
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

```bash
# Linux/Mac
cd backend
./run.sh

# Or manually:
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

> **Important:** Always use `--host 0.0.0.0` to make the backend accessible from the network!

API Documentation: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

### Environment Variables

#### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://...
GROQ_API_KEY=your_groq_api_key
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000/api
```

## Project Structure

```
├── backend/
│   ├── api.py                    # FastAPI entry point
│   ├── Dockerfile                # Docker configuration
│   ├── requirements.txt          # Python dependencies
│   ├── run.ps1 / run.sh          # Run scripts
│   └── app/
│       ├── db/                   # Database operations
│       │   └── mongodb.py
│       ├── knowledge/            # RAG knowledge base
│       ├── models/               # Pydantic schemas
│       │   └── schemas.py
│       ├── routes/               # API endpoints
│       │   ├── assessment.py     # POST /api/submit
│       │   ├── guidance.py       # /api/guidance/*
│       │   ├── health.py         # GET /api/health
│       │   ├── questions.py      # GET /api/questions, /api/traits
│       │   └── results.py        # /api/results/*, /api/export/pdf/*
│       └── services/             # Business logic
│           ├── assessment_service.py
│           ├── llm_service.py
│           ├── ontology_service.py
│           ├── pdf_service.py
│           └── rag_service.py
│
└── frontend/
    ├── src/
    │   ├── App.jsx               # Main application
    │   ├── components/           # React components
    │   │   ├── assessment/       # QuestionCard, Results
    │   │   ├── forms/            # WelcomeForm
    │   │   ├── guidance/         # GuidanceChat
    │   │   └── pages/            # LandingPage
    │   ├── services/
    │   │   └── api.js            # API client
    │   └── dev/                  # Development utilities
    └── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/questions` | Get all 50 questions with Likert options |
| GET | `/api/traits` | Get Big Five trait information |
| POST | `/api/submit` | Submit assessment and get results |
| GET | `/api/results` | List all assessments |
| GET | `/api/results/{id}` | Get assessment by ID |
| DELETE | `/api/results/{id}` | Delete assessment |
| GET | `/api/export/pdf/{id}` | Export assessment as PDF |
| GET | `/api/guidance/questions` | Get lifestyle questions |
| POST | `/api/guidance/generate` | Generate personalized guidance |
| POST | `/api/guidance/generate/stream` | Generate guidance (streaming) |

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **OWLReady2** - OWL ontology processing
- **Motor** - Async MongoDB driver
- **LangChain + Groq** - AI-powered guidance generation
- **ReportLab** - PDF generation
- **SciPy** - Statistical calculations

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling

## License

MIT
