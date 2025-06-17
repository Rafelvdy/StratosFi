'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type CountUpProps = {
    to: number;
    duration?: number;
};

export default function CountUp({ to, duration = 1 }: CountUpProps) {
    const numberRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!numberRef.current) return;

        const el = numberRef.current;

        const obj = { val: 0 };

        const trigger = ScrollTrigger.create({
            trigger: el,
            start: "top 90%",
            onEnter: () => {
                gsap.to(obj, {
                    val: to,
                    duration: duration,
                    ease: "power1.Out",
                    onUpdate: () => {
                        if (el) el.textContent = Math.floor(obj.val).toString();
                },
            });
        },
    });

    return () => {
        trigger.kill();
    };
    }, [to, duration]);

    return <span ref={numberRef}></span>;
}