import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Page Not Found</h2>
            <p className="text-gray-500 mb-6 max-w-md">
                The page you are looking for doesn’t exist or has been moved.
            </p>
            <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Back to Dashboard
                </Button>
            </Link>
        </div>
    );
}
