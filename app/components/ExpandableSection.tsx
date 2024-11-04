import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExpandableSectionProps {
  title: string;
  content?: React.ReactNode;
  description?: string;
  isNested?: boolean;
  generationType?: string;
  isLast?: boolean;
  defaultExpanded?: boolean;
  isCurrent?: boolean;
  isHovered?: boolean;
  isLoading?: boolean;
  action?: string;
}

export const ExpandableSection = ({
  title,
  content,
  description,
  isNested = false,
  generationType = "",
  isLast = false,
  defaultExpanded = true,
  isCurrent = false,
  isHovered = false,
  isLoading = false,
  action,
}: ExpandableSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getCircleLetter = (type: string) => {
    if (!type) return null;
    const firstLetter = type.charAt(0).toUpperCase();

    // Define default style for any letter
    let borderStyle = "border-2 border-transparent bg-clip-padding p-[1px] bg-[#6A6A72]";
    let textColor = "text-[#6A6A72]";

    // Override styles for specific letters
    if (firstLetter === "N") {
      borderStyle = "border-2 border-transparent bg-clip-padding p-[1px] bg-[#BDFF8A]";
      textColor = "text-[#BDFF8A]";
    } else if (firstLetter === "A") {
      borderStyle = "border-2 border-transparent bg-clip-padding p-[1px] bg-[#9C95FF]";
      textColor = "text-[#9C95FF]";
    } else if (firstLetter === "H") {
      borderStyle = "border-2 border-transparent bg-clip-padding p-[1px] bg-[#C5F1FF]";
      textColor = "text-[#C5F1FF]";
    }

    return (
      <div className={`rounded-full ${borderStyle}`}>
        <motion.div
          className={`w-7 h-7 rounded-full bg-[#20201E] flex items-center justify-center text-xs font-medium ${textColor}
            ${isCurrent ? "animate-pulse-shadow" : ""}`}
          animate={
            isHovered
              ? {
                  boxShadow:
                    firstLetter === "N"
                      ? "0 0 6px 2px rgba(189, 255, 138, 0.5)"
                      : firstLetter === "A"
                      ? "0 0 6px 2px rgba(156, 149, 255, 0.5)"
                      : firstLetter === "H"
                      ? "0 0 6px 2px rgba(197, 241, 255, 0.5)"
                      : "0 0 6px 2px rgba(106, 106, 114, 0.5)", // Default glow for other letters
                }
              : {}
          }
        >
          {firstLetter}
        </motion.div>
      </div>
    );
  };

  // For "next" type expandables
  const thinkingTitles = [
    "Hold on, I'm thinking...",
    "Creating a plan...",
    "Planning next steps...",
    "Working on it!",
  ];

  // For "answer" type expandables
  const answerTitles = [
    "I got the answer!",
    "Found it!",
    "Here's what I found!",
  ];

  // For "html" or code-related expandables
  const codeTitles = [
    "Generating code...",
    "Whipping up code...",
    "Writing some code...",
  ];

  const getExpandableTitle = (type: string) => {
    switch (type) {
      case "next":
        return thinkingTitles[0]; // "Thinking..."
      case "answer":
        return answerTitles[0]; // "Answer"
      case "html":
        return codeTitles[0]; // "Generated Code"
      default:
        return type;
    }
  };

  return (
    <div className={`${isNested ? "mb-1 ml-6" : "flex"}`}>
      {!isNested && (
        <div className="mr-4 flex flex-col items-center">
          <div className="mb-2">{getCircleLetter(generationType)}</div>
          {!isLast && <div className="w-[1px] bg-[#E5E7EB] flex-grow"></div>}
        </div>
      )}
      <div className={`flex-grow ${isNested ? "pl-4" : ""}`}>
        <div className="flex flex-col gap-0.5">
          <div className="bg-[#252522] px-4 py-2 rounded-md inline-block">
            <div className="flex flex-col mb-1">
              <div className="flex items-center gap-2 py-1">
                {(action || content) && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
                    ) : (
                      <path d="M13.1714 12.0001L8.22168 7.05029L9.63589 5.63608L15.9999 12.0001L9.63589 18.3641L8.22168 16.9499L13.1714 12.0001Z"></path>
                    )}
                  </svg>
                )}
                <span className="text-sm font-normal text-white  font-ibm">
                  {getExpandableTitle(title)}
                </span>
              </div>
              {description && (
                <p className="text-sm text-[#969696] py-0.5">{description}</p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  {/* Loading animation */}
                  <div className="flex items-center  justify-center font-Space uppercase text-sm text-[#6A6A72]">
                    <div className="animate-pulse">[generating visual]</div>
                  </div>

                  {/* Dimmed placeholders */}
                  {/* <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#6A6A72] rounded-sm opacity-50" />
                      <span className="text-sm text-[#6A6A72]">Action</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#6A6A72] rounded-sm opacity-50" />
                      <span className="text-sm text-[#6A6A72]">Input</span>
                    </div>
                  </div> */}
                </motion.div>
              ) : (
                (action || content) && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2"
                      >
                        {action && (
                          <div className="text-sm text-[#969696]">{action}</div>
                        )}
                        {content && (
                          <div className="text-sm text-[#969696] whitespace-pre-wrap font-mono">
                            {content}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
