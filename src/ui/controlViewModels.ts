import type { GameState } from "../game/types";

export const legendItems = [
  {
    icon: "🤖",
    name: "Robot",
    description: "Shows the bot position and direction."
  },
  {
    icon: "⚠️",
    name: "Hazard",
    description: "Destroys the bot."
  },
  {
    icon: "⚡",
    name: "Fuel",
    description: "Adds 5 fuel when collected."
  },
  {
    icon: "🚩",
    name: "Goal",
    description: "Reach it to win."
  }
] as const;

export function statusText(status: GameState["status"]): string {
  const labels: Record<GameState["status"], string> = {
    playing: "Playing",
    won: "Won",
    lost: "Lost"
  };

  return labels[status];
}
