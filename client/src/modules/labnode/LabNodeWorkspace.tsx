import React, { useState } from 'react';
import { OlympusWorkspaceShell, type OlympusWorkspaceAction } from '../../ui/layout/OlympusWorkspaceShell';

type Stage = 'import' | 'edit' | 'test' | 'ready';
type LabJob = { id: string; title: string; stage: Stage; createdAt: string };

const JOB_KEY = 'olympus.labnode.jobs.v2';
const stageLabels: Record<Stage, string> = {
  import: 'Import',
  edit: 'Edit',
  test: 'Test',
  ready: 'Ready',
};

function readJobs(): LabJob[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(JOB_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJobs(jobs: LabJob[]) {
  localStorage.setItem(JOB_KEY, JSON.stringify(jobs));
}

export const LabNodeWorkspace: React.FC = () => {
  const [jobs, setJobs] = useState<LabJob[]>(() => readJobs());
  const [activeStage, setActiveStage] = useState<Stage>('import');

  const saveJobs = (next: LabJob[]) => {
    setJobs(next);
    writeJobs(next);
  };

  const createJob = (stage: Stage) => {
    const createdAt = new Date().toISOString();
    saveJobs([
      ...jobs,
      { id: `${stage}-${Date.now()}`, title: `Lab ${stageLabels[stage]} Job`, stage, createdAt },
    ]);
    setActiveStage(stage);
  };

  const clearJobs = () => saveJobs([]);

  const actions: OlympusWorkspaceAction[] = [
    { id: 'new-import', label: 'New Lab Job', tone: 'primary', onClick: () => createJob('import') },
    { id: 'import', label: 'Import', active: activeStage === 'import', onClick: () => setActiveStage('import') },
    { id: 'edit', label: 'Edit', active: activeStage === 'edit', onClick: () => setActiveStage('edit') },
    { id: 'test', label: 'Test', active: activeStage === 'test', onClick: () => setActiveStage('test') },
    { id: 'ready', label: 'Ready', tone: activeStage === 'ready' ? 'success' : 'default', active: activeStage === 'ready', onClick: () => setActiveStage('ready') },
    { id: 'clear', label: 'Clear Jobs', onClick: clearJobs },
  ];

  const visibleJobs = jobs.filter((job) => job.stage === activeStage);

  return (
    <OlympusWorkspaceShell
      title="Proxmox 8 + NethServer 8 Lab Node"
      subtitle="Lab workflow for importing, changing, testing, and releasing systems."
      surfaceLabel="Lab Node Workspace Surface"
      actions={actions}
      showDefaultClose
    >
      <div className="grid h-full grid-cols-[300px_1fr] overflow-hidden bg-[#020617]">
        <aside className="border-r border-cyan-300/10 bg-black/35 p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Lab Pipeline</div>
          <div className="mt-4 space-y-2">
            {(['import', 'edit', 'test', 'ready'] as Stage[]).map((stage) => {
              const count = jobs.filter((job) => job.stage === stage).length;
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={`block w-full rounded border px-3 py-2 text-left text-xs uppercase tracking-[0.14em] ${activeStage === stage ? 'border-cyan-300/55 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-cyan-300/35 hover:text-cyan-100'}`}
                >
                  <span>{stageLabels[stage]}</span>
                  <span className="float-right text-white/35">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 rounded border border-cyan-300/10 bg-cyan-300/[0.04] p-3 text-[10px] leading-relaxed text-white/45">
            Lab Node now uses the shared Olympus workspace shell. Jobs stay inside one workspace surface instead of spawning random floating windows.
          </div>
        </aside>

        <main className="min-h-0 overflow-auto p-5 custom-scrollbar">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">{stageLabels[activeStage]} Stage</div>
              <div className="mt-1 text-sm uppercase tracking-[0.14em] text-white/60">{visibleJobs.length} lab job{visibleJobs.length === 1 ? '' : 's'}</div>
            </div>
            <button onClick={() => createJob(activeStage)} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">Add {stageLabels[activeStage]} Job</button>
          </div>

          {visibleJobs.length === 0 ? (
            <div className="flex h-[calc(100%-60px)] items-center justify-center text-center text-white/35">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">No {stageLabels[activeStage]} Jobs</div>
                <div className="mt-2 text-sm uppercase tracking-[0.16em]">Create a lab job from the toolbar.</div>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {visibleJobs.map((job) => (
                <article key={job.id} className="rounded border border-cyan-300/15 bg-white/[0.03] p-4 shadow-[0_16px_32px_rgba(0,0,0,0.28)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{job.title}</div>
                      <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">LAB JOB · {job.stage} · {job.createdAt}</div>
                    </div>
                    <button onClick={() => saveJobs(jobs.filter((item) => item.id !== job.id))} className="border border-white/10 px-2 py-0.5 text-[10px] text-white/55 hover:text-red-200">×</button>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/60">
                    Use this lab job to track a Proxmox 8 or NethServer 8 system while it is imported into the lab, changed, tested, and prepared for release.
                  </p>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </OlympusWorkspaceShell>
  );
};
