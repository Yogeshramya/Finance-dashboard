"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PageHeader() {
    const router = useRouter();
    const pathname = usePathname();

    const segments = pathname.split("/").filter(Boolean);

    return (
        <div className="flex items-center justify-between border-b pb-4 mb-6 print:hidden">
            {/* Back Button */}
            <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-1 bg-gray-900 text-white hover:text-gray-900"
                onClick={() => router.back()}
            >
                <ChevronLeft className="h-4 w-4" />
                Back
            </Button>

            {/* Advanced Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-600">
                {segments.map((seg, index) => {
                    const path = "/" + segments.slice(0, index + 1).join("/");
                    const isLast = index === segments.length - 1;
                    const label = seg.charAt(0).toUpperCase() + seg.slice(1);

                    return (
                        <div key={path} className="flex items-center gap-2">
                            {!isLast ? (
                                <Link
                                    href={path}
                                    className="hover:text-primary transition-colors"
                                >
                                    {label}
                                </Link>
                            ) : (
                                <span className="font-medium text-gray-900 underline underline-offset-2 decoration-2 decoration-primary">
                                    {label}
                                </span>
                            )}

                            {!isLast && (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
