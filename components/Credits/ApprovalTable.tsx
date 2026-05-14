"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Credit } from "@/types/credit";

interface ApprovalTableProps {
    credits: Credit[];
}

export default function CreditApprovalTable({ credits }: ApprovalTableProps) {
    const router = useRouter();

    return (
        <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="max-h-[70vh] overflow-y-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="p-3 border">Date</th>
                            <th className="p-3 border">Title</th>
                            <th className="p-3 border">Details</th>
                            <th className="p-3 border">Amount</th>
                            <th className="p-3 border">Mode</th>
                            <th className="p-3 border">Entered By</th>
                            <th className="p-3 border">Status</th>
                            <th className="p-3 border">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {credits.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-6 text-center text-gray-500">
                                    No credits awaiting approval
                                </td>
                            </tr>
                        )}

                        {credits.map((c) => (
                            <tr key={c._id} className="hover:bg-gray-100">
                                <td className="p-3 border text-center">
                                    {new Date(c.date).toLocaleDateString()}
                                </td>
                                <td className="p-3 border">{c.title}</td>
                                <td className="p-3 border">{c.details}</td>
                                <td className="p-3 border text-center">₹ {c.amount}</td>
                                <td className="p-3 border text-center">{c.mode}</td>

                                <td className="p-3 border text-center">
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
                                            router.push(`/dashboard/approval/credit/${c._id}`)
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
    );
}
