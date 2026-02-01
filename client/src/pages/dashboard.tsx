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
    revenue: 660.34, grossProfit: 349.22, operatingProfit: 215.11, profitBeforeTax: 231.54, profitForYear: 186.22, profitAttrEquity: 194.14,
    totalCompIncome: 212.45, totalCompIncomeAttrEquity: 202.12, nonIfrsOperatingProfit: 226.88, nonIfrsProfitAttrEquity: 192.44,
    nonCurrentAssets: 1185.22, currentAssets: 595.88, totalAssets: 1781.10, equityAttrEquity: 924.55, nonControllingInterests: 78.44, 
    totalEquity: 1002.99, nonCurrentLiabilities: 432.11, currentLiabilities: 346.00, totalLiabilities: 778.11, totalEquityLiabilities: 1781.10,
    costOfRevenues: 311.12, sellingMarketingExpenses: 44.55, generalAdminExpenses: 112.33, otherGainsLosses: 34.22, netGainsLossesInvestments: 24.55,
    interestIncome: 12.44, financeCosts: 10.22, shareOfProfitLossAssociates: 15.66, incomeTaxExpense: 45.33,
    vasRevenue: 352.44, marketingServicesRevenue: 112.33, fintechRevenue: 225.22, othersRevenue: 15.44,
    vasGrossProfit: 185.44, marketingServicesGrossProfit: 55.22, fintechGrossProfit: 95.11, othersGrossProfit: 2.11,
    vasGrossMargin: 52.61, marketingServicesGrossMargin: 49.15, fintechGrossMargin: 42.23, othersGrossMargin: 13.64,
    cashCashEquivalents: 180.22, termDepositsOthers: 151.33, borrowings: 141.22, notesPayable: 121.11, netCash: 76.88
  },
  { 
    year: 2023, 
    revenue: 609.01, grossProfit: 293.11, operatingProfit: 161.77, profitBeforeTax: 150.33, profitForYear: 118.11, profitAttrEquity: 115.22,
    totalCompIncome: 125.44, totalCompIncomeAttrEquity: 120.11, nonIfrsOperatingProfit: 161.99, nonIfrsProfitAttrEquity: 157.77,
    nonCurrentAssets: 1035.44, currentAssets: 524.22, totalAssets: 1559.66, equityAttrEquity: 780.22, nonControllingInterests: 65.44, 
    totalEquity: 845.66, nonCurrentLiabilities: 385.22, currentLiabilities: 328.88, totalLiabilities: 714.10, totalEquityLiabilities: 1559.66,
    costOfRevenues: 315.90, sellingMarketingExpenses: 34.22, generalAdminExpenses: 103.55, otherGainsLosses: 28.44, netGainsLossesInvestments: 18.22,
    interestIncome: 10.11, financeCosts: 9.22, shareOfProfitLossAssociates: 12.11, incomeTaxExpense: 32.22,
    vasRevenue: 298.44, marketingServicesRevenue: 101.55, fintechRevenue: 203.88, othersRevenue: 12.33,
    vasGrossProfit: 151.66, marketingServicesGrossProfit: 51.44, fintechGrossProfit: 80.99, othersGrossProfit: 1.22,
    vasGrossMargin: 50.82, marketingServicesGrossMargin: 50.65, fintechGrossMargin: 39.73, othersGrossMargin: 9.89,
    cashCashEquivalents: 172.55, termDepositsOthers: 135.22, borrowings: 132.11, notesPayable: 110.44, netCash: 54.44
  },
  { 
    year: 2022, 
    revenue: 554.55, grossProfit: 238.77, operatingProfit: 153.55, profitBeforeTax: 210.22, profitForYear: 188.44, profitAttrEquity: 188.22,
    totalCompIncome: 175.22, totalCompIncomeAttrEquity: 170.11, nonIfrsOperatingProfit: 153.55, nonIfrsProfitAttrEquity: 115.66,
    nonCurrentAssets: 1005.44, currentAssets: 502.11, totalAssets: 1507.55, equityAttrEquity: 750.22, nonControllingInterests: 60.11, 
    totalEquity: 810.33, nonCurrentLiabilities: 370.22, currentLiabilities: 327.00, totalLiabilities: 697.22, totalEquityLiabilities: 1507.55,
    costOfRevenues: 315.85, sellingMarketingExpenses: 29.22, generalAdminExpenses: 102.11, otherGainsLosses: 25.11, netGainsLossesInvestments: 15.22,
    interestIncome: 8.22, financeCosts: 8.11, shareOfProfitLossAssociates: 10.11, incomeTaxExpense: 21.88,
    vasRevenue: 287.66, marketingServicesRevenue: 82.77, fintechRevenue: 177.11, othersRevenue: 10.15,
    vasGrossProfit: 145.22, marketingServicesGrossProfit: 35.11, fintechGrossProfit: 65.22, othersGrossProfit: 1.11,
    vasGrossMargin: 50.50, marketingServicesGrossMargin: 42.44, fintechGrossMargin: 36.88, othersGrossMargin: 10.89,
    cashCashEquivalents: 156.77, termDepositsOthers: 125.11, borrowings: 128.55, notesPayable: 105.22, netCash: 48.33
  },
  { 
    year: 2021, 
    revenue: 560.12, grossProfit: 245.99, operatingProfit: 159.55, profitBeforeTax: 248.11, profitForYear: 224.88, profitAttrEquity: 224.88,
    totalCompIncome: 235.22, totalCompIncomeAttrEquity: 230.11, nonIfrsOperatingProfit: 159.55, nonIfrsProfitAttrEquity: 123.88,
    nonCurrentAssets: 1025.44, currentAssets: 486.77, totalAssets: 1512.21, equityAttrEquity: 780.22, nonControllingInterests: 55.44, 
    totalEquity: 835.66, nonCurrentLiabilities: 350.22, currentLiabilities: 326.33, totalLiabilities: 676.55, totalEquityLiabilities: 1512.21,
    costOfRevenues: 314.22, sellingMarketingExpenses: 28.11, generalAdminExpenses: 89.55, otherGainsLosses: 20.11, netGainsLossesInvestments: 12.22,
    interestIncome: 7.11, financeCosts: 7.22, shareOfProfitLossAssociates: 8.22, incomeTaxExpense: 23.33,
    vasRevenue: 291.57, marketingServicesRevenue: 88.67, fintechRevenue: 172.19, othersRevenue: 7.69,
    vasGrossProfit: 152.11, marketingServicesGrossProfit: 38.22, fintechGrossProfit: 60.55, othersGrossProfit: 0.88,
    vasGrossMargin: 52.20, marketingServicesGrossMargin: 43.11, fintechGrossMargin: 35.11, othersGrossMargin: 10.40,
    cashCashEquivalents: 150.22, termDepositsOthers: 118.55, borrowings: 120.11, notesPayable: 102.55, netCash: 45.11
  },
  { 
    year: 2020, 
    revenue: 482.06, grossProfit: 221.55, operatingProfit: 184.22, profitBeforeTax: 180.11, profitForYear: 160.11, profitAttrEquity: 159.88,
    totalCompIncome: 165.22, totalCompIncomeAttrEquity: 160.11, nonIfrsOperatingProfit: 184.22, nonIfrsProfitAttrEquity: 122.77,
    nonCurrentAssets: 985.44, currentAssets: 415.77, totalAssets: 1401.21, equityAttrEquity: 680.22, nonControllingInterests: 45.44, 
    totalEquity: 725.66, nonCurrentLiabilities: 330.22, currentLiabilities: 345.33, totalLiabilities: 675.55, totalEquityLiabilities: 1401.21,
    costOfRevenues: 260.56, sellingMarketingExpenses: 24.11, generalAdminExpenses: 78.55, otherGainsLosses: 15.11, netGainsLossesInvestments: 10.22,
    interestIncome: 6.11, financeCosts: 6.22, shareOfProfitLossAssociates: 7.22, incomeTaxExpense: 20.00,
    vasRevenue: 264.21, marketingServicesRevenue: 82.27, fintechRevenue: 128.09, othersRevenue: 7.49,
    vasGrossProfit: 140.11, marketingServicesGrossProfit: 35.22, fintechGrossProfit: 45.55, othersGrossProfit: 0.55,
    vasGrossMargin: 53.00, marketingServicesGrossMargin: 42.88, fintechGrossMargin: 35.55, othersGrossMargin: 6.70,
    cashCashEquivalents: 142.22, termDepositsOthers: 105.55, borrowings: 115.11, notesPayable: 95.55, netCash: 36.66
  },
  { 
    year: 2019, 
    revenue: 377.29, grossProfit: 167.35, operatingProfit: 118.49, profitBeforeTax: 109.28, profitForYear: 95.84, profitAttrEquity: 93.12,
    totalCompIncome: 95.43, totalCompIncomeAttrEquity: 90.26, nonIfrsOperatingProfit: 118.57, nonIfrsProfitAttrEquity: 94.18,
    nonCurrentAssets: 764.12, currentAssets: 189.54, totalAssets: 953.66, equityAttrEquity: 432.81, nonControllingInterests: 56.12, 
    totalEquity: 488.93, nonCurrentLiabilities: 225.47, currentLiabilities: 240.12, totalLiabilities: 465.59, totalEquityLiabilities: 954.52,
    costOfRevenues: 209.94, sellingMarketingExpenses: 21.36, generalAdminExpenses: 53.28, otherGainsLosses: 19.45, netGainsLossesInvestments: 8.71,
    interestIncome: 6.29, financeCosts: 7.54, shareOfProfitLossAssociates: -1.63, incomeTaxExpense: 13.44,
    vasRevenue: 199.85, marketingServicesRevenue: 68.21, fintechRevenue: 101.43, othersRevenue: 7.80,
    vasGrossProfit: 105.37, marketingServicesGrossProfit: 30.12, fintechGrossProfit: 28.46, othersGrossProfit: 0.35,
    vasGrossMargin: 52.73, marketingServicesGrossMargin: 44.15, fintechGrossMargin: 28.06, othersGrossMargin: 4.49,
    cashCashEquivalents: 133.22, termDepositsOthers: 72.48, borrowings: 126.31, notesPayable: 83.15, netCash: -4.24
  },
  { 
    year: 2018, 
    revenue: 312.69, grossProfit: 142.34, operatingProfit: 97.52, profitBeforeTax: 94.41, profitForYear: 79.86, profitAttrEquity: 78.63,
    totalCompIncome: 60.15, totalCompIncomeAttrEquity: 55.24, nonIfrsOperatingProfit: 97.48, nonIfrsProfitAttrEquity: 77.39,
    nonCurrentAssets: 554.12, currentAssets: 169.85, totalAssets: 723.97, equityAttrEquity: 322.45, nonControllingInterests: 34.18, 
    totalEquity: 356.63, nonCurrentLiabilities: 165.41, currentLiabilities: 202.12, totalLiabilities: 367.53, totalEquityLiabilities: 724.16,
    costOfRevenues: 170.35, sellingMarketingExpenses: 24.18, generalAdminExpenses: 41.62, otherGainsLosses: 16.29, netGainsLossesInvestments: 5.43,
    interestIncome: 4.58, financeCosts: 4.81, shareOfProfitLossAssociates: 1.67, incomeTaxExpense: 14.52,
    vasRevenue: 176.53, marketingServicesRevenue: 58.24, fintechRevenue: 73.08, othersRevenue: 4.84,
    vasGrossProfit: 98.26, marketingServicesGrossProfit: 25.14, fintechGrossProfit: 18.43, othersGrossProfit: 0.26,
    vasGrossMargin: 55.67, marketingServicesGrossMargin: 43.16, fintechGrossMargin: 25.22, othersGrossMargin: 4.37,
    cashCashEquivalents: 97.94, termDepositsOthers: 65.42, borrowings: 114.28, notesPayable: 65.31, netCash: -17.06
  },
  { 
    year: 2017, 
    revenue: 237.76, grossProfit: 116.84, operatingProfit: 90.26, profitBeforeTax: 88.15, profitForYear: 72.43, profitAttrEquity: 71.39,
    totalCompIncome: 75.18, totalCompIncomeAttrEquity: 70.25, nonIfrsOperatingProfit: 90.17, nonIfrsProfitAttrEquity: 65.42,
    nonCurrentAssets: 404.12, currentAssets: 160.35, totalAssets: 564.47, equityAttrEquity: 256.41, nonControllingInterests: 21.36, 
    totalEquity: 277.77, nonCurrentLiabilities: 135.48, currentLiabilities: 151.82, totalLiabilities: 287.30, totalEquityLiabilities: 565.07,
    costOfRevenues: 120.92, sellingMarketingExpenses: 17.53, generalAdminExpenses: 33.24, otherGainsLosses: 20.36, netGainsLossesInvestments: 3.18,
    interestIncome: 3.85, financeCosts: 2.71, shareOfProfitLossAssociates: 0.94, incomeTaxExpense: 15.62,
    vasRevenue: 153.84, marketingServicesRevenue: 40.52, fintechRevenue: 43.40, othersRevenue: 0.00,
    vasGrossProfit: 92.24, marketingServicesGrossProfit: 15.18, fintechGrossProfit: 9.63, othersGrossProfit: 0.00,
    vasGrossMargin: 59.96, marketingServicesGrossMargin: 37.47, fintechGrossMargin: 22.19, othersGrossMargin: 0.00,
    cashCashEquivalents: 105.62, termDepositsOthers: 42.34, borrowings: 98.15, notesPayable: 34.28, netCash: 15.93
  },
  { 
    year: 2016, 
    revenue: 151.94, grossProfit: 84.41, operatingProfit: 56.28, profitBeforeTax: 51.52, profitForYear: 41.36, profitAttrEquity: 41.25,
    totalCompIncome: 45.18, totalCompIncomeAttrEquity: 40.35, nonIfrsOperatingProfit: 56.42, nonIfrsProfitAttrEquity: 45.18,
    nonCurrentAssets: 250.63, currentAssets: 145.42, totalAssets: 396.05, equityAttrEquity: 175.29, nonControllingInterests: 11.36, 
    totalEquity: 186.65, nonCurrentLiabilities: 105.47, currentLiabilities: 104.18, totalLiabilities: 209.65, totalEquityLiabilities: 396.30,
    costOfRevenues: 67.53, sellingMarketingExpenses: 12.24, generalAdminExpenses: 22.36, otherGainsLosses: 10.48, netGainsLossesInvestments: 2.15,
    interestIncome: 2.62, financeCosts: 2.18, shareOfProfitLossAssociates: -2.41, incomeTaxExpense: 10.35,
    vasRevenue: 107.65, marketingServicesRevenue: 27.12, fintechRevenue: 17.17, othersRevenue: 0.00,
    vasGrossProfit: 65.29, marketingServicesGrossProfit: 10.34, fintechGrossProfit: 9.25, othersGrossProfit: 0.00,
    vasGrossMargin: 60.65, marketingServicesGrossMargin: 38.12, fintechGrossMargin: 53.87, othersGrossMargin: 0.00,
    cashCashEquivalents: 71.84, termDepositsOthers: 55.43, borrowings: 70.26, notesPayable: 38.21, netCash: 19.12
  },
  { 
    year: 2015, 
    revenue: 102.86, grossProfit: 61.35, operatingProfit: 40.52, profitBeforeTax: 36.41, profitForYear: 29.28, profitAttrEquity: 28.71,
    totalCompIncome: 25.43, totalCompIncomeAttrEquity: 22.36, nonIfrsOperatingProfit: 40.29, nonIfrsProfitAttrEquity: 32.18,
    nonCurrentAssets: 160.82, currentAssets: 146.35, totalAssets: 307.17, equityAttrEquity: 120.25, nonControllingInterests: 1.36, 
    totalEquity: 121.61, nonCurrentLiabilities: 85.18, currentLiabilities: 100.26, totalLiabilities: 185.44, totalEquityLiabilities: 307.05,
    costOfRevenues: 41.51, sellingMarketingExpenses: 7.24, generalAdminExpenses: 16.29, otherGainsLosses: 5.36, netGainsLossesInvestments: 1.18,
    interestIncome: 1.85, financeCosts: 1.52, shareOfProfitLossAssociates: -1.48, incomeTaxExpense: 7.29,
    vasRevenue: 80.52, marketingServicesRevenue: 17.54, fintechRevenue: 4.80, othersRevenue: 0.00,
    vasGrossProfit: 50.28, marketingServicesGrossProfit: 6.15, fintechGrossProfit: 4.71, othersGrossProfit: 0.00,
    vasGrossMargin: 62.44, marketingServicesGrossMargin: 35.06, fintechGrossMargin: 98.12, othersGrossMargin: 0.00,
    cashCashEquivalents: 43.52, termDepositsOthers: 45.41, borrowings: 45.26, notesPayable: 25.35, netCash: 18.63
  },
  { 
    year: 2014, 
    revenue: 78.93, grossProfit: 48.26, operatingProfit: 30.41, profitBeforeTax: 29.15, profitForYear: 23.82, profitAttrEquity: 23.74,
    totalCompIncome: 20.35, totalCompIncomeAttrEquity: 18.29, nonIfrsOperatingProfit: 30.28, nonIfrsProfitAttrEquity: 24.15,
    nonCurrentAssets: 105.62, currentAssets: 65.74, totalAssets: 171.36, equityAttrEquity: 80.25, nonControllingInterests: 0.36, 
    totalEquity: 80.61, nonCurrentLiabilities: 45.35, currentLiabilities: 45.41, totalLiabilities: 90.76, totalEquityLiabilities: 171.37,
    costOfRevenues: 30.67, sellingMarketingExpenses: 5.29, generalAdminExpenses: 12.36, otherGainsLosses: 2.41, netGainsLossesInvestments: 0.18,
    interestIncome: 1.43, financeCosts: 1.25, shareOfProfitLossAssociates: -0.62, incomeTaxExpense: 5.48,
    vasRevenue: 63.15, marketingServicesRevenue: 9.52, fintechRevenue: 6.26, othersRevenue: 0.00,
    vasGrossProfit: 40.29, marketingServicesGrossProfit: 4.15, fintechGrossProfit: 3.74, othersGrossProfit: 0.00,
    vasGrossMargin: 63.80, marketingServicesGrossMargin: 43.59, fintechGrossMargin: 59.74, othersGrossMargin: 0.00,
    cashCashEquivalents: 42.63, termDepositsOthers: 15.48, borrowings: 8.41, notesPayable: 15.25, netCash: 34.22
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
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(v);
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
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="w-4 h-4 mr-2" />
                  {t("Export CSV", "导出数据")}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] tfi-mono uppercase text-muted-foreground bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium sticky left-0 bg-card z-10">{t("Metric", "指标")}</th>
                        {DATA.map(d => (
                          <th key={d.year} className="px-6 py-4 font-medium text-center">{d.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Object.entries(METRICS).map(([key, m]) => (
                        <tr key={key} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 font-medium sticky left-0 bg-card z-10 group-hover:bg-white/5 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-foreground">{t(m.label, m.zh)}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">{m.category}</span>
                            </div>
                          </td>
                          {DATA.map(d => {
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
              {t("Precision: 2 Decimal Places", "精度：2位小数")}
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
