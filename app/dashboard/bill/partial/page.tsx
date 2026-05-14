"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Group } from "@/types/group";
import { Loan } from "@/types/fund";
import PageHeader from "@/components/PageHeader";


export default function PartialBillPage() {
    const router = useRouter();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);

    const [employeeId, setEmployeeId] = useState("");
    const [, setGroupId] = useState("");

    useEffect(() => {
        fetch("/api/employees/list")
            .then(r => r.json())
            .then(d => setEmployees(d.employees || []));
    }, []);

    async function fetchGroups(empId: string) {
        setEmployeeId(empId);
        setGroups([]);
        setLoans([]);

        const res = await fetch(`/api/group/search?query=${empId}&status=ACTIVE`);
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : []);
    }

    async function fetchLoans(groupId: string) {
        setGroupId(groupId);

        const res = await fetch(`/api/fund/by-group?groupId=${groupId}`);
        const data = await res.json();

        setLoans(data.loans || []);
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <PageHeader />
            <h1 className="text-2xl font-bold text-orange-600">
                Partial Bill Entry
            </h1>

            <Card className="p-4">
                <Select onValueChange={fetchGroups}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                        {employees.map(e => (
                            <SelectItem key={e._id} value={e._id}>
                                {e.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Card>

            {employeeId && (
                <Card className="p-4">
                    <Select onValueChange={fetchLoans}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.map(g => (
                                <SelectItem key={g._id} value={g._id}>
                                    {g.groupName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Card>
            )}

            {loans.length > 0 && (
                <Card className="p-4">
                    <h2 className="font-semibold mb-3">Customers</h2>

                    <div className="space-y-2">
                        {loans.map(l => (
                            <div
                                key={l._id}
                                className="flex justify-between p-3 border rounded cursor-pointer hover:bg-gray-50"
                                onClick={() =>
                                    router.push(`/dashboard/bill/partial/${l._id}`)
                                }
                            >
                                <span>{l.customer?.name}</span>
                                <span className="text-sm text-gray-500">
                                    Loan: {l.mfLoanId}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}