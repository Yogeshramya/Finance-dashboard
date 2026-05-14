"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Debit } from "@/types/debit";

export default function EditDebit() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const [debit, setDebit] = useState<Debit | null>(null);
    const [mode, setMode] = useState<"Cash" | "Bank">("Cash");
    const [title, setTitle] = useState("");

    // Load debit data
    useEffect(() => {
        async function loadDebit() {
            if (!id) return;

            const res = await fetch(`/api/debit/${id}`);
            const data = await res.json();

            if (!data.debit) {
                toast.error("Debit not found!");
                return router.push("/dashboard/debit/manage");
            }

            const d: Debit = data.debit;

            setDebit(d);
            setMode((d.mode as "Cash" | "Bank") || "Cash");
            setTitle(d.title || "");
        }

        loadDebit();
    }, [id, router]);

    if (!debit) return <p className="text-center mt-10">Loading...</p>;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        const payload = {
            date: form.date?.value,
            title,
            details: form.details.value,
            amount: Number(form.amount.value),
            mode,
        };

        const res = await fetch(`/api/debit/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.success) {
            toast.success("Debit Updated Successfully!");
            router.push("/dashboard/debit/manage");
        } else {
            toast.error(data.error || "Update Failed!");
        }
    };

    return (
        <section className="max-w-7xl mx-auto space-y-8">
            <PageHeader />

            <h1 className="text-3xl font-bold text-red-600">EDIT DEBIT</h1>

            <Card className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* DATE */}
                    <div>
                        <Label>Date :</Label>
                        <Input
                            name="date"
                            type="date"
                            required
                            defaultValue={
                                debit.date
                                    ? new Date(debit.date).toISOString().substring(0, 10)
                                    : ""
                            }
                        />
                    </div>

                    {/* TITLE */}
                    <div className="flex flex-col space-y-2">
                        <Label>Title :</Label>

                        <Input
                            name="title"
                            list="debitTitles"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Select or type title"
                            required
                        />

                        <datalist id="debitTitles">
                            <option value="Salary" />
                            <option value="Stationery" />
                            <option value="Office Expense" />
                            <option value="Rent" />
                            <option value="Electricity Bill" />
                            <option value="Insurance" />
                            <option value="Bank Charges" />
                            <option value="Vehicle Expense" />
                            <option value="Fuel" />
                            <option value="Other" />
                        </datalist>
                    </div>

                    {/* DETAILS */}
                    <div>
                        <Label>Debit Details :</Label>
                        <Textarea
                            name="details"
                            required
                            defaultValue={debit.details ?? ""}
                        />
                    </div>

                    {/* MODE */}
                    <div>
                        <Label>Mode :</Label>
                        <RadioGroup
                            value={mode}
                            onValueChange={(v: "Cash" | "Bank") => setMode(v)}
                            className="flex gap-6"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="Cash" id="cash" />
                                <Label htmlFor="cash">Cash</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="Bank" id="bank" />
                                <Label htmlFor="bank">Bank</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* AMOUNT */}
                    <div>
                        <Label>Amount :</Label>
                        <Input
                            name="amount"
                            type="number"
                            required
                            defaultValue={debit.amount}
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-6 justify-center">
                        <Button type="submit" className="bg-red-600 text-white px-10">
                            Update
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/debit/manage")}
                        >
                            Cancel
                        </Button>
                    </div>

                </form>
            </Card>
        </section>
    );
}
