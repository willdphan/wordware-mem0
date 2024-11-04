import { ColorMapping } from "./colors";

interface Generation {
  id: string;
  label: string;
  thought: string;
  steps: Array<{
    action?: string;
    input?: string;
    observation?: string;
    summary?: string;
  }>;
  finalAnswer: string;
  isCompleted: boolean;
  type: "D" | "R" | "S" | "G" | string;
}

interface ChatProps {
  generations: Generation[];
  setGenerations: (generations: Generation[]) => void;
  hoveredGenerationId: number;
  setHoveredGenerationId: (id: number) => void;
}

interface Action {
  type: string;
  input?: string;
  result?: string;
}

interface ParsedResult {
  thought: string;
  actions: Action[];
  finalAnswer: string;
  searchResults?: string;
}

export interface ProgressItemProps {
  label: string;
  description: string;
  isHovered: boolean;
  onHover: (index: number) => void;
  index: number;
  type: string;
  action?: string;
  colorMap?: ColorMapping;
  isHighlighted?: boolean;
  isLast?: boolean;
}
