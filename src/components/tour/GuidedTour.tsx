import React from 'react';
import { X, ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useTour } from '../../context/TourContext';
import type { TourPlacement } from '../../context/TourContext';
import { cn } from '../../utils/cn';

interface Rect { top: number; left: number; width: number; height: number; }

const TOOLTIP_W = 340;
const EST_TOOLTIP_H = 200;
const PAD = 8;
const GAP = 14;

function computeTooltipPos(rect: Rect | null, placement: TourPlacement, vw: number, vh: number) {
  if (!rect || placement === 'center') {
    return { left: Math.max(16, (vw - TOOLTIP_W) / 2), top: Math.max(24, vh * 0.32) };
  }
  let left = rect.left;
  let top = rect.top;
  switch (placement) {
    case 'right':
      left = rect.left + rect.width + GAP;
      top = rect.top;
      break;
    case 'left':
      left = rect.left - TOOLTIP_W - GAP;
      top = rect.top;
      break;
    case 'top':
      left = rect.left;
      top = rect.top - EST_TOOLTIP_H - GAP;
      break;
    case 'bottom':
    default:
      left = rect.left;
      top = rect.top + rect.height + GAP;
      break;
  }
  // keep within viewport
  left = Math.min(Math.max(16, left), vw - TOOLTIP_W - 16);
  top = Math.min(Math.max(16, top), vh - EST_TOOLTIP_H - 16);
  return { left, top };
}

export const GuidedTour: React.FC = () => {
  const { active, stepIndex, steps, next, prev, stop } = useTour();
  const step = steps[stepIndex];
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [viewport, setViewport] = React.useState({ vw: 1440, vh: 900 });

  const measure = React.useCallback(() => {
    setViewport({ vw: window.innerWidth, vh: window.innerHeight });
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  React.useLayoutEffect(() => {
    if (!active) return;
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, measure]);

  React.useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, next, prev, stop]);

  if (!active || !step) return null;

  const placement = step.placement ?? 'bottom';
  const { vw, vh } = viewport;
  const pos = computeTooltipPos(rect, placement, vw, vh);
  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;

  return (
    <div className="fixed inset-0 z-[100]" aria-live="polite" role="dialog">
      {/* Click blocker (dims when no spotlight target) */}
      <div
        className="absolute inset-0"
        style={{ background: rect ? 'transparent' : 'rgba(2, 6, 23, 0.72)' }}
        onClick={stop}
      />

      {/* Spotlight cut-out via large box-shadow */}
      {rect && (
        <div
          className="absolute rounded-2xl ring-2 ring-violet-400/70 pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.72)'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute glass-panel backdrop-blur-2xl border rounded-2xl shadow-2xl shadow-black/40 p-5 transition-all duration-300 ease-out"
        style={{ left: pos.left, top: pos.top, width: TOOLTIP_W }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-white">{step.title}</h3>
          </div>
          <button onClick={stop} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-white/70 leading-relaxed">{step.body}</p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mt-4">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === stepIndex ? 'w-5 bg-violet-400' : 'w-1.5 bg-white/20'
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-white/40">Step {stepIndex + 1} of {steps.length}</span>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={prev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm text-white/70 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={isLast ? stop : next}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              {isLast ? (
                <>
                  Done
                  <Check className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {!isLast && (
          <button onClick={stop} className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors">
            Skip tour
          </button>
        )}
      </div>
    </div>
  );
};
