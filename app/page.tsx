"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Progress from "./components/Progress";
import Chat from "./components/Chat";
import { Generation } from "./types/progress";
import Image from "next/image";

export default function Home() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [hoveredGenerationId, setHoveredGenerationId] = useState(-1);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Hide intro after 2 seconds
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-white z-50"
          >
            <Image
              src="/wordware.png"
              alt="Wordware Logo"
              width={400}
              height={200}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 2.5 }}
        className="w-full h-screen flex flex-col bg-white"
      >
        <motion.div
          initial={{ x: "-50%", y: "-50%", left: "50%", top: "50%" }}
          animate={{ x: 0, y: 0, left: "24px", top: "24px" }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 2.8 }}
          className="fixed flex items-center gap-2 z-10"
        ></motion.div>

        <div className="w-full h-screen flex flex-row overflow-hidden">
          <section className="hidden md:block md:w-1/2 h-full overflow-hidden">
            <Progress
              generations={generations}
              hoveredGenerationId={hoveredGenerationId}
              setHoveredGenerationId={setHoveredGenerationId}
            />
          </section>
          <section className="w-full md:w-1/2 h-full overflow-y-auto  border-[#969696] ">
            <Chat
              generations={generations}
              setGenerations={setGenerations}
              hoveredGenerationId={hoveredGenerationId}
              setHoveredGenerationId={setHoveredGenerationId}
            />
          </section>
        </div>
      </motion.div>
    </>
  );
}
