"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Group } from "@/types/group";
import { Loan, Dues } from "@/types/fund";

/* ================= TYPES ================= */

interface LoanRow extends Loan {
    nextDueNo: number;
    dueAmount: number;
    principal: number;
    interest: number;
    savings: number;
    isPaying: boolean;
    isFullyPaid: boolean;
    isPresent: boolean;
    status:
    | "UNPAID"
    | "PAID"
    | "ARREAR"
    | "NOT_DUE"
    | "COMPLETED"
    | "PARTIAL";
}

/* ================= HELPERS ================= */

function getNextDueInfo(dues: Dues[]) {
    const paidCount = dues.filter((d) => d.paid).length;
    const nextDue = dues[paidCount];
    if (!nextDue) return { dueNo: null, due: null };
    return { dueNo: paidCount + 1, due: nextDue };
}

function calculateGroupWeek(group: Group) {
    if (!group?.dueStarts) return null;

    const start = new Date(group.dueStarts);
    const now = new Date();

    start.setUTCHours(0, 0, 0, 0);
    now.setUTCHours(0, 0, 0, 0);

    if (group.dueOn === "MONTHLY") {
        let months =
            (now.getFullYear() - start.getFullYear()) * 12 +
            (now.getMonth() - start.getMonth());

        if (now.getDate() < start.getDate()) {
            months -= 1;
        }

        return months + 1;
    }

    const diffDays = Math.floor(
        (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const weekNo = Math.floor(diffDays / 7) + 1;
    return weekNo < 1 ? 1 : weekNo;
}

/* ================= PAGE ================= */

export default function BillCollectionPage() {
    const router = useRouter();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeId, setEmployeeId] = useState("");

    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [groupWeekNo, setGroupWeekNo] = useState<number | null>(null);

    const [loans, setLoans] = useState<LoanRow[]>([]);

    /* ================= LOAD EMPLOYEES ================= */

    useEffect(() => {
        fetch("/api/employees/list")
            .then((r) => r.json())
            .then((d) => setEmployees(d.employees || []));
    }, []);

    /* ================= LOAD GROUPS ================= */

    async function fetchGroups(empId: string) {
        setEmployeeId(empId);
        setGroups([]);
        setLoans([]);
        setSelectedGroupId("");
        setGroupWeekNo(null);

        const res = await fetch(
            `/api/group/search?query=${empId}&status=ACTIVE`
        );
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : []);
    }

    /* ================= LOAD LOANS ================= */

    async function fetchLoans(groupId: string) {
        setSelectedGroupId(groupId);
        setLoans([]);

        const groupRes = await fetch(`/api/group/${groupId}`);
        const group: Group = await groupRes.json();

        if (!group) {
            toast.error("Failed to load group");
            return;
        }

        const currentWeek = calculateGroupWeek(group);
        setGroupWeekNo(currentWeek);

        const res = await fetch(
            `/api/fund/by-group?groupId=${groupId}`
        );
        const data = await res.json();
        const loanList: Loan[] = data.loans || [];

        if (!loanList.length) {
            toast.warning("No customers in this group");
            return;
        }

        const mapped: LoanRow[] = loanList.map((l) => {
            const { dueNo, due } = getNextDueInfo(l.dues);

            let status: LoanRow["status"];

            if (!due) {
                status = "COMPLETED";
            } else if (due.isPartial) {
                status = "PARTIAL";
            } else if (dueNo! < currentWeek!) {
                status = "ARREAR";
            } else if (dueNo === currentWeek) {
                status = "UNPAID";
            } else {
                status = "NOT_DUE";
            }

            return {
                ...l,
                nextDueNo: dueNo || 0,
                dueAmount: Number(due?.total || 0),
                principal: Number(due?.principal || 0),
                interest: Number(due?.interest || 0),
                savings: Number(due?.savings || 0),
                isPaying: false,
                isFullyPaid: status === "COMPLETED",
                isPresent: true,
                status,
            };
        });

        setLoans(mapped);
    }

    /* ================= TOGGLES ================= */

    function togglePresence(index: number) {
        const updated = [...loans];
        updated[index].isPresent = !updated[index].isPresent;

        if (!updated[index].isPresent) {
            updated[index].isPaying = false;
        }

        setLoans(updated);
    }

    function togglePay(index: number) {
        const updated = [...loans];
        updated[index].isPaying = !updated[index].isPaying;
        setLoans(updated);
    }

    /* ================= TOTAL ================= */

    const totalCollected = loans.reduce(
        (sum, l) => sum + (l.isPaying ? l.dueAmount : 0),
        0
    );

    /* ================= SUBMIT ================= */

    async function submit() {
        const selected = loans.filter((l) => l.isPaying);

        if (!selected.length)
            return toast.error("Select at least one member");

        const payload = selected.map((l) => ({
            loanId: l.mfLoanId,
            customerName: l.customer?.name || "",
            weekNo: l.nextDueNo,
            paidAmount: l.dueAmount,
            principal: l.principal,
            interest: l.interest,
            savings: l.savings,
            present: l.isPresent,
        }));

        const res = await fetch("/api/bill/collect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                employeeId,
                groupId: selectedGroupId,
                weekNo: groupWeekNo,
                loans: payload,
                totalCollected,
            }),
        });

        if (res.ok) {
            toast.success("Bill submitted successfully");
            router.push("/dashboard/bill");
        } else {
            toast.error("Failed to submit bill");
        }
    }

    /* ================= UI ================= */

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <PageHeader />
            <h1 className="text-3xl font-bold text-orange-600">
                Bill Collection
            </h1>

            {/* Employee */}
            <Card className="p-6">
                <Select onValueChange={fetchGroups}>
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

            {/* Group */}
            {employeeId && (
                <Card className="p-6">
                    <Select onValueChange={fetchLoans}>
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

            {/* Members Table */}
            {loans.length > 0 && (
                <Card className="p-6 space-y-4">
                    <div className="flex justify-between bg-gray-100 p-3 rounded">
                        <span className="font-semibold">
                            Group Week No:
                            <span className="ml-2 text-blue-700">
                                {groupWeekNo}
                            </span>
                        </span>
                    </div>

                    <div className="overflow-auto border rounded">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="p-2 border">STATUS</th>
                                    <th className="p-2 border">PAY</th>
                                    <th className="p-2 border">NAME</th>
                                    <th className="p-2 border">DUE NO</th>
                                    <th className="p-2 border">PRINCIPAL</th>
                                    <th className="p-2 border">INTEREST</th>
                                    <th className="p-2 border">SAVINGS</th>
                                    <th className="p-2 border">AMOUNT</th>
                                    <th className="p-2 border">PRESENT</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loans.map((l, i) => (
                                    <tr key={l._id} className="text-center">
                                        <td className="border p-2">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-bold
                          ${l.status === "UNPAID"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : l.status === "PARTIAL"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : l.status === "ARREAR"
                                                                ? "bg-red-100 text-red-700"
                                                                : l.status === "COMPLETED"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {l.status}
                                            </span>
                                        </td>

                                        <td className="border p-2">
                                            {l.status === "UNPAID" ||
                                                l.status === "PARTIAL" ? (
                                                <input
                                                    type="checkbox"
                                                    checked={l.isPaying}
                                                    onChange={() => togglePay(i)}
                                                />
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td className="border p-2">
                                            {l.customer?.name}
                                        </td>
                                        <td className="border p-2">
                                            {l.nextDueNo || "-"}
                                        </td>
                                        <td className="border p-2">
                                            {l.principal}
                                        </td>
                                        <td className="border p-2">
                                            {l.interest}
                                        </td>
                                        <td className="border p-2">
                                            {l.savings}
                                        </td>
                                        <td className="border p-2 font-bold text-blue-700">
                                            ₹{l.isPaying ? l.dueAmount : 0}
                                        </td>
                                        <td className="border p-2">
                                            {l.status === "UNPAID" ||
                                                l.status === "PARTIAL" ? (
                                                <input
                                                    type="checkbox"
                                                    checked={l.isPresent}
                                                    onChange={() =>
                                                        togglePresence(i)
                                                    }
                                                />
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Summary */}
            {loans.length > 0 && (
                <Card className="p-6 max-w-sm">
                    <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-bold text-blue-700">
                            ₹{totalCollected}
                        </span>
                    </div>

                    <Button
                        className="w-full mt-3"
                        disabled={totalCollected === 0}
                        onClick={submit}
                    >
                        Submit Collection
                    </Button>
                </Card>
            )}
        </div>
    );
}