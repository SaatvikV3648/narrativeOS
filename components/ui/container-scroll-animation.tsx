'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: ReactNode;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.45, 1], [18, 8, 0]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.45, 1], [-3, -1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 0.45, 1], [90, 34, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.82, 0.92, 1]);

  return (
    <section ref={containerRef} className="relative h-[980px] overflow-hidden px-4 sm:h-[1120px] sm:px-6 lg:h-[1240px]">
      <div className="sticky top-24 mx-auto flex max-w-7xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 w-full text-center sm:mb-12"
        >
          {titleComponent}
        </motion.div>

        <motion.div
          style={{
            rotateX,
            rotateZ,
            translateY,
            scale,
            transformPerspective: 1200,
          }}
          className="relative mx-auto w-full max-w-6xl origin-top"
        >
          <div className="hero-preview-glow" />
          <div className="relative rounded-[30px] border border-white/14 bg-white/10 p-2 shadow-[0_38px_120px_rgba(15,23,42,0.52),0_0_90px_rgba(59,130,246,0.18)] backdrop-blur-xl sm:p-3">
            <div className="overflow-hidden rounded-[24px] border border-white/16 bg-white">
              <div className="flex h-10 items-center gap-2 border-b border-[#eaeaea] bg-[#fafafa] px-4">
                <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
                <span className="h-3 w-3 rounded-full bg-[#f7c948]" />
                <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                <div className="mx-auto hidden h-6 w-72 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[11px] font-semibold text-[#999999] sm:flex">
                  app.spikd.com/dashboard
                </div>
              </div>
              <div className="relative bg-white">
                <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-[linear-gradient(90deg,#4f46e5,#2563eb,#06b6d4)]" />
                {children}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
