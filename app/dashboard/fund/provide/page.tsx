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
import { CustomerForLoan, LoanStatus } from "@/types/customer";

export default function NewLoanPage() {
    const router = useRouter();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [customers, setCustomers] = useState<CustomerForLoan[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [triedLoading, setTriedLoading] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    // Load employees initially
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

    // Fetch groups for selected employee
    async function handleEmployeeSelect(empId: string) {
        setSelectedEmployee(empId);
        setSelectedGroup("");
        setCustomers([]);
        setTriedLoading(false);

        try {
            const res = await fetch(`/api/group?employeeId=${empId}&status=ACTIVE`);
            const data = await res.json();
            setGroups(data.groups || []);
        } catch {
            toast.error("Failed to load groups");
        }
    }

    // Load customers + loan status
    async function handleSubmit() {
        if (!selectedEmployee || !selectedGroup) {
            return toast.error("Select employee and group first");
        }

        setTriedLoading(true);
        setLoadingCustomers(true);
        setCustomers([]);

        try {
            // Get customers of group
            const res = await fetch(`/api/clients?groupId=${selectedGroup}&status=ACTIVE`);
            const data = await res.json();
            const clients = data.clients || [];

            // For each customer, fetch loan status
            const results: CustomerForLoan[] = await Promise.all(
                clients.map(async (cust: CustomerForLoan) => {
                    const r = await fetch(`/api/fund/customer?customerId=${cust._id}`);
                    const d = await r.json();

                    const status: LoanStatus = d.loan?.status || "NONE";

                    return {
                        _id: cust._id,
                        customerCode: cust.customerCode,
                        name: cust.name,
                        phone: cust.phone,
                        loanStatus: status
                    };
                })
            );

            setCustomers(results);
        } catch {
            toast.error("Failed to load customers");
        }

        setLoadingCustomers(false);
    }

    function handleSelectCustomer(c: CustomerForLoan) {
        router.push(`/dashboard/fund/provide/${c._id}`);
    }

    // status badge renderer
    function renderStatusBadge(status: LoanStatus) {
        const styles: Record<LoanStatus, string> = {
            REPAID: "text-green-600 font-bold",
            NONE: "text-blue-600 font-bold",
            APPROVED: "text-orange-600 font-bold",
            PENDING: "text-yellow-600 font-bold",
            REJECTED: "text-red-600 font-bold",
        };

        return <span className={styles[status]}>{status}</span>;
    }

    function canTakeLoan(status: LoanStatus) {
        return status === "NONE" || status === "REPAID" || status === "REJECTED";
    }

    return (
        <section className="max-w-7xl mx-auto space-y-10">
            <PageHeader />
            <h1 className="text-3xl font-bold text-orange-600">NEW LOAN</h1>

            {/* Selection UI */}
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
                        onValueChange={setSelectedGroup}
                    >
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue
                                placeholder={selectedEmployee ? "Select Group" : "Select Employee First"}
                            />
                        </SelectTrigger>

                        <SelectContent>
                            {groups.length ? (
                                groups.map((g) => (
                                    <SelectItem key={g._id} value={g._id}>
                                        {g.groupName} ({g.groupId})
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="text-gray-500 text-center py-2">
                                    No groups found
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Load button */}
                <Button className="bg-red-600 hover:bg-red-700" onClick={handleSubmit}>
                    Load Customers
                </Button>
            </div>

            {/* Loading */}
            {loadingCustomers && (
                <p className="text-center text-blue-600 mt-6">Loading customers...</p>
            )}

            {/* Table */}
            {customers.length > 0 ? (
                <div className="mt-10 border rounded-lg overflow-hidden shadow">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="p-3 border">Action</th>
                                <th className="p-3 border">Customer Code</th>
                                <th className="p-3 border">Name</th>
                                <th className="p-3 border">Phone</th>
                                <th className="p-3 border">Loan Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map((c) => (
                                <tr key={c._id} className="hover:bg-gray-100">
                                    <td className="p-3 border text-center">
                                        {canTakeLoan(c.loanStatus) ? (
                                            <Button size="sm" onClick={() => handleSelectCustomer(c)}>
                                                Select
                                            </Button>
                                        ) : (
                                            <span className="text-gray-400 cursor-not-allowed">
                                                Not Allowed
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-3 border text-center">{c.customerCode}</td>
                                    <td className="p-3 border font-medium">{c.name}</td>
                                    <td className="p-3 border text-center">{c.phone}</td>
                                    <td className="p-3 border text-center">
                                        {renderStatusBadge(c.loanStatus)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                triedLoading &&
                !loadingCustomers && (
                    <p className="mt-6 text-center text-gray-500">
                        No customers found in this group.
                    </p>
                )
            )}
        </section>
    );
}
