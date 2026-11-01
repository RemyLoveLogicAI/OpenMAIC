'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { PBLProjectV2 } from '@/lib/pbl/v2/types';
import type { DrillProfile } from '@/lib/drill/drill-bridge';
import {
  generateAfterActionReport,
  formatAfterActionReportMarkdown,
  formatAfterActionReportHtml,
  downloadReportFile,
} from '@/lib/pbl/v2/operations/runtime/after-action-report';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';
import { useStageStore } from '@/lib/store/stage';

interface Props {
  readonly project: PBLProjectV2;
  readonly drillProfile: DrillProfile | null;
  readonly trigger?: React.ReactNode;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

export function AfterActionReportModal({
  project,
  drillProfile,
  trigger,
  defaultOpen = false,
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const stage = useStageStore.getState().stage;
  const classroomId = stage?.id || drillProfile?.stageId || 'TJ0q3IsuaR';
  const courseTitle = stage?.name || 'Covert Influence & Defense';

  const reportData = generateAfterActionReport(project, drillProfile, classroomId, courseTitle);
  const markdownText = formatAfterActionReportMarkdown(reportData);
  const htmlDoc = formatAfterActionReportHtml(reportData);

  const handleDownloadMd = () => {
    downloadReportFile(
      `AAR-Operation-Canary-Shield-${reportData.classroomId}.md`,
      markdownText,
      'text/markdown;charset=utf-8',
    );
  };

  const handleDownloadHtml = () => {
    downloadReportFile(
      `AAR-Operation-Canary-Shield-${reportData.classroomId}.html`,
      htmlDoc,
      'text/html;charset=utf-8',
    );
  };

  const handleOpenPrintView = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlDoc);
        printWindow.document.close();
        printWindow.focus();
        return;
      }
    } catch {
      // Popup blocked or window.open restricted
    }
    // Fallback if popup blocked
    handleDownloadHtml();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-2 text-xs font-semibold text-cyan-200 shadow-sm transition hover:bg-cyan-900/50 hover:border-cyan-400"
          >
            <FileText className="h-4 w-4 text-cyan-300" />
            After-Action Report (AAR)
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-hidden flex flex-col bg-slate-950 text-slate-100 border-white/10 shadow-2xl p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-rose-400 uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              CONFIDENTIAL // MERIDIAN RED CELL // EYES ONLY
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-white mt-1">
              After-Action Report (AAR)
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Operation Canary Shield & The Conversation Lab Operational Synthesis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadMd}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              title="Download as Markdown"
            >
              <Download className="h-3.5 w-3.5 text-cyan-300" />
              Markdown (.md)
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
              title="Download standalone HTML"
            >
              <Download className="h-3.5 w-3.5 text-cyan-300" />
              HTML (.html)
            </button>
            <button
              type="button"
              onClick={handleOpenPrintView}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/25"
              title="Open full print/PDF preview"
            >
              <Printer className="h-3.5 w-3.5 text-violet-300" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <div className="text-xs uppercase text-slate-400 font-mono">Drill Score</div>
              <div className="text-xl font-bold text-white mt-1">
                {reportData.summaryStats.drillScore} / {reportData.summaryStats.drillMaxScore}
              </div>
              <div className="text-[11px] text-cyan-300 font-mono">
                {reportData.summaryStats.drillPercentage}%
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <div className="text-xs uppercase text-slate-400 font-mono">Operator Status</div>
              <div
                className={cn(
                  'text-xs font-bold font-mono mt-2 px-2 py-0.5 rounded-md inline-block',
                  reportData.summaryStats.drillScore >= 270
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : reportData.summaryStats.drillScore >= 120
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300',
                )}
              >
                {reportData.summaryStats.operatorRating}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <div className="text-xs uppercase text-slate-400 font-mono">Traps Record</div>
              <div className="text-base font-bold text-white mt-1">
                <span className="text-emerald-400">{reportData.summaryStats.trapsEvaded} Evaded</span>
                {' · '}
                <span className="text-rose-400">{reportData.summaryStats.trapsSprung} Sprung</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <div className="text-xs uppercase text-slate-400 font-mono">Canary Shield</div>
              <div className="text-xl font-bold text-white mt-1">
                {reportData.summaryStats.capstoneMilestonesCompleted} /{' '}
                {reportData.summaryStats.capstoneTotalMilestones} Acts
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {reportData.summaryStats.capstoneMicrotasksCompleted} tasks done
              </div>
            </div>
          </div>

          {/* Section: Operational Posture */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 mb-1">
              Operational Posture & Handler Directive
            </h3>
            <div className="text-sm font-semibold text-slate-100">
              {reportData.summaryStats.startingPosture}
            </div>
            {drillProfile?.handlerBriefingNote && (
              <p className="mt-2 text-xs text-slate-300 leading-relaxed italic border-l-2 border-cyan-400/40 pl-3">
                &ldquo;{drillProfile.handlerBriefingNote}&rdquo;
              </p>
            )}
          </div>

          {/* Section: Attribution Memo */}
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-300">
                Attribution Memorandum (Submitted Work)
              </h3>
              {reportData.capstone.attributionMemo ? (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Submitted
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Pending Submission
                </span>
              )}
            </div>
            {reportData.capstone.attributionMemo ? (
              <pre className="text-xs font-mono bg-black/40 p-3.5 rounded-lg border border-white/5 text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {reportData.capstone.attributionMemo.content}
              </pre>
            ) : (
              <p className="text-xs text-slate-400 italic">
                The operator has not submitted their final attribution memo for Task 3.2 yet.
              </p>
            )}
          </div>

          {/* Section: Markdown Preview */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Raw Markdown Preview
            </h3>
            <pre className="text-xs font-mono bg-black/60 p-4 rounded-xl border border-white/5 text-slate-300 max-h-64 overflow-y-auto leading-relaxed select-all">
              {markdownText}
            </pre>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-3.5 bg-slate-900/60">
          <span className="text-[11px] font-mono text-slate-400">
            OpenMAIC Counter-Intelligence Framework · TJ0q3IsuaR
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadMd}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Download .md
            </button>
            <button
              type="button"
              onClick={handleOpenPrintView}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-md transition"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
