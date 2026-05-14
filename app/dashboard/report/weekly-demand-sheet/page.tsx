"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DemandRow {
    _id: string;
    centreDay: string;
    centreName: string;
    centreTime: string;
    staffName: string;
    totalMembers: number;
    principal: number;
    interest: number;
    savings: number;
    totalAmount: number;
    collectedAmount: number;
    branch: string;
}

export default function WeeklyDemandSheetReport() {
    const [rows, setRows] = useState<DemandRow[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        branch: "ALL",
        employee: "ALL",
        centre: "ALL",
        from: "",
        to: "",
    });

    /* Fetch report */
    async function fetchReport() {
        setLoading(true);
        try {
            const qs = new URLSearchParams(filters).toString();
            const res = await fetch(`/api/report/weekly-demand?${qs}`);
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

    /* Totals */
    const totals = rows.reduce(
        (a, r) => {
            a.members += r.totalMembers;
            a.principal += r.principal;
            a.interest += r.interest;
            a.savings += r.savings;
            a.total += r.totalAmount;
            a.collected += r.collectedAmount;
            return a;
        },
        {
            members: 0,
            principal: 0,
            interest: 0,
            savings: 0,
            total: 0,
            collected: 0,
        }
    );

    return (
        <section className="max-w-7xl mx-auto p-4 space-y-6">
            <PageHeader />

            <h1 className="text-xl font-bold text-orange-600">
                WEEKLY DEMAND SHEET
            </h1>

            {/* FILTER BAR */}
            <Card className="p-4 grid grid-cols-1 md:grid-cols-6 gap-4">
                <select
                    className="border p-2 rounded"
                    onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                >
                    <option value="ALL">Select Branch</option>
                </select>

                <input
                    type="date"
                    className="border p-2 rounded"
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                />

                <input
                    type="date"
                    className="border p-2 rounded"
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                />

                <select
                    className="border p-2 rounded"
                    onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                >
                    <option value="ALL">Employee Name</option>
                </select>

                <select
                    className="border p-2 rounded"
                    onChange={(e) => setFilters({ ...filters, centre: e.target.value })}
                >
                    <option value="ALL">Centre Name</option>
                </select>

                <Button className="bg-red-600" onClick={fetchReport}>
                    Submit
                </Button>
            </Card>

            {/* PRINT */}
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                    Print
                </Button>
            </div>

            {/* TABLE */}
            <Card className="overflow-auto">
                {loading ? (
                    <p className="p-6 text-center">Loading…</p>
                ) : (
                    <table className="w-full text-xs border-collapse">
                        <thead className="bg-indigo-700 text-white">
                            <tr>
                                {[
                                    "Sl",
                                    "Centre Day",
                                    "Centre Name",
                                    "Centre Time",
                                    "Staff Name",
                                    "Total Members",
                                    "Principal",
                                    "Interest",
                                    "Savings",
                                    "Total Amount",
                                    "Collected Amount",
                                    "Branch",
                                ].map((h) => (
                                    <th key={h} className="border p-2 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={r._id} className="text-center">
                                    <td className="border p-1">{i + 1}</td>
                                    <td className="border p-1">{r.centreDay}</td>
                                    <td className="border p-1">{r.centreName}</td>
                                    <td className="border p-1">{r.centreTime}</td>
                                    <td className="border p-1">{r.staffName}</td>
                                    <td className="border p-1">{r.totalMembers}</td>
                                    <td className="border p-1">{r.principal}</td>
                                    <td className="border p-1">{r.interest}</td>
                                    <td className="border p-1">{r.savings}</td>
                                    <td className="border p-1 font-semibold">{r.totalAmount}</td>
                                    <td className="border p-1">{r.collectedAmount}</td>
                                    <td className="border p-1">{r.branch}</td>
                                </tr>
                            ))}

                            {/* TOTAL ROW */}
                            {rows.length > 0 && (
                                <tr className="bg-gray-100 font-bold text-center">
                                    <td colSpan={5} className="border p-2">
                                        TOTAL
                                    </td>
                                    <td className="border p-2">{totals.members}</td>
                                    <td className="border p-2">{totals.principal}</td>
                                    <td className="border p-2">{totals.interest}</td>
                                    <td className="border p-2">{totals.savings}</td>
                                    <td className="border p-2">{totals.total}</td>
                                    <td className="border p-2">{totals.collected}</td>
                                    <td className="border p-2"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </Card>
        </section>
    );
}
