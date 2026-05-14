"use client";

import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function GRTPage() {
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = "/grt_form_updated.pdf"; // from public folder
        link.download = "grt_form_updated.pdf";
        link.click();
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* ===== Page Header ===== */}
            <PageHeader />

            {/* ===== Content ===== */}
            <Card className="max-w-md mx-auto">
                <CardContent className="flex flex-col items-center gap-4 py-10">
                    <h1 className="text-xl font-semibold text-center">
                        GRT – Member Enrollment Form
                    </h1>

                    <p className="text-sm text-muted-foreground text-center">
                        Click below to download the latest GRT enrollment form.
                    </p>

                    <Button
                        onClick={handleDownload}
                        size="lg"
                        className="w-full flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download GRT Form
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
