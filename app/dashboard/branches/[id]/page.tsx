"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditBranch() {
    const params = useParams();
    const id = params?.id as string;
    const { data: session } = useSession();

    const [form, setForm] = useState({
        name: "",
        code: "",
        address: "",
        phone: "",
        manager: "",
        updatedBy: "",
        updatedByName: ""
    });

    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            const data = await fetch(`/api/branches/${id}`).then((res) => res.json());
            setForm(data);
        };
        loadData();
    }, [id]);

    const update = async () => {
        const updatedData = {
            ...form,
            updatedBy: session?.user?.id,
            updatedByName: session?.user?.name ?? "Unknown",
        };

        const res = await fetch(`/api/branches/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        });

        if (res.ok) {
            toast.success("Branch updated successfully!");
            router.push("/dashboard/branches");
        } else {
            toast.error("Update failed!");
        }
    };


    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold">Edit Branch</h1>

            <Input placeholder="Branch Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <Input placeholder="Branch Code" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })} />

            <Input placeholder="Address" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />

            <Input placeholder="Manager Name" value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })} />

            <Input placeholder="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />

            <Button onClick={update} className="bg-blue-600 text-white">Update</Button>
        </div>
    );
}
