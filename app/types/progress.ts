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
