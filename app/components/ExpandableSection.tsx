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
  onHover?: (isHovered: boolean) => void;
  isHighlighted?: boolean;
}

type ColorMapKey = "D" | "R" | "S" | "G" | "default";

const glowColorMap: Record<ColorMapKey, string> = {
  D: "rgba(189, 255, 138, 0.5)", // #BDFF8A
  R: "rgba(156, 149, 255, 0.5)", // #9C95FF
  S: "rgba(197, 241, 255, 0.5)", // #C5F1FF
  G: "rgba(255, 138, 138, 0.5)", // #FF8A8A
  default: "rgba(106, 106, 114, 0.5)", // #6A6A72
};

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  content,
  description,
  isNested = false,
  generationType = "",
  isLast = false,
  defaultExpanded = false,
  isCurrent = false,
  isHovered = false,
  isLoading = false,
  action,
  onHover,
  isHighlighted,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof title === "string") {
      const lowerTitle = title.toLowerCase();
      // Keep these sections closed by default
      if (
        lowerTitle.includes("action") ||
        lowerTitle.includes("input") ||
        lowerTitle.includes("observation") ||
        lowerTitle.includes("answer") ||
        lowerTitle.includes("code") ||
        lowerTitle.includes("summary")
      ) {
        return false;
      }
    }
    return defaultExpanded;
  });

  const getCircleLetter = (type: string) => {
    if (!type) return null;
    // Get the first letter of the generation type
    const firstLetter = type.charAt(0).toUpperCase();

    // Define default style for any letter
    let borderStyle =
      "border-2 border-transparent bg-clip-padding p-[1px] bg-[#6A6A72]";
    let textColor = "text-[#6A6A72]";

    // Map generation types to their respective colors
    const colorMap: Record<string, { border: string; text: string }> = {
      D: {
        // done
        border:
          "border-2 border-transparent bg-clip-padding p-[1px] bg-[#BDFF8A]",
        text: "text-[#BDFF8A]",
      },
      R: {
        // runcode
        border:
          "border-2 border-transparent bg-clip-padding p-[1px] bg-[#9C95FF]",
        text: "text-[#9C95FF]",
      },
      S: {
        // save
        border:
          "border-2 border-transparent bg-clip-padding p-[1px] bg-[#C5F1FF]",
        text: "text-[#C5F1FF]",
      },
      G: {
        // Google search
        border:
          "border-2 border-transparent bg-clip-padding p-[1px] bg-[#FF8A8A]",
        text: "text-[#FF8A8A]",
      },
    };

    // If the letter exists in our map, use those styles
    if (colorMap[firstLetter]) {
      borderStyle = colorMap[firstLetter].border;
      textColor = colorMap[firstLetter].text;
    }

    return (
      <div className={`rounded-full ${borderStyle}`}>
        <motion.div
          className={`w-7 h-7 rounded-full bg-[#20201E] flex items-center justify-center text-xs font-medium ${textColor}
            ${isCurrent ? "animate-pulse-shadow" : ""}`}
          animate={
            isHovered
              ? {
                  boxShadow: `0 0 6px 2px ${
                    glowColorMap[(firstLetter as ColorMapKey) || "default"] ||
                    glowColorMap.default
                  }`,
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
    <div
      className={`${isNested ? "mb-1 ml-6" : "flex"}`}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
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
                            {typeof content === "string"
                              ? content.replace(
                                  /```([\s\S]*?)```/g,
                                  (
                                    match,
                                    code
                                  ) => `<pre class="bg-[#1E1E1E] p-4 rounded-md overflow-x-auto my-2">
                                    <code class="text-[#D4D4D4] font-mono text-sm">${code}</code>
                                  </pre>`
                                )
                              : content}
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
