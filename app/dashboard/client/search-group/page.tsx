"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Group } from "@/types/group";
import { Customer } from "@/types/customer";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

interface Employee {
    _id: string;
    name: string;
}

export default function SearchGroupPage() {
    const router = useRouter();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState("");

    const [results, setResults] = useState<Customer[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredResults = results.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.customerCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const paginatedResults = filteredResults.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleExport = () => {
        const csv = [
            ["Name", "Customer Code", "Phone"],
            ...filteredResults.map((client) => [
                client.name,
                client.customerCode || "",
                client.phone || "",
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "clients.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        async function loadEmployees() {
            try {
                const res = await fetch("/api/employees/list");
                const data = await res.json();
                setEmployees(data.employees || []);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load employees");
            }
        }
        loadEmployees();
    }, []);

    useEffect(() => {
        async function loadGroups() {
            if (!selectedEmployee) {
                setGroups([]);
                setSelectedGroup("");
                return;
            }

            try {
                const res = await fetch(`/api/group/search?query=${selectedEmployee}`);
                const data = await res.json();

                if (!res.ok) {
                    toast.error("Failed to load groups");
                    return;
                }

                setGroups(data.groups || []);
                setSelectedGroup("");
                setResults([]);
                setSearched(false);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load groups");
            }
        }

        loadGroups();
    }, [selectedEmployee]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSearch = async () => {
        if (!selectedGroup) {
            toast.error("Please select a group!");
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const res = await fetch(`/api/clients?groupId=${selectedGroup}`);
            const data = await res.json();

            if (!res.ok) {
                setResults([]);
                toast.error("Failed to fetch clients!");
            } else {
                setResults(data.clients || []);
                setCurrentPage(1);
                if (!data.clients?.length) {
                    toast.warning("No clients found!");
                }
            }
        } catch (error) {
            console.error(error);
            setResults([]);
            toast.error("Failed to fetch clients!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <PageHeader />
            <h1 className="text-2xl font-bold">Search Client (Employee → Group)</h1>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] items-end">
                <div>
                    <p className="text-sm text-gray-500 mb-2">Choose an employee to load their groups.</p>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((employee) => (
                                <SelectItem key={employee._id} value={employee._id}>
                                    {employee.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className="text-sm text-gray-500 mb-2">Then select a group to view its client list.</p>
                    <Select
                        value={selectedGroup}
                        onValueChange={setSelectedGroup}
                        disabled={!groups.length}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.map((group) => (
                                <SelectItem key={group._id} value={group._id}>
                                    {group.groupName} {group.groupId ? `(${group.groupId})` : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleSearch} disabled={!selectedGroup || loading} className="min-w-[150px]">
                        {loading ? "Searching..." : "Search"}
                    </Button>
                    {results.length > 0 && (
                        <Button variant="outline" onClick={handleExport} className="min-w-[150px]">
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    )}
                </div>
            </div>

            {results.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Input
                        placeholder="Search clients by name or code..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="max-w-lg"
                    />
                    <p className="text-sm text-gray-500">{filteredResults.length} client(s) found</p>
                </div>
            )}

            {loading && <p className="text-center text-primary">Loading clients...</p>}

            {results.length > 0 && (
                <>
                    <Card className="p-4 space-y-4">
                        {paginatedResults.map((client) => (
                            <div
                                key={client._id}
                                className="border border-gray-200 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900">{client.name}</p>
                                    <p className="text-sm text-gray-500">{client.customerCode}</p>
                                    <p className="text-sm text-gray-500">{client.phone}</p>
                                </div>
                                <Button onClick={() => router.push(`/dashboard/client/${client._id}`)}>
                                    View
                                </Button>
                            </div>
                        ))}
                    </Card>

                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <p className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredResults.length)} of {filteredResults.length} clients
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </Button>
                                <Button variant="outline" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
                                    Next <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {searched && !loading && results.length === 0 && (
                <p className="text-center text-gray-500 mt-8">No clients found for this group.</p>
            )}
        </div>
    );
}
