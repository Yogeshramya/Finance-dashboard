"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Group } from "@/types/group";
import { Loan } from "@/types/fund";

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

/*function getWeeksBetween(group: Group, from: Date, to: Date): number[] {
    const weeks: number[] = [];
    const cursor = new Date(from);

    while (cursor <= to) {
        const week = calculateGroupWeek(group, cursor);
        if (week && !weeks.includes(week)) weeks.push(week);
        cursor.setDate(cursor.getDate() + 7);
    }

    return weeks;
}*/

function setQuickRange(
    type: "TODAY" | "WEEK" | "MONTH",
    setFrom: (v: string) => void,
    setTo: (v: string) => void
) {
    const today = new Date();
    let from = new Date(today);
    let to = new Date(today);

    if (type === "WEEK") {
        const day = today.getDay(); // 0 = Sunday
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

    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState("ALL");

    const [dayFilter, setDayFilter] = useState("ALL");
    const [loading, setLoading] = useState(false);

    /* ================= LOAD EMPLOYEES ================= */

    useEffect(() => {
        fetch("/api/employees/list")
            .then((r) => r.json())
            .then((d) => setEmployees(d.employees || []))
            .catch(() => toast.error("Failed to load employees"));
    }, []);

    /* ================= FETCH GROUPS ================= */

    async function fetchEmployeeGroups(empId: string) {
        if (!empId || !fromDate || !toDate) return;

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

            // GROUP FILTER
            if (selectedGroupId !== "ALL") {
                fetchedGroups = fetchedGroups.filter((g) => g._id === selectedGroupId);
            }

            // DAY FILTER
            if (dayFilter !== "ALL") {
                fetchedGroups = fetchedGroups.filter(
                    (g) => (g.collectionDay || "").toLowerCase() === dayFilter.toLowerCase()
                );
            }

            const from = new Date(fromDate);
            //const to = new Date(toDate);

            const summaryRows: GroupSummaryRow[] = [];

            for (const group of fetchedGroups) {
                const weekNo = calculateGroupWeek(group, from);
                if (!weekNo) continue;

                const fundRes = await fetch(`/api/fund/by-group?groupId=${group._id}`);
                const fundData = await fundRes.json();
                const loans: Loan[] = fundData.loans || [];
                const members = loans.length;

                let principal = 0,
                    interest = 0,
                    savings = 0,
                    total = 0,
                    hasAnyDue = false;

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

                // employee name find
                const empName =
                    employees.find((e) => e._id === group.employee?._id)?.name || "-";

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
            toast.error("Failed to load weekly demand");
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

    /* ================= UI ================= */

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-6">
            <PageHeader />

            <h1 className="text-3xl font-bold text-blue-700">Weekly Demand Sheet</h1>

            <Card className="p-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {/* EMPLOYEE */}
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Employee</label>
                        <Select
                            value={employeeId}
                            onValueChange={(v) => {
                                setSelectedGroupId("ALL");
                                setEmployeeId(v);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Employee" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="ALL">All Employees</SelectItem>

                                {employees.map((e) => (
                                    <SelectItem key={e._id} value={e._id}>
                                        {e.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* FROM */}
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">From Date</label>
                        <input
                            type="date"
                            value={fromDate || ""}
                            onChange={(e) => setFromDate(e.target.value || null)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    {/* TO */}
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">To Date</label>
                        <input
                            type="date"
                            value={toDate || ""}
                            onChange={(e) => setToDate(e.target.value || null)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    {/* GROUP */}
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Group</label>
                        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Groups" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Groups</SelectItem>
                                {groups.map((g) => (
                                    <SelectItem key={g._id} value={g._id}>
                                        {g.groupName} ({g.groupId})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* DAY FILTER */}
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">
                            Collection Day
                        </label>
                        <Select value={dayFilter} onValueChange={setDayFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Days" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Days</SelectItem>
                                <SelectItem value="Monday">Monday</SelectItem>
                                <SelectItem value="Tuesday">Tuesday</SelectItem>
                                <SelectItem value="Wednesday">Wednesday</SelectItem>
                                <SelectItem value="Thursday">Thursday</SelectItem>
                                <SelectItem value="Friday">Friday</SelectItem>
                                <SelectItem value="Saturday">Saturday</SelectItem>
                                <SelectItem value="Sunday">Sunday</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* QUICK BUTTONS */}
                    <div className="md:col-span-5 flex justify-center gap-2 pt-2">
                        {["TODAY", "WEEK", "MONTH"].map((t) => (
                            <button
                                key={t}
                                onClick={() =>
                                    setQuickRange(t as "TODAY" | "WEEK" | "MONTH", setFromDate, setToDate)
                                }
                                className="px-4 py-1.5 border rounded text-sm hover:bg-blue-50"
                            >
                                {t === "TODAY" ? "Today" : t === "WEEK" ? "This Week" : "This Month"}
                            </button>
                        ))}
                    </div>

                    {/* SEARCH */}
                    <div className="md:col-span-5 flex justify-center pt-4">
                        <button
                            onClick={() => fetchEmployeeGroups(employeeId)}
                            disabled={!employeeId || !fromDate || !toDate}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-10 py-2 rounded font-medium"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </Card>

            {/* TABLE */}
            {loading ? (
                <p className="text-center py-6">Loading…</p>
            ) : groupSummaries.length > 0 ? (
                <Card className="p-4 overflow-auto">
                    <table className="w-full text-sm border">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="border p-2">Employee</th>
                                <th className="border p-2">Group</th>
                                <th className="border p-2">Collection Day</th>
                                <th className="border p-2">Collection Time</th>
                                <th className="border p-2">Members</th>
                                <th className="border p-2">Principal</th>
                                <th className="border p-2">Interest</th>
                                <th className="border p-2">Savings</th>
                                <th className="border p-2">Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {groupSummaries.map((g, i) => (
                                <tr key={i} className="text-center">
                                    <td className="border p-2 font-semibold">{g.employeeName}</td>
                                    <td className="border p-2">
                                        {g.groupName} ({g.groupId})
                                    </td>
                                    <td className="border p-2">{g.collectionDay}</td>
                                    <td className="border p-2">{g.collectionTime}</td>
                                    <td className="border p-2 font-semibold">{g.members}</td>
                                    <td className="border p-2">₹{g.principal}</td>
                                    <td className="border p-2">₹{g.interest}</td>
                                    <td className="border p-2">₹{g.savings}</td>
                                    <td className="border p-2 font-bold text-blue-700">₹{g.total}</td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot className="bg-gray-100 font-bold">
                            <tr className="text-center">
                                <td colSpan={5} className="border p-2">
                                    GRAND TOTAL
                                </td>
                                <td className="border p-2 text-green-700">₹{grandTotals.principal}</td>
                                <td className="border p-2 text-green-700">₹{grandTotals.interest}</td>
                                <td className="border p-2 text-green-700">₹{grandTotals.savings}</td>
                                <td className="border p-2 text-blue-800 text-lg">₹{grandTotals.total}</td>
                            </tr>
                        </tfoot>
                    </table>
                </Card>
            ) : (
                employeeId && (
                    <p className="text-center text-gray-500">
                        No dues found for selected date range
                    </p>
                )
            )}
        </section>
    );
}
