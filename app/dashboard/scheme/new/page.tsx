"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";

export default function NewSchemePage() {
    const [form, setForm] = useState({
        schemeId: "",
        schemeName: "",
        loanType: "GL",
        totalAmount: "",
        interest: "0",
        applicationFees: "0.00",
        insuranceFees: "0.00",
        upfrontFees: "0.00",
        dues: 1
    });

    const [rows, setRows] = useState([
        { principal: "", interest: "", savings: "", total: "" }
    ]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSave() {
        if (!form.schemeId || !form.schemeName || !form.totalAmount) {
            toast.error("Please fill all required fields!");
            return;
        }

        const res = await fetch("/api/scheme/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, rows })
        });

        if (res.ok) {
            toast.success("Scheme saved successfully!");
        } else {
            toast.error("Error saving scheme!");
        }
    }

    function handleDuesChange(number: number) {
        setForm({ ...form, dues: number });

        const arr = [];
        for (let i = 0; i < number; i++) {
            arr.push({ principal: "", interest: "", savings: "", total: "" });
        }
        setRows(arr);
    }

    function handleClear() {
        setForm({
            schemeId: "",
            schemeName: "",
            loanType: "GL",
            totalAmount: "",
            interest: "0",
            applicationFees: "0.00",
            insuranceFees: "0.00",
            upfrontFees: "0.00",
            dues: 1
        });
        setRows([{ principal: "", interest: "", savings: "", total: "" }]);
        toast.info("Form cleared.");
    }

    return (
        <section className="max-w-7xl mx-auto space-y-10">
            <PageHeader />
            <h1 className="text-3xl font-bold text-orange-600">ADD SCHEME</h1>

            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div>
                    <Label>Scheme ID :</Label>
                    <Input name="schemeId" value={form.schemeId} onChange={handleChange} />
                </div>

                <div>
                    <Label>Scheme Name :</Label>
                    <Input name="schemeName" value={form.schemeName} onChange={handleChange} />
                </div>

                <div>
                    <Label>Loan Type :</Label>
                    <Select value={form.loanType} onValueChange={(v) => setForm({ ...form, loanType: v })}>
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
                    <Input name="totalAmount" value={form.totalAmount} onChange={handleChange} />
                </div>

                <div>
                    <Label>Interest % :</Label>
                    <Input name="interest" value={form.interest} onChange={handleChange} />
                </div>

                <div>
                    <Label>Application Fees :</Label>
                    <Input name="applicationFees" value={form.applicationFees} onChange={handleChange} />
                </div>

                <div>
                    <Label>Insurance Fees :</Label>
                    <Input name="insuranceFees" value={form.insuranceFees} onChange={handleChange} />
                </div>

                <div>
                    <Label>Admission Fees :</Label>
                    <Input name="upfrontFees" value={form.upfrontFees} onChange={handleChange} />
                </div>

                <div>
                    <Label>No. of Dues :</Label>
                    <Input
                        name="dues"
                        //type="number"
                        min={1}
                        value={form.dues}
                        onChange={(e) => handleDuesChange(Number(e.target.value))}
                    />
                </div>
            </div>

            {/* TABLE */}
            <div>
                <table className="w-full border mt-8">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="p-2 border">Due No</th>
                            <th className="p-2 border">Principal Rs</th>
                            <th className="p-2 border">Interest Rs</th>
                            <th className="p-2 border">Savings</th>
                            <th className="p-2 border">Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td className="border p-2 text-center">{i + 1}</td>

                                <td className="border p-2">
                                    <Input
                                        value={row.principal}
                                        onChange={(e) => {
                                            const newRows = [...rows];
                                            newRows[i].principal = e.target.value;
                                            setRows(newRows);
                                        }}
                                    />
                                </td>

                                <td className="border p-2">
                                    <Input
                                        value={row.interest}
                                        onChange={(e) => {
                                            const newRows = [...rows];
                                            newRows[i].interest = e.target.value;
                                            setRows(newRows);
                                        }}
                                    />
                                </td>

                                <td className="border p-2">
                                    <Input
                                        value={row.savings}
                                        onChange={(e) => {
                                            const newRows = [...rows];
                                            newRows[i].savings = e.target.value;
                                            setRows(newRows);
                                        }}
                                    />
                                </td>

                                <td className="border p-2 bg-gray-100">
                                    {(
                                        (Number(row.principal) || 0) +
                                        (Number(row.interest) || 0) +
                                        (Number(row.savings) || 0)
                                    ).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* TOTAL */}
                <div className="flex justify-end font-bold text-lg mt-4">
                    Total:{" "}
                    {
                        rows
                            .reduce(
                                (sum, r) =>
                                    sum +
                                    (Number(r.principal) || 0) +
                                    (Number(r.interest) || 0) +
                                    (Number(r.savings) || 0),
                                0
                            )
                            .toFixed(2)
                    }
                </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
                <Button
                    className="bg-red-600 hover:bg-red-700 px-10 py-6 text-lg"
                    onClick={handleSave}
                >
                    SAVE
                </Button>

                <Button
                    className="bg-gray-500 hover:bg-gray-600 px-10 py-6 text-lg"
                    onClick={handleClear}
                >
                    CLEAR
                </Button>
            </div>
        </section>
    );
}
