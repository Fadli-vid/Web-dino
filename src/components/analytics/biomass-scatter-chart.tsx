'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import {
  AnalyticsSpecimen,
  buildBiomassScatterGroups,
  DIET_COLORS,
  DIET_ORDER,
  ScatterPoint,
} from '@/lib/paleo/analytics';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';

interface BiomassScatterChartProps {
  specimens: AnalyticsSpecimen[];
  onNavigate?: () => void;
}

const chartConfig: ChartConfig = {
  Carnivore: { label: 'Carnivore', color: DIET_COLORS.Carnivore },
  Herbivore: { label: 'Herbivore', color: DIET_COLORS.Herbivore },
  Omnivore: { label: 'Omnivore', color: DIET_COLORS.Omnivore },
  Piscivore: { label: 'Piscivore', color: DIET_COLORS.Piscivore },
  Insectivore: { label: 'Insectivore', color: DIET_COLORS.Insectivore },
};

function ScatterPointTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ScatterPoint }>;
}) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
    return null;
  }

  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-md px-3 py-2.5 shadow-xl text-xs space-y-1 max-w-xs">
      <div className="flex items-center justify-between gap-3">
        <span className="font-[var(--font-display)] font-bold text-foreground">
          {point.name}
        </span>
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{
            backgroundColor: `${DIET_COLORS[point.diet]}20`,
            color: DIET_COLORS[point.diet],
          }}
        >
          {point.diet}
        </span>
      </div>
      <div className="italic text-[11px] text-muted-foreground">
        {point.scientificName}
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 font-mono text-[11px]">
        <div>
          <span className="text-muted-foreground">Length:</span>{' '}
          <span className="font-semibold text-foreground">{point.length} m</span>
        </div>
        <div>
          <span className="text-muted-foreground">Mass:</span>{' '}
          <span className="font-semibold text-foreground">{point.weightDisplay}</span>
        </div>
      </div>
      <div className="text-[10px] text-primary font-mono pt-0.5">
        Click dot to open specimen dossier
      </div>
    </div>
  );
}

export function BiomassScatterChart({
  specimens,
  onNavigate,
}: BiomassScatterChartProps) {
  const router = useRouter();
  const [scaleMode, setScaleMode] = useState<'log' | 'linear'>('log');

  const groups = useMemo(() => buildBiomassScatterGroups(specimens), [specimens]);

  const handlePointClick = (point: ScatterPoint) => {
    if (!point?.id) return;
    onNavigate?.();
    router.push(`/species/${point.id}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-[var(--font-display)] font-bold text-sm text-foreground">
            Body Length vs. Estimated Biomass
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Allometric comparison across trophic guilds. Log scale resolves small maniraptorans (1 kg) alongside colossal sauropods (73 t).
          </p>
        </div>

        <div className="inline-flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 shrink-0 self-start">
          <button
            type="button"
            onClick={() => setScaleMode('log')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
              scaleMode === 'log'
                ? 'bg-background text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Log Scale
          </button>
          <button
            type="button"
            onClick={() => setScaleMode('linear')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
              scaleMode === 'linear'
                ? 'bg-background text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Linear
          </button>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] sm:h-[340px] w-full aspect-auto">
        <ScatterChart margin={{ top: 12, right: 16, bottom: 16, left: 6 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            type="number"
            dataKey="length"
            name="Body Length"
            unit=" m"
            domain={[0, 'auto']}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="weightKg"
            name="Biomass"
            scale={scaleMode === 'log' ? 'log' : 'linear'}
            domain={scaleMode === 'log' ? [1, 100000] : [0, 'auto']}
            ticks={scaleMode === 'log' ? [1, 10, 100, 1000, 10000, 100000] : undefined}
            tick={{ fontSize: 11 }}
            tickFormatter={(val: number) =>
              val >= 1000 ? `${Math.round(val / 1000)}t` : `${val}kg`
            }
          />
          <ZAxis range={[55, 85]} />
          <ChartTooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={<ScatterPointTooltip />}
          />
          {DIET_ORDER.map((diet) => {
            const data = groups[diet];
            if (!data || data.length === 0) return null;
            return (
              <Scatter
                key={diet}
                name={diet}
                data={data}
                fill={DIET_COLORS[diet]}
                fillOpacity={0.82}
                stroke={DIET_COLORS[diet]}
                strokeWidth={1}
                className="cursor-pointer"
                onClick={(node) => {
                  const payload = (node as unknown as { payload?: ScatterPoint })?.payload || (node as unknown as ScatterPoint);
                  handlePointClick(payload);
                }}
              />
            );
          })}
        </ScatterChart>
      </ChartContainer>

      {/* Clean Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {DIET_ORDER.map((diet) => {
          const count = groups[diet]?.length || 0;
          if (count === 0) return null;
          return (
            <div key={diet} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: DIET_COLORS[diet] }}
              />
              <span className="font-medium text-foreground">{diet}</span>
              <span className="font-mono text-[10px]">({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
