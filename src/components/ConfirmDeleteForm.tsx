"use client";

import { useState } from "react";

type Props = {
    action: (formData: FormData) => void | Promise<void>;
    hidden: Record<string, string>;
    label?: string;
    triggerClassName?: string;
    message?: string;
};

export default function ConfirmDeleteForm({
    action,
    hidden,
    label = "Elimina",
    triggerClassName = "text-xs text-red-500",
    message = "Sei sicuro?",
}: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
                {label}
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-xs rounded-2xl bg-white text-black p-5 space-y-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-center font-medium">{message}</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex-1 rounded-lg border py-2"
                            >
                                No
                            </button>
                            <form action={action} className="flex-1">
                                {Object.entries(hidden).map(([k, v]) => (
                                    <input key={k} type="hidden" name={k} value={v} />
                                ))}
                                <button type="submit" className="w-full rounded-lg bg-red-600 text-white py-2">
                                    Sì
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}