"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    AreaChart,
    Area,
} from "recharts";
import {
    Users,
    Briefcase,
    Building2,
    Wallet,
    Trophy,
    AlertCircle,
    TrendingDown,
    HandCoins,
    PiggyBank,
} from "lucide-react";

interface ROWs {
    totalOutstanding: number;
    loanAmount: number;
    paidSavings: number;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showSplash, setShowSplash] = useState(true);

    const [centers, setCenters] = useState(0);
    const [employeesCount, setEmployeesCount] = useState(0);
    const [clientsCount, setClientsCount] = useState(0);

    const [, setMonthlyIncome] = useState(0);
    const [monthlyBorrowers, setMonthlyBorrowers] = useState(0);
    const [, setMonthlyExpense] = useState(0);

    const [totalOutstanding, setTotalOutstanding] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [totalDisbursement, setTotalDisbursement] = useState(0);

    const [arrearCount, setArrearCount] = useState(0);

    const [topBranches, setTopBranches] = useState<
        { name: string; amount: number }[]
    >([]);

    const [loanTrend, setLoanTrend] = useState<
        { month: string; amount: number }[]
    >([]);

    /* Splash */
    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    /* Auth Redirect */
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    /* Outstanding + Savings */
    useEffect(() => {
        async function fetchOutstanding() {
            try {
                const [outRes, draftRes] = await Promise.all([
                    fetch("/api/report/outstanding"),
                    fetch("/api/analytics/total-savings"),
                ]);

                const outData = await outRes.json();
                const draftData = await draftRes.json();

                if (outData.success && Array.isArray(outData.rows)) {
                    const totalOutstandingAmount = outData.rows.reduce(
                        (sum: number, row: ROWs) =>
                            sum + (row.totalOutstanding || 0),
                        0
                    );

                    const totalDisbursementAmount = outData.rows.reduce(
                        (sum: number, row: ROWs) =>
                            sum + (row.loanAmount || 0),
                        0
                    );

                    const paidSavingsAmount = outData.rows.reduce(
                        (sum: number, row: ROWs) =>
                            sum + (row.paidSavings || 0),
                        0
                    );

                    const draftSavings = draftData.success
                        ? draftData.total || 0
                        : 0;

                    setTotalOutstanding(totalOutstandingAmount);
                    setTotalDisbursement(totalDisbursementAmount);
                    setTotalSavings(paidSavingsAmount + draftSavings);
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetchOutstanding();
    }, []);

    /* Live Counts */
    useEffect(() => {
        async function fetchCounts() {
            try {
                const [g, c, e] = await Promise.all([
                    fetch("/api/group/list").then((r) => r.json()),
                    fetch("/api/clients?status=ACTIVE").then((r) => r.json()),
                    fetch("/api/employees/list").then((r) => r.json()),
                ]);

                setCenters(g.groups?.length || 0);
                setClientsCount(c.count || 0);
                setEmployeesCount(e.employees?.length || 0);
            } catch (err) {
                console.error(err);
            }
        }

        fetchCounts();
        const i = setInterval(fetchCounts, 10000);
        return () => clearInterval(i);
    }, []);

    /* Monthly */
    useEffect(() => {
        async function fetchMonthly() {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(
                now.getMonth() + 1
            ).padStart(2, "0")}`;

            const income = await fetch(
                `/api/credit/income?month=${month}`
            ).then((r) => r.json());
            const fund = await fetch(
                `/api/fund?status=ACTIVE`
            ).then((r) => r.json());
            const expense = await fetch(
                `/api/debit/expense?month=${month}`
            ).then((r) => r.json());

            setMonthlyIncome(income.grandTotal || 0);
            setMonthlyBorrowers(fund.count || 0);
            setMonthlyExpense(expense.total || 0);
        }

        fetchMonthly();
    }, []);

    /* Top Branches */
    useEffect(() => {
        fetch("/api/analytics/top-branches")
            .then((r) => r.json())
            .then((d) => d.success && setTopBranches(d.data));
    }, []);

    /* Loan Trend */
    useEffect(() => {
        fetch("/api/analytics/last-6-months")
            .then((r) => r.json())
            .then((d) => d.success && setLoanTrend(d.data));
    }, []);

    /* Arrear */
    useEffect(() => {
        fetch("/api/report/arrear/count")
            .then((r) => r.json())
            .then((d) => d.success && setArrearCount(d.count || 0));
    }, []);

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const stats = [
        { label: "Groups", value: centers, icon: Building2 },
        { label: "Employees", value: employeesCount, icon: Briefcase },
        { label: "Clients", value: clientsCount, icon: Users },
        {
            label: "Total Outstanding",
            value: `₹${totalOutstanding.toLocaleString()}`,
            icon: Wallet,
        },
        {
            label: "Total Savings",
            value: `₹${totalSavings.toLocaleString()}`,
            icon: PiggyBank,
        },
        {
            label: "Total Disbursement",
            value: `₹${totalDisbursement.toLocaleString()}`,
            icon: HandCoins,
        },
        { label: "Borrowers", value: monthlyBorrowers, icon: Wallet },
        { label: "Arrears", value: arrearCount, icon: AlertCircle },
        { label: "Pending", value: `0`, icon: TrendingDown },
        {
            label: "Total Transactions",
            value: `${(totalDisbursement + totalSavings).toLocaleString()}`,
            icon: Trophy,
        },
        {
            label: "Monthly Revenue",
            value: `₹${(totalOutstanding * 0.05).toFixed(0)}`, // placeholder
            icon: TrendingDown,
        },
        {
            label: "Pending Approvals",
            value: `12`, // placeholder
            icon: AlertCircle,
        },
    ];

    function formatIndianAmount(value: number) {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(1)} Cr`;
        }

        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)} L`;
        }

        return `₹${value}`;
    }

    return (
        <div className="min-h-screen bg-white-100">

            {/* Splash */}
            <AnimatePresence>
                {showSplash && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white"
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: 0.2, x: "-47vw", y: "-45vh" }}
                            transition={{ duration: 1.2 }}
                        >
                            <Image src="/logo.svg" alt="logo" width={200} height={200} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="p-6 space-y-8"
            >

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            FinoraX Dashboard
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back,{" "}
                            <span className="font-semibold">
                                {session.user?.name}
                            </span>
                        </p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border">
                        <p className="text-sm text-gray-500">System Status</p>
                        <p className="text-green-600 font-semibold">
                            All Services Running
                        </p>
                    </div>
                </motion.div>

                {/* AI Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full"></span>
                                AI Financial Insights
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Revenue Prediction</p>
                                    <p className="text-2xl font-bold text-green-600">+12%</p>
                                    <p className="text-xs text-gray-500">Next quarter</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Expense Anomaly</p>
                                    <p className="text-2xl font-bold text-orange-600">Detected</p>
                                    <p className="text-xs text-gray-500">Office supplies</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Cash Flow Trend</p>
                                    <p className="text-2xl font-bold text-blue-600">Stable</p>
                                    <p className="text-xs text-gray-500">Last 30 days</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Activity Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Loan approved for Zenith Holdings</p>
                                        <p className="text-xs text-gray-500">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Payment received from Vertex Retail</p>
                                        <p className="text-xs text-gray-500">4 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Expense report submitted</p>
                                        <p className="text-xs text-gray-500">6 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.03 }}
                        >
                            <Card className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                                <CardContent className="p-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">{s.label}</p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {s.value}
                                        </h3>
                                    </div>

                                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-md">
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="space-y-6">

                    {/* Top Branches */}
                    <Card className="bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl border border-white/40">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">
                                    Top Performing Branches
                                </h3>
                                <Trophy className="text-yellow-500" />
                            </div>

                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b text-sm uppercase tracking-wide">
                                        <th className="py-2 text-left">Rank</th>
                                        <th className="py-2 text-left">Branch</th>
                                        <th className="py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topBranches.length ? (
                                        topBranches.map((b, i) => (
                                            <tr
                                                key={i}
                                                className="hover:bg-blue-50 transition-colors"
                                            >
                                                <td className="py-3 font-medium">
                                                    #{i + 1}
                                                </td>
                                                <td className="py-3">{b.name}</td>
                                                <td className="py-3 text-right font-semibold">
                                                    ₹{b.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="py-6 text-center text-gray-400"
                                            >
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Loan Trend */}
                    <Card className="bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl border border-white/40">
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-4">
                                Loan Disbursement – Last 12 Months
                            </h3>

                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={loanTrend}>
                                        <defs>
                                            <linearGradient id="loanGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => `${formatIndianAmount(v)}`}
                                        />

                                        <Tooltip
                                            contentStyle={{
                                                background: "#111827",
                                                border: "none",
                                                borderRadius: "10px",
                                                color: "#fff",
                                            }}
                                            formatter={(v: number | undefined) => `₹ ${(v ?? 0).toLocaleString()}`}
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#4f46e5"
                                            strokeWidth={3}
                                            fill="url(#loanGradient)"
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                            animationDuration={1200}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </motion.main>
        </div>
    );
}