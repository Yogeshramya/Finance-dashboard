"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BranchPage() {
    const [branches, setBranches] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            const data = await fetch("/api/branches").then((res) => res.json());
            setBranches(data);
        };
        load();
    }, []);

    const deleteBranch = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this branch?");
        if (!confirmDelete) return;

        const res = await fetch(`/api/branches/${id}`, { method: "DELETE" });

        if (!res.ok) {
            toast.error("Error deleting branch!");
            return;
        }

        const data = await fetch("/api/branches").then((res) => res.json());
        setBranches(data);

        toast.success("Branch deleted successfully!");
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Manage Branches</h1>
                <Button onClick={() => router.push("/dashboard/branches/new")}>
                    Add Branch
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {branches.map((b: Branch) => (
                    <Card key={b._id}>
                        <CardContent className="p-4 flex justify-between">
                            <div>
                                <h2 className="font-semibold">{b.name}</h2>
                                <p className="text-sm text-gray-500">{b.address}</p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/dashboard/branches/${b._id}`)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    variant="destructive"
                                    disabled={true} // Disable delete for now until we handle employee reassignment
                                    onClick={() => deleteBranch(b._id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
