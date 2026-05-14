"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { Loan } from "@/types/fund";
import { Group } from "@/types/group";
import { toast } from "sonner";

export default function PassbookPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [search, setSearch] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [groupId, setGroupId] = useState("");
    const [loading, setLoading] = useState(false);

    // Load employees once
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

    // Load groups when employee changes
    async function handleEmployeeChange(empId: string) {
        setEmployeeId(empId);
        setGroupId("");
        setGroups([]);
        setLoans([]);

        try {
            const res = await fetch(`/api/group?employeeId=${empId}&status=ACTIVE`);
            const data = await res.json();
            setGroups(data.groups || []);
        } catch {
            toast.error("Failed to load groups");
        }
    }

    // Fetch loans
    const fetchLoans = async () => {
        if (!employeeId || !groupId) {
            toast.error("Select employee and group");
            return;
        }

        setLoading(true);
        const params = new URLSearchParams({
            groupId,
            employeeId,
        });

        if (search) params.append("search", search);

        try {
            const res = await fetch(`/api/fund/by-group?${params.toString()}`);
            const data = await res.json();
            setLoans(data.loans || []);
        } catch {
            toast.error("Failed to load loans");
        }

        setLoading(false);
    };

    const openPassbook = (loanId: string) => {
        window.open(`/api/passbook/print/${loanId}`, "_blank");
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <PageHeader />

            {/* Filters */}
            <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                    placeholder="Search customer / code / phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Employee */}
                <Select onValueChange={handleEmployeeChange}>
                    <SelectTrigger>
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

                {/* Group */}
                <Select
                    disabled={!employeeId}
                    onValueChange={setGroupId}
                >
                    <SelectTrigger>
                        <SelectValue
                            placeholder={
                                employeeId ? "Select Group" : "Select Employee First"
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {groups.length > 0 ? (
                            groups.map(g => (
                                <SelectItem key={g._id} value={g._id}>
                                    {g.groupName}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-2">
                                No groups found
                            </div>
                        )}
                    </SelectContent>
                </Select>

                <Button onClick={fetchLoans}>Apply</Button>
            </Card>

            {/* List */}
            <Card className="p-4 overflow-x-auto">
                <table className="w-full text-sm border">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-2 border">Customer</th>
                            <th className="p-2 border">Code</th>
                            <th className="p-2 border">Phone</th>
                            <th className="p-2 border">Group</th>
                            <th className="p-2 border">Employee</th>
                            <th className="p-2 border">Scheme</th>
                            <th className="p-2 border text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map((loan) => (
                            <tr key={loan._id} className="hover:bg-muted/50">
                                <td className="p-2 border">{loan.customer.name}</td>
                                <td className="p-2 border">{loan.customer.customerCode}</td>
                                <td className="p-2 border">{loan.customer.phone}</td>
                                <td className="p-2 border">{loan.group?.groupName}</td>
                                <td className="p-2 border">{loan.employee.name}</td>
                                <td className="p-2 border">{loan.scheme?.schemeName}</td>
                                <td className="p-2 border text-center">
                                    <Button
                                        size="sm"
                                        onClick={() => openPassbook(loan._id)}
                                    >
                                        Print
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {!loading && loans.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center p-4 text-muted-foreground">
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
