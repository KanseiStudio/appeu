"use client";

import { useCallback, useRef } from "react";

export function useClickSound() {
    const ctxRef = useRef<AudioContext | null>(null);

    return useCallback(() => {
        // niente audio lato server o se l'utente non ha ancora interagito
        if (typeof window === "undefined") return;

        // AudioContext creato pigramente al primo click (policy autoplay dei browser)
        if (!ctxRef.current) {
            const AC = window.AudioContext || (window as any).webkitAudioContext;
            if (!AC) return;
            ctxRef.current = new AC();
        }
        const ctx = ctxRef.current;
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // click corto e secco
        osc.type = "square";
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.005); // attacco
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06); // decay

        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
    }, []);
}