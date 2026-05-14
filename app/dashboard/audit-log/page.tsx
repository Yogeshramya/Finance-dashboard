"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export interface Log {
    _id: string;
    timestamp: string; // or Date
    action: string;
    module: string;
    recordId: string;
    performedByName: string;
}
export default function AuditLog() {
    const [logs, setLogs] = useState<Log[]>([]);
    useEffect(() => {
        const fetchLogs = async () => {
            const res = await fetch("/api/audit");
            const data = await res.json();
            setLogs(data.logs);
        };
        fetchLogs();
    }, []);

    return (
        <section className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-purple-700 text-center">AUDIT LOG</h1>

            <Card className="p-4 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-2">Time</th>
                            <th className="p-2">Action</th>
                            <th className="p-2">Module</th>
                            <th className="p-2">Record ID</th>
                            <th className="p-2">Performed By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log._id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-2 font-semibold">{log.action}</td>
                                <td className="p-2">{log.module}</td>
                                <td className="p-2">{log.recordId}</td>
                                <td className="p-2">{log.performedByName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <p className="text-center text-gray-500 mt-4">No changes recorded</p>
                )}
            </Card>
        </section>
    );
}
