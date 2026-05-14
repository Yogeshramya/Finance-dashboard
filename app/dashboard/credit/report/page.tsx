"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageHeader from "@/components/PageHeader";
import { Credit } from "@/types/credit";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreditReport() {
    const [records, setRecords] = useState<Credit[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;
    const router = useRouter();

    const [summary, setSummary] = useState({
        totalAmount: 0,
        cashAmount: 0,
        bankAmount: 0,
        count: 0,
    });

    /* ================= FILTERS ================= */
    const [filters, setFilters] = useState({
        start: "",
        end: "",
        title: "ALL", // TITLE IS TYPE
    });

    /* ================= FETCH ================= */
    const fetchCredits = async () => {
        try {
            setLoading(true);

            let url = `/api/credit?page=${page}&limit=${limit}`;
            if (filters.start) url += `&start=${filters.start}`;
            if (filters.end) url += `&end=${filters.end}`;
            if (filters.title !== "ALL") url += `&title=${filters.title}`;

            const res = await fetch(url);
            const data = await res.json();

            setRecords(data.credits || []);

            if (data.summary) {
                setSummary({
                    totalAmount: data.summary.totalAmount || 0,
                    cashAmount: data.summary.cashAmount || 0,
                    bankAmount: data.summary.bankAmount || 0,
                    count: data.summary.count || 0,
                });
            }
        } catch {
            toast.error("Failed to load credit report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filters]);

    const filterApply = () => {
        setPage(1);
        fetchCredits();
    };

    /* ================= APPROVED ONLY ================= */
    const approvedRecords = useMemo(
        () => records.filter((r) => r.status === "APPROVED"),
        [records]
    );

    /* ================= EXPORT ================= */
    const exportExcel = () => {
        if (!approvedRecords.length) return toast.warning("No data to export");

        const sheetData = approvedRecords.map((r) => ({
            Date: new Date(r.date).toLocaleDateString(),
            Type: r.title, // TITLE USED
            Amount: r.amount,
            Mode: r.mode,
            Employee: r.employee?.name || "N/A",
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Approved Credits");
        XLSX.writeFile(wb, "Approved_Credit_Report.xlsx");
    };

    const exportPDF = () => {
        if (!approvedRecords.length) return toast.warning("No data to export");

        const doc = new jsPDF();
        autoTable(doc, {
            head: [["Date", "Type", "Amount", "Mode", "Entered By"]],
            body: approvedRecords.map((r) => [
                new Date(r.date).toLocaleDateString(),
                r.title,
                `₹ ${r.amount.toLocaleString()}`,
                r.mode,
                r.employee?.name || "N/A",
            ]),
        });
        doc.save("Approved_Credit_Report.pdf");
    };

    /* ================= UI ================= */
    return (
        <section className="max-w-7xl mx-auto space-y-6 p-4">
            <PageHeader />

            <h1 className="text-3xl font-bold text-green-600">
                CREDIT REPORT (APPROVED)
            </h1>

            {/* ================= FILTERS ================= */}
            <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-sm font-semibold">Start Date</label>
                    <Input
                        type="date"
                        value={filters.start}
                        onChange={(e) =>
                            setFilters({ ...filters, start: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold">End Date</label>
                    <Input
                        type="date"
                        value={filters.end}
                        onChange={(e) =>
                            setFilters({ ...filters, end: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label className="text-sm font-semibold">Type</label>
                    <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={filters.title}
                        onChange={(e) =>
                            setFilters({ ...filters, title: e.target.value })
                        }
                    >
                        <option value="ALL">All Types</option>
                        <option value="Admission Fee">Admission Fee</option>
                        <option value="Insurance Fee">Insurance Fee</option>
                        <option value="Application Fee">Application Fee</option>
                    </select>
                </div>

                <Button onClick={filterApply} className="bg-green-600">
                    Apply Filter
                </Button>
            </Card>

            {/* ================= STATS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <p>Total Entries</p>
                    <h2 className="text-xl font-bold">{summary.count}</h2>
                </Card>

                <Card className="p-4 text-center">
                    <p>Total Amount</p>
                    <h2 className="text-2xl font-bold text-green-600">
                        ₹{summary.totalAmount.toLocaleString()}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p>Cash</p>
                    <h2 className="text-xl font-bold text-blue-600">
                        ₹{summary.cashAmount.toLocaleString()}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p>Bank</p>
                    <h2 className="text-xl font-bold text-purple-600">
                        ₹{summary.bankAmount.toLocaleString()}
                    </h2>
                </Card>
            </div>

            {/* ================= TABLE ================= */}
            <Card className="p-4 overflow-x-auto">
                {loading ? (
                    <p className="text-center p-3">Loading...</p>
                ) : approvedRecords.length ? (
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-2">Date</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Amount</th>
                                <th className="p-2">Mode</th>
                                <th className="p-2">By</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {approvedRecords.map((item) => (
                                <tr
                                    key={item._id}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="p-2">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-2 font-medium">
                                        {item.title}
                                    </td>
                                    <td className="p-2 font-semibold">
                                        ₹ {item.amount.toLocaleString()}
                                    </td>
                                    <td className="p-2">{item.mode}</td>
                                    <td className="p-2">
                                        {item.employee?.name || "N/A"}
                                    </td>
                                    <td className="p-2 text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/credit/${item._id}`
                                                )
                                            }
                                        >
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-500">
                        No approved credits found
                    </p>
                )}
            </Card>

            {/* ================= PAGINATION ================= */}
            <div className="flex justify-between items-center">
                <Button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                >
                    Prev
                </Button>

                <span className="font-semibold">Page {page}</span>

                <Button
                    disabled={approvedRecords.length < limit}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </Button>
            </div>

            {/* ================= EXPORT ================= */}
            <div className="flex justify-center gap-4">
                <Button className="bg-green-600 text-white" onClick={exportExcel}>
                    Export Excel
                </Button>
                <Button className="bg-blue-600 text-white" onClick={exportPDF}>
                    Export PDF
                </Button>
            </div>
        </section>
    );
}
