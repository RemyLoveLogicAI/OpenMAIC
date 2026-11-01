import { describe, expect, it } from 'vitest';
import {
  deriveDrillProfile,
  type DrillEncounterResult,
  type DrillProfile,
} from '@/lib/drill/drill-bridge';
import {
  generateAfterActionReport,
  formatAfterActionReportMarkdown,
  formatAfterActionReportHtml,
} from '@/lib/pbl/v2/operations/runtime/after-action-report';
import type { PBLProjectV2 } from '@/lib/pbl/v2/types';

function makeMockProject(overrides?: Partial<PBLProjectV2>): PBLProjectV2 {
  return {
    uiPhase: 'completed',
    title: 'Operation Canary Shield',
    description: 'Counter-intelligence canary trap operation',
    proficiency: 'advanced',
    language: 'en',
    tags: ['counter-intelligence', 'canary-trap'],
    status: 'completed',
    roles: [],
    milestones: [
      {
        id: 'ms_prep',
        title: 'Phase I: Operation Planning & Watermark Formulation',
        status: 'completed',
        order: 0,
        documents: [],
        microtasks: [
          {
            id: 'mt_watermarks',
            title: 'Formulate 4 unique canary variations',
            status: 'completed',
            assignee: 'user',
            hints: [],
            order: 0,
          },
        ],
      },
      {
        id: 'ms_memo',
        title: 'Phase IV: Forensic Attribution & Handler Briefing',
        status: 'completed',
        order: 1,
        documents: [],
        microtasks: [
          {
            id: 'mt_memo',
            title: 'Draft Defensible Attribution Memo',
            status: 'completed',
            assignee: 'user',
            hints: [],
            order: 0,
          },
        ],
      },
    ],
    submissions: [
      {
        id: 'sub_memo',
        microtaskId: 'mt_memo',
        kind: 'text',
        content:
          'ATTRIBUTION MEMO\nTarget Identified: VP Marcus Vance.\nEvidence: Competitor leaked Canary Version Delta ("Q3 Project Chimera Spec v2.1") which was exclusively distributed to Marcus Vance on channel Omega.\nForensic Confidence: 99.4%.',
        createdAt: '2026-10-03T14:30:00.000Z',
      },
    ],
    evaluations: [
      {
        id: 'eval_final',
        kind: 'final',
        feedback:
          'Outstanding counter-intelligence tradecraft demonstrated throughout Operation Canary Shield.',
        strengths: ['Rigorous compartmentalization', 'Flawless leak attribution'],
        improvements: ['Accelerate dissemination log auditing'],
        whatYouBuilt: ['Canary distribution matrix', 'Attribution briefing'],
        whatYouLearned: ['Information watermarking', 'Forensic leak analysis'],
        stars: 5,
        createdAt: '2026-10-03T14:35:00.000Z',
      },
    ],
    engagementEvents: [],
    threads: [],
    createdAt: '2026-10-03T14:00:00.000Z',
    updatedAt: '2026-10-03T14:35:00.000Z',
    ...overrides,
  };
}

describe('Drill Bridge (deriveDrillProfile)', () => {
  it('correctly calculates total score, rating, and posture for high performers', () => {
    const encounters: DrillEncounterResult[] = [
      {
        id: 'e1',
        name: 'The Pretext Coffee',
        role: 'Colleague',
        context: 'Breakroom',
        tactic: 'Flattery & False Collegiality',
        verdict: 'optimal',
        points: 100,
        trapEvaded: true,
        trapSprung: false,
        optionKey: 'A',
        optionLabel: 'Acknowledge the compliment neutrally and redirect to the public agenda.',
        debrief: 'Flawlessly maintained information hygiene.',
      },
      {
        id: 'e2',
        name: 'The Provocation Gambit',
        role: 'Consultant',
        context: 'Hallway',
        tactic: 'Deliberate Misstatement',
        verdict: 'optimal',
        points: 100,
        trapEvaded: true,
        trapSprung: false,
        optionKey: 'B',
        optionLabel: 'Correct the technical inaccuracy with sanitized unclassified details.',
        debrief: 'Resisted the urge to over-explain.',
      },
      {
        id: 'e3',
        name: 'The Urgent Corridor Walk',
        role: 'Director',
        context: 'Elevator',
        tactic: 'Artificial Urgency & Time Pressure',
        verdict: 'optimal',
        points: 100,
        trapEvaded: true,
        trapSprung: false,
        optionKey: 'C',
        optionLabel: 'Politely refuse emergency sign-off without proper ticket verification.',
        debrief: 'Enforced formal procedure under pressure.',
      },
    ];

    const profile = deriveDrillProfile(300, encounters, 'TJ0q3IsuaR');
    expect(profile.score).toBe(300);
    expect(profile.maxScore).toBe(300);
    expect(profile.percentage).toBe(100);
    expect(profile.rating).toBe('HARDENED OPERATOR');
    expect(profile.startingPosture).toContain('Vigilant');
    expect(profile.trapsEvaded).toBe(3);
    expect(profile.trapsSprung).toBe(0);
    expect(profile.handlerBriefingNote).toContain('Exceptional discipline');
  });

  it('correctly identifies compromised posture when traps are sprung', () => {
    const encounters: DrillEncounterResult[] = [
      {
        id: 'e1',
        name: 'The Pretext Coffee',
        role: 'Colleague',
        context: 'Breakroom',
        tactic: 'Flattery & False Collegiality',
        verdict: 'compromised',
        points: 0,
        trapEvaded: false,
        trapSprung: true,
        optionKey: 'C',
        optionLabel: 'Brag about the team breakthrough to impress the colleague.',
        debrief: 'Fell directly into ego trap.',
      },
      {
        id: 'e2',
        name: 'The Provocation Gambit',
        role: 'Consultant',
        context: 'Hallway',
        tactic: 'Deliberate Misstatement',
        verdict: 'compromised',
        points: 0,
        trapEvaded: false,
        trapSprung: true,
        optionKey: 'A',
        optionLabel: 'Vehemently correct them with confidential architecture details.',
        debrief: 'Blurted internal secret under provocation.',
      },
    ];

    const profile = deriveDrillProfile(50, encounters, 'TJ0q3IsuaR');
    expect(profile.score).toBe(50);
    expect(profile.rating).toBe('COMPROMISED — RETRAIN');
    expect(profile.startingPosture).toContain('Remedial');
    expect(profile.trapsSprung).toBe(2);
    expect(profile.trapsEvaded).toBe(0);
    expect(profile.handlerBriefingNote).toContain('CRITICAL ALERT');
  });
});

describe('After-Action Report Generator (generateAfterActionReport)', () => {
  it('synthesizes report data with bridged drill profile and attribution memo', () => {
    const drillProfile: DrillProfile = {
      stageId: 'TJ0q3IsuaR',
      sceneId: 'scene_conversation_lab_10',
      score: 280,
      maxScore: 300,
      percentage: 93,
      rating: 'HARDENED OPERATOR',
      ratingColor: '#2fbf71',
      ratingLine: 'Three for three.',
      trapsSprung: 0,
      trapsEvaded: 3,
      trapsNeutral: 0,
      startingPosture: 'Vigilant / Zero-Disclosure Posture',
      handlerBriefingNote: 'Cleared for high-risk operations.',
      completedAt: '2026-10-03T14:15:00.000Z',
      results: [
        {
          id: 'e1',
          name: 'The Pretext Coffee',
          role: 'Colleague',
          context: 'Breakroom',
          tactic: 'Flattery & False Collegiality',
          verdict: 'optimal',
          points: 100,
          trapEvaded: true,
          trapSprung: false,
          optionKey: 'A',
          optionLabel: 'Redirected neutrally',
          debrief: 'Clean execution',
        },
      ],
    };

    const project = makeMockProject({ drillProfile });
    const report = generateAfterActionReport(project, drillProfile);

    expect(report.classroomId).toBe('TJ0q3IsuaR');
    expect(report.drillProfile).toBeDefined();
    expect(report.drillProfile?.score).toBe(280);
    expect(report.drillProfile?.rating).toBe('HARDENED OPERATOR');
    expect(report.summaryStats.capstoneMicrotasksCompleted).toBe(2);
    expect(report.summaryStats.capstoneTotalMicrotasks).toBe(2);
    expect(report.capstone.attributionMemo?.content).toContain('Target Identified: VP Marcus Vance');
  });

  it('gracefully handles missing drill profile and missing memo', () => {
    const project = makeMockProject({ submissions: [] });
    const report = generateAfterActionReport(project, null);

    expect(report.drillProfile).toBeNull();
    expect(report.capstone.attributionMemo).toBeNull();
    expect(report.summaryStats.capstoneStars).toBe(5);
  });
});

describe('Report Formatting (Markdown & HTML)', () => {
  it('formats comprehensive Markdown with classification headers and all sections', () => {
    const drillProfile: DrillProfile = {
      stageId: 'TJ0q3IsuaR',
      sceneId: 'scene_conversation_lab_10',
      score: 300,
      maxScore: 300,
      percentage: 100,
      rating: 'HARDENED OPERATOR',
      ratingColor: '#2fbf71',
      ratingLine: 'Three for three.',
      trapsSprung: 0,
      trapsEvaded: 3,
      trapsNeutral: 0,
      startingPosture: 'Vigilant / Zero-Disclosure Posture',
      handlerBriefingNote: 'Deploy immediately.',
      completedAt: '2026-10-03T14:15:00.000Z',
      results: [
        {
          id: 'e1',
          name: 'The Pretext Coffee',
          role: 'Colleague',
          context: 'Breakroom',
          tactic: 'Flattery & False Collegiality',
          verdict: 'optimal',
          points: 100,
          trapEvaded: true,
          trapSprung: false,
          optionKey: 'A',
          optionLabel: 'Redirected cleanly',
          debrief: 'Neutral redirection maintained.',
        },
      ],
    };

    const project = makeMockProject({ drillProfile });
    const reportData = generateAfterActionReport(project, drillProfile);
    const md = formatAfterActionReportMarkdown(reportData);

    expect(md).toContain('# AFTER-ACTION REPORT (AAR)');
    expect(md).toContain('HARDENED OPERATOR');
    expect(md).toContain('300 / 300 (100%)');
    expect(md).toContain('The Pretext Coffee');
    expect(md).toContain('VP Marcus Vance');
    expect(md).toContain('CONFIDENTIAL // MERIDIAN RED CELL // EYES ONLY');
  });

  it('formats standalone printable HTML document with valid styling and scripts', () => {
    const project = makeMockProject();
    const reportData = generateAfterActionReport(project, null);
    const html = formatAfterActionReportHtml(reportData);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('@media print');
    expect(html).toContain('Operation Canary Shield');
    expect(html).toContain('AFTER-ACTION REPORT (AAR)');
  });

  it('escapes triple backticks inside attribution memo using quad-backtick fence', () => {
    const project = makeMockProject({
      submissions: [
        {
          id: 'sub_code_memo',
          microtaskId: 'mt_memo',
          kind: 'text',
          content: 'Payload leak sample:\n```json\n{"leakedWatermark": "Version-Delta-Marcus"}\n```',
          createdAt: '2026-10-03T14:30:00.000Z',
        },
      ],
    });
    const reportData = generateAfterActionReport(project, null);
    const md = formatAfterActionReportMarkdown(reportData);

    expect(md).toContain('````text');
    expect(md).toContain('{"leakedWatermark": "Version-Delta-Marcus"}');
    expect(md).toContain('````');
  });

  it('escapes closing script tags in HTML export to prevent syntax corruption', () => {
    const project = makeMockProject({
      submissions: [
        {
          id: 'sub_script_memo',
          microtaskId: 'mt_memo',
          kind: 'text',
          content: 'Attribution contains hostile script test: </script><script>alert(1)</script>',
          createdAt: '2026-10-03T14:30:00.000Z',
        },
      ],
    });
    const reportData = generateAfterActionReport(project, null);
    const html = formatAfterActionReportHtml(reportData);

    // Ensure raw </script> is escaped inside the embedded JSON blob
    expect(html).not.toContain('const mdData = "</script>');
    expect(html).toContain('<\\/script>');
  });
});

describe('Drill Bridge Memory Store Fallback', () => {
  it('bridges profiles in-memory even when localStorage is unavailable', async () => {
    const { saveDrillProfile, loadDrillProfile } = await import('@/lib/drill/drill-bridge');

    const testProfile = deriveDrillProfile(290, [], 'test-stage-mem', 'test-scene-mem');
    saveDrillProfile('test-stage-mem', 'test-scene-mem', testProfile);

    const loaded = loadDrillProfile('test-stage-mem', 'test-scene-mem');
    expect(loaded).toBeDefined();
    expect(loaded?.score).toBe(290);
    expect(loaded?.rating).toBe('HARDENED OPERATOR');
  });
});

describe('Instructor Scenario Awareness Integration', () => {
  it('injects operational dossier and calibration directives when drillProfile is present', async () => {
    const { buildScenarioAwarenessBlock } = await import('@/lib/pbl/v2/agents/instructor');

    const drillProfile: DrillProfile = {
      stageId: 'TJ0q3IsuaR',
      sceneId: 'scene_conversation_lab_10',
      score: 300,
      maxScore: 300,
      percentage: 100,
      rating: 'HARDENED OPERATOR',
      ratingColor: '#2fbf71',
      ratingLine: 'Three for three.',
      trapsSprung: 0,
      trapsEvaded: 3,
      trapsNeutral: 0,
      startingPosture: 'Vigilant / Zero-Disclosure Posture',
      handlerBriefingNote: 'Deploy immediately.',
      completedAt: '2026-10-03T14:15:00.000Z',
      results: [],
    };

    const project = makeMockProject({
      drillProfile,
      scenario: {
        setting: 'Meridian Dynamics HQ',
        goal: 'Detect and isolate mole',
        learnerRole: 'Security Officer',
        rules: 'Do not alert the suspects',
        characters: [
          {
            id: 'char_chen',
            name: 'Director Chen',
            persona: 'Analytical and sharp VP of Engineering',
            situation: 'Under pressure to ship',
          },
        ],
      },
      milestones: [
        {
          id: 'ms_rp',
          title: 'Act I',
          status: 'active',
          scenarioStage: 'roleplay',
          order: 0,
          documents: [],
          microtasks: [],
        },
      ],
    });

    const block = buildScenarioAwarenessBlock({
      project,
      milestone: project.milestones[0],
      phase: 'greeting',
    });

    expect(block).toContain('### Operational Dossier (Bridged from Conversation Lab Drill):');
    expect(block).toContain('300/300 (HARDENED OPERATOR)');
    expect(block).toContain('Vigilant / Zero-Disclosure Posture');
    expect(block).toContain('3 evaded, 0 sprung');
    expect(block).toContain('Deploy immediately.');
  });
});


