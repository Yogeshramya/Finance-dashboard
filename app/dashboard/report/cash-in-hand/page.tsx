"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export interface CashInHandReport {
    date: string;             // e.g. "2025-12-14"
    openingBalance: number;
    loanCollected: number;
    creditTotal: number;
    debitTotal: number;
    cashInHand: number;
}

export default function CashInHandPage() {
    const [data, setData] = useState<CashInHandReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadReport() {
            const res = await fetch("/api/report/cash-in-hand");
            const json = await res.json();
            if (json.success) setData(json.data);
            setLoading(false);
        }
        loadReport();
        const interval = setInterval(loadReport, 20000); // auto refresh every 20s
        return () => clearInterval(interval);
    }, []);

    const format = (v: number) => `₹${Number(v || 0).toLocaleString()}`;

    if (loading || !data) return <p className="text-center mt-10">Loading...</p>;

    return (
        <section className="max-w-4xl mx-auto space-y-6">
            <PageHeader />
            <h1 className="text-2xl font-bold text-gray-700 text-center">
                Cash In Hand — {data.date}
            </h1>

            <Card className="border-2 border-blue-600 shadow-lg">
                <CardContent className="p-6 space-y-3 text-center">
                    <p className="text-lg font-semibold text-gray-600">
                        Opening Balance: {format(data.openingBalance)}
                    </p>
                    <p className="text-lg font-semibold text-green-700">
                        + Loan Collection: {format(data.loanCollected)}
                    </p>
                    <p className="text-lg font-semibold text-green-700">
                        + Credits: {format(data.creditTotal)}
                    </p>
                    <p className="text-lg font-semibold text-red-700">
                        - Debits: {format(data.debitTotal)}
                    </p>

                    <div className="h-px bg-gray-400 my-3" />

                    <p className="text-2xl font-bold text-blue-700">
                        Cash In Hand: {format(data.cashInHand)}
                    </p>

                    <p className="text-xs text-gray-400">
                        Auto-updates every 20 seconds
                    </p>
                </CardContent>
            </Card>
        </section>
    );
}
