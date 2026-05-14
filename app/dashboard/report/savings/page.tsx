"use client";

import { useEffect, useState } from "react";
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

interface Row {
    _id: string;
    mfLoanId: string;
    customerName: string;
    groupName: string;
    groupId: string;
    employeeName: string;
    totalSavings: number;
    refundedAt: string;
}

export default function SavingsRefundReportPage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [filters, setFilters] = useState({
        from: "",
        to: "",
        group: "ALL",
        employee: "ALL",
    });

    async function fetchReport() {
        let url = `/api/report/savings-report?`;

        if (filters.from) url += `from=${filters.from}&`;
        if (filters.to) url += `to=${filters.to}&`;
        if (filters.group !== "ALL") url += `group=${filters.group}&`;
        if (filters.employee !== "ALL") url += `employee=${filters.employee}&`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
            toast.error("Failed to load report");
            return;
        }

        setRows(data.rows || []);
    }

    useEffect(() => {
        async function loadMeta() {
            const [g, e] = await Promise.all([
                fetch("/api/group/list").then(r => r.json()),
                fetch("/api/employees/list").then(r => r.json()),
            ]);

            setGroups(g.groups || []);
            setEmployees(e.employees || []);
        }

        loadMeta();
    }, []);

    const totalRefunded = rows.reduce(
        (sum, r) => sum + (r.totalSavings || 0),
        0
    );

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-8">
            <PageHeader />

            <h1 className="text-3xl font-bold text-blue-600">
                Savings Refund Report
            </h1>

            {/* Filters */}
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

                <Button onClick={fetchReport}>Generate</Button>
            </Card>

            {/* Summary */}
            <Card className="p-4 flex items-left justify-between bg-green-50 border-green-200">
                <div>
                    <p className="text-sm text-gray-600">Total Savings Refunded</p>
                    <p className="text-2xl font-bold text-green-700">
                        ₹{totalRefunded.toLocaleString()}
                    </p>
                </div>

                <div className="text-sm text-gray-500">
                    Records: <span className="font-semibold">{rows.length}</span>
                </div>
            </Card>

            {/* Table */}
            <Card className="p-4 overflow-auto">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border">Loan ID</th>
                            <th className="p-3 border">Customer</th>
                            <th className="p-3 border">Group</th>
                            <th className="p-3 border">Employee</th>
                            <th className="p-3 border">Savings Refunded</th>
                            <th className="p-3 border">Refund Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-gray-500">
                                    No records found
                                </td>
                            </tr>
                        )}

                        {rows.map(r => (
                            <tr key={r._id} className="text-center hover:bg-gray-50">
                                <td className="border p-2">{r.mfLoanId}</td>
                                <td className="border p-2">{r.customerName}</td>
                                <td className="border p-2">
                                    {r.groupName} ({r.groupId})
                                </td>
                                <td className="border p-2">{r.employeeName}</td>
                                <td className="border p-2 font-bold text-green-700">
                                    ₹{r.totalSavings.toLocaleString()}
                                </td>
                                <td className="border p-2">
                                    {new Date(r.refundedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </section>
    );
}
