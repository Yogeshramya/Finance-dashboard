"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

type Scheme = {
    schemeId?: string;
    schemeName?: string;
    loanType?: string;
    totalAmount?: number | string;
    dues?: number;
};

export default function ManageSchemes() {
    const router = useRouter();
    const isManager = false;

    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [search, setSearch] = useState("");
    const [loadingList, setLoadingList] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    /* ================= LOAD SCHEMES ================= */
    async function loadSchemes() {
        try {
            setLoadingList(true);
            const res = await fetch("/api/scheme/list");
            if (!res.ok) throw new Error("Failed to load schemes");
            const data = await res.json();
            setSchemes(data || []);
        } catch {
            toast.error("Could not load schemes");
        } finally {
            setLoadingList(false);
        }
    }

    useEffect(() => {
        loadSchemes();
    }, []);

    /* ================= DELETE ================= */
    async function deleteScheme(id: string) {
        if (!isManager) {
            return toast.error("Only managers can delete schemes");
        }

        const confirmDelete = confirm(
            "Are you sure you want to delete this scheme?"
        );
        if (!confirmDelete) return;

        try {
            setDeletingId(id);
            const res = await fetch(
                `/api/scheme/edit/${encodeURIComponent(id)}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error("Delete failed");

            setSchemes((prev) => prev.filter((s) => s.schemeId !== id));
            toast.success("Scheme deleted successfully!");
        } catch {
            toast.error("Failed to delete scheme!");
        } finally {
            setDeletingId(null);
        }
    }

    /* ================= SEARCH ================= */
    const filteredSchemes = schemes.filter((s) => {
        const name = (s.schemeName || "").toLowerCase();
        const id = (s.schemeId || "").toLowerCase();
        const q = search.toLowerCase();
        return name.includes(q) || id.includes(q);
    });

    return (
        <section className="max-w-7xl mx-auto space-y-8 p-4">
            <PageHeader />

            <h1 className="text-3xl font-bold text-gray-800">
                Manage Schemes
            </h1>

            {/* SEARCH + ADD */}
            <div className="flex justify-between items-center gap-4">
                <Input
                    placeholder="Search Scheme..."
                    className="max-w-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {isManager && (
                    <Button
                        onClick={() => router.push("/dashboard/scheme/new")}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        + Add New Scheme
                    </Button>
                )}
            </div>

            {/* TABLE */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="p-3 border">Scheme ID</th>
                            <th className="p-3 border">Scheme Name</th>
                            <th className="p-3 border">Loan Type</th>
                            <th className="p-3 border">Total Amount</th>
                            <th className="p-3 border">Dues</th>
                            <th className="p-3 border">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loadingList ? (
                            <tr>
                                <td colSpan={6} className="p-6 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : filteredSchemes.length ? (
                            filteredSchemes.map((item, i) => (
                                <tr
                                    key={item.schemeId ?? i}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="p-3 border text-center">
                                        {item.schemeId}
                                    </td>
                                    <td className="p-3 border">
                                        {item.schemeName}
                                    </td>
                                    <td className="p-3 border text-center">
                                        {item.loanType}
                                    </td>
                                    <td className="p-3 border text-center">
                                        ₹{item.totalAmount}
                                    </td>
                                    <td className="p-3 border text-center">
                                        {item.dues}
                                    </td>

                                    <td className="p-3 border">
                                        <div className="flex gap-2 justify-center">
                                            {/* VIEW – ALL */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    router.push(
                                                        `/dashboard/scheme/${encodeURIComponent(
                                                            item.schemeId || ""
                                                        )}`
                                                    )
                                                }
                                            >
                                                View
                                            </Button>

                                            {/* EDIT & DELETE – MANAGER ONLY */}
                                            {isManager && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                        onClick={() =>
                                                            router.push(
                                                                `/dashboard/scheme/edit/${encodeURIComponent(
                                                                    item.schemeId || ""
                                                                )}`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        className="bg-red-600 hover:bg-red-700"
                                                        disabled={
                                                            deletingId ===
                                                            item.schemeId
                                                        }
                                                        onClick={() =>
                                                            deleteScheme(
                                                                item.schemeId ||
                                                                ""
                                                            )
                                                        }
                                                    >
                                                        {deletingId ===
                                                            item.schemeId
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-4 text-center text-gray-500"
                                >
                                    No schemes found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
