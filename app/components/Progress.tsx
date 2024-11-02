"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressItem } from "./ProgressItem";
import {
  Generation,
  ProgressProps,
  SummarizedGeneration,
} from "../types/progress";

// Constants
const VISIBLE_ITEMS = 3;

// Helper functions
const createInitialItem = () => ({
  label: "START",
  description: "Type in the input field to start!",
  isHighlighted: true,
  isLast: true,
  type: "OTHER" as const,
  action: undefined,
});

const mapGenerationToItem = (
  gen: Generation,
  index: number,
  length: number
) => ({
  label: gen.label,
  description: gen.thought,
  isHighlighted: index === length - 1 && !gen.isCompleted,
  isLast: index === length - 1,
  type: (gen.label || "OTHER").toUpperCase() as "NEXT" | "ANSWER" | "HTML" | "OTHER",
  action: gen.action,
});

const Progress: React.FC<ProgressProps> = ({
  generations = [],
  hoveredGenerationId,
  setHoveredGenerationId,
}) => {
  // State declarations
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summarizedGenerations, setSummarizedGenerations] = useState<
    SummarizedGeneration[]
  >([]);
  const nodeRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Derived values
  const items =
    generations.length > 0
      ? generations.map((gen, index) =>
          mapGenerationToItem(gen, index, generations.length)
        )
      : [createInitialItem()];
  const totalItems = items.length;
  const displayedItems = items.slice(
    currentIndex,
    currentIndex + VISIBLE_ITEMS
  );

  // Callbacks
  const summarizeDescription = useCallback(async (description: string) => {
    if (!description) {
      console.error("Empty description provided for summarization");
      return "No description available";
    }

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.summary || description;
    } catch (error) {
      console.error("Error summarizing description:", error);
      return description;
    }
  }, []);

  const handleHover = (index: number) => {
    setHoveredGenerationId(currentIndex + index);
  };

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scrollUp = e.deltaY < 0;
    const newIndex = scrollUp
      ? Math.max(0, currentIndex - 1)
      : Math.min(totalItems - VISIBLE_ITEMS, currentIndex + 1);

    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  };

  // Effects
  useEffect(() => {
    if (generations.length > 3) {
      setCurrentIndex(generations.length - 3);
    }
  }, [generations.length]);

  useEffect(() => {
    const latestGeneration = generations[generations.length - 1];
    if (!latestGeneration?.thought) return;

    const isAlreadySummarized = summarizedGenerations.some(
      (g) => g.label === latestGeneration.label
    );

    if (!isAlreadySummarized) {
      summarizeDescription(latestGeneration.thought).then((summary) => {
        setSummarizedGenerations((prev) => [
          ...prev,
          {
            ...latestGeneration,
            summarizedDescription: summary,
            isSummarized: true,
          },
        ]);
      });
    }
  }, [generations, summarizeDescription, summarizedGenerations]);

  useEffect(() => {
    if (hoveredGenerationId >= 0) {
      if (hoveredGenerationId < currentIndex) {
        setCurrentIndex(hoveredGenerationId);
      } else if (hoveredGenerationId >= currentIndex + VISIBLE_ITEMS) {
        setCurrentIndex(
          Math.min(
            hoveredGenerationId - VISIBLE_ITEMS + 1,
            totalItems - VISIBLE_ITEMS
          )
        );
      }
    }
  }, [hoveredGenerationId, currentIndex, totalItems]);

  // Render
  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-[#FFFFFF] relative overflow-hidden ">
      <div
        className="absolute left-1/2 top-0 bottom-0 w-[1.2px] transform -translate-x-1/2"
        style={{ background: "#DADADA" }}
      />
      <motion.div
        className="space-y-32 flex flex-col items-center min-h-[384px]"
        onWheel={handleScroll}
        animate={{ y: -currentIndex * 128 }}
        transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.5 }}
      >
        <AnimatePresence mode="popLayout">
          {displayedItems.map((item, index) => (
            <motion.div
              key={currentIndex + index}
              ref={(el) => {
                nodeRefs.current[index] = el;
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                delay: index * 0.1,
              }}
            >
              <ProgressItem
                label={item.label}
                description={item.description}
                isHighlighted={item.isHighlighted}
                isLast={item.isLast}
                isHovered={hoveredGenerationId === currentIndex + index}
                onHover={handleHover}
                index={index}
                type={item.type}
                action={item.action}
                summarizedDescription={
                  summarizedGenerations.find((g) => g.label === item.label)
                    ?.summarizedDescription
                }
                isSummarized={
                  summarizedGenerations.find((g) => g.label === item.label)
                    ?.isSummarized || false
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
export default Progress;
