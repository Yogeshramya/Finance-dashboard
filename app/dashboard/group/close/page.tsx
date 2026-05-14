"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Group } from "@/types/group";

interface Eligibility {
    canClose: boolean;
    reason?: string;
}

export default function CloseGroupPage() {
    const { data: session } = useSession();

    const [groups, setGroups] = useState<Group[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [search, setSearch] = useState("");
    const [eligibility, setEligibility] = useState<Record<string, Eligibility>>(
        {}
    );
    const [loading, setLoading] = useState(false);

    /* Load employees */
    useEffect(() => {
        async function loadEmployees() {
            try {
                const res = await fetch(`/api/employees/list`);
                const data = await res.json();
                setEmployees(data.employees || []);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load employees");
            }
        }
        loadEmployees();
    }, []);

    /* Load active groups */
    useEffect(() => {
        async function loadGroups() {
            try {
                const res = await fetch(`/api/group/list`);
                const data = await res.json();

                const activeGroups =
                    data.groups?.filter((g: Group) => {
                        //if (g.status === "CLOSED") return false;

                        if (!selectedEmployee) return true;

                        if (typeof g.employee === "object") {
                            return g.employee?._id === selectedEmployee;
                        }

                        return g.employee === selectedEmployee;
                    }) || [];

                setGroups(activeGroups);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load groups");
            }
        }
        loadGroups();
    }, [selectedEmployee]);

    /* Reset eligibility on filter/search change */
    useEffect(() => {
        setEligibility({});
    }, [selectedEmployee, search]);

    /* 🔍 SEARCH + PRIORITY SORT */
    const filteredGroups = useMemo(() => {
        if (!search.trim()) return groups;

        const q = search.toLowerCase();

        return [...groups].sort((a, b) => {
            const aName = a.groupName.toLowerCase();
            const bName = b.groupName.toLowerCase();
            const aId = a.groupId.toLowerCase();
            const bId = b.groupId.toLowerCase();

            const aStarts =
                aName.startsWith(q) || aId.startsWith(q);
            const bStarts =
                bName.startsWith(q) || bId.startsWith(q);

            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            return aName.localeCompare(bName);
        }).filter(
            (g) =>
                g.groupName.toLowerCase().includes(q) ||
                g.groupId.toLowerCase().includes(q)
        );
    }, [groups, search]);

    /* Check dues eligibility */
    const checkEligibility = async (groupId: string) => {
        try {
            setLoading(true);

            const res = await fetch(
                `/api/group/${groupId}/close`,
                { method: "POST" }
            );

            const data = await res.json();

            if (!res.ok) {
                setEligibility((prev) => ({
                    ...prev,
                    [groupId]: {
                        canClose: false,
                        reason: data.error || "Pending dues",
                    },
                }));
            } else {
                setEligibility((prev) => ({
                    ...prev,
                    [groupId]: { canClose: true },
                }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* Close group */
    const closeGroup = async (groupId: string) => {
        if (!confirm("Are you sure you want to close this group?")) return;

        const res = await fetch(
            `/api/group/${groupId}/close`,
            { method: "POST" }
        );

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || "Cannot close group");
            return;
        }

        toast.success("Group closed successfully");

        setGroups((prev) => prev.filter((g) => g._id !== groupId));
    };

    if (!session) {
        return (
            <div className="p-10 text-center text-gray-500">
                Please log in
            </div>
        );
    }

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-6">
            <PageHeader />

            <div>
                <h1 className="text-2xl font-bold">Close Group</h1>
                <p className="text-gray-500">
                    Groups can be closed only when all loan dues are fully paid.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 max-w-xl">
                {/* Employee Filter */}
                <select
                    className="border p-2 rounded-md w-full"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                            {emp.name}
                        </option>
                    ))}
                </select>

                {/* Search */}
                <Input
                    placeholder="Search by Group Name or ID"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Group Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => {
                    const check = eligibility[group._id];

                    return (
                        <Card key={group._id} className="shadow-sm">
                            <CardContent className="p-5 space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {group.groupId}
                                    </p>
                                    <h3 className="font-semibold text-lg">
                                        {group.groupName}
                                    </h3>
                                    <span
                                        className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${group.status === "CLOSED"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {group.status}
                                    </span>
                                </div>

                                {check ? (
                                    check.canClose ? (
                                        <p className="text-green-600 text-sm font-medium">
                                            All dues paid – Ready to close
                                        </p>
                                    ) : (
                                        <p className="text-red-600 text-sm">
                                            {check.reason}
                                        </p>
                                    )
                                ) : (
                                    <p className="text-gray-400 text-sm">
                                        Not checked
                                    </p>
                                )}

                                <div className="flex gap-2 pt-2">
                                    {group.status === "CLOSED" ? (
                                        <Button
                                            className="flex-1 bg-red-600 text-white cursor-not-allowed"
                                            disabled
                                        >
                                            CLOSED
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                disabled={loading}
                                                onClick={() => checkEligibility(group._id)}
                                            >
                                                Check Dues
                                            </Button>

                                            <Button
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                                disabled={!check?.canClose}
                                                onClick={() => closeGroup(group._id)}
                                            >
                                                Close
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredGroups.length === 0 && (
                <p className="text-center text-gray-400 py-10">
                    No matching groups found
                </p>
            )}
        </section>
    );
}
