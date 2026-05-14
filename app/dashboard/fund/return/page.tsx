"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Group } from "@/types/group";

interface Employee {
    _id: string;
    name: string;
}

interface CustomerSavings {
    customerId: string;
    name: string;
    phone: string;

    loanId?: string | null;
    loanStatus?: string | null;

    loanSavings: number;
    draftSavings: number;
    totalSavings: number;

    savingsRequested: boolean;
    savingsReturned: boolean;
    approvalStatus?: "PENDING" | "APPROVED" | null;
}

export default function SavingsReturnSearchPage() {
    const router = useRouter();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [customers, setCustomers] = useState<CustomerSavings[]>([]);

    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);


    /* ================= LOAD EMPLOYEES ================= */

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

    /* ================= LOAD GROUPS ================= */

    async function handleEmployeeSelect(empId: string) {
        setSelectedEmployee(empId);
        setSelectedGroup("");
        setCustomers([]);
        setSearched(false);

        try {
            const res = await fetch(`/api/group?employeeId=${empId}`);
            const data = await res.json();
            setGroups(data.groups || []);
        } catch {
            toast.error("Failed to load groups");
        }
    }

    /* ================= SEARCH ================= */

    async function handleSearch() {
        if (!selectedEmployee || !selectedGroup) {
            toast.error("Select employee & group first");
            return;
        }

        setLoading(true);
        setCustomers([]);
        setSearched(true);

        try {
            const res = await fetch(
                `/api/clients/savings?groupId=${selectedGroup}`
            );

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Failed to load savings");
                return;
            }

            setCustomers(data.customers || []);
        } catch {
            toast.error("Failed to load savings");
        } finally {
            setLoading(false);
        }
    }

    /* ================= REQUEST SAVINGS RETURN ================= */

    async function handleRequestReturn(
        customerId: string,
        totalSavings: number
    ) {
        try {
            const res = await fetch("/api/savings/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId,
                    savings: totalSavings,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Request failed");
                return;
            }

            toast.success("Savings return requested");
            handleSearch();
        } catch {
            toast.error("Request failed");
        }
    }

    /* ================= VIEW SAVINGS ================= */

    function handleViewSavings(customerId: string) {
        router.push(`/dashboard/fund/${customerId}/savings`);
    }

    /* ================= UI ================= */

    return (
        <section className="max-w-7xl mx-auto space-y-10">
            <PageHeader />

            <h1 className="text-3xl font-bold text-green-600">
                SAVINGS RETURN
            </h1>

            {/* ================= FILTER ================= */}

            <div className="space-y-6">

                {/* Employee */}
                <div>
                    <p className="font-semibold mb-1">Employee :</p>

                    <Select onValueChange={handleEmployeeSelect}>
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>

                        <SelectContent>
                            {employees.map((emp) => (
                                <SelectItem key={emp._id} value={emp._id}>
                                    {emp.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Group */}
                <div>
                    <p className="font-semibold mb-1">Group :</p>

                    <Select
                        disabled={!selectedEmployee}
                        onValueChange={(value) => {
                            setSelectedGroup(value);
                            setCustomers([]);
                            setSearched(false);
                        }}
                    >
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue
                                placeholder={
                                    selectedEmployee
                                        ? "Select Group"
                                        : "Select Employee First"
                                }
                            />
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

                <Button
                    className="bg-green-600 hover:bg-green-700 px-10 py-5 text-lg"
                    onClick={handleSearch}
                >
                    Search Savings
                </Button>
            </div>

            {/* ================= LOADING ================= */}

            {loading && (
                <p className="text-center text-green-600">
                    Searching savings...
                </p>
            )}

            {/* ================= RESULTS ================= */}

            {customers.length > 0 ? (
                <div className="border rounded-lg mt-10 overflow-hidden">
                    <table className="w-full border-collapse text-sm">

                        <thead className="bg-green-600 text-white">
                            <tr>
                                <th className="p-3 border">Action</th>
                                <th className="p-3 border">Status</th>
                                <th className="p-3 border">Customer</th>
                                <th className="p-3 border">Phone</th>
                                <th className="p-3 border">Total Savings</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map((customer) => (
                                <tr
                                    key={customer.customerId}
                                    className="hover:bg-gray-100"
                                >

                                    {/* ACTION */}
                                    <td className="p-3 border text-center space-x-2">

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewSavings(customer.customerId)}
                                        >
                                            View
                                        </Button>

                                        {customer.loanStatus === "REPAID" &&
                                            !customer.approvalStatus && (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() =>
                                                        handleRequestReturn(
                                                            customer.customerId,
                                                            customer.totalSavings
                                                        )
                                                    }
                                                >
                                                    Request Return
                                                </Button>
                                            )}

                                        {customer.approvalStatus === "PENDING" && (
                                            <span className="text-yellow-600 font-semibold ml-2">
                                                Requested
                                            </span>
                                        )}

                                        {customer.approvalStatus === "APPROVED" && (
                                            <span className="text-green-600 font-semibold ml-2">
                                                Paid
                                            </span>
                                        )}

                                    </td>

                                    {/* STATUS */}
                                    <td className="p-3 border text-center font-semibold">

                                        {customer.approvalStatus === "APPROVED" ? (
                                            <span className="text-green-600">Paid</span>
                                        ) : customer.approvalStatus === "PENDING" ? (
                                            <span className="text-yellow-600">Requested</span>
                                        ) : customer.loanStatus === "REPAID" ? (
                                            <span className="text-blue-600">Eligible</span>
                                        ) : (
                                            <span className="text-red-600">Pending</span>
                                        )}

                                    </td>

                                    <td className="p-3 border">
                                        {customer.name}
                                    </td>

                                    <td className="p-3 border text-center">
                                        {customer.phone}
                                    </td>

                                    <td className="p-3 border text-center font-semibold">
                                        ₹{customer.totalSavings.toLocaleString()}

                                        {customer.draftSavings > 0 && (
                                            <p className="text-xs text-gray-500">
                                                Draft: ₹{customer.draftSavings.toLocaleString()}
                                            </p>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            ) : (
                searched &&
                !loading && (
                    <p className="text-center text-gray-500">
                        No savings pending in this group
                    </p>
                )
            )}
        </section>
    );
}