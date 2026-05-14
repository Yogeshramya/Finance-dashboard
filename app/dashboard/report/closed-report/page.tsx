"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Group } from "@/types/group";

export default function ClosedGroupReport() {
    const { data: session } = useSession();

    const [groups, setGroups] = useState<Group[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeId, setEmployeeId] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

    /* Load employees */
    useEffect(() => {
        fetch(`${baseUrl}/api/employees/list`)
            .then((r) => r.json())
            .then((d) => setEmployees(d.employees || []));
    }, [baseUrl]);

    const loadReport = async () => {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("status", "CLOSED");
        if (employeeId) params.append("employeeId", employeeId);

        const res = await fetch(
            `${baseUrl}/api/group/list?${params.toString()}`
        );

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            toast.error("Failed to load closed groups");
            return;
        }

        let list: Group[] = data.groups || [];

        // Date filter (client-side)
        if (from || to) {
            list = list.filter((g) => {
                if (!g.closedAt) return false;
                const d = new Date(g.closedAt).getTime();
                if (from && d < new Date(from).getTime()) return false;
                if (to && d > new Date(to).getTime()) return false;
                return true;
            });
        }

        // Search filter
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (g) =>
                    g.groupName.toLowerCase().includes(q) ||
                    g.groupId.toLowerCase().includes(q)
            );
        }

        setGroups(list);
    };

    if (!session) {
        return <div className="p-10 text-center">Please log in</div>;
    }

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-6">
            <PageHeader />

            <h1 className="text-2xl font-bold">Closed Group Report</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <select
                    className="border p-2 rounded-md"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                >
                    <option value="">All Employees</option>
                    {employees.map((e) => (
                        <option key={e._id} value={e._id}>
                            {e.name}
                        </option>
                    ))}
                </select>

                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />

                <Input
                    placeholder="Search Group"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Button onClick={loadReport} disabled={loading}>
                    {loading ? "Loading..." : "Generate"}
                </Button>
            </div>

            {/* Report Table */}
            <Card>
                <CardContent className="p-4 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Group ID</th>
                                <th className="p-2 text-left">Group Name</th>
                                <th className="p-2 text-left">Employee</th>
                                <th className="p-2 text-right">Members</th>
                                <th className="p-2 text-left">Closed Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((g) => (
                                <tr key={g._id} className="border-t">
                                    <td className="p-2">{g.groupId}</td>
                                    <td className="p-2">{g.groupName}</td>
                                    <td className="p-2">
                                        {typeof g.employee === "object"
                                            ? g.employee?.name
                                            : "-"}
                                    </td>
                                    <td className="p-2 text-right">
                                        {g.totalMembers}
                                    </td>
                                    <td className="p-2">
                                        {g.closedAt
                                            ? new Date(g.closedAt).toLocaleDateString("en-IN")
                                            : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {groups.length === 0 && (
                        <p className="text-center text-gray-400 py-6">
                            No closed groups found
                        </p>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
