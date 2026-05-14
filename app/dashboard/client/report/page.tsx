"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Customer } from "@/types/customer";

export default function ClientReportPage() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [clients, setClients] = useState([]);

    const generateReport = async () => {
        if (!from || !to) return toast.warning("Select both dates");

        const res = await fetch(`/api/clients?from=${from}&to=${to}`);
        const data = await res.json();
        if (data.success) setClients(data.clients);
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <PageHeader />
            <h1 className="text-2xl font-bold">New Client Report</h1>

            <div className="flex gap-3">
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                <Button onClick={generateReport}>Generate</Button>
            </div>

            <Card className="p-4 space-y-4">
                {clients.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                        No clients found for selected dates
                    </p>
                )}

                {clients.map((client: Customer) => (
                    <div
                        key={client._id}
                        className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {/* Left Column */}
                        <div className="space-y-1">
                            <p className="text-lg font-semibold">{client.name}</p>

                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Customer Code:</span>{" "}
                                {client.customerCode || "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Center Name:</span>{" "}
                                {client.group?.groupName || "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Mobile:</span>{" "}
                                {client.phone || "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Joining Date:</span>{" "}
                                {client.createdAt
                                    ? new Date(client.createdAt).toLocaleDateString()
                                    : "-"}
                            </p>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Nominee Name:</span>{" "}
                                {client.nominee?.name || "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Nominee Mobile:</span>{" "}
                                {client.nominee?.phone || "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Relation:</span>{" "}
                                {client.nominee?.relation || "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Created Employee:</span>{" "}
                                {client.group?.createdBy?.name || "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Collection Employee:</span>{" "}
                                {client.group?.employee?.name || "-"}
                            </p>
                        </div>
                    </div>
                ))
                }
            </Card>
        </div>
    );
}
