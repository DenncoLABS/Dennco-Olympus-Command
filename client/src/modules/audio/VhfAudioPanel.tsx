import React, { useMemo, useState } from 'react';
import { Radio, Volume2, VolumeX } from 'lucide-react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';

export const VhfAudioPanel: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const channels = settings.vhfAudio.channels || [];
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState(settings.vhfAudio.defaultChannelId || channels[0]?.id || '');

  const selected = useMemo(
    () => channels.find((channel) => channel.id === selectedId) || channels[0],
    [channels, selectedId],
  );

  if (!settings.vhfAudio.enabled || channels.length === 0) {
    return null;
  }

  return (
    <div className="absolute right-4 top-20 z-30 w-[320px] pointer-events-auto font-mono">
      <div className="border border-cyan-300/25 bg-black/80 shadow-[0_0_28px_rgba(34,211,238,0.12)] text-white">
        <div className="px-3 py-2 border-b border-cyan-300/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-200 text-[10px] uppercase tracking-[0.2em]">
            <Radio size={14} /> VHF Voice
          </div>
          <button
            onClick={() => setIsEnabled((value) => !value)}
            className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
              isEnabled ? 'border-emerald-300/50 text-emerald-300' : 'border-white/20 text-white/45'
            }`}
          >
            {isEnabled ? 'Live' : 'Muted'}
          </button>
        </div>

        <div className="p-3 space-y-3">
          <select
            value={selected?.id || ''}
            onChange={(event) => setSelectedId(event.target.value)}
            className="w-full bg-black border border-white/15 px-2 py-2 text-xs text-white outline-none focus:border-cyan-300/60"
          >
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.label}
              </option>
            ))}
          </select>

          {selected && (
            <div className="border border-white/10 bg-white/[0.03] p-3 space-y-1 text-[11px] text-white/55">
              <div className="text-white/80 font-bold">{selected.label}</div>
              {selected.region && <div>Region: {selected.region}</div>}
              {selected.frequency && <div>Frequency: {selected.frequency}</div>}
              <div>Type: {selected.type || 'VHF'}</div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
            {isEnabled ? <Volume2 size={14} className="text-emerald-300" /> : <VolumeX size={14} />}
            {isEnabled ? 'Audio enabled' : 'Audio muted'}
          </div>

          {isEnabled && selected?.streamUrl && (
            <audio key={selected.streamUrl} controls autoPlay src={selected.streamUrl} className="w-full" />
          )}
        </div>
      </div>
    </div>
  );
};
