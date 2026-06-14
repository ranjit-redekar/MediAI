import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCountUp, formatCount } from '../../hooks/useCountUp';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Tailwind gradient classes for the icon tile, e.g. 'from-blue-500 to-cyan-500' */
  gradient?: string;
  /** Hex for the sparkline stroke; defaults to indigo */
  accent?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change?: string;
  trend?: 'up' | 'down';
  sparkline?: number[];
  /** Stagger index for the reveal animation */
  index?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, icon: Icon, gradient = 'from-indigo-500 to-violet-500',
  accent = '#818cf8', prefix, suffix, decimals, change, trend, sparkline, index = 0,
}) => {
  const animated = useCountUp(value);
  return (
    <div
      className="reveal hover-lift glass-card border rounded-2xl p-5 relative overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-app-muted text-sm">{label}</p>
          <h3 className="text-2xl font-bold text-app mt-1.5 tabular-nums tracking-tight">
            {formatCount(animated, { decimals, prefix, suffix })}
          </h3>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'down'
                ? <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                : <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
              <span className={cn('text-xs font-semibold', trend === 'down' ? 'text-red-400' : 'text-emerald-400')}>{change}</span>
              <span className="text-app-subtle text-xs">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-lg', gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {sparkline && sparkline.length > 1 && (
        <div className="mt-3 -mx-1 -mb-1">
          <Sparkline data={sparkline} color={accent} />
        </div>
      )}
    </div>
  );
};

/** Compact icon + animated number stat used on inventory/list pages. */
export const MiniStat: React.FC<{
  icon: LucideIcon;
  label: string;
  value: number;
  tint?: string;       // icon color, e.g. 'text-amber-400'
  ring?: string;       // icon tile bg, e.g. 'bg-amber-500/15'
  prefix?: string;
  suffix?: string;
  decimals?: number;
  index?: number;
}> = ({ icon: Icon, label, value, tint = 'text-indigo-400', ring = 'bg-indigo-500/15', prefix, suffix, decimals, index = 0 }) => (
  <div
    className="reveal hover-lift glass-card border rounded-2xl p-5 flex items-center gap-4"
    style={{ animationDelay: `${index * 70}ms` }}
  >
    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', ring)}>
      <Icon className={cn('w-6 h-6', tint)} />
    </div>
    <div className="min-w-0">
      <p className="text-app-muted text-sm">{label}</p>
      <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} className="text-2xl font-bold text-app tabular-nums" />
    </div>
  </div>
);

/** Inline animated count-up number for use anywhere. */
export const CountUp: React.FC<{ value: number; className?: string; prefix?: string; suffix?: string; decimals?: number }> = ({ value, className, prefix, suffix, decimals }) => {
  const v = useCountUp(value);
  return <span className={className}>{formatCount(v, { prefix, suffix, decimals })}</span>;
};

/** Lightweight animated SVG sparkline (area + line). */
export const Sparkline: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 36 }) => {
  const w = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((d - min) / range) * (height - 6) - 3;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${height} L0,${height} Z`;
  const gid = React.useId();
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1000}
        style={{ strokeDasharray: 1000, animation: 'drawLine 1.2s cubic-bezier(0.16,1,0.3,1) forwards' }}
      />
    </svg>
  );
};
