"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Group } from "@/types/group";

export default function SearchGroup() {
    const [results, setResults] = useState<Group[]>([]);
    const [error, setError] = useState("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmp, setSelectedEmp] = useState("");
    const [clientCounts, setClientCounts] = useState<Record<string, number>>({});


    // Load employees
    useEffect(() => {
        fetch("/api/employees/list")
            .then((res) => res.json())
            .then((data) => setEmployees(data.employees || []));
    }, []);

    useEffect(() => {
        async function loadClientCounts() {
            if (results.length === 0) return;

            const counts: Record<string, number> = {};

            await Promise.all(
                results.map(async (group) => {
                    try {
                        const res = await fetch(
                            `/api/clients?groupId=${group._id}`
                        );
                        const data = await res.json();

                        if (res.ok && Array.isArray(data.clients)) {
                            counts[group._id] = data.clients.length;
                        } else {
                            counts[group._id] = 0;
                        }
                    } catch {
                        counts[group._id] = 0;
                    }
                })
            );

            setClientCounts(counts);
        }

        loadClientCounts();
    }, [results]);


    // Helper → extract name from Employee | string | null
    const getEmployeeName = (emp: Employee | string | null | undefined) => {
        if (!emp) return "-";
        return typeof emp === "string"
            ? employees.find((e) => e._id === emp)?.name || emp
            : emp.name;
    };

    // Helper → extract branch name
    const getBranchName = (branch: Branch | string | null | undefined) => {
        if (!branch) return "-";
        return typeof branch === "string" ? branch : branch.name;
    };

    const handleSearchByEmployee = async () => {
        setResults([]);
        setError("");

        if (!selectedEmp) {
            setError("Please select an employee!");
            return;
        }

        const res = await fetch(`/api/group/search?query=${selectedEmp}`);
        const data = await res.json();

        if (!res.ok || !Array.isArray(data) || data.length === 0) {
            setError("No groups found for selected employee");
            return;
        }

        setResults(data);
    };

    return (
        <section className="max-w-7xl mx-auto space-y-6 p-6">
            <PageHeader />

            <h1 className="text-2xl font-bold">Search Group</h1>

            {/* Employee Search */}
            <div className="space-y-4">
                <label className="font-semibold text-sm">Search by Employee</label>

                <div className="flex gap-4">
                    <Select onValueChange={(v) => setSelectedEmp(v)}>
                        <SelectTrigger>
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

                    <Button onClick={handleSearchByEmployee}>
                        Search Groups
                    </Button>
                </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-3">
                    <h2 className="font-semibold">
                        Found {results.length} Group(s)
                    </h2>

                    {results.map((group) => (
                        <Card key={group._id} className="cursor-pointer hover:shadow-md transition">
                            <CardContent className="p-4 space-y-1 text-sm">

                                {/* Group ID + Copy */}
                                <div className="flex gap-2 items-center">
                                    <p><b>ID:</b> {group.groupId}</p>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(group.groupId);
                                            toast.success("Group ID copied!");
                                        }}
                                        className="p-1 rounded hover:bg-gray-200"
                                    >
                                        <Copy className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>

                                <p><b>Group Name:</b> {group.groupName}</p>
                                <p><b>Branch:</b> {getBranchName(group.branch)}</p>
                                <p><b>Collection Employee:</b> {getEmployeeName(group.employee)}</p>
                                <p><b>Created Employee:</b> {getEmployeeName(group.createdBy)}</p>
                                <p>
                                    <b>Collection Day:</b>{" "}
                                    {group.collectionDay}
                                </p>
                                <p>
                                    <b>Collection Time:</b>{" "}
                                    {group.collectionTime || "-"}
                                </p>

                                <p>
                                    <b>No. of Clients:</b>{" "}
                                    {clientCounts[group._id] ?? "Loading..."}
                                </p>
                                <p><b>Due On:</b> {group.dueOn}</p>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}