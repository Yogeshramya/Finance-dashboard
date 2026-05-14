"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";

import { Bill } from "@/types/bill";
import { Group } from "@/types/group";
import { Printer } from "lucide-react";

export default function BillReportPage() {

    const router = useRouter();

    const [bills, setBills] = useState<Bill[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        from: "",
        to: "",
        group: "ALL",
        employee: "ALL",
    });

    /* QUICK DATE FILTER */

    const setQuickFilter = (type: "TODAY" | "WEEK" | "MONTH") => {

        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (type === "TODAY") {
            start = now;
            end = now;
        }

        if (type === "WEEK") {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);

            start = new Date(now.setDate(diff));
            end = new Date(start);
            end.setDate(start.getDate() + 6);
        }

        if (type === "MONTH") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        const format = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate()
            ).padStart(2, "0")}`;

        setFilters((prev) => ({
            ...prev,
            from: format(start),
            to: format(end),
        }));
    };

    /* LOAD GROUPS + EMPLOYEES */

    useEffect(() => {

        async function loadMeta() {

            try {

                const [g, e] = await Promise.all([
                    fetch("/api/group/list").then(r => r.json()),
                    fetch("/api/employees/list").then(r => r.json())
                ]);

                setGroups(g.groups || []);
                setEmployees(e.employees || []);

            } catch {

                toast.error("Failed to load filters");

            }

        }

        loadMeta();

    }, []);

    /* FETCH REPORT */

    async function fetchBills() {

        setLoading(true);

        try {

            let url = `/api/bill/report?`;

            if (filters.from) url += `from=${filters.from}&`;
            if (filters.to) url += `to=${filters.to}&`;
            if (filters.group !== "ALL") url += `group=${filters.group}&`;
            if (filters.employee !== "ALL") url += `employee=${filters.employee}&`;

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                toast.error("Failed to load report");
                return;
            }

            setBills(data.bills || []);

        } catch {

            toast.error("Error loading report");

        } finally {

            setLoading(false);

        }

    }

    /* SUMMARY TOTALS */

    const totals = useMemo(() => {
        return bills.reduce(
            (acc, bill) => {
                const breakup = getBillBreakup(bill);

                acc.principal += breakup.principal;
                acc.interest += breakup.interest;
                acc.savings += breakup.savings;
                acc.total += Number(bill.totalCollected || 0);

                return acc;
            },
            {
                principal: 0,
                interest: 0,
                savings: 0,
                total: 0,
            }
        );
    }, [bills]);

    /* PRINT */

    const handlePrint = () => {

        window.print();

    };

    return (

        <section className="w-full mx-auto space-y-6 p-4">

            <PageHeader />

            {/* HEADER */}

            <div className="flex justify-between items-center print:hidden">

                <h1 className="text-3xl font-bold text-blue-600">
                    BILL REPORT
                </h1>

                <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                </Button>

            </div>

            {/* PRINT HEADER */}

            <div className="hidden print:block text-center mb-4">

                <h2 className="text-xl font-bold">
                    Bill Collection Report
                </h2>

                <p>
                    {filters.from || "Start"} → {filters.to || "End"}
                </p>

                <p>
                    Generated on {new Date().toLocaleDateString()}
                </p>

            </div>

            {/* QUICK FILTER */}

            <div className="flex gap-2 print:hidden">

                <Button size="sm" variant="outline" onClick={() => setQuickFilter("TODAY")}>
                    Today
                </Button>

                <Button size="sm" variant="outline" onClick={() => setQuickFilter("WEEK")}>
                    This Week
                </Button>

                <Button size="sm" variant="outline" onClick={() => setQuickFilter("MONTH")}>
                    This Month
                </Button>

            </div>

            {/* FILTERS */}

            <Card className="p-3 grid grid-cols-1 md:grid-cols-5 gap-3 items-end print:hidden">

                <div>
                    <label className="text-sm font-semibold">From Date</label>

                    <Input
                        type="date"
                        value={filters.from}
                        onChange={(e) =>
                            setFilters({ ...filters, from: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold">To Date</label>

                    <Input
                        type="date"
                        value={filters.to}
                        onChange={(e) =>
                            setFilters({ ...filters, to: e.target.value })
                        }
                    />
                </div>

                <div>

                    <label className="text-sm font-semibold">Group</label>

                    <Select
                        value={filters.group}
                        onValueChange={(v) => setFilters({ ...filters, group: v })}
                    >

                        <SelectTrigger>
                            <SelectValue placeholder="All Groups" />
                        </SelectTrigger>

                        <SelectContent>

                            <SelectItem value="ALL">
                                All Groups
                            </SelectItem>

                            {groups.map((g) => (
                                <SelectItem key={g._id} value={g._id}>
                                    {g.groupName}
                                </SelectItem>
                            ))}

                        </SelectContent>

                    </Select>

                </div>

                <div>

                    <label className="text-sm font-semibold">
                        Employee
                    </label>

                    <Select
                        value={filters.employee}
                        onValueChange={(v) =>
                            setFilters({ ...filters, employee: v })
                        }
                    >

                        <SelectTrigger>
                            <SelectValue placeholder="All Employees" />
                        </SelectTrigger>

                        <SelectContent>

                            <SelectItem value="ALL">
                                All Employees
                            </SelectItem>

                            {employees.map((e) => (
                                <SelectItem key={e._id} value={e._id}>
                                    {e.name}
                                </SelectItem>
                            ))}

                        </SelectContent>

                    </Select>

                </div>

                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={fetchBills}
                >
                    Generate
                </Button>

            </Card>

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">

                <Card className="p-4">
                    <p className="text-sm text-gray-500">Total Principal</p>
                    <p className="text-xl font-bold text-green-700">
                        ₹{totals.principal.toLocaleString()}
                    </p>
                </Card>

                <Card className="p-4">
                    <p className="text-sm text-gray-500">Total Interest</p>
                    <p className="text-xl font-bold text-orange-600">
                        ₹{totals.interest.toLocaleString()}
                    </p>
                </Card>

                <Card className="p-4">
                    <p className="text-sm text-gray-500">Total Savings</p>
                    <p className="text-xl font-bold text-purple-700">
                        ₹{totals.savings.toLocaleString()}
                    </p>
                </Card>

                <Card className="p-4">
                    <p className="text-sm text-gray-500">Total Collection</p>
                    <p className="text-xl font-bold text-blue-700">
                        ₹{totals.total.toLocaleString()}
                    </p>
                </Card>

            </div>

            {/* TABLE */}

            {/* TABLE */}

            {loading ? (
                <p className="text-center py-6">Loading report...</p>
            ) : bills.length ? (

                <div className="w-full overflow-x-auto print:overflow-visible">

                    <table className="w-full text-[12px] border-collapse print:text-[10px]">

                        <thead className="bg-gray-100 print:bg-gray-200">

                            <tr>
                                <th className="border p-1">Group</th>
                                <th className="border p-1">Type</th>
                                <th className="border p-1">Week</th>
                                <th className="border p-1">Members</th>
                                <th className="border p-1">Principal</th>
                                <th className="border p-1">Interest</th>
                                <th className="border p-1">Savings</th>
                                <th className="border p-1">Bill</th>
                                <th className="border p-1">Collected</th>
                                <th className="border p-1">Date</th>
                                <th className="border p-1 print:hidden">Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {bills.map((bill) => {

                                const breakup = getBillBreakup(bill);

                                return (

                                    <tr
                                        key={bill._id}
                                        className="text-center break-inside-avoid"
                                    >

                                        <td className="border p-1">
                                            {bill.group && typeof bill.group === "object"
                                                ? bill.group.groupName
                                                : "-"}
                                        </td>

                                        <td className="border p-1">{bill.type}</td>

                                        <td className="border p-1">
                                            Week {bill.weekNo}
                                        </td>

                                        <td className="border p-1">
                                            {bill.totalMembers}
                                        </td>

                                        <td className="border p-1">₹{breakup.principal}</td>

                                        <td className="border p-1">₹{breakup.interest}</td>

                                        <td className="border p-1">₹{breakup.savings}</td>

                                        <td className="border p-1 font-semibold">
                                            ₹{bill.totalCollected}
                                        </td>

                                        <td className="border p-1">
                                            {bill.employee && typeof bill.employee === "object"
                                                ? bill.employee.name
                                                : "-"}
                                        </td>

                                        <td className="border p-1">
                                            {new Date(bill.collectedAt).toLocaleDateString()}
                                        </td>

                                        <td className="border p-1 print:hidden">

                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    router.push(`/dashboard/bill/${bill._id}`)
                                                }
                                            >
                                                View
                                            </Button>

                                        </td>

                                    </tr>

                                );

                            })}

                        </tbody>

                    </table>

                </div>

            ) : (

                <p className="text-center py-6">
                    No bills found
                </p>

            )}
        </section>

    );

}

function getBillBreakup(bill: Bill) {

    const loans = bill.loans || [];

    return loans.reduce(

        (acc, l) => {

            acc.principal += Number(l.principal || 0);
            acc.interest += Number(l.interest || 0);
            acc.savings += Number(l.savings || 0);

            return acc;

        },

        { principal: 0, interest: 0, savings: 0 }

    );

}