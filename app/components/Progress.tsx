"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Generation {
  label: string;
  thought: string;
  isCompleted?: boolean;
  action?: string; // Add this line
}

interface ProgressProps {
  generations: Generation[];
}

interface ProgressItemProps {
  label: string;
  description: string;
  isHighlighted: boolean;
  isLast: boolean;
  isHovered: boolean;
  onHover: (index: number) => void;
  index: number;
  type: "START" | "NEXT" | "ANSWER" | "HTML" | "OTHER";
  action?: string; // Add this line
}

interface SummarizedGeneration extends Generation {
  summarizedDescription?: string;
  isSummarized: boolean;
}

const ProgressItem: React.FC<
  ProgressItemProps & { summarizedDescription?: string; isSummarized: boolean }
> = ({
  label,
  description,
  summarizedDescription,
  isSummarized,
  isHighlighted,
  isLast,
  isHovered,
  onHover,
  index,
  type,
  action,
}) => {
  const getIcon = () => {
    const iconClass = "fill-white w-7 h-7 p-1"; // Square SVG with white fill
    switch (type) {
      case "NEXT":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass}
          >
            <path d="M13.0001 16.1716L18.3641 10.8076L19.7783 12.2218L12.0001 20L4.22192 12.2218L5.63614 10.8076L11.0001 16.1716V4H13.0001V16.1716Z"></path>
          </svg>
        );
      case "ANSWER":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass}
          >
            <path d="M11.602 13.7599L13.014 15.1719L21.4795 6.7063L22.8938 8.12051L13.014 18.0003L6.65 11.6363L8.06421 10.2221L10.189 12.3469L11.6025 13.7594L11.602 13.7599ZM11.6037 10.9322L16.5563 5.97949L17.9666 7.38977L13.014 12.3424L11.6037 10.9322ZM8.77698 16.5873L7.36396 18.0003L1 11.6363L2.41421 10.2221L3.82723 11.6352L3.82604 11.6363L8.77698 16.5873Z"></path>
          </svg>
        );
      case "HTML":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass}
          >
            <path d="M24 12L18.3431 17.6569L16.9289 16.2426L21.1716 12L16.9289 7.75736L18.3431 6.34315L24 12ZM2.82843 12L7.07107 16.2426L5.65685 17.6569L0 12L5.65685 6.34315L7.07107 7.75736L2.82843 12ZM9.78845 21H7.66009L14.2116 3H16.3399L9.78845 21Z"></path>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass}
          >
            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM13 12H16L12 16L8 12H11V8H13V12Z" />
          </svg>
        );
    }
  };

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(-1)}
    >
      <motion.div
        className={`px-3 py-3 text-md flex flex-col items-center bg-white text-black rounded-lg transition-shadow duration-200 ease-in-out max-w-[280px] border border-gray-200`}
        whileHover={{
          boxShadow: "0 0 6px 2px rgba(84, 142, 40, 0.25)", // Changed from 0.3 to 0.15
        }}
      >
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center">
            <span className="mr-3 flex-shrink-0 bg-[#548E28] p-1 rounded-md">
              {getIcon()}
            </span>
            <div className="flex flex-col flex-grow min-w-0">
              <div className="uppercase font-medium truncate">{label}</div>
              <div className="text-sm truncate">
                {isSummarized ? summarizedDescription : description}
              </div>
            </div>
          </div>
        </div>
        {action && (
          <div className="text-xs mt-1 text-center w-full truncate">
            Action: {action}
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-full mt-2 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-[280px] overflow-hidden"
          >
            <p className="text-sm text-black text-center">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Progress: React.FC<ProgressProps> = ({ generations = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summarizedGenerations, setSummarizedGenerations] = useState<
    SummarizedGeneration[]
  >([]);

  const summarizeDescription = useCallback(async (description: string) => {
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize description");
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error("Error summarizing description:", error);
      return description; // Return the original description if summarization fails
    }
  }, []);

  useEffect(() => {
    const summarizeNewGenerations = async () => {
      const newGenerations = generations.slice(summarizedGenerations.length);
      if (newGenerations.length > 0) {
        const newSummarizedGenerations = await Promise.all(
          newGenerations.map(async (gen) => ({
            ...gen,
            summarizedDescription: await summarizeDescription(gen.thought),
            isSummarized: true,
          }))
        );
        setSummarizedGenerations((prev) => [
          ...prev.map((g) => ({ ...g, isSummarized: true })),
          ...newSummarizedGenerations,
        ]);
      }
    };

    summarizeNewGenerations();
  }, [generations, summarizedGenerations.length, summarizeDescription]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (generations.length > 3) {
      setCurrentIndex(generations.length - 3);
    }
  }, [generations.length]);

  const handleHover = (index: number) => {
    setHoveredIndex(index);
  };

  const items =
    generations.length > 0
      ? generations.map((gen, index) => ({
          label: gen.label,
          description: gen.thought,
          isHighlighted: index === generations.length - 1 && !gen.isCompleted,
          isLast: index === generations.length - 1,
          type: gen.label.toUpperCase() as "NEXT" | "ANSWER" | "HTML" | "OTHER",
          action: gen.action, // Add this line
        }))
      : [
          {
            label: "START",
            description: "Initial state",
            isHighlighted: true,
            isLast: true,
            type: "OTHER",
            action: undefined, // Add this line
          },
        ];

  const totalItems = items.length;
  const visibleItems = 3;

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY > 0 && currentIndex < totalItems - visibleItems) {
      setCurrentIndex((prev) => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const getNodePosition = (index: number) => {
    return (index / (visibleItems - 1)) * 100;
  };

  if (!isMounted) {
    return null;
  }

  const displayedItems = items.slice(currentIndex, currentIndex + visibleItems);

  return (
    <div className="w-full h-full flex flex-col justify-center  items-center bg-[#FDFAF5] relative overflow-hidden dotted-background">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#969696] transform -translate-x-1/2">
        <div
          className="absolute top-0 left-0 w-0.5 transition-all duration-300 ease-in-out"
          style={{
            height:
              hoveredIndex >= 0 ? `${getNodePosition(hoveredIndex)}%` : "0%",
            background: "linear-gradient(to bottom, #1a5d1a, #8fce00)",
          }}
        ></div>
      </div>
      <div
        className="space-y-32 flex flex-col items-center"
        onWheel={handleScroll}
      >
        {displayedItems.map((item, index) => (
          <ProgressItem
            key={currentIndex + index}
            label={item.label}
            description={item.description}
            isHighlighted={item.isHighlighted}
            isLast={item.isLast}
            isHovered={hoveredIndex === index}
            onHover={handleHover}
            index={index}
            type={item.type}
            action={item.action} // Add this line
            summarizedDescription={
              summarizedGenerations.find((g) => g.label === item.label)
                ?.summarizedDescription
            }
            isSummarized={
              summarizedGenerations.find((g) => g.label === item.label)
                ?.isSummarized
            }
          />
        ))}
      </div>
      {/* Remove or comment out the following block to remove the indicator */}
      {/*
      {totalItems > visibleItems && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-1 h-1/2 bg-gray-200 rounded-full">
          <div
            className="absolute top-0 left-0 w-full bg-gray-400 rounded-full transition-all duration-300 ease-in-out"
            style={{
              height: `${(visibleItems / totalItems) * 100}%`,
              top: `${(currentIndex / (totalItems - visibleItems)) * 100}%`,
            }}
          ></div>
        </div>
      )}
      */}
    </div>
  );
};

export default Progress;
