"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Generation, ChatProps } from "../types/progress";
import { ExpandableSection } from "./ExpandableSection";

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
    let allGenerations: Generation[] = [];

    function createEmptyGeneration(id: number): Generation {
      return {
        id: String(id),
        label: "RESPONSE",
        thought: "",
        steps: [],
        finalAnswer: "",
        isCompleted: false,
      };
    }

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

          try {
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              console.log("Parsed data:", data);

              if (
                data.type === "chunk" &&
                data.path === "loop (new)[0].answer"
              ) {
                const content = data.content?.trim() || "";

                // Helper function to create a new generation with a single field
                function createMarkerGeneration(
                  marker: string,
                  content: string
                ): Generation {
                  const newGen = createEmptyGeneration(allGenerations.length);
                  const cleanContent = content.replace(marker + ":", "").trim();

                  switch (marker.toLowerCase()) {
                    case "thought":
                      newGen.thought = cleanContent;
                      break;
                    case "action":
                      newGen.action = cleanContent;
                      break;
                    case "input":
                      newGen.input = cleanContent;
                      break;
                    case "observation":
                      newGen.observation = cleanContent;
                      break;
                    case "final answer":
                      newGen.finalAnswer = cleanContent;
                      newGen.isCompleted = true;
                      break;
                    default:
                      throw new Error(`Unknown marker: ${marker}`);
                  }
                  return newGen;
                }

                // Create new generation for ANY marker word
                if (
                  content.startsWith("Thought:") ||
                  content.startsWith("Action:") ||
                  content.startsWith("Input:") ||
                  content.startsWith("Observation:") ||
                  content.startsWith("Final Answer:")
                ) {
                  // Save current generation if it has content
                  if (
                    currentGeneration.thought ||
                    currentGeneration.steps.length > 0 ||
                    currentGeneration.finalAnswer
                  ) {
                    allGenerations.push({ ...currentGeneration });
                    currentGeneration = createEmptyGeneration(
                      allGenerations.length
                    );
                  }

                  // Set the appropriate field based on the marker
                  if (content.startsWith("Thought:")) {
                    currentGeneration.thought = content
                      .replace("Thought:", "")
                      .trim();
                  } else if (content.startsWith("Action:")) {
                    currentGeneration.steps.push({
                      action: content.replace("Action:", "").trim(),
                    });
                  } else if (content.startsWith("Input:")) {
                    currentGeneration.steps.push({
                      input: content.replace("Input:", "").trim(),
                    });
                  } else if (content.startsWith("Observation:")) {
                    currentGeneration.steps.push({
                      observation: content.replace("Observation:", "").trim(),
                    });
                  } else if (content.startsWith("Final Answer:")) {
                    currentGeneration.finalAnswer = content
                      .replace("Final Answer:", "")
                      .trim();
                    currentGeneration.isCompleted = true;
                  }
                } else {
                  // Append to the last appropriate field
                  if (currentGeneration.finalAnswer) {
                    currentGeneration.finalAnswer += " " + content;
                  } else if (currentGeneration.steps.length > 0) {
                    const currentStep =
                      currentGeneration.steps[
                        currentGeneration.steps.length - 1
                      ];
                    if (currentStep.observation)
                      currentStep.observation += " " + content;
                    else if (currentStep.input)
                      currentStep.input += " " + content;
                    else if (currentStep.action)
                      currentStep.action += " " + content;
                  } else if (currentGeneration.thought) {
                    currentGeneration.thought += " " + content;
                  }
                }

                // Always update generations with current state
                updateGenerations([...allGenerations, currentGeneration]);
              }
            }
          } catch (e) {
            console.error("Parse error:", e, "Raw JSON:", jsonStr);
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
            {generations.map((generation, index) => {
              return (
                <div
                  key={index}
                  className="pt-3"
                  onMouseEnter={() => setHoveredGenerationId(index)}
                  onMouseLeave={() => setHoveredGenerationId(-1)}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }} // Stagger effect based on index
                  >
                    <ExpandableSection
                      title={`${generation.label}`}
                      generationType={generation.label}
                      isLast={index === generations.length - 1}
                      defaultExpanded={true}
                      isCurrent={index === generations.length - 1}
                      isHovered={hoveredGenerationId === index}
                      content={
                        <div className="space-y-1 mt-0 mb-0 font-jakarta">
                          {generation.thought && (
                            <ExpandableSection
                              title="Thought"
                              content={
                                <p className="text-xs text-[#979797]">
                                  {generation.thought}
                                </p>
                              }
                              isNested
                              defaultExpanded={true}
                            />
                          )}
                          {generation.steps.map((step, stepIndex) => (
                            <div key={stepIndex}>
                              {step.action && (
                                <ExpandableSection
                                  title="Action"
                                  content={
                                    <p className="text-md text-[#969696] font-jakarta">
                                      {step.action}
                                    </p>
                                  }
                                  isNested
                                  defaultExpanded={true}
                                />
                              )}
                              {step.input && (
                                <ExpandableSection
                                  title="Input"
                                  content={
                                    <p className="text-md text-[#969696] font-jakarta">
                                      {step.input}
                                    </p>
                                  }
                                  isNested
                                  defaultExpanded={true}
                                />
                              )}
                              {step.observation && (
                                <ExpandableSection
                                  title="Observation"
                                  content={
                                    <p className="text-md text-[#969696] font-jakarta">
                                      {step.observation}
                                    </p>
                                  }
                                  isNested
                                  defaultExpanded={true}
                                />
                              )}
                            </div>
                          ))}
                          {generation.finalAnswer && (
                            <ExpandableSection
                              title="Final Answer"
                              content={
                                <p className="text-md text-[#969696] font-jakarta">
                                  {generation.finalAnswer}
                                </p>
                              }
                              isNested
                              defaultExpanded={true}
                            />
                          )}
                          {generation.isCompleted && (
                            <p className="text-green-600 mt-2 text-sm">
                              Completed
                            </p>
                          )}
                        </div>
                      }
                    />
                  </motion.div>
                </div>
              );
            })}
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
