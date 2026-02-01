import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, Cell, LabelList
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, Activity, 
  Download, Filter, Calendar, RefreshCw, ChevronRight, 
  ArrowUpRight, ArrowDownRight, Info, BookOpen,
  LayoutDashboard, Table as TableIcon, Search, Send, User,
  Globe, Shield, Zap, Target, Plus, Trash2, MessageCircle, Bot, Pencil, MessageSquare
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
  revenue: { label: "Revenue (B)", color: "#3b82f6", zh: "收入", category: "Performance" },
  grossProfit: { label: "Gross Profit (B)", color: "#10b981", zh: "毛利", category: "Performance" },
  operatingProfit: { label: "Operating Profit (B)", color: "#f59e0b", zh: "经营利润", category: "Performance" },
  profitBeforeTax: { label: "Profit Before Income Tax (B)", color: "#8b5cf6", zh: "除税前利润", category: "Performance" },
  profitForYear: { label: "Profit for the Year (B)", color: "#ec4899", zh: "年度利润", category: "Performance" },
  profitAttrEquity: { label: "Profit Attr. to Equity Holders (B)", color: "#f43f5e", zh: "权益持有人应占利润", category: "Performance" },
  totalCompIncome: { label: "Total Comprehensive Income (B)", color: "#fb7185", zh: "综合收益总额", category: "Performance" },
  totalCompIncomeAttrEquity: { label: "Total Comp. Income Attr. to Equity Holders (B)", color: "#f472b6", zh: "权益持有人应占综合收益总额", category: "Performance" },
  nonIfrsOperatingProfit: { label: "Non-IFRS Operating Profit (B)", color: "#6366f1", zh: "非国际财务报告准则经营利润", category: "Performance" },
  nonIfrsProfitAttrEquity: { label: "Non-IFRS Profit Attr. to Equity Holders (B)", color: "#06b6d4", zh: "非国际财务报告准则权益持有人应占利润", category: "Performance" },

  // Costs / Income Statement Detail
  costOfRevenues: { label: "Cost of Revenues (B)", color: "#60a5fa", zh: "收入成本", category: "Costs" },
  sellingMarketingExpenses: { label: "Selling & Marketing Expenses (B)", color: "#34d399", zh: "销售及市场推广开支", category: "Costs" },
  generalAdminExpenses: { label: "General & Administrative Expenses (B)", color: "#fbbf24", zh: "一般及行政开支", category: "Costs" },
  sellingMarketingExpensesMargin: { label: "Selling & Marketing Expenses Margin (%)", color: "#86efac", zh: "销售及市场推广开支率(%)", category: "Costs" },
  generalAdminExpensesMargin: { label: "General & Administrative Expenses Margin (%)", color: "#fde047", zh: "一般及行政开支率(%)", category: "Costs" },
  otherGainsLosses: { label: "Other Gains / (Losses), Net (B)", color: "#a78bfa", zh: "其他收益/(亏损)净额", category: "Costs" },
  netGainsLossesInvestments: { label: "Net Gains / (Losses) from Investments (B)", color: "#fb7185", zh: "投资净收益/(亏损)", category: "Costs" },
  interestIncome: { label: "Interest Income (B)", color: "#22d3ee", zh: "利息收入", category: "Costs" },
  financeCosts: { label: "Finance Costs (B)", color: "#38bdf8", zh: "财务成本", category: "Costs" },
  shareOfProfitLossAssociates: { label: "Share of Profit/(Loss) of Associates, Net (B)", color: "#93c5fd", zh: "应占联营公司利润/(亏损)净额", category: "Costs" },
  coreProfit: { label: "Core Profit (B)", color: "#67e8f9", zh: "核心利润", category: "Costs" },
  otherProfit: { label: "Other Profit (B)", color: "#c4b5fd", zh: "其他利润", category: "Costs" },
  incomeTaxExpense: { label: "Income Tax Expense (B)", color: "#f87171", zh: "所得税开支", category: "Costs" },

  // Segment Revenue
  vasRevenue: { label: "VAS Revenue (B)", color: "#3b82f6", zh: "增值服务收入", category: "Segments" },
  domesticIntlGamesRevenue: { label: "Domestic+International Games Revenue (B)", color: "#818cf8", zh: "国内+国际游戏收入", category: "Segments" },
  domesticGamesRevenue: { label: "Domestic Games Revenue (B)", color: "#60a5fa", zh: "国内游戏收入", category: "Segments" },
  internationalGamesRevenue: { label: "International Games Revenue (B)", color: "#a78bfa", zh: "国际游戏收入", category: "Segments" },
  socialNetworksRevenue: { label: "Social Networks Revenue (B)", color: "#c084fc", zh: "社交网络收入", category: "Segments" },
  marketingServicesRevenue: { label: "Marketing Services Revenue (B)", color: "#10b981", zh: "营销服务收入", category: "Segments" },
  fintechRevenue: { label: "FinTech & Business Services Revenue (B)", color: "#f59e0b", zh: "金融科技及企业服务收入", category: "Segments" },
  othersRevenue: { label: "Others Revenue (B)", color: "#8b5cf6", zh: "其他收入", category: "Segments" },

  // Segment Gross Profit
  vasGrossProfit: { label: "VAS Gross Profit (B)", color: "#60a5fa", zh: "增值服务毛利", category: "Segments" },
  marketingServicesGrossProfit: { label: "Marketing Services Gross Profit (B)", color: "#34d399", zh: "营销服务毛利", category: "Segments" },
  fintechGrossProfit: { label: "FinTech & Business Services Gross Profit (B)", color: "#fbbf24", zh: "金融科技及企业服务毛利", category: "Segments" },
  othersGrossProfit: { label: "Others Gross Profit (B)", color: "#a78bfa", zh: "其他毛利", category: "Segments" },

  // Segment Margins
  vasGrossMargin: { label: "VAS Gross Margin (%)", color: "#93c5fd", zh: "增值服务毛利率(%)", category: "Segments" },
  marketingServicesGrossMargin: { label: "Marketing Services Gross Margin (%)", color: "#6ee7b7", zh: "营销服务毛利率(%)", category: "Segments" },
  fintechGrossMargin: { label: "FinTech & Business Services Gross Margin (%)", color: "#fde68a", zh: "金融科技及企业服务毛利率(%)", category: "Segments" },
  othersGrossMargin: { label: "Others Gross Margin (%)", color: "#ddd6fe", zh: "其他毛利率(%)", category: "Segments" },

  // Liquidity / Cash
  cashCashEquivalents: { label: "Cash & Cash Equivalents (B)", color: "#2dd4bf", zh: "现金及现金等价物", category: "Liquidity" },
  termDepositsOthers: { label: "Term Deposits and Others (B)", color: "#22d3ee", zh: "定期存款及其他", category: "Liquidity" },
  borrowings: { label: "Borrowings (B)", color: "#0891b2", zh: "借款", category: "Liquidity" },
  notesPayable: { label: "Notes Payable (B)", color: "#155e75", zh: "应付票据", category: "Liquidity" },
  netCash: { label: "Net Cash (B)", color: "#0e7490", zh: "净现金", category: "Liquidity" },

  // Other Financial Information
  operatingCashFlow: { label: "Net Cash Flows from Operating Activities (B)", color: "#14b8a6", zh: "经营活动现金流净额", category: "Other Financial" },
  capitalExpenditure: { label: "Capital Expenditure (B)", color: "#f97316", zh: "资本开支", category: "Other Financial" },
  deferredRevenue: { label: "Deferred Revenue (B)", color: "#dc2626", zh: "递延收入", category: "Other Financial" },
  investmentPortfolio: { label: "Investment Portfolio (B)", color: "#22c55e", zh: "投资组合", category: "Other Financial" },

  // Operating Information
  weixinWechatMAU: { label: "Weixin/WeChat Combined MAU (B)", color: "#22c55e", zh: "微信/WeChat合并月活跃用户(十亿)", category: "Operating" },
  qqMobileMAU: { label: "QQ Mobile Device MAU (B)", color: "#3b82f6", zh: "QQ移动端月活跃用户(十亿)", category: "Operating" },
  feeBasedVASSubscriptions: { label: "Fee-based VAS Subscriptions (B)", color: "#8b5cf6", zh: "付费增值服务订阅数(十亿)", category: "Operating" },
  employeeCount: { label: "Employee Count", color: "#f59e0b", zh: "员工人数", category: "Operating" },
};

const DATA = [
  { 
    year: 2024, 
    revenue: 660.3, grossProfit: 349.2, operatingProfit: 208.1, profitBeforeTax: 241.5, profitForYear: 196.5, profitAttrEquity: 194.1,
    totalCompIncome: 284.3, totalCompIncomeAttrEquity: 279.0, nonIfrsOperatingProfit: 237.8, nonIfrsProfitAttrEquity: 222.7,
    costOfRevenues: 311.0, sellingMarketingExpenses: 36.4, generalAdminExpenses: 112.8, 
    sellingMarketingExpensesMargin: 0.06, generalAdminExpensesMargin: 0.17,
    otherGainsLosses: 8.0, netGainsLossesInvestments: 4.2,
    interestIncome: 16.0, financeCosts: 12.0, shareOfProfitLossAssociates: 25.2, 
    coreProfit: 200.0, otherProfit: 33.4, incomeTaxExpense: 45.0,
    vasRevenue: 319.2, domesticIntlGamesRevenue: 197.7, domesticGamesRevenue: 139.7, internationalGamesRevenue: 58.0, socialNetworksRevenue: 121.5,
    marketingServicesRevenue: 121.4, fintechRevenue: 212.0, othersRevenue: 7.8,
    vasGrossProfit: 181.7, marketingServicesGrossProfit: 67.2, fintechGrossProfit: 99.7, othersGrossProfit: 0.7,
    vasGrossMargin: 0.57, marketingServicesGrossMargin: 0.55, fintechGrossMargin: 0.47, othersGrossMargin: 0.09,
    cashCashEquivalents: 132.5, termDepositsOthers: 282.9, borrowings: 199.4, notesPayable: 139.2, netCash: 76.8,
    operatingCashFlow: 258.5, capitalExpenditure: 76.8, deferredRevenue: 106.3, investmentPortfolio: 817.7,
    weixinWechatMAU: 1.39, qqMobileMAU: 0.52, feeBasedVASSubscriptions: 0.26, employeeCount: 110558
  },
  { 
    year: 2023, 
    revenue: 609.0, grossProfit: 293.1, operatingProfit: 160.1, profitBeforeTax: 161.3, profitForYear: 118.0, profitAttrEquity: 115.2,
    totalCompIncome: 107.2, totalCompIncomeAttrEquity: 102.1, nonIfrsOperatingProfit: 191.9, nonIfrsProfitAttrEquity: 157.7,
    costOfRevenues: 315.9, sellingMarketingExpenses: 34.2, generalAdminExpenses: 103.5, 
    sellingMarketingExpensesMargin: 0.06, generalAdminExpensesMargin: 0.17,
    otherGainsLosses: 4.7, netGainsLossesInvestments: -6.1,
    interestIncome: 13.8, financeCosts: 12.3, shareOfProfitLossAssociates: 5.8, 
    coreProfit: 155.4, otherProfit: 1.2, incomeTaxExpense: 43.3,
    vasRevenue: 298.4, domesticIntlGamesRevenue: 179.9, domesticGamesRevenue: 126.7, internationalGamesRevenue: 53.2, socialNetworksRevenue: 118.5,
    marketingServicesRevenue: 101.5, fintechRevenue: 203.8, othersRevenue: 5.4,
    vasGrossProfit: 161.9, marketingServicesGrossProfit: 51.3, fintechGrossProfit: 80.6, othersGrossProfit: -0.8,
    vasGrossMargin: 0.54, marketingServicesGrossMargin: 0.51, fintechGrossMargin: 0.40, othersGrossMargin: -0.15,
    cashCashEquivalents: 172.3, termDepositsOthers: 231.0, borrowings: 197.4, notesPayable: 151.3, netCash: 54.7,
    operatingCashFlow: 222.0, capitalExpenditure: 23.9, deferredRevenue: 89.6, investmentPortfolio: 701.7,
    weixinWechatMAU: 1.34, qqMobileMAU: 0.54, feeBasedVASSubscriptions: 0.24, employeeCount: 105417
  },
  { 
    year: 2022, 
    revenue: 554.6, grossProfit: 238.7, operatingProfit: 110.8, profitBeforeTax: 210.2, profitForYear: 188.7, profitAttrEquity: 188.2,
    totalCompIncome: 59.6, totalCompIncomeAttrEquity: 60.7, nonIfrsOperatingProfit: 143.2, nonIfrsProfitAttrEquity: 115.6,
    costOfRevenues: 315.8, sellingMarketingExpenses: 29.2, generalAdminExpenses: 106.7, 
    sellingMarketingExpensesMargin: 0.05, generalAdminExpensesMargin: 0.19,
    otherGainsLosses: 8.0, netGainsLossesInvestments: 116.3,
    interestIncome: 8.6, financeCosts: 9.4, shareOfProfitLossAssociates: -16.1, 
    coreProfit: 102.8, otherProfit: 99.4, incomeTaxExpense: 21.5,
    vasRevenue: 287.6, domesticIntlGamesRevenue: 170.7, domesticGamesRevenue: 123.9, internationalGamesRevenue: 46.8, socialNetworksRevenue: 116.9,
    marketingServicesRevenue: 82.7, fintechRevenue: 177.1, othersRevenue: 7.2,
    vasGrossProfit: 145.7, marketingServicesGrossProfit: 35.0, fintechGrossProfit: 58.4, othersGrossProfit: -0.3,
    vasGrossMargin: 0.51, marketingServicesGrossMargin: 0.42, fintechGrossMargin: 0.33, othersGrossMargin: -0.04,
    cashCashEquivalents: 156.8, termDepositsOthers: 162.8, borrowings: 175.2, notesPayable: 159.1, netCash: -14.8,
    operatingCashFlow: 146.1, capitalExpenditure: 18.0, deferredRevenue: 85.7, investmentPortfolio: 820.0,
    weixinWechatMAU: 1.31, qqMobileMAU: 0.57, feeBasedVASSubscriptions: 0.23, employeeCount: 108436
  },
  { 
    year: 2021, 
    revenue: 560.1, grossProfit: 245.9, operatingProfit: 124.7, profitBeforeTax: 248.1, profitForYear: 227.8, profitAttrEquity: 224.8,
    totalCompIncome: 200.4, totalCompIncomeAttrEquity: 200.4, nonIfrsOperatingProfit: 152.7, nonIfrsProfitAttrEquity: 123.8,
    costOfRevenues: 314.2, sellingMarketingExpenses: 40.6, generalAdminExpenses: 89.8, 
    sellingMarketingExpensesMargin: 0.07, generalAdminExpensesMargin: 0.16,
    otherGainsLosses: 149.5, netGainsLossesInvestments: null,
    interestIncome: 6.7, financeCosts: 7.1, shareOfProfitLossAssociates: -16.4, 
    coreProfit: 115.5, otherProfit: -16.8, incomeTaxExpense: 20.3,
    vasRevenue: 291.6, domesticIntlGamesRevenue: 174.3, domesticGamesRevenue: 128.8, internationalGamesRevenue: 45.5, socialNetworksRevenue: 117.3,
    marketingServicesRevenue: 88.7, fintechRevenue: 172.2, othersRevenue: 7.7,
    vasGrossProfit: 153.0, marketingServicesGrossProfit: 53.5, fintechGrossProfit: 51.4, othersGrossProfit: 1.0,
    vasGrossMargin: 0.52, marketingServicesGrossMargin: 0.60, fintechGrossMargin: 0.30, othersGrossMargin: 0.13,
    cashCashEquivalents: 168.0, termDepositsOthers: 113.3, borrowings: 156.0, notesPayable: 145.6, netCash: -20.2,
    operatingCashFlow: 175.2, capitalExpenditure: 33.4, deferredRevenue: 92.4, investmentPortfolio: 879.0,
    weixinWechatMAU: 1.27, qqMobileMAU: 0.55, feeBasedVASSubscriptions: 0.24, employeeCount: 112771
  },
  { 
    year: 2020, 
    revenue: 482.1, grossProfit: 221.5, operatingProfit: 126.2, profitBeforeTax: 180.0, profitForYear: 160.1, profitAttrEquity: 159.8,
    totalCompIncome: 281.2, totalCompIncomeAttrEquity: 277.8, nonIfrsOperatingProfit: 143.2, nonIfrsProfitAttrEquity: 122.7,
    costOfRevenues: 260.5, sellingMarketingExpenses: 33.8, generalAdminExpenses: 67.6, 
    sellingMarketingExpensesMargin: 0.07, generalAdminExpensesMargin: 0.14,
    otherGainsLosses: 57.1, netGainsLossesInvestments: null,
    interestIncome: 7.0, financeCosts: 7.9, shareOfProfitLossAssociates: 3.7, 
    coreProfit: 120.1, otherProfit: 2.8, incomeTaxExpense: 19.9,
    vasRevenue: 264.2, domesticIntlGamesRevenue: 156.1, domesticGamesRevenue: null, internationalGamesRevenue: null, socialNetworksRevenue: 108.1,
    marketingServicesRevenue: 82.3, fintechRevenue: 128.1, othersRevenue: 7.5,
    vasGrossProfit: 142.9, marketingServicesGrossProfit: 42.3, fintechGrossProfit: 36.3, othersGrossProfit: 0.1,
    vasGrossMargin: 0.54, marketingServicesGrossMargin: 0.51, fintechGrossMargin: 0.28, othersGrossMargin: 0.01,
    cashCashEquivalents: 152.8, termDepositsOthers: 106.7, borrowings: 126.4, notesPayable: 122.1, netCash: 11.1,
    operatingCashFlow: 194.1, capitalExpenditure: 34.0, deferredRevenue: 89.5, investmentPortfolio: 690.9,
    weixinWechatMAU: 1.23, qqMobileMAU: 0.59, feeBasedVASSubscriptions: 0.22, employeeCount: 85858
  },
  { 
    year: 2019, 
    revenue: 377.3, grossProfit: 167.5, operatingProfit: 118.7, profitBeforeTax: 109.4, profitForYear: 95.9, profitAttrEquity: 93.3,
    totalCompIncome: 119.9, totalCompIncomeAttrEquity: 116.7, nonIfrsOperatingProfit: 114.6, nonIfrsProfitAttrEquity: 94.4,
    costOfRevenues: 209.8, sellingMarketingExpenses: 21.4, generalAdminExpenses: 53.4, 
    sellingMarketingExpensesMargin: 0.06, generalAdminExpensesMargin: 0.14,
    otherGainsLosses: 19.7, netGainsLossesInvestments: null,
    interestIncome: 6.3, financeCosts: 7.6, shareOfProfitLossAssociates: -1.7, 
    coreProfit: 92.7, otherProfit: -3.0, incomeTaxExpense: 13.5,
    vasRevenue: 200.0, domesticIntlGamesRevenue: 114.7, domesticGamesRevenue: null, internationalGamesRevenue: null, socialNetworksRevenue: 85.3,
    marketingServicesRevenue: 68.4, fintechRevenue: 101.4, othersRevenue: 7.6,
    vasGrossProfit: 105.9, marketingServicesGrossProfit: 33.5, fintechGrossProfit: 27.6, othersGrossProfit: 0.6,
    vasGrossMargin: 0.53, marketingServicesGrossMargin: 0.49, fintechGrossMargin: 0.27, othersGrossMargin: 0.08,
    cashCashEquivalents: 133.0, termDepositsOthers: 72.3, borrowings: 127.0, notesPayable: 93.9, netCash: -15.6,
    operatingCashFlow: 148.6, capitalExpenditure: 32.4, deferredRevenue: 68.3, investmentPortfolio: 439.6,
    weixinWechatMAU: 1.16, qqMobileMAU: 0.65, feeBasedVASSubscriptions: 0.18, employeeCount: 62885
  },
  { 
    year: 2018, 
    revenue: 312.7, grossProfit: 142.1, operatingProfit: 97.6, profitBeforeTax: 94.5, profitForYear: 80.0, profitAttrEquity: 78.7,
    totalCompIncome: 67.8, totalCompIncomeAttrEquity: 66.3, nonIfrsOperatingProfit: 92.5, nonIfrsProfitAttrEquity: 77.5,
    costOfRevenues: 170.6, sellingMarketingExpenses: 24.2, generalAdminExpenses: 41.5, 
    sellingMarketingExpensesMargin: 0.08, generalAdminExpensesMargin: 0.13,
    otherGainsLosses: 16.7, netGainsLossesInvestments: null,
    interestIncome: 4.6, financeCosts: 4.7, shareOfProfitLossAssociates: 1.5, 
    coreProfit: 76.4, otherProfit: 1.4, incomeTaxExpense: 14.5,
    vasRevenue: 176.6, domesticIntlGamesRevenue: 104.0, domesticGamesRevenue: null, internationalGamesRevenue: null, socialNetworksRevenue: 72.7,
    marketingServicesRevenue: 58.1, fintechRevenue: null, othersRevenue: 78.0,
    vasGrossProfit: 102.6, marketingServicesGrossProfit: 20.8, fintechGrossProfit: null, othersGrossProfit: 18.7,
    vasGrossMargin: 0.58, marketingServicesGrossMargin: 0.36, fintechGrossMargin: null, othersGrossMargin: 0.24,
    cashCashEquivalents: 97.8, termDepositsOthers: 69.3, borrowings: 114.3, notesPayable: 65.0, netCash: -12.2,
    operatingCashFlow: 106.4, capitalExpenditure: 23.9, deferredRevenue: 49.5, investmentPortfolio: 396.2,
    weixinWechatMAU: 1.10, qqMobileMAU: 0.70, feeBasedVASSubscriptions: 0.16, employeeCount: 54309
  },
  { 
    year: 2017, 
    revenue: 237.8, grossProfit: 116.9, operatingProfit: 90.3, profitBeforeTax: 88.2, profitForYear: 72.5, profitAttrEquity: 71.5,
    totalCompIncome: 79.1, totalCompIncomeAttrEquity: 78.2, nonIfrsOperatingProfit: 82.0, nonIfrsProfitAttrEquity: 65.1,
    costOfRevenues: 120.8, sellingMarketingExpenses: 17.7, generalAdminExpenses: 33.1, 
    sellingMarketingExpensesMargin: 0.07, generalAdminExpensesMargin: 0.14,
    otherGainsLosses: 20.1, netGainsLossesInvestments: null,
    interestIncome: 3.9, financeCosts: 2.9, shareOfProfitLossAssociates: 0.8, 
    coreProfit: 66.1, otherProfit: 1.8, incomeTaxExpense: 15.7,
    vasRevenue: 154.0, domesticIntlGamesRevenue: 97.9, domesticGamesRevenue: null, internationalGamesRevenue: null, socialNetworksRevenue: 56.1,
    marketingServicesRevenue: 40.4, fintechRevenue: null, othersRevenue: 43.3,
    vasGrossProfit: 92.6, marketingServicesGrossProfit: 14.8, fintechGrossProfit: null, othersGrossProfit: 9.4,
    vasGrossMargin: 0.60, marketingServicesGrossMargin: 0.37, fintechGrossMargin: null, othersGrossMargin: 0.22,
    cashCashEquivalents: 105.7, termDepositsOthers: 42.5, borrowings: 97.8, notesPayable: 34.1, netCash: 16.3,
    operatingCashFlow: 106.1, capitalExpenditure: 13.6, deferredRevenue: 44.5, investmentPortfolio: 275.6,
    weixinWechatMAU: 0.99, qqMobileMAU: 0.68, feeBasedVASSubscriptions: 0.13, employeeCount: 44796
  },
  { 
    year: 2016, 
    revenue: 151.9, grossProfit: 84.5, operatingProfit: 56.1, profitBeforeTax: 51.6, profitForYear: 41.4, profitAttrEquity: 41.1,
    totalCompIncome: 48.6, totalCompIncomeAttrEquity: 48.2, nonIfrsOperatingProfit: 58.2, nonIfrsProfitAttrEquity: 45.4,
    costOfRevenues: 67.4, sellingMarketingExpenses: 12.1, generalAdminExpenses: 22.5, 
    sellingMarketingExpensesMargin: 0.08, generalAdminExpensesMargin: 0.15,
    otherGainsLosses: 3.6, netGainsLossesInvestments: null,
    interestIncome: 2.6, financeCosts: 2.0, shareOfProfitLossAssociates: -2.5, 
    coreProfit: 49.9, otherProfit: -1.9, incomeTaxExpense: 10.2,
    vasRevenue: 107.8, domesticIntlGamesRevenue: 70.8, domesticGamesRevenue: null, internationalGamesRevenue: null, socialNetworksRevenue: 37.0,
    marketingServicesRevenue: 27.0, fintechRevenue: null, othersRevenue: 17.2,
    vasGrossProfit: 70.2, marketingServicesGrossProfit: 11.6, fintechGrossProfit: null, othersGrossProfit: 2.8,
    vasGrossMargin: 0.65, marketingServicesGrossMargin: 0.43, fintechGrossMargin: null, othersGrossMargin: 0.16,
    cashCashEquivalents: 71.9, termDepositsOthers: 55.7, borrowings: 69.8, notesPayable: 39.7, netCash: 18.1,
    operatingCashFlow: 65.5, capitalExpenditure: 12.1, deferredRevenue: 33.2, investmentPortfolio: null,
    weixinWechatMAU: 0.89, qqMobileMAU: 0.65, feeBasedVASSubscriptions: 0.11, employeeCount: 38775
  },
  { 
    year: 2015, 
    revenue: 102.9, grossProfit: 61.2, operatingProfit: 40.6, profitBeforeTax: 36.2, profitForYear: 29.1, profitAttrEquity: 28.8,
    totalCompIncome: 44.7, totalCompIncomeAttrEquity: 44.4, nonIfrsOperatingProfit: 41.8, nonIfrsProfitAttrEquity: 32.4,
    costOfRevenues: 41.6, sellingMarketingExpenses: 8.0, generalAdminExpenses: 16.8, 
    sellingMarketingExpensesMargin: 0.08, generalAdminExpensesMargin: 0.16,
    otherGainsLosses: 1.9, netGainsLossesInvestments: null,
    interestIncome: 2.3, financeCosts: 1.6, shareOfProfitLossAssociates: -2.8, 
    coreProfit: 36.4, otherProfit: -2.1, incomeTaxExpense: 7.1,
    vasRevenue: 80.7, domesticIntlGamesRevenue: 56.6, domesticGamesRevenue: null, internationalGamesRevenue: null, socialNetworksRevenue: 24.1,
    marketingServicesRevenue: 17.5, fintechRevenue: null, othersRevenue: 4.7,
    vasGrossProfit: 52.3, marketingServicesGrossProfit: 8.6, fintechGrossProfit: null, othersGrossProfit: 0.4,
    vasGrossMargin: 0.65, marketingServicesGrossMargin: 0.49, fintechGrossMargin: null, othersGrossMargin: 0.09,
    cashCashEquivalents: 43.4, termDepositsOthers: 41.0, borrowings: 24.4, notesPayable: 41.0, netCash: 19.1,
    operatingCashFlow: 45.4, capitalExpenditure: 7.7, deferredRevenue: 24.1, investmentPortfolio: null,
    weixinWechatMAU: 0.70, qqMobileMAU: 0.64, feeBasedVASSubscriptions: 0.095, employeeCount: 30641
  },
  { 
    year: 2014, 
    revenue: 78.9, grossProfit: 48.1, operatingProfit: 30.5, profitBeforeTax: 29.0, profitForYear: 23.9, profitAttrEquity: 23.8,
    totalCompIncome: 22.0, totalCompIncomeAttrEquity: 21.9, nonIfrsOperatingProfit: 30.4, nonIfrsProfitAttrEquity: 24.7,
    costOfRevenues: 30.9, sellingMarketingExpenses: 7.8, generalAdminExpenses: 14.2, 
    sellingMarketingExpensesMargin: 0.10, generalAdminExpensesMargin: 0.18,
    otherGainsLosses: 2.8, netGainsLossesInvestments: null,
    interestIncome: 1.7, financeCosts: 1.2, shareOfProfitLossAssociates: -0.35, 
    coreProfit: 26.1, otherProfit: 0.15, incomeTaxExpense: 5.1,
    vasRevenue: 63.3, domesticIntlGamesRevenue: 44.8, domesticGamesRevenue: null, internationalGamesRevenue: null, socialNetworksRevenue: 18.6,
    marketingServicesRevenue: 8.3, fintechRevenue: null, othersRevenue: 7.3,
    vasGrossProfit: 42.7, marketingServicesGrossProfit: 3.6, fintechGrossProfit: null, othersGrossProfit: 1.7,
    vasGrossMargin: 0.67, marketingServicesGrossMargin: 0.43, fintechGrossMargin: null, othersGrossMargin: 0.23,
    cashCashEquivalents: 42.7, termDepositsOthers: 15.6, borrowings: 8.7, notesPayable: 26.9, netCash: 22.8,
    operatingCashFlow: 32.7, capitalExpenditure: 4.7, deferredRevenue: 19.6, investmentPortfolio: null,
    weixinWechatMAU: 0.50, qqMobileMAU: 0.58, feeBasedVASSubscriptions: 0.084, employeeCount: 27690
  },
];

export default function Dashboard() {
  const [page, setPage] = useState<1 | 2>(1);
  const [lang, setLang] = useState<"en" | "zh">("en");
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
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: "", email: "", message: "" });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Helper to compute calculated metrics
  const computeCalculatedMetrics = (d: typeof DATA[0]) => {
    const base: any = { ...d };
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

  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);

  const startEditMetric = (cm: typeof customMetrics[0]) => {
    setNewCustomMetric({
      name: cm.name,
      nameZh: cm.nameZh,
      metricA: cm.metricA,
      operator: cm.operator,
      metricB: cm.metricB,
    });
    setEditingMetricId(cm.id);
    setCustomMetricDialogOpen(true);
  };

  const updateCustomMetric = () => {
    if (!newCustomMetric.name.trim() || !editingMetricId) return;
    setCustomMetrics(customMetrics.map((cm) => 
      cm.id === editingMetricId 
        ? { ...cm, name: newCustomMetric.name, nameZh: newCustomMetric.nameZh || newCustomMetric.name, metricA: newCustomMetric.metricA, operator: newCustomMetric.operator, metricB: newCustomMetric.metricB }
        : cm
    ));
    setNewCustomMetric({ name: "", nameZh: "", metricA: "revenue", operator: "/", metricB: "revenue" });
    setEditingMetricId(null);
    setCustomMetricDialogOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingMetricId(null);
      setNewCustomMetric({ name: "", nameZh: "", metricA: "revenue", operator: "/", metricB: "revenue" });
    }
    setCustomMetricDialogOpen(open);
  };

  const submitFeedback = async () => {
    if (!feedbackForm.message.trim()) return;
    setFeedbackLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });
      if (response.ok) {
        setFeedbackSuccess(true);
        setFeedbackForm({ name: "", email: "", message: "" });
        setTimeout(() => {
          setFeedbackDialogOpen(false);
          setFeedbackSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setFeedbackLoading(false);
    }
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

  const formatValue = (v: number | null | undefined) => {
    if (v === null || v === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(v);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Section */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="tfi-title text-xl font-bold tracking-tight">
              {t("Tencent Financial Intelligence", "腾讯财报分析")}
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
            <Button 
              data-testid="button-download-reports" 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex" 
              onClick={() => window.open("https://www.tencent.com/en-us/investors/financial-reports.html", "_blank")}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {t("Download Reports", "下载报告")}
            </Button>
            <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-feedback" variant="outline" size="sm" className="hidden sm:flex">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t("Feedback", "反馈")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-xl border-card-border">
                <DialogHeader>
                  <DialogTitle className="tfi-title text-lg">
                    {t("Send Feedback", "发送反馈")}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {t("Share your thoughts with our development team", "与开发团队分享您的想法")}
                  </DialogDescription>
                </DialogHeader>
                {feedbackSuccess ? (
                  <div className="py-8 text-center">
                    <div className="text-green-500 text-4xl mb-2">✓</div>
                    <p className="text-sm font-medium">{t("Thank you for your feedback!", "感谢您的反馈！")}</p>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t("Name / Nickname (optional)", "名称 / 昵称（可选）")}</Label>
                      <Input
                        data-testid="input-feedback-name"
                        placeholder={t("Your name", "您的名称")}
                        value={feedbackForm.name}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t("Email (optional)", "邮箱（可选）")}</Label>
                      <Input
                        data-testid="input-feedback-email"
                        type="email"
                        placeholder={t("your@email.com", "your@email.com")}
                        value={feedbackForm.email}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t("Message", "留言")} *</Label>
                      <textarea
                        data-testid="input-feedback-message"
                        className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder={t("Your feedback or suggestions...", "您的反馈或建议...")}
                        value={feedbackForm.message}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                {!feedbackSuccess && (
                  <DialogFooter>
                    <Button 
                      data-testid="button-submit-feedback" 
                      onClick={submitFeedback} 
                      disabled={!feedbackForm.message.trim() || feedbackLoading}
                    >
                      {feedbackLoading ? t("Sending...", "发送中...") : t("Submit Feedback", "提交反馈")}
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>


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
                            <Accordion type="multiple" defaultValue={["Performance", "Costs", "Segments", "Liquidity"]} className="w-full">
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
                        <Dialog open={customMetricDialogOpen} onOpenChange={handleDialogClose}>
                          <DialogTrigger asChild>
                            <Button data-testid="button-add-custom-metric" variant="ghost" size="sm" className="h-6 px-2">
                              <Plus className="w-3 h-3 mr-1" />
                              <span className="text-[10px]">{t("Add", "添加")}</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-xl border-card-border">
                            <DialogHeader>
                              <DialogTitle className="tfi-title text-lg">
                                {editingMetricId ? t("Edit Custom Metric", "编辑自定义指标") : t("Create Custom Metric", "创建自定义指标")}
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
                                        <SelectItem key={k} value={k} className="text-xs">{t(METRICS[k].label, METRICS[k].zh)}</SelectItem>
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
                                        <SelectItem key={k} value={k} className="text-xs">{t(METRICS[k].label, METRICS[k].zh)}</SelectItem>
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
                              <Button 
                                data-testid={editingMetricId ? "button-update-custom-metric" : "button-create-custom-metric"} 
                                onClick={editingMetricId ? updateCustomMetric : addCustomMetric} 
                                disabled={!newCustomMetric.name.trim()}
                              >
                                {editingMetricId ? t("Update Metric", "更新指标") : t("Create Metric", "创建指标")}
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
                                    {t(METRICS[cm.metricA as MetricKey]?.label ?? cm.metricA, METRICS[cm.metricA as MetricKey]?.zh ?? cm.metricA)} {cm.operator} {t(METRICS[cm.metricB as MetricKey]?.label ?? cm.metricB, METRICS[cm.metricB as MetricKey]?.zh ?? cm.metricB)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  data-testid={`button-edit-custom-metric-${cm.id}`}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                  onClick={() => startEditMetric(cm)}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
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
                              const fintech = d.fintechRevenue ?? 0;
                              const total = d.vasRevenue + d.marketingServicesRevenue + fintech + d.othersRevenue;
                              return {
                                year: d.year,
                                vas: d.vasRevenue / total,
                                marketing: d.marketingServicesRevenue / total,
                                fintech: fintech / total,
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
                            <LineChart data={DATA.slice().sort((a, b) => a.year - b.year).map(d => ({
                              year: d.year,
                              vasGrossMargin: d.vasGrossMargin != null ? d.vasGrossMargin * 100 : null,
                              marketingServicesGrossMargin: d.marketingServicesGrossMargin != null ? d.marketingServicesGrossMargin * 100 : null,
                              fintechGrossMargin: d.fintechGrossMargin != null ? d.fintechGrossMargin * 100 : null,
                            }))}>
                              <XAxis dataKey="year" fontSize={9} stroke="#6b7280" tickLine={false} axisLine={false} />
                              <YAxis fontSize={9} stroke="#6b7280" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                              <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}${UNIT_PERCENT}`} />
                              <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: "9px", paddingTop: "5px" }} />
                              <Line 
                                type="monotone" 
                                dataKey="vasGrossMargin" 
                                name={t("VAS Gross Margin", "增值服务毛利率")}
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                dot={false}
                                connectNulls
                              />
                              <Line 
                                type="monotone" 
                                dataKey="marketingServicesGrossMargin" 
                                name={t("Marketing Services Gross Margin", "营销服务毛利率")}
                                stroke="#ec4899" 
                                strokeWidth={2}
                                dot={false}
                                connectNulls
                              />
                              <Line 
                                type="monotone" 
                                dataKey="fintechGrossMargin" 
                                name={t("FinTech Gross Margin", "金融科技毛利率")}
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                dot={false}
                                connectNulls
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => {
                      const headers = ["Metric", ...DATA.filter(d => tableYearFilter.includes(d.year)).map(d => d.year.toString())];
                      const rows = Object.entries(METRICS).map(([key, m]) => {
                        const values = DATA.filter(d => tableYearFilter.includes(d.year)).map(d => {
                          const computed = computeCalculatedMetrics(d);
                          const val = (computed as any)[key];
                          return val !== undefined && val !== null ? val.toString() : "";
                        });
                        return [m.label, ...values];
                      });
                      const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
                      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(blob);
                      link.download = `tencent_financial_data_${new Date().toISOString().split("T")[0]}.csv`;
                      link.click();
                    }}
                  >
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
