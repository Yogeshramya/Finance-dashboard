"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

import { Bill } from "@/types/bill";
import { Group } from "@/types/group";

export default function PreClosedLoanReport() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        from: "",
        to: "",
        group: "ALL",
        employee: "ALL",
    });

    const [page, setPage] = useState(1);
    const limit = 10;

    /* ---------------- LOAD META ---------------- */
    useEffect(() => {
        Promise.all([
            fetch("/api/group/list").then(r => r.json()),
            fetch("/api/employees/list").then(r => r.json()),
        ])
            .then(([g, e]) => {
                setGroups(g.groups || []);
                setEmployees(e.employees || []);
            })
            .catch(() => toast.error("Failed to load filters"));
    }, []);

    /* ---------------- FETCH PRECLOSE BILLS ---------------- */
    async function fetchBills() {
        setLoading(true);
        try {
            let url = `/api/bill/report?type=PreClose&`;

            if (filters.from) url += `from=${filters.from}&`;
            if (filters.to) url += `to=${filters.to}&`;
            if (filters.group !== "ALL") url += `group=${filters.group}&`;
            if (filters.employee !== "ALL") url += `employee=${filters.employee}&`;

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                toast.error("Failed to load pre-closed report");
                return;
            }

            setBills(data.bills || []);
            setPage(1);
        } catch {
            toast.error("Error loading report");
        } finally {
            setLoading(false);
        }
    }

    /* ---------------- PAGINATION ---------------- */
    const totalPages = Math.ceil(bills.length / limit);
    const paginatedBills = useMemo(() => {
        const start = (page - 1) * limit;
        return bills.slice(start, start + limit);
    }, [bills, page]);

    const totals = useMemo(() => {
        return bills.reduce(
            (acc, bill) => {
                const breakup = getBillBreakup(bill);
                acc.principal += breakup.principal;
                acc.interest += breakup.interest;
                acc.savings += breakup.savings;
                acc.total += bill.totalCollected || 0;
                return acc;
            },
            {
                principal: 0,
                interest: 0,
                savings: 0,
                total: 0,
            }
        );
    }, [bills]);


    return (
        <section className="max-w-7xl mx-auto space-y-8 p-6">
            <PageHeader />

            <h1 className="text-3xl font-bold text-orange-600">
                PRE-CLOSED LOAN REPORT
            </h1>

            {/* FILTERS */}
            <Card className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                    type="date"
                    value={filters.from}
                    onChange={e => setFilters({ ...filters, from: e.target.value })}
                />
                <Input
                    type="date"
                    value={filters.to}
                    onChange={e => setFilters({ ...filters, to: e.target.value })}
                />

                <Select
                    value={filters.group}
                    onValueChange={v => setFilters({ ...filters, group: v })}
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
                    value={filters.employee}
                    onValueChange={v => setFilters({ ...filters, employee: v })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Employee" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Employees</SelectItem>
                        {employees.map(e => (
                            <SelectItem key={e._id} value={e._id}>
                                {e.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={fetchBills} className="bg-orange-600">
                    Generate
                </Button>
            </Card>

            {/* SUMMARY */}
            <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-orange-50 border-orange-200">
                <div>
                    <p className="text-sm text-gray-600">Total Principal</p>
                    <p className="text-xl font-bold text-green-700">
                        ₹{totals.principal.toLocaleString()}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-600">Total Interest</p>
                    <p className="text-xl font-bold text-orange-600">
                        ₹{totals.interest.toLocaleString()}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-600">Total Savings</p>
                    <p className="text-xl font-bold text-purple-700">
                        ₹{totals.savings.toLocaleString()}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                        ₹{totals.total.toLocaleString()}
                    </p>
                </div>
            </Card>

            {/* TABLE */}
            <Card className="p-4 overflow-x-auto">
                {loading ? (
                    <p className="text-center py-6">Loading…</p>
                ) : paginatedBills.length ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Group</th>
                                <th className="border p-2">Customer</th>
                                <th className="border p-2">Week</th>
                                <th className="border p-2">Principal</th>
                                <th className="border p-2">Interest</th>
                                <th className="border p-2">Savings</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Employee</th>
                                <th className="border p-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBills.map(bill => {
                                const breakup = getBillBreakup(bill);
                                return (
                                    <tr key={bill._id} className="text-center">
                                        <td className="border p-2">
                                            {typeof bill.group === "object" && bill.group
                                                ? bill.group.groupName // Assuming group has a groupName property
                                                : "-"}
                                        </td>
                                        <td className="border p-2">
                                            {bill.loans[0].customerName}
                                        </td>
                                        <td className="border p-2">
                                            Week {bill.weekNo}
                                        </td>
                                        <td className="border p-2 text-green-700">
                                            ₹{breakup.principal}
                                        </td>
                                        <td className="border p-2 text-orange-600">
                                            ₹{breakup.interest}
                                        </td>
                                        <td className="border p-2 text-purple-700">
                                            ₹{breakup.savings}
                                        </td>
                                        <td className="border p-2 font-bold">
                                            ₹{bill.totalCollected}
                                        </td>
                                        <td className="border p-2">
                                            {typeof bill.employee === "object" && bill.employee ? bill.employee.name : "-"}
                                        </td>
                                        <td className="border p-2">
                                            {new Date(bill.collectedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center py-6 text-gray-500">
                        No pre-closed loans found.
                    </p>
                )}
            </Card>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-end gap-3">
                    <Button
                        size="icon"
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            )}
        </section>
    );
}

function getBillBreakup(bill: Bill) {
    return (bill.loans || []).reduce(
        (acc, l) => {
            acc.principal += l.principal || 0;
            acc.interest += l.interest || 0;
            acc.savings += l.savings || 0;
            return acc;
        },
        { principal: 0, interest: 0, savings: 0 }
    );
}
