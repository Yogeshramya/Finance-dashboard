"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { CollectionDay, Group } from "@/types/group";

export default function ManageGroup() {
    const { data: session } = useSession();

    const [query, setQuery] = useState("");
    const [group, setGroup] = useState<Group | null>(null);
    const [results, setResults] = useState<Group[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [loading, setLoading] = useState(false);
    const [dueStartsLoading, setDueStartsLoading] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const e = await fetch(`/api/employees/list`).then((res) =>
                    res.json()
                );
                setEmployees(e.employees || []);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load dropdowns");
            }
        };
        loadDropdowns();
    }, [baseUrl]);

    // Search for groups
    const searchGroups = async () => {
        if (!query.trim()) return toast.warning("Enter search text");

        setSelectedEmployee("");
        setResults([]);
        setGroup(null);
        setLoading(true);

        try {
            const res = await fetch(`/api/group/search?query=${query}`);
            const data = await res.json();
            setLoading(false);

            if (!res.ok || !data.length) {
                toast.error("No groups found!");
                return;
            }

            setResults(data);
            toast.success(`Found ${data.length} group(s)!`);
        } catch {
            setLoading(false);
            toast.error("Search failed");
        }
    };

    // Fetch groups by employee selection
    const handleEmployeeChange = async (empId: string) => {
        setSelectedEmployee(empId);
        setQuery("");
        setGroup(null);
        setResults([]);

        if (!empId) return;

        setLoading(true);

        try {
            const res = await fetch(`/api/group?employeeId=${empId}`);
            const data = await res.json();
            setLoading(false);

            if (!res.ok || !data.groups?.length) {
                toast.error("No groups found for this employee!");
                return;
            }

            setResults(data.groups);
            toast.success(`Found ${data.groups.length} group(s)!`);
        } catch {
            setLoading(false);
            toast.error("Failed to load groups");
        }
    };

    // Load selected group for editing
    const loadGroup = async (gid: string) => {
        setGroup(null);
        setLoading(true);

        try {
            const res = await fetch(`/api/group/${gid}`);
            const data = await res.json();
            setLoading(false);

            if (!res.ok) return toast.error("Failed to load group");

            if (data.branch && typeof data.branch === "object") data.branch = data.branch._id;
            if (data.employee && typeof data.employee === "object") data.employee = data.employee._id;
            if (data.createdBy && typeof data.createdBy === "object") data.createdBy = data.createdBy._id;

            setGroup(data);
            setResults([]);
        } catch {
            setLoading(false);
            toast.error("Failed to load group");
        }
    };

    // Save / Update Group
    const saveChanges = async () => {
        if (!session?.user) return toast.error("Not authenticated!");
        if (!group?._id) return toast.error("Group not loaded!");

        const payload = {
            ...group,
        };

        const res = await fetch(`/api/group/${group._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) return toast.error("Error updating group!");
        toast.success("Group updated successfully!");
    };

    // Delete Group
    const deleteGroup = async () => {
        if (!confirm("Are you sure?")) return;
        if (!group?._id) return toast.error("Group not loaded!");

        const res = await fetch(`/api/group/${group._id}`, {
            method: "DELETE",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
            return toast.error(json.error || "Delete failed!");
        }

        toast.success("Group deleted successfully!");

        setQuery("");
        setGroup(null);
        setResults([]);
    };

    return (
        <section className="max-w-7xl mx-auto space-y-6 p-6">
            <PageHeader />
            <h1 className="text-2xl font-bold">Manage Group</h1>

            {/* Employee Filter */}
            <div className="flex gap-2">
                <select
                    className="border p-2 rounded-md"
                    value={selectedEmployee}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                >
                    <option value="">Filter by Employee</option>
                    {employees.map((e: Employee) => (
                        <option key={e._id} value={e._id}>
                            {e.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
                <Input
                    placeholder="Search Group ID or Name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button onClick={searchGroups} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </Button>
            </div>

            {/* Search Results List */}
            {results.length > 0 && !group && (
                <div className="overflow-x-auto border rounded-md mt-4">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="p-2">Group ID</th>
                                <th className="p-2">Group Name</th>
                                <th className="p-2">Members</th>
                                <th className="p-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((g: Group) => (
                                <tr key={g._id} className="border-t">
                                    <td className="p-2">{g.groupId}</td>
                                    <td className="p-2">{g.groupName}</td>
                                    <td className="p-2">{g.totalMembers}</td>
                                    <td className="p-2 text-right">
                                        <Button size="sm" onClick={() => loadGroup(g._id)}>
                                            Manage
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Group Form */}
            {group && (
                <div className="space-y-4 p-6 border rounded-md shadow-sm">
                    <h2 className="font-semibold text-lg">Edit Group</h2>

                    {/* Group ID */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Group ID</p>
                        <Input disabled value={group.groupId} className="bg-gray-100" />
                    </div>

                    {/* Group Name */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Group Name</p>
                        <Input
                            value={group.groupName ?? ""}
                            onChange={(e) =>
                                setGroup({ ...group, groupName: e.target.value })
                            }
                        />
                    </div>

                    {/* Total Members */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Total Members</p>
                        <Input
                            value={group.totalMembers ?? 0}
                            onChange={(e) =>
                                setGroup({ ...group, totalMembers: Number(e.target.value) })
                            }
                        />
                    </div>

                    {/* Employee */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Collection Employee</p>
                        <select
                            className="border p-2 w-full rounded-md"
                            value={
                                typeof group.employee === "object"
                                    ? (group.employee)?._id
                                    : (group.employee) || ""
                            }
                            onChange={(e) =>
                                setGroup({
                                    ...group,
                                    employee: e.target.value as unknown as Employee,
                                })
                            }
                        >
                            <option value="">Collection Employee</option>
                            {employees.map((e: Employee) => (
                                <option key={e._id} value={e._id}>
                                    {e.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due On */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Due Type</p>
                        <select
                            className="border p-2 w-full rounded-md"
                            value={group.dueOn || "MONTHLY"}
                            onChange={(e) =>
                                setGroup({
                                    ...group,
                                    dueOn: e.target.value as "MONTHLY" | "WEEKLY",
                                })
                            }
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="WEEKLY">Weekly</option>
                        </select>
                    </div>

                    {/* Collection Day */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Collection Day</p>
                        <select
                            className="border p-2 w-full rounded-md"
                            value={group.collectionDay || "Monday"}
                            onChange={(e) => {
                                const selectedDay = e.target.value as CollectionDay;

                                const nextDate = getNextCollectionDate(selectedDay);

                                setGroup({
                                    ...group,
                                    collectionDay: selectedDay,
                                    dueStarts: new Date(nextDate).toISOString(),
                                });
                            }}
                        >
                            {[
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                                "Sunday",
                            ].map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due Starts */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Due Starts</p>

                        <div className="flex gap-2">
                            <Input
                                type="date"
                                disabled
                                className="bg-gray-100"
                                value={
                                    group.dueStarts
                                        ? new Date(group.dueStarts).toISOString().slice(0, 10)
                                        : ""
                                }
                            />

                            <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={dueStartsLoading}
                                onClick={async () => {
                                    if (!group?._id) return;

                                    // auto calculate next dueStarts based on collectionDay
                                    const autoDate = getNextCollectionDate(group.collectionDay || "Monday");

                                    setDueStartsLoading(true);

                                    const res = await fetch(`/api/group/${group._id}/due-starts`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ dueStarts: autoDate }),
                                    });

                                    const data = await res.json();
                                    setDueStartsLoading(false);

                                    if (!res.ok)
                                        return toast.error(data?.error || "Failed to update dueStarts");

                                    toast.success("Due Starts updated successfully!");

                                    setGroup((prev) =>
                                        prev ? { ...prev, dueStarts: data.dueStarts } : prev
                                    );
                                }}
                            >
                                {dueStartsLoading ? "Updating..." : "Update"}
                            </Button>
                        </div>
                    </div>


                    {/* Collection Time */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Collection Time</p>
                        <Input
                            value={group.collectionTime ?? ""}
                            onChange={(e) =>
                                setGroup({ ...group, collectionTime: e.target.value })
                            }
                        />
                    </div>

                    {/* Created By */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Created By</p>
                        <select
                            className="border p-2 w-full rounded-md"
                            value={
                                typeof group.createdBy === "object"
                                    ? (group.createdBy)?._id
                                    : (group.createdBy) || ""
                            }
                            onChange={(e) =>
                                setGroup({
                                    ...group,
                                    createdBy: e.target.value as unknown as Employee,
                                })
                            }
                        >
                            <option value="">Created By</option>
                            {employees.map((e: Employee) => (
                                <option key={e._id} value={e._id}>
                                    {e.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Created At (Editable) */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Created Date</p>
                        <Input
                            type="date"
                            value={
                                group.createdAt
                                    ? new Date(group.createdAt).toISOString().slice(0, 10)
                                    : ""
                            }
                            onChange={(e) =>
                                setGroup({
                                    ...group,
                                    createdAt: new Date(e.target.value).toISOString(),
                                })
                            }
                        />
                    </div>

                    {/* Updated At (Readonly) */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Last Updated</p>
                        <Input
                            disabled
                            className="bg-gray-100"
                            value={
                                group.updatedAt
                                    ? new Date(group.updatedAt).toLocaleString()
                                    : "-"
                            }
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-4">
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={saveChanges}
                        >
                            Save Changes
                        </Button>

                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={deleteGroup}
                        >
                            Delete Group
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}

function getNextCollectionDate(day: string) {
    const daysMap: Record<string, number> = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
    };

    const today = new Date();
    const todayDay = today.getDay();
    const targetDay = daysMap[day];

    let diff = targetDay - todayDay;

    if (diff <= 0) diff += 7; // if today passed, go next week

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);

    return nextDate.toISOString().slice(0, 10);
}

