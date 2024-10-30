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
    const iconClass = "fill-[#20201E] w-7 h-7 p-1";
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
        className="px-3 py-3 text-md flex flex-col bg-white text-black min-h-[70px] rounded-md w-[300px] border-[1px] border-[#ACACAC]"
        whileHover={{
          boxShadow:
            type === "NEXT"
              ? "0 0 6px 2px rgba(189, 255, 138, 0.5)"
              : type === "ANSWER"
              ? "0 0 6px 2px rgba(156, 149, 255, 0.5)"
              : "0 0 6px 2px rgba(197, 241, 255, 0.5)",
        }}
        animate={{
          boxShadow: isHovered
            ? type === "NEXT"
              ? "0 0 6px 2px rgba(189, 255, 138, 0.5)"
              : type === "ANSWER"
              ? "0 0 6px 2px rgba(156, 149, 255, 0.5)"
              : "0 0 6px 2px rgba(197, 241, 255, 0.5)"
            : "none",
          height: "auto",
          maxHeight: isHovered ? "200px" : "auto",
          transition: {
            height: {
              type: "spring",
              stiffness: 150,
              damping: 20,
              mass: 0.5,
            },
          },
        }}
        style={{
          overflow: "auto", // Changed from conditional to always auto
          height: "fit-content",
        }}
      >
        <div className="flex items-start w-full">
          <div className="flex items-start w-full">
            <span className="mr-3 flex-shrink-0 bg-gradient-to-br from-[#E4FEA5] via-[#C5F1FF] to-[#D1D1FE] p-1 mt-1 rounded-md">
              {getIcon()}
            </span>
            <div className="flex flex-col flex-grow min-w-0 w-full">
              <div className="uppercase font-medium break-words">{label}</div>
              <AnimatePresence mode="wait">
                {isHovered ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.04, 0.62, 0.23, 0.98],
                    }}
                    className="text-sm text-wrap text-[#828282] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar max-h-[120px]"
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
                    initial={{ opacity: 1, height: "auto" }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-wrap text-[#828282]"
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
