"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressItem } from "./ProgressItem";
import { Generation, ProgressProps } from "../types/progress";

// Constants
const VISIBLE_ITEMS = 3;

// Helper functions
const createInitialItem = () => {
  const item = {
    label: "START",
    description: "Type in the input field to start!",
    isHighlighted: true,
    isLast: true,
    type: "D",
    action: undefined,
  };
  console.log("Created initial item:", item);
  return item;
};

const mapGenerationToItem = (
  gen: Generation,
  index: number,
  length: number
) => {
  // Determine the type based on the generation content
  let type: string = "D"; // Default type

  if (gen.thought) {
    const thought = gen.thought.toLowerCase();
    if (thought.includes("api") || thought.includes("data")) {
      type = "R"; // RunCode for API calls
    } else if (thought.includes("verify") || thought.includes("check")) {
      type = "S"; // Save for verification steps
    } else if (thought.includes("search") || thought.includes("find")) {
      type = "G"; // Google for search operations
    }
  }

  const item = {
    label: gen.label || `Step ${index + 1}`, // Add a default label
    description: gen.thought,
    isHighlighted: index === length - 1 && !gen.isCompleted,
    isLast: index === length - 1,
    type: type, // Now we're explicitly setting a type
    action: gen.action,
  };
  console.log("Mapped generation item:", item);
  return item;
};

const Progress: React.FC<ProgressProps> = ({
  generations = [],
  hoveredGenerationId,
  setHoveredGenerationId,
}) => {
  console.log("Generations:", generations);

  // State declarations
  const [currentIndex, setCurrentIndex] = useState(0);
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
                isSummarized={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
export default Progress;
