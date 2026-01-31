import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowUpRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  FileUp,
  LineChart,
  MessageSquare,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type YearPoint = {
  year: number;
  revenue: number;
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
  vasRevenue: number;
  fintechRevenue: number;
  adsRevenue: number;
  margin: number;
};

type MetricKey =
  | "revenue"
  | "grossProfit"
  | "operatingProfit"
  | "netProfit"
  | "vasRevenue"
  | "fintechRevenue"
  | "adsRevenue"
  | "margin";

type MetricDef = {
  key: MetricKey;
  label: string;
  unit: "CNYb" | "%";
  description: string;
};

const METRICS: MetricDef[] = [
  {
    key: "revenue",
    label: "Revenue",
    unit: "CNYb",
    description: "Total revenue (normalized across 2015–2024).",
  },
  {
    key: "grossProfit",
    label: "Gross profit",
    unit: "CNYb",
    description: "Revenue less cost of revenue.",
  },
  {
    key: "operatingProfit",
    label: "Operating profit",
    unit: "CNYb",
    description: "Operating profit (IFRS).",
  },
  {
    key: "netProfit",
    label: "Net profit (IFRS)",
    unit: "CNYb",
    description: "Profit attributable to equity holders.",
  },
  {
    key: "margin",
    label: "Operating margin",
    unit: "%",
    description: "Operating profit / revenue.",
  },
  {
    key: "vasRevenue",
    label: "VAS revenue",
    unit: "CNYb",
    description: "Value-added services segment revenue.",
  },
  {
    key: "fintechRevenue",
    label: "FinTech & Business Services revenue",
    unit: "CNYb",
    description: "FinTech & Business Services segment revenue.",
  },
  {
    key: "adsRevenue",
    label: "Online advertising revenue",
    unit: "CNYb",
    description: "Advertising segment revenue.",
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatCNYb(v: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(v);
}

function formatPct(v: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(v)}%`;
}

function computeYoY(series: YearPoint[], key: MetricKey) {
  const out: Array<YearPoint & { yoy?: number }> = series.map((p) => ({ ...p }));
  for (let i = 1; i < out.length; i++) {
    const prev = (out[i - 1] as any)[key] as number;
    const cur = (out[i] as any)[key] as number;
    if (prev === 0) continue;
    (out[i] as any).yoy = ((cur - prev) / Math.abs(prev)) * 100;
  }
  return out;
}

function evalFormula(expr: string, ctx: Record<string, number>) {
  const safe = expr
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[^0-9a-zA-Z_+\-*/().,% ]/g, "");

  const replaced = safe.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (token) => {
    if (Object.prototype.hasOwnProperty.call(ctx, token)) return String(ctx[token]);
    return "NaN";
  });

  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${replaced});`);
  const v = fn();
  return typeof v === "number" && Number.isFinite(v) ? v : NaN;
}

function calcSeries(series: YearPoint[], formula: string) {
  return series.map((p) => {
    const v = evalFormula(formula, {
      revenue: p.revenue,
      grossProfit: p.grossProfit,
      operatingProfit: p.operatingProfit,
      netProfit: p.netProfit,
      vasRevenue: p.vasRevenue,
      fintechRevenue: p.fintechRevenue,
      adsRevenue: p.adsRevenue,
      margin: p.margin,
    });
    return { year: p.year, value: v };
  });
}

function SparklineHeader({ title, subtitle, lang, setLang }: { title: string; subtitle: string; lang: "en" | "zh"; setLang: (l: "en" | "zh") => void }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="space-y-1">
        <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {subtitle}
        </div>
        <h1 className="tfi-title text-3xl sm:text-4xl leading-[1.05]">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="shadow-sm tfi-mono text-xs h-8"
          onClick={() => setLang(lang === "en" ? "zh" : "en")}
          data-testid="button-language-switch"
        >
          {lang === "en" ? "中文 (简体)" : "English"}
        </Button>
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="shadow-sm h-8"
            data-testid="button-open-reports"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            {lang === "en" ? "Reports (2015–2024)" : "年度报告 (2015–2024)"}
          </Button>
          <Button size="sm" className="shadow-sm h-8" data-testid="button-upload-report">
            <FileUp className="mr-2 h-4 w-4" />
            {lang === "en" ? "Upload 2025+" : "上传 2025+"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TopNav({ active, onChange, lang }: { active: string; onChange: (id: string) => void; lang: "en" | "zh" }) {
  const items = [
    { id: "overview", label: lang === "en" ? "Overview" : "总览" },
    { id: "financials", label: lang === "en" ? "Financials" : "财务报表" },
    { id: "trends", label: lang === "en" ? "Trends" : "趋势分析" },
    { id: "calculations", label: lang === "en" ? "Calculations" : "自定义计算" },
    { id: "qa", label: lang === "en" ? "Q&A" : "智能问答" },
  ];

  return (
    <div className="flex items-center gap-2">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          data-testid={`tab-${it.id}`}
          onClick={() => onChange(it.id)}
          className={
            "relative rounded-full px-3.5 py-2 text-sm transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/40 " +
            (active === it.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card/60 text-foreground border border-card-border hover-elevate")
          }
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  trend,
  lang,
}: {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "flat";
  lang: "en" | "zh";
}) {
  const displayLabel = useMemo(() => {
    if (lang === "zh") {
      if (label === "Revenue") return "总收入";
      if (label === "Operating profit") return "经营利润";
      if (label === "FinTech") return "金融科技";
      if (label === "Online ads") return "网络广告";
    }
    return label;
  }, [label, lang]);

  return (
    <Card className="border-card-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="tfi-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {displayLabel}
            </div>
            <div className="mt-1 text-2xl font-semibold" data-testid={`text-${label.toLowerCase().replace(/\s+/g, "-")}`}>
              {value}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
          </div>

          <div
            className={
              "flex h-9 w-9 items-center justify-center rounded-full border " +
              (trend === "up"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                : trend === "down"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-600"
                  : "border-border bg-muted text-muted-foreground")
            }
            aria-hidden
          >
            <ArrowUpRight className={"h-4 w-4 " + (trend === "down" ? "rotate-90" : "")}></ArrowUpRight>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TerminalCard({
  children,
  title,
  icon,
  right,
}: {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <Card className="border-card-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-md">
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 border border-border">
              {icon}
            </span>
            <div>
              <div className="text-sm font-semibold" data-testid={`text-section-${title.toLowerCase().replace(/\s+/g, "-")}`}>
                {title}
              </div>
              <div className="tfi-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Tencent • 2015–2024
              </div>
            </div>
          </div>
          {right}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [active, setActive] = useState("overview");
  const [metric, setMetric] = useState<MetricKey>("revenue");
  const [range, setRange] = useState<[number, number]>([2015, 2024]);
  const [chartMode, setChartMode] = useState<"level" | "yoy">("level");

  const [formulaName, setFormulaName] = useState("Custom metric");
  const [formulaExpr, setFormulaExpr] = useState("(operatingProfit / revenue) * 100");

  const seriesAll: YearPoint[] = useMemo(() => {
    // Mock, plausible series for UI prototyping only.
    const base: YearPoint[] = [
      { year: 2015, revenue: 102.9, grossProfit: 58.1, operatingProfit: 32.6, netProfit: 28.8, vasRevenue: 59.7, fintechRevenue: 10.7, adsRevenue: 17.5, margin: 31.7 },
      { year: 2016, revenue: 151.9, grossProfit: 85.0, operatingProfit: 50.0, netProfit: 41.0, vasRevenue: 84.1, fintechRevenue: 21.0, adsRevenue: 26.9, margin: 32.9 },
      { year: 2017, revenue: 237.8, grossProfit: 124.3, operatingProfit: 67.7, netProfit: 71.6, vasRevenue: 154.0, fintechRevenue: 38.2, adsRevenue: 35.0, margin: 28.5 },
      { year: 2018, revenue: 312.7, grossProfit: 140.8, operatingProfit: 79.2, netProfit: 78.7, vasRevenue: 176.6, fintechRevenue: 72.5, adsRevenue: 58.1, margin: 25.3 },
      { year: 2019, revenue: 377.3, grossProfit: 167.9, operatingProfit: 98.2, netProfit: 94.4, vasRevenue: 184.7, fintechRevenue: 101.4, adsRevenue: 68.4, margin: 26.0 },
      { year: 2020, revenue: 482.1, grossProfit: 221.5, operatingProfit: 152.2, netProfit: 159.8, vasRevenue: 264.2, fintechRevenue: 128.0, adsRevenue: 82.2, margin: 31.6 },
      { year: 2021, revenue: 560.1, grossProfit: 250.0, operatingProfit: 190.0, netProfit: 224.8, vasRevenue: 291.6, fintechRevenue: 172.2, adsRevenue: 88.7, margin: 33.9 },
      { year: 2022, revenue: 554.6, grossProfit: 245.0, operatingProfit: 184.0, netProfit: 115.6, vasRevenue: 319.0, fintechRevenue: 177.7, adsRevenue: 82.8, margin: 33.2 },
      { year: 2023, revenue: 609.0, grossProfit: 282.0, operatingProfit: 193.0, netProfit: 157.7, vasRevenue: 333.2, fintechRevenue: 203.6, adsRevenue: 101.5, margin: 31.7 },
      { year: 2024, revenue: 660.0, grossProfit: 310.0, operatingProfit: 215.0, netProfit: 175.0, vasRevenue: 352.0, fintechRevenue: 225.0, adsRevenue: 112.0, margin: 32.6 },
    ];

    return base;
  }, []);

  const series = useMemo(() => {
    const [a, b] = range;
    return seriesAll.filter((p) => p.year >= a && p.year <= b);
  }, [range, seriesAll]);

  const metricDef = useMemo(() => METRICS.find((m) => m.key === metric)!, [metric]);

  const chartData = useMemo(() => {
    if (chartMode === "yoy") {
      const withYoY = computeYoY(series, metric);
      return withYoY.map((p) => ({ year: p.year, value: (p as any).yoy ?? null }));
    }

    return series.map((p) => ({ year: p.year, value: (p as any)[metric] as number }));
  }, [chartMode, metric, series]);

  const customSeries = useMemo(() => calcSeries(series, formulaExpr), [series, formulaExpr]);

  const last = series[series.length - 1];
  const first = series[0];
  const revDelta = ((last.revenue - first.revenue) / first.revenue) * 100;

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.55] tfi-grid" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] tfi-noise" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/20 via-primary/10 to-transparent blur-3xl" />

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-6">
          <SparklineHeader
            title={lang === "en" ? "Tencent Financial Intelligence" : "腾讯金融情报"}
            subtitle={lang === "en" ? "Preloaded annual reports • grounded metrics • analyst-grade tooling" : "预载年度报告 • 落地指标 • 分析师级工具"}
            lang={lang}
            setLang={setLang}
          />

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="rounded-2xl border border-card-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55 shadow-sm px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={lang === "en" ? "Search metrics, segments, or ask a question…" : "搜索指标、业务板块或提问..."}
                    className="h-9 w-[260px] md:w-[340px] bg-transparent"
                    data-testid="input-global-search"
                  />
                </div>

                <Separator orientation="vertical" className="hidden md:block h-6" />

                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={`${range[0]}-${range[1]}`}
                    onValueChange={(v) => {
                      const [a, b] = v.split("-").map((x) => Number(x));
                      setRange([a, b]);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[160px]" data-testid="select-time-range">
                      <SelectValue placeholder={lang === "en" ? "Time range" : "时间范围"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2015-2024" data-testid="option-range-2015-2024">
                        2015–2024
                      </SelectItem>
                      <SelectItem value="2018-2024" data-testid="option-range-2018-2024">
                        2018–2024
                      </SelectItem>
                      <SelectItem value="2020-2024" data-testid="option-range-2020-2024">
                        2020–2024
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <button
                    type="button"
                    className="ml-1 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-2 text-sm hover-elevate"
                    onClick={() => setChartMode((m) => (m === "level" ? "yoy" : "level"))}
                    data-testid="button-toggle-yoy"
                  >
                    <LineChart className="h-4 w-4" />
                    {chartMode === "level" ? (lang === "en" ? "Level" : "数值") : (lang === "en" ? "YoY" : "同比")}
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </button>
                </div>

                <div className="ml-auto hidden lg:flex items-center gap-2">
                  <span className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {lang === "en" ? "Source integrity" : "数据合规"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {lang === "en" ? "Page-referenced" : "源文件追溯"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <Button variant="secondary" className="flex-1" data-testid="button-open-reports-mobile">
                <BookOpen className="mr-2 h-4 w-4" />
                Reports
              </Button>
              <Button className="flex-1" data-testid="button-upload-report-mobile">
                <FileUp className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            <div className="hidden md:block">
              <TopNav active={active} onChange={setActive} lang={lang} />
              <div className="sr-only" aria-live="polite" data-testid="status-active-tab">
                {active}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Revenue"
              value={`${formatCNYb(last.revenue)}B`}
              sub={lang === "en" ? `${revDelta >= 0 ? "+" : ""}${formatPct(revDelta)} since ${first.year}` : `${revDelta >= 0 ? "+" : ""}${formatPct(revDelta)} 自 ${first.year}`}
              trend={revDelta >= 0 ? "up" : "down"}
              lang={lang}
            />
            <StatCard
              label="Operating profit"
              value={`${formatCNYb(last.operatingProfit)}B`}
              sub={lang === "en" ? `Margin ${formatPct(last.margin)}` : `利润率 ${formatPct(last.margin)}`}
              trend="up"
              lang={lang}
            />
            <StatCard
              label="FinTech"
              value={`${formatCNYb(last.fintechRevenue)}B`}
              sub={lang === "en" ? `Segment scale • ${range[0]}–${range[1]}` : `业务规模 • ${range[0]}–${range[1]}`}
              trend="up"
              lang={lang}
            />
            <StatCard
              label="Online ads"
              value={lang === "en" ? `${formatCNYb(last.adsRevenue)}B` : `${formatCNYb(last.adsRevenue)}B`}
              sub={lang === "en" ? `Mix shift tracking` : `结构变化追踪`}
              trend="flat"
              lang={lang}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-14">
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="hidden" />

          <TabsContent value="overview" className="mt-6 space-y-4">
            <TerminalCard
              title={lang === "en" ? "Long-term performance" : "长期业绩表现"}
              icon={<LineChart className="h-4 w-4" />}
              right={
                <div className="flex items-center gap-2">
                  <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
                    <SelectTrigger className="h-9 w-[220px]" data-testid="select-metric">
                      <SelectValue placeholder={lang === "en" ? "Metric" : "指标"} />
                    </SelectTrigger>
                    <SelectContent>
                      {METRICS.map((m) => (
                        <SelectItem
                          key={m.key}
                          value={m.key}
                          data-testid={`option-metric-${m.key}`}
                        >
                          {lang === "en" ? m.label : (
                            m.key === "revenue" ? "总收入" :
                            m.key === "grossProfit" ? "毛利润" :
                            m.key === "operatingProfit" ? "经营利润" :
                            m.key === "netProfit" ? "净利润" :
                            m.key === "margin" ? "经营利润率" :
                            m.key === "vasRevenue" ? "增值服务收入" :
                            m.key === "fintechRevenue" ? "金融科技收入" :
                            m.key === "adsRevenue" ? "广告收入" : m.label
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              }
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 rounded-2xl border border-border bg-muted/20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-medium" data-testid="text-chart-title">
                        {lang === "en" ? metricDef.label : (
                          metricDef.key === "revenue" ? "总收入" :
                          metricDef.key === "grossProfit" ? "毛利润" :
                          metricDef.key === "operatingProfit" ? "经营利润" :
                          metricDef.key === "netProfit" ? "净利润" :
                          metricDef.key === "margin" ? "经营利润率" :
                          metricDef.key === "vasRevenue" ? "增值服务收入" :
                          metricDef.key === "fintechRevenue" ? "金融科技收入" :
                          metricDef.key === "adsRevenue" ? "广告收入" : metricDef.label
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid="text-chart-subtitle">
                        {chartMode === "yoy" ? (lang === "en" ? "Year-over-year growth" : "同比增长") : (lang === "en" ? "Level" : "数值")} • {range[0]}–{range[1]}
                      </div>
                    </div>
                    <div className="tfi-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground" data-testid="text-chart-unit">
                      {chartMode === "yoy" ? "%" : (lang === "en" ? metricDef.unit : (metricDef.unit === "CNYb" ? "十亿人民币" : "%"))}
                    </div>
                  </div>
                  <div className="h-[320px] px-2 pb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 12, right: 18, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="tfiGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                            <stop offset="65%" stopColor="hsl(var(--primary))" stopOpacity={0.08} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border) / 0.7)" />
                        <XAxis
                          dataKey="year"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          width={40}
                        />
                        <Tooltip
                          cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                          content={({ active: a, payload, label }) => {
                            if (!a || !payload?.length) return null;
                            const v = payload[0]?.value as number;
                            const formatted =
                              chartMode === "yoy"
                                ? v == null
                                  ? "—"
                                  : `${formatPct(v)}`
                                : metricDef.unit === "%"
                                  ? formatPct(v)
                                  : `${formatCNYb(v)}B`;
                            return (
                              <div className="rounded-xl border border-border bg-card/95 px-3 py-2 shadow-lg">
                                <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                  {label}
                                </div>
                                <div className="mt-0.5 text-sm font-semibold" data-testid={`text-tooltip-${label}`}>
                                  {formatted}
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill="url(#tfiGrad)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-3">
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      What you get
                    </div>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li className="flex items-start gap-2" data-testid="text-feature-1">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                        Canonical metric dictionary (income, balance sheet, segments, liquidity)
                      </li>
                      <li className="flex items-start gap-2" data-testid="text-feature-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                        Longitudinal charts with level + YoY modes
                      </li>
                      <li className="flex items-start gap-2" data-testid="text-feature-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                        Custom calculations that recompute across years
                      </li>
                      <li className="flex items-start gap-2" data-testid="text-feature-4">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                        Answers grounded in official filings with traceable citations
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Metric notes
                    </div>
                    <div className="mt-2 text-sm" data-testid="text-metric-description">
                      {metricDef.description}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-2 text-sm hover-elevate"
                        data-testid="button-view-sources"
                      >
                        <BookOpen className="h-4 w-4" />
                        View sources
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-2 text-sm hover-elevate"
                        data-testid="button-compare-metrics"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Compare
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TerminalCard>
          </TabsContent>

          <TabsContent value="financials" className="mt-6 space-y-4">
            <TerminalCard title="Financial statements" icon={<BookOpen className="h-4 w-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { title: "Income statement", desc: "Revenue, gross profit, operating profit, IFRS vs non-IFRS." },
                  { title: "Balance sheet", desc: "Assets, liabilities, equity with normalized line items." },
                  { title: "Segment performance", desc: "VAS, FinTech, Ads with mix and margin context." },
                  { title: "Liquidity", desc: "Cash, deposits, borrowings, net cash dynamics." },
                ].map((c, idx) => (
                  <div
                    key={c.title}
                    className="rounded-2xl border border-border bg-muted/20 p-4 hover-elevate"
                    data-testid={`card-financial-${idx}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold" data-testid={`text-financial-title-${idx}`}>
                        {c.title}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:opacity-90"
                        data-testid={`button-open-financial-${idx}`}
                      >
                        Open
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground" data-testid={`text-financial-desc-${idx}`}>
                      {c.desc}
                    </div>
                  </div>
                ))}
              </div>
            </TerminalCard>
          </TabsContent>

          <TabsContent value="trends" className="mt-6 space-y-4">
            <TerminalCard title="Trend builder" icon={<SlidersHorizontal className="h-4 w-4" />}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Configure
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Metric</div>
                      <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
                        <SelectTrigger className="h-10" data-testid="select-trends-metric">
                          <SelectValue placeholder="Choose metric" />
                        </SelectTrigger>
                        <SelectContent>
                          {METRICS.map((m) => (
                            <SelectItem
                              key={m.key}
                              value={m.key}
                              data-testid={`option-trends-metric-${m.key}`}
                            >
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Chart style</div>
                      <Select value={chartMode} onValueChange={(v) => setChartMode(v as any)}>
                        <SelectTrigger className="h-10" data-testid="select-trends-mode">
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="level" data-testid="option-trends-mode-level">
                            Level
                          </SelectItem>
                          <SelectItem value="yoy" data-testid="option-trends-mode-yoy">
                            YoY growth
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 rounded-2xl border border-border bg-muted/20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm font-medium" data-testid="text-trends-preview-title">
                      Preview
                    </div>
                    <div className="tfi-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground" data-testid="text-trends-preview-meta">
                      {metricDef.unit} • {range[0]}–{range[1]}
                    </div>
                  </div>
                  <div className="h-[300px] px-2 pb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 12, right: 18, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="tfiGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.55} />
                            <stop offset="70%" stopColor="hsl(var(--accent))" stopOpacity={0.14} />
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border) / 0.7)" />
                        <XAxis
                          dataKey="year"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          width={40}
                        />
                        <Tooltip
                          cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                          content={({ active: a, payload, label }) => {
                            if (!a || !payload?.length) return null;
                            const v = payload[0]?.value as number;
                            const formatted =
                              chartMode === "yoy"
                                ? v == null
                                  ? "—"
                                  : `${formatPct(v)}`
                                : metricDef.unit === "%"
                                  ? formatPct(v)
                                  : `${formatCNYb(v)}B`;
                            return (
                              <div className="rounded-xl border border-border bg-card/95 px-3 py-2 shadow-lg">
                                <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                  {label}
                                </div>
                                <div className="mt-0.5 text-sm font-semibold" data-testid={`text-tooltip-trends-${label}`}>
                                  {formatted}
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          fill="url(#tfiGrad2)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TerminalCard>
          </TabsContent>

          <TabsContent value="calculations" className="mt-6 space-y-4">
            <TerminalCard title="Custom calculations" icon={<Calculator className="h-4 w-4" />}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Formula builder
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Name</div>
                      <Input
                        value={formulaName}
                        onChange={(e) => setFormulaName(e.target.value)}
                        className="h-10"
                        data-testid="input-formula-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Expression</div>
                      <Input
                        value={formulaExpr}
                        onChange={(e) => setFormulaExpr(e.target.value)}
                        className="h-10 tfi-mono"
                        data-testid="input-formula-expr"
                      />
                      <div className="text-sm text-muted-foreground" data-testid="text-formula-hint">
                        Use metric keys like <span className="tfi-mono">revenue</span>, <span className="tfi-mono">operatingProfit</span>, <span className="tfi-mono">vasRevenue</span>.
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card/60 p-3">
                      <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Available keys
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {["revenue", "grossProfit", "operatingProfit", "netProfit", "vasRevenue", "fintechRevenue", "adsRevenue", "margin"].map(
                          (k) => (
                            <button
                              key={k}
                              type="button"
                              className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm tfi-mono hover-elevate"
                              onClick={() => setFormulaExpr((s) => (s.trim().length ? `${s} ${k}` : k))}
                              data-testid={`button-insert-key-${k}`}
                            >
                              {k}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 rounded-2xl border border-border bg-muted/20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-medium" data-testid="text-custom-metric-title">
                        {formulaName}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid="text-custom-metric-subtitle">
                        Recomputed across years • {range[0]}–{range[1]}
                      </div>
                    </div>
                    <div className="tfi-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground" data-testid="text-custom-metric-expr">
                      {formulaExpr}
                    </div>
                  </div>
                  <div className="h-[300px] px-2 pb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={customSeries} margin={{ top: 12, right: 18, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="tfiGrad3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.5} />
                            <stop offset="75%" stopColor="hsl(var(--chart-2))" stopOpacity={0.12} />
                            <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border) / 0.7)" />
                        <XAxis
                          dataKey="year"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          width={40}
                        />
                        <Tooltip
                          cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                          content={({ active: a, payload, label }) => {
                            if (!a || !payload?.length) return null;
                            const v = payload[0]?.value as number;
                            const formatted = Number.isFinite(v) ? formatPct(v) : "—";
                            return (
                              <div className="rounded-xl border border-border bg-card/95 px-3 py-2 shadow-lg">
                                <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                  {label}
                                </div>
                                <div className="mt-0.5 text-sm font-semibold" data-testid={`text-tooltip-calc-${label}`}>
                                  {formatted}
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          fill="url(#tfiGrad3)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TerminalCard>
          </TabsContent>

          <TabsContent value="qa" className="mt-6 space-y-4">
            <TerminalCard title="AI analysis & Q&A" icon={<MessageSquare className="h-4 w-4" />}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Ask a question
                  </div>
                  <div className="mt-3 space-y-2">
                    <Input
                      placeholder='e.g., "What drove margin expansion after 2020?"'
                      className="h-10"
                      data-testid="input-question"
                    />
                    <Button className="w-full" data-testid="button-ask-question">
                      Ask
                    </Button>
                    <div className="text-sm text-muted-foreground" data-testid="text-qa-note">
                      Prototype note: answers are mocked in UI; v1 will ground responses in filings + extracted metrics.
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Pre-generated analysis
                  </div>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed" data-testid="text-analysis">
                    <p>
                      From 2015–2024, Tencent’s revenue base expanded materially, driven by scale in value-added services and a
                      growing contribution from FinTech & Business Services. Operating margins tightened during the investment
                      cycle in 2018–2019, then recovered as monetization improved and cost discipline increased post-2020.
                    </p>
                    <p>
                      Segment mix shifts are visible in the growing FinTech line versus the more mature advertising profile.
                      Use the trend builder to compare YoY growth across segments and validate inflection points.
                    </p>
                    <div className="mt-4 rounded-2xl border border-border bg-card/60 p-3">
                      <div className="flex items-center gap-2 text-sm font-semibold" data-testid="text-citation-title">
                        <BookOpen className="h-4 w-4" />
                        Source traceability
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground" data-testid="text-citation-desc">
                        Each metric and claim will be linked back to the exact page/table in the annual report.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TerminalCard>
          </TabsContent>
        </Tabs>

        <div className="mt-10 flex items-center justify-between">
          <div className="tfi-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground" data-testid="text-footer-meta">
            Tencent Financial Intelligence • v1 prototype • Tencent-only (2015–2024)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-2 text-sm hover-elevate"
              data-testid="button-open-changelog"
            >
              <Calculator className="h-4 w-4" />
              Model notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
