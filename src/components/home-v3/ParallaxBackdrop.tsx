"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Photo behind a rounded navy panel that drifts slower than the page as you
 * scroll, under a navy overlay that keeps the panel's text readable.
 * Fills its nearest positioned parent; still for visitors who prefer reduced motion.
 */
export function ParallaxBackdrop({ src, position = "center" }: { src: string; position?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute inset-x-0 -bottom-[15%] -top-[15%]" style={reduceMotion ? undefined : { y }}>
        <Image src={src} alt="" fill sizes="100vw" quality={75} className="object-cover" style={{ objectPosition: position }} />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(8,20,40,0.94)_0%,rgba(8,20,40,0.86)_45%,rgba(8,20,40,0.7)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,40,0.35)_0%,transparent_30%,transparent_70%,rgba(8,20,40,0.5)_100%)]" />
    </div>
  );
}
