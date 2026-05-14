"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LoadingOverlay({ show }: { show: boolean }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <DotLottieReact src="/Loading.lottie" loop autoplay style={{ width: "150px", height: "150px" }} />
        </div>
    );
}
