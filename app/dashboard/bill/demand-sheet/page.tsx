"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Group } from "@/types/group";

/* ================= TYPES ================= */

interface Employee {
    _id: string;
    name: string;
}

export default function DemandSheetPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeId, setEmployeeId] = useState("");

    const [groups, setGroups] = useState<Group[]>([]);
    const [groupId, setGroupId] = useState("");

    const [manualDate, setManualDate] = useState("");

    /* ================= LOAD EMPLOYEES ================= */

    useEffect(() => {
        fetch("/api/employees/list")
            .then((r) => r.json())
            .then((d) => setEmployees(d.employees || []));
    }, []);

    /* ================= LOAD GROUPS ================= */

    async function loadGroups(empId: string) {
        setEmployeeId(empId);
        setGroupId("");

        const res = await fetch(`/api/group/search?query=${empId}&status=ACTIVE`);
        const data = await res.json();

        setGroups(Array.isArray(data) ? data : []);
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">

            {/* ================= HEADER ================= */}

            <PageHeader />

            <h1 className="text-3xl font-bold text-orange-600">
                Demand Sheet
            </h1>

            {/* ================= EMPLOYEE ================= */}

            <Card className="p-4 space-y-2">
                <p className="font-semibold">Employee</p>

                <Select onValueChange={loadGroups}>
                    <SelectTrigger className="max-w-sm">
                        <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>

                    <SelectContent>
                        {employees.map((e) => (
                            <SelectItem key={e._id} value={e._id}>
                                {e.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Card>

            {/* ================= GROUP ================= */}

            {employeeId && (
                <Card className="p-4 space-y-2">
                    <p className="font-semibold">Group</p>

                    <Select onValueChange={(val) => setGroupId(val)}>
                        <SelectTrigger className="max-w-sm">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>

                        <SelectContent>
                            {groups.map((g) => (
                                <SelectItem key={g._id} value={g._id}>
                                    {g.groupName} ({g.groupId})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Card>
            )}

            {/* ================= DATE + FETCH ================= */}

            {groupId && (
                <Card className="p-4 space-y-3">

                    <p className="font-semibold">Sheet Options</p>

                    <div className="flex items-center gap-3">

                        <input
                            type="date"
                            value={manualDate}
                            onChange={(e) => setManualDate(e.target.value)}
                            className="border rounded px-3 py-2"
                        />

                        <button
                            onClick={() => {
                                if (!groupId) return;

                                window.open(
                                    `/demand-sheet/print?groupId=${groupId}&employee=${employeeId}&date=${manualDate}`,
                                    "_blank"
                                );
                            }}
                            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Open Demand Sheet
                        </button>

                    </div>

                </Card>
            )}
        </div>
    );
}