"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
    Calendar, 
    Users, 
    Filter, 
    Search, 
    Building2, 
    UserCheck, 
    Clock, 
    ArrowRight,
    TrendingUp,
    FileSpreadsheet,
    Download,
    CheckCircle2,
    CalendarDays
} from "lucide-react";
import { Group } from "@/types/group";
import { Loan } from "@/types/fund";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ================= TYPES ================= */

interface Employee {
    _id: string;
    name: string;
}

interface GroupSummaryRow {
    employeeName: string;
    collectionTime: string;
    groupName: string;
    groupId: string;
    members: number;
    collectionDay: string;
    principal: number;
    interest: number;
    savings: number;
    total: number;
}

/* ================= HELPERS ================= */

function calculateGroupWeek(group: Group, baseDate: Date) {
    if (!group?.dueStarts) return null;

    const created = new Date(group.dueStarts);

    if (group.dueOn === "MONTHLY") {
        return (
            (baseDate.getFullYear() - created.getFullYear()) * 12 +
            (baseDate.getMonth() - created.getMonth()) +
            1
        );
    }

    const diffMs = baseDate.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)) + 1;
}

function setQuickRange(
    type: "TODAY" | "WEEK" | "MONTH",
    setFrom: (v: string) => void,
    setTo: (v: string) => void
) {
    const today = new Date();
    let from = new Date(today);
    let to = new Date(today);

    if (type === "WEEK") {
        const day = today.getDay(); 
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - day);

        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);

        from = sunday;
        to = saturday;
    }

    if (type === "MONTH") {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    setFrom(from.toISOString().split("T")[0]);
    setTo(to.toISOString().split("T")[0]);
}

/* ================= PAGE ================= */

export default function WeeklyDemandSheetPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeId, setEmployeeId] = useState("");

    const [groups, setGroups] = useState<Group[]>([]);
    const [groupSummaries, setGroupSummaries] = useState<GroupSummaryRow[]>([]);

    const [fromDate, setFromDate] = useState<string | null>(new Date().toISOString().split("T")[0]);
    const [toDate, setToDate] = useState<string | null>(new Date().toISOString().split("T")[0]);
    const [selectedGroupId, setSelectedGroupId] = useState("ALL");

    const [dayFilter, setDayFilter] = useState("ALL");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/employees/list")
            .then((r) => r.json())
            .then((d) => setEmployees(d.employees || []))
            .catch(() => toast.error("Failed to load staff list"));
    }, []);

    async function fetchEmployeeGroups(empId: string) {
        if (!empId || !fromDate || !toDate) return toast.warning("Please select staff and date range");

        setEmployeeId(empId);
        setGroupSummaries([]);
        setLoading(true);

        try {
            let fetchedGroups: Group[] = [];

            if (empId === "ALL") {
                const res = await fetch(`/api/group/search?status=ACTIVE`);
                fetchedGroups = await res.json();
            } else {
                const res = await fetch(`/api/group/search?query=${empId}&status=ACTIVE`);
                fetchedGroups = await res.json();
            }

            setGroups(fetchedGroups);

            if (selectedGroupId !== "ALL") {
                fetchedGroups = fetchedGroups.filter((g) => g._id === selectedGroupId);
            }

            if (dayFilter !== "ALL") {
                fetchedGroups = fetchedGroups.filter(
                    (g) => (g.collectionDay || "").toLowerCase() === dayFilter.toLowerCase()
                );
            }

            const from = new Date(fromDate);
            const summaryRows: GroupSummaryRow[] = [];

            for (const group of fetchedGroups) {
                const weekNo = calculateGroupWeek(group, from);
                if (!weekNo) continue;

                const fundRes = await fetch(`/api/fund/by-group?groupId=${group._id}`);
                const fundData = await fundRes.json();
                const loans: Loan[] = fundData.loans || [];
                const members = loans.length;

                let principal = 0, interest = 0, savings = 0, total = 0, hasAnyDue = false;

                loans.forEach((loan) => {
                    const due = loan.dues?.[weekNo - 1];
                    if (!due) return;

                    hasAnyDue = true;
                    principal += Number(due.principal || 0);
                    interest += Number(due.interest || 0);
                    savings += Number(due.savings || 0);
                    total += Number(due.total || 0);
                });

                if (!hasAnyDue) continue;

                const empName = employees.find((e) => e._id === group.employee?._id)?.name || "-";

                summaryRows.push({
                    employeeName: empName,
                    groupName: group.groupName,
                    groupId: group.groupId,
                    members,
                    collectionDay: group.collectionDay || "-",
                    collectionTime: group.collectionTime || "-",
                    principal,
                    interest,
                    savings,
                    total,
                });
            }

            setGroupSummaries(summaryRows);
        } catch {
            toast.error("An error occurred while calculating demand");
        } finally {
            setLoading(false);
        }
    }

    const grandTotals = groupSummaries.reduce(
        (a, g) => {
            a.principal += g.principal;
            a.interest += g.interest;
            a.savings += g.savings;
            a.total += g.total;
            return a;
        },
        { principal: 0, interest: 0, savings: 0, total: 0 }
    );

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-10">
            <PageHeader />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                        Weekly Demand Sheet
                    </h1>
                    <p className="text-gray-500 text-lg mt-1">Projected collections and demand schedules for all centers.</p>
                </div>
                {groupSummaries.length > 0 && (
                    <Button variant="outline" className="rounded-2xl h-12 shadow-sm border-gray-200">
                        <Download className="w-4 h-4 mr-2" />
                        Export to Excel
                    </Button>
                )}
            </div>

            {/* Filters Panel */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Demand Filters
                        </CardTitle>
                        <div className="flex gap-2">
                            {["TODAY", "WEEK", "MONTH"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setQuickRange(t as any, setFromDate, setToDate)}
                                    className="px-4 py-1.5 rounded-full text-xs font-bold border border-gray-100 bg-white hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                                >
                                    {t === "TODAY" ? "Today" : t === "WEEK" ? "This Week" : "This Month"}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Collector</label>
                            <Select value={employeeId} onValueChange={(v) => { setSelectedGroupId("ALL"); setEmployeeId(v); }}>
                                <SelectTrigger className="h-12 rounded-2xl bg-gray-50/50 border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-blue-500" />
                                        <SelectValue placeholder="Staff Member" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Employees</SelectItem>
                                    {employees.map((e) => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">From Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={fromDate || ""}
                                    onChange={(e) => setFromDate(e.target.value || null)}
                                    className="w-full h-12 border-gray-100 bg-gray-50/50 rounded-2xl pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">To Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={toDate || ""}
                                    onChange={(e) => setToDate(e.target.value || null)}
                                    className="w-full h-12 border-gray-100 bg-gray-50/50 rounded-2xl pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Group Filter</label>
                            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                                <SelectTrigger className="h-12 rounded-2xl bg-gray-50/50 border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-blue-500" />
                                        <SelectValue placeholder="All Centers" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Centers</SelectItem>
                                    {groups.map((g) => <SelectItem key={g._id} value={g._id}>{g.groupName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Collection Day</label>
                            <Select value={dayFilter} onValueChange={setDayFilter}>
                                <SelectTrigger className="h-12 rounded-2xl bg-gray-50/50 border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-blue-500" />
                                        <SelectValue placeholder="All Days" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Days</SelectItem>
                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                        <SelectItem key={day} value={day}>{day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Button
                            onClick={() => fetchEmployeeGroups(employeeId)}
                            disabled={!employeeId || !fromDate || !toDate || loading}
                            className="h-14 px-16 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 text-lg font-bold min-w-[200px]"
                        >
                            {loading ? <Search className="w-5 h-5 animate-pulse" /> : "Calculate Demand"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Grid */}
            {groupSummaries.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-none shadow-md bg-white rounded-3xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Demand</p>
                            <h4 className="text-xl font-black text-gray-900">₹{grandTotals.total.toLocaleString()}</h4>
                        </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white rounded-3xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Members</p>
                            <h4 className="text-xl font-black text-gray-900">
                                {groupSummaries.reduce((sum, g) => sum + g.members, 0)}
                            </h4>
                        </div>
                    </Card>
                    <Card className="border-none shadow-md bg-white rounded-3xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Groups</p>
                            <h4 className="text-xl font-black text-gray-900">{groupSummaries.length}</h4>
                        </div>
                    </Card>
                    <Card className="border-none shadow-md bg-emerald-600 text-white rounded-3xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Savings Growth</p>
                            <h4 className="text-xl font-black">₹{grandTotals.savings.toLocaleString()}</h4>
                        </div>
                    </Card>
                </div>
            )}

            {/* Main Table */}
            {groupSummaries.length > 0 && (
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                    <div className="p-8 border-b bg-white">
                        <h2 className="text-2xl font-bold text-gray-900">Demand Breakdown</h2>
                    </div>
                    <div className="overflow-auto max-h-[600px]">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/80 sticky top-0 z-10">
                                <tr className="text-gray-400">
                                    <th className="p-5 text-left font-bold uppercase tracking-tighter text-[10px]">Staff / Collector</th>
                                    <th className="p-5 text-left font-bold uppercase tracking-tighter text-[10px]">Center Details</th>
                                    <th className="p-5 text-center font-bold uppercase tracking-tighter text-[10px]">Schedule</th>
                                    <th className="p-5 text-center font-bold uppercase tracking-tighter text-[10px]">Members</th>
                                    <th className="p-5 text-right font-bold uppercase tracking-tighter text-[10px]">Principal</th>
                                    <th className="p-5 text-right font-bold uppercase tracking-tighter text-[10px]">Interest</th>
                                    <th className="p-5 text-right font-bold uppercase tracking-tighter text-[10px]">Savings</th>
                                    <th className="p-5 text-right font-bold uppercase tracking-tighter text-[10px]">Total Demand</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {groupSummaries.map((g, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                                                    {g.employeeName.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900">{g.employeeName}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{g.groupName}</span>
                                                <span className="text-[10px] font-mono text-gray-400">{g.groupId}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col items-center">
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[10px]">
                                                    {g.collectionDay}
                                                </Badge>
                                                <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {g.collectionTime}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                                                {g.members}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right text-gray-500 font-medium">₹{g.principal.toLocaleString()}</td>
                                        <td className="p-5 text-right text-gray-500 font-medium">₹{g.interest.toLocaleString()}</td>
                                        <td className="p-5 text-right text-emerald-600 font-medium">₹{g.savings.toLocaleString()}</td>
                                        <td className="p-5 text-right">
                                            <span className="font-black text-blue-700 text-lg">₹{g.total.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            <tfoot className="bg-gray-900 text-white">
                                <tr className="text-right">
                                    <td colSpan={4} className="p-6 text-left">
                                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-50">Grand Totals</span>
                                    </td>
                                    <td className="p-6 font-bold">₹{grandTotals.principal.toLocaleString()}</td>
                                    <td className="p-6 font-bold">₹{grandTotals.interest.toLocaleString()}</td>
                                    <td className="p-6 font-bold text-emerald-400">₹{grandTotals.savings.toLocaleString()}</td>
                                    <td className="p-6">
                                        <span className="text-2xl font-black text-blue-400">₹{grandTotals.total.toLocaleString()}</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>
            )}

            {/* Empty States */}
            {!employeeId && !loading && (
                <div className="py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                        <FileSpreadsheet className="w-10 h-10 text-gray-100" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Generate Demand Sheet</h3>
                    <p className="text-gray-400 mt-2 text-center max-w-xs">
                        Select staff and a date range above to calculate the upcoming collection demand.
                    </p>
                </div>
            )}

            {loading && (
                <div className="py-40 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-600" />
                        <Search className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
                    </div>
                    <p className="text-gray-400 mt-6 font-bold uppercase tracking-widest text-xs">Processing Complex Data...</p>
                </div>
            )}
        </section>
    );
}
