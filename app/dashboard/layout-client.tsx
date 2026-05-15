"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Providers from "../providers";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Providers>
            <div className="h-screen flex flex-col overflow-hidden">
                {/* Navbar with Sidebar Toggle */}
                <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar for desktop and mobile */}
                    <div
                        className={`fixed z-40 top-[70px] left-0 h-[calc(100vh-70px)] w-64 bg-white border-r transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                        md:translate-x-0 md:block print:hidden`}
                    >
                        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                    </div>

                    {/* Overlay for mobile (dim background when sidebar open) */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/40 z-30 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Scrollable main content */}
                    <main
                        className={`flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8 mt-[70px] transition-all duration-300
                        ${sidebarOpen ? "blur-sm md:blur-0" : ""} 
                        md:ml-64`}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </Providers>
    );
}
