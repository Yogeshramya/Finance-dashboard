"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";

import { Group } from "@/types/group";
import { Loan } from "@/types/fund";

export default function LoanSearchPage() {
    const router = useRouter();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);

    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    const [loadingLoans, setLoadingLoans] = useState(false);
    const [triedLoading, setTriedLoading] = useState(false);

    // Load employees
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

    // Load groups of employee
    async function handleEmployeeSelect(empId: string) {
        setSelectedEmployee(empId);
        setSelectedGroup("");
        setLoans([]);
        setTriedLoading(false);

        try {
            const res = await fetch(`/api/group?employeeId=${empId}&status=ACTIVE`);
            const data = await res.json();
            setGroups(data.groups || []);
        } catch {
            toast.error("Failed to load groups");
        }
    }

    // Load loan details
    async function handleSearch() {
        if (!selectedEmployee || !selectedGroup) {
            toast.error("Select employee & group first");
            return;
        }

        setTriedLoading(true);
        setLoadingLoans(true);
        setLoans([]);

        try {
            const res = await fetch(`/api/fund/by-group?groupId=${selectedGroup}`);
            const data = await res.json();
            setLoans(data.loans || []);
        } catch {
            toast.error("Failed to load loans");
        }

        setLoadingLoans(false);
    }

    function handleViewLoan(loan: Loan) {
        router.push(`/dashboard/fund/${loan._id}`);
    }

    // Render loan status with proper colors
    function renderStatus(status: Loan["status"]) {
        const colors: Record<Loan["status"], string> = {
            APPROVED: "text-green-600",
            PENDING: "text-yellow-600",
            REPAID: "text-gray-600",
            REJECTED: "text-red-600",
            NONE: "text-gray-400"
        };
        return <span className={`${colors[status]} font-bold`}>{status}</span>;
    }

    return (
        <section className="max-w-7xl mx-auto space-y-10">
            <PageHeader />
            <h1 className="text-3xl font-bold text-blue-600">SEARCH LOAN</h1>

            <div className="space-y-6">

                {/* Employee */}
                <div>
                    <p className="font-semibold mb-1">Employee :</p>
                    <Select onValueChange={handleEmployeeSelect}>
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map(emp => (
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
                        onValueChange={(v) => {
                            setSelectedGroup(v);
                            setLoans([]);
                            setTriedLoading(false);
                        }}
                    >
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue placeholder={selectedEmployee ? "Select Group" : "Select Employee First"} />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.length > 0 ? (
                                groups.map(g => (
                                    <SelectItem key={g._id} value={g._id}>
                                        {g.groupName} ({g.groupId})
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="text-gray-500 text-center py-2">No groups</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="bg-blue-600 hover:bg-blue-700 px-10 py-5 text-lg"
                    onClick={handleSearch}
                >
                    Search Loans
                </Button>
            </div>

            {loadingLoans && (
                <p className="text-center text-blue-600 mt-6">Searching loans...</p>
            )}

            {/* Results */}
            {loans.length > 0 ? (
                <div className="border rounded-lg mt-10 overflow-hidden">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="p-3 border">Action</th>
                                <th className="p-3 border">Loan ID</th>
                                <th className="p-3 border">Customer</th>
                                <th className="p-3 border">Phone</th>
                                <th className="p-3 border">Amount</th>
                                <th className="p-3 border">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loans.map(loan => (
                                <tr key={loan._id} className="hover:bg-gray-100">
                                    <td className="p-3 border text-center">
                                        <span
                                            className="text-blue-600 underline cursor-pointer"
                                            onClick={() => handleViewLoan(loan)}
                                        >
                                            View
                                        </span>
                                    </td>

                                    <td className="p-3 border text-center font-mono">
                                        {loan.mfLoanId}
                                    </td>

                                    <td className="p-3 border">
                                        {loan.customer?.name || "-"}
                                    </td>

                                    <td className="p-3 border text-center">
                                        {loan.customer?.phone || "-"}
                                    </td>

                                    <td className="p-3 border text-center font-semibold">
                                        ₹{loan.loanAmount || loan.principal || 0}
                                    </td>

                                    <td className="p-3 border text-center font-bold">
                                        {renderStatus(loan.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                triedLoading &&
                !loadingLoans && (
                    <p className="mt-8 text-center text-gray-500 font-medium">
                        No loans found in this group.
                    </p>
                )
            )}
        </section>
    );
}
