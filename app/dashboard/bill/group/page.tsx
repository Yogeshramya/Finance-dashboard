"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Bill } from "@/types/bill";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [filterType, setFilterType] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const itemsPerPage = 10;

    useEffect(() => {
        async function loadBills() {
            try {
                const res = await fetch("/api/bill", { cache: "no-store" });
                const data = await res.json();

                if (!data.success) {
                    toast.error("Failed to load bills");
                    return;
                }

                setBills(data.bills || []);
            } catch (err) {
                console.error(err);
                toast.error("Error loading bills");
            }
            setLoading(false);
        }
        loadBills();
    }, []);

    const filteredBills = bills.filter((bill) => {
        if (filterType === "ALL") return true;
        if (filterType === "Normal") return !bill.type || bill.type === "Normal";
        return bill.type === filterType;
    });

    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <p className="text-center mt-6">Loading bills...</p>;

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <PageHeader />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Bills Collection List</h1>
                <Select value={filterType} onValueChange={(val) => {
                    setFilterType(val);
                    setCurrentPage(1);
                }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="PreBill">Pre-Bill</SelectItem>
                        <SelectItem value="PreClose">Pre-Close</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {!bills?.length && (
                <p className="text-gray-500 text-center text-lg py-10">
                    No bills found
                </p>
            )}

            {filteredBills.length > 0 ? (
                <div className="overflow-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border">Group</th>
                                <th className="p-3 border">Type</th>
                                <th className="p-3 border">Week</th>
                                <th className="p-3 border">Members</th>
                                <th className="p-3 border">Collected</th>
                                <th className="p-3 border">Employee</th>
                                <th className="p-3 border">Date</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedBills.map((bill) => (
                                <tr key={bill._id} className="text-center">
                                    <td className="border p-2">
                                        {typeof bill.group === "object" && bill.group !== null
                                            ? bill.group?.groupName
                                            : "-"}
                                    </td>
                                    <td className="border p-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${bill.type === 'PreBill' ? 'bg-purple-100 text-purple-700' :
                                            bill.type === 'PreClose' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {bill.type || "Normal"}
                                        </span>
                                    </td>
                                    <td className="border p-2">
                                        Week {bill.weekNo}
                                    </td>
                                    <td className="border p-2">
                                        {bill.totalMembers}
                                    </td>
                                    <td className="border p-2 font-bold text-blue-700">
                                        ₹{bill.totalCollected?.toLocaleString()}
                                    </td>
                                    <td className="border p-2">
                                        {typeof bill.employee === "object" && bill.employee !== null
                                            ? bill.employee.name
                                            : "-"}
                                    </td>
                                    <td className="border p-2">
                                        {new Date(bill.collectedAt).toLocaleDateString()}
                                    </td>
                                    <td className="border p-2">
                                        <Button
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/bill/${bill._id}`)}
                                        >
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                bills.length > 0 && (
                    <p className="text-center py-10 text-gray-500">No bills match the filter.</p>
                )
            )}

            {/* Pagination Controls */}
            {filteredBills.length > itemsPerPage && (
                <div className="flex justify-end items-center gap-4 mt-4">
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </main>
    );
}
