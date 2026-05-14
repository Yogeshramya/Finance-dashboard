"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Menu, Bell } from "lucide-react"
import { Branch } from "@/types/next-auth";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {

    const { data: session, update } = useSession();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState("");

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    /* ---------------- LOAD BRANCHES ---------------- */

    useEffect(() => {

        const loadBranches = async () => {

            try {

                const res = await fetch("/api/branches/list");
                const data = await res.json();

                let availableBranches: Branch[] = [];

                if (session?.user?.role === "ADMINISTRATOR") {
                    availableBranches = data.branches || [];
                }

                if (session?.user?.role === "AREA_MANAGER") {
                    availableBranches = session.user.branches || [];
                }

                setBranches(availableBranches);

                if (session?.user?.activeBranch?._id) {
                    setSelectedBranch(session.user.activeBranch._id);
                } else if (availableBranches.length > 0) {
                    setSelectedBranch(availableBranches[0]._id);
                }

            } catch (error) {
                console.error("Failed to fetch branches:", error);
            }

        };

        loadBranches();

    }, [session]);

    /* ---------------- BRANCH SWITCH ---------------- */

    const handleBranchChange = async (branchId: string) => {

        setSelectedBranch(branchId);

        const selectedBranchObj = branches.find(b => b._id === branchId);

        await update({
            user: {
                ...session?.user,
                activeBranch: selectedBranchObj ?? null,
            },
        });

        window.location.reload();
    };

    const canSwitchBranch =
        session?.user?.role === "ADMINISTRATOR" ||
        session?.user?.role === "AREA_MANAGER";

    return (

        <nav className="fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 md:px-6 z-50 print:hidden">

            {/* Left */}

            <div className="flex items-center space-x-3">

                <button
                    className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={onMenuClick}
                >
                    <Menu className="w-6 h-6" />
                </button>

                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={38}
                    height={38}
                    className="rounded-md"
                />

                <h1 className="text-lg md:text-xl font-semibold text-gray-800">
                    FinoraX
                </h1>

            </div>

            {/* Right */}

            <div className="hidden md:flex items-center space-x-4">

                {session?.user && (
                    <span className="text-sm text-gray-600">
                        Welcome,{" "}
                        <span className="font-medium text-gray-800">
                            {session.user.name}
                        </span>
                    </span>
                )}

                {/* Notifications */}
                <button className="relative p-2 rounded-md text-gray-700 hover:bg-gray-100">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
                </button>

                {/* Branch Section */}

                {session?.user && (

                    canSwitchBranch ? (

                        <select
                            className="rounded border border-gray-300 px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500"
                            value={selectedBranch}
                            onChange={(e) => handleBranchChange(e.target.value)}
                        >

                            {branches.map((branch) => (

                                <option key={branch._id} value={branch._id}>
                                    {branch.name}
                                </option>

                            ))}

                        </select>

                    ) : (

                        <span className="text-sm font-semibold px-3 py-1 bg-gray-100 rounded-lg text-gray-700">
                            {session.user.branch?.name}
                        </span>

                    )
                )}

                <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}