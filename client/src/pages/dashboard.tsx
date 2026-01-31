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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowUpRight,
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
    revenue: 377.29, grossProfit: 167.99, operatingProfit: 118.66, profitBeforeTax: 109.44, profitForYear: 95.99, profitAttrEquity: 93.33,
    totalCompIncome: 95.22, totalCompIncomeAttrEquity: 90.11, nonIfrsOperatingProfit: 118.66, nonIfrsProfitAttrEquity: 94.44,
    nonCurrentAssets: 764.44, currentAssets: 189.77, totalAssets: 954.21, equityAttrEquity: 432.22, nonControllingInterests: 56.44, 
    totalEquity: 488.66, nonCurrentLiabilities: 225.22, currentLiabilities: 240.33, totalLiabilities: 465.55, totalEquityLiabilities: 954.21,
    costOfRevenues: 209.39, sellingMarketingExpenses: 21.44, generalAdminExpenses: 53.55, otherGainsLosses: 19.11, netGainsLossesInvestments: 8.22,
    interestIncome: 6.33, financeCosts: 7.66, shareOfProfitLossAssociates: -1.77, incomeTaxExpense: 13.55,
    vasRevenue: 199.99, marketingServicesRevenue: 68.38, fintechRevenue: 101.35, othersRevenue: 7.57,
    vasGrossProfit: 105.11, marketingServicesGrossProfit: 30.22, fintechGrossProfit: 28.55, othersGrossProfit: 0.33,
    vasGrossMargin: 52.60, marketingServicesGrossMargin: 44.22, fintechGrossMargin: 28.11, othersGrossMargin: 4.00,
    cashCashEquivalents: 133.00, termDepositsOthers: 72.55, borrowings: 126.11, notesPayable: 83.55, netCash: -4.33
  },
  { 
    year: 2018, 
    revenue: 312.69, grossProfit: 142.11, operatingProfit: 97.66, profitBeforeTax: 94.55, profitForYear: 79.99, profitAttrEquity: 78.77,
    totalCompIncome: 60.22, totalCompIncomeAttrEquity: 55.11, nonIfrsOperatingProfit: 97.66, nonIfrsProfitAttrEquity: 77.55,
    nonCurrentAssets: 554.44, currentAssets: 169.77, totalAssets: 724.21, equityAttrEquity: 322.22, nonControllingInterests: 34.44, 
    totalEquity: 356.66, nonCurrentLiabilities: 165.22, currentLiabilities: 202.33, totalLiabilities: 367.55, totalEquityLiabilities: 724.21,
    costOfRevenues: 170.59, sellingMarketingExpenses: 24.22, generalAdminExpenses: 41.55, otherGainsLosses: 16.11, netGainsLossesInvestments: 5.22,
    interestIncome: 4.66, financeCosts: 4.77, shareOfProfitLossAssociates: 1.55, incomeTaxExpense: 14.66,
    vasRevenue: 176.65, marketingServicesRevenue: 58.15, fintechRevenue: 73.14, othersRevenue: 4.75,
    vasGrossProfit: 98.11, marketingServicesGrossProfit: 25.22, fintechGrossProfit: 18.55, othersGrossProfit: 0.22,
    vasGrossMargin: 55.50, marketingServicesGrossMargin: 43.33, fintechGrossMargin: 25.33, othersGrossMargin: 4.20,
    cashCashEquivalents: 97.88, termDepositsOthers: 65.55, borrowings: 114.33, notesPayable: 65.55, netCash: -17.00
  },
  { 
    year: 2017, 
    revenue: 237.76, grossProfit: 116.99, operatingProfit: 90.33, profitBeforeTax: 88.22, profitForYear: 72.55, profitAttrEquity: 71.55,
    totalCompIncome: 75.22, totalCompIncomeAttrEquity: 70.11, nonIfrsOperatingProfit: 90.33, nonIfrsProfitAttrEquity: 65.22,
    nonCurrentAssets: 404.44, currentAssets: 160.22, totalAssets: 564.66, equityAttrEquity: 256.11, nonControllingInterests: 21.44, 
    totalEquity: 277.55, nonCurrentLiabilities: 135.22, currentLiabilities: 151.99, totalLiabilities: 287.21, totalEquityLiabilities: 564.66,
    costOfRevenues: 120.86, sellingMarketingExpenses: 17.66, generalAdminExpenses: 33.11, otherGainsLosses: 20.11, netGainsLossesInvestments: 3.22,
    interestIncome: 3.99, financeCosts: 2.99, shareOfProfitLossAssociates: 0.88, incomeTaxExpense: 15.77,
    vasRevenue: 153.98, marketingServicesRevenue: 40.44, fintechRevenue: 43.34, othersRevenue: 0.00,
    vasGrossProfit: 92.11, marketingServicesGrossProfit: 15.22, fintechGrossProfit: 9.55, othersGrossProfit: 0.00,
    vasGrossMargin: 59.80, marketingServicesGrossMargin: 37.66, fintechGrossMargin: 21.99, othersGrossMargin: 0.00,
    cashCashEquivalents: 105.77, termDepositsOthers: 42.55, borrowings: 98.33, notesPayable: 34.11, netCash: 15.88
  },
  { 
    year: 2016, 
    revenue: 151.94, grossProfit: 84.55, operatingProfit: 56.11, profitBeforeTax: 51.66, profitForYear: 41.44, profitAttrEquity: 41.11,
    totalCompIncome: 45.22, totalCompIncomeAttrEquity: 40.11, nonIfrsOperatingProfit: 56.11, nonIfrsProfitAttrEquity: 45.44,
    nonCurrentAssets: 250.44, currentAssets: 145.55, totalAssets: 395.99, equityAttrEquity: 175.11, nonControllingInterests: 11.44, 
    totalEquity: 186.55, nonCurrentLiabilities: 105.22, currentLiabilities: 104.22, totalLiabilities: 209.44, totalEquityLiabilities: 395.99,
    costOfRevenues: 67.44, sellingMarketingExpenses: 12.11, generalAdminExpenses: 22.11, otherGainsLosses: 10.11, netGainsLossesInvestments: 2.22,
    interestIncome: 2.55, financeCosts: 2.11, shareOfProfitLossAssociates: -2.55, incomeTaxExpense: 10.22,
    vasRevenue: 107.81, marketingServicesRevenue: 26.97, fintechRevenue: 17.16, othersRevenue: 0.00,
    vasGrossProfit: 65.11, marketingServicesGrossProfit: 10.22, fintechGrossProfit: 9.11, othersGrossProfit: 0.00,
    vasGrossMargin: 60.40, marketingServicesGrossMargin: 37.88, fintechGrossMargin: 53.00, othersGrossMargin: 0.00,
    cashCashEquivalents: 71.99, termDepositsOthers: 55.55, borrowings: 70.33, notesPayable: 38.11, netCash: 19.00
  },
  { 
    year: 2015, 
    revenue: 102.86, grossProfit: 61.22, operatingProfit: 40.66, profitBeforeTax: 36.22, profitForYear: 29.11, profitAttrEquity: 28.88,
    totalCompIncome: 25.22, totalCompIncomeAttrEquity: 22.11, nonIfrsOperatingProfit: 40.66, nonIfrsProfitAttrEquity: 32.44,
    nonCurrentAssets: 160.44, currentAssets: 146.44, totalAssets: 306.88, equityAttrEquity: 120.11, nonControllingInterests: 1.44, 
    totalEquity: 121.55, nonCurrentLiabilities: 85.22, currentLiabilities: 100.11, totalLiabilities: 185.33, totalEquityLiabilities: 306.88,
    costOfRevenues: 41.66, sellingMarketingExpenses: 7.11, generalAdminExpenses: 16.11, otherGainsLosses: 5.11, netGainsLossesInvestments: 1.22,
    interestIncome: 1.99, financeCosts: 1.66, shareOfProfitLossAssociates: -1.55, incomeTaxExpense: 7.11,
    vasRevenue: 80.67, marketingServicesRevenue: 17.47, fintechRevenue: 4.72, othersRevenue: 0.00,
    vasGrossProfit: 50.11, marketingServicesGrossProfit: 6.22, fintechGrossProfit: 4.88, othersGrossProfit: 0.00,
    vasGrossMargin: 62.10, marketingServicesGrossMargin: 35.55, fintechGrossMargin: 101.77, othersGrossMargin: 0.00,
    cashCashEquivalents: 43.44, termDepositsOthers: 45.55, borrowings: 45.33, notesPayable: 25.11, netCash: 18.55
  },
  { 
    year: 2014, 
    revenue: 78.93, grossProfit: 48.11, operatingProfit: 30.55, profitBeforeTax: 29.22, profitForYear: 23.99, profitAttrEquity: 23.88,
    totalCompIncome: 20.22, totalCompIncomeAttrEquity: 18.11, nonIfrsOperatingProfit: 30.55, nonIfrsProfitAttrEquity: 24.22,
    nonCurrentAssets: 105.44, currentAssets: 65.88, totalAssets: 171.32, equityAttrEquity: 80.11, nonControllingInterests: 0.44, 
    totalEquity: 80.55, nonCurrentLiabilities: 45.22, currentLiabilities: 45.55, totalLiabilities: 90.77, totalEquityLiabilities: 171.32,
    costOfRevenues: 30.83, sellingMarketingExpenses: 5.11, generalAdminExpenses: 12.11, otherGainsLosses: 2.11, netGainsLossesInvestments: 0.22,
    interestIncome: 1.55, financeCosts: 1.11, shareOfProfitLossAssociates: -0.55, incomeTaxExpense: 5.33,
    vasRevenue: 63.31, marketingServicesRevenue: 9.46, fintechRevenue: 6.16, othersRevenue: 0.00,
    vasGrossProfit: 40.11, marketingServicesGrossProfit: 4.22, fintechGrossProfit: 3.88, othersGrossProfit: 0.00,
    vasGrossMargin: 63.30, marketingServicesGrossMargin: 44.44, fintechGrossMargin: 61.77, othersGrossMargin: 0.00,
    cashCashEquivalents: 42.77, termDepositsOthers: 15.55, borrowings: 8.33, notesPayable: 15.11, netCash: 34.88
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
  const [chatInput, setChatInput] = useState("");

  const filteredData = useMemo(() => {
    const base = DATA.filter((d) => d.year >= yearRange[0] && d.year <= yearRange[1]).sort((a, b) => a.year - b.year);
    if (plotMode === "yoy") {
      return base.map((d, i, arr) => {
        if (i === 0) {
          const prevYearData = DATA.find(prev => prev.year === d.year - 1);
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
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => setReportsOpen(true)}>
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
                          formatter={(value: number) => [formatValue(value), ""]}
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
                          formatter={(value: number) => [formatValue(value), ""]}
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
                            {formatValue(d[m])}
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
