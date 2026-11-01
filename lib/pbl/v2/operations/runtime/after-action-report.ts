/**
 * PBL v2 — After-Action Report (AAR) Generator
 *
 * Generates an exportable/downloadable comprehensive report bridging
 * the Conversation Lab drill (Scene 10) and Operation Canary Shield (Scene 11).
 *
 * Provides:
 *   - Structured data extraction from PBLProjectV2 and DrillProfile
 *   - Clean Markdown export format (.md)
 *   - High-fidelity, self-contained HTML/PDF printable export (.html)
 *   - Browser file download utility
 */

import type { PBLProjectV2 } from '../../types';
import type { DrillProfile } from '@/lib/drill/drill-bridge';
import { computeCompletionStats } from './completion-stats';

export interface AfterActionReportData {
  generatedAt: string;
  courseTitle: string;
  classroomId: string;
  classification: string;
  operatorRole: string;
  drillProfile: DrillProfile | null;
  capstone: {
    projectTitle: string;
    description: string;
    learningObjective?: string;
    proficiency?: string;
    status: string;
    uiPhase: string;
    setting?: string;
    goal?: string;
    rules?: string;
    milestones: Array<{
      id: string;
      title: string;
      status: string;
      briefing?: string;
      microtasks: Array<{
        id: string;
        title: string;
        status: string;
        completionCriteria?: string;
      }>;
    }>;
    attributionMemo?: {
      content: string;
      submittedAt: string;
    } | null;
    allSubmissions: Array<{
      id: string;
      microtaskId: string;
      content: string;
      createdAt: string;
    }>;
    evaluations: Array<{
      id: string;
      kind: string;
      feedback?: string;
      score?: number;
      stars?: number;
      whatYouBuilt?: string[];
      whatYouLearned?: string[];
      whatsNext?: string;
    }>;
    actGoals?: Array<{
      actTitle: string;
      goals: Array<{
        goal: string;
        status: 'achieved' | 'partial' | 'missed';
        skillFocus?: string;
        note?: string;
      }>;
    }>;
  };
  summaryStats: {
    drillScore: number;
    drillMaxScore: number;
    drillPercentage: number;
    trapsEvaded: number;
    trapsSprung: number;
    trapsNeutral: number;
    operatorRating: string;
    startingPosture: string;
    capstoneMilestonesCompleted: number;
    capstoneTotalMilestones: number;
    capstoneMicrotasksCompleted: number;
    capstoneTotalMicrotasks: number;
    capstoneSubmissionsCount: number;
    capstoneStars?: number;
  };
}

export function generateAfterActionReport(
  project: PBLProjectV2,
  drillProfile: DrillProfile | null,
  classroomId = 'TJ0q3IsuaR',
  courseTitle = 'Covert Influence & Defense',
): AfterActionReportData {
  const stats = computeCompletionStats(project);

  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter((m) => m.status === 'completed').length;
  const totalMicrotasks = project.milestones.reduce((acc, m) => acc + m.microtasks.length, 0);
  const completedMicrotasks = project.milestones.reduce(
    (acc, m) => acc + m.microtasks.filter((t) => t.status === 'completed').length,
    0,
  );

  const memoSubmission = project.submissions
    .slice()
    .reverse()
    .find(
      (s) =>
        s.microtaskId === 'mt_memo' ||
        s.microtaskId.includes('memo') ||
        s.content.toLowerCase().includes('memo') ||
        s.content.toLowerCase().includes('attribution'),
    );

  const finalEval = project.evaluations.find((e) => e.kind === 'final');

  const actGoals =
    stats.kind === 'scenario' && stats.goalCoverage
      ? stats.goalCoverage.acts.map((act) => ({
          actTitle: act.actTitle,
          goals: act.goals.map((g) => ({
            goal: g.goal,
            status: g.status,
            skillFocus: g.skillFocus,
            note: g.note,
          })),
        }))
      : undefined;

  const drillScore = drillProfile?.score ?? 0;
  const drillMaxScore = drillProfile?.maxScore ?? 300;
  const drillPercentage = drillProfile ? drillProfile.percentage : 0;
  const trapsEvaded = drillProfile?.trapsEvaded ?? 0;
  const trapsSprung = drillProfile?.trapsSprung ?? 0;
  const trapsNeutral = drillProfile?.trapsNeutral ?? 0;
  const operatorRating = drillProfile?.rating ?? 'PENDING EVALUATION';
  const startingPosture = drillProfile?.startingPosture ?? 'Standard Operational Posture';

  return {
    generatedAt: new Date().toISOString(),
    courseTitle,
    classroomId,
    classification: 'CONFIDENTIAL // MERIDIAN RED CELL // EYES ONLY',
    operatorRole: project.scenario?.learnerRole || 'Security Officer, Meridian Dynamics',
    drillProfile,
    capstone: {
      projectTitle: project.title,
      description: project.description,
      learningObjective: project.learningObjective,
      proficiency: project.proficiency,
      status: project.status,
      uiPhase: project.uiPhase,
      setting: project.scenario?.setting,
      goal: project.scenario?.goal,
      rules: project.scenario?.rules,
      milestones: project.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        briefing: m.briefing,
        microtasks: m.microtasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          completionCriteria: t.completionCriteria,
        })),
      })),
      attributionMemo: memoSubmission
        ? {
            content: memoSubmission.content,
            submittedAt: memoSubmission.createdAt,
          }
        : null,
      allSubmissions: project.submissions.map((s) => ({
        id: s.id,
        microtaskId: s.microtaskId,
        content: s.content,
        createdAt: s.createdAt,
      })),
      evaluations: project.evaluations.map((e) => ({
        id: e.id,
        kind: e.kind,
        feedback: e.feedback,
        score: e.score,
        stars: e.stars,
        whatYouBuilt: e.whatYouBuilt,
        whatYouLearned: e.whatYouLearned,
        whatsNext: e.whatsNext,
      })),
      actGoals,
    },
    summaryStats: {
      drillScore,
      drillMaxScore,
      drillPercentage,
      trapsEvaded,
      trapsSprung,
      trapsNeutral,
      operatorRating,
      startingPosture,
      capstoneMilestonesCompleted: completedMilestones,
      capstoneTotalMilestones: totalMilestones,
      capstoneMicrotasksCompleted: completedMicrotasks,
      capstoneTotalMicrotasks: totalMicrotasks,
      capstoneSubmissionsCount: project.submissions.length,
      capstoneStars: finalEval?.stars,
    },
  };
}

export function formatAfterActionReportMarkdown(data: AfterActionReportData): string {
  const dp = data.drillProfile;
  const lines: string[] = [];

  lines.push(`# ${data.classification}`);
  lines.push('');
  lines.push('# AFTER-ACTION REPORT (AAR): OPERATIONAL SYNTHESIS');
  lines.push(`**Course:** ${data.courseTitle} | **Classroom ID:** \`${data.classroomId}\``);
  lines.push(`**Date of Record:** ${new Date(data.generatedAt).toUTCString()}`);
  lines.push(`**Operator Role:** ${data.operatorRole}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## EXECUTIVE SUMMARY');
  lines.push('');
  lines.push(
    `This After-Action Report (AAR) documents the comprehensive operational performance of the security officer across both **The Conversation Lab** (Scene 10 live-fire elicitation drill) and **Operation Canary Shield** (Scene 11 PBL capstone canary-trap operation).`,
  );
  lines.push('');
  lines.push('| Metric | Value | Reference Standard |');
  lines.push('| :--- | :--- | :--- |');
  lines.push(
    `| **Conversation Lab Tactical Score** | **${data.summaryStats.drillScore} / ${data.summaryStats.drillMaxScore}** (${data.summaryStats.drillPercentage}%) | Scene 10 Live-Fire Drill |`,
  );
  lines.push(
    `| **Operator Status Rating** | **${data.summaryStats.operatorRating}** | Counter-Intelligence Baseline |`,
  );
  lines.push(
    `| **Elicitation Traps Evaded / Sprung** | **${data.summaryStats.trapsEvaded} Evaded / ${data.summaryStats.trapsSprung} Sprung** | 3 Encounters |`,
  );
  lines.push(
    `| **Starting Posture Calibration** | ${data.summaryStats.startingPosture} | Bridged Clearance Tier |`,
  );
  lines.push(
    `| **Canary Shield Milestone Execution** | **${data.summaryStats.capstoneMilestonesCompleted} / ${data.summaryStats.capstoneTotalMilestones} Completed** | 3 Strategic Acts |`,
  );
  lines.push(
    `| **Attribution Memo Status** | **${data.capstone.attributionMemo ? 'SUBMITTED & DOCUMENTED' : 'PENDING FINAL SUBMISSION'}** | Adjudicator Rubric |`,
  );
  if (data.summaryStats.capstoneStars !== undefined) {
    lines.push(
      `| **Adjudicator Rating** | **${data.summaryStats.capstoneStars} / 5 Stars** | Final Evaluation |`,
    );
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## PART I: THE CONVERSATION LAB (SCENE 10) — LIVE-FIRE DRILL');
  lines.push('');
  if (dp) {
    lines.push(`- **Tactical Score:** ${dp.score} / ${dp.maxScore} (${dp.percentage}%)`);
    lines.push(`- **Operator Rating:** ${dp.rating}`);
    lines.push(`- **Debrief Assessment:** ${dp.ratingLine}`);
    lines.push(`- **Assigned Posture:** ${dp.startingPosture}`);
    lines.push(`- **Handler Clearance Directive:** ${dp.handlerBriefingNote}`);
    lines.push('');
    lines.push('### Encounter Forensic Breakdown:');
    lines.push('');
    dp.results.forEach((r, idx) => {
      lines.push(`#### Encounter ${idx + 1}: ${r.name} (${r.role})`);
      lines.push(`- **Context:** ${r.context}`);
      lines.push(`- **Hostile Elicitation Tactic:** \`${r.tactic}\``);
      lines.push(
        `- **Chosen Operator Response [${r.optionKey}]:** *"${r.optionLabel.replace(/\n/g, ' ')}"*`,
      );
      lines.push(
        `- **Tactical Verdict:** \`${r.verdict.toUpperCase()}\` (+${r.points} pts) — ${
          r.trapSprung ? '⚠️ TRAP SPRUNG' : '🛡️ TRAP EVADED (CONVERSATIONAL JUDO)'
        }`,
      );
      lines.push(
        `- **Forensic Debrief:** ${r.debrief.replace(/<[^>]+>/g, '').replace(/&mdash;/g, '—')}`,
      );
      lines.push('');
    });
  } else {
    lines.push(
      '*No prior Conversation Lab drill record detected in local storage. Operator entered Capstone with default calibration.*',
    );
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  lines.push('## PART II: OPERATION CANARY SHIELD (SCENE 11) — PBL CAPSTONE');
  lines.push('');
  lines.push(`**Mission Objective:** ${data.capstone.learningObjective || data.capstone.description}`);
  if (data.capstone.setting) {
    lines.push(`**Operational Premise:** ${data.capstone.setting}`);
  }
  lines.push('');
  lines.push('### Milestone & Microtask Execution Ledger:');
  lines.push('');
  data.capstone.milestones.forEach((m, mIdx) => {
    lines.push(`#### Act ${mIdx + 1}: ${m.title} [Status: ${m.status.toUpperCase()}]`);
    if (m.briefing) {
      lines.push(`*Briefing:* ${m.briefing}`);
    }
    lines.push('');
    m.microtasks.forEach((t, tIdx) => {
      const check = t.status === 'completed' ? '[x]' : '[ ]';
      lines.push(`- ${check} **Task ${mIdx + 1}.${tIdx + 1}:** ${t.title} (\`${t.status}\`)`);
      if (t.completionCriteria) {
        lines.push(`  - *Criteria:* ${t.completionCriteria}`);
      }
    });
    lines.push('');
  });

  lines.push('### Operator Attribution Memorandum (Submitted Record):');
  lines.push('');
  if (data.capstone.attributionMemo) {
    const fence = data.capstone.attributionMemo.content.includes('```') ? '````' : '```';
    lines.push(`${fence}text`);
    lines.push(data.capstone.attributionMemo.content);
    lines.push(fence);
    lines.push(`*Submitted at: ${new Date(data.capstone.attributionMemo.submittedAt).toUTCString()}*`);
  } else {
    lines.push('> *[Attribution Memo has not been submitted yet in the Capstone workspace.]*');
  }
  lines.push('');

  if (data.capstone.actGoals && data.capstone.actGoals.length > 0) {
    lines.push('### Adjudicator Scored Goal Coverage:');
    lines.push('');
    data.capstone.actGoals.forEach((act) => {
      lines.push(`#### ${act.actTitle}`);
      act.goals.forEach((g) => {
        const symbol = g.status === 'achieved' ? '✓ ACHIEVED' : g.status === 'partial' ? '◐ PARTIAL' : '✗ MISSED';
        lines.push(`- **${symbol}**: ${g.goal}${g.skillFocus ? ` *(Skill: ${g.skillFocus})*` : ''}`);
        if (g.note) lines.push(`  - *Adjudicator Note:* ${g.note}`);
      });
      lines.push('');
    });
  }

  if (data.capstone.evaluations.length > 0) {
    lines.push('### Handler & Adjudicator Evaluations:');
    lines.push('');
    data.capstone.evaluations.forEach((ev) => {
      lines.push(`#### Evaluation: \`${ev.kind.toUpperCase()}\``);
      if (ev.feedback) {
        lines.push(`${ev.feedback.replace(/\{\{\s*[^}]+\s*\}\}/g, '').trim()}`);
        lines.push('');
      }
      if (ev.whatYouBuilt && ev.whatYouBuilt.length > 0) {
        lines.push('**Key Deliverables & Actions Taken:**');
        ev.whatYouBuilt.forEach((b) => lines.push(`- ${b}`));
        lines.push('');
      }
      if (ev.whatYouLearned && ev.whatYouLearned.length > 0) {
        lines.push('**Tradecraft Principles Validated:**');
        ev.whatYouLearned.forEach((l) => lines.push(`- ${l}`));
        lines.push('');
      }
    });
  }

  lines.push('---');
  lines.push('');
  lines.push('## PART III: RED CELL FINAL ADJUDICATION & CLEARANCE');
  lines.push('');
  lines.push(
    '1. **Conversational Judo Competence:** The operator demonstrated that every elicitation probe is a reconnaissance attempt leaking adversary targeting priorities.',
  );
  lines.push(
    '2. **Information Watermarking Integrity:** Canary trap mechanics were formulated to survive paraphrase and partial disclosure.',
  );
  lines.push(
    '3. **Operational Discipline:** The leak was attributed with forensic precision while leaving council relationships unburned.',
  );
  lines.push('');
  lines.push('```');
  lines.push('========================================================================');
  lines.push('VERDICT: OPERATION CANARY SHIELD CONCLUDED & ADJUDICATED');
  lines.push(`FINAL STATUS: ${data.summaryStats.operatorRating}`);
  lines.push(`CLEARANCE GRANTED: LEVEL 4 COUNTER-INTELLIGENCE SPECIALIST`);
  lines.push('========================================================================');
  lines.push('```');

  return lines.join('\n');
}

export function formatAfterActionReportHtml(data: AfterActionReportData): string {
  const dp = data.drillProfile;
  const ratingBadgeClass =
    data.summaryStats.drillScore >= 270
      ? 'badge-optimal'
      : data.summaryStats.drillScore >= 120
      ? 'badge-acceptable'
      : 'badge-compromised';

  const memoHtml = data.capstone.attributionMemo
    ? `<pre class="memo-box">${escapeHtml(data.capstone.attributionMemo.content)}</pre>
       <div class="stamp-sub">SUBMITTED ON: ${new Date(data.capstone.attributionMemo.submittedAt).toUTCString()}</div>`
    : `<div class="memo-pending">[Attribution Memo Pending Submission in Capstone Workspace]</div>`;

  let encountersHtml = '';
  if (dp) {
    encountersHtml = dp.results
      .map(
        (r, i) => `
      <div class="encounter-card">
        <div class="encounter-header">
          <span class="enc-title">ENCOUNTER ${i + 1}: ${escapeHtml(r.name)} (${escapeHtml(r.role)})</span>
          <span class="pill ${r.verdict}">${r.verdict.toUpperCase()} (+${r.points} pts)</span>
        </div>
        <div class="enc-ctx">${escapeHtml(r.context)} · Tactic: <strong>${escapeHtml(r.tactic)}</strong></div>
        <div class="enc-move">
          <strong>Chosen Response [${r.optionKey}]:</strong> <em>"${escapeHtml(r.optionLabel)}"</em>
        </div>
        <div class="enc-debrief ${r.trapSprung ? 'debrief-sprung' : 'debrief-evaded'}">
          ${r.debrief}
        </div>
      </div>
    `,
      )
      .join('');
  } else {
    encountersHtml = '<p class="dim">No Scene 10 Conversation Lab drill record detected.</p>';
  }

  const milestonesHtml = data.capstone.milestones
    .map(
      (m, idx) => `
    <div class="milestone-block">
      <div class="milestone-title">ACT ${idx + 1}: ${escapeHtml(m.title)} <span class="tag-status">${m.status.toUpperCase()}</span></div>
      ${m.briefing ? `<p class="milestone-briefing">${escapeHtml(m.briefing)}</p>` : ''}
      <ul class="task-list">
        ${m.microtasks
          .map(
            (t) => `
          <li class="${t.status === 'completed' ? 'task-done' : 'task-todo'}">
            <span class="task-icon">${t.status === 'completed' ? '✓' : '○'}</span>
            <strong>${escapeHtml(t.title)}</strong>
            ${t.completionCriteria ? `<span class="task-crit">Criteria: ${escapeHtml(t.completionCriteria)}</span>` : ''}
          </li>
        `,
          )
          .join('')}
      </ul>
    </div>
  `,
    )
    .join('');

  let evalsHtml = '';
  if (data.capstone.evaluations.length > 0) {
    evalsHtml = data.capstone.evaluations
      .map(
        (ev) => `
      <div class="eval-card">
        <div class="eval-title">EVALUATION: ${escapeHtml(ev.kind.toUpperCase())} ${ev.stars ? `· ${ev.stars}/5 STARS` : ''}</div>
        ${ev.feedback ? `<div class="eval-feedback">${escapeHtml(ev.feedback.replace(/\{\{\s*[^}]+\s*\}\}/g, ''))}</div>` : ''}
        ${
          ev.whatYouBuilt && ev.whatYouBuilt.length
            ? `<div class="eval-subhead">Key Operational Deliverables:</div>
               <ul class="eval-list">${ev.whatYouBuilt.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
            : ''
        }
        ${
          ev.whatYouLearned && ev.whatYouLearned.length
            ? `<div class="eval-subhead">Tradecraft Validated:</div>
               <ul class="eval-list">${ev.whatYouLearned.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`
            : ''
        }
      </div>
    `,
      )
      .join('');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>After-Action Report (AAR) — Operation Canary Shield</title>
<style>
  :root {
    --bg: #0b1220; --panel: #101a30; --panel2: #0e1628; --line: #22304d;
    --ink: #e8eefb; --dim: #93a1bd; --faint: #5b6b8c;
    --red: #d14424; --amber: #f5a623; --green: #2fbf71; --cyan: #22d3ee;
    --mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg); color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6; padding: 32px 20px;
  }
  .container { max-width: 880px; margin: 0 auto; }
  .header-actions {
    display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 24px;
  }
  .btn {
    background: linear-gradient(180deg, #1e293b, #0f172a); border: 1px solid var(--line);
    color: var(--ink); font-family: var(--mono); font-size: 12px; font-weight: 600;
    padding: 8px 16px; border-radius: 8px; cursor: pointer; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px; transition: all .15s ease;
  }
  .btn:hover { background: #1e293b; border-color: var(--cyan); color: #fff; }
  .btn-primary { background: linear-gradient(180deg, #0284c7, #0369a1); border-color: #38bdf8; color: #fff; }
  .btn-primary:hover { background: #0284c7; }
  
  .classified-banner {
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.25em; text-align: center;
    color: var(--red); padding: 8px; border: 1px dashed var(--red); border-radius: 6px;
    background: rgba(209, 68, 36, 0.08); margin-bottom: 24px; text-transform: uppercase;
  }
  .doc-card {
    background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
    padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.4); margin-bottom: 28px;
  }
  h1 { font-size: 26px; letter-spacing: -0.01em; margin-bottom: 6px; color: #fff; }
  h2 { font-size: 18px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cyan); margin: 28px 0 14px; border-bottom: 1px solid var(--line); padding-bottom: 8px; font-family: var(--mono); }
  h3 { font-size: 15px; margin: 18px 0 10px; color: #fff; }
  .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin: 20px 0; font-size: 13px; }
  .meta-cell { background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 8px; padding: 12px; }
  .meta-cell b { display: block; font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; color: var(--dim); margin-bottom: 4px; }
  
  .stat-deck { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin: 20px 0; }
  .stat-card { background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 10px; padding: 14px; text-align: center; }
  .stat-card .val { font-size: 26px; font-weight: 800; font-family: var(--mono); color: #fff; }
  .stat-card .lbl { font-size: 11px; color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
  
  .pill { font-family: var(--mono); font-size: 11px; padding: 4px 8px; border-radius: 6px; border: 1px solid; }
  .pill.optimal, .badge-optimal { color: var(--green); border-color: var(--green); background: rgba(47,191,113,0.12); }
  .pill.acceptable, .badge-acceptable { color: var(--amber); border-color: var(--amber); background: rgba(245,166,35,0.12); }
  .pill.compromised, .badge-compromised { color: var(--red); border-color: var(--red); background: rgba(209,68,36,0.12); }
  
  .encounter-card { border: 1px solid var(--line); border-radius: 10px; padding: 16px; margin-bottom: 14px; background: rgba(255,255,255,0.015); }
  .encounter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .enc-title { font-weight: 700; font-size: 14px; color: #fff; }
  .enc-ctx { font-size: 12px; color: var(--dim); margin-bottom: 8px; font-family: var(--mono); }
  .enc-move { font-size: 13.5px; margin-bottom: 8px; }
  .enc-debrief { font-size: 13px; line-height: 1.5; padding: 10px; border-radius: 6px; background: rgba(0,0,0,0.25); border-left: 3px solid; }
  .debrief-evaded { border-color: var(--green); }
  .debrief-sprung { border-color: var(--red); }
  
  .milestone-block { border: 1px solid var(--line); border-radius: 10px; padding: 16px; margin-bottom: 14px; }
  .milestone-title { font-weight: 700; font-size: 15px; color: #fff; display: flex; justify-content: space-between; align-items: center; }
  .milestone-briefing { font-size: 13px; color: var(--dim); margin: 8px 0 12px; font-style: italic; }
  .tag-status { font-family: var(--mono); font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.06); color: var(--cyan); }
  
  .task-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .task-list li { font-size: 13px; display: flex; align-items: flex-start; gap: 8px; }
  .task-icon { font-family: var(--mono); font-weight: bold; width: 16px; }
  .task-done .task-icon { color: var(--green); }
  .task-todo .task-icon { color: var(--faint); }
  .task-crit { display: block; font-size: 11px; color: var(--faint); margin-top: 2px; }
  
  .memo-box {
    background: #080d17; border: 1px solid #1e3a5f; border-left: 4px solid var(--cyan);
    border-radius: 8px; padding: 18px; font-family: var(--mono); font-size: 12.5px;
    white-space: pre-wrap; line-height: 1.6; color: #cbd5e1; margin-top: 10px;
  }
  .memo-pending { padding: 16px; border: 1px dashed var(--line); border-radius: 8px; font-size: 13px; color: var(--faint); text-align: center; }
  .stamp-sub { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; color: var(--dim); margin-top: 6px; }
  
  .eval-card { border: 1px solid var(--line); border-radius: 10px; padding: 16px; margin-bottom: 12px; background: rgba(34,211,238,0.02); }
  .eval-title { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--cyan); margin-bottom: 8px; }
  .eval-feedback { font-size: 13.5px; line-height: 1.5; margin-bottom: 10px; }
  .eval-subhead { font-size: 12px; font-weight: 700; color: #fff; margin-top: 8px; }
  .eval-list { font-size: 12.5px; color: var(--dim); margin-left: 18px; }
  
  .seal-block {
    text-align: center; font-family: var(--mono); font-size: 11px; letter-spacing: 0.18em;
    color: var(--dim); border: 1px solid var(--line); padding: 16px; border-radius: 8px;
    margin-top: 30px; background: rgba(255,255,255,0.01);
  }
  
  @media print {
    body { background: #fff !important; color: #0f172a !important; padding: 0 !important; }
    .header-actions { display: none !important; }
    .doc-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
    h1, h2, h3, .enc-title, .milestone-title { color: #0f172a !important; }
    .classified-banner { border-color: #0f172a !important; color: #0f172a !important; background: #f1f5f9 !important; }
    .meta-cell, .stat-card, .encounter-card, .milestone-block, .eval-card { border-color: #cbd5e1 !important; background: #fff !important; color: #0f172a !important; }
    .stat-card .val { color: #0f172a !important; }
    .memo-box { background: #f8fafc !important; color: #0f172a !important; border-color: #94a3b8 !important; }
    .pill.optimal { color: #15803d !important; border-color: #15803d !important; }
    .pill.acceptable { color: #b45309 !important; border-color: #b45309 !important; }
    .pill.compromised { color: #b91c1c !important; border-color: #b91c1c !important; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="header-actions">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print to PDF / Save as PDF</button>
    <a class="btn" id="dl-md" href="#">📥 Download Markdown (.md)</a>
  </div>

  <div class="classified-banner">${escapeHtml(data.classification)}</div>

  <div class="doc-card">
    <h1>AFTER-ACTION REPORT (AAR)</h1>
    <div style="font-family:var(--mono);font-size:13px;color:var(--cyan);margin-bottom:12px;">OPERATION CANARY SHIELD & CONVERSATION LAB SYNTHESIS</div>
    
    <div class="meta-grid">
      <div class="meta-cell"><b>COURSE</b>${escapeHtml(data.courseTitle)}</div>
      <div class="meta-cell"><b>CLASSROOM ID</b><code>${escapeHtml(data.classroomId)}</code></div>
      <div class="meta-cell"><b>DATE GENERATED</b>${new Date(data.generatedAt).toLocaleString()}</div>
      <div class="meta-cell"><b>OPERATOR ROLE</b>${escapeHtml(data.operatorRole)}</div>
    </div>

    <div class="stat-deck">
      <div class="stat-card">
        <div class="val">${data.summaryStats.drillScore}/${data.summaryStats.drillMaxScore}</div>
        <div class="lbl">Drill Score</div>
      </div>
      <div class="stat-card">
        <div class="val">${data.summaryStats.trapsEvaded}/3</div>
        <div class="lbl">Traps Evaded</div>
      </div>
      <div class="stat-card">
        <div class="val">${data.summaryStats.capstoneMilestonesCompleted}/${data.summaryStats.capstoneTotalMilestones}</div>
        <div class="lbl">Capstone Acts</div>
      </div>
      <div class="stat-card">
        <div class="val">${data.summaryStats.capstoneStars !== undefined ? data.summaryStats.capstoneStars + '★' : 'PASS'}</div>
        <div class="lbl">Adjudication</div>
      </div>
    </div>

    <h2>PART I: THE CONVERSATION LAB (SCENE 10)</h2>
    <div style="margin-bottom:14px;font-size:13.5px;">
      <strong>Assigned Posture:</strong> <code>${escapeHtml(data.summaryStats.startingPosture)}</code><br>
      <strong>Rating Assessment:</strong> <span class="pill ${ratingBadgeClass}">${escapeHtml(data.summaryStats.operatorRating)}</span>
    </div>
    ${encountersHtml}

    <h2>PART II: OPERATION CANARY SHIELD (SCENE 11)</h2>
    <div style="margin-bottom:14px;font-size:13.5px;">
      <strong>Mission Goal:</strong> ${escapeHtml(data.capstone.goal || data.capstone.description)}
    </div>
    
    <h3>Strategic Milestones</h3>
    ${milestonesHtml}

    <h3>Attribution Memorandum (Submitted Evidence)</h3>
    ${memoHtml}

    ${evalsHtml ? `<h3>Evaluator & Handler Assessment</h3>${evalsHtml}` : ''}

    <div class="seal-block">
      // RED CELL COUNTER-INTELLIGENCE ADJUDICATION DIVISION //<br>
      STATUS: VERIFIED OPERATIONAL RECORD · LEVEL 4 CLEARANCE CONFIRMED
    </div>
  </div>
</div>

<script>
  const mdData = ${JSON.stringify(formatAfterActionReportMarkdown(data)).replace(/<\/script/gi, '<\\/script')};
  const dlBtn = document.getElementById('dl-md');
  if (dlBtn) {
    const blob = new Blob([mdData], { type: 'text/markdown;charset=utf-8' });
    dlBtn.href = URL.createObjectURL(blob);
    dlBtn.download = ${JSON.stringify(`AAR-Operation-Canary-Shield-${data.classroomId}.md`)};
  }
</script>
</body>
</html>`;
}

function escapeHtml(str: unknown): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function downloadReportFile(filename: string, content: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
