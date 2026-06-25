import React from 'react';

export function OlympusDeskAiSynthesisWidget() {
  return (
    <div className="flex h-full min-h-[210px] flex-col justify-between rounded border border-purple-500/20 bg-purple-950/10 p-3 text-white/65">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300">AI Synthesis</div>
        <p className="mt-3 text-xs leading-relaxed text-white/45">
          Desk widget placeholder saved from the old Monitor dashboard. Live summary controls will be restored in the next smaller patch.
        </p>
      </div>
      <div className="mt-4 rounded border border-white/10 bg-black/35 p-2 text-[10px] uppercase tracking-[0.14em] text-white/35">
        Status: staged for live Desk widget wiring
      </div>
    </div>
  );
}

export function OlympusDeskLiveIntelFeedWidget() {
  return (
    <div className="flex h-full min-h-[210px] flex-col justify-between rounded border border-cyan-300/20 bg-cyan-950/10 p-3 text-white/65">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">Live Intel Feed</div>
        <p className="mt-3 text-xs leading-relaxed text-white/45">
          Desk widget placeholder saved from the old Monitor dashboard. Live feed controls will be restored in the next smaller patch.
        </p>
      </div>
      <div className="mt-4 rounded border border-white/10 bg-black/35 p-2 text-[10px] uppercase tracking-[0.14em] text-white/35">
        Status: staged for live Desk widget wiring
      </div>
    </div>
  );
}
