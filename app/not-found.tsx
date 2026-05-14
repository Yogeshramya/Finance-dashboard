"use client";

import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function GlobalNotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 text-center">
            <div className="w-80 h-80 mb-6">
                <DotLottieReact src="/404.lottie" loop autoplay />
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-2">Page Not Found</h1>
            <p className="text-gray-600 mb-6">
                The page you’re looking for doesn’t exist or may have been moved.
            </p>

            <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
                Back to Dashboard
            </Link>
        </main>
    );
}
