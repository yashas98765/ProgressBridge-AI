import re
from datetime import datetime
from typing import List, Dict, Any, Optional

DISCIPLINES = [
    "Piping", "Civil", "Electrical", "Instrumentation", 
    "Mechanical", "Static Equipment", "Rotating Equipment", 
    "HSE", "Commissioning", "Structural"
]

STATUS_KEYWORDS = {
    "Completed": ["completed", "finished", "done", "closed", "concluded"],
    "In Progress": ["in progress", "started", "ongoing", "underway", "wip", "commenced"],
    "Delayed": ["delayed", "stopped", "halted", "on hold", "suspended", "stuck"]
}

MONTH_MAP = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12',
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09',
    'oct': '10', 'nov': '11', 'dec': '12'
}

def parse_flexible_date(date_str: str, time_str: Optional[str] = None) -> Optional[str]:
    if not date_str:
        return None
    date_str = date_str.strip()
    
    # 25 September 2026 or 25-Sep-2026
    m1 = re.search(r'(\d{1,2})[\s\-/]+([A-Za-z]+)[\s\-/]+(\d{4})', date_str)
    if m1:
        day = m1.group(1).zfill(2)
        month_name = m1.group(2).lower()
        year = m1.group(3)
        month = MONTH_MAP.get(month_name, '01')
        res = f"{year}-{month}-{day}"
    else:
        # DD/MM/YYYY or DD-MM-YYYY
        m2 = re.search(r'(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})', date_str)
        if m2:
            res = f"{m2.group(3)}-{m2.group(2).zfill(2)}-{m2.group(1).zfill(2)}"
        else:
            # YYYY-MM-DD
            m3 = re.search(r'(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})', date_str)
            if m3:
                res = f"{m3.group(1)}-{m3.group(2).zfill(2)}-{m3.group(3).zfill(2)}"
            else:
                return None

    if time_str:
        time_clean = time_str.strip()
        # 09:30 or 9:30 AM or 16:45
        tm = re.search(r'(\d{1,2}):(\d{2})(?:\s*([AP]M))?', time_clean, re.IGNORECASE)
        if tm:
            hh = int(tm.group(1))
            mm = tm.group(2)
            ampm = tm.group(3)
            if ampm:
                if ampm.upper() == 'PM' and hh < 12:
                    hh += 12
                elif ampm.upper() == 'AM' and hh == 12:
                    hh = 0
            return f"{res} {str(hh).zfill(2)}:{mm}"

    return res

class ReportExtractor:
    def extract_discipline(self, text: str) -> Optional[str]:
        for disc in DISCIPLINES:
            if re.search(rf'\b{re.escape(disc)}\b', text, re.IGNORECASE):
                return disc
        return "General"

    def extract_supervisor(self, text: str) -> Optional[str]:
        m = re.search(r'Supervisor\s*[:\-]\s*([A-Za-z\s\.\,\-]+)', text, re.IGNORECASE)
        if m:
            clean = m.group(1).split('\n')[0].strip(' .;,')
            return clean
        return None

    def extract_status(self, text: str) -> str:
        text_lower = text.lower()
        for status, kws in STATUS_KEYWORDS.items():
            for kw in kws:
                if re.search(rf'\b{re.escape(kw)}\b', text_lower):
                    return status
        return "In Progress"

    def extract_dates_and_times(self, text: str) -> Dict[str, Optional[str]]:
        start_date = None
        end_date = None

        # Pattern: Activity started on 23 September 2026 at 09:30
        start_pattern = r'(?:started|commenced|began|start(?:\s*date)?)\s*(?:on|at|:)?\s*([0-9]{1,2}[\s\/\-][A-Za-z0-9]+[\s\/\-][0-9]{4})(?:\s*(?:at|@)\s*([0-9]{1,2}:[0-9]{2}(?:\s*[AP]M)?))?'
        m_start = re.search(start_pattern, text, re.IGNORECASE)
        if m_start:
            start_date = parse_flexible_date(m_start.group(1), m_start.group(2))

        # Pattern: Activity completed on 25 September 2026 at 16:45
        end_pattern = r'(?:completed|finished|concluded|ended|end(?:\s*date)?)\s*(?:on|at|:)?\s*([0-9]{1,2}[\s\/\-][A-Za-z0-9]+[\s\/\-][0-9]{4})(?:\s*(?:at|@)\s*([0-9]{1,2}:[0-9]{2}(?:\s*[AP]M)?))?'
        m_end = re.search(end_pattern, text, re.IGNORECASE)
        if m_end:
            end_date = parse_flexible_date(m_end.group(1), m_end.group(2))

        # Single date fallback if only one general date found
        if not start_date and not end_date:
            gen_match = re.search(r'(\d{1,2}[\s\/\-][A-Za-z0-9]+[\s\/\-]\d{4})', text)
            if gen_match:
                start_date = parse_flexible_date(gen_match.group(1))

        return {"actual_start": start_date, "actual_end": end_date}

    def extract_activity_description(self, text: str) -> str:
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Look for explicit activity lines: "Activity: ...", "Work done: ..."
        for line in lines:
            m = re.match(r'(?:Activity|Task|Work Description|Job|Subject)\s*[:\-]\s*(.*)', line, re.IGNORECASE)
            if m:
                return m.group(1).strip()

        # Look for descriptive sentence before "Activity started..." or after discipline
        candidates = []
        for line in lines:
            # Skip header lines like Date, Discipline, Supervisor, Started on, Completed on
            if re.match(r'^(?:\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})$', line):
                continue
            if any(re.match(rf'^{d}(\s+team|\s+department)?$', line, re.IGNORECASE) for d in DISCIPLINES):
                continue
            if re.search(r'^(?:Supervisor|Activity started|Activity completed|Started|Completed)\b', line, re.IGNORECASE):
                continue
            candidates.append(line)

        if candidates:
            # Return first substantial sentence
            clean = candidates[0].rstrip('.')
            # Remove trailing words like "completed", "in progress"
            clean = re.sub(r'\s+(?:completed|started|in progress|ongoing)$', '', clean, flags=re.IGNORECASE)
            return clean

        return "Unspecified Site Activity"

    def parse_report_block(self, block_text: str) -> Dict[str, Any]:
        disc = self.extract_discipline(block_text)
        act_desc = self.extract_activity_description(block_text)
        dates = self.extract_dates_and_times(block_text)
        sup = self.extract_supervisor(block_text)
        stat = self.extract_status(block_text)

        return {
            "discipline": disc,
            "activity_description": act_desc,
            "actual_start": dates["actual_start"],
            "actual_end": dates["actual_end"],
            "supervisor": sup or "Site Supervisor",
            "status": stat,
            "raw_text": block_text.strip()
        }

    def parse_full_document(self, text: str) -> List[Dict[str, Any]]:
        # Split document by double newlines or horizontal dividers if multi-activity report
        blocks = re.split(r'\n\s*\n|---+|===+', text)
        results = []
        for block in blocks:
            b = block.strip()
            if len(b) > 15: # Ignore trivial whitespace or short lines
                extracted = self.parse_report_block(b)
                results.append(extracted)
        if not results and text.strip():
            results.append(self.parse_report_block(text))
        return results
