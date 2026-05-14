"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { Customer } from "@/types/customer";

export default function DaySheetPage() {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/clients?today=true");
            const data = await res.json();
            if (data.success) setClients(data.clients);
        }
        load();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <PageHeader />
            <h1 className="text-2xl font-bold">Today&apos;s New Clients</h1>

            <Card className="p-4 space-y-3">
                {clients.length > 0 ? (
                    clients.map((client: Customer) => (
                        <div key={client._id} className="border p-3 rounded-md">
                            <p className="font-semibold">{client.name}</p>
                            <p className="text-gray-500 text-sm">{client.customerCode}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 py-6">
                        No customers added today.
                    </p>
                )}
            </Card>
        </div>
    );
}
