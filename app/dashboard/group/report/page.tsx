"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

import { Group } from "@/types/group";
import { Customer } from "@/types/customer";

export default function GroupWiseReport() {
    const [query, setQuery] = useState("");
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<Customer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [error, setError] = useState("");

    // Load dropdown data
    useEffect(() => {
        fetch("/api/branches/list")
            .then(res => res.json())
            .then(data => setBranches(data.branches || []));

        fetch("/api/employees/list")
            .then(res => res.json())
            .then(data => setEmployees(data.employees || []));
    }, []);

    /** Resolve Branch Name */
    const getBranch = (branchRef: Branch | string | null | undefined) => {
        if (!branchRef) return "-";
        const id = typeof branchRef === "string" ? branchRef : branchRef._id;
        return branches.find(b => b._id === id)?.name || id;
    };

    /** Resolve Employee Name */
    const getEmployee = (empRef: Employee | string | null | undefined) => {
        if (!empRef) return "-";
        return typeof empRef === "string"
            ? employees.find(e => e._id === empRef)?.name || empRef
            : empRef.name;
    };

    /** Load Report */
    const loadReport = async () => {
        setError("");
        setGroup(null);
        setMembers([]);

        if (!query.trim()) return setError("Enter Group ID or Name");

        const res = await fetch(`/api/group/search?query=${query}`);
        const data = await res.json();

        if (!res.ok || !Array.isArray(data) || data.length === 0) {
            return setError("Group not found");
        }

        const selectedGroup: Group = data[0];
        setGroup(selectedGroup);

        // Load group members
        const mRes = await fetch(`/api/members/by-group/${selectedGroup._id}`);
        const mData = await mRes.json();
        setMembers(mData.members || []);
    };

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-6">
            <PageHeader />
            <h1 className="text-2xl font-bold">Group-Wise Report</h1>

            {/* Search */}
            <div className="flex gap-3">
                <Input
                    placeholder="Enter Group ID or Group Name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button onClick={loadReport}>Search</Button>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {/* Report Details */}
            {group && (
                <div className="space-y-6">

                    {/* ========= Group Details ========= */}
                    <div className="p-4 border rounded-md bg-gray-50">
                        <h2 className="font-semibold text-xl mb-2">Group Details</h2>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p><b>ID:</b> {group.groupId}</p>
                            <p><b>Name:</b> {group.groupName}</p>
                            <p><b>Branch:</b> {getBranch(group.branch)}</p>
                            <p><b>Employee:</b> {getEmployee(group.employee)}</p>
                            <p><b>Due On:</b> {group.dueOn}</p>
                            <p><b>Total Members:</b> {group.totalMembers}</p>
                        </div>
                    </div>

                    {/* ========= Members Table ========= */}
                    <div className="border rounded-md p-4">
                        <h3 className="font-semibold text-lg mb-3">Members</h3>

                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">#</th>
                                    <th className="border p-2">Member Name</th>
                                    <th className="border p-2">Phone</th>
                                    <th className="border p-2">Aadhaar</th>
                                    <th className="border p-2">Address</th>
                                </tr>
                            </thead>

                            <tbody>
                                {members.map((m, index) => (
                                    <tr key={m._id}>
                                        <td className="border p-2">{index + 1}</td>
                                        <td className="border p-2">{m.name}</td>
                                        <td className="border p-2">{m.phone}</td>
                                        <td className="border p-2">{m.aadhar}</td>
                                        <td className="border p-2">{m.area}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {members.length === 0 && (
                            <p className="text-gray-500 text-center py-3">
                                No members found for this group.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
