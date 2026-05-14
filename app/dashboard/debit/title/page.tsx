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

export default function DebitTitlesPage() {
    const [titles, setTitles] = useState<Title[]>([]);
    const [newTitle, setNewTitle] = useState("");

    const fetchTitles = async () => {
        try {
            const res = await fetch("/api/debit/title");
            const data = await res.json();

            if (data.success) {
                setTitles(data.titles);
            } else {
                toast.error("Failed to load debit titles");
            }
        } catch (error) {
            console.log("Error fetching debit titles:", error);
            toast.error("Error fetching titles");
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTitles();
    }, []);

    const addTitle = async () => {
        if (!newTitle.trim()) return toast.error("Enter debit title!");

        try {
            const res = await fetch("/api/debit/title", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Debit Title Added!");
                setNewTitle("");
                fetchTitles();
            } else {
                toast.error(data.error || "Failed to add title");
            }
        } catch (error) {
            console.log("Error adding debit title:", error);
            toast.error("Error adding title");
        }
    };

    const updateTitle = async (id: string, title: string) => {
        if (!title.trim()) return toast.error("Title cannot be empty!");

        try {
            const res = await fetch(`/api/debit/title/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Title Updated!");
            } else {
                toast.error(data.error || "Update failed");
            }
        } catch (error) {
            console.log("Error updating debit title:", error);
            toast.error("Error updating title");
        }
    };

    const deleteTitle = async (id: string) => {
        if (!confirm("Are you sure want to delete this title?")) return;

        try {
            const res = await fetch(`/api/debit/title/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Title Deleted!");
                fetchTitles();
            } else {
                toast.error(data.error || "Delete failed");
            }
        } catch (error) {
            console.log("Error deleting debit title:", error);
            toast.error("Error deleting title");
        }
    };

    return (
        <section className="max-w-6xl mx-auto space-y-6">
            <PageHeader />

            <h1 className="text-3xl font-bold text-red-600">
                MANAGE DEBIT TITLES
            </h1>

            <Card className="p-6 space-y-6">
                {/* ADD NEW TITLE */}
                <div className="flex gap-3">
                    <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Enter new debit title"
                    />
                    <Button
                        onClick={addTitle}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        ADD
                    </Button>
                </div>

                {/* LIST TITLES */}
                <div className="space-y-3">
                    {titles.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center">
                            No debit titles found
                        </p>
                    ) : (
                        titles.map((t) => (
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
                        ))
                    )}
                </div>
            </Card>
        </section>
    );
}
