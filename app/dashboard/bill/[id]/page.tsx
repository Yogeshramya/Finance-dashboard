"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { Bill } from "@/types/bill";

export default function BillDetailsPage() {
    const { id } = useParams();
    const [bill, setBill] = useState<Bill | null>(null);

    useEffect(() => {
        const loadBill = async () => {
            const res = await fetch(`/api/bill/${id}`);
            const data = await res.json();
            setBill(data.bill);
        };

        loadBill();
    }, [id]);

    if (!bill) return <p className="p-6 text-gray-500">Loading...</p>;

    return (
        <main className="p-6 space-y-6">
            <PageHeader />

            <h1 className="text-2xl font-bold">Bill Details</h1>

            <Card>
                <CardContent className="space-y-2 p-4">
                    {/*<p><b>Bill ID:</b> {bill._id}</p>*/}
                    <p><b>Group:</b> {typeof bill.group === "object" && bill.group !== null
                        ? `${bill.group.groupName} (${bill.group._id})`
                        : "-"}</p>
                    <p><b>Week:</b> {bill.weekNo}</p>
                    <p><b>Total Members:</b> {bill.totalMembers}</p>
                    <p><b>Total Collected:</b> ₹{bill.totalCollected}</p>
                    <p><b>Collected At:</b> {new Date(bill.collectedAt).toLocaleString()}</p>
                </CardContent>
            </Card>

            <h2 className="font-semibold text-xl">Member Payments</h2>

            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Loan ID</th>
                        <th className="p-2 border">Customer</th>
                        <th className="p-2 border">Paid</th>
                        <th className="p-2 border">Principal</th>
                        <th className="p-2 border">Interest</th>
                        <th className="p-2 border">Savings</th>
                    </tr>
                </thead>
                <tbody>
                    {bill?.loans?.map((l, i) => {
                        return (
                            <tr key={i} className="text-center">
                                <td className="border p-2">{l.loanId}</td>
                                <td className="border p-2">{l.customerName}</td>
                                <td className="border p-2 font-bold">
                                    ₹{l.paidAmount}
                                </td>
                                <td className="border p-2">
                                    ₹{l?.principal ?? 0}
                                </td>
                                <td className="border p-2">
                                    ₹{l?.interest ?? 0}
                                </td>
                                <td className="border p-2">
                                    ₹{l?.savings ?? 0}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </main>
    );
}
