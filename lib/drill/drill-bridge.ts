export interface DrillEncounterResult {
  id: string;
  name: string;
  role: string;
  context: string;
  tactic: string;
  verdict: 'optimal' | 'acceptable' | 'compromised';
  points: number;
  trapSprung: boolean;
  trapEvaded: boolean;
  optionKey: string;
  optionLabel: string;
  debrief: string;
}

export type OperatorRating =
  | 'HARDENED OPERATOR'
  | 'OPERATIONAL — GAPS DETECTED'
  | 'COMPROMISED — RETRAIN';

export interface DrillProfile {
  stageId?: string;
  sceneId: string;
  score: number;
  maxScore: number;
  percentage: number;
  rating: OperatorRating;
  ratingColor: string;
  ratingLine: string;
  trapsSprung: number;
  trapsEvaded: number;
  trapsNeutral: number;
  startingPosture: string;
  handlerBriefingNote: string;
  results: DrillEncounterResult[];
  completedAt: string;
}

export const DRILL_PROFILE_KEY_PREFIX = 'maic:drill-profile:';
export const DRILL_PROFILE_EVENT = 'maic:drill-profile-updated';

export function getDrillProfileStorageKey(id: string): string {
  return `${DRILL_PROFILE_KEY_PREFIX}${id}`;
}

const memoryDrillStore = new Map<string, DrillProfile>();

export function saveDrillProfile(
  stageId: string | undefined,
  sceneId: string,
  profile: DrillProfile,
): void {
  if (stageId) memoryDrillStore.set(stageId, profile);
  if (sceneId) memoryDrillStore.set(sceneId, profile);
  memoryDrillStore.set('latest', profile);

  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(profile);
    if (stageId) {
      window.localStorage.setItem(getDrillProfileStorageKey(stageId), json);
    }
    if (sceneId) {
      window.localStorage.setItem(getDrillProfileStorageKey(sceneId), json);
    }
    window.localStorage.setItem(getDrillProfileStorageKey('latest'), json);
  } catch {
    // Ignore quota or disabled localStorage errors
  }
  try {
    window.dispatchEvent(new CustomEvent(DRILL_PROFILE_EVENT, { detail: profile }));
  } catch {
    // Ignore event dispatch errors in restricted environments
  }
}

export function loadDrillProfile(stageId?: string, sceneId?: string): DrillProfile | null {
  const idsToTry: string[] = [];
  if (stageId) idsToTry.push(stageId);
  if (sceneId) idsToTry.push(sceneId);
  idsToTry.push('latest');

  // Try in-memory store first
  for (const id of idsToTry) {
    const cached = memoryDrillStore.get(id);
    if (cached && isValidDrillProfile(cached)) {
      return cached;
    }
  }

  if (typeof window === 'undefined') return null;

  for (const id of idsToTry) {
    try {
      const raw = window.localStorage.getItem(getDrillProfileStorageKey(id));
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (isValidDrillProfile(parsed)) {
        memoryDrillStore.set(id, parsed);
        return parsed;
      }
    } catch {
      // Continue to next key
    }
  }
  return null;
}

export function isValidDrillProfile(val: unknown): val is DrillProfile {
  if (!val || typeof val !== 'object') return false;
  const p = val as Record<string, unknown>;
  return (
    typeof p.score === 'number' &&
    typeof p.maxScore === 'number' &&
    typeof p.rating === 'string' &&
    Array.isArray(p.results)
  );
}

export function deriveDrillProfile(
  score: number,
  results: DrillEncounterResult[],
  stageId = 'TJ0q3IsuaR',
  sceneId = 'scene_conversation_lab_10',
): DrillProfile {
  const maxScore = 300;
  const percentage = Math.round((score / maxScore) * 100);
  let rating: OperatorRating;
  let ratingColor: string;
  let ratingLine: string;
  let startingPosture: string;
  let handlerBriefingNote: string;

  const trapsSprung = results.filter((r) => r.verdict === 'compromised').length;
  const trapsEvaded = results.filter((r) => r.verdict === 'optimal').length;
  const trapsNeutral = results.filter((r) => r.verdict === 'acceptable').length;

  if (score >= 270) {
    rating = 'HARDENED OPERATOR';
    ratingColor = 'var(--green, #2fbf71)';
    ratingLine =
      'Three for three. Your reflexes are trained — you spot the lever, not just the line.';
    startingPosture = 'Vigilant / Zero-Disclosure Posture (Clearance: Red Cell Qualified)';
    handlerBriefingNote = `Handler assessment: Exceptional discipline in prior drill (${score}/300). Spot-on detection of elicitation levers with zero disclosures. You enter Operation Canary Shield cleared for independent tradecraft execution.`;
  } else if (score >= 120) {
    rating = 'OPERATIONAL — GAPS DETECTED';
    ratingColor = 'var(--amber, #f5a623)';
    ratingLine =
      'You survived, but at least one tactic got past you. Review the debriefs, then run it back.';
    startingPosture = 'Cautious / Monitored Posture (Clearance: Standard Operational)';
    handlerBriefingNote = `Handler assessment: Operational with detected vulnerabilities (${score}/300). ${trapsSprung} trap(s) sprung under conversational pressure. In Canary Shield, monitor Director Chen and Director Rivera closely — they will exploit conversational openings.`;
  } else {
    rating = 'COMPROMISED — RETRAIN';
    ratingColor = 'var(--red, #d14424)';
    ratingLine =
      'In a live environment, at least one of those answers would have cost real secrets. Replay the course scenes, then drill again.';
    startingPosture = 'Remedial / Supervised Posture (Clearance: High-Risk Watchlist)';
    handlerBriefingNote = `Handler assessment: CRITICAL ALERT: Severe elicitation vulnerabilities exposed in prior drill (${score}/300). Fallen for ego provocation and mentorship traps. In Canary Shield, you operate under mandatory supervisory review. Adhere strictly to the canary watermarking protocol.`;
  }

  return {
    stageId,
    sceneId,
    score,
    maxScore,
    percentage,
    rating,
    ratingColor,
    ratingLine,
    trapsSprung,
    trapsEvaded,
    trapsNeutral,
    startingPosture,
    handlerBriefingNote,
    results,
    completedAt: new Date().toISOString(),
  };
}
