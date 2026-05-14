"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import { Dues, Loan } from "@/types/fund";

type ApprovalFormProps = { loan: Loan };

export default function ApprovalForm({ loan }: ApprovalFormProps) {
    const router = useRouter();
    const [remarks, setRemarks] = useState("");

    async function approveLoan() {
        if (!remarks.trim()) {
            toast.error("Remarks are required to approve.");
            return;
        }

        const res = await fetch(`/api/fund/approve/${loan._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remarks })
        });

        if (res.ok) {
            toast.success("Fund Approved Successfully!");
            router.push("/dashboard/approval");
        } else {
            toast.error("Approval failed.");
        }
    }

    async function rejectLoan() {
        if (!remarks.trim()) {
            toast.error("Remarks are required to reject.");
            return;
        }

        const res = await fetch(`/api/fund/reject/${loan._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remarks })
        });

        if (res.ok) {
            toast.success("Fund Rejected.");
            router.push("/dashboard/approval");
        } else {
            toast.error("Rejection failed.");
        }
    }

    return (
        <section className="space-y-10">

            <h1 className="text-3xl font-bold text-blue-700">Loan Approval</h1>

            {/* CUSTOMER INFO */}
            <div className="border p-5 rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">Customer Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p><b>Name:</b> {loan.customer?.name}</p>
                    <p><b>Mobile:</b> {loan.customer?.phone}</p>
                    <p><b>Group:</b> {loan.group?.groupName}</p>
                    <p><b>Loan Amount:</b> ₹{loan.loanAmount}</p>
                    <p><b>Collection Employee:</b> {typeof loan.group?.employee === 'object' ? loan.group.employee?.name : loan.group?.employee || 'N/A'}</p>
                </div>
            </div>

            {/* LOAN DETAILS */}
            <div className="border p-5 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Loan Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p><b>MF Loan ID:</b> {loan.mfLoanId}</p>
                    <p><b>Loan Date:</b> {loan.loanDate}</p>
                    <p><b>First Due:</b> {loan.firstDueDate}</p>
                    <p><b>Matured:</b> {loan.maturedDate}</p>
                    <p><b>Scheme:</b> {loan.scheme.schemeName}</p>
                    <p><b>Loan Type:</b> {loan.loanType}</p>
                    <p><b>Loan Purpose:</b> {loan.loanPurpose}</p>
                </div>
            </div>

            {/* SCHEME TABLE */}
            <div className="border p-5 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Scheme Breakdown</h2>

                <table className="w-full border">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="border p-2">Due No</th>
                            <th className="border p-2">Principal</th>
                            <th className="border p-2">Interest</th>
                            <th className="border p-2">Savings</th>
                            <th className="border p-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loan.dues.map((d: Dues, i: number) => (
                            <tr key={i}>
                                <td className="border p-2 text-center">{i + 1}</td>
                                <td className="border p-2 text-center">{d.principal}</td>
                                <td className="border p-2 text-center">{d.interest}</td>
                                <td className="border p-2 text-center">{d.savings || 0}</td>
                                <td className="border p-2 text-center font-semibold">
                                    {(
                                        (Number(d.principal) || 0) +
                                        (Number(d.interest) || 0) +
                                        (Number(d.savings) || 0)
                                    ).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* REMARKS */}
            <div className="border p-5 rounded-lg bg-white">
                <Label>Remarks</Label>
                <TextareaAutosize
                    minRows={3}
                    className="w-full border rounded p-3 mt-2"
                    placeholder="Enter approval remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            <div className="flex gap-6">
                <Button
                    className="bg-green-600 hover:bg-green-700 px-10 py-4 text-lg"
                    onClick={approveLoan}
                >
                    APPROVE
                </Button>

                <Button
                    className="bg-red-600 hover:bg-red-700 px-10 py-4 text-lg"
                    onClick={rejectLoan}
                >
                    REJECT
                </Button>
            </div>
        </section>
    );
}
