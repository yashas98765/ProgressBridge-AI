import re
import math
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SemanticMatcher:
    def __init__(self, high_threshold: float = 0.80, medium_threshold: float = 0.60):
        self.high_threshold = high_threshold
        self.medium_threshold = medium_threshold
        
        # Engineering verb and noun normalization map
        self.term_synonyms = {
            'erected': 'erect',
            'erecting': 'erect',
            'erection': 'erect',
            'installed': 'install',
            'installing': 'install',
            'installation': 'install',
            'poured': 'pour',
            'pouring': 'pour',
            'concreting': 'concrete',
            'laid': 'lay',
            'laying': 'lay',
            'pulled': 'pull',
            'pulling': 'pull',
            'tested': 'test',
            'testing': 'test',
            'hydrotested': 'hydrotest',
            'hydrotesting': 'hydrotest',
            'welded': 'weld',
            'welding': 'weld',
            'fitup': 'fit-up',
            'fit up': 'fit-up',
            'fabrication': 'fabricate',
            'fabricated': 'fabricate',
            'trenching': 'excavation',
            'excavated': 'excavation',
            'cable tray': 'cable-tray',
            'termination': 'terminate',
            'terminated': 'terminate',
            'commissioning': 'commission',
            'pre-commissioning': 'commission'
        }

    def normalize_text(self, text: str) -> str:
        if not text:
            return ""
        text = text.lower().strip()
        # Replace punctuation except hyphen
        text = re.sub(r'[^\w\s\-]', ' ', text)
        for term, norm in self.term_synonyms.items():
            text = re.sub(rf'\b{re.escape(term)}\b', norm, text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def extract_identifiers(self, text: str) -> List[str]:
        """Extract equipment tags, line numbers, unit numbers, e.g. Line 24, 24-XX, P-101, E-202"""
        patterns = [
            r'line\s*[-_]?\s*(\d+[a-zA-Z\-_]*)',
            r'\b(\d{2,4}[a-zA-Z\-_]+)\b',
            r'\b([a-zA-Z]{1,3}[-_]?\d{2,4})\b',
            r'\b(\d{2,4})\b'
        ]
        found = []
        for pat in patterns:
            matches = re.findall(pat, text, re.IGNORECASE)
            for m in matches:
                if len(m) >= 2:
                    found.append(m.lower().replace('-', '').replace('_', ''))
        return list(set(found))

    def fuzzy_ratio(self, s1: str, s2: str) -> float:
        """Lightweight Levenshtein / token similarity without heavy binary dependencies"""
        tokens1 = set(s1.split())
        tokens2 = set(s2.split())
        if not tokens1 or not tokens2:
            return 0.0
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        jaccard = len(intersection) / len(union)
        return jaccard

    def compute_scores(self, actual_text: str, candidate_name: str, actual_discipline: Optional[str], candidate_discipline: Optional[str]) -> Dict[str, Any]:
        norm_actual = self.normalize_text(actual_text)
        norm_cand = self.normalize_text(candidate_name)

        if not norm_actual or not norm_cand:
            return {
                "semanticScore": 0.0,
                "keywordScore": 0.0,
                "disciplineScore": 0.0,
                "finalConfidence": 0.0,
                "reasons": ["Empty description"]
            }

        reasons = []

        # 1. TF-IDF Cosine Similarity (Word + Char n-grams)
        try:
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), analyzer='word')
            tfidf = vectorizer.fit_transform([norm_actual, norm_cand])
            semantic_score = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
        except Exception:
            semantic_score = 0.0

        # Character level n-gram similarity for partial match (e.g. Line 24 vs Line 24-XX)
        try:
            char_vectorizer = TfidfVectorizer(ngram_range=(3, 5), analyzer='char_wb')
            char_tfidf = char_vectorizer.fit_transform([norm_actual, norm_cand])
            char_score = float(cosine_similarity(char_tfidf[0:1], char_tfidf[1:2])[0][0])
            # Blend word & character semantic scores
            semantic_score = max(semantic_score, (semantic_score * 0.4 + char_score * 0.6))
        except Exception:
            pass

        # 2. Keyword & Token Overlap
        tokens_actual = set(norm_actual.split())
        tokens_cand = set(norm_cand.split())
        common_tokens = tokens_actual.intersection(tokens_cand)
        keyword_score = len(common_tokens) / max(len(tokens_cand), 1)
        keyword_score = min(keyword_score * 1.2, 1.0)

        # 3. Identifier / Tag Matching (e.g. Line 24, 24-XX)
        actual_ids = self.extract_identifiers(actual_text)
        cand_ids = self.extract_identifiers(candidate_name)
        id_match = False
        if actual_ids and cand_ids:
            for aid in actual_ids:
                for cid in cand_ids:
                    if aid in cid or cid in aid:
                        id_match = True
                        break

        # 4. Discipline Score
        discipline_score = 0.5 # neutral if unknown
        if actual_discipline and candidate_discipline:
            if actual_discipline.strip().lower() == candidate_discipline.strip().lower():
                discipline_score = 1.0
                reasons.append(f"Matching discipline: {actual_discipline}")
            else:
                discipline_score = 0.1
                reasons.append(f"Discipline mismatch ({actual_discipline} vs {candidate_discipline})")
        else:
            reasons.append("Discipline unstated or neutral")

        # 5. Fuzzy ratio
        fuzzy_score = self.fuzzy_ratio(norm_actual, norm_cand)

        # Weighted calculation
        final_confidence = (
            (semantic_score * 0.45) +
            (keyword_score * 0.30) +
            (fuzzy_score * 0.10) +
            (discipline_score * 0.15)
        )

        if id_match:
            final_confidence = min(1.0, final_confidence + 0.15)
            reasons.append("Exact equipment / tag identifier match")

        if semantic_score >= 0.70:
            reasons.append("High semantic text similarity")
        elif semantic_score >= 0.50:
            reasons.append("Moderate semantic phrasing overlap")

        if keyword_score >= 0.60:
            reasons.append(f"Key activity verbs/nouns match ({', '.join(list(common_tokens)[:3])})")

        final_confidence = round(max(0.0, min(1.0, final_confidence)), 2)

        return {
            "semanticScore": round(semantic_score, 2),
            "keywordScore": round(keyword_score, 2),
            "disciplineScore": round(discipline_score, 2),
            "finalConfidence": final_confidence,
            "reasons": reasons
        }

    def find_best_match(self, actual_description: str, discipline: Optional[str], candidate_activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not candidate_activities:
            return {
                "suggestedActivityId": None,
                "activityName": None,
                "semanticScore": 0.0,
                "keywordScore": 0.0,
                "disciplineScore": 0.0,
                "finalConfidence": 0.0,
                "reason": "No schedule activities available to match against.",
                "status": "LOW_CONFIDENCE",
                "rankedMatches": []
            }

        scored_candidates = []
        for cand in candidate_activities:
            cand_name = cand.get("activity_name") or cand.get("name") or cand.get("description", "")
            cand_disc = cand.get("discipline") or cand.get("Discipline")
            scores = self.compute_scores(actual_description, cand_name, discipline, cand_disc)

            scored_candidates.append({
                "activity_id": cand.get("activity_id") or cand.get("_id") or cand.get("id"),
                "activity_name": cand_name,
                "discipline": cand_disc,
                "wbs_level": cand.get("wbs_level", "L6"),
                "activity_code": cand.get("activity_code", ""),
                "planned_start": cand.get("planned_start"),
                "planned_end": cand.get("planned_end"),
                **scores
            })

        # Sort by final confidence descending
        scored_candidates.sort(key=lambda x: x["finalConfidence"], reverse=True)
        top = scored_candidates[0]

        conf = top["finalConfidence"]
        if conf >= self.high_threshold:
            status = "HIGH_CONFIDENCE"
            match_type = "Auto-suggest match (High Confidence)"
        elif conf >= self.medium_threshold:
            status = "MEDIUM_CONFIDENCE"
            match_type = "Planner review required (Medium Confidence)"
        else:
            status = "LOW_CONFIDENCE"
            match_type = "Unmatched / Manual review required (Low Confidence)"

        top_reasons_str = "; ".join(top["reasons"]) if top["reasons"] else "General similarity"
        full_reason = f"{match_type}: {top_reasons_str}."

        return {
            "suggestedActivityId": top["activity_id"],
            "activityName": top["activity_name"],
            "activityCode": top["activity_code"],
            "discipline": top["discipline"],
            "wbsLevel": top["wbs_level"],
            "semanticScore": top["semanticScore"],
            "keywordScore": top["keywordScore"],
            "disciplineScore": top["disciplineScore"],
            "finalConfidence": top["finalConfidence"],
            "reason": full_reason,
            "status": status,
            "topCandidates": scored_candidates[:5]
        }
