import { motion, AnimatePresence } from "framer-motion";
import { ProgressItemProps } from "../types/progress";

export const ProgressItem: React.FC<
  ProgressItemProps & { summarizedDescription?: string; isSummarized: boolean }
> = ({
  label,
  description,
  summarizedDescription,
  isSummarized,
  isHovered,
  onHover,
  index,
  type,
  action,
}) => {
  const getIcon = () => {
    const iconClass = (type: string) =>
      `w-7 h-7 p-1 ${
        type === "NEXT"
          ? "fill-[#9BB448]" // darker green
          : type === "ANSWER"
          ? "fill-[#857AEC]" // darker purple
          : "fill-[#59B7D3]" // darker blue
      }`;

    switch (type) {
      case "NEXT":
        return (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass(type)}
          >
            <motion.path
              d="M13.0001 16.1716L18.3641 10.8076L19.7783 12.2218L12.0001 20L4.22192 12.2218L5.63614 10.8076L11.0001 16.1716V4H13.0001V16.1716Z"
              initial={{ y: 0 }}
              animate={isHovered ? { y: [0, -2, 0] } : { y: 0 }}
              transition={{
                duration: 0.3,
                times: [0, 0.5, 1],
                ease: "easeInOut",
              }}
            />
          </motion.svg>
        );
      case "ANSWER":
        return (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass(type)}
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.path
              d="M11.602 13.7599L13.014 15.1719L21.4795 6.7063L22.8938 8.12051L13.014 18.0003L6.65 11.6363L8.06421 10.2221L10.189 12.3469L11.6025 13.7594L11.602 13.7599ZM11.6037 10.9322L16.5563 5.97949L17.9666 7.38977L13.014 12.3424L11.6037 10.9322ZM8.77698 16.5873L7.36396 18.0003L1 11.6363L2.41421 10.2221L3.82723 11.6352L3.82604 11.6363L8.77698 16.5873Z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.svg>
        );
      case "HTML":
        return (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass(type)}
          >
            <motion.path
              d="M24 12L18.3431 17.6569L16.9289 16.2426L21.1716 12L16.9289 7.75736L18.3431 6.34315L24 12ZM2.82843 12L7.07107 16.2426L5.65685 17.6569L0 12L5.65685 6.34315L7.07107 7.75736L2.82843 12ZM9.78845 21H7.66009L14.2116 3H16.3399L9.78845 21Z"
              animate={isHovered ? { rotate: [0, 5, -5, 0] } : { rotate: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </motion.svg>
        );
      default:
        return (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass(type)}
          >
            <motion.path
              d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM13 12H16L12 16L8 12H11V8H13V12Z"
              animate={isHovered ? { rotate: [0, 5, -5, 0] } : { rotate: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </motion.svg>
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
        className="px-7 py-7 text-md flex flex-col bg-[#efeeeb] text-black rounded-md w-[300px]"
        animate={{
          backgroundColor: isHovered ? "#e0dfdc" : "#efeeeb",
          height: isHovered ? 120 : 100,
          boxShadow: isHovered
            ? type === "NEXT"
              ? "0 0 6px 2px rgba(189, 255, 138, 0.2)"
              : type === "ANSWER"
              ? "0 0 6px 2px rgba(156, 149, 255, 0.2)"
              : "0 0 6px 2px rgba(197, 241, 255, 0.2)"
            : "none",
          transition: {
            height: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            },
            backgroundColor: { duration: 0.3 },
            boxShadow: { duration: 0.3 },
          },
        }}
        style={{
          overflow: "hidden",
        }}
      >
        <div className="flex items-start w-full">
          <div className="flex items-start w-full">
            <span
              className={`mr-3 flex-shrink-0 p-1 mt-1 rounded-md ${
                type === "NEXT"
                  ? "bg-[#E4FEA5]" // green
                  : type === "ANSWER"
                  ? "bg-[#D1D1FE]" // purple
                  : "bg-[#C5F1FF]" // blue for HTML/code and default
              }`}
            >
              {getIcon()}
            </span>
            <div className="flex flex-col flex-grow min-w-0 w-full">
              <div className="uppercase text-md font-normal font-ibm break-words">
                {label}
              </div>
              <AnimatePresence>
                {isHovered ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="text-xs  text-wrap text-[#9A9A9A] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar max-h-[120px] font-jakarta"
                  >
                    {(() => {
                      try {
                        const thoughtObj = JSON.parse(description || "{}");
                        return thoughtObj.thought || description;
                      } catch {
                        return description;
                      }
                    })()}
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-jakarta text-wrap text-[#828282]"
                  >
                    {isSummarized && summarizedDescription
                      ? summarizedDescription
                      : description}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {action && (
          <div className="text-xs mt-1 text-center w-full break-words">
            Action: {action}
          </div>
        )}
      </motion.div>
    </div>
  );
};
