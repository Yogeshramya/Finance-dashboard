"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Customer } from "@/types/customer";

export default function ClientApprovalPage() {
    const [clients, setClients] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/clients/pending");
            const data = await res.json();

            if (!data.success) {
                toast.error("Failed to load client approvals");
                return;
            }

            setClients(data.clients || []);
        } catch {
            toast.error("Failed to load client approvals");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <p className="text-center mt-10">
                Loading pending client approvals...
            </p>
        );
    }

    return (
        <section className="max-w-7xl mx-auto space-y-6 p-4">
            <PageHeader />

            <h1 className="text-2xl font-bold text-blue-600">
                Client Approvals
            </h1>

            <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[70vh] overflow-y-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="p-3 border">Date</th>
                                <th className="p-3 border">Customer Code</th>
                                <th className="p-3 border">Name</th>
                                <th className="p-3 border">Phone</th>
                                <th className="p-3 border">Group</th>
                                <th className="p-3 border">Entered By</th>
                                <th className="p-3 border">Status</th>
                                <th className="p-3 border">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {clients.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="p-6 text-center text-gray-500"
                                    >
                                        No clients awaiting approval
                                    </td>
                                </tr>
                            )}

                            {clients.map((c) => (
                                <tr
                                    key={c._id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="p-3 border text-center">
                                        {new Date(
                                            c.createdAt
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="p-3 border text-center font-medium">
                                        {c.customerCode}
                                    </td>

                                    <td className="p-3 border">
                                        {c.name}
                                    </td>

                                    <td className="p-3 border text-center">
                                        {c.phone}
                                    </td>

                                    <td className="p-3 border text-center">
                                        {c.group?.groupName || "—"}
                                    </td>

                                    <td className="p-3 border">
                                        {c.employee?.name || "—"}
                                    </td>

                                    <td className="p-3 border text-center">
                                        <span className="px-3 py-1 rounded bg-yellow-500 text-white font-medium">
                                            PENDING
                                        </span>
                                    </td>

                                    <td className="p-3 border text-center">
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/approval/client/${c._id}`
                                                )
                                            }
                                        >
                                            Review
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
