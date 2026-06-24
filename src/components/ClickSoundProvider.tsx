"use client";

import { useEffect } from "react";
import { useClickSound } from "@/lib/useClickSound";

// selettore di ciò che consideriamo "cliccabile"
const INTERACTIVE = 'button, a, [role="button"], input[type="submit"], input[type="button"], label, summary, select, [data-sound]';

export default function ClickSoundProvider() {
    const play = useClickSound();

    useEffect(() => {
        function onPointerDown(e: PointerEvent) {
            const target = e.target as Element | null;
            if (!target) return;
            // risale gli antenati: se il click è su un'icona dentro un button, conta lo stesso
            if (target.closest(INTERACTIVE)) {
                play();
            }
        }
        // pointerdown invece di click: scatta subito al tocco, più reattivo su mobile
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [play]);

    return null; // non renderizza niente
}