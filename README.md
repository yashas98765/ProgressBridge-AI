# ProgressBridge AI
### *AI-Powered Planning-to-Execution Bridge for Infrastructure Projects*
> **Tagline:** *"From Site Execution to Schedule Intelligence."*

---

## 🏆 Smart India Hackathon (SIH 2026) Project Overview

- **Problem Statement ID:** `SIH26122`
- **Problem Statement Title:** *Intelligent Data Capture & Schedule-Linking Layer for Infrastructure Project Management: Real-Time Actual Progress Tracking (Planning-to-Execution Bridge)*
- **Problem Creator:** Sarim Moin
- **Organization:** Oil India Limited
- **Category:** Software
- **Technology Bucket:** Smart Automation

---

## 📌 Project Disclaimer & Privacy Notice
> [!IMPORTANT]
> **Synthetic / Sample Data Disclosure:**
> This prototype uses **synthetic, representative project data** and does **not** connect to live Oil India systems or confidential company databases. The schedule-linking engine uses open-source embeddings, similarity scoring, and deterministic rules to demonstrate the AI-assisted schedule-linking concept without dependency on expensive external paid APIs.

---

## 🎯 The Core Problem & Solution

Infrastructure projects (such as petrochemical units, pipelines, and civil refineries) cascade from macro milestones (**L1/L2**) down to micro executable activities (**L5/L6**), spanning:
- **Piping** (spool fabrication, erection, welding, NDT, hydrotesting)
- **Civil** (excavation, rebar binding, concrete pouring, trenching)
- **Electrical** (cable tray installation, cable pulling, termination)
- **Instrumentation** (transmitter calibration, impulse tubing, loop checking)
- **Static & Rotating Equipment** (columns, heat exchangers, pumps, compressors)
- **HSE** (safety permits, toolbox talks, pre-test audits)

While baseline schedules are rigorously maintained in tools such as **Primavera P6** or **MS Project**, actual daily execution data arrives as **unstructured text, site diaries, discipline-wise spreadsheets, and supervisor verbal updates**. 

Because physical activities are phrased differently by field personnel (e.g., site report says *"Spool erected on Line 24"*, whereas the schedule node states *"Erect Line 24-XX"*), planners face an enormous manual bottleneck trying to link field progress back to schedule activity codes.

**ProgressBridge AI** bridges this gap by automatically ingesting heterogeneous field inputs, normalizing descriptions, computing semantic and character-level similarity scores against L5/L6 schedule nodes, providing human-in-the-loop review, updating schedule actuals, logging audit trails, and generating empirical project memory patterns.

---

## 🏛️ High-Level System Architecture

```mermaid
flowchart TD
    subgraph INGESTION["1. Input Sources & Ingestion"]
        A1["Daily Progress Reports (.txt)"]
        A2["Discipline Spreadsheets (.xlsx, .csv)"]
        A3["Site Diaries & PDFs (.pdf)"]
        A4["Time Agent Conversational Voice/Text"]
    end

    subgraph PIPELINE["2. Extraction & Normalization"]
        B1["Discipline Entity Extraction"]
        B2["Activity Description Normalization"]
        B3["Start/End Timestamp Detection"]
        B4["Supervisor & Line Tag Parsing"]
    end

    subgraph ENGINE["3. Semantic Schedule-Linking Engine"]
        C1["TF-IDF Word & Character N-Grams"]
        C2["Levenshtein & Token Overlap Fuzzy Ratio"]
        C3["Discipline Filtering & Identifier Boosting"]
        C4["Hybrid Confidence Calculation (0.0 - 1.0)"]
    end

    subgraph GOVERNANCE["4. Human-In-The-Loop Governance"]
        D1["High Confidence (>= 80%): Auto-Suggest"]
        D2["Medium Confidence (60-79%): Planner Review"]
        D3["Low Confidence (< 60%): Flagged Unmatched"]
        D4["Planner Actions: Approve / Reject / Reassign"]
    end

    subgraph PMIS["5. Schedule & Progress Updates"]
        E1["Actual Start/End Dates Injected"]
        E2["Actual Duration & Delay Calculation"]
        E3["Variance & S-Curve Progress Recalculation"]
        E4["Status Badges: ON TIME / DELAYED / EARLY"]
    end

    subgraph LEDGER["6. Analytics, Memory & Compliance"]
        F1["Executive PMIS Dashboard"]
        F2["Delay & Risk Analytics (Root Causes)"]
        F3["Institutional Project Memory (Historical Patterns)"]
        F4["Immutable Audit Trail (User Attribution)"]
    end

    INGESTION --> PIPELINE
    PIPELINE --> ENGINE
    ENGINE --> GOVERNANCE
    GOVERNANCE --> PMIS
    PMIS --> LEDGER
```

---

## ⚡ Technology Stack

### Frontend
- **React.js & Vite**: Fast responsive enterprise UI with `@tailwindcss/vite`
- **Tailwind CSS**: Modern clean enterprise theme tailored for project controls
- **React Router 7**: Client-side routing across all 11 modules
- **Recharts**: Interactive S-curves, progress trends, confidence distribution, and delay cause charts
- **Lucide React**: Clean iconography

### Backend
- **Node.js & Express.js**: REST API server with JWT authentication and RBAC
- **Mongoose & MongoDB**: Persistent document storage across 9 collections
- **Multer & XLSX**: File parsing and column header mapping
- **Resilient AI Fallback Bridge**: In-process semantic matching fallback to guarantee 100% zero-downtime

### AI / NLP Service
- **Python 3.13 & FastAPI**: High-performance asynchronous AI microservice
- **Scikit-Learn**: TF-IDF n-gram vectorization & Cosine Similarity
- **Regex & Domain Parsers**: Multi-format timestamp extraction and discipline classification
- **PyPDF**: PDF document stream extraction

---

## 📂 Project Structure

```
SIH26122/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── DemoTourModal.jsx         # 11-step interactive guided walkthrough
│   │   ├── context/
│   │   │   └── AppContext.jsx            # Demo users, thresholds & notifications
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx            # Sidebar, header & demo switcher
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx         # Executive PMIS & S-curve analytics
│   │   │   ├── DataIngestionPage.jsx     # Drag-and-drop & sample data loader
│   │   │   ├── SchedulePage.jsx          # Hierarchical L1-L6 schedule explorer
│   │   │   ├── ProgressEventsPage.jsx    # Raw event stream ledger
│   │   │   ├── MatchReviewPage.jsx       # Planner review queue & live sandbox
│   │   │   ├── TimeAgentPage.jsx         # Conversational supervisor chat
│   │   │   ├── ScheduleUpdatesPage.jsx   # Variance, duration & delay ledger
│   │   │   ├── DelayAnalyticsPage.jsx    # Root cause & discipline delays
│   │   │   ├── ProjectMemoryPage.jsx     # Institutional memory & search
│   │   │   ├── AuditTrailPage.jsx        # Immutable governance log
│   │   │   └── SettingsPage.jsx          # Threshold tuning & demo reset
│   │   ├── services/
│   │   │   └── api.js                    # Unified REST client
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js                   # JWT verification & RBAC
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── ScheduleActivity.js       # L1-L6 WBS nodes
│   │   │   ├── ProgressEvent.js          # Ingested actual events
│   │   │   ├── Document.js               # Uploaded files
│   │   │   ├── Match.js                  # Proposed linkages & scores
│   │   │   ├── AuditLog.js               # Governance trail
│   │   │   ├── DelayRecord.js            # Delay analytics
│   │   │   └── ProjectMemory.js          # Institutional patterns
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── schedule.routes.js
│   │   │   ├── document.routes.js
│   │   │   ├── progress.routes.js
│   │   │   ├── match.routes.js
│   │   │   ├── timeAgent.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   ├── audit.routes.js
│   │   │   └── demo.routes.js
│   │   ├── services/
│   │   │   └── aiServiceBridge.js        # Node-to-Python AI bridge + Fallback
│   │   ├── utils/
│   │   │   └── seedData.js               # Realistic synthetic database seeder
│   │   └── server.js
│   └── package.json
│
├── ai-service/
│   ├── app/
│   │   ├── extraction/
│   │   │   └── pipeline.py               # Flexible date & discipline regex
│   │   ├── matching/
│   │   │   └── engine.py                 # Hybrid TF-IDF + Levenshtein matcher
│   │   ├── services/
│   │   │   └── time_agent.py             # Supervisor conversational logic
│   │   └── main.py                       # FastAPI entrypoint
│   └── requirements.txt
│
├── data/
│   ├── reports/
│   │   ├── daily_progress_report.txt     # Sample free-text DPR
│   │   └── site_diary_log.txt            # Sample site diary
│   └── spreadsheets/
│       └── discipline_progress.csv       # Sample Excel/CSV tracker
│
├── docker-compose.yml
├── .env.example
├── README.md
└── package.json
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** >= 18.x
- **Python** >= 3.10
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or Docker)

---

### Step 1: Install Dependencies

#### 1. Backend:
```bash
cd backend
npm install
```

#### 2. Frontend:
```bash
cd ../frontend
npm install
```

#### 3. AI Service:
```bash
cd ../ai-service
# In your virtual environment:
pip install -r requirements.txt
```

---

### Step 2: Seed the Database
Initialize demo users, 25+ hierarchical L1-L6 schedule activities, delay records, and project memory:
```bash
cd backend
npm run seed
```

---

### Step 3: Run the Prototype

#### Start AI Service (Port 8000):
```bash
cd ai-service
uvicorn app.main:app --port 8000 --reload
```

#### Start Backend Server (Port 5000):
```bash
cd backend
npm run dev
```

#### Start Frontend UI (Port 3000):
```bash
cd frontend
npm run dev
```

Open your browser to: **`http://localhost:3000`**

---

## 🚀 Production Deployment & Live URLs

The application is architected for low-cost, production-grade cloud hosting:

| Component | Target Platform | Production URL | Runtime | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | `https://progressbridge-ai.vercel.app` | React 19 + Vite 6 | Ready / Deployed |
| **Backend API** | Render | `https://progressbridge-api.onrender.com` | Node.js 22 + Express | Ready / Deployed |
| **AI Microservice** | Render | `https://progressbridge-ai.onrender.com` | Python 3.13 + FastAPI | Ready / Deployed |
| **Database** | MongoDB Atlas | Managed M0 Cloud Cluster | MongoDB 7.0+ | Active / Seeded |

> [!NOTE]
> For complete step-by-step instructions on provisioning MongoDB Atlas, configuring Vercel SPA rewrites, and using Render blueprints, refer to [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## ⚙️ Environment Variables Documentation

### 1. Frontend (`frontend/.env` / Vercel Environment Settings):
| Variable | Required | Example | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Production only | `https://progressbridge-api.onrender.com` | Public URL of the backend API. When empty, Vite proxies to `http://localhost:5000`. |

### 2. Backend API (`backend/.env` / Render Environment Settings):
| Variable | Required | Example | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `5000` | Port for the Node.js Express server. |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/pb` | MongoDB Atlas cloud connection string. |
| `JWT_SECRET` | Yes | `pb_secret_jwt_key_sih2026_prod` | Secret for signing role-based session JWT tokens. |
| `AI_SERVICE_URL` | Yes | `https://progressbridge-ai.onrender.com` | Public URL of the Python FastAPI microservice. |
| `CORS_ORIGIN` | Yes | `https://progressbridge-ai.vercel.app` | Restricts CORS to the deployed frontend domain in production. |

### 3. AI Microservice (`ai-service/.env` / Render Environment Settings):
| Variable | Required | Example | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `8000` | Port for the Uvicorn FastAPI server. |
| `MODEL_NAME` | Optional | `all-MiniLM-L6-v2` | Sentence Transformer / semantic embedding model. |

---

## 👥 Demo Personas & Credentials

All demo accounts use the standard password: **`progress123`**

| Role | Name | Email | Primary Responsibilities |
|---|---|---|---|
| **PLANNER** *(Default)* | Priyanka Sharma | `planner@progressbridge.demo` | Match Review, Approval/Rejection, Schedule Baseline Management |
| **SUPERVISOR** | Ravi Kumar | `supervisor@progressbridge.demo` | Time Agent voice/text logging, Daily Report uploads |
| **PROJECT_MANAGER** | Vikramjit Gogoi | `manager@progressbridge.demo` | Executive S-Curve Dashboard, Delay Analytics, Project Memory |
| **ADMIN** | Amitabh Sen | `admin@progressbridge.demo` | System-wide configuration, threshold tuning, demo reset |

*Quick Persona Switching is available directly via the user dropdown in the top header.*

---

## 🎬 11-Step Guided Demonstration Workflow

The application includes an **interactive demo tour** accessible via the **"Launch Demo Tour"** button in the sidebar or top header:

1. **Step 1 - Executive Dashboard (`/`)**:
   View project status: 68% actual progress vs 72% planned progress (-4% variance), 5 delayed activities, 86% avg match confidence.
2. **Step 2 - Data Ingestion (`/ingestion`)**:
   Click **"Load Sample Daily Report"**. Notice instantaneous parsing and creation of document history.
3. **Step 3 - Extraction Pipeline (`/ingestion`)**:
   Inspect the extracted entity table: Discipline: *Piping*, Activity: *"Spool erection for Line 24"*, Start: *23 Sep 2026 09:30*, End: *25 Sep 2026 16:45*, Supervisor: *Ravi Kumar*.
4. **Step 4 - Semantic Matching Engine (`/match-review`)**:
   Observe the suggested match: `L6-PIP-024 Erect Line 24-XX` with **86% confidence** and natural language rationale.
5. **Step 5 - Planner Review (`/match-review`)**:
   Click **"Approve Match"** to ratify the link.
6. **Step 6 - Real-Time Schedule Linking (`/schedule-updates`)**:
   Check the Schedule Updates ledger: `L6-PIP-024` now displays actual start (2026-09-23), actual end (2026-09-25), actual duration (3 days), and status: **DELAYED (+1 day)**.
7. **Step 7 - Dynamic Dashboard Calculation (`/`)**:
   Dashboard automatically recalculates physical progress and discipline statistics.
8. **Step 8 - Delay & Risk Analytics (`/analytics`)**:
   Analyze the Delay Cause distribution pie chart (Material Delay, Weather, Manpower Shortage) and top delayed activities.
9. **Step 9 - Institutional Project Memory (`/project-memory`)**:
   Search `"spool erection"`. Observe historical empirical patterns (avg actual duration 3.4 days vs planned 2.5 days, recurring bottlenecks, and mitigations).
10. **Step 10 - Immutable Audit Trail (`/audit`)**:
    Review the chronological log verifying `MATCH_APPROVED` with user attribution and timestamp.
11. **Step 11 - Conversational Time Agent (`/time-agent`)**:
    Type or click quick prompt: *"Line 24 spool erection started today at 9:30 AM."* Verify instant extraction, schedule match proposal, and one-click confirmation.

---

## 🧠 AI Matching Approach & Explainability

The matching engine uses a hybrid multi-signal scoring model:

$$\text{Final Confidence} = (S_{\text{semantic}} \times 0.45) + (S_{\text{keyword}} \times 0.30) + (S_{\text{fuzzy}} \times 0.10) + (S_{\text{discipline}} \times 0.15) + \text{Bonus}_{\text{tag}}$$

1. **Semantic Similarity ($S_{\text{semantic}}$)**: Character n-grams (3-5 chars) and word n-grams (1-2 words) vectorization to capture partial equipment identifiers and morphological variants.
2. **Keyword & Token Overlap ($S_{\text{keyword}}$)**: Normalized engineering verb/noun stem matching (*erected* $\rightarrow$ *erect*, *welded* $\rightarrow$ *weld*, *poured* $\rightarrow$ *pour*).
3. **Discipline Consistency ($S_{\text{discipline}}$)**: Disciplinary validation (*Piping* match = 1.0, conflicting discipline = 0.1).
4. **Equipment Tag Boost ($\text{Bonus}_{\text{tag}}$)**: Detects specific tags like *Line 24* matching *Line 24-XX* (+0.15 boost).
5. **Configurable Thresholds**:
   - **High ($\ge 80\%$)**: Auto-suggest match for fast approval
   - **Medium ($60\% - 79\%$)**: Requires mandatory planner review
   - **Low ($< 60\%$)**: Flagged as unmatched / preserved for review

---

## 🌐 Core REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `GET` | `/api/dashboard` | Executive KPI cards, S-curve trends, discipline stats |
| `GET` | `/api/schedule` | L1 to L6 schedule activities (filtered by discipline/WBS) |
| `PUT` | `/api/schedule/:id` | Update activity actual start/end, progress %, and recalculate variance |
| `POST` | `/api/documents/upload` | Multipart file upload (TXT, CSV, XLSX, PDF) |
| `POST` | `/api/documents/sample/:type` | Load demo sample daily report, spreadsheet, or diary |
| `POST` | `/api/ai/match` | Direct AI semantic matching endpoint |
| `GET` | `/api/matches` | Review queue of proposed schedule linkages |
| `PUT` | `/api/matches/:id/approve` | Approve match & trigger automated schedule update |
| `PUT` | `/api/matches/:id/reject` | Reject proposed match with explanation |
| `PUT` | `/api/matches/:id/change` | Reassign match to another L5/L6 activity ID |
| `POST` | `/api/time-agent` | Supervisor conversational message processor |
| `GET` | `/api/analytics/delays` | Root causes, delay days, discipline distribution |
| `GET` | `/api/project-memory` | Searchable historical execution patterns & mitigations |
| `GET` | `/api/audit` | Chronological immutable governance log |
| `POST` | `/api/demo/reset` | Reseed demo environment to baseline state |

---

## 🔒 Limitations & Honest Evaluation
- **OCR Quality**: The prototype extracts digital text from PDFs and provides structured warnings for low-resolution scanned imagery rather than running heavy offline OCR models.
- **Sample Scale**: Evaluated against 35+ realistic synthetic L1-L6 activities representative of hydro-processing units rather than live confidential enterprise databases.
- **Audio Speech-to-Text**: Voice logging in Time Agent includes simulation controls and browser speech recognition integration rather than requiring commercial cloud transcription APIs.

---

## 🌟 Future Scope
- Direct bi-directional integration with Primavera P6 XML/XER APIs and MS Project MPP files.
- Computer vision model integration for drone orthophoto progress validation.
- Predictive Monte Carlo critical path risk modeling based on institutional memory delay curves.

---
**ProgressBridge AI** — Built for Smart India Hackathon 2026.
