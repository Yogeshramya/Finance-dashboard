"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Group } from "@/types/group";
import { Customer } from "@/types/customer";

export default function ManageClientPage() {
    const router = useRouter();

    const [query] = useState("");
    const [clients, setClients] = useState([]);

    const [employees, setEmployees] = useState([]);
    const [groups, setGroups] = useState([]);

    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    // Load employees
    useEffect(() => {
        async function loadEmployees() {
            const res = await fetch("/api/employees/list");
            const data = await res.json();
            setEmployees(data.employees || []);
        }
        loadEmployees();
    }, []);

    // Load groups under employee
    const loadGroups = async (empId: string) => {
        setSelectedEmployee(empId);
        setSelectedGroup("");
        setGroups([]);
        setClients([]);

        const res = await fetch(`/api/group?employeeId=${empId}`);
        const data = await res.json();
        setGroups(data.groups || []);
    };

    // Search filter
    const searchClients = async () => {
        let url = `/api/clients?`;

        if (query.trim()) url += `search=${query}&`;
        if (selectedGroup) url += `groupId=${selectedGroup}&`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) setClients(data.clients);
        else setClients([]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;

        const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
        const json = await res.json();

        if (json.success) {
            toast.success("Client Deleted");
            setClients((prev) => prev.filter((c: { _id: string }) => c._id !== id));
        } else {
            toast.error(json.error || "Failed to delete client");
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader />
            <h1 className="text-xl sm:text-2xl font-bold">Modify / Remove Client</h1>

            {/* Search + Filters Grid */}
            <div className="flex flex-cols-1 sm:grid-cols-1 gap-4">
                {/* Search */}
                {/*<Input
                    placeholder="Search by Name / Code / Phone"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />*/}

                {/* Employee */}
                <Select onValueChange={loadGroups}>
                    <SelectTrigger>
                        <SelectValue placeholder="Employee" />
                    </SelectTrigger>
                    <SelectContent>
                        {employees.map((e: Employee) => (
                            <SelectItem key={e._id} value={e._id}>
                                {e.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Group */}
                <Select
                    disabled={!selectedEmployee}
                    onValueChange={setSelectedGroup}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Group" />
                    </SelectTrigger>
                    <SelectContent>
                        {groups.map((g: Group) => (
                            <SelectItem key={g._id} value={g._id}>
                                {g.groupName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button className="w-full sm:w-auto" onClick={searchClients}>
                Apply Filters
            </Button>

            {/* Client List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.length > 0 ? (
                    clients.map((client: Customer) => (
                        <Card key={client._id} className="p-4 space-y-3">
                            <div>
                                <p className="font-semibold">{client.name}</p>
                                <p className="text-sm text-gray-500">{client.customerCode}</p>
                                <p className="text-sm text-gray-500">{client.phone}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/client/${client._id}`)}
                                >
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/client/${client._id}/edit`)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(client._id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-6 col-span-full">
                        No clients found
                    </p>
                )}
            </div>
        </div>
    );
}
