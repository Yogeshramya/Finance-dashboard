"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DisposalClient {
    _id: string;
    name: string;
    customerCode: string;
    group?: {
        groupName: string;
    };
    scheme?: {
        schemeName: string;
    };
    collectionEmployee?: {
        name: string;
    };
    createdEmployee?: {
        name: string;
    };
    createdAt: string;
}

export default function DisposalReportPage() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<DisposalClient[]>([]);

    async function fetchReport() {
        if (!from || !to) {
            toast.error("Select both From and To dates");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `/api/report/disposal?from=${from}&to=${to}`
            );
            const data = await res.json();

            if (data.success) {
                setClients(data.clients);
            } else {
                toast.error(data.error || "Failed to load report");
            }
        } catch (err) {
            toast.error("Something went wrong");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader />
            <h1 className="text-2xl font-bold">Disposal Report</h1>

            {/* Filters */}
            <Card className="p-4 flex flex-wrap gap-4 items-start">
                <div>
                    <label className="text-sm font-medium">From</label>
                    <Input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">To</label>
                    <Input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>

                <Button onClick={fetchReport} disabled={loading}>
                    {loading ? "Loading..." : "Generate"}
                </Button>
            </Card>

            {/* Report Table */}
            <Card className="p-4 overflow-auto">
                {clients.length > 0 ? (
                    <table className="w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">#</th>
                                <th className="border p-2">Client Name</th>
                                <th className="border p-2">Customer Code</th>
                                <th className="border p-2">Group</th>
                                <th className="border p-2">Scheme</th>
                                <th className="border p-2">Collection Emp</th>
                                <th className="border p-2">Created By</th>
                                <th className="border p-2">Created Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((c, i) => (
                                <tr key={c._id} className="text-center">
                                    <td className="border p-2">{i + 1}</td>
                                    <td className="border p-2">{c.name}</td>
                                    <td className="border p-2">{c.customerCode}</td>
                                    <td className="border p-2">
                                        {c.group?.groupName || "-"}
                                    </td>
                                    <td className="border p-2">
                                        {c.scheme?.schemeName || "-"}
                                    </td>
                                    <td className="border p-2">
                                        {c.collectionEmployee?.name || "-"}
                                    </td>
                                    <td className="border p-2">
                                        {c.createdEmployee?.name || "-"}
                                    </td>
                                    <td className="border p-2">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-400 py-6">
                        No records found
                    </p>
                )}
            </Card>
        </div>
    );
}
