"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditSchemeFormProps {
    scheme: Scheme;
}

export default function EditSchemeForm({ scheme }: EditSchemeFormProps) {
    const router = useRouter();

    const [form, setForm] = useState({
        schemeId: scheme.schemeId,
        schemeName: scheme.schemeName,
        loanType: scheme.loanType,
        totalAmount: scheme.totalAmount,
        upfrontFees: scheme.upfrontFees,
        dues: scheme.dues,
        interest: scheme.interest || "",
        applicationFees: scheme.applicationFees || "",
        insuranceFees: scheme.insuranceFees || "",
    });

    const [rows, setRows] = useState(
        scheme.rows || [{ principal: "", interest: "", savings: "", total: 0 }]
    );

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleDuesChange(num: number) {
        setForm({ ...form, dues: num });

        // Adjust the number of rows based on the number of dues
        if (num > rows.length) {
            // Add new rows
            setRows([
                ...rows,
                ...Array.from({ length: num - rows.length }, () => ({
                    principal: "",
                    interest: "",
                    savings: "",
                    total: 0,
                })),
            ]);
        } else if (num < rows.length) {
            // Remove extra rows
            setRows(rows.slice(0, num));
        }
    }

    async function handleUpdate() {
        const res = await fetch(`/api/scheme/edit/${scheme.schemeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, rows }),
        });

        if (res.ok) {
            toast.success("Scheme updated successfully!");
            router.push("/dashboard/scheme/manage");
        } else {
            toast.error("Failed to update scheme.");
        }
    }

    function updateRow(
        index: number,
        field: "principal" | "interest" | "savings",
        value: string
    ): void {
        const updatedRows = [...rows];
        updatedRows[index] = {
            ...updatedRows[index],
            [field]: value,
        };

        const principal = Number(updatedRows[index].principal) || 0;
        const interest = Number(updatedRows[index].interest) || 0;
        const savings = Number(updatedRows[index].savings) || 0;

        updatedRows[index].total = principal + interest + savings;

        setRows(updatedRows);
    }
    return (
        <section className="space-y-10">
            <h1 className="text-3xl font-bold text-blue-600">EDIT SCHEME</h1>

            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div>
                    <Label>Scheme ID :</Label>
                    <Input value={form.schemeId} readOnly className="bg-gray-100" />
                </div>

                <div>
                    <Label>Scheme Name :</Label>
                    <Input
                        name="schemeName"
                        value={form.schemeName}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label>Loan Type :</Label>
                    <Select
                        value={form.loanType}
                        onValueChange={(v) => setForm({ ...form, loanType: v })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GL">GL</SelectItem>
                            <SelectItem value="EL">EL</SelectItem>
                            <SelectItem value="PL">PL</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Total Amount :</Label>
                    {/* editable input */}
                    <Input
                        name="totalAmount"
                        value={form.totalAmount}
                        onChange={handleChange}
                        className="bg-white"
                    />
                </div>

                <div>
                    <Label>Interest % :</Label>
                    <Input
                        name="interest"
                        value={form.interest}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label>Application Fees :</Label>
                    <Input
                        name="applicationFees"
                        value={form.applicationFees}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label>Insurance Fees :</Label>
                    <Input
                        name="insuranceFees"
                        value={form.insuranceFees}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label>Admission Fees :</Label>
                    <Input
                        name="upfrontFees"
                        value={form.upfrontFees}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label>No. of Dues :</Label>
                    <Input
                        type="number"
                        min={1}
                        value={form.dues}
                        onChange={(e) => handleDuesChange(Number(e.target.value))}
                    />
                </div>
            </div>

            {/* TABLE */}
            <table className="w-full border mt-8">
                <thead className="bg-blue-500 text-white">
                    <tr>
                        <th className="p-2 border">Due No</th>
                        <th className="p-2 border">Principal Rs</th>
                        <th className="p-2 border">Interest Rs</th>
                        <th className="p-2 border">Savings Rs</th>
                        <th className="p-2 border">Total</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, i: number) => (
                        <tr key={i}>
                            <td className="border p-2 text-center">{i + 1}</td>

                            <td className="border p-2">
                                <Input
                                    value={row.principal}
                                    onChange={(e) => updateRow(i, "principal", e.target.value)}
                                />
                            </td>

                            <td className="border p-2">
                                <Input
                                    value={row.interest}
                                    onChange={(e) => updateRow(i, "interest", e.target.value)}
                                />
                            </td>

                            <td className="border p-2">
                                <Input
                                    value={row.savings}
                                    onChange={(e) => updateRow(i, "savings", e.target.value)}
                                />
                            </td>

                            <td className="border p-2 bg-gray-100 font-medium text-center">
                                ₹{(Number(row.total) || 0).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* BUTTONS */}
            <div className="flex gap-4 mt-6">
                <Button className="bg-blue-600 px-10 py-5 text-lg" onClick={handleUpdate}>
                    UPDATE
                </Button>

                <Button className="bg-gray-500 px-10 py-5 text-lg" onClick={() => router.back()}>
                    CANCEL
                </Button>
            </div>
        </section>
    );
}