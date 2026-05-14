"use client";
import { useState } from "react";
import { X, UploadCloud, Loader2 } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    folder: string;
}

export function FileUpload({ label, value, onChange, folder }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.success) onChange(data.url);
        } catch (err) {
            console.error("Upload error", err);
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = async () => {
        if (!value) return;
        const prevUrl = value;
        onChange(""); // Optimistic UI clear
        await fetch("/api/upload", {
            method: "DELETE",
            body: JSON.stringify({ url: prevUrl })
        });
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] bg-gray-50/50 hover:bg-gray-50 transition-colors relative">
                {value ? (
                    <div className="relative">
                        <Image src={value} alt="Preview" width={28} height={28} className="h-28 w-28 object-cover rounded-lg shadow-md border" />
                        <button
                            type="button"
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <label className="cursor-pointer flex flex-col items-center w-full h-full">
                        {isUploading ? (
                            <Loader2 className="animate-spin text-primary" size={24} />
                        ) : (
                            <>
                                <UploadCloud className="text-gray-400 mb-1" size={24} />
                                <span className="text-xs text-gray-500 font-medium">Click to upload</span>
                            </>
                        )}
                        <input type="file" className="hidden" onChange={handleFile} disabled={isUploading} accept="image/*" />
                    </label>
                )}
            </div>
        </div>
    );
}