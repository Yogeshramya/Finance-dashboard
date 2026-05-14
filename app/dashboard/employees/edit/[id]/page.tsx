"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/PageHeader";

interface Branch {
    _id: string;
    name: string;
}

export default function EditEmployee() {

    const router = useRouter();
    const { id } = useParams();
    const { data: session } = useSession();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "EMPLOYEE_MFI",
        branch: "",
        branches: [] as string[],
        password: "",
        confirmPassword: "",
    });

    /* LOAD DATA */

    useEffect(() => {

        if (!id) return;

        async function loadData() {

            try {

                const empRes = await fetch(`/api/employees/${id}`);
                const empData = await empRes.json();

                setForm((f) => ({
                    ...f,
                    name: empData?.name || "",
                    email: empData?.email || "",
                    role: empData?.role || "EMPLOYEE_MFI",
                    branch: empData?.branch?._id || "",
                    branches: empData?.branches?.map((b: Branch) => b?._id) || [],
                }));

                const branchRes = await fetch("/api/branches/list");
                const branchData = await branchRes.json();

                setBranches(branchData.branches || []);

            } catch (err) {
                console.log(err);
                toast.error("Failed to load data");
            }
        }

        loadData();

    }, [id]);

    /* UPDATE USER */

    async function handleUpdate() {

        if (!session?.user?.role) {
            toast.error("Unauthorized");
            return;
        }

        if (form.role === "AREA_MANAGER" && form.branches.length === 0) {
            toast.error("Select at least one branch");
            return;
        }

        if (
            (form.role === "MANAGER" ||
                form.role === "EMPLOYEE_MFI" ||
                form.role === "TELLER") &&
            !form.branch
        ) {
            toast.error("Please select a branch");
            return;
        }

        if (form.password) {

            if (form.password !== form.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }

        }

        setLoading(true);

        try {

            const res = await fetch(`/api/employees/update/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    role: form.role,
                    branch: form.branch || null,
                    branches: form.branches || [],
                    password: form.password || undefined,
                }),
            });

            if (!res.ok) {
                toast.error("Update failed");
                return;
            }

            toast.success("Employee updated successfully");

            router.push("/dashboard/employees");

        } catch (err) {

            console.log(err);
            toast.error("Something went wrong");

        } finally {

            setLoading(false);

        }

    }

    return (

        <div className="p-6 max-w-5xl mx-auto">

            <PageHeader />

            <h1 className="text-2xl font-bold mb-6">
                Edit Employee
            </h1>

            <Card>

                <CardContent className="space-y-4 p-6">

                    {/* NAME */}

                    <Input
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    {/* EMAIL */}

                    <Input value={form.email} disabled />

                    {/* ROLE */}

                    <Select
                        value={form.role}
                        onValueChange={(v) =>
                            setForm({
                                ...form,
                                role: v,
                                branch: "",
                                branches: [],
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>

                        <SelectContent>

                            <SelectItem value="AREA_MANAGER">
                                Area Manager
                            </SelectItem>

                            <SelectItem value="MANAGER">
                                Manager
                            </SelectItem>

                            <SelectItem value="TELLER">
                                Teller
                            </SelectItem>

                            <SelectItem value="EMPLOYEE_MFI">
                                Employee
                            </SelectItem>

                        </SelectContent>

                    </Select>

                    {/* AREA MANAGER MULTI BRANCH */}

                    {form.role === "AREA_MANAGER" && (

                        <div className="space-y-2">

                            <p className="text-sm text-gray-500">
                                Assign Branches
                            </p>

                            {branches.map((b) => (

                                <label
                                    key={b._id}
                                    className="flex items-center gap-2 text-sm"
                                >

                                    <input
                                        type="checkbox"
                                        checked={form.branches.includes(b._id)}
                                        onChange={(e) => {

                                            if (e.target.checked) {
                                                setForm({
                                                    ...form,
                                                    branches: [...form.branches, b._id],
                                                });
                                            } else {
                                                setForm({
                                                    ...form,
                                                    branches: form.branches.filter(
                                                        (id) => id !== b._id
                                                    ),
                                                });
                                            }

                                        }}
                                    />

                                    {b.name}

                                </label>

                            ))}

                        </div>

                    )}

                    {/* SINGLE BRANCH (MANAGER + EMPLOYEE + TELLER) */}

                    {(form.role === "MANAGER" ||
                        form.role === "EMPLOYEE_MFI" ||
                        form.role === "TELLER") && (

                            <Select
                                value={form.branch}
                                onValueChange={(v) =>
                                    setForm({ ...form, branch: v })
                                }
                            >

                                <SelectTrigger>
                                    <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>

                                <SelectContent>

                                    {branches.map((b) => (

                                        <SelectItem
                                            key={b._id}
                                            value={b._id}
                                        >
                                            {b.name}
                                        </SelectItem>

                                    ))}

                                </SelectContent>

                            </Select>

                        )}

                    {/* PASSWORD CHANGE */}

                    <div className="pt-4 border-t">

                        <p className="text-sm font-medium text-gray-600 mb-2">
                            Change Password (optional)
                        </p>

                        <Input
                            type="password"
                            placeholder="New Password"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />

                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    confirmPassword: e.target.value,
                                })
                            }
                        />

                    </div>

                    {/* SAVE BUTTON */}

                    <Button
                        className="w-full"
                        onClick={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>

                </CardContent>

            </Card>

        </div>

    );

}