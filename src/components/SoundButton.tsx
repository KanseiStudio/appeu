"use client";

import { useClickSound } from "@/lib/useClickSound";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function SoundButton({ onClick, ...props }: Props) {
    const play = useClickSound();
    return (
        <button
            {...props}
            onClick={(e) => {
                play();
                onClick?.(e);
            }}
        />
    );
}