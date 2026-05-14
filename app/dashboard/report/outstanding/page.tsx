"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ================= TYPES ================= */

interface Group {
    _id: string;
    groupName: string;
}

interface FinancialRow {
    groupName: string;
    members: number;
    loanAmount: number;

    totalPrincipal: number;
    paidPrincipal: number;
    pendingPrincipal: number;

    totalInterest: number;
    paidInterest: number;
    pendingInterest: number;

    paidSavings: number;
    totalOutstanding: number;

    status: "APPROVED" | "CLOSED";
}

/* ================= PAGE ================= */

export default function GroupOutstandingReportPage() {
    const [rows, setRows] = useState<FinancialRow[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        from: "",
        to: "",
        group: "ALL",
    });

    /* ================= LOAD GROUPS ================= */

    useEffect(() => {
        fetch("/api/group/list")
            .then(r => r.json())
            .then(d => setGroups(d.groups || []))
            .catch(() => toast.error("Failed to load groups"));
    }, []);

    /* ================= FETCH REPORT ================= */

    async function fetchReport() {
        setLoading(true);
        try {
            let url = `/api/report/outstanding?`;

            if (filters.from) url += `from=${filters.from}&`;
            if (filters.to) url += `to=${filters.to}&`;
            if (filters.group !== "ALL") url += `group=${filters.group}&`;

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                toast.error("Failed to load report");
                return;
            }

            setRows(data.rows || []);
        } catch {
            toast.error("Error loading report");
        } finally {
            setLoading(false);
        }
    }

    /* ================= PAGINATION ================= */

    const [page, setPage] = useState(1);
    const limit = 10;
    const totalPages = Math.ceil(rows.length / limit);

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * limit;
        return rows.slice(start, start + limit);
    }, [rows, page]);

    /* ================= SUMMARY ================= */

    const summary = useMemo(() => {
        return rows.reduce(
            (a, r) => {
                a.totalPrincipal += r.totalPrincipal;
                a.paidPrincipal += r.paidPrincipal;
                a.pendingPrincipal += r.pendingPrincipal;

                a.totalInterest += r.totalInterest;
                a.paidInterest += r.paidInterest;
                a.pendingInterest += r.pendingInterest;

                a.paidSavings += r.paidSavings;
                a.totalOutstanding += r.totalOutstanding;

                return a;
            },
            {
                totalPrincipal: 0,
                paidPrincipal: 0,
                pendingPrincipal: 0,

                totalInterest: 0,
                paidInterest: 0,
                pendingInterest: 0,

                paidSavings: 0,
                totalOutstanding: 0,
            }
        );
    }, [rows]);

    /* ================= UI ================= */

    return (
        <section className="max-w-7xl mx-auto space-y-8 p-6">
            <PageHeader />

            <h1 className="text-3xl font-bold text-orange-600">
                OUTSTANDING REPORT
            </h1>

            {/* ================= FILTERS ================= */}
            <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-sm font-semibold">From Date</label>
                    <Input
                        type="date"
                        value={filters.from}
                        onChange={e => setFilters({ ...filters, from: e.target.value })}
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold">To Date</label>
                    <Input
                        type="date"
                        value={filters.to}
                        onChange={e => setFilters({ ...filters, to: e.target.value })}
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold">Group</label>
                    <Select
                        value={filters.group}
                        onValueChange={v => setFilters({ ...filters, group: v })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Groups" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Groups</SelectItem>
                            {groups.map(g => (
                                <SelectItem key={g._id} value={g._id}>
                                    {g.groupName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={fetchReport}
                >
                    Submit
                </Button>
            </Card>

            {/* ================= SUMMARY ================= */}
            {rows.length > 0 && (
                <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-blue-50 border-blue-200">
                    <Summary label="Total Principal" value={summary.totalPrincipal} />
                    <Summary label="Paid Principal" value={summary.paidPrincipal} />
                    <Summary label="Pending Principal" value={summary.pendingPrincipal} highlight />

                    <Summary label="Total Interest" value={summary.totalInterest} />
                    <Summary label="Paid Interest" value={summary.paidInterest} />
                    <Summary label="Pending Interest" value={summary.pendingInterest} highlight />

                    <Summary label="Paid Savings" value={summary.paidSavings} />

                    <Summary
                        label="Total Outstanding"
                        value={summary.totalOutstanding}
                        highlight
                    />
                </Card>
            )}

            {/* ================= TABLE ================= */}
            <Card className="overflow-x-auto">
                {loading ? (
                    <p className="text-center py-10">Loading…</p>
                ) : paginatedRows.length ? (
                    <table className="min-w-[1400px] text-sm border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                {[
                                    "S.No",
                                    "Group Name",
                                    "Members",
                                    "Loan Amount",
                                    "Total Principal",
                                    "Paid Principal",
                                    "Pending Principal",
                                    "Total Interest",
                                    "Paid Interest",
                                    "Pending Interest",
                                    "Paid Savings",
                                    "Total Outstanding",
                                    "Status",
                                ].map(h => (
                                    <th key={h} className="border p-2 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedRows.map((r, i) => (
                                <tr key={i} className="hover:bg-gray-50 text-center">
                                    <td className="border p-2">{(page - 1) * limit + i + 1}</td>
                                    <td className="border p-2 font-medium">{r.groupName}</td>
                                    <td className="border p-2">{r.members}</td>
                                    <td className="border p-2">₹{r.loanAmount}</td>
                                    <td className="border p-2">₹{r.totalPrincipal}</td>
                                    <td className="border p-2 text-green-700">₹{r.paidPrincipal}</td>
                                    <td className="border p-2 text-red-600">₹{r.pendingPrincipal}</td>
                                    <td className="border p-2">₹{r.totalInterest}</td>
                                    <td className="border p-2 text-green-700">₹{r.paidInterest}</td>
                                    <td className="border p-2 text-red-600">₹{r.pendingInterest}</td>
                                    <td className="border p-2">₹{r.paidSavings}</td>
                                    <td className="border p-2 font-bold text-red-700">
                                        ₹{r.totalOutstanding}
                                    </td>
                                    <td className="border p-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${r.status === "CLOSED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center py-10 text-gray-500">
                        No data found
                    </p>
                )}
            </Card>

            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
                <div className="flex justify-end items-center gap-4">
                    <span className="text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        size="icon"
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </section>
    );
}

/* ================= SMALL COMPONENT ================= */

function Summary({
    label,
    value,
    highlight,
}: {
    label: string;
    value: number;
    highlight?: boolean;
}) {
    return (
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p
                className={`text-xl font-bold ${highlight ? "text-red-700" : "text-gray-900"
                    }`}
            >
                ₹{value.toLocaleString()}
            </p>
        </div>
    );
}
