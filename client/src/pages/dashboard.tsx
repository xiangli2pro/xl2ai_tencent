import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, Cell, LabelList
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, Activity, 
  Download, Filter, Calendar, RefreshCw, ChevronRight, 
  ArrowUpRight, ArrowDownRight, Info, BookOpen, FileUp,
  LayoutDashboard, Table as TableIcon, Search, Send, User,
  Globe, Shield, Zap, Target, Plus, Trash2, MessageCircle, Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

const UNIT_BILLIONS = "B";
const UNIT_PERCENT = "%";

type MetricKey = keyof typeof METRICS;

const METRICS = {
  // Performance / Profitability
  revenue: { label: "Revenue", color: "#3b82f6", zh: "收入", category: "Performance" },
  grossProfit: { label: "Gross Profit", color: "#10b981", zh: "毛利", category: "Performance" },
  operatingProfit: { label: "Operating Profit", color: "#f59e0b", zh: "经营利润", category: "Performance" },
  profitBeforeTax: { label: "Profit Before Tax", color: "#8b5cf6", zh: "除税前利润", category: "Performance" },
  profitForYear: { label: "Profit for the Year", color: "#ec4899", zh: "年度利润", category: "Performance" },
  profitAttrEquity: { label: "Profit Attr. to Equity Holders", color: "#f43f5e", zh: "权益持有人应占利润", category: "Performance" },
  totalCompIncome: { label: "Total Comprehensive Income", color: "#fb7185", zh: "综合收益总额", category: "Performance" },
  totalCompIncomeAttrEquity: { label: "Total Comp. Income Attr. to Equity", color: "#f472b6", zh: "权益持有人应占综合收益总额", category: "Performance" },
  nonIfrsOperatingProfit: { label: "Non-IFRS Operating Profit", color: "#6366f1", zh: "非国际财务报告准则经营利润", category: "Performance" },
  nonIfrsProfitAttrEquity: { label: "Non-IFRS Profit Attr. to Equity", color: "#06b6d4", zh: "非国际财务报告准则权益持有人应占利润", category: "Performance" },

  // Balance Sheet
  nonCurrentAssets: { label: "Non-current Assets", color: "#14b8a6", zh: "非流动资产", category: "Balance Sheet" },
  currentAssets: { label: "Current Assets", color: "#2dd4bf", zh: "流动资产", category: "Balance Sheet" },
  totalAssets: { label: "Total Assets", color: "#0ea5e9", zh: "总资产", category: "Balance Sheet" },
  equityAttrEquity: { label: "Equity Attr. to Equity Holders", color: "#a78bfa", zh: "权益持有人应占权益", category: "Balance Sheet" },
  nonControllingInterests: { label: "Non-controlling Interests", color: "#c4b5fd", zh: "非控股权益", category: "Balance Sheet" },
  totalEquity: { label: "Total Equity", color: "#8b5cf6", zh: "总权益", category: "Balance Sheet" },
  nonCurrentLiabilities: { label: "Non-current Liabilities", color: "#f97316", zh: "非流动负债", category: "Balance Sheet" },
  currentLiabilities: { label: "Current Liabilities", color: "#fb7185", zh: "流动负债", category: "Balance Sheet" },
  totalLiabilities: { label: "Total Liabilities", color: "#ef4444", zh: "总负债", category: "Balance Sheet" },
  totalEquityLiabilities: { label: "Total Equity & Liabilities", color: "#f43f5e", zh: "权益及负债总额", category: "Balance Sheet" },

  // Costs / Income Statement Detail
  costOfRevenues: { label: "Cost of Revenues", color: "#60a5fa", zh: "收入成本", category: "Costs" },
  sellingMarketingExpenses: { label: "Selling & Marketing Expenses", color: "#34d399", zh: "销售及市场推广开支", category: "Costs" },
  generalAdminExpenses: { label: "General & Administrative Expenses", color: "#fbbf24", zh: "一般及行政开支", category: "Costs" },
  otherGainsLosses: { label: "Other Gains / (Losses)", color: "#a78bfa", zh: "其他收益/(亏损)", category: "Costs" },
  netGainsLossesInvestments: { label: "Net Gains / (Losses) on Investments", color: "#fb7185", zh: "投资净收益/(亏损)", category: "Costs" },
  interestIncome: { label: "Interest Income", color: "#22d3ee", zh: "利息收入", category: "Costs" },
  financeCosts: { label: "Finance Costs", color: "#38bdf8", zh: "财务成本", category: "Costs" },
  shareOfProfitLossAssociates: { label: "Share of Profit/(Loss) of Associates", color: "#93c5fd", zh: "应占联营公司利润/(亏损)", category: "Costs" },
  incomeTaxExpense: { label: "Income Tax Expense", color: "#f87171", zh: "所得税开支", category: "Costs" },

  // Segment Revenue
  vasRevenue: { label: "VAS Revenue", color: "#3b82f6", zh: "增值服务收入", category: "Segments" },
  marketingServicesRevenue: { label: "Marketing Services Revenue", color: "#10b981", zh: "营销服务收入", category: "Segments" },
  fintechRevenue: { label: "FinTech & Business Services Revenue", color: "#f59e0b", zh: "金融科技及企业服务收入", category: "Segments" },
  othersRevenue: { label: "Others Revenue", color: "#8b5cf6", zh: "其他收入", category: "Segments" },

  // Segment Gross Profit
  vasGrossProfit: { label: "VAS Gross Profit", color: "#60a5fa", zh: "增值服务毛利", category: "Segments" },
  marketingServicesGrossProfit: { label: "Marketing Services Gross Profit", color: "#34d399", zh: "营销服务毛利", category: "Segments" },
  fintechGrossProfit: { label: "FinTech & Business Services Gross Profit", color: "#fbbf24", zh: "金融科技及企业服务毛利", category: "Segments" },
  othersGrossProfit: { label: "Others Gross Profit", color: "#a78bfa", zh: "其他毛利", category: "Segments" },

  // Segment Margins
  vasGrossMargin: { label: "VAS Gross Margin (%)", color: "#93c5fd", zh: "增值服务毛利率(%)", category: "Segments" },
  marketingServicesGrossMargin: { label: "Marketing Services Gross Margin (%)", color: "#6ee7b7", zh: "营销服务毛利率(%)", category: "Segments" },
  fintechGrossMargin: { label: "FinTech & Business Services Gross Margin (%)", color: "#fde68a", zh: "金融科技及企业服务毛利率(%)", category: "Segments" },
  othersGrossMargin: { label: "Others Gross Margin (%)", color: "#ddd6fe", zh: "其他毛利率(%)", category: "Segments" },

  // Liquidity / Cash
  cashCashEquivalents: { label: "Cash & Cash Equivalents", color: "#2dd4bf", zh: "现金及现金等价物", category: "Liquidity" },
  termDepositsOthers: { label: "Term Deposits and Others", color: "#22d3ee", zh: "定期存款及其他", category: "Liquidity" },
  borrowings: { label: "Borrowings", color: "#0891b2", zh: "借款", category: "Liquidity" },
  notesPayable: { label: "Notes Payable", color: "#155e75", zh: "应付票据", category: "Liquidity" },
  netCash: { label: "Net Cash", color: "#0e7490", zh: "净现金", category: "Liquidity" },

  // Calculated Metrics
  sellingMarketingExpensesMargin: { label: "Selling & Marketing Expenses Margin (%)", color: "#86efac", zh: "销售及市场推广开支率(%)", category: "Calculated Metrics" },
  generalAdminExpensesMargin: { label: "General & Administrative Expenses Margin (%)", color: "#fde047", zh: "一般及行政开支率(%)", category: "Calculated Metrics" },
  coreProfit: { label: "Core Profit", color: "#67e8f9", zh: "核心利润", category: "Calculated Metrics" },
  otherProfit: { label: "Other Profit", color: "#c4b5fd", zh: "其他利润", category: "Calculated Metrics" },
  vasMargin: { label: "VAS Margin (%)", color: "#bae6fd", zh: "增值服务毛利率(%)", category: "Calculated Metrics" },
  marketingServicesMargin: { label: "Marketing Services Margin (%)", color: "#a7f3d0", zh: "营销服务毛利率(%)", category: "Calculated Metrics" },
  fintechMargin: { label: "FinTech & Business Services Margin (%)", color: "#fef08a", zh: "金融科技及企业服务毛利率(%)", category: "Calculated Metrics" },
};

const DATA = [
  { 
    year: 2024, 
    revenue: 660, grossProfit: 349, operatingProfit: 208, profitBeforeTax: 241, profitForYear: 197, profitAttrEquity: 194,
    totalCompIncome: 210, totalCompIncomeAttrEquity: 200, nonIfrsOperatingProfit: 238, nonIfrsProfitAttrEquity: 223,
    nonCurrentAssets: 1180, currentAssets: 596, totalAssets: 1776, equityAttrEquity: 920, nonControllingInterests: 78, 
    totalEquity: 998, nonCurrentLiabilities: 432, currentLiabilities: 346, totalLiabilities: 778, totalEquityLiabilities: 1776,
    costOfRevenues: 311, sellingMarketingExpenses: 36, generalAdminExpenses: 113, otherGainsLosses: 8, netGainsLossesInvestments: 8,
    interestIncome: 17, financeCosts: 12, shareOfProfitLossAssociates: 25, incomeTaxExpense: 45,
    vasRevenue: 319, marketingServicesRevenue: 121, fintechRevenue: 212, othersRevenue: 8,
    vasGrossProfit: 180, marketingServicesGrossProfit: 60, fintechGrossProfit: 100, othersGrossProfit: 2,
    vasGrossMargin: 56, marketingServicesGrossMargin: 50, fintechGrossMargin: 47, othersGrossMargin: 25,
    cashCashEquivalents: 180, termDepositsOthers: 235, borrowings: 141, notesPayable: 121, netCash: 77
  },
  { 
    year: 2023, 
    revenue: 609, grossProfit: 293, operatingProfit: 160, profitBeforeTax: 161, profitForYear: 118, profitAttrEquity: 115,
    totalCompIncome: 125, totalCompIncomeAttrEquity: 120, nonIfrsOperatingProfit: 192, nonIfrsProfitAttrEquity: 158,
    nonCurrentAssets: 1035, currentAssets: 524, totalAssets: 1559, equityAttrEquity: 780, nonControllingInterests: 65, 
    totalEquity: 845, nonCurrentLiabilities: 385, currentLiabilities: 329, totalLiabilities: 714, totalEquityLiabilities: 1559,
    costOfRevenues: 316, sellingMarketingExpenses: 34, generalAdminExpenses: 104, otherGainsLosses: 5, netGainsLossesInvestments: -4,
    interestIncome: 14, financeCosts: 12, shareOfProfitLossAssociates: 6, incomeTaxExpense: 43,
    vasRevenue: 298, marketingServicesRevenue: 101, fintechRevenue: 204, othersRevenue: 5,
    vasGrossProfit: 152, marketingServicesGrossProfit: 51, fintechGrossProfit: 81, othersGrossProfit: 1,
    vasGrossMargin: 51, marketingServicesGrossMargin: 50, fintechGrossMargin: 40, othersGrossMargin: 20,
    cashCashEquivalents: 173, termDepositsOthers: 200, borrowings: 132, notesPayable: 110, netCash: 54
  },
  { 
    year: 2022, 
    revenue: 555, grossProfit: 239, operatingProfit: 114, profitBeforeTax: 210, profitForYear: 189, profitAttrEquity: 188,
    totalCompIncome: 175, totalCompIncomeAttrEquity: 170, nonIfrsOperatingProfit: 154, nonIfrsProfitAttrEquity: 116,
    nonCurrentAssets: 1005, currentAssets: 502, totalAssets: 1507, equityAttrEquity: 750, nonControllingInterests: 60, 
    totalEquity: 810, nonCurrentLiabilities: 370, currentLiabilities: 327, totalLiabilities: 697, totalEquityLiabilities: 1507,
    costOfRevenues: 316, sellingMarketingExpenses: 29, generalAdminExpenses: 107, otherGainsLosses: -8, netGainsLossesInvestments: 116,
    interestIncome: 9, financeCosts: 10, shareOfProfitLossAssociates: -16, incomeTaxExpense: 22,
    vasRevenue: 288, marketingServicesRevenue: 83, fintechRevenue: 177, othersRevenue: 7,
    vasGrossProfit: 145, marketingServicesGrossProfit: 35, fintechGrossProfit: 52, othersGrossProfit: 1,
    vasGrossMargin: 50, marketingServicesGrossMargin: 42, fintechGrossMargin: 29, othersGrossMargin: 14,
    cashCashEquivalents: 157, termDepositsOthers: 190, borrowings: 129, notesPayable: 105, netCash: 48
  },
  { 
    year: 2021, 
    revenue: 560, grossProfit: 246, operatingProfit: 124, profitBeforeTax: 248, profitForYear: 228, profitAttrEquity: 225,
    totalCompIncome: 235, totalCompIncomeAttrEquity: 230, nonIfrsOperatingProfit: 160, nonIfrsProfitAttrEquity: 124,
    nonCurrentAssets: 1025, currentAssets: 487, totalAssets: 1512, equityAttrEquity: 780, nonControllingInterests: 55, 
    totalEquity: 835, nonCurrentLiabilities: 350, currentLiabilities: 327, totalLiabilities: 677, totalEquityLiabilities: 1512,
    costOfRevenues: 314, sellingMarketingExpenses: 31, generalAdminExpenses: 99, otherGainsLosses: -8, netGainsLossesInvestments: 149,
    interestIncome: 7, financeCosts: 8, shareOfProfitLossAssociates: -16, incomeTaxExpense: 20,
    vasRevenue: 292, marketingServicesRevenue: 89, fintechRevenue: 172, othersRevenue: 8,
    vasGrossProfit: 152, marketingServicesGrossProfit: 38, fintechGrossProfit: 49, othersGrossProfit: 1,
    vasGrossMargin: 52, marketingServicesGrossMargin: 43, fintechGrossMargin: 28, othersGrossMargin: 13,
    cashCashEquivalents: 167, termDepositsOthers: 168, borrowings: 127, notesPayable: 103, netCash: 45
  },
  { 
    year: 2020, 
    revenue: 482, grossProfit: 222, operatingProfit: 125, profitBeforeTax: 180, profitForYear: 160, profitAttrEquity: 160,
    totalCompIncome: 165, totalCompIncomeAttrEquity: 160, nonIfrsOperatingProfit: 142, nonIfrsProfitAttrEquity: 123,
    nonCurrentAssets: 985, currentAssets: 416, totalAssets: 1401, equityAttrEquity: 680, nonControllingInterests: 45, 
    totalEquity: 725, nonCurrentLiabilities: 330, currentLiabilities: 345, totalLiabilities: 675, totalEquityLiabilities: 1401,
    costOfRevenues: 260, sellingMarketingExpenses: 27, generalAdminExpenses: 75, otherGainsLosses: -5, netGainsLossesInvestments: 55,
    interestIncome: 9, financeCosts: 7, shareOfProfitLossAssociates: 4, incomeTaxExpense: 20,
    vasRevenue: 264, marketingServicesRevenue: 82, fintechRevenue: 128, othersRevenue: 7,
    vasGrossProfit: 140, marketingServicesGrossProfit: 35, fintechGrossProfit: 41, othersGrossProfit: 1,
    vasGrossMargin: 53, marketingServicesGrossMargin: 43, fintechGrossMargin: 32, othersGrossMargin: 14,
    cashCashEquivalents: 153, termDepositsOthers: 147, borrowings: 116, notesPayable: 96, netCash: 37
  },
  { 
    year: 2019, 
    revenue: 377, grossProfit: 167, operatingProfit: 119, profitBeforeTax: 117, profitForYear: 96, profitAttrEquity: 93,
    totalCompIncome: 95, totalCompIncomeAttrEquity: 90, nonIfrsOperatingProfit: 108, nonIfrsProfitAttrEquity: 94,
    nonCurrentAssets: 764, currentAssets: 328, totalAssets: 1092, equityAttrEquity: 433, nonControllingInterests: 56, 
    totalEquity: 489, nonCurrentLiabilities: 225, currentLiabilities: 378, totalLiabilities: 603, totalEquityLiabilities: 1092,
    costOfRevenues: 210, sellingMarketingExpenses: 21, generalAdminExpenses: 53, otherGainsLosses: 19, netGainsLossesInvestments: 9,
    interestIncome: 6, financeCosts: 8, shareOfProfitLossAssociates: -2, incomeTaxExpense: 21,
    vasRevenue: 200, marketingServicesRevenue: 68, fintechRevenue: 101, othersRevenue: 8,
    vasGrossProfit: 105, marketingServicesGrossProfit: 30, fintechGrossProfit: 28, othersGrossProfit: 1,
    vasGrossMargin: 53, marketingServicesGrossMargin: 44, fintechGrossMargin: 28, othersGrossMargin: 13,
    cashCashEquivalents: 133, termDepositsOthers: 72, borrowings: 126, notesPayable: 83, netCash: -4
  },
  { 
    year: 2018, 
    revenue: 313, grossProfit: 142, operatingProfit: 98, profitBeforeTax: 94, profitForYear: 80, profitAttrEquity: 79,
    totalCompIncome: 60, totalCompIncomeAttrEquity: 55, nonIfrsOperatingProfit: 86, nonIfrsProfitAttrEquity: 77,
    nonCurrentAssets: 554, currentAssets: 243, totalAssets: 797, equityAttrEquity: 322, nonControllingInterests: 34, 
    totalEquity: 356, nonCurrentLiabilities: 165, currentLiabilities: 276, totalLiabilities: 441, totalEquityLiabilities: 797,
    costOfRevenues: 170, sellingMarketingExpenses: 24, generalAdminExpenses: 42, otherGainsLosses: 16, netGainsLossesInvestments: 5,
    interestIncome: 5, financeCosts: 5, shareOfProfitLossAssociates: 2, incomeTaxExpense: 15,
    vasRevenue: 177, marketingServicesRevenue: 58, fintechRevenue: 73, othersRevenue: 5,
    vasGrossProfit: 98, marketingServicesGrossProfit: 25, fintechGrossProfit: 18, othersGrossProfit: 0,
    vasGrossMargin: 55, marketingServicesGrossMargin: 43, fintechGrossMargin: 25, othersGrossMargin: 0,
    cashCashEquivalents: 98, termDepositsOthers: 65, borrowings: 114, notesPayable: 65, netCash: -17
  },
  { 
    year: 2017, 
    revenue: 238, grossProfit: 117, operatingProfit: 90, profitBeforeTax: 88, profitForYear: 72, profitAttrEquity: 72,
    totalCompIncome: 75, totalCompIncomeAttrEquity: 70, nonIfrsOperatingProfit: 75, nonIfrsProfitAttrEquity: 66,
    nonCurrentAssets: 396, currentAssets: 205, totalAssets: 601, equityAttrEquity: 256, nonControllingInterests: 21, 
    totalEquity: 278, nonCurrentLiabilities: 121, currentLiabilities: 202, totalLiabilities: 323, totalEquityLiabilities: 601,
    costOfRevenues: 121, sellingMarketingExpenses: 18, generalAdminExpenses: 33, otherGainsLosses: 20, netGainsLossesInvestments: 3,
    interestIncome: 4, financeCosts: 3, shareOfProfitLossAssociates: 1, incomeTaxExpense: 16,
    vasRevenue: 154, marketingServicesRevenue: 41, fintechRevenue: 43, othersRevenue: 0,
    vasGrossProfit: 92, marketingServicesGrossProfit: 15, fintechGrossProfit: 10, othersGrossProfit: 0,
    vasGrossMargin: 60, marketingServicesGrossMargin: 37, fintechGrossMargin: 23, othersGrossMargin: 0,
    cashCashEquivalents: 106, termDepositsOthers: 42, borrowings: 98, notesPayable: 34, netCash: 16
  },
  { 
    year: 2016, 
    revenue: 152, grossProfit: 85, operatingProfit: 56, profitBeforeTax: 52, profitForYear: 41, profitAttrEquity: 41,
    totalCompIncome: 45, totalCompIncomeAttrEquity: 40, nonIfrsOperatingProfit: 52, nonIfrsProfitAttrEquity: 47,
    nonCurrentAssets: 251, currentAssets: 145, totalAssets: 396, equityAttrEquity: 175, nonControllingInterests: 11, 
    totalEquity: 187, nonCurrentLiabilities: 105, currentLiabilities: 104, totalLiabilities: 209, totalEquityLiabilities: 396,
    costOfRevenues: 68, sellingMarketingExpenses: 12, generalAdminExpenses: 22, otherGainsLosses: 10, netGainsLossesInvestments: 2,
    interestIncome: 3, financeCosts: 2, shareOfProfitLossAssociates: -2, incomeTaxExpense: 10,
    vasRevenue: 108, marketingServicesRevenue: 27, fintechRevenue: 17, othersRevenue: 0,
    vasGrossProfit: 65, marketingServicesGrossProfit: 10, fintechGrossProfit: 9, othersGrossProfit: 0,
    vasGrossMargin: 60, marketingServicesGrossMargin: 37, fintechGrossMargin: 53, othersGrossMargin: 0,
    cashCashEquivalents: 72, termDepositsOthers: 55, borrowings: 70, notesPayable: 38, netCash: 19
  },
  { 
    year: 2015, 
    revenue: 103, grossProfit: 61, operatingProfit: 41, profitBeforeTax: 40, profitForYear: 29, profitAttrEquity: 29,
    totalCompIncome: 25, totalCompIncomeAttrEquity: 22, nonIfrsOperatingProfit: 38, nonIfrsProfitAttrEquity: 32,
    nonCurrentAssets: 127, currentAssets: 119, totalAssets: 246, equityAttrEquity: 120, nonControllingInterests: 1, 
    totalEquity: 122, nonCurrentLiabilities: 42, currentLiabilities: 82, totalLiabilities: 124, totalEquityLiabilities: 246,
    costOfRevenues: 42, sellingMarketingExpenses: 7, generalAdminExpenses: 15, otherGainsLosses: 5, netGainsLossesInvestments: 1,
    interestIncome: 2, financeCosts: 1, shareOfProfitLossAssociates: -1, incomeTaxExpense: 11,
    vasRevenue: 81, marketingServicesRevenue: 18, fintechRevenue: 5, othersRevenue: 0,
    vasGrossProfit: 50, marketingServicesGrossProfit: 6, fintechGrossProfit: 5, othersGrossProfit: 0,
    vasGrossMargin: 62, marketingServicesGrossMargin: 33, fintechGrossMargin: 100, othersGrossMargin: 0,
    cashCashEquivalents: 44, termDepositsOthers: 45, borrowings: 45, notesPayable: 25, netCash: 19
  },
  { 
    year: 2014, 
    revenue: 79, grossProfit: 48, operatingProfit: 31, profitBeforeTax: 33, profitForYear: 24, profitAttrEquity: 24,
    totalCompIncome: 20, totalCompIncomeAttrEquity: 18, nonIfrsOperatingProfit: 29, nonIfrsProfitAttrEquity: 24,
    nonCurrentAssets: 87, currentAssets: 98, totalAssets: 185, equityAttrEquity: 80, nonControllingInterests: 0, 
    totalEquity: 81, nonCurrentLiabilities: 36, currentLiabilities: 68, totalLiabilities: 104, totalEquityLiabilities: 185,
    costOfRevenues: 31, sellingMarketingExpenses: 5, generalAdminExpenses: 11, otherGainsLosses: 2, netGainsLossesInvestments: 3,
    interestIncome: 1, financeCosts: 1, shareOfProfitLossAssociates: -1, incomeTaxExpense: 9,
    vasRevenue: 63, marketingServicesRevenue: 10, fintechRevenue: 6, othersRevenue: 0,
    vasGrossProfit: 40, marketingServicesGrossProfit: 4, fintechGrossProfit: 4, othersGrossProfit: 0,
    vasGrossMargin: 64, marketingServicesGrossMargin: 40, fintechGrossMargin: 67, othersGrossMargin: 0,
    cashCashEquivalents: 43, termDepositsOthers: 15, borrowings: 8, notesPayable: 15, netCash: 34
  },
];

function ReportsModal({ open, onOpenChange, lang }: { open: boolean; onOpenChange: (open: boolean) => void; lang: "en" | "zh" }) {
  const t = (en: string, zh: string) => (lang === "en" ? en : zh);
  const reports = [
    { year: 2024, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2023, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2022, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2021, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2020, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2019, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2018, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2017, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2016, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2015, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
    { year: 2014, url: "https://www.tencent.com/en-us/investors/financial-reports.html" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-card-border">
        <DialogHeader>
          <DialogTitle className="tfi-title text-2xl">
            {t("Annual Reports", "年度报告")}
          </DialogTitle>
          <DialogDescription className="tfi-mono text-xs uppercase tracking-widest text-muted-foreground pt-1">
            {t("Official Filings 2014–2024", "官方备案文件 2014–2024")}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4 mt-4">
          <div className="space-y-2 pb-4">
            {reports.map((r) => (
              <a
                key={r.year}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center tfi-mono text-sm font-bold group-hover:text-primary">
                    {r.year}
                  </div>
                  <div className="text-sm font-medium">
                    {t(`${r.year} Annual Report`, `${r.year} 年度报告`)}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const [page, setPage] = useState<1 | 2>(1);
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(["revenue"]);
  const [yearRange, setYearRange] = useState<[number, number]>([2014, 2024]);
  const [plotMode, setPlotMode] = useState<"level" | "yoy">("level");
  const [plotType, setPlotType] = useState<"line" | "bar">("line");
  const [compositionYear, setCompositionYear] = useState<number>(2024);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [tableYearFilter, setTableYearFilter] = useState<number[]>(DATA.map(d => d.year));
  const [customMetricDialogOpen, setCustomMetricDialogOpen] = useState(false);
  const [customMetrics, setCustomMetrics] = useState<Array<{
    id: string;
    name: string;
    nameZh: string;
    metricA: string;
    operator: "+" | "-" | "*" | "/";
    metricB: string;
    color: string;
  }>>([]);
  const [newCustomMetric, setNewCustomMetric] = useState({
    name: "",
    nameZh: "",
    metricA: "revenue",
    operator: "/" as "+" | "-" | "*" | "/",
    metricB: "revenue",
  });

  // Helper to compute calculated metrics
  const computeCalculatedMetrics = (d: typeof DATA[0]) => {
    const base: any = {
      ...d,
      sellingMarketingExpensesMargin: (d.sellingMarketingExpenses / d.revenue) * 100,
      generalAdminExpensesMargin: (d.generalAdminExpenses / d.revenue) * 100,
      coreProfit: d.grossProfit - d.sellingMarketingExpenses - d.generalAdminExpenses,
      otherProfit: d.netGainsLossesInvestments + d.interestIncome + d.shareOfProfitLossAssociates - d.financeCosts,
      vasMargin: (d.vasGrossProfit / d.vasRevenue) * 100,
      marketingServicesMargin: (d.marketingServicesGrossProfit / d.marketingServicesRevenue) * 100,
      fintechMargin: (d.fintechGrossProfit / d.fintechRevenue) * 100,
    };
    customMetrics.forEach((cm) => {
      const valA = (d as any)[cm.metricA] ?? base[cm.metricA] ?? 0;
      const valB = (d as any)[cm.metricB] ?? base[cm.metricB] ?? 0;
      switch (cm.operator) {
        case "+": base[cm.id] = valA + valB; break;
        case "-": base[cm.id] = valA - valB; break;
        case "*": base[cm.id] = valA * valB; break;
        case "/": base[cm.id] = valB !== 0 ? (valA / valB) * 100 : 0; break;
      }
    });
    return base;
  };

  const addCustomMetric = () => {
    if (!newCustomMetric.name.trim()) return;
    const id = `custom_${Date.now()}`;
    const colors = ["#f472b6", "#a3e635", "#38bdf8", "#c084fc", "#fb923c", "#22d3ee", "#facc15"];
    setCustomMetrics([...customMetrics, {
      id,
      name: newCustomMetric.name,
      nameZh: newCustomMetric.nameZh || newCustomMetric.name,
      metricA: newCustomMetric.metricA,
      operator: newCustomMetric.operator,
      metricB: newCustomMetric.metricB,
      color: colors[customMetrics.length % colors.length],
    }]);
    setNewCustomMetric({ name: "", nameZh: "", metricA: "revenue", operator: "/", metricB: "revenue" });
    setCustomMetricDialogOpen(false);
  };

  const removeCustomMetric = (id: string) => {
    setCustomMetrics(customMetrics.filter((cm) => cm.id !== id));
    setSelectedMetrics(selectedMetrics.filter((m) => m !== id));
  };

  const allMetricsForSelect = useMemo(() => {
    const baseKeys = Object.keys(METRICS) as MetricKey[];
    return baseKeys;
  }, []);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatLoading(true);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: chatMessages }),
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getMetricInfo = (key: string) => {
    if (METRICS[key as MetricKey]) {
      return METRICS[key as MetricKey];
    }
    const custom = customMetrics.find((cm) => cm.id === key);
    if (custom) {
      return { label: custom.name, zh: custom.nameZh, color: custom.color, category: "Custom" };
    }
    return { label: key, zh: key, color: "#888888", category: "Unknown" };
  };

  const filteredData = useMemo(() => {
    const base = DATA.filter((d) => d.year >= yearRange[0] && d.year <= yearRange[1]).sort((a, b) => a.year - b.year).map(computeCalculatedMetrics);
    if (plotMode === "yoy") {
      return base.map((d, i, arr) => {
        if (i === 0) {
          const prevYearData = DATA.find(prev => prev.year === d.year - 1);
          const prevComputed = prevYearData ? computeCalculatedMetrics(prevYearData) : null;
          if (!prevComputed) return { ...d, isYoY: true };
          const res: any = { year: d.year, isYoY: true };
          selectedMetrics.forEach(m => {
             res[m] = ((d[m] - prevComputed[m]) / Math.abs(prevComputed[m] || 1)) * 100;
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

  const formatValue = (v: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(v));
  };

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
                data-testid="button-nav-visualization"
                variant={page === 1 ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setPage(1)}
                className="rounded-full px-4"
              >
                {t("Visualization", "可视化")}
              </Button>
              <Button 
                data-testid="button-nav-data-table"
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
              data-testid="button-language-toggle"
              variant="outline"
              size="sm"
              className="tfi-mono text-[10px]"
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
            >
              {lang === "en" ? "ZH" : "EN"}
            </Button>
            <Button data-testid="button-open-reports" variant="outline" size="sm" className="hidden sm:flex" onClick={() => setReportsOpen(true)}>
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

      <ReportsModal open={reportsOpen} onOpenChange={setReportsOpen} lang={lang} />

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {page === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Controls */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" />
                      {t("Dashboard Controls", "仪表板控制")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 max-h-[70vh] overflow-auto pr-2">
                    <div className="space-y-4">
                      <Label className="tfi-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t("Metric Selection", "指标选择")}
                      </Label>
                      <div className="rounded-xl border border-border bg-muted/10 overflow-hidden">
                        <ScrollArea className="h-[360px]" data-testid="scroll-metric-selection">
                          <div className="p-3">
                            <Accordion type="multiple" defaultValue={["Performance", "Balance Sheet", "Costs", "Segments", "Liquidity"]} className="w-full">
                              {Array.from(
                                Object.entries(METRICS).reduce((acc, [key, m]) => {
                                  const arr = acc.get(m.category) ?? [];
                                  arr.push([key, m] as const);
                                  acc.set(m.category, arr);
                                  return acc;
                                }, new Map<string, Array<readonly [string, (typeof METRICS)[MetricKey]]>>())
                              ).map(([category, items]) => (
                          <AccordionItem key={category} value={category} className="border-border/50">
                            <AccordionTrigger
                              data-testid={`accordion-${category.toLowerCase().replace(/\s+/g, "-")}`}
                              className="py-3 text-xs font-semibold text-foreground hover:no-underline"
                            >
                              <span className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-primary/70" />
                                {category}
                                <span className="ml-2 text-[10px] tfi-mono text-muted-foreground">({items.length})</span>
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3">
                              <div className="grid grid-cols-1 gap-2">
                                {items.map(([key, m]) => (
                                  <div key={key} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors">
                                    <Checkbox
                                      data-testid={`checkbox-metric-${key}`}
                                      id={`metric-${key}`}
                                      checked={selectedMetrics.includes(key as MetricKey)}
                                      onCheckedChange={(checked: boolean) => {
                                        if (checked) setSelectedMetrics([...selectedMetrics, key as MetricKey]);
                                        else setSelectedMetrics(selectedMetrics.filter((mk) => mk !== key));
                                      }}
                                      className="mt-0.5"
                                    />
                                    <Label
                                      data-testid={`label-metric-${key}`}
                                      htmlFor={`metric-${key}`}
                                      className="text-xs cursor-pointer leading-snug"
                                    >
                                      {t(m.label, m.zh)}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                            </Accordion>
                          </div>
                        </ScrollArea>
                      </div>
                    </div>

                    {/* Custom Metrics Section */}
                    <div className="space-y-4 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <Label className="tfi-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {t("Custom Metrics", "自定义指标")}
                        </Label>
                        <Dialog open={customMetricDialogOpen} onOpenChange={setCustomMetricDialogOpen}>
                          <DialogTrigger asChild>
                            <Button data-testid="button-add-custom-metric" variant="ghost" size="sm" className="h-6 px-2">
                              <Plus className="w-3 h-3 mr-1" />
                              <span className="text-[10px]">{t("Add", "添加")}</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-xl border-card-border">
                            <DialogHeader>
                              <DialogTitle className="tfi-title text-lg">
                                {t("Create Custom Metric", "创建自定义指标")}
                              </DialogTitle>
                              <DialogDescription className="text-xs text-muted-foreground">
                                {t("Combine existing metrics with an operator", "使用运算符组合现有指标")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label className="text-xs">{t("Name (English)", "名称（英文）")}</Label>
                                <Input
                                  data-testid="input-custom-metric-name"
                                  placeholder={t("e.g. My Ratio", "例如 我的比率")}
                                  value={newCustomMetric.name}
                                  onChange={(e) => setNewCustomMetric({ ...newCustomMetric, name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">{t("Name (Chinese)", "名称（中文）")}</Label>
                                <Input
                                  data-testid="input-custom-metric-name-zh"
                                  placeholder={t("e.g. 我的比率", "例如 我的比率")}
                                  value={newCustomMetric.nameZh}
                                  onChange={(e) => setNewCustomMetric({ ...newCustomMetric, nameZh: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">{t("Formula", "公式")}</Label>
                                <div className="flex items-center gap-2">
                                  <Select value={newCustomMetric.metricA} onValueChange={(v) => setNewCustomMetric({ ...newCustomMetric, metricA: v })}>
                                    <SelectTrigger data-testid="select-metric-a" className="flex-1 h-9 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                      {allMetricsForSelect.map((k) => (
                                        <SelectItem key={k} value={k} className="text-xs">{METRICS[k].label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Select value={newCustomMetric.operator} onValueChange={(v: any) => setNewCustomMetric({ ...newCustomMetric, operator: v })}>
                                    <SelectTrigger data-testid="select-operator" className="w-16 h-9 text-center font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="+">+</SelectItem>
                                      <SelectItem value="-">−</SelectItem>
                                      <SelectItem value="*">×</SelectItem>
                                      <SelectItem value="/">/</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select value={newCustomMetric.metricB} onValueChange={(v) => setNewCustomMetric({ ...newCustomMetric, metricB: v })}>
                                    <SelectTrigger data-testid="select-metric-b" className="flex-1 h-9 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                      {allMetricsForSelect.map((k) => (
                                        <SelectItem key={k} value={k} className="text-xs">{METRICS[k].label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {newCustomMetric.operator === "/" 
                                    ? t("Division results are shown as percentages (×100)", "除法结果以百分比显示（×100）")
                                    : t("Result will be in the same unit as operands", "结果单位与操作数相同")}
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button data-testid="button-create-custom-metric" onClick={addCustomMetric} disabled={!newCustomMetric.name.trim()}>
                                {t("Create Metric", "创建指标")}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {customMetrics.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground italic">
                          {t("No custom metrics yet", "暂无自定义指标")}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {customMetrics.map((cm) => (
                            <div key={cm.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/20 border border-border/50">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Checkbox
                                  data-testid={`checkbox-custom-metric-${cm.id}`}
                                  checked={selectedMetrics.includes(cm.id as any)}
                                  onCheckedChange={(checked: boolean) => {
                                    if (checked) setSelectedMetrics([...selectedMetrics, cm.id as any]);
                                    else setSelectedMetrics(selectedMetrics.filter((m) => m !== cm.id));
                                  }}
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-medium truncate" style={{ color: cm.color }}>{t(cm.name, cm.nameZh)}</span>
                                  <span className="text-[9px] text-muted-foreground truncate">
                                    {METRICS[cm.metricA as MetricKey]?.label ?? cm.metricA} {cm.operator} {METRICS[cm.metricB as MetricKey]?.label ?? cm.metricB}
                                  </span>
                                </div>
                              </div>
                              <Button
                                data-testid={`button-remove-custom-metric-${cm.id}`}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removeCustomMetric(cm.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label className="tfi-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t("Year Range", "年份范围")}
                      </Label>
                      <div className="px-2 pt-2">
                        <Slider 
                          data-testid="slider-year-range"
                          defaultValue={[2014, 2024]} 
                          min={2014} 
                          max={2024} 
                          step={1}
                          onValueChange={(v) => setYearRange([v[0], v[1]])}
                        />
                        <div className="flex justify-between mt-4 tfi-mono text-[10px]">
                          <span>{yearRange[0]}</span>
                          <span>{yearRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="tfi-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t("Analysis Mode", "分析模式")}
                      </Label>
                      <Tabs value={plotMode} onValueChange={(v: any) => setPlotMode(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="level" className="text-[10px]">{t("Nominal", "名义值")}</TabsTrigger>
                          <TabsTrigger value="yoy" className="text-[10px]">{t("YoY %", "同比")}</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div className="space-y-4">
                      <Label className="tfi-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t("Chart Type", "图表类型")}
                      </Label>
                      <Tabs value={plotType} onValueChange={(v: any) => setPlotType(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger data-testid="button-chart-line" value="line" className="text-[10px]">{t("Line", "折线")}</TabsTrigger>
                          <TabsTrigger data-testid="button-chart-bar" value="bar" className="text-[10px]">{t("Bar", "柱状")}</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Visualization Area */}
              <div className="lg:col-span-3 space-y-8">
                {/* Main Chart */}
                <Card className="border-card-border overflow-hidden bg-card/30 backdrop-blur-xl">
                  <CardHeader className="border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="tfi-title text-xl">
                          {t("Financial Trend Analysis", "财务趋势分析")}
                        </CardTitle>
                        <CardDescription className="tfi-mono text-[10px] uppercase tracking-wider">
                          {plotMode === "yoy"
                            ? t(`Unit: ${UNIT_PERCENT} • 2014-2024`, `单位：${UNIT_PERCENT} • 2014-2024`)
                            : t(`Unit: RMB ${UNIT_BILLIONS} • 2014-2024`, `单位：人民币 ${UNIT_BILLIONS} • 2014-2024`)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="tfi-mono text-[10px] uppercase py-1 px-3">
                        {plotMode === "yoy" ? `YoY Change ${UNIT_PERCENT}` : `Nominal Value (${UNIT_BILLIONS} RMB)`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div className="h-[450px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {plotType === "line" ? (
                          <LineChart data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                              dataKey="year" 
                              stroke="#6b7280" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={false} 
                              dy={10}
                            />
                            <YAxis 
                              stroke="#6b7280" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={false} 
                              tickFormatter={(v) => (plotMode === "yoy" ? `${Number(v).toFixed(2)}%` : v)}
                            />
                            <Tooltip 
                              formatter={(value: any) => {
                                const n = Number(value);
                                if (!Number.isFinite(n)) return value;
                                return plotMode === "yoy" ? `${n.toFixed(2)}%` : formatValue(n);
                              }}
                              contentStyle={{ 
                                backgroundColor: "rgba(17, 24, 39, 0.95)", 
                                borderRadius: "12px", 
                                border: "1px solid rgba(255,255,255,0.1)",
                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
                                fontSize: "12px",
                                backdropFilter: "blur(8px)"
                              }}
                              itemStyle={{ padding: "2px 0" }}
                            />
                            <Legend 
                              verticalAlign="top" 
                              align="right" 
                              iconType="circle"
                              wrapperStyle={{ paddingTop: "0px", paddingBottom: "20px" }}
                            />
                            {selectedMetrics.map((m) => {
                              const info = getMetricInfo(m);
                              return (
                                <Line
                                  key={m}
                                  type="monotone"
                                  dataKey={m}
                                  name={t(info.label, info.zh)}
                                  stroke={info.color}
                                  strokeWidth={3}
                                  dot={{ r: 4, strokeWidth: 2, fill: "#111827" }}
                                  activeDot={{ r: 6, strokeWidth: 0 }}
                                  animationDuration={1500}
                                >
                                  <LabelList 
                                    dataKey={m} 
                                    position="top" 
                                    fill={info.color}
                                    fontSize={9}
                                    formatter={(v: number) => plotMode === "yoy" ? `${v.toFixed(1)}%` : formatValue(v)}
                                  />
                                </Line>
                              );
                            })}
                          </LineChart>
                        ) : (
                          <BarChart data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="year" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                            <YAxis 
                              stroke="#6b7280" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(v) => (plotMode === "yoy" ? `${Number(v).toFixed(2)}%` : v)}
                            />
                            <Tooltip 
                              cursor={{ fill: "rgba(255,255,255,0.05)" }}
                              formatter={(value: any) => {
                                const n = Number(value);
                                if (!Number.isFinite(n)) return value;
                                return plotMode === "yoy" ? `${n.toFixed(2)}%` : formatValue(n);
                              }}
                              contentStyle={{ 
                                backgroundColor: "rgba(17, 24, 39, 0.95)", 
                                borderRadius: "12px", 
                                border: "1px solid rgba(255,255,255,0.1)",
                                fontSize: "12px"
                              }}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: "20px" }} />
                            {selectedMetrics.map((m) => {
                              const info = getMetricInfo(m);
                              return (
                                <Bar 
                                  key={m} 
                                  dataKey={m} 
                                  name={t(info.label, info.zh)} 
                                  fill={info.color} 
                                  radius={[4, 4, 0, 0]}
                                  animationDuration={1000}
                                >
                                  <LabelList 
                                    dataKey={m} 
                                    position="top" 
                                    fill={info.color}
                                    fontSize={9}
                                    formatter={(v: number) => plotMode === "yoy" ? `${v.toFixed(1)}%` : formatValue(v)}
                                  />
                                </Bar>
                              );
                            })}
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-metrics Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Revenue Composition - Stacked Bar Chart Over Time */}
                  <Card className="bg-card/20 backdrop-blur-sm border-card-border">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-primary" />
                          {t("Revenue Composition Over Time", "营收结构变化")}
                        </CardTitle>
                        <Badge variant="outline" className="tfi-mono text-[10px] uppercase py-1 px-3">
                          {t(`Unit: ${UNIT_PERCENT}`, `单位：${UNIT_PERCENT}`)}
                        </Badge>
                      </div>
                      <CardDescription className="tfi-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t("Proportion of VAS, Marketing, FinTech & Others", "增值服务、营销服务、金融科技及其他占比")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={DATA.slice().sort((a, b) => a.year - b.year).map((d) => {
                              const total = d.vasRevenue + d.marketingServicesRevenue + d.fintechRevenue + d.othersRevenue;
                              return {
                                year: d.year,
                                vas: d.vasRevenue / total,
                                marketing: d.marketingServicesRevenue / total,
                                fintech: d.fintechRevenue / total,
                                others: d.othersRevenue / total,
                              };
                            })}
                            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="year" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                            <Tooltip 
                              cursor={{ fill: "rgba(255,255,255,0.05)" }}
                              formatter={(value: any) => `${(Number(value) * 100).toFixed(1)}%`}
                              contentStyle={{ 
                                backgroundColor: "rgba(17, 24, 39, 0.95)", 
                                borderRadius: "12px", 
                                border: "1px solid rgba(255,255,255,0.1)",
                                fontSize: "11px"
                              }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              align="center" 
                              iconType="circle" 
                              wrapperStyle={{ paddingTop: "10px", fontSize: "10px" }} 
                            />
                            <Bar dataKey="vas" name={t("VAS", "增值服务")} stackId="a" fill="#3b82f6">
                              <LabelList dataKey="vas" position="center" fill="#fff" fontSize={8} formatter={(v: number) => v >= 0.08 ? `${(v * 100).toFixed(0)}%` : ""} />
                            </Bar>
                            <Bar dataKey="marketing" name={t("Marketing", "营销服务")} stackId="a" fill="#10b981">
                              <LabelList dataKey="marketing" position="center" fill="#fff" fontSize={8} formatter={(v: number) => v >= 0.08 ? `${(v * 100).toFixed(0)}%` : ""} />
                            </Bar>
                            <Bar dataKey="fintech" name={t("FinTech", "金融科技")} stackId="a" fill="#f59e0b">
                              <LabelList dataKey="fintech" position="center" fill="#fff" fontSize={8} formatter={(v: number) => v >= 0.08 ? `${(v * 100).toFixed(0)}%` : ""} />
                            </Bar>
                            <Bar dataKey="others" name={t("Others", "其他")} stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                              <LabelList dataKey="others" position="center" fill="#fff" fontSize={8} formatter={(v: number) => v >= 0.08 ? `${(v * 100).toFixed(0)}%` : ""} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Margins Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gross & Operating Margins */}
                    <Card className="bg-card/20 backdrop-blur-sm border-card-border">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            {t("Gross & Operating Margins", "毛利率与经营利润率")}
                          </CardTitle>
                          <Badge variant="outline" className="tfi-mono text-[10px] uppercase py-1 px-3">{`Unit: ${UNIT_PERCENT}`}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[240px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={DATA.slice().sort((a, b) => a.year - b.year).map(computeCalculatedMetrics)}>
                              <XAxis dataKey="year" fontSize={9} stroke="#6b7280" tickLine={false} axisLine={false} />
                              <YAxis fontSize={9} stroke="#6b7280" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                              <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)}${UNIT_PERCENT}`} />
                              <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: "9px", paddingTop: "5px" }} />
                              <Line 
                                type="monotone" 
                                dataKey={(d) => (d.grossProfit / d.revenue) * 100} 
                                name={t("Gross Margin", "毛利率")}
                                stroke="#10b981" 
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line 
                                type="monotone" 
                                dataKey={(d) => (d.operatingProfit / d.revenue) * 100} 
                                name={t("Operating Margin", "经营利润率")}
                                stroke="#f59e0b" 
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Segment Margins */}
                    <Card className="bg-card/20 backdrop-blur-sm border-card-border">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            {t("Segment Margins", "分部利润率")}
                          </CardTitle>
                          <Badge variant="outline" className="tfi-mono text-[10px] uppercase py-1 px-3">{`Unit: ${UNIT_PERCENT}`}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[240px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={DATA.slice().sort((a, b) => a.year - b.year).map(computeCalculatedMetrics)}>
                              <XAxis dataKey="year" fontSize={9} stroke="#6b7280" tickLine={false} axisLine={false} />
                              <YAxis fontSize={9} stroke="#6b7280" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                              <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)}${UNIT_PERCENT}`} />
                              <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: "9px", paddingTop: "5px" }} />
                              <Line 
                                type="monotone" 
                                dataKey="vasMargin" 
                                name={t("VAS", "增值服务")}
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="marketingServicesMargin" 
                                name={t("Marketing", "营销")}
                                stroke="#ec4899" 
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="fintechMargin" 
                                name={t("FinTech", "金融科技")}
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* AI Chatbox */}
                <Card className="border-card-border bg-card/30 backdrop-blur-xl">
                  <CardHeader className="border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="tfi-title text-lg">
                          {t("Financial Analyst AI", "财务分析AI")}
                        </CardTitle>
                        <CardDescription className="tfi-mono text-[10px] uppercase tracking-wider">
                          {t("Ask questions about Tencent's financial data", "询问腾讯财务数据相关问题")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[300px] overflow-y-auto p-4 space-y-4">
                      {chatMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                          <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
                          <p className="text-sm">{t("Start a conversation about Tencent's financials", "开始关于腾讯财务的对话")}</p>
                          <p className="text-xs mt-1 opacity-70">{t("e.g., \"What was Tencent's revenue growth in 2024?\"", "例如：\"腾讯2024年营收增长如何？\"")}</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                              msg.role === "user" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted/50 border border-border"
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted/50 border border-border rounded-xl px-4 py-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border p-4">
                      <div className="flex gap-2">
                        <Input
                          data-testid="input-chat"
                          placeholder={t("Ask about Tencent's financials...", "询问腾讯财务数据...")}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                          className="flex-1"
                        />
                        <Button 
                          data-testid="button-send-chat" 
                          onClick={sendChatMessage} 
                          disabled={chatLoading || !chatInput.trim()}
                          size="icon"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-card-border bg-card/30 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="tfi-title text-2xl">{t("Financial Data Repository", "财务数据仓库")}</CardTitle>
                  <CardDescription className="tfi-mono text-[10px] uppercase tracking-widest pt-1">
                    {t("Comprehensive Metrics 2014–2024 • RMB Billions", "2014–2024 全面指标 • 人民币 十亿元")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select
                      value={tableYearFilter.length === DATA.length ? "all" : "custom"}
                      onValueChange={(v) => {
                        if (v === "all") setTableYearFilter(DATA.map(d => d.year));
                      }}
                    >
                      <SelectTrigger data-testid="select-table-year-filter" className="h-8 w-[140px] text-xs">
                        <SelectValue placeholder={t("Filter Years", "筛选年份")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("All Years", "全部年份")}</SelectItem>
                        <div className="px-2 py-1.5 border-t border-border mt-1">
                          <p className="text-[10px] text-muted-foreground mb-2">{t("Select years:", "选择年份：")}</p>
                          <div className="grid grid-cols-3 gap-1">
                            {DATA.map(d => (
                              <label key={d.year} className="flex items-center gap-1.5 cursor-pointer">
                                <Checkbox
                                  data-testid={`checkbox-year-${d.year}`}
                                  checked={tableYearFilter.includes(d.year)}
                                  onCheckedChange={(checked: boolean) => {
                                    if (checked) {
                                      setTableYearFilter([...tableYearFilter, d.year].sort());
                                    } else {
                                      setTableYearFilter(tableYearFilter.filter(y => y !== d.year));
                                    }
                                  }}
                                />
                                <span className="text-xs">{d.year}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="w-4 h-4 mr-2" />
                    {t("Export CSV", "导出数据")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-auto rounded-xl border border-border max-h-[600px]">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] tfi-mono uppercase text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-20">
                      <tr>
                        <th className="px-6 py-4 font-medium sticky left-0 bg-muted/50 z-30">{t("Metric", "指标")}</th>
                        {DATA.filter(d => tableYearFilter.includes(d.year)).map(d => (
                          <th key={d.year} className="px-6 py-4 font-medium text-center bg-muted/50">{d.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Object.entries(METRICS).map(([key, m]) => (
                        <tr key={key} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 font-medium sticky left-0 bg-card z-10 group-hover:bg-muted/30 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-foreground">{t(m.label, m.zh)}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">{m.category}</span>
                            </div>
                          </td>
                          {DATA.filter(d => tableYearFilter.includes(d.year)).map(d => {
                            const computed = computeCalculatedMetrics(d);
                            return (
                              <td key={d.year} className="px-6 py-4 text-center tfi-mono text-[13px]">
                                {formatValue((computed as any)[key])}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* TFI Intelligence Bar */}
      <footer className="border-t bg-card/80 backdrop-blur-lg p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] tfi-mono uppercase text-muted-foreground tracking-widest">
                {t("System Status: Online", "系统状态：在线")}
              </span>
            </div>
            <div className="text-[10px] tfi-mono uppercase text-muted-foreground tracking-widest">
              {t("Values: Integer (RMB Billions)", "数值：整数（人民币十亿元）")}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span>© 2026 Tencent Financial Intelligence Mockup</span>
            <div className="h-3 w-px bg-border" />
            <span>{t("Verified Data Source", "已验证数据源")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
