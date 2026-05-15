"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
    Users, 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    Search, 
    UserCheck, 
    Building2,
    Wallet,
    Info,
    ArrowRight,
    Loader2
} from "lucide-react";
import { Group } from "@/types/group";
import { Loan, Dues } from "@/types/fund";
import { Badge } from "@/components/ui/badge";

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

interface Employee {
    _id: string;
    name: string;
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
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
        setLoading(true);

        try {
            const res = await fetch(
                `/api/group/search?query=${empId}&status=ACTIVE`
            );
            const data = await res.json();
            setGroups(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error("Failed to load groups");
        } finally {
            setLoading(false);
        }
    }

    /* ================= LOAD LOANS ================= */

    async function fetchLoans(groupId: string) {
        setSelectedGroupId(groupId);
        setLoans([]);
        setLoading(true);

        try {
            const groupRes = await fetch(`/api/group/${groupId}`);
            const group: Group = await groupRes.json();

            if (!group) {
                toast.error("Failed to load group metadata");
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
        } catch (e) {
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
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

    const payingCount = loans.filter(l => l.isPaying).length;

    /* ================= SUBMIT ================= */

    async function submit() {
        const selected = loans.filter((l) => l.isPaying);

        if (!selected.length)
            return toast.error("Select at least one member to collect payment");

        setSubmitting(true);
        try {
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
                toast.success("Bill collection submitted successfully!");
                router.push("/dashboard/bill");
            } else {
                toast.error("Failed to submit collection entry");
            }
        } catch (e) {
            toast.error("A network error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-10">
            <PageHeader />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Wallet className="w-10 h-10 text-blue-600" />
                        Bill Collection
                    </h1>
                    <p className="text-gray-500 text-lg">Record daily or weekly collections from centers and members.</p>
                </div>
                
                {selectedGroupId && (
                    <div className="bg-blue-600 text-white px-6 py-4 rounded-3xl shadow-xl shadow-blue-200 flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black opacity-70 tracking-widest">Active Week</span>
                            <span className="text-2xl font-bold">{groupWeekNo}</span>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black opacity-70 tracking-widest">Total Collection</span>
                            <span className="text-2xl font-bold">₹{totalCollected.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Selectors Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-md rounded-[2rem] bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b p-6">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-500 uppercase tracking-widest">
                            <UserCheck className="w-4 h-4" />
                            Collection Employee
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Select onValueChange={fetchGroups}>
                            <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/30">
                                <SelectValue placeholder="Select Staff Member" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((e) => (
                                    <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card className={`border-none shadow-md rounded-[2rem] bg-white overflow-hidden transition-all ${!employeeId ? 'opacity-50 pointer-events-none' : ''}`}>
                    <CardHeader className="bg-gray-50/50 border-b p-6">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-500 uppercase tracking-widest">
                            <Building2 className="w-4 h-4" />
                            Target Center / Group
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Select onValueChange={fetchLoans} disabled={loading}>
                            <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/30">
                                <SelectValue placeholder={loading ? "Loading groups..." : "Select Center"} />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((g) => (
                                    <SelectItem key={g._id} value={g._id}>
                                        {g.groupName} ({g.groupId})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>

            {/* Members Table Section */}
            {loans.length > 0 && (
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-8 border-b bg-white flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Member List</h2>
                            <p className="text-gray-400 text-sm mt-1">Select members who have made payments today.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">{loans.length} Total Members</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/80 sticky top-0 z-10">
                                <tr className="text-gray-400">
                                    <th className="p-4 text-left font-bold uppercase tracking-tighter text-[10px]">Status</th>
                                    <th className="p-4 text-center font-bold uppercase tracking-tighter text-[10px]">Collect</th>
                                    <th className="p-4 text-left font-bold uppercase tracking-tighter text-[10px]">Member Details</th>
                                    <th className="p-4 text-center font-bold uppercase tracking-tighter text-[10px]">Due No</th>
                                    <th className="p-4 text-right font-bold uppercase tracking-tighter text-[10px]">Principal</th>
                                    <th className="p-4 text-right font-bold uppercase tracking-tighter text-[10px]">Interest</th>
                                    <th className="p-4 text-right font-bold uppercase tracking-tighter text-[10px]">Savings</th>
                                    <th className="p-4 text-right font-bold uppercase tracking-tighter text-[10px]">Payable</th>
                                    <th className="p-4 text-center font-bold uppercase tracking-tighter text-[10px]">Present</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {loans.map((l, i) => (
                                    <tr key={l._id} className={`group hover:bg-blue-50/30 transition-colors ${l.isPaying ? 'bg-blue-50/20' : ''}`}>
                                        <td className="p-4">
                                            <Badge variant="outline" className={`
                                                uppercase text-[9px] font-black tracking-widest h-6
                                                ${l.status === "UNPAID" ? "border-amber-200 text-amber-700 bg-amber-50" : 
                                                  l.status === "ARREAR" ? "border-red-200 text-red-700 bg-red-50" : 
                                                  l.status === "COMPLETED" ? "border-green-200 text-green-700 bg-green-50" : 
                                                  "border-gray-200 text-gray-400 bg-gray-50"}
                                            `}>
                                                {l.status}
                                            </Badge>
                                        </td>

                                        <td className="p-4 text-center">
                                            {l.status === "UNPAID" || l.status === "PARTIAL" || l.status === "ARREAR" ? (
                                                <div 
                                                    className={`
                                                        w-6 h-6 mx-auto rounded-md border-2 cursor-pointer flex items-center justify-center transition-all
                                                        ${l.isPaying ? 'bg-blue-600 border-blue-600' : 'border-gray-200 hover:border-blue-400'}
                                                    `}
                                                    onClick={() => togglePay(i)}
                                                >
                                                    {l.isPaying && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{l.customer?.name}</span>
                                                <span className="text-[10px] font-mono text-gray-400">{l.mfLoanId}</span>
                                            </div>
                                        </td>

                                        <td className="p-4 text-center font-bold text-gray-500">
                                            {l.nextDueNo || "-"}
                                        </td>

                                        <td className="p-4 text-right text-gray-500">
                                            ₹{l.principal.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right text-gray-500">
                                            ₹{l.interest.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right text-gray-500">
                                            ₹{l.savings.toLocaleString()}
                                        </td>

                                        <td className="p-4 text-right">
                                            <span className={`font-black ${l.isPaying ? 'text-blue-700' : 'text-gray-400'}`}>
                                                ₹{l.dueAmount.toLocaleString()}
                                            </span>
                                        </td>

                                        <td className="p-4 text-center">
                                            {l.status !== "COMPLETED" ? (
                                                <button 
                                                    onClick={() => togglePresence(i)}
                                                    className={`p-1.5 rounded-lg transition-colors ${l.isPresent ? 'text-green-600 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}
                                                >
                                                    {l.isPresent ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                </button>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Submit Section */}
                    <div className="p-8 bg-gray-50 border-t flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                                <Info className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Summary for Submission</p>
                                <p className="text-xs text-gray-400">Collecting for {payingCount} members out of {loans.length}.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total to Collect</p>
                                <p className="text-2xl font-black text-blue-700">₹{totalCollected.toLocaleString()}</p>
                            </div>
                            <Button 
                                onClick={submit}
                                disabled={totalCollected === 0 || submitting}
                                className="h-14 px-10 rounded-[1.25rem] bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 text-lg font-bold group"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Submit Collection
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {!selectedGroupId && !loading && (
                <div className="py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Ready to collect?</h3>
                    <p className="text-gray-400 mt-2 text-center max-w-xs">
                        Select a staff member and center above to start recording collections.
                    </p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="py-40 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-400 mt-4 font-medium">Fetching member records...</p>
                </div>
            )}
        </section>
    );
}