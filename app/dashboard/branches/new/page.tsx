"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddBranch() {
    const { data: session } = useSession();
    const [form, setForm] = useState({
        name: "",
        code: "",
        address: "",
        phone: "",
        manager: "",
    });

    const router = useRouter();

    const submit = async () => {
        if (!session?.user) {
            toast.error("User not logged in!");
            return;
        }

        const payload = {
            ...form,
            createdBy: session.user.id,
            createdByName: session.user.name,
        };

        const res = await fetch("/api/branches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            toast.success("Branch Created Successfully!");
            router.push("/dashboard/branches");
        } else {
            toast.error("Failed to create branch!");
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold">Add New Branch</h1>

            <Input placeholder="Branch Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <Input placeholder="Branch Code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })} />

            <Input placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />

            <Input placeholder="Manager Name"
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })} />

            <Input placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />

            <Button onClick={submit} className="bg-green-600 text-white">
                Save
            </Button>
        </div>
    );
}
