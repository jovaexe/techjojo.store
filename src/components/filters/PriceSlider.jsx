import { useRef, useCallback, useEffect, useState } from "react";

export default function PriceSlider({
  label = "Price",
  priceMin, priceMax,
  sliderMin, sliderMax,
  setSliderMin, setSliderMax,
}) {
  const [minStr, setMinStr] = useState(String(sliderMin));
  const [maxStr, setMaxStr] = useState(String(sliderMax));
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const sliderRef = useRef({ sliderMin, sliderMax });
  sliderRef.current = { sliderMin, sliderMax };

  useEffect(() => { setMinStr(String(sliderMin)); }, [sliderMin]);
  useEffect(() => { setMaxStr(String(sliderMax)); }, [sliderMax]);

  const getValue = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(priceMin + pct * (priceMax - priceMin));
  }, [priceMin, priceMax]);

  const onMove = useCallback((e) => {
    if (!dragRef.current) return;
    const s = sliderRef.current;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const val = getValue(clientX);
    if (dragRef.current === 'min') {
      setSliderMin(Math.min(val, s.sliderMax));
    } else {
      setSliderMax(Math.max(val, s.sliderMin));
    }
  }, [getValue, setSliderMin, setSliderMax]);

  const stopDrag = useCallback(() => { dragRef.current = null; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', stopDrag);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [onMove, stopDrag]);

  const startDrag = (thumb) => (e) => {
    e.preventDefault();
    dragRef.current = thumb;
  };

  const handleTrackClick = (e) => {
    if (dragRef.current) return;
    const val = getValue(e.clientX);
    if (Math.abs(val - sliderMin) <= Math.abs(val - sliderMax)) {
      dragRef.current = 'min';
      setSliderMin(Math.min(val, sliderMax));
    } else {
      dragRef.current = 'max';
      setSliderMax(Math.max(val, sliderMin));
    }
  };

  const pct = (v) => {
    const raw = ((v - priceMin) / (priceMax - priceMin)) * 100;
    return Math.max(0, Math.min(100, raw));
  };

  return (
    <div>
      <span className="font-medium text-gray-700 dark:text-gray-300 text-[11px]">
        {label}
      </span>

      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
        <span>₦{sliderMin.toLocaleString()}</span>
        <span>₦{sliderMax.toLocaleString()}</span>
      </div>

      <div
        ref={trackRef}
        className="relative h-6 mt-1 cursor-pointer"
        onMouseDown={handleTrackClick}
        onTouchStart={handleTrackClick}
      >
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full dark:bg-neutral-700 pointer-events-none" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-blue-500 rounded-full pointer-events-none"
          style={{
            left: `${pct(sliderMin)}%`,
            width: `${pct(sliderMax) - pct(sliderMin)}%`,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow-sm z-10"
          style={{ left: `${pct(sliderMin)}%` }}
          onMouseDown={startDrag('min')}
          onTouchStart={startDrag('min')}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow-sm z-10"
          style={{ left: `${pct(sliderMax)}%` }}
          onMouseDown={startDrag('max')}
          onTouchStart={startDrag('max')}
        />
      </div>

      <div className="flex gap-2 mt-1">
        <label className="flex-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Min</span>
          <input
            type="number"
            value={minStr}
            onChange={(e) => {
              const raw = e.target.value;
              setMinStr(raw);
              if (raw !== "") {
                const v = Number(raw);
                if (!isNaN(v) && isFinite(v)) setSliderMin(Math.round(v));
              }
            }}
            onBlur={() => { if (minStr === "" || isNaN(Number(minStr))) setMinStr(String(sliderMin)); }}
            className="w-full rounded-md border bg-white px-2 py-1 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
          />
        </label>
        <span className="self-end pb-1 text-xs text-gray-400">–</span>
        <label className="flex-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Max</span>
          <input
            type="number"
            value={maxStr}
            onChange={(e) => {
              const raw = e.target.value;
              setMaxStr(raw);
              if (raw !== "") {
                const v = Number(raw);
                if (!isNaN(v) && isFinite(v)) setSliderMax(Math.round(v));
              }
            }}
            onBlur={() => { if (maxStr === "" || isNaN(Number(maxStr))) setMaxStr(String(sliderMax)); }}
            className="w-full rounded-md border bg-white px-2 py-1 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
          />
        </label>
      </div>
    </div>
  );
}
