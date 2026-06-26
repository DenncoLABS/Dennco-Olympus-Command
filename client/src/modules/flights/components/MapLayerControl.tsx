import React, { useState, useRef, useEffect } from 'react';
import type { MapLayer, WeatherRadarProduct } from '../../../ui/theme/theme.store';
import { Layers, X, HelpCircle, CloudRain } from 'lucide-react';
import { useMapAppearance } from '../../intelmaps/MapInstanceContext';

export const MapLayerControl: React.FC = () => {
  const {
    mapLayer,
    setMapLayer,
    mapProjection,
    setMapProjection,
    weatherRadar,
    setWeatherRadarEnabled,
    setWeatherRadarProduct,
    setWeatherRadarOpacity,
    setWeatherRadarContrast,
    setWeatherRadarBrightness,
    setWeatherRadarCustomTileUrl,
  } = useMapAppearance();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const mapTypes: { id: MapLayer; label: string; bgClass: string }[] = [
    { id: 'street', label: 'Default', bgClass: 'bg-[#CBE4EE]' },
    { id: 'satellite', label: 'Satellite', bgClass: 'bg-[#5B6D55]' },
    { id: 'light', label: 'Light', bgClass: 'bg-[#EDEDED]' },
    { id: 'dark', label: 'Dark', bgClass: 'bg-[#2E3136]' },
  ];
  const radarProducts: { id: WeatherRadarProduct; label: string }[] = [
    { id: 'base-reflectivity', label: 'NOAA Base Reflectivity' },
    { id: 'custom', label: 'Custom NOAA/WMS Tile URL' },
  ];

  return (
    <div className="absolute right-4 bottom-8 flex flex-col items-end gap-2 z-20 pointer-events-auto" ref={popoverRef}>
      {isOpen && (
        <div className="bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] w-[360px] overflow-hidden text-[#3C4043] animate-in fade-in zoom-in-95 duration-100 mb-2">
          <div className="flex justify-between items-center px-4 py-3 pb-2 border-b border-gray-100">
            <h2 className="font-semibold text-[15px]">Map details</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black hover:bg-gray-100 p-1 rounded-full transition-colors"><X size={18} /></button>
          </div>
          <div className="p-4 space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-3">Map type</h3>
              <div className="grid grid-cols-4 gap-2">
                {mapTypes.map((type) => {
                  const isSelected = mapLayer === type.id;
                  return <button key={type.id} onClick={() => setMapLayer(type.id)} className="flex flex-col items-center gap-1.5 focus:outline-none group"><div className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center transition-all overflow-hidden relative border-[2.5px] ${isSelected ? 'border-[#1A73E8]' : 'border-transparent hover:brightness-95'}`}><div className={`absolute inset-0 ${type.bgClass}`} /></div><span className={`text-[11px] font-medium transition-colors ${isSelected ? 'text-[#1A73E8]' : 'text-[#70757A]'}`}>{type.label}</span></button>;
                })}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><CloudRain size={16} className="text-[#1A73E8]" /><h3 className="text-sm font-semibold">NOAA Doppler weather</h3></div><label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium"><input type="checkbox" checked={weatherRadar.enabled} onChange={(e) => setWeatherRadarEnabled(e.target.checked)} />Live radar</label></div>
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Product</label>
              <select value={weatherRadar.product} onChange={(e) => setWeatherRadarProduct(e.target.value as WeatherRadarProduct)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-[12px] mb-3">{radarProducts.map((product) => <option key={product.id} value={product.id}>{product.label}</option>)}</select>
              {weatherRadar.product === 'custom' && <textarea value={weatherRadar.customTileUrl} onChange={(e) => setWeatherRadarCustomTileUrl(e.target.value)} placeholder="Paste NOAA/ArcGIS/WMS tile URL with {bbox-epsg-3857}" className="w-full h-16 border border-gray-200 rounded px-2 py-1.5 text-[11px] mb-3 font-mono" />}
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Opacity {Math.round(weatherRadar.opacity * 100)}%</label>
              <input type="range" min="0" max="1" step="0.05" value={weatherRadar.opacity} onChange={(e) => setWeatherRadarOpacity(Number(e.target.value))} className="w-full mb-3" />
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Contrast {weatherRadar.contrast.toFixed(2)}</label>
              <input type="range" min="-1" max="1" step="0.05" value={weatherRadar.contrast} onChange={(e) => setWeatherRadarContrast(Number(e.target.value))} className="w-full mb-3" />
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Intensity filter</label>
              <div className="grid grid-cols-2 gap-2"><input type="range" min="0" max="1" step="0.05" value={weatherRadar.brightnessMin} onChange={(e) => setWeatherRadarBrightness(Number(e.target.value), weatherRadar.brightnessMax)} /><input type="range" min="0" max="1" step="0.05" value={weatherRadar.brightnessMax} onChange={(e) => setWeatherRadarBrightness(weatherRadar.brightnessMin, Number(e.target.value))} /></div>
            </div>
            <div className="border-t border-gray-100 pt-4"><h3 className="text-sm font-semibold mb-3">Projection</h3><div className="grid grid-cols-2 gap-2"><button onClick={() => setMapProjection('mercator')} className={`px-3 py-2 rounded border text-xs ${mapProjection === 'mercator' ? 'border-[#1A73E8] text-[#1A73E8]' : 'border-gray-200'}`}>Mercator</button><button onClick={() => setMapProjection('globe')} className={`px-3 py-2 rounded border text-xs ${mapProjection === 'globe' ? 'border-[#1A73E8] text-[#1A73E8]' : 'border-gray-200'}`}>Globe</button></div></div>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex items-start gap-2"><HelpCircle size={14} className="mt-0.5" /><span>Map appearance is scoped to this Intel Map window. Shared feeds and overlays remain available across maps.</span></div>
        </div>
      )}
      <button onClick={() => setIsOpen((v) => !v)} className="h-10 w-10 rounded-full bg-white text-[#3C4043] shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"><Layers size={20} /></button>
    </div>
  );
};
