import PageHeader from "@/components/PageHeader";

export default function UnauthorizedPage() {
    return (
        <main className="max-w-7xl mx-auto">
            <PageHeader />
            <div className="flex flex-col items-center justify-center text-red-600 pt-30">
                <h1 className="text-3xl font-bold mb-4">Unauthorized Access</h1>
                <p className="text-lg text-gray-600">
                    You do not have permission to view this page.
                </p>
            </div>
        </main>
    );
}
