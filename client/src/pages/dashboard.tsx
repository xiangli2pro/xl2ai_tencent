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
  { 
    year: 2022, 
    revenue: 554.6, grossProfit: 245.0, operatingProfit: 184.0, profitBeforeTax: 190.0, profitForYear: 120.0, profitAttrEquity: 115.6,
    totalCompIncome: 150.0, totalCompIncomeAttrEquity: 140.0, nonIfrsOperatingProfit: 175.0, nonIfrsProfitAttrEquity: 150.0,
    nonCurrentAssets: 1100.0, currentAssets: 550.0, totalAssets: 1650.0, equityAttrEquity: 850.0, nonControllingInterests: 70.0, 
    totalEquity: 920.0, nonCurrentLiabilities: 400.0, currentLiabilities: 330.0, totalLiabilities: 730.0, totalEquityLiabilities: 1650.0,
    costOfRevenues: 309.6, sellingMarketingExpenses: 35.0, generalAdminExpenses: 98.0, otherGainsLosses: 25.0, netGainsLossesInvestments: 18.0,
    interestIncome: 8.5, financeCosts: 8.0, shareOfProfitLossAssociates: 10.0, incomeTaxExpense: 35.0,
    vasRevenue: 319.0, marketingServicesRevenue: 82.8, fintechRevenue: 177.7, othersRevenue: 10.0,
    vasGrossProfit: 165.0, marketingServicesGrossProfit: 35.0, fintechGrossProfit: 70.0, othersGrossProfit: 1.0,
    vasGrossMargin: 51.7, marketingServicesGrossMargin: 42.3, fintechGrossMargin: 39.4, othersGrossMargin: 10.0,
    cashCashEquivalents: 160.0, termDepositsOthers: 130.0, borrowings: 130.0, notesPayable: 110.0, netCash: 50.0
  },
  { 
    year: 2021, 
    revenue: 560.1, grossProfit: 250.0, operatingProfit: 190.0, profitBeforeTax: 210.0, profitForYear: 230.0, profitAttrEquity: 224.8,
    totalCompIncome: 240.0, totalCompIncomeAttrEquity: 230.0, nonIfrsOperatingProfit: 185.0, nonIfrsProfitAttrEquity: 160.0,
    nonCurrentAssets: 1050.0, currentAssets: 500.0, totalAssets: 1550.0, equityAttrEquity: 800.0, nonControllingInterests: 65.0, 
    totalEquity: 865.0, nonCurrentLiabilities: 380.0, currentLiabilities: 305.0, totalLiabilities: 685.0, totalEquityLiabilities: 1550.0,
    costOfRevenues: 310.1, sellingMarketingExpenses: 30.0, generalAdminExpenses: 90.0, otherGainsLosses: 20.0, netGainsLossesInvestments: 15.0,
    interestIncome: 7.0, financeCosts: 7.0, shareOfProfitLossAssociates: 8.0, incomeTaxExpense: 30.0,
    vasRevenue: 291.6, marketingServicesRevenue: 88.7, fintechRevenue: 172.2, othersRevenue: 8.0,
    vasGrossProfit: 150.0, marketingServicesGrossProfit: 38.0, fintechGrossProfit: 65.0, othersGrossProfit: 0.8,
    vasGrossMargin: 51.4, marketingServicesGrossMargin: 42.8, fintechGrossMargin: 37.7, othersGrossMargin: 10.0,
    cashCashEquivalents: 150.0, termDepositsOthers: 120.0, borrowings: 125.0, notesPayable: 105.0, netCash: 40.0
  },
  { 
    year: 2020, 
    revenue: 482.1, grossProfit: 221.5, operatingProfit: 152.2, profitBeforeTax: 170.0, profitForYear: 165.0, profitAttrEquity: 159.8,
    totalCompIncome: 180.0, totalCompIncomeAttrEquity: 170.0, nonIfrsOperatingProfit: 155.0, nonIfrsProfitAttrEquity: 130.0,
    nonCurrentAssets: 950.0, currentAssets: 450.0, totalAssets: 1400.0, equityAttrEquity: 700.0, nonControllingInterests: 55.0, 
    totalEquity: 755.0, nonCurrentLiabilities: 350.0, currentLiabilities: 295.0, totalLiabilities: 645.0, totalEquityLiabilities: 1400.0,
    costOfRevenues: 260.6, sellingMarketingExpenses: 25.0, generalAdminExpenses: 80.0, otherGainsLosses: 15.0, netGainsLossesInvestments: 12.0,
    interestIncome: 6.0, financeCosts: 6.0, shareOfProfitLossAssociates: 6.0, incomeTaxExpense: 25.0,
    vasRevenue: 264.2, marketingServicesRevenue: 82.2, fintechRevenue: 128.0, othersRevenue: 7.7,
    vasGrossProfit: 135.0, marketingServicesGrossProfit: 35.0, fintechGrossProfit: 50.0, othersGrossProfit: 0.5,
    vasGrossMargin: 51.1, marketingServicesGrossMargin: 42.6, fintechGrossMargin: 39.1, othersGrossMargin: 6.5,
    cashCashEquivalents: 140.0, termDepositsOthers: 110.0, borrowings: 120.0, notesPayable: 100.0, netCash: 30.0
  },
  { 
    year: 2019, 
    revenue: 377.3, grossProfit: 167.9, operatingProfit: 98.2, profitBeforeTax: 115.0, profitForYear: 100.0, profitAttrEquity: 94.4,
    totalCompIncome: 110.0, totalCompIncomeAttrEquity: 105.0, nonIfrsOperatingProfit: 110.0, nonIfrsProfitAttrEquity: 95.0,
    nonCurrentAssets: 850.0, currentAssets: 400.0, totalAssets: 1250.0, equityAttrEquity: 600.0, nonControllingInterests: 45.0, 
    totalEquity: 645.0, nonCurrentLiabilities: 320.0, currentLiabilities: 285.0, totalLiabilities: 605.0, totalEquityLiabilities: 1250.0,
    costOfRevenues: 209.4, sellingMarketingExpenses: 20.0, generalAdminExpenses: 70.0, otherGainsLosses: 10.0, netGainsLossesInvestments: 10.0,
    interestIncome: 5.0, financeCosts: 5.0, shareOfProfitLossAssociates: 5.0, incomeTaxExpense: 20.0,
    vasRevenue: 184.7, marketingServicesRevenue: 68.4, fintechRevenue: 101.4, othersRevenue: 22.8,
    vasGrossProfit: 100.0, marketingServicesGrossProfit: 30.0, fintechGrossProfit: 35.0, othersGrossProfit: 0.3,
    vasGrossMargin: 54.1, marketingServicesGrossMargin: 43.9, fintechGrossMargin: 34.5, othersGrossMargin: 1.3,
    cashCashEquivalents: 130.0, termDepositsOthers: 100.0, borrowings: 115.0, notesPayable: 95.0, netCash: 20.0
  },
  { 
    year: 2018, 
    revenue: 312.7, grossProfit: 140.8, operatingProfit: 79.2, profitBeforeTax: 95.0, profitForYear: 80.0, profitAttrEquity: 78.7,
    totalCompIncome: 85.0, totalCompIncomeAttrEquity: 80.0, nonIfrsOperatingProfit: 90.0, nonIfrsProfitAttrEquity: 80.0,
    nonCurrentAssets: 750.0, currentAssets: 350.0, totalAssets: 1100.0, equityAttrEquity: 500.0, nonControllingInterests: 35.0, 
    totalEquity: 535.0, nonCurrentLiabilities: 300.0, currentLiabilities: 265.0, totalLiabilities: 565.0, totalEquityLiabilities: 1100.0,
    costOfRevenues: 171.9, sellingMarketingExpenses: 15.0, generalAdminExpenses: 60.0, otherGainsLosses: 8.0, netGainsLossesInvestments: 8.0,
    interestIncome: 4.0, financeCosts: 4.0, shareOfProfitLossAssociates: 4.0, incomeTaxExpense: 15.0,
    vasRevenue: 176.6, marketingServicesRevenue: 58.1, fintechRevenue: 72.5, othersRevenue: 5.5,
    vasGrossProfit: 95.0, marketingServicesGrossProfit: 25.0, fintechGrossProfit: 20.0, othersGrossProfit: 0.2,
    vasGrossMargin: 53.8, marketingServicesGrossMargin: 43.0, fintechGrossMargin: 27.6, othersGrossMargin: 3.6,
    cashCashEquivalents: 120.0, termDepositsOthers: 90.0, borrowings: 110.0, notesPayable: 90.0, netCash: 10.0
  },
  { 
    year: 2017, 
    revenue: 237.8, grossProfit: 124.3, operatingProfit: 67.7, profitBeforeTax: 85.0, profitForYear: 75.0, profitAttrEquity: 71.6,
    totalCompIncome: 80.0, totalCompIncomeAttrEquity: 75.0, nonIfrsOperatingProfit: 80.0, nonIfrsProfitAttrEquity: 70.0,
    nonCurrentAssets: 650.0, currentAssets: 300.0, totalAssets: 950.0, equityAttrEquity: 450.0, nonControllingInterests: 25.0, 
    totalEquity: 475.0, nonCurrentLiabilities: 280.0, currentLiabilities: 195.0, totalLiabilities: 475.0, totalEquityLiabilities: 950.0,
    costOfRevenues: 113.5, sellingMarketingExpenses: 12.0, generalAdminExpenses: 50.0, otherGainsLosses: 5.0, netGainsLossesInvestments: 5.0,
    interestIncome: 3.0, financeCosts: 3.0, shareOfProfitLossAssociates: 3.0, incomeTaxExpense: 10.0,
    vasRevenue: 154.0, marketingServicesRevenue: 35.0, fintechRevenue: 38.2, othersRevenue: 10.6,
    vasGrossProfit: 85.0, marketingServicesGrossProfit: 15.0, fintechGrossProfit: 10.0, othersGrossProfit: 0.1,
    vasGrossMargin: 55.2, marketingServicesGrossMargin: 42.9, fintechGrossMargin: 26.2, othersGrossMargin: 0.9,
    cashCashEquivalents: 110.0, termDepositsOthers: 80.0, borrowings: 100.0, notesPayable: 80.0, netCash: 10.0
  },
  { 
    year: 2016, 
    revenue: 151.9, grossProfit: 85.0, operatingProfit: 50.0, profitBeforeTax: 60.0, profitForYear: 45.0, profitAttrEquity: 41.0,
    totalCompIncome: 50.0, totalCompIncomeAttrEquity: 45.0, nonIfrsOperatingProfit: 60.0, nonIfrsProfitAttrEquity: 50.0,
    nonCurrentAssets: 550.0, currentAssets: 250.0, totalAssets: 800.0, equityAttrEquity: 400.0, nonControllingInterests: 20.0, 
    totalEquity: 420.0, nonCurrentLiabilities: 250.0, currentLiabilities: 130.0, totalLiabilities: 380.0, totalEquityLiabilities: 800.0,
    costOfRevenues: 66.9, sellingMarketingExpenses: 10.0, generalAdminExpenses: 40.0, otherGainsLosses: 3.0, netGainsLossesInvestments: 3.0,
    interestIncome: 2.0, financeCosts: 2.0, shareOfProfitLossAssociates: 2.0, incomeTaxExpense: 8.0,
    vasRevenue: 84.1, marketingServicesRevenue: 26.9, fintechRevenue: 21.0, othersRevenue: 19.9,
    vasGrossProfit: 55.0, marketingServicesGrossProfit: 10.0, fintechGrossProfit: 5.0, othersGrossProfit: 0.1,
    vasGrossMargin: 65.4, marketingServicesGrossMargin: 37.2, fintechGrossMargin: 23.8, othersGrossMargin: 0.5,
    cashCashEquivalents: 100.0, termDepositsOthers: 70.0, borrowings: 90.0, notesPayable: 70.0, netCash: 10.0
  },
  { 
    year: 2015, 
    revenue: 102.9, grossProfit: 58.1, operatingProfit: 32.6, profitBeforeTax: 40.0, profitForYear: 30.0, profitAttrEquity: 28.8,
    totalCompIncome: 35.0, totalCompIncomeAttrEquity: 32.0, nonIfrsOperatingProfit: 45.0, nonIfrsProfitAttrEquity: 35.0,
    nonCurrentAssets: 450.0, currentAssets: 200.0, totalAssets: 650.0, equityAttrEquity: 350.0, nonControllingInterests: 15.0, 
    totalEquity: 365.0, nonCurrentLiabilities: 200.0, currentLiabilities: 85.0, totalLiabilities: 285.0, totalEquityLiabilities: 650.0,
    costOfRevenues: 44.8, sellingMarketingExpenses: 8.0, generalAdminExpenses: 30.0, otherGainsLosses: 2.0, netGainsLossesInvestments: 2.0,
    interestIncome: 1.5, financeCosts: 1.5, shareOfProfitLossAssociates: 1.0, incomeTaxExpense: 5.0,
    vasRevenue: 59.7, marketingServicesRevenue: 17.5, fintechRevenue: 10.7, othersRevenue: 15.0,
    vasGrossProfit: 40.0, marketingServicesGrossProfit: 5.0, fintechGrossProfit: 2.0, othersGrossProfit: 0.1,
    vasGrossMargin: 67.0, marketingServicesGrossMargin: 28.6, fintechGrossMargin: 18.7, othersGrossMargin: 0.7,
    cashCashEquivalents: 90.0, termDepositsOthers: 60.0, borrowings: 80.0, notesPayable: 60.0, netCash: 10.0
  },
  { 
    year: 2014, 
    revenue: 78.9, grossProfit: 48.0, operatingProfit: 28.0, profitBeforeTax: 35.0, profitForYear: 25.0, profitAttrEquity: 23.8,
    totalCompIncome: 30.0, totalCompIncomeAttrEquity: 28.0, nonIfrsOperatingProfit: 35.0, nonIfrsProfitAttrEquity: 30.0,
    nonCurrentAssets: 400.0, currentAssets: 150.0, totalAssets: 550.0, equityAttrEquity: 300.0, nonControllingInterests: 10.0, 
    totalEquity: 310.0, nonCurrentLiabilities: 150.0, currentLiabilities: 90.0, totalLiabilities: 240.0, totalEquityLiabilities: 550.0,
    costOfRevenues: 30.9, sellingMarketingExpenses: 7.0, generalAdminExpenses: 25.0, otherGainsLosses: 1.0, netGainsLossesInvestments: 1.0,
    interestIncome: 1.0, financeCosts: 1.0, shareOfProfitLossAssociates: 1.0, incomeTaxExpense: 4.0,
    vasRevenue: 45.0, marketingServicesRevenue: 12.0, fintechRevenue: 8.0, othersRevenue: 13.9,
    vasGrossProfit: 30.0, marketingServicesGrossProfit: 4.0, fintechGrossProfit: 1.5, othersGrossProfit: 0.1,
    vasGrossMargin: 66.7, marketingServicesGrossMargin: 33.3, fintechGrossMargin: 18.8, othersGrossMargin: 0.7,
    cashCashEquivalents: 80.0, termDepositsOthers: 50.0, borrowings: 70.0, notesPayable: 50.0, netCash: 10.0
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
