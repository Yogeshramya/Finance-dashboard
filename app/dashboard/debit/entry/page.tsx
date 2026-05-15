"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

export default function DebitEntry() {
    const { data: session } = useSession();

    const [mode, setMode] = useState<"Cash" | "Bank">("Cash");
    const [title, setTitle] = useState("");

    const [titles, setTitles] = useState<{ _id: string; title: string }[]>([]);
    const [loadingTitles, setLoadingTitles] = useState(true);

    useEffect(() => {
        const fetchTitles = async () => {
            try {
                setLoadingTitles(true);

                const res = await fetch("/api/debit/title");
                const data = await res.json();

                if (data.success) {
                    setTitles(data.titles);
                } else {
                    toast.error("Failed to load debit titles");
                }
            } catch (err) {
                console.log("Error fetching debit titles:", err);
                toast.error("Error loading debit titles");
            } finally {
                setLoadingTitles(false);
            }
        };

        fetchTitles();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        if (!session?.user) {
            toast.error("Not authenticated!");
            return;
        }

        if (!title) {
            toast.error("Please select a debit title!");
            return;
        }

        const debitData = {
            date: formData.get("date"),
            title,
            details: formData.get("details"),
            amount: Number(formData.get("amount")),
            mode,
            status: "PENDING",
            employee: session.user.id,
            branch: session.user.branch?._id || session.user.branch || null,
            createdByName: session.user.name,
        };

        const res = await fetch("/api/debit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(debitData),
        });

        const result = await res.json();

        if (result.success) {
            toast.success("Debit Saved Successfully!");
            form.reset();
            setTitle("");
            setMode("Cash");
        } else {
            toast.error(result.error || "Failed to save debit!");
        }
    };

    const handleClear = (form: HTMLFormElement) => {
        form.reset();
        setTitle("");
        setMode("Cash");
    };

    return (
        <section className="max-w-7xl mx-auto space-y-8">
            <PageHeader />
            <h1 className="text-3xl font-bold text-red-600">ADD DEBIT</h1>

            <Card className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* DATE */}
                    <div>
                        <Label>Date :</Label>
                        <Input name="date" type="date" required />
                    </div>

                    {/* TITLE DROPDOWN */}
                    <div className="flex flex-col space-y-2">
                        <Label>Title :</Label>

                        <Select value={title} onValueChange={setTitle}>
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={loadingTitles ? "Loading titles..." : "Select Title"}
                                />
                            </SelectTrigger>

                            <SelectContent>
                                {titles.map((t) => (
                                    <SelectItem key={t._id} value={t.title}>
                                        {t.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* DETAILS */}
                    <div>
                        <Label>Debit Details :</Label>
                        <Textarea name="details" rows={4} required />
                    </div>

                    {/* MODE */}
                    <div>
                        <Label>Mode :</Label>
                        <RadioGroup
                            value={mode}
                            onValueChange={(val: "Cash" | "Bank") => setMode(val)}
                            className="flex gap-6 items-center"
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
                        <Input name="amount" type="number" required min={1} />
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-center gap-6">
                        <Button type="submit" className="bg-red-600 px-10 text-white">
                            SAVE
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => handleClear(e.currentTarget.form as HTMLFormElement)}
                            className="px-10"
                        >
                            CLEAR
                        </Button>
                    </div>
                </form>
            </Card>
        </section>
    );
}
