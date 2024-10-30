"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Generation, ChatProps } from "../types/progress";
import { ExpandableSection } from "./ExpandableSection";

const Chat: React.FC<ChatProps> = ({
  generations,
  setGenerations,
  hoveredGenerationId,
  setHoveredGenerationId,
}) => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  return (
    <div className="flex flex-col h-screen bg-[#20201E]">
      <div className="flex-grow overflow-auto p-6 ">
        <div className="max-w-4xl mx-auto ">
          <h3 className="text-sm border-b-[1px] border-[#969696] mx-0 md:mx-3 pb-4 text-[#538E28] mb-3 mt-8 md:mt-0">
            <span className="uppercase text-[#457522] ">APP ID:</span>{" "}
            <motion.span
              initial={{ opacity: 1 }}
              animate={{
                opacity: [1, 0.7, 1, 0.9, 1],
                x: [0, 1, -1, 2, 0],
                y: [0, -1, 1, -1, 0],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 5,
              }}
              className=""
            >
              3db7ccbe-a884-4894-9540-c17a2fb43509
            </motion.span>
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
                  className="pt-2 "
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
                        <div className="space-y-1 mt-2 mb-5 font-jakarta">
                          {thoughtObj.thought && (
                            <p className="text-xs  text-[#979797]">
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
                                <p className="text-md text-white mt-2 font-ibm">
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
                                <p className="text-md text-white mt-2 font-ibm">
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
                      className="px-3 py-1 text-sm text-white bg-[#F6F4EE] rounded-full hover:text-white hover:bg-[#548E28] transition-colors"
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
                className="flex items-center space-x-4 mt-4"
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
                  className="px-4 py-3  rounded-md font-ibm text-md  text-white bg-black hover:bg-[#538E28] focus:outline-none focus:ring-2 focus:ring-offset-2 "
                >
                  {isLoading ? "Running..." : "Submit"}
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
