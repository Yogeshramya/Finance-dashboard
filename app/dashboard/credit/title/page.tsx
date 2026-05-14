"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

interface Title {
    _id: string;
    title: string;
}

export default function CreditTitlesPage() {
    const [titles, setTitles] = useState<Title[]>([]);
    const [newTitle, setNewTitle] = useState("");

    const fetchTitles = async () => {
        const res = await fetch("/api/credit/title");
        const data = await res.json();

        if (data.success) setTitles(data.titles);
        else toast.error("Failed to load titles");
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTitles();
    }, []);

    const addTitle = async () => {
        if (!newTitle.trim()) return toast.error("Enter title name");

        const res = await fetch("/api/credit/title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
        });

        const data = await res.json();

        if (data.success) {
            toast.success("Title Added!");
            setNewTitle("");
            fetchTitles();
        } else toast.error(data.error || "Failed to add title");
    };

    const updateTitle = async (id: string, title: string) => {
        const res = await fetch(`/api/credit/title/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });

        const data = await res.json();

        if (data.success) toast.success("Updated!");
        else toast.error("Update failed");
    };

    const deleteTitle = async (id: string) => {
        if (!confirm("Delete this title?")) return;

        const res = await fetch(`/api/credit/title/${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (data.success) {
            toast.success("Deleted!");
            fetchTitles();
        } else toast.error("Delete failed");
    };

    return (
        <section className="max-w-6xl mx-auto space-y-6">
            <PageHeader />
            <h1 className="text-3xl font-bold text-orange-500">MANAGE CREDIT TITLES</h1>

            <Card className="p-6 space-y-4">
                <div className="flex gap-3">
                    <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Enter new credit title"
                    />
                    <Button onClick={addTitle} className="bg-green-600 hover:bg-green-700">
                        ADD
                    </Button>
                </div>

                <div className="space-y-3">
                    {titles.map((t) => (
                        <div
                            key={t._id}
                            className="flex items-center gap-3 border rounded-lg p-3"
                        >
                            <Input
                                defaultValue={t.title}
                                onBlur={(e) => updateTitle(t._id, e.target.value)}
                            />
                            <Button
                                variant="destructive"
                                onClick={() => deleteTitle(t._id)}
                            >
                                DELETE
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </section>
    );
}
