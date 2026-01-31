import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BookOpen,
  FileUp,
  MessageSquare,
  Send,
  Table as TableIcon,
  LineChart as ChartIcon,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MetricKey =
  | "revenue"
  | "grossProfit"
  | "operatingProfit"
  | "netProfit"
  | "vasRevenue"
  | "fintechRevenue"
  | "adsRevenue";

const METRICS_META: Record<MetricKey, { label: string; color: string; zh: string }> = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))", zh: "总收入" },
  grossProfit: { label: "Gross Profit", color: "hsl(var(--chart-2))", zh: "毛利润" },
  operatingProfit: { label: "Operating Profit", color: "hsl(var(--chart-3))", zh: "经营利润" },
  netProfit: { label: "Net Profit", color: "hsl(var(--chart-4))", zh: "净利润" },
  vasRevenue: { label: "VAS Revenue", color: "hsl(var(--chart-5))", zh: "增值服务收入" },
  fintechRevenue: { label: "FinTech Revenue", color: "#10b981", zh: "金融科技收入" },
  adsRevenue: { label: "Ads Revenue", color: "#f59e0b", zh: "广告收入" },
};

const DATA = [
  { year: 2015, revenue: 102.9, grossProfit: 58.1, operatingProfit: 32.6, netProfit: 28.8, vasRevenue: 59.7, fintechRevenue: 10.7, adsRevenue: 17.5 },
  { year: 2016, revenue: 151.9, grossProfit: 85.0, operatingProfit: 50.0, netProfit: 41.0, vasRevenue: 84.1, fintechRevenue: 21.0, adsRevenue: 26.9 },
  { year: 2017, revenue: 237.8, grossProfit: 124.3, operatingProfit: 67.7, netProfit: 71.6, vasRevenue: 154.0, fintechRevenue: 38.2, adsRevenue: 35.0 },
  { year: 2018, revenue: 312.7, grossProfit: 140.8, operatingProfit: 79.2, netProfit: 78.7, vasRevenue: 176.6, fintechRevenue: 72.5, adsRevenue: 58.1 },
  { year: 2019, revenue: 377.3, grossProfit: 167.9, operatingProfit: 98.2, netProfit: 94.4, vasRevenue: 184.7, fintechRevenue: 101.4, adsRevenue: 68.4 },
  { year: 2020, revenue: 482.1, grossProfit: 221.5, operatingProfit: 152.2, netProfit: 159.8, vasRevenue: 264.2, fintechRevenue: 128.0, adsRevenue: 82.2 },
  { year: 2021, revenue: 560.1, grossProfit: 250.0, operatingProfit: 190.0, netProfit: 224.8, vasRevenue: 291.6, fintechRevenue: 172.2, adsRevenue: 88.7 },
  { year: 2022, revenue: 554.6, grossProfit: 245.0, operatingProfit: 184.0, netProfit: 115.6, vasRevenue: 319.0, fintechRevenue: 177.7, adsRevenue: 82.8 },
  { year: 2023, revenue: 609.0, grossProfit: 282.0, operatingProfit: 193.0, netProfit: 157.7, vasRevenue: 333.2, fintechRevenue: 203.6, adsRevenue: 101.5 },
  { year: 2024, revenue: 660.0, grossProfit: 310.0, operatingProfit: 215.0, netProfit: 175.0, vasRevenue: 352.0, fintechRevenue: 225.0, adsRevenue: 112.0 },
];

export default function Dashboard() {
  const [page, setPage] = useState<1 | 2>(1);
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(["revenue"]);
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2024]);
  const [plotMode, setPlotMode] = useState<"level" | "yoy">("level");
  const [plotType, setPlotType] = useState<"line" | "bar">("line");
  const [chatInput, setChatInput] = useState("");

  const filteredData = useMemo(() => {
    const base = DATA.filter((d) => d.year >= yearRange[0] && d.year <= yearRange[1]);
    if (plotMode === "yoy") {
      return base.map((d, i, arr) => {
        if (i === 0) {
          const prevYearData = DATA.find(prev => prev.year === d.year - 1);
          if (!prevYearData) return { ...d, isYoY: true };
          const res: any = { year: d.year, isYoY: true };
          selectedMetrics.forEach(m => {
             res[m] = ((d[m] - prevYearData[m]) / prevYearData[m]) * 100;
          });
          return res;
        }
        const prev = arr[i - 1];
        const res: any = { year: d.year, isYoY: true };
        selectedMetrics.forEach(m => {
          res[m] = ((d[m] - prev[m]) / prev[m]) * 100;
        });
        return res;
      });
    }
    return base;
  }, [yearRange, plotMode, selectedMetrics]);

  const t = (en: string, zh: string) => (lang === "en" ? en : zh);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Section */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="tfi-title text-xl font-bold tracking-tight">
              {t("Tencent Financial Intelligence", "腾讯金融情报")}
            </h1>
            <nav className="hidden md:flex items-center ml-8 gap-1">
              <Button 
                variant={page === 1 ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setPage(1)}
                className="rounded-full px-4"
              >
                {t("Visualization", "可视化")}
              </Button>
              <Button 
                variant={page === 2 ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setPage(2)}
                className="rounded-full px-4"
              >
                {t("Data Table", "数据表格")}
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="tfi-mono text-[10px]"
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
            >
              {lang === "en" ? "ZH" : "EN"}
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <BookOpen className="w-4 h-4 mr-2" />
              {t("Reports", "报告")}
            </Button>
            <Button size="sm" className="hidden sm:flex">
              <FileUp className="w-4 h-4 mr-2" />
              {t("Upload", "上传")}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">
        {page === 1 ? (
          <>
            {/* Page 1: Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Setup */}
              <aside className="lg:col-span-4 space-y-6">
                <Card className="p-5 space-y-6 shadow-sm border-muted-border bg-card/40 backdrop-blur-sm">
                  <div className="space-y-4">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground tfi-mono">
                      {t("Metrics Selection", "指标选择")}
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(METRICS_META) as MetricKey[]).map((m) => (
                        <div key={m} className="flex items-center space-x-2">
                          <Checkbox
                            id={m}
                            checked={selectedMetrics.includes(m)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedMetrics([...selectedMetrics, m]);
                              else setSelectedMetrics(selectedMetrics.filter((sm) => sm !== m));
                            }}
                          />
                          <Label htmlFor={m} className="text-sm cursor-pointer flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: METRICS_META[m].color }} />
                            {t(METRICS_META[m].label, METRICS_META[m].zh)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground tfi-mono">
                      {t("Configuration", "配置")}
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs">{t("Year Range", "年份范围")}</Label>
                        <div className="flex gap-2">
                          <Select
                            value={String(yearRange[0])}
                            onValueChange={(v) => setYearRange([Number(v), yearRange[1]])}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DATA.map((d) => (
                                <SelectItem key={d.year} value={String(d.year)}>
                                  {d.year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={String(yearRange[1])}
                            onValueChange={(v) => setYearRange([yearRange[0], Number(v)])}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DATA.map((d) => (
                                <SelectItem key={d.year} value={String(d.year)}>
                                  {d.year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">{t("Plot Mode", "图表模式")}</Label>
                        <Select value={plotMode} onValueChange={(v: any) => setPlotMode(v)}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="level">{t("Level Plot", "数值图")}</SelectItem>
                            <SelectItem value="yoy">{t("YoY Growth", "同比增长")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">{t("Chart Type", "图表类型")}</Label>
                        <Select value={plotType} onValueChange={(v: any) => setPlotType(v)}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="line">{t("Line Plot", "折线图")}</SelectItem>
                            <SelectItem value="bar">{t("Bar Plot", "柱状图")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              </aside>

              {/* Right Side: View */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="p-6 h-[500px] shadow-md bg-card/60 backdrop-blur-sm border-card-border">
                  <ResponsiveContainer width="100%" height="100%">
                    {plotType === "line" ? (
                      <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderRadius: "12px",
                            border: "1px solid hsl(var(--border))",
                            boxShadow: "var(--shadow-lg)",
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        {selectedMetrics.map((m) => (
                          <Line
                            key={m}
                            type="monotone"
                            dataKey={m}
                            name={t(METRICS_META[m].label, METRICS_META[m].zh)}
                            stroke={METRICS_META[m].color}
                            strokeWidth={3}
                            dot={{ r: 4, fill: METRICS_META[m].color, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                            animationDuration={1000}
                          />
                        ))}
                      </LineChart>
                    ) : (
                      <BarChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderRadius: "12px",
                            border: "1px solid hsl(var(--border))",
                            boxShadow: "var(--shadow-lg)",
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        {selectedMetrics.map((m) => (
                          <Bar
                            key={m}
                            dataKey={m}
                            name={t(METRICS_META[m].label, METRICS_META[m].zh)}
                            fill={METRICS_META[m].color}
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                          />
                        ))}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>

            {/* Bottom Section: Q&A */}
            <Card className="p-4 shadow-sm border-muted-border bg-card/40 backdrop-blur-sm">
              <div className="flex flex-col h-[200px]">
                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%]">
                      {t(
                        "Hello! I can help you analyze Tencent's financial reports. Ask me anything about margins, revenue growth, or segment details.",
                        "你好！我可以帮你分析腾讯的财务报告。你可以问我关于利润率、收入增长或分部详情的任何问题。"
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-2">
                  <Input
                    placeholder={t("Type your message...", "输入你的问题...")}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="rounded-full bg-background/50"
                  />
                  <Button size="icon" className="rounded-full shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : (
          /* Page 2: Table */
          <div className="space-y-6">
            {/* Top section: Filter setup */}
            <Card className="p-4 flex flex-wrap items-center gap-4 bg-card/40 backdrop-blur-sm border-muted-border shadow-sm">
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">{t("Years Range", "年份范围")}</Label>
                <div className="flex gap-2">
                   <Select value={String(yearRange[0])} onValueChange={(v) => setYearRange([Number(v), yearRange[1]])}>
                    <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>{DATA.map(d => <SelectItem key={d.year} value={String(d.year)}>{d.year}</SelectItem>)}</SelectContent>
                   </Select>
                   <span className="text-muted-foreground self-center">-</span>
                   <Select value={String(yearRange[1])} onValueChange={(v) => setYearRange([yearRange[0], Number(v)])}>
                    <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>{DATA.map(d => <SelectItem key={d.year} value={String(d.year)}>{d.year}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <Button variant="outline" size="sm" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                {t("Add Metric", "添加指标")}
              </Button>
              <div className="ml-auto text-xs text-muted-foreground tfi-mono">
                {t("Units: CNY Billion", "单位: 十亿人民币")}
              </div>
            </Card>

            {/* Middle to bottom section: Table */}
            <Card className="shadow-sm border-card-border overflow-hidden bg-card/60 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[100px] font-bold">{t("Metric", "指标")}</TableHead>
                      {DATA.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]).map(d => (
                        <TableHead key={d.year} className="text-right font-bold">{d.year}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Object.keys(METRICS_META) as MetricKey[]).map((m) => (
                      <TableRow key={m} className="hover:bg-muted/20">
                        <TableCell className="font-medium">
                          {t(METRICS_META[m].label, METRICS_META[m].zh)}
                        </TableCell>
                        {DATA.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]).map(d => (
                          <TableCell key={d.year} className="text-right tfi-mono">
                            {d[m].toFixed(1)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
      </main>

      <footer className="mt-auto p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest tfi-mono">
        {t("Tencent Financial Intelligence • Analyst Grade Tooling • v1", "腾讯金融情报 • 分析师级工具 • v1")}
      </footer>
    </div>
  );
}
