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

export default function CreditEntry() {
    const { data: session } = useSession();

    const [mode, setMode] = useState<"Cash" | "Bank">("Cash");
    const [title, setTitle] = useState("");
    const [titles, setTitles] = useState<{ _id: string; title: string }[]>([]);
    const [loadingTitles, setLoadingTitles] = useState(true);

    useEffect(() => {
        const fetchTitles = async () => {
            try {
                setLoadingTitles(true);
                const res = await fetch("/api/credit/title");
                const data = await res.json();

                if (data.success) {
                    setTitles(data.titles);
                } else {
                    toast.error("Failed to load credit titles");
                }
            } catch (err) {
                console.log("Error fetching credit titles:", err);
                toast.error("Error loading titles");
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

        const amount = Number(formData.get("amount"));
        if (!amount) return toast.error("Enter Amount!");

        if (!title) return toast.error("Please select a credit title!");

        const creditData = {
            date: formData.get("date"),
            title,
            details: formData.get("details"),
            amount,
            mode,
            status: "PENDING",
            employee: session?.user?.id ?? null,
            branch: session?.user?.branch?._id || session?.user?.branch || null,
        };

        const res = await fetch("/api/credit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(creditData),
        });

        const result = await res.json();

        if (result.success) {
            toast.success("Credit Saved Successfully!");
            form.reset();
            setTitle("");
            setMode("Cash");
        } else {
            toast.error(result.error || "Failed to save credit!");
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
            <h1 className="text-3xl font-bold text-orange-500">ADD CREDIT</h1>

            <Card className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* DATE */}
                    <div className="flex flex-col space-y-2">
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
                    <div className="flex flex-col space-y-2">
                        <Label>Credit Details :</Label>
                        <Textarea name="details" rows={4} required />
                    </div>

                    {/* MODE */}
                    <div className="space-y-2">
                        <Label>Mode :</Label>
                        <RadioGroup
                            value={mode}
                            onValueChange={(val: "Cash" | "Bank") => setMode(val)}
                            className="flex items-center gap-6"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem id="cash" value="Cash" />
                                <Label htmlFor="cash">Cash</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem id="bank" value="Bank" />
                                <Label htmlFor="bank">Bank</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* AMOUNT */}
                    <div className="flex flex-col space-y-2">
                        <Label>Amount :</Label>
                        <Input name="amount" type="number" min={1} required />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-center gap-6 pt-4">
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-10 font-semibold"
                        >
                            SAVE
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            className="px-10 font-semibold"
                            onClick={(e) => handleClear(e.currentTarget.form as HTMLFormElement)}
                        >
                            CLEAR
                        </Button>
                    </div>
                </form>
            </Card>
        </section>
    );
}
