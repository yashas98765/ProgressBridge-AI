from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import io
import pandas as pd
from pypdf import PdfReader

from app.matching.engine import SemanticMatcher
from app.extraction.pipeline import ReportExtractor
from app.services.time_agent import TimeAgentService

app = FastAPI(
    title="ProgressBridge AI Service",
    description="Intelligent Data Capture & Schedule-Linking Layer for Infrastructure Project Management",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

matcher = SemanticMatcher()
extractor = ReportExtractor()
time_agent = TimeAgentService(matcher)

class MatchRequest(BaseModel):
    actualDescription: str
    discipline: Optional[str] = None
    candidateActivities: Optional[List[Dict[str, Any]]] = []
    highThreshold: Optional[float] = 0.80
    mediumThreshold: Optional[float] = 0.60

class ExtractRequest(BaseModel):
    text: str

class TimeAgentRequest(BaseModel):
    message: str
    referenceDate: Optional[str] = None
    candidateActivities: Optional[List[Dict[str, Any]]] = []

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ProgressBridge AI Engine",
        "version": "1.0.0",
        "model": "TF-IDF N-Gram Vectorizer + Levenshtein Cosine Semantic Hybrid",
        "author": "SIH26122 Solution Team"
    }

@app.post("/api/ai/match")
def match_activity(req: MatchRequest):
    custom_matcher = SemanticMatcher(
        high_threshold=req.highThreshold or 0.80,
        medium_threshold=req.mediumThreshold or 0.60
    )
    result = custom_matcher.find_best_match(
        actual_description=req.actualDescription,
        discipline=req.discipline,
        candidate_activities=req.candidateActivities or []
    )
    return result

@app.post("/api/ai/extract")
def extract_text(req: ExtractRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    events = extractor.parse_full_document(req.text)
    return {
        "success": True,
        "count": len(events),
        "events": events
    }

@app.post("/api/ai/time-agent")
def supervisor_chat(req: TimeAgentRequest):
    result = time_agent.process_message(
        message=req.message,
        reference_date=req.referenceDate,
        candidate_activities=req.candidateActivities or []
    )
    return result

@app.post("/api/ai/parse-file")
async def parse_uploaded_file(file: UploadFile = File(...)):
    filename = file.filename.lower()
    content = await file.read()
    extracted_text = ""
    events = []
    metadata = {
        "filename": file.filename,
        "contentType": file.content_type,
        "sizeBytes": len(content)
    }

    try:
        if filename.endswith(".txt"):
            extracted_text = content.decode("utf-8", errors="ignore")
            events = extractor.parse_full_document(extracted_text)

        elif filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
            return process_tabular_dataframe(df, metadata)

        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(content))
            return process_tabular_dataframe(df, metadata)

        elif filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(content))
            pages_text = []
            for i, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                pages_text.append(txt)
            extracted_text = "\n\n".join(pages_text)
            if not extracted_text.strip():
                return {
                    "success": True,
                    "extractedText": "",
                    "events": [],
                    "metadata": metadata,
                    "warning": "Text could not be reliably extracted from scanned PDF. Please review manually or use high-resolution OCR."
                }
            events = extractor.parse_full_document(extracted_text)

        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Supported: .txt, .csv, .xlsx, .pdf")

        return {
            "success": True,
            "extractedText": extracted_text[:2000] if len(extracted_text) > 2000 else extracted_text,
            "events": events,
            "count": len(events),
            "metadata": metadata
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "events": [],
            "metadata": metadata
        }

def process_tabular_dataframe(df: pd.DataFrame, metadata: Dict[str, Any]) -> Dict[str, Any]:
    # Intelligent column mapping (Module 3 requirement)
    col_map = {}
    for col in df.columns:
        c_low = str(col).lower().strip()
        if any(k in c_low for k in ["activity", "work description", "task", "job description", "description"]):
            col_map["activity_description"] = col
        elif any(k in c_low for k in ["discipline", "trade", "dept"]):
            col_map["discipline"] = col
        elif any(k in c_low for k in ["actual start", "start date", "start time", "start"]):
            col_map["actual_start"] = col
        elif any(k in c_low for k in ["actual end", "end date", "completion date", "finish date", "end time", "end"]):
            col_map["actual_end"] = col
        elif any(k in c_low for k in ["supervisor", "incharge", "reported by"]):
            col_map["supervisor"] = col
        elif any(k in c_low for k in ["status", "state"]):
            col_map["status"] = col
        elif any(k in c_low for k in ["activity id", "code", "tag"]):
            col_map["activity_id"] = col

    events = []
    for _, row in df.iterrows():
        act = str(row.get(col_map.get("activity_description", ""), "")).strip()
        if not act or act.lower() == "nan":
            continue
        events.append({
            "activity_description": act,
            "discipline": str(row.get(col_map.get("discipline", ""), "General")).strip() if col_map.get("discipline") else "General",
            "actual_start": str(row.get(col_map.get("actual_start", ""), "")).strip() if col_map.get("actual_start") else None,
            "actual_end": str(row.get(col_map.get("actual_end", ""), "")).strip() if col_map.get("actual_end") else None,
            "supervisor": str(row.get(col_map.get("supervisor", ""), "Site Supervisor")).strip() if col_map.get("supervisor") else "Site Supervisor",
            "status": str(row.get(col_map.get("status", ""), "Completed")).strip() if col_map.get("status") else "Completed",
            "matched_columns": col_map
        })

    return {
        "success": True,
        "count": len(events),
        "columnMapping": col_map,
        "rawColumns": list(df.columns),
        "events": events,
        "metadata": metadata
    }
