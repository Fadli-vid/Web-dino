'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AnalyticsSpecimen,
  buildContinentDistribution,
  buildDietByEraData,
  DIET_COLORS,
  DIET_ORDER,
} from '@/lib/paleo/analytics';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';

interface DietEraChartProps {
  specimens: AnalyticsSpecimen[];
}

const dietChartConfig: ChartConfig = {
  Carnivore: { label: 'Carnivore', color: DIET_COLORS.Carnivore },
  Herbivore: { label: 'Herbivore', color: DIET_COLORS.Herbivore },
  Omnivore: { label: 'Omnivore', color: DIET_COLORS.Omnivore },
  Piscivore: { label: 'Piscivore', color: DIET_COLORS.Piscivore },
  Insectivore: { label: 'Insectivore', color: DIET_COLORS.Insectivore },
};

const geoChartConfig: ChartConfig = {
  count: { label: 'Specimens', color: 'var(--chart-1)' },
};

function EraTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const nonZero = payload.filter((item) => (item.value ?? 0) > 0);
  const total = nonZero.reduce((sum, item) => sum + (item.value ?? 0), 0);

  return (
    <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-md px-3 py-2 shadow-xl text-xs space-y-1.5">
      <div className="font-[var(--font-display)] font-bold text-foreground border-b border-border/50 pb-1">
        {label} Period ({total} species)
      </div>
      {nonZero.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="w-2 h-2 rounded-xs"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-mono font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function ContinentTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { continent: string; count: number } }>;
}) {
  if (!active || !payload || !payload[0]?.payload) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-md px-3 py-2 shadow-xl text-xs">
      <span className="font-semibold text-foreground">{row.continent}:</span>{' '}
      <span className="font-mono font-bold text-primary">{row.count}</span>{' '}
      <span className="text-muted-foreground">species</span>
    </div>
  );
}

export function DietEraChart({ specimens }: DietEraChartProps) {
  const eraData = useMemo(() => buildDietByEraData(specimens), [specimens]);
  const continentData = useMemo(() => buildContinentDistribution(specimens), [specimens]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ecological Guilds by Era */}
      <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
        <div>
          <h3 className="font-[var(--font-display)] font-bold text-sm text-foreground">
            Ecological Guilds Across Eras
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Taxonomic diversity of dietary adaptations from Triassic through Cretaceous.
          </p>
        </div>

        <ChartContainer config={dietChartConfig} className="h-[240px] w-full aspect-auto">
          <BarChart data={eraData} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<EraTooltip />} />
            {DIET_ORDER.map((diet) => (
              <Bar
                key={diet}
                dataKey={diet}
                stackId="diet"
                fill={DIET_COLORS[diet]}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </div>

      {/* Paleogeographic Fossil Provenance */}
      <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
        <div>
          <h3 className="font-[var(--font-display)] font-bold text-sm text-foreground">
            Fossil Provenance by Continent
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Distribution of documented specimen occurrences across major continental basins.
          </p>
        </div>

        <ChartContainer config={geoChartConfig} className="h-[240px] w-full aspect-auto">
          <BarChart
            data={continentData}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 4, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/50" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="continent"
              width={92}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip content={<ContinentTooltip />} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {continentData.map((entry, idx) => (
                <Cell
                  key={entry.continent}
                  fill={`var(--chart-${(idx % 5) + 1})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
