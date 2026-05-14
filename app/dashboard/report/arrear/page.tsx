"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import { toast } from "sonner";
import { Group } from "@/types/group";

/* ================= TYPES ================= */

interface ArrearRow {
    _id: string;
    weekNo: number;
    principal: number;
    interest: number;
    savings: number;
    total: number;
    status: "OPEN" | "CLOSED";
    createdAt: string;
    group?: { groupName: string };
    loan?: { mfLoanId: string };
}

/* ================= PAGE ================= */

export default function ArrearReportPage() {
    const router = useRouter();

    const [rows, setRows] = useState<ArrearRow[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        from: "",
        to: "",
        group: "ALL",
        status: "ALL",
    });

    /* -------- LOAD GROUPS -------- */
    useEffect(() => {
        fetch("/api/group/list")
            .then(r => r.json())
            .then(d => setGroups(d.groups || []))
            .catch(() => toast.error("Failed to load groups"));
    }, []);

    /* -------- FETCH REPORT -------- */
    async function fetchReport() {
        setLoading(true);
        try {
            let url = `/api/report/arrear?`;

            if (filters.from) url += `from=${filters.from}&`;
            if (filters.to) url += `to=${filters.to}&`;
            if (filters.group !== "ALL") url += `group=${filters.group}&`;
            if (filters.status !== "ALL") url += `status=${filters.status}&`;

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                toast.error("Failed to load arrear report");
                return;
            }

            setRows(data.arrears || []);
        } catch {
            toast.error("Error loading arrear report");
        } finally {
            setLoading(false);
        }
    }

    /* -------- TOTALS -------- */
    const totals = useMemo(() => {
        return rows.reduce(
            (acc, r) => {
                acc.principal += r.principal || 0;
                acc.interest += r.interest || 0;
                acc.savings += r.savings || 0;
                acc.total += r.total || 0;
                return acc;
            },
            { principal: 0, interest: 0, savings: 0, total: 0 }
        );
    }, [rows]);

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-8">
            <PageHeader />

            <h1 className="text-3xl font-bold text-red-600">
                ARREAR REPORT
            </h1>

            {/* ================= FILTERS ================= */}
            <Card className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                    type="date"
                    value={filters.from}
                    onChange={e =>
                        setFilters({ ...filters, from: e.target.value })
                    }
                />
                <Input
                    type="date"
                    value={filters.to}
                    onChange={e =>
                        setFilters({ ...filters, to: e.target.value })
                    }
                />

                <Select
                    value={filters.group}
                    onValueChange={v =>
                        setFilters({ ...filters, group: v })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Group" />
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

                <Select
                    value={filters.status}
                    onValueChange={v =>
                        setFilters({ ...filters, status: v })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLEARED">Closed</SelectItem>
                    </SelectContent>
                </Select>

                <Button onClick={fetchReport} className="bg-red-600">
                    Generate
                </Button>
            </Card>

            {/* ================= SUMMARY ================= */}
            <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-red-50">
                <Summary label="Principal" value={totals.principal} color="text-green-700" />
                <Summary label="Interest" value={totals.interest} color="text-orange-600" />
                <Summary label="Savings" value={totals.savings} color="text-purple-700" />
                <Summary label="Total" value={totals.total} color="text-gray-900" />
            </Card>

            {/* ================= TABLE ================= */}
            <Card className="p-4 overflow-x-auto">
                {loading ? (
                    <p className="text-center py-6">Loading…</p>
                ) : rows.length ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Loan</th>
                                <th className="border p-2">Group</th>
                                <th className="border p-2">Week</th>
                                <th className="border p-2">Principal</th>
                                <th className="border p-2">Interest</th>
                                <th className="border p-2">Savings</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Status</th>
                                <th className="border p-2">Date</th>
                                <th className="border p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r._id} className="text-center">
                                    <td className="border p-2">
                                        {r.loan?.mfLoanId || "-"}
                                    </td>
                                    <td className="border p-2">
                                        {r.group?.groupName || "-"}
                                    </td>
                                    <td className="border p-2">
                                        Week {r.weekNo}
                                    </td>
                                    <td className="border p-2">₹{r.principal}</td>
                                    <td className="border p-2">₹{r.interest}</td>
                                    <td className="border p-2">₹{r.savings}</td>
                                    <td className="border p-2 font-bold">
                                        ₹{r.total}
                                    </td>
                                    <td className="border p-2">
                                        {r.status}
                                    </td>
                                    <td className="border p-2">
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="border p-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={r.status === "CLOSED"}
                                            onClick={() =>
                                                router.push(`/dashboard/arrear/${r._id}`)
                                            }
                                        >
                                            Open
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center py-6 text-gray-500">
                        No arrears found
                    </p>
                )}
            </Card>
        </section>
    );
}

/* ================= SUMMARY CARD ================= */

function Summary({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className={`text-xl font-bold ${color}`}>
                ₹{value.toLocaleString()}
            </p>
        </div>
    );
}
