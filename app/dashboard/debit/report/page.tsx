"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageHeader from "@/components/PageHeader";
import { Debit } from "@/types/debit";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Summary {
    totalAmount: number;
    cashAmount: number;
    bankAmount: number;
    count: number;
}

export default function DebitReport() {
    const [records, setRecords] = useState<Debit[]>([]);
    const [summary, setSummary] = useState<Summary>({
        totalAmount: 0,
        cashAmount: 0,
        bankAmount: 0,
        count: 0,
    });

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [page, setPage] = useState(1);
    const limit = 10;

    /* ================= FILTERS ================= */
    const [filters, setFilters] = useState({
        start: "",
        end: "",
        title: "ALL", // TYPE
    });

    /* ================= FETCH ================= */
    const fetchDebits = async () => {
        try {
            setLoading(true);

            let url = `/api/debit?page=${page}&limit=${limit}`;
            if (filters.start) url += `&start=${filters.start}`;
            if (filters.end) url += `&end=${filters.end}`;
            if (filters.title !== "ALL") url += `&title=${filters.title}`;

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                toast.error("Failed to load debit report");
                return;
            }

            setRecords(data.debits || []);
            setSummary(data.summary || summary);
        } catch {
            toast.error("Failed to load debit report");
        } finally {
            setLoading(false);
        }
    };

    const [titles, setTitles] = useState<{ _id: string; title: string }[]>([]);

    useEffect(() => {
        fetchDebits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filters]);

    useEffect(() => {
        const fetchTitles = async () => {
            try {
                const res = await fetch("/api/debit/title");
                const data = await res.json();
                if (data.success) setTitles(data.titles);
            } catch (err) {
                console.error("Error fetching titles:", err);
            }
        };
        fetchTitles();
    }, []);

    const applyFilter = () => {
        setPage(1);
        fetchDebits();
    };

    /* ================= EXPORT EXCEL ================= */
    const exportExcel = () => {
        if (!records.length)
            return toast.warning("No data to export");

        const sheetData = records.map((r) => ({
            Date: new Date(r.date).toLocaleDateString(),
            Type: r.title,
            Amount: r.amount,
            Mode: r.mode,
            Employee: r.employee?.name || "N/A",
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Debit Report");
        XLSX.writeFile(wb, "Debit_Report.xlsx");
    };

    /* ================= EXPORT PDF ================= */
    const exportPDF = () => {
        if (!records.length)
            return toast.warning("No data to export");

        const doc = new jsPDF();
        autoTable(doc, {
            head: [["Date", "Type", "Amount", "Mode", "Entered By"]],
            body: records.map((r) => [
                new Date(r.date).toLocaleDateString(),
                r.title,
                `₹ ${r.amount.toLocaleString()}`,
                r.mode,
                r.employee?.name || "N/A",
            ]),
        });

        doc.save("Debit_Report.pdf");
    };

    /* ================= UI ================= */
    return (
        <section className="max-w-7xl mx-auto space-y-6 p-4">
            <PageHeader />

            <h1 className="text-3xl font-bold text-red-600">
                DEBIT REPORT
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
                        {titles.map((t) => (
                            <option key={t._id} value={t.title}>
                                {t.title}
                            </option>
                        ))}
                    </select>
                </div>

                <Button onClick={applyFilter} className="bg-red-600">
                    Apply Filter
                </Button>
            </Card>

            {/* ================= SUMMARY (ALL PAGES) ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <p>Total Entries</p>
                    <h2 className="text-xl font-bold">
                        {summary.count}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p>Total Amount</p>
                    <h2 className="text-2xl font-bold text-red-600">
                        ₹{summary.totalAmount.toLocaleString()}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p>Cash</p>
                    <h2 className="text-xl font-bold text-green-600">
                        ₹{summary.cashAmount.toLocaleString()}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p>Bank</p>
                    <h2 className="text-xl font-bold text-blue-600">
                        ₹{summary.bankAmount.toLocaleString()}
                    </h2>
                </Card>
            </div>

            {/* ================= TABLE ================= */}
            <Card className="p-4 overflow-x-auto">
                {loading ? (
                    <p className="text-center p-4">Loading...</p>
                ) : records.length ? (
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-2">Date</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Amount</th>
                                <th className="p-2">Mode</th>
                                <th className="p-2">Entered By</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.map((item) => (
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
                                                    `/dashboard/debit/${item._id}`
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
                    <p className="text-center text-gray-500 p-4">
                        No debit records found
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
                    disabled={records.length < limit}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </Button>
            </div>

            {/* ================= EXPORT ================= */}
            <div className="flex justify-center gap-4">
                <Button
                    className="bg-green-600 text-white"
                    disabled={!records.length}
                    onClick={exportExcel}
                >
                    Export Excel
                </Button>

                <Button
                    className="bg-blue-600 text-white"
                    disabled={!records.length}
                    onClick={exportPDF}
                >
                    Export PDF
                </Button>
            </div>
        </section>
    );
}
