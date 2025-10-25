"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type PieDatum = { name: string; value: number };

const COLORS = [
  "#3C9D4E",
  "#7031AC",
  "#C94D6D",
  "#E4BF58",
  "#4174C9",
];

const RAD = Math.PI / 180;

function formatPct(p: number) {
  // Use 0 decimals normally; keep 1 decimal for tiny slices
  if (p > 0 && p < 5) return `${p.toFixed(1)}%`;
  return `${Math.round(p)}%`;
}

export default function WinsPie({ data }: { data: PieDatum[] }) {
  if (!data?.length) {
    return (
      <div className="h-72 flex items-center justify-center text-neutral-500">
        No wins yet.
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const safeTotal = total || 1; // avoid div-by-zero

  // Label renderer: % placed halfway through the arc thickness
  const renderInsideLabel = (props: any) => {
    const {
      cx = 0,
      cy = 0,
      midAngle = 0,
      innerRadius = 0,
      outerRadius = 0,
      value = 0,
    } = props;

    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);

    const pct = (Number(value) / safeTotal) * 100;

    // Hide labels for 0-values
    if (!value) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={0.75}
        paintOrder="stroke"
        fontSize={12}
        fontWeight={700}
      >
        {formatPct(pct)}
      </text>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={96}
              paddingAngle={2}
              labelLine={false}
              label={renderInsideLabel}
              isAnimationActive
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, _name: string, item: any) => {
                const pct = total ? (v / total) * 100 : 0;
                return [`${v} wins (${formatPct(pct)})`, item?.payload?.name ?? "Wins"];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + data table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr className="border-b">
              <th className="py-2 pr-3">Color</th>
              <th className="py-2 pr-3">Player</th>
              <th className="py-2 text-right">Wins</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.name} className="border-b last:border-0">
                <td className="py-2 pr-3">
                  <span
                    className="inline-block h-3 w-3 rounded-sm align-middle"
                    style={{ background: COLORS[idx % COLORS.length] }}
                    aria-label={`${row.name} color`}
                    title={row.name}
                  />
                </td>
                <td className="py-2 pr-3">{row.name}</td>
                <td className="py-2 text-right tabular-nums">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
