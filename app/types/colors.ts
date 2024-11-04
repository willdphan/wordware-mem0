export type ColorMapping = Record<string, { border: string; text: string }>;

export const defaultColorMap: ColorMapping = {
  D: {
    border: "border-2 border-transparent bg-clip-padding p-[1px] bg-[#BDFF8A]",
    text: "text-[#BDFF8A]",
  },
  R: {
    border: "border-2 border-transparent bg-clip-padding p-[1px] bg-[#9C95FF]",
    text: "text-[#9C95FF]",
  },
  S: {
    border: "border-2 border-transparent bg-clip-padding p-[1px] bg-[#C5F1FF]",
    text: "text-[#C5F1FF]",
  },
  G: {
    border: "border-2 border-transparent bg-clip-padding p-[1px] bg-[#FF8A8A]",
    text: "text-[#FF8A8A]",
  },
}; 