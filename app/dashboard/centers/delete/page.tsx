"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Trash2, AlertTriangle, Building2, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Group {
    _id: string;
    groupId: string;
    groupName: string;
    totalMembers: number;
    employee: { name: string } | string;
    status: string;
}

export default function DeleteCenterPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [centers, setCenters] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<Group | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initial load of centers for the active branch
    useEffect(() => {
        if (session?.user?.activeBranch) {
            fetchCenters();
        }
    }, [session?.user?.activeBranch]);

    const fetchCenters = async (searchQuery = "") => {
        setLoading(true);
        try {
            const url = searchQuery 
                ? `/api/group/search?query=${searchQuery}` 
                : `/api/group?status=ACTIVE`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (res.ok) {
                // If it's the search API, it returns an array. 
                // If it's the list API, it returns { success: true, groups: [] }
                const groupsList = Array.isArray(data) ? data : (data.groups || []);
                setCenters(groupsList);
            } else {
                toast.error("Failed to fetch centers");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred while fetching centers");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCenters(query);
    };

    const handleDeleteClick = (center: Group) => {
        setSelectedCenter(center);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedCenter) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/group/${selectedCenter._id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("Center deleted successfully");
                setCenters(centers.filter(c => c._id !== selectedCenter._id));
                setIsDeleteDialogOpen(false);
            } else {
                toast.error(data.error || "Failed to delete center");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred during deletion");
        } finally {
            setIsDeleting(false);
            setSelectedCenter(null);
        }
    };

    return (
        <section className="max-w-6xl mx-auto space-y-8 p-6">
            <PageHeader />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Delete Center</h1>
                    <p className="text-gray-500 mt-1">Search and permanently remove centers from the system.</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Deletion is only possible if no active clients are assigned.</span>
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by Center Name or ID..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 h-11 rounded-xl shadow-sm border-gray-200 focus:ring-red-500"
                    />
                </div>
                <Button type="submit" className="h-11 px-8 rounded-xl bg-gray-900 hover:bg-gray-800" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </Button>
                {query && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="h-11 rounded-xl"
                        onClick={() => { setQuery(""); fetchCenters(); }}
                    >
                        Reset
                    </Button>
                )}
            </form>

            {/* Centers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {centers.length > 0 ? (
                    centers.map((center) => (
                        <Card key={center._id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow group">
                            <CardContent className="p-0">
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            {center.groupId}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {center.groupName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                            <Users className="w-4 h-4" />
                                            <span>{center.totalMembers} Members</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t flex items-center justify-between">
                                        <div className="text-xs text-gray-400">
                                            Collector: <span className="text-gray-600 font-medium">
                                                {typeof center.employee === 'object' ? center.employee.name : 'Unassigned'}
                                            </span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                            onClick={() => handleDeleteClick(center)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No centers found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or check another branch.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete <span className="font-bold text-gray-900">"{selectedCenter?.groupName}"</span>? 
                            This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="rounded-xl bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? "Deleting..." : "Permanently Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
