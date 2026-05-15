"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    PlusCircle, 
    Save, 
    RotateCcw, 
    Calculator, 
    Percent, 
    IndianRupee, 
    CalendarDays,
    Trash2,
    ArrowLeft
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function NewSchemePage() {
    const router = useRouter();
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
            router.push("/dashboard/scheme");
        } else {
            toast.error("Error saving scheme!");
        }
    }

    function handleDuesChange(number: number) {
        if (number > 100) return toast.warning("Maximum 100 dues allowed");
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

    const grandTotal = rows.reduce(
        (sum, r) => sum + (Number(r.principal) || 0) + (Number(r.interest) || 0) + (Number(r.savings) || 0),
        0
    );

    return (
        <section className="max-w-7xl mx-auto space-y-10 p-6">
            <PageHeader />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <PlusCircle className="w-8 h-8 text-blue-600" />
                            Create New Scheme
                        </h1>
                        <p className="text-gray-500 mt-1">Define loan structures, fees, and installment breakdowns.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleClear} className="rounded-xl h-12 px-6">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear Form
                    </Button>
                    <Button onClick={handleSave} className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
                        <Save className="w-4 h-4 mr-2" />
                        Save Scheme
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-gray-50/50">
                        <CardHeader className="border-b bg-white/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-blue-500" />
                                Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scheme ID</Label>
                                <Input name="schemeId" value={form.schemeId} onChange={handleChange} placeholder="e.g. GL-50K-24W" className="h-11 rounded-xl" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scheme Name</Label>
                                <Input name="schemeName" value={form.schemeName} onChange={handleChange} placeholder="e.g. Gold Loan 50,000" className="h-11 rounded-xl" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loan Category</Label>
                                <Select value={form.loanType} onValueChange={(v) => setForm({ ...form, loanType: v })}>
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GL">Gold Loan (GL)</SelectItem>
                                        <SelectItem value="EL">Emergency Loan (EL)</SelectItem>
                                        <SelectItem value="PL">Personal Loan (PL)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Principal</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                    <Input name="totalAmount" value={form.totalAmount} onChange={handleChange} className="pl-9 h-11 rounded-xl" placeholder="0.00" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Interest (%)</Label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                        <Input name="interest" value={form.interest} onChange={handleChange} className="pl-9 h-11 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">No. of Dues</Label>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            name="dues"
                                            value={form.dues}
                                            onChange={(e) => handleDuesChange(Number(e.target.value))}
                                            className="pl-9 h-11 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="border-b bg-gray-50/50">
                            <CardTitle className="text-lg font-bold">Fees & Charges</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Application Fees</Label>
                                    <Input name="applicationFees" value={form.applicationFees} onChange={handleChange} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Insurance Fees</Label>
                                    <Input name="insuranceFees" value={form.insuranceFees} onChange={handleChange} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admission Fees</Label>
                                    <Input name="upfrontFees" value={form.upfrontFees} onChange={handleChange} className="h-11 rounded-xl" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Breakdown Table */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white h-full flex flex-col">
                        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <CardTitle className="text-xl font-bold">Installment Breakdown</CardTitle>
                                <p className="text-sm text-gray-400 mt-1">Specify principal and interest per installment.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grand Total</p>
                                <p className="text-2xl font-black text-blue-600">₹{grandTotal.toFixed(2)}</p>
                            </div>
                        </div>

                        <CardContent className="p-0 flex-1 overflow-auto max-h-[600px]">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 text-left font-bold uppercase tracking-tighter text-[10px]">Due No</th>
                                        <th className="p-4 text-left font-bold uppercase tracking-tighter text-[10px]">Principal (Rs)</th>
                                        <th className="p-4 text-left font-bold uppercase tracking-tighter text-[10px]">Interest (Rs)</th>
                                        <th className="p-4 text-left font-bold uppercase tracking-tighter text-[10px]">Savings</th>
                                        <th className="p-4 text-left font-bold uppercase tracking-tighter text-[10px]">Total</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-50">
                                    {rows.map((row, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 text-center font-bold text-gray-400 w-20">{i + 1}</td>

                                            <td className="p-2">
                                                <Input
                                                    value={row.principal}
                                                    onChange={(e) => {
                                                        const newRows = [...rows];
                                                        newRows[i].principal = e.target.value;
                                                        setRows(newRows);
                                                    }}
                                                    className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-blue-200 h-11 bg-transparent group-hover:bg-white rounded-lg"
                                                    placeholder="0.00"
                                                />
                                            </td>

                                            <td className="p-2">
                                                <Input
                                                    value={row.interest}
                                                    onChange={(e) => {
                                                        const newRows = [...rows];
                                                        newRows[i].interest = e.target.value;
                                                        setRows(newRows);
                                                    }}
                                                    className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-blue-200 h-11 bg-transparent group-hover:bg-white rounded-lg"
                                                    placeholder="0.00"
                                                />
                                            </td>

                                            <td className="p-2">
                                                <Input
                                                    value={row.savings}
                                                    onChange={(e) => {
                                                        const newRows = [...rows];
                                                        newRows[i].savings = e.target.value;
                                                        setRows(newRows);
                                                    }}
                                                    className="border-none shadow-none focus-visible:ring-1 focus-visible:ring-blue-200 h-11 bg-transparent group-hover:bg-white rounded-lg"
                                                    placeholder="0.00"
                                                />
                                            </td>

                                            <td className="p-4 text-right">
                                                <span className="font-bold text-gray-900">
                                                    ₹{(
                                                        (Number(row.principal) || 0) +
                                                        (Number(row.interest) || 0) +
                                                        (Number(row.savings) || 0)
                                                    ).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {rows.length === 0 && (
                                <div className="p-20 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Calculator className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-gray-400">Enter "No. of Dues" to generate the breakdown table.</p>
                                </div>
                            )}
                        </CardContent>
                        
                        <div className="p-6 bg-gray-50/50 border-t flex justify-between items-center">
                            <p className="text-xs text-gray-400 font-medium italic">
                                * Ensure the sum of principal matches the total amount.
                            </p>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleClear}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Reset Breakdown
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
