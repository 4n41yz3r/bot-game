import { describe, expect, it } from "vitest";

import { executeCommand } from "../../src/game/engine";
import type { Direction, GameState } from "../../src/game/types";

describe("executeCommand", () => {
  it("turns the bot left and spends 1 fuel point", () => {
    const game = gameWithBot({ direction: "north", fuel: 10 });

    const result = executeCommand(game, "turn_left");

    expect(result.bot.direction).toBe("west");
    expect(result.bot.fuel).toBe(9);
  });

  it("moves the bot one square forward and spends 2 fuel points", () => {
    const game = gameWithBot({
      position: { x: 3, y: 3 },
      direction: "north",
      fuel: 10
    });

    const result = executeCommand(game, "move");

    expect(result.bot.position).toEqual({ x: 3, y: 2 });
    expect(result.bot.fuel).toBe(8);
  });

  it("loses when a command leaves the bot with 0 fuel before reaching the goal", () => {
    const game = gameWithBot({ fuel: 1 });

    const result = executeCommand(game, "turn_left");

    expect(result.bot.fuel).toBe(0);
    expect(result.status).toBe("lost");
  });
});

function gameWithBot(
  bot: Partial<GameState["bot"]> & { direction?: Direction } = {}
): GameState {
  return {
    width: 8,
    height: 8,
    bot: {
      position: bot.position ?? { x: 3, y: 3 },
      direction: bot.direction ?? "north",
      fuel: bot.fuel ?? 10
    },
    squares: Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => ({ type: "empty" as const }))
    ),
    status: "playing"
  };
}

