"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Employees() {

    const router = useRouter();
    const { data: session } = useSession();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE_MFI",
        branch: "",
        branches: [] as string[],
    });

    const currentUserRole = session?.user?.role ?? "";

    /* LOAD DATA */

    useEffect(() => {
        (async () => {

            const empRes = await fetch("/api/employees/list").then((r) =>
                r.json()
            );

            setEmployees(empRes.employees || []);

            const branchRes = await fetch("/api/branches/list").then((r) =>
                r.json()
            );

            setBranches(branchRes.branches || []);

        })();
    }, []);

    /* CREATE USER */

    async function handleCreate() {

        if (!form.name || !form.email || !form.password) {
            toast.error("All fields required");
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
            toast.error("Select branch");
            return;
        }

        const res = await fetch("/api/employees/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                branch: form.branch || null,
                branches: form.branches || [],
            }),
        });

        if (!res.ok) {
            toast.error("Creation failed");
            return;
        }

        toast.success("User created");

        const updated = await fetch("/api/employees/list").then((r) =>
            r.json()
        );

        setEmployees(updated.employees || []);

        setForm({
            name: "",
            email: "",
            password: "",
            role: "EMPLOYEE_MFI",
            branch: "",
            branches: [],
        });
    }

    /* DELETE USER */

    async function handleDelete(id: string) {

        if (!confirm("Delete user?")) return;

        const res = await fetch(`/api/employees/delete/${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message || "Delete failed");
            return;
        }

        setEmployees((prev) => prev.filter((e) => e._id !== id));

        toast.success("Deleted");
    }

    /* ROLE OPTIONS */

    const roleOptions =
        currentUserRole === "ADMINISTRATOR"
            ? ["AREA_MANAGER", "MANAGER", "EMPLOYEE_MFI", "TELLER"]
            : currentUserRole === "AREA_MANAGER"
                ? ["MANAGER", "EMPLOYEE_MFI", "TELLER"]
                : currentUserRole === "MANAGER"
                    ? ["EMPLOYEE_MFI", "TELLER"]
                    : [];

    return (

        <div className="p-6 space-y-6">

            <h1 className="text-3xl font-bold">
                Manage Employees
            </h1>

            {(currentUserRole === "ADMINISTRATOR" ||
                currentUserRole === "AREA_MANAGER" ||
                currentUserRole === "MANAGER") && (

                    <Card>
                        <CardContent className="p-4 space-y-4">

                            <Input
                                placeholder="Name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />

                            <Input
                                placeholder="Username"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                            />

                            <Input
                                placeholder="Password"
                                type="password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                            />

                            {/* ROLE SELECT */}

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
                                    {roleOptions.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
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

                            {/* MANAGER / EMPLOYEE / TELLER BRANCH */}

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
                                                <SelectItem key={b._id} value={b._id}>
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>

                                )}

                            <Button onClick={handleCreate}>
                                Create User
                            </Button>

                        </CardContent>
                    </Card>

                )}

            {/* EMPLOYEE LIST */}

            <h2 className="text-xl font-semibold">
                All Users
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

                {employees.map((emp) => (

                    <Card key={emp._id}>

                        <CardContent className="p-4 space-y-2">

                            <h3 className="font-semibold">
                                {emp.name}
                            </h3>

                            <p>{emp.email}</p>

                            <p className="text-sm text-gray-500">
                                Role: {emp.role}
                            </p>

                            {emp.branch && (
                                <p className="text-sm text-gray-500">
                                    Branch: {emp.branch.name}
                                </p>
                            )}

                            {emp.branches?.length > 0 && (
                                <p className="text-sm text-gray-500">
                                    Branches: {emp.branches.map((b: { name: string }) => b?.name).join(", ")}
                                </p>
                            )}

                            {emp._id !== session?.user?.id && (

                                <div className="flex gap-2 mt-2">

                                    <Button
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/employees/edit/${emp._id}`
                                            )
                                        }
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        onClick={() =>
                                            handleDelete(emp._id)
                                        }
                                    >
                                        Delete
                                    </Button>

                                </div>

                            )}

                        </CardContent>

                    </Card>

                ))}

            </div>

        </div>

    );
}