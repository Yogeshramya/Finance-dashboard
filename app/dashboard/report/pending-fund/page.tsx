"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";
import Link from "next/link";
import { Group } from "@/types/group";
import { PendingLoanItem } from "@/types/fund";

export default function LoanPendingPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [pending, setPending] = useState<PendingLoanItem[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadEmployees() {
            try {
                const res = await fetch("/api/employees/list");
                const data = await res.json();
                setEmployees(data.employees || []);
            } catch {
                toast.error("Failed to load employees");
            }
        }
        loadEmployees();
    }, []);

    async function handleEmployeeSelect(id: string) {
        setSelectedEmployee(id);
        setSelectedGroup("");
        setPending([]);

        try {
            const res = await fetch(`/api/group?employeeId=${id}`);
            const data = await res.json();
            setGroups(data.groups || []);
        } catch {
            toast.error("Failed to load groups");
        }
    }

    async function fetchPending() {
        if (!selectedGroup) return toast.error("Choose a group!");

        setLoading(true);
        try {
            const res = await fetch(`/api/fund/pending?groupId=${selectedGroup}`);
            const json = await res.json();
            setPending(json.pending || []);
        } catch (e) {
            console.log(e);
            toast.error("Error loading pending list");
        }
        setLoading(false);
    }

    const money = (v: number) => `₹${(v || 0).toFixed(2)}`;

    const totalPending = pending.reduce(
        (sum, p) => sum + (p.pendingAmount || 0),
        0
    );

    const totalCustomers = pending.length;

    return (
        <section className="max-w-7xl mx-auto space-y-10">
            <PageHeader />
            <h1 className="text-3xl font-bold text-orange-600">Pending Loan Dues</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-6 items-end">
                {/* Employee */}
                <div>
                    <label className="font-medium">Employee:</label>
                    <Select onValueChange={handleEmployeeSelect}>
                        <SelectTrigger className="w-72">
                            <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((e) => (
                                <SelectItem key={e._id} value={e._id}>
                                    {e.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Group */}
                <div>
                    <label className="font-medium">Group:</label>
                    <Select disabled={!selectedEmployee} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-72">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.map((g) => (
                                <SelectItem key={g._id} value={g._id}>
                                    {g.groupName} ({g.groupId})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button className="bg-red-600 text-white" onClick={fetchPending}>
                    Load Pending
                </Button>
            </div>

            {/* Loading */}
            {loading && <p className="text-center text-blue-600">Loading...</p>}

            {/* SUMMARY */}
            {pending.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Pending Amount</p>
                        <p className="text-2xl font-bold text-red-700">
                            ₹{totalPending.toLocaleString("en-IN")}
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {totalCustomers}
                        </p>
                    </div>
                </div>
            )}

            {/* Table */}
            {pending.length > 0 ? (
                <div className="border rounded-lg overflow-hidden mt-6">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="p-2 border">Customer</th>
                                <th className="p-2 border">Phone</th>
                                <th className="p-2 border">Pending Amount</th>
                                {/*<th className="p-2 border">Arrear (2W)</th>*/}
                                <th className="p-2 border text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pending.map((p: PendingLoanItem) => (
                                <tr key={p.customerId} className="text-center hover:bg-gray-100">
                                    <td className="p-2 border font-semibold">{p.customerName}</td>
                                    <td className="p-2 border">{p.phone}</td>
                                    <td className="p-2 border text-red-600 font-bold">
                                        {money(p.pendingAmount)}
                                    </td>
                                    {/*<td className="p-2 border text-center">
                                        {p.arrear2Weeks ? (
                                            <span className="text-red-600 font-bold">YES</span>
                                        ) : (
                                            <span className="text-green-600 font-semibold">NO</span>
                                        )}
                                    </td>*/}
                                    <td className="p-2 border">
                                        <Link
                                            className="text-blue-600 underline"
                                            href={`/dashboard/report/pending-fund/${p.customerId}`}
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading &&
                <p className="text-gray-500 text-center text-sm mt-6">
                    No pending dues in this group.
                </p>
            )}
        </section>
    );
}
