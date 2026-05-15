"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Credit } from "@/types/credit";

export default function EditCredit() {
    const router = useRouter();
    const { id } = useParams();

    const [credit, setCredit] = useState<Credit | null>(null);
    const [mode, setMode] = useState("Cash");
    const [title, setTitle] = useState("");

    const [titles, setTitles] = useState<{ _id: string; title: string }[]>([]);

    useEffect(() => {
        async function fetchTitles() {
            try {
                const res = await fetch("/api/credit/title");
                const data = await res.json();
                if (data.success) setTitles(data.titles);
            } catch (err) {
                console.error("Error fetching titles:", err);
            }
        }
        fetchTitles();
    }, []);

    useEffect(() => {
        async function fetchCredit() {
            const res = await fetch(`/api/credit/${id}`);
            const data = await res.json();

            if (!data.credit) {
                toast.error("Credit not found!");
                return router.push("/dashboard/credit/manage");
            }

            const d = data.credit;
            setCredit(d);
            setMode(d.mode || "Cash");
            setTitle(d.title);
        }
        fetchCredit();
    }, [id, router]);

    if (!credit) return <p className="text-center mt-10">Loading...</p>;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const updated = {
            date: formData.get("date"),
            title,
            details: formData.get("details"),
            amount: Number(formData.get("amount")),
            mode,
        };

        const res = await fetch(`/api/credit/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
        });

        const out = await res.json();
        if (out.success) {
            toast.success("Credit Updated Successfully!");
            router.push("/dashboard/credit/manage");
        } else {
            toast.error(out.error || "Update Failed!");
        }
    };

    return (
        <section className="max-w-7xl mx-auto space-y-8">
            <PageHeader />
            <h1 className="text-3xl font-bold text-blue-600">EDIT CREDIT</h1>

            <Card className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* DATE */}
                    <div className="flex flex-col space-y-2">
                        <Label>Date :</Label>
                        <Input
                            name="date"
                            type="date"
                            required
                            defaultValue={credit.date?.substring(0, 10)}
                        />
                    </div>

                    {/* TITLE */}
                    <div className="flex flex-col space-y-2">
                        <Label>Title :</Label>

                        <Input
                            name="title"
                            list="creditTitles"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Select or type title"
                            required
                        />

                        <datalist id="creditTitles">
                            {titles.map((t) => (
                                <option key={t._id} value={t.title} />
                            ))}
                        </datalist>
                    </div>

                    {/* DETAILS */}
                    <div className="flex flex-col space-y-2">
                        <Label>Credit Details :</Label>
                        <Textarea
                            name="details"
                            required
                            defaultValue={credit.details}
                        />
                    </div>

                    {/* MODE */}
                    <div className="space-y-2">
                        <Label>Mode :</Label>
                        <RadioGroup
                            value={mode}
                            onValueChange={setMode}
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

                    {/* AMOUNT (ALWAYS SHOWN NOW) */}
                    <div className="flex flex-col space-y-2">
                        <Label>Amount :</Label>
                        <Input
                            name="amount"
                            type="number"
                            required
                            defaultValue={credit.amount}
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-center gap-6 pt-4">
                        <Button type="submit" className="bg-blue-600 text-white px-10">
                            Update
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/credit/manage")}
                        >
                            Cancel
                        </Button>
                    </div>

                </form>
            </Card>
        </section>
    );
}
