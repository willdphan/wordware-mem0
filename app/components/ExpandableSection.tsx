import { useState } from "react";
import { motion } from "framer-motion";

export const ExpandableSection: React.FC<{
  title: string;
  content: React.ReactNode;
  isNested?: boolean;
  generationType?: string;
  isLast?: boolean;
  defaultExpanded?: boolean;
  isCurrent?: boolean;
  isHovered?: boolean;
}> = ({
  title,
  content,
  isNested = false,
  generationType = "",
  isLast = false,
  defaultExpanded = true,
  isCurrent = false,
  isHovered = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getCircleLetter = (type: string) => {
    if (!type) return null;
    const firstLetter = type.charAt(0).toUpperCase();

    // Define gradient borders based on letter
    let borderStyle = "";
    let textColor = "";
    if (firstLetter === "N") {
      borderStyle =
        "border-2 border-transparent bg-clip-padding p-[1px] bg-gradient-to-b from-[#BDFF8A] to-[#54713E]";
      textColor = "text-[#BDFF8A]";
    } else if (firstLetter === "A") {
      borderStyle =
        "border-2 border-transparent bg-clip-padding p-[1px] bg-gradient-to-b from-[#9C95FF] to-[#4A477A]";
      textColor = "text-[#9C95FF]";
    } else if (firstLetter === "H") {
      borderStyle =
        "border-2 border-transparent bg-clip-padding p-[1px] bg-gradient-to-b from-[#C5F1FF] to-[#53686F]";
      textColor = "text-[#C5F1FF]";
    }

    return (
      <div className={`rounded-full ${borderStyle}`}>
        <motion.div
          className={`w-7 h-7 rounded-full bg-[#20201E] flex items-center justify-center text-xs font-medium ${textColor}
            ${isCurrent ? "animate-pulse-shadow" : ""}`}
          animate={
            isHovered ? { 
              boxShadow: firstLetter === "N"
                ? "0 0 6px 2px rgba(189, 255, 138, 0.5)"
                : firstLetter === "A"
                ? "0 0 6px 2px rgba(156, 149, 255, 0.5)"
                : "0 0 6px 2px rgba(197, 241, 255, 0.5)"
            } : {}
          }
        >
          {firstLetter}
        </motion.div>
      </div>
    );
  };

  return (
    <div className={`${isNested ? "mb-4 ml-6" : "flex"}`}>
      {!isNested && (
        <div className="mr-4 flex flex-col items-center">
          <div className="mb-2">{getCircleLetter(generationType)}</div>
          {!isLast && <div className="w-[1px] bg-[#E5E7EB] flex-grow"></div>}
        </div>
      )}
      <div className={`flex-grow ${isNested ? "pl-4" : ""}`}>
        <div
          className="flex items-center cursor-pointer rounded-md p-2 hover:bg-[#FDFAF5] transition-colors duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="mr-2 w-4 h-4 flex-shrink-0">
            {isExpanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path>
              </svg>
            )}
          </span>
          <p className="text-sm font-normal text-white">{title}</p>
        </div>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-2 text-[#538E28]"
          >
            {content}
          </motion.div>
        )}
      </div>
    </div>
  );
};
