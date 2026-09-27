import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.matching.engine import SemanticMatcher
from app.extraction.pipeline import ReportExtractor, DISCIPLINES, parse_flexible_date

class TimeAgentService:
    def __init__(self, matcher: SemanticMatcher):
        self.matcher = matcher
        self.extractor = ReportExtractor()

    def process_message(self, message: str, reference_date: Optional[str] = None, candidate_activities: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not reference_date:
            reference_date = datetime.now().strftime("%Y-%m-%d")

        ref_dt = datetime.strptime(reference_date[:10], "%Y-%m-%d")
        msg = message.strip()
        msg_lower = msg.lower()

        # Check for ambiguity: e.g. "started something" or missing activity
        if len(msg.split()) < 3:
            return {
                "intent": "clarification_needed",
                "message": "Could you please provide more details about the activity, line/unit number, and specific start or completion time?",
                "requiresClarification": True,
                "extracted": None,
                "suggestion": None
            }

        # 1. Detect Discipline
        discipline = self.extractor.extract_discipline(msg)
        if discipline == "General":
            # Infer from keywords
            if any(k in msg_lower for k in ["spool", "pipe", "flange", "hydrotest", "valve", "line"]):
                discipline = "Piping"
            elif any(k in msg_lower for k in ["cable", "tray", "conduit", "switchgear", "transformer", "panel"]):
                discipline = "Electrical"
            elif any(k in msg_lower for k in ["concrete", "pour", "foundation", "excavation", "rebar", "paving"]):
                discipline = "Civil"
            elif any(k in msg_lower for k in ["transmitter", "plc", "scada", "sensor", "calibration", "loop"]):
                discipline = "Instrumentation"
            elif any(k in msg_lower for k in ["pump", "compressor", "turbine", "motor", "alignment"]):
                discipline = "Rotating Equipment"
            elif any(k in msg_lower for k in ["vessel", "tank", "exchanger", "column"]):
                discipline = "Static Equipment"
            elif any(k in msg_lower for k in ["safety", "toolbox", "ppe", "permit", "fire"]):
                discipline = "HSE"

        # 2. Extract Equipment / Line identifier
        line_match = re.search(r'\b(?:line|unit|tag|area|skid)\s*[-_#]?\s*([A-Za-z0-9\-_]+)', msg, re.IGNORECASE)
        line_num = line_match.group(1) if line_match else None

        # 3. Detect Action Type: Start vs Finished / Completed
        is_start = any(k in msg_lower for k in ["started", "began", "commenced", "kicked off", "start"])
        is_end = any(k in msg_lower for k in ["finished", "completed", "done", "ended", "closed"])

        # 4. Resolve Relative Dates (today, yesterday, etc.)
        target_date = ref_dt
        if "yesterday" in msg_lower:
            target_date = ref_dt - timedelta(days=1)
        elif "day before yesterday" in msg_lower:
            target_date = ref_dt - timedelta(days=2)
        elif "today" in msg_lower:
            target_date = ref_dt
        else:
            # Look for specific date
            parsed_d = parse_flexible_date(msg)
            if parsed_d:
                try:
                    target_date = datetime.strptime(parsed_d[:10], "%Y-%m-%d")
                except Exception:
                    pass

        # Time extraction: e.g. 9:30 AM, 10 AM, 16:45
        time_m = re.search(r'\b(\d{1,2})(?::(\d{2}))?\s*([APap][Mm])\b|\b(\d{1,2}):(\d{2})\b', msg)
        time_str = None
        if time_m:
            if time_m.group(1): # e.g. 9:30 AM or 10 AM
                hh = int(time_m.group(1))
                mm = time_m.group(2) if time_m.group(2) else "00"
                ampm = time_m.group(3).upper()
                if ampm == 'PM' and hh < 12:
                    hh += 12
                elif ampm == 'AM' and hh == 12:
                    hh = 0
                time_str = f"{str(hh).zfill(2)}:{mm}"
            elif time_m.group(4): # 24hr format
                time_str = f"{time_m.group(4).zfill(2)}:{time_m.group(5)}"

        # If time is missing or date is ambiguous, prompt gently or provide safe default
        is_ambiguous = False
        clarification_msg = ""
        if not time_str and is_end and "yesterday" in msg_lower:
            is_ambiguous = True
            clarification_msg = f"Recorded completion on {target_date.strftime('%d %B %Y')}. Could you specify the exact completion time (e.g., 04:30 PM) and line number to record precise execution logs?"

        # Extract activity name
        # Remove timestamps, 'started', 'finished', 'today at 9:30 AM', etc.
        clean_act = msg
        clean_act = re.sub(r'\b(today|yesterday|tomorrow|at\s+\d+.*|\d{1,2}:\d{2}\s*(?:[APap][Mm])?)\b', '', clean_act, flags=re.IGNORECASE)
        clean_act = re.sub(r'\b(started|finished|completed|commenced|done|began)\b', '', clean_act, flags=re.IGNORECASE)
        clean_act = re.sub(r'\s+', ' ', clean_act).strip(' .,;:')
        if not clean_act:
            clean_act = "Execution Work"

        formatted_timestamp = f"{target_date.strftime('%Y-%m-%d')} {time_str}" if time_str else target_date.strftime('%Y-%m-%d')
        formatted_display = f"{target_date.strftime('%d %B %Y')}{', ' + time_str if time_str else ''}"

        # Match against candidate activities
        match_result = None
        if candidate_activities:
            match_result = self.matcher.find_best_match(
                actual_description=f"{clean_act} {'Line ' + line_num if line_num and line_num not in clean_act else ''}".strip(),
                discipline=discipline,
                candidate_activities=candidate_activities
            )

        return {
            "intent": "activity_logged",
            "requiresClarification": is_ambiguous,
            "clarificationPrompt": clarification_msg if is_ambiguous else None,
            "extracted": {
                "activity": clean_act,
                "line": line_num or "Not specified",
                "discipline": discipline,
                "actionType": "START" if is_start else ("END" if is_end else "PROGRESS"),
                "timestamp": formatted_timestamp,
                "displayDate": formatted_display,
                "rawMessage": msg
            },
            "suggestion": match_result
        }
