import DemandSheetPrintPage from "@/components/Print/DemandSheet";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DemandSheetPrintPage />
        </Suspense>
    );
}