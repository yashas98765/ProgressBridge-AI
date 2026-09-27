import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// Built-in fallback matching engine in pure JS
export class FallbackMatcher {
  static normalize(text) {
    if (!text) return '';
    return text.toLowerCase()
      .replace(/[^\w\s\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static tokenize(text) {
    return this.normalize(text).split(' ').filter(w => w.length > 2);
  }

  static computeScores(actualText, candidateName, actualDiscipline, candidateDiscipline) {
    const normActual = this.normalize(actualText);
    const normCand = this.normalize(candidateName);

    const tokensActual = this.tokenize(actualText);
    const tokensCand = this.tokenize(candidateName);

    // Keyword overlap
    const intersection = tokensActual.filter(t => tokensCand.includes(t));
    const keywordScore = tokensCand.length > 0 ? intersection.length / tokensCand.length : 0;

    // Fuzzy/partial identifier check (e.g. "Line 24" vs "Line 24-XX")
    const actualNums = actualText.match(/\b\d{2,4}\b/g) || [];
    const candNums = candidateName.match(/\b\d{2,4}\b/g) || [];
    const numMatch = actualNums.some(n => candNums.includes(n));

    // Semantic rough approximation
    let semanticScore = keywordScore * 0.9;
    if (numMatch) semanticScore = Math.min(1.0, semanticScore + 0.35);

    // Engineering verbs check
    const engVerbs = ['erect', 'install', 'pour', 'weld', 'test', 'hydrotest', 'trench', 'pull', 'calibrate', 'gland'];
    const matchedVerbs = engVerbs.filter(v => normActual.includes(v) && normCand.includes(v));
    if (matchedVerbs.length > 0) semanticScore = Math.min(1.0, semanticScore + 0.25);

    // Discipline match
    let disciplineScore = 0.5;
    if (actualDiscipline && candidateDiscipline) {
      if (actualDiscipline.toLowerCase().trim() === candidateDiscipline.toLowerCase().trim()) {
        disciplineScore = 1.0;
      } else {
        disciplineScore = 0.1;
      }
    }

    let finalConfidence = (semanticScore * 0.45) + (keywordScore * 0.30) + (disciplineScore * 0.25);
    if (numMatch && disciplineScore === 1.0) {
      finalConfidence = Math.min(1.0, finalConfidence + 0.15);
    }

    finalConfidence = Math.round(Math.min(1.0, Math.max(0.0, finalConfidence)) * 100) / 100;

    let reason = 'Semantic & keyword similarity match';
    if (disciplineScore === 1.0 && numMatch) {
      reason = 'Strong semantic similarity, matching discipline, and exact equipment/line tag match.';
    } else if (disciplineScore === 1.0) {
      reason = 'Matching discipline and related activity description.';
    } else if (disciplineScore < 0.3) {
      reason = 'Discipline mismatch detected.';
    }

    return {
      semanticScore: Math.round(semanticScore * 100) / 100,
      keywordScore: Math.round(keywordScore * 100) / 100,
      disciplineScore: Math.round(disciplineScore * 100) / 100,
      finalConfidence,
      reason
    };
  }

  static findBestMatch(actualDescription, discipline, candidateActivities, highThreshold = 0.80, mediumThreshold = 0.60) {
    if (!candidateActivities || candidateActivities.length === 0) {
      return {
        suggestedActivityId: null,
        activityName: null,
        finalConfidence: 0,
        status: 'LOW_CONFIDENCE',
        reason: 'No schedule activities available.'
      };
    }

    const scored = candidateActivities.map(cand => {
      const candName = cand.activity_name || cand.name || '';
      const candDisc = cand.discipline;
      const scores = this.computeScores(actualDescription, candName, discipline, candDisc);
      return {
        activity_id: cand.activity_id || cand.id,
        activity_name: candName,
        discipline: candDisc,
        wbs_level: cand.wbs_level || 'L6',
        ...scores
      };
    });

    scored.sort((a, b) => b.finalConfidence - a.finalConfidence);
    const top = scored[0];

    let status = 'LOW_CONFIDENCE';
    if (top.finalConfidence >= highThreshold) status = 'HIGH_CONFIDENCE';
    else if (top.finalConfidence >= mediumThreshold) status = 'MEDIUM_CONFIDENCE';

    return {
      suggestedActivityId: top.activity_id,
      activityName: top.activity_name,
      discipline: top.discipline,
      wbsLevel: top.wbs_level,
      semanticScore: top.semanticScore,
      keywordScore: top.keywordScore,
      disciplineScore: top.disciplineScore,
      finalConfidence: top.finalConfidence,
      reason: top.reason,
      status,
      topCandidates: scored.slice(0, 5)
    };
  }
}

// Built-in fallback text extraction
export function fallbackExtractText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const DISCIPLINES = ['Piping', 'Civil', 'Electrical', 'Instrumentation', 'Mechanical', 'Static Equipment', 'Rotating Equipment', 'HSE'];

  let discipline = 'General';
  for (const d of DISCIPLINES) {
    if (new RegExp(`\\b${d}\\b`, 'i').test(text)) {
      discipline = d;
      break;
    }
  }

  // Supervisor
  let supervisor = 'Site Supervisor';
  const supMatch = text.match(/Supervisor\s*[:\-]\s*([^\n\r\.\,]+)/i);
  if (supMatch) supervisor = supMatch[1].trim();

  // Dates
  let actual_start = null;
  let actual_end = null;

  const startMatch = text.match(/(?:started|commenced|start)\s*(?:on|at|:)?\s*([0-9]{1,2}[\s\/\-][A-Za-z0-9]+[\s\/\-][0-9]{4})(?:\s*(?:at|@)\s*([0-9]{1,2}:[0-9]{2}(?:\s*[AP]M)?))?/i);
  if (startMatch) actual_start = startMatch[1] + (startMatch[2] ? ` ${startMatch[2]}` : '');

  const endMatch = text.match(/(?:completed|finished|concluded|ended)\s*(?:on|at|:)?\s*([0-9]{1,2}[\s\/\-][A-Za-z0-9]+[\s\/\-][0-9]{4})(?:\s*(?:at|@)\s*([0-9]{1,2}:[0-9]{2}(?:\s*[AP]M)?))?/i);
  if (endMatch) actual_end = endMatch[1] + (endMatch[2] ? ` ${endMatch[2]}` : '');

  // Activity description
  let activity_description = 'Site Activity';
  for (const line of lines) {
    if (/spool|cable|pour|weld|erect|foundation|excavation|hydrotest|terminat/i.test(line) && !/supervisor|activity started|activity completed/i.test(line)) {
      activity_description = line.replace(/\s+(completed|started|in progress)\.?$/i, '').trim();
      break;
    }
  }

  return [{
    discipline,
    activity_description,
    actual_start,
    actual_end,
    supervisor,
    status: actual_end ? 'Completed' : 'In Progress',
    raw_text: text
  }];
}

export const AIServiceBridge = {
  async matchActivity(actualDescription, discipline, candidateActivities, thresholds = {}) {
    try {
      const res = await axios.post(`${AI_SERVICE_URL}/api/ai/match`, {
        actualDescription,
        discipline,
        candidateActivities,
        highThreshold: thresholds.high || 0.80,
        mediumThreshold: thresholds.medium || 0.60
      }, { timeout: 3500 });
      return res.data;
    } catch (err) {
      console.warn('AI Service unavailable, using internal matching engine fallback.');
      return FallbackMatcher.findBestMatch(actualDescription, discipline, candidateActivities, thresholds.high, thresholds.medium);
    }
  },

  async extractText(text) {
    try {
      const res = await axios.post(`${AI_SERVICE_URL}/api/ai/extract`, { text }, { timeout: 3500 });
      return res.data.events;
    } catch (err) {
      console.warn('AI Service unavailable, using internal text extractor fallback.');
      return fallbackExtractText(text);
    }
  },

  async timeAgentChat(message, referenceDate, candidateActivities) {
    try {
      const res = await axios.post(`${AI_SERVICE_URL}/api/ai/time-agent`, {
        message,
        referenceDate,
        candidateActivities
      }, { timeout: 3500 });
      return res.data;
    } catch (err) {
      console.warn('AI Service unavailable, using internal Time Agent fallback.');
      const extracted = fallbackExtractText(message)[0];
      const match = FallbackMatcher.findBestMatch(extracted.activity_description, extracted.discipline, candidateActivities);
      return {
        intent: 'activity_logged',
        requiresClarification: false,
        extracted: {
          activity: extracted.activity_description,
          line: (message.match(/Line\s*(\d+)/i) || [])[1] || 'Not specified',
          discipline: extracted.discipline,
          actionType: extracted.actual_end ? 'END' : 'START',
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          displayDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          rawMessage: message
        },
        suggestion: match
      };
    }
  },

  async checkHealth() {
    try {
      const res = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 2500 });
      return res.status === 200;
    } catch (e) {
      return false;
    }
  }
};
