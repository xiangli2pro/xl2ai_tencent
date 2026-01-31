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
  | "profitBeforeTax"
  | "profitForYear"
  | "profitAttrEquity"
  | "totalCompIncome"
  | "totalCompIncomeAttrEquity"
  | "nonIfrsOperatingProfit"
  | "nonIfrsProfitAttrEquity"
  | "nonCurrentAssets"
  | "currentAssets"
  | "totalAssets"
  | "equityAttrEquity"
  | "nonControllingInterests"
  | "totalEquity"
  | "nonCurrentLiabilities"
  | "currentLiabilities"
  | "totalLiabilities"
  | "totalEquityLiabilities"
  | "costOfRevenues"
  | "sellingMarketingExpenses"
  | "generalAdminExpenses"
  | "otherGainsLosses"
  | "netGainsLossesInvestments"
  | "interestIncome"
  | "financeCosts"
  | "shareOfProfitLossAssociates"
  | "incomeTaxExpense"
  | "vasRevenue"
  | "marketingServicesRevenue"
  | "fintechRevenue"
  | "othersRevenue"
  | "vasGrossProfit"
  | "marketingServicesGrossProfit"
  | "fintechGrossProfit"
  | "othersGrossProfit"
  | "vasGrossMargin"
  | "marketingServicesGrossMargin"
  | "fintechGrossMargin"
  | "othersGrossMargin"
  | "cashCashEquivalents"
  | "termDepositsOthers"
  | "borrowings"
  | "notesPayable"
  | "netCash";

const METRICS_META: Record<MetricKey, { label: string; color: string; zh: string; category: string }> = {
  // Financial Summary - Income Statement
  revenue: { label: "Revenues", color: "hsl(var(--chart-1))", zh: "收入", category: "Income Statement" },
  grossProfit: { label: "Gross Profit", color: "hsl(var(--chart-2))", zh: "毛利", category: "Income Statement" },
  operatingProfit: { label: "Operating Profit", color: "hsl(var(--chart-3))", zh: "经营利润", category: "Income Statement" },
  profitBeforeTax: { label: "Profit Before Tax", color: "hsl(var(--chart-4))", zh: "除税前利润", category: "Income Statement" },
  profitForYear: { label: "Profit for the Year", color: "hsl(var(--chart-5))", zh: "年度利润", category: "Income Statement" },
  profitAttrEquity: { label: "Profit Attr. to Equity Holders", color: "#6366f1", zh: "权益持有人应占利润", category: "Income Statement" },
  totalCompIncome: { label: "Total Comprehensive Income", color: "#8b5cf6", zh: "年度全面收益总额", category: "Income Statement" },
  totalCompIncomeAttrEquity: { label: "Comp. Income Attr. to Equity Holders", color: "#a855f7", zh: "权益持有人应占全面收益总额", category: "Income Statement" },
  nonIfrsOperatingProfit: { label: "Non-IFRS Operating Profit", color: "#ec4899", zh: "非国际财务报告准则经营利润", category: "Income Statement" },
  nonIfrsProfitAttrEquity: { label: "Non-IFRS Profit Attr. to Equity Holders", color: "#f43f5e", zh: "非国际财务报告准则权益持有人应占利润", category: "Income Statement" },

  // Financial Position
  nonCurrentAssets: { label: "Non-current Assets", color: "#10b981", zh: "非流动资产", category: "Balance Sheet" },
  currentAssets: { label: "Current Assets", color: "#34d399", zh: "流动资产", category: "Balance Sheet" },
  totalAssets: { label: "Total Assets", color: "#059669", zh: "总资产", category: "Balance Sheet" },
  equityAttrEquity: { label: "Equity Attr. to Equity Holders", color: "#3b82f6", zh: "权益持有人应占权益", category: "Balance Sheet" },
  nonControllingInterests: { label: "Non-controlling Interests", color: "#60a5fa", zh: "非控制性权益", category: "Balance Sheet" },
  totalEquity: { label: "Total Equity", color: "#2563eb", zh: "总权益", category: "Balance Sheet" },
  nonCurrentLiabilities: { label: "Non-current Liabilities", color: "#ef4444", zh: "非流动负债", category: "Balance Sheet" },
  currentLiabilities: { label: "Current Liabilities", color: "#f87171", zh: "流动负债", category: "Balance Sheet" },
  totalLiabilities: { label: "Total Liabilities", color: "#dc2626", zh: "总负债", category: "Balance Sheet" },
  totalEquityLiabilities: { label: "Total Equity and Liabilities", color: "#991b1b", zh: "权益及负债总额", category: "Balance Sheet" },

  // MD&A
  costOfRevenues: { label: "Cost of Revenues", color: "#d97706", zh: "收入成本", category: "MD&A" },
  sellingMarketingExpenses: { label: "Selling & Marketing Expenses", color: "#f59e0b", zh: "销售及市场推广开支", category: "MD&A" },
  generalAdminExpenses: { label: "General & Admin Expenses", color: "#fbbf24", zh: "一般及行政开支", category: "MD&A" },
  otherGainsLosses: { label: "Other Gains/(Losses), Net", color: "#fb923c", zh: "其他收益/(亏损)净额", category: "MD&A" },
  netGainsLossesInvestments: { label: "Net Gains/(Losses) from Investments", color: "#f97316", zh: "投资及其他项的收益/(亏损)净额", category: "MD&A" },
  interestIncome: { label: "Interest Income", color: "#ea580c", zh: "利息收入", category: "MD&A" },
  financeCosts: { label: "Finance Costs", color: "#c2410c", zh: "财务成本", category: "MD&A" },
  shareOfProfitLossAssociates: { label: "Share of Profit/(Loss) of Associates", color: "#9a3412", zh: "应占联营公司及合营公司利润/(亏损)净额", category: "MD&A" },
  incomeTaxExpense: { label: "Income Tax Expense", color: "#7c2d12", zh: "所得税开支", category: "MD&A" },

  // Segments
  vasRevenue: { label: "VAS Revenue", color: "#8b5cf6", zh: "增值服务收入", category: "Segments" },
  marketingServicesRevenue: { label: "Marketing Services Revenue", color: "#a78bfa", zh: "网络广告收入", category: "Segments" },
  fintechRevenue: { label: "FinTech & Business Services", color: "#c4b5fd", zh: "金融科技及企业服务", category: "Segments" },
  othersRevenue: { label: "Others Revenue", color: "#ddd6fe", zh: "其他收入", category: "Segments" },
  vasGrossProfit: { label: "VAS Gross Profit", color: "#8b5cf6", zh: "增值服务毛利", category: "Segments" },
  marketingServicesGrossProfit: { label: "Marketing Services Gross Profit", color: "#a78bfa", zh: "网络广告毛利", category: "Segments" },
  fintechGrossProfit: { label: "FinTech Gross Profit", color: "#c4b5fd", zh: "金融科技及企业服务毛利", category: "Segments" },
  othersGrossProfit: { label: "Others Gross Profit", color: "#ddd6fe", zh: "其他毛利", category: "Segments" },
  vasGrossMargin: { label: "VAS Gross Margin", color: "#8b5cf6", zh: "增值服务毛利率", category: "Segments" },
  marketingServicesGrossMargin: { label: "Marketing Services Gross Margin", color: "#a78bfa", zh: "网络广告毛利率", category: "Segments" },
  fintechGrossMargin: { label: "FinTech Gross Margin", color: "#c4b5fd", zh: "金融科技及企业服务毛利率", category: "Segments" },
  othersGrossMargin: { label: "Others Gross Margin", color: "#ddd6fe", zh: "其他毛利率", category: "Segments" },

  // Liquidity
  cashCashEquivalents: { label: "Cash & Cash Equivalents", color: "#06b6d4", zh: "现金及现金等价物", category: "Liquidity" },
  termDepositsOthers: { label: "Term Deposits and Others", color: "#22d3ee", zh: "定期存款及其他", category: "Liquidity" },
  borrowings: { label: "Borrowings", color: "#0891b2", zh: "借款", category: "Liquidity" },
  notesPayable: { label: "Notes Payable", color: "#155e75", zh: "应付票据", category: "Liquidity" },
  netCash: { label: "Net Cash", color: "#0e7490", zh: "净现金", category: "Liquidity" },
};

const DATA = [
  { 
    year: 2024, 
    revenue: 660.0, grossProfit: 310.0, operatingProfit: 215.0, profitBeforeTax: 230.0, profitForYear: 185.0, profitAttrEquity: 175.0,
    totalCompIncome: 210.0, totalCompIncomeAttrEquity: 200.0, nonIfrsOperatingProfit: 225.0, nonIfrsProfitAttrEquity: 190.0,
    nonCurrentAssets: 1200.0, currentAssets: 650.0, totalAssets: 1850.0, equityAttrEquity: 950.0, nonControllingInterests: 80.0, 
    totalEquity: 1030.0, nonCurrentLiabilities: 450.0, currentLiabilities: 370.0, totalLiabilities: 820.0, totalEquityLiabilities: 1850.0,
    costOfRevenues: 350.0, sellingMarketingExpenses: 45.0, generalAdminExpenses: 110.0, otherGainsLosses: 35.0, netGainsLossesInvestments: 25.0,
    interestIncome: 12.0, financeCosts: 10.0, shareOfProfitLossAssociates: 15.0, incomeTaxExpense: 45.0,
    vasRevenue: 352.0, marketingServicesRevenue: 112.0, fintechRevenue: 225.0, othersRevenue: 15.0,
    vasGrossProfit: 185.0, marketingServicesGrossProfit: 55.0, fintechGrossProfit: 95.0, othersGrossProfit: 2.0,
    vasGrossMargin: 52.6, marketingServicesGrossMargin: 49.1, fintechGrossMargin: 42.2, othersGrossMargin: 13.3,
    cashCashEquivalents: 180.0, termDepositsOthers: 150.0, borrowings: 140.0, notesPayable: 120.0, netCash: 70.0
  },
  // Adding placeholders for other years based on growth patterns
  { 
    year: 2023, 
    revenue: 609.0, grossProfit: 282.0, operatingProfit: 193.0, profitBeforeTax: 205.0, profitForYear: 165.0, profitAttrEquity: 157.7,
    totalCompIncome: 180.0, totalCompIncomeAttrEquity: 170.0, nonIfrsOperatingProfit: 200.0, nonIfrsProfitAttrEquity: 170.0,
    nonCurrentAssets: 1150.0, currentAssets: 600.0, totalAssets: 1750.0, equityAttrEquity: 900.0, nonControllingInterests: 75.0, 
    totalEquity: 975.0, nonCurrentLiabilities: 420.0, currentLiabilities: 355.0, totalLiabilities: 775.0, totalEquityLiabilities: 1750.0,
    costOfRevenues: 327.0, sellingMarketingExpenses: 40.0, generalAdminExpenses: 105.0, otherGainsLosses: 30.0, netGainsLossesInvestments: 20.0,
    interestIncome: 10.0, financeCosts: 9.0, shareOfProfitLossAssociates: 12.0, incomeTaxExpense: 40.0,
    vasRevenue: 333.2, marketingServicesRevenue: 101.5, fintechRevenue: 203.6, othersRevenue: 12.0,
    vasGrossProfit: 175.0, marketingServicesGrossProfit: 48.0, fintechGrossProfit: 85.0, othersGrossProfit: 1.5,
    vasGrossMargin: 52.5, marketingServicesGrossMargin: 47.3, fintechGrossMargin: 41.8, othersGrossMargin: 12.5,
    cashCashEquivalents: 170.0, termDepositsOthers: 140.0, borrowings: 135.0, notesPayable: 115.0, netCash: 60.0
  },
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
    // Fill in mock data for years where we don't have full extraction yet to keep the UI interactive
    const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
    const fullData = years.map(y => {
      const existing = DATA.find(d => d.year === y);
      if (existing) return existing;
      
      // Calculate backward from 2023 with estimated -10% growth per year for the prototype
      const ref = DATA.find(d => d.year === 2023)!;
      const diff = 2023 - y;
      const factor = Math.pow(0.9, diff);
      
      const res: any = { year: y };
      (Object.keys(METRICS_META) as MetricKey[]).forEach(m => {
        if (m.includes("Margin")) res[m] = ref[m as keyof typeof ref] as number;
        else res[m] = (ref[m as keyof typeof ref] as number) * factor;
      });
      return res;
    });

    const base = fullData.filter((d) => d.year >= yearRange[0] && d.year <= yearRange[1]);
    if (plotMode === "yoy") {
      return base.map((d, i, arr) => {
        if (i === 0) {
          const prevYearData = fullData.find(prev => prev.year === d.year - 1);
          if (!prevYearData) return { ...d, isYoY: true };
          const res: any = { year: d.year, isYoY: true };
          selectedMetrics.forEach(m => {
             res[m] = ((d[m] - prevYearData[m]) / Math.abs(prevYearData[m] || 1)) * 100;
          });
          return res;
        }
        const prev = arr[i - 1];
        const res: any = { year: d.year, isYoY: true };
        selectedMetrics.forEach(m => {
          res[m] = ((d[m] - prev[m]) / Math.abs(prev[m] || 1)) * 100;
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
                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(
                        (Object.keys(METRICS_META) as MetricKey[]).reduce((acc, m) => {
                          const cat = METRICS_META[m].category;
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(m);
                          return acc;
                        }, {} as Record<string, MetricKey[]>)
                      ).map(([category, metrics]) => (
                        <div key={category} className="space-y-2 py-2">
                          <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter border-b border-muted pb-1">
                            {category}
                          </div>
                          {metrics.map((m) => (
                            <div key={m} className="flex items-center space-x-2">
                              <Checkbox
                                id={m}
                                checked={selectedMetrics.includes(m)}
                                onCheckedChange={(checked) => {
                                  if (checked) setSelectedMetrics([...selectedMetrics, m]);
                                  else setSelectedMetrics(selectedMetrics.filter((sm) => sm !== m));
                                }}
                              />
                              <Label htmlFor={m} className="text-xs cursor-pointer flex items-center gap-2 hover:text-primary transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: METRICS_META[m].color }} />
                                {t(METRICS_META[m].label, METRICS_META[m].zh)}
                              </Label>
                            </div>
                          ))}
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
