# ProgressBridge AI - Production Deployment Guide
**Smart India Hackathon 2026 — Problem Statement ID: SIH26122**
*Organization: Oil India Limited | Theme: Smart Automation*

---

## 1. Architecture Overview
ProgressBridge AI is deployed across a decoupled microservices architecture designed for high availability, zero cold-start downtime, and scalable semantic schedule matching:

```
                            [ USER / BROWSER ]
                                    │
                                    ▼
                     [ FRONTEND: Vercel Production ]
                     (React + Vite SPA with Routing)
                                    │
                         REST API Requests (HTTPS)
                                    │
                                    ▼
                     [ BACKEND: Render Production ]
                        (Node.js + Express Server)
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼                                     ▼
     [ CLOUD DATABASE ]                      [ AI MICROSERVICE ]
       MongoDB Atlas                       Render / Python 3.13
   (Managed M0 Free Cluster)             FastAPI + Hybrid NLP Matcher
```

---

## 2. GitHub Setup & Repository Structure

1. **Repository Target:**
   `https://github.com/yashas98765/ProgressBridge-AI`

2. **Repository Folder Tree:**
   ```
   ├── frontend/         # React + Vite client application
   ├── backend/          # Node.js + Express API server
   ├── ai-service/       # Python FastAPI NLP & semantic matcher
   ├── data/             # Synthetic sample reports, CSVs, and logs
   ├── docs/             # Technical architecture & deployment guides
   ├── render.yaml       # Render Blueprint for automated multi-service deploy
   ├── vercel.json       # SPA routing rewrites configuration
   ├── .env.example      # Master environment variable template
   └── README.md         # Comprehensive project documentation
   ```

3. **Git Initialization & Remote Setup:**
   ```bash
   git init
   git branch -M main
   git remote add origin https://github.com/yashas98765/ProgressBridge-AI.git
   ```

---

## 3. Cloud Database Setup (MongoDB Atlas)

1. **Create Free M0 Cluster:**
   - Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a new free cluster (Shared M0 Sandbox on AWS/GCP, Region: Mumbai `ap-south-1` or Singapore `ap-southeast-1`).
   - Create a Database User (e.g. `progressadmin`) with a strong password.
   - In **Network Access**, add IP Access List entry `0.0.0.0/0` (Allow Access from Anywhere) so cloud instances on Render/Vercel can connect.

2. **Get Connection String:**
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/progressbridge?retryWrites=true&w=majority
   ```

3. **Seed Database with Baseline Infrastructure Data:**
   Run the seeding script once pointing to your Atlas cluster:
   ```bash
   cd backend
   export MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/progressbridge?retryWrites=true&w=majority"
   npm run seed
   ```
   The database will automatically populate with:
   - 36 Schedule Activities (L1-L6 WBS)
   - 22 Progress Events (DPRs, CSVs, site diaries, voice transcripts)
   - 14 Semantic Match Records (High, Medium, and Low confidence)
   - 7 Critical Delay Records (Weather, Material, Crane, NDT)
   - 12 Institutional Project Memory Records
   - 15 Cryptographic SHA-256 Audit Trail Logs

---

## 4. AI Microservice Deployment (FastAPI on Render)

1. **Create Web Service on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** > **Web Service**.
   - Connect repository `https://github.com/yashas98765/ProgressBridge-AI`.
   - Set **Root Directory**: `ai-service`
   - Set **Runtime**: `Python 3`
   - Set **Build Command**: `pip install -r requirements.txt`
   - Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Set **Instance Type**: Free

2. **Environment Variables:**
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `8000` | Port assigned by Render |
   | `MODEL_NAME` | `all-MiniLM-L6-v2` | Embedding model identifier |

3. **Verify Public URL:**
   - Once deployed, copy the service URL (e.g. `https://progressbridge-ai.onrender.com`).
   - Test health check:
     ```bash
     curl https://progressbridge-ai.onrender.com/health
     # Expected: {"status": "ok", "service": "ProgressBridge AI"}
     ```

---

## 5. Backend API Deployment (Node.js on Render)

1. **Create Web Service on Render:**
   - Click **New +** > **Web Service**.
   - Connect repository `https://github.com/yashas98765/ProgressBridge-AI`.
   - Set **Root Directory**: `backend`
   - Set **Runtime**: `Node`
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `node src/server.js`
   - Set **Instance Type**: Free

2. **Environment Variables:**
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `5000` | Internal server port |
   | `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas URI |
   | `JWT_SECRET` | `<random_hex_string>` | JWT authentication secret |
   | `AI_SERVICE_URL` | `https://progressbridge-ai.onrender.com` | Public AI Service URL |
   | `CORS_ORIGIN` | `https://progressbridge-ai.vercel.app` | Public Frontend URL |

3. **Verify Backend Health:**
   ```bash
   curl https://progressbridge-api.onrender.com/health
   # Expected: {"status": "ok", "service": "ProgressBridge Backend"}

   curl https://progressbridge-api.onrender.com/api/health
   # Expected: {"status": "ok", "service": "ProgressBridge Backend", "database": "connected", "ai_service": "connected"}
   ```

---

## 6. Frontend Deployment (React + Vite on Vercel)

1. **Deploy to Vercel:**
   - Log into [Vercel Dashboard](https://vercel.com).
   - Click **Add New...** > **Project**.
   - Import `yashas98765/ProgressBridge-AI`.
   - Set **Root Directory**: `frontend`
   - Set **Framework Preset**: `Vite`
   - Set **Build Command**: `npm run build`
   - Set **Output Directory**: `dist`

2. **Environment Variables:**
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://progressbridge-api.onrender.com` | Deployed backend URL |

3. **Client-Side SPA Routing (`vercel.json`):**
   The repository includes `frontend/vercel.json` with wildcard rewrites ensuring that refreshing deep routes like `/schedule`, `/time-agent`, or `/analytics` never results in 404 errors:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## 7. Production Health & End-to-End Verification

Execute the standard SIH jury evaluation workflow on the deployed public URL:

1. **Access Public Frontend:** Open your Vercel URL (e.g. `https://progressbridge-ai.vercel.app`).
2. **Launch Demo:** Click **"Launch Demo"** or select **"Priyanka Sharma (PLANNER)"** to sign in.
3. **Inspect Dashboard:** Confirm overall S-Curve progress (68% actual vs 72% planned, -4% variance).
4. **Data Ingestion:** Navigate to **Data Ingestion** and upload `data/reports/daily_progress_report.txt`.
5. **AI Semantic Matching:** Verify the AI engine extracts the activity and scores confidence.
6. **Match Approval:** On **Match Review**, click **Approve Match** to commit the linkage.
7. **Schedule Updates:** Navigate to **Schedule Updates** to verify duration recalculation.
8. **Delay Analytics:** Check **Delay Analytics** for root causes (Weather, Material, Equipment).
9. **Project Memory:** Review institutional lessons learned and AI recommended mitigations.
10. **Immutable Audit Trail:** Verify that the SHA-256 cryptographic chain reflects the approval.
11. **Time Agent Natural Language Update:**
    - Switch persona to **Ravi Kumar (SUPERVISOR)**.
    - Type: *"Spool erection on Line 24 started today at 9:30 AM."*
    - Verify entity extraction and suggested activity linkage (`L6-PIP-024`).

---

## 8. Troubleshooting & Maintenance

| Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| **CORS error in browser console** | `CORS_ORIGIN` mismatch on backend | Add your exact frontend Vercel domain to `CORS_ORIGIN` on Render. |
| **Backend /health returns 502** | Render instance sleeping (free tier cold start) | Free tier instances sleep after 15 min inactivity; wait 30s for spin-up. |
| **Database disconnected** | MongoDB Atlas IP whitelist blocking traffic | Verify `0.0.0.0/0` is present in Atlas Network Access. |
| **AI fallback warning logged** | AI microservice spinning up | Backend automatically uses built-in JS fallback engine without failing user requests. |
| **Vercel route 404 on page refresh** | Missing SPA rewrite rule | Ensure `vercel.json` contains `rewrites: [{ source: "/(.*)", destination: "/index.html" }]`. |

---

## 9. Redeployment Process

When updating code:
```bash
git add .
git commit -m "feat: your feature description"
git push origin main
```
- **Vercel** automatically builds and deploys the new frontend commit in ~60 seconds.
- **Render** automatically pulls and redeploys the backend and AI microservice in ~2 minutes.
