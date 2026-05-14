"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { Loan } from "@/types/fund";

export default function ClosedAccounts() {
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/report/closed-accounts");
            const data = await res.json();
            if (data.success) setLoans(data.loans);
        }
        load();
    }, []);

    return (
        <section className="max-w-6xl mx-auto space-y-6">
            <PageHeader />

            <h2 className="text-2xl font-bold text-gray-800">Closed Accounts</h2>

            <Card className="p-4 overflow-x-auto">
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Customer</th>
                            <th className="border p-2">Phone</th>
                            <th className="border p-2">Group</th>
                            <th className="border p-2">Closed On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map((l: Loan) => (
                            <tr key={l._id}>
                                <td className="border p-2">{l.customer?.name}</td>
                                <td className="border p-2">{l.customer?.phone}</td>
                                <td className="border p-2">{l.group?.groupName}</td>
                                <td className="border p-2">
                                    {new Date(l.updatedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loans.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                        No closed accounts found
                    </p>
                )}
            </Card>
        </section>
    );
}
