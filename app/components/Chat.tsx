"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Generation, ChatProps } from "../types/progress";
import { ExpandableSection } from "./ExpandableSection";
import { parse } from "best-effort-json-parser";

// ... rest of the imports ...

const createEmptyGeneration = (id: number): Generation => ({
  id,
  thought: "",
  steps: [],
  finalAnswer: "",
  isCompleted: false,
});

const LoadingSpinner = () => (
  <motion.div
    className="h-6 w-6 border-2 border-white border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

const Chat: React.FC<ChatProps> = ({
  generations,
  setGenerations,
  hoveredGenerationId,
  setHoveredGenerationId,
}) => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Price of BTC?",
    "Price of ETH?",
    "UNI market cap?",
    "AAVE volume?",
  ];

  const updateGenerations = useCallback(
    (newGenerations: Generation[] | ((prev: Generation[]) => Generation[])) => {
      setGenerations(newGenerations);
    },
    [setGenerations]
  );

  function isNewMarker(content: string): boolean {
    const markers = [
      "Thought:",
      "Action:",
      "Input:",
      "Observation:",
      "Summary:",
      "Final Answer:",
      "FinalAnswer:",
      "Final answer:",
    ];

    // Trim and normalize the content
    const normalizedContent = content.trim();

    // Check if content starts with any marker, case insensitive
    return markers.some((marker) => {
      const normalizedMarker = marker.toLowerCase();
      return (
        normalizedContent.toLowerCase().startsWith(normalizedMarker) ||
        normalizedContent.toLowerCase().includes(`\n${normalizedMarker}`)
      );
    });
  }

  const handleSubmit = async () => {
    if (isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    // Start fresh
    setGenerations([]);

    let currentGeneration = createEmptyGeneration(0);
    let accumulatedContent = "";
    let generationCount = 0;

    try {
      const res = await fetch("/api/wordware", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive",
        },
        body: JSON.stringify({ inputs: { question } }),
        signal: abortControllerRef.current.signal,
        keepalive: true,
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const reader = res.body!.getReader();
      let currentData = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        currentData += chunk;

        const events = currentData.split("\n\nevent: ");
        currentData = events.pop() || "";

        for (const event of events) {
          const jsonStr = event
            .split("\n")
            .filter((line) => line.startsWith("data: "))
            .map((line) => line.replace("data: ", ""))
            .join("");

          if (!jsonStr) continue;

          try {
            const parsedData = parse(jsonStr);

            if (
              parsedData?.type === "chunk" &&
              parsedData?.path?.includes("answer")
            ) {
              accumulatedContent += parsedData.content || "";

              // Check if we're starting a new thought
              if (parsedData.content?.includes("Thought:") && currentGeneration.thought) {
                // Save current generation and start a new one
                setGenerations(prev => [...prev, currentGeneration]);
                generationCount++;
                currentGeneration = createEmptyGeneration(generationCount);
                accumulatedContent = parsedData.content;
              }

              // Process the accumulated content for markers
              const markers = {
                thought: "",
                action: "",
                observation: "",
                input: "",
                summary: "",
                "final answer": "",
              };

              // Split by newlines and look for markers
              const lines = accumulatedContent.split("\n");
              let currentMarker = "";

              for (const line of lines) {
                const markerMatch = line.match(
                  /^(Thought|Action|Observation|Final Answer|Input|Summary):\s*(.*)/i
                );

                if (markerMatch) {
                  currentMarker = markerMatch[1].toLowerCase();
                  const content = markerMatch[2].trim();
                  markers[currentMarker] = content;
                } else if (currentMarker && line.trim()) {
                  // Append to the current marker if it's a continuation line
                  markers[currentMarker] += "\n" + line;
                }
              }

              // Create steps array in the correct order
              const steps = [];
              if (markers.action) steps.push({ action: markers.action });
              if (markers.input) steps.push({ input: markers.input });
              if (markers.summary) steps.push({ summary: markers.summary });
              if (markers.observation) steps.push({ observation: markers.observation });

              // Update current generation
              currentGeneration = {
                ...currentGeneration,
                thought: markers.thought,
                steps: steps,
                finalAnswer: markers["final answer"],
                isCompleted: !!markers["final answer"],
              };

              // Update generations with current one
              setGenerations(prev => [...prev.slice(0, -1), currentGeneration]);
            }
          } catch (parseError) {
            console.error("Parse error:", parseError);
          }
        }
      }
    } catch (error) {
      console.error("Request error:", error);
    } finally {
      setIsLoading(false);
      setQuestion("");
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Add function to check if user is near bottom
  const isNearBottom = () => {
    if (!chatContainerRef.current) return false;

    const container = chatContainerRef.current;
    const threshold = 100; // pixels from bottom
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };

  // Scroll effect that watches both generations and isLoading
  useEffect(() => {
    if (chatContainerRef.current && (isLoading || isNearBottom())) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [generations, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-[#20201E] p-2">
      <div ref={chatContainerRef} className="flex-grow overflow-auto p-6">
        <div className="max-w-4xl mx-auto ">
          <h3 className="text-sm border-b-[1px] border-[#969696] mx-0 md:mx-3 pb-4 text-[#538E28] mb-3 mt-8 md:mt-0">
            <span className="uppercase text-[#857AEC] ">
              APP ID: b808405c-f9b3-4429-9426-ec57b1a97862
            </span>
          </h3>
          <div className="p-0 rounded-md">
            {generations.map((generation, index) => (
              <div key={index} className="pt-3">
                {/* Render Thought as the top-level expandable */}
                <ExpandableSection
                  title="Thought"
                  defaultExpanded={true}
                  content={
                    <div className="space-y-1">
                      {/* Content section */}
                      <ExpandableSection
                        key={`thought-content-${generation.id}`}
                        title="Content"
                        content={generation.thought}
                        defaultExpanded={true}
                        isNested={true}
                      />

                      {/* Steps section */}
                      {generation.steps.map((step, stepIndex) => {
                        const type = Object.keys(step)[0];
                        const content = step[type];

                        return (
                          <ExpandableSection
                            key={`${type}-${stepIndex}`}
                            title={type.charAt(0).toUpperCase() + type.slice(1)}
                            content={content}
                            defaultExpanded={true}
                            isNested={true}
                          />
                        );
                      })}

                      {/* Final Answer section */}
                      {generation.finalAnswer && (
                        <ExpandableSection
                          key={`final-answer-${generation.id}`}
                          title="Final Answer"
                          content={generation.finalAnswer}
                          defaultExpanded={true}
                          isNested={true}
                        />
                      )}
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-md">
            <div className="p-4">
              <div className="space-y-4">
                <motion.div
                  className="flex flex-wrap gap-2 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {suggestions.map((suggestion, index) => {
                    const hoverColors = [
                      "hover:bg-[#857AEC]", // purple
                      "hover:bg-[#C2F4FF]", // blue
                      "hover:bg-[#E4FEA5]", // green
                    ];
                    const hoverColor = hoverColors[index % 3];

                    return (
                      <motion.button
                        key={suggestion}
                        type="button"
                        onClick={() => setQuestion(suggestion)}
                        className={`px-3 py-1 text-sm text-white bg-[#252522] rounded-sm ${hoverColor} hover:text-black transition-colors`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                      >
                        {suggestion}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex items-center space-x-2 mt-2"
              >
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-grow border-[#373732] rounded-md border-[2px] py-3 px-3 focus:ring  focus:ring-opacity-50 placeholder:text-sm placeholder:text-[#969696] text-white text-sm bg-[#20201E]"
                  rows={1}
                  placeholder="Type your message here..."
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-3 rounded-md font-ibm text-md text-white bg-[#252522] hover:bg-[#E6FFA2] hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center min-w-[100px] transition-colors duration-200"
                >
                  {isLoading ? <LoadingSpinner /> : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
