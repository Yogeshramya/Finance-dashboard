"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import {
    GroupCreatePayload,
    DueOn,
    CollectionDay
} from "@/types/group";

export default function AddGroup() {
    const router = useRouter();
    const { data: session } = useSession();

    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<{
        groupId: string;
        groupName: string;
        totalMembers: string;
        dueOn: DueOn | "";
        collectionDay: CollectionDay | "";
        collectionTime: string;
        employee: string;
        createdBy: string;
    }>({
        groupId: "",
        groupName: "",
        totalMembers: "",
        dueOn: "",
        collectionDay: "",
        collectionTime: "",
        employee: "",
        createdBy: "",
    });

    const [employees, setEmployees] = useState<Employee[]>([]);

    // Fetch employees
    useEffect(() => {
        fetch("/api/employees/list")
            .then((res) => res.json())
            .then((data) => setEmployees(data.employees || []));
    }, []);

    async function handleSave() {
        if (!session) {
            toast.error("You are not logged in!");
            return;
        }

        if (!form.groupId || !form.groupName || !form.employee) {
            toast.warning("Please fill all required fields!");
            return;
        }

        setSaving(true);

        const payload: GroupCreatePayload = {
            groupId: form.groupId,
            groupName: form.groupName,
            totalMembers: Number(form.totalMembers || 0),
            dueOn: form.dueOn as DueOn,
            collectionDay: form.collectionDay as CollectionDay,
            collectionTime: form.collectionTime,
            employee: form.employee,
            createdBy: form.createdBy,
            status: "ACTIVE",
        };

        const res = await fetch("/api/group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setSaving(false);

        if (res.ok) {
            toast.success("Group created successfully!");
            router.push("/dashboard/group");
        } else {
            toast.error("Failed to create group");
        }
    }

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-6">
            <PageHeader />
            <h1 className="text-3xl font-bold">Add Group</h1>

            <Card>
                <CardContent className="p-6 space-y-6">

                    {/* Group ID */}
                    <div>
                        <label className="text-sm font-semibold">Group ID *</label>
                        <Input
                            value={form.groupId}
                            onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                        />
                    </div>

                    {/* Group Name */}
                    <div>
                        <label className="text-sm font-semibold">Group Name *</label>
                        <Input
                            value={form.groupName}
                            onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                        />
                    </div>

                    {/* Total Members */}
                    <div>
                        <label className="text-sm font-semibold">Total Members</label>
                        <Input
                            value={form.totalMembers}
                            onChange={(e) => setForm({ ...form, totalMembers: e.target.value })}
                        />
                    </div>

                    {/* Due On */}
                    <div>
                        <label className="text-sm font-semibold">Due On *</label>
                        <Select
                            onValueChange={(v) =>
                                setForm({ ...form, dueOn: v as DueOn })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Due Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Collection Day */}
                    <div>
                        <label className="text-sm font-semibold">Collection Day *</label>
                        <Select
                            onValueChange={(v) =>
                                setForm({ ...form, collectionDay: v as CollectionDay })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Day" />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday",
                                    "Sunday"
                                ].map((day) => (
                                    <SelectItem key={day} value={day}>
                                        {day}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Created By */}
                    <div>
                        <label className="text-sm font-semibold">Created By *</label>

                        <Select
                            value={form.createdBy}
                            onValueChange={(v) =>
                                setForm({ ...form, createdBy: v })
                            }
                        >
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
                    </div>

                    {/* Collection Time */}
                    <div>
                        <label className="text-sm font-semibold">Collection Time *</label>

                        <div className="flex gap-3">

                            {/* Time Box */}
                            <Input
                                type="text"
                                placeholder="08:30"
                                className="w-32"
                                value={form.collectionTime.split(" ")[0] || ""}
                                onChange={(e) => {
                                    const time = e.target.value;
                                    const suffix = form.collectionTime.split(" ")[1] || "AM";
                                    setForm({ ...form, collectionTime: `${time} ${suffix}` });
                                }}
                            />

                            {/* AM / PM Dropdown */}
                            <Select
                                onValueChange={(v) => {
                                    const time = form.collectionTime.split(" ")[0] || "";
                                    setForm({ ...form, collectionTime: `${time} ${v}` });
                                }}
                            >
                                <SelectTrigger className="w-24">
                                    <SelectValue placeholder="AM/PM" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                    </div>

                    {/* Employee */}
                    <div>
                        <label className="text-sm font-semibold">Collection Employee *</label>
                        <Select
                            onValueChange={(v) =>
                                setForm({ ...form, employee: v })
                            }
                        >
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
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            disabled={saving}
                            onClick={handleSave}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => router.push("/dashboard/group")}
                        >
                            Cancel
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </section>
    );
}
