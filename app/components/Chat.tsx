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
    setIsLoading(true);
    updateGenerations([]); // Reset generations at the start of a new query

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/wordware", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { question },
          version: "^3.4",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const content = JSON.parse(line);
              const value = content.value;

              if (value && typeof value === "object") {
                if (value.type === "generation") {
                  if (value.state === "start") {
                    console.log("New generation:", value);
                    updateGenerations((prev) => [
                      ...prev,
                      {
                        label: value.label || "",
                        thought: value.thought || "",
                        action: value.action || "",
                        input: value.input || "",
                      },
                    ]);
                  } else if (value.state === "end") {
                    updateGenerations((prev) =>
                      prev.map((gen, index) =>
                        index === prev.length - 1
                          ? { ...gen, isCompleted: true }
                          : gen
                      )
                    );
                  }
                } else if (value.type === "chunk") {
                  updateGenerations((prev) =>
                    prev.map((gen, index) =>
                      index === prev.length - 1
                        ? {
                            ...gen,
                            thought: gen.thought + (value.value ?? ""),
                            action: gen.action || value.action || "",
                            input: gen.input || value.input || "",
                          }
                        : gen
                    )
                  );
                }
              } else if (value.type === "chunk") {
                updateGenerations((prev) =>
                  prev.map((gen, index) =>
                    index === prev.length - 1
                      ? {
                          ...gen,
                          thought: gen.thought + (value.value ?? ""),
                          action: gen.action || value.action || "",
                          input: gen.input || value.input || "",
                        }
                      : gen
                  )
                );
              }
            } catch (error) {
              console.error("Error parsing chunk:", error);
            }
          }
        }

        buffer = lines[lines.length - 1];
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error:", error);
        setQuestion(
          "An error occurred while fetching the response. Are API keys set?"
        );
      }
    } finally {
      setIsLoading(false);
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
              let thoughtObj;
              try {
                thoughtObj = JSON.parse(generation.thought || "{}");
              } catch {
                thoughtObj = {
                  thought: generation.thought || "",
                  action: generation.action || "",
                  input: generation.input || "",
                };
              }

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
                        <div className="space-y-1 mt-0 mb-0 font-jakarta ">
                          {thoughtObj.thought && (
                            <p className="text-xs  text-[#979797] ">
                              {thoughtObj.thought.startsWith(
                                "<!DOCTYPE html"
                              ) ? (
                                <a
                                  href={`data:text/html;charset=utf-8,${encodeURIComponent(
                                    thoughtObj.thought
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#C2F4FF] hover:underline"
                                >
                                  View Generated HTML Page
                                </a>
                              ) : (
                                thoughtObj.thought
                              )}
                            </p>
                          )}
                          {thoughtObj.action && (
                            <ExpandableSection
                              title="Action"
                              content={
                                <p className="text-md text-[#969696] font-jakarta ">
                                  {thoughtObj.action}
                                </p>
                              }
                              isNested
                              defaultExpanded={false}
                            />
                          )}
                          {thoughtObj.input && (
                            <ExpandableSection
                              title="Input"
                              content={
                                <p className="text-md text-[#969696] font-jakarta">
                                  {thoughtObj.input}
                                </p>
                              }
                              isNested
                              defaultExpanded={false}
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
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      type="button"
                      onClick={() => setQuestion(suggestion)}
                      className="px-3 py-1 text-sm text-black bg-[#F6F4EE] rounded-sm hover:bg-gradient-to-br hover:from-[#E4FEA5] hover:via-[#C5F1FF] hover:to-[#D1D1FE] transition-colors"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
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
                  className="flex-grow border-[#969696] rounded-md border-[1px] py-3 px-3 focus:ring focus:ring-[#538E28] focus:ring-opacity-50 placeholder:text-sm placeholder:text-[#969696] text-white text-sm bg-[#20201E]"
                  rows={1}
                  placeholder="Type your message here..."
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-3 rounded-md font-ibm text-md text-white bg-black hover:bg-[#E6FFA2] hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center min-w-[100px] transition-colors duration-200"
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
