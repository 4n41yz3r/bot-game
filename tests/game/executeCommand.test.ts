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

  it("moves the bot one square forward and spends 1 fuel point", () => {
    const game = gameWithBot({
      position: { x: 3, y: 3 },
      direction: "north",
      fuel: 10
    });

    const result = executeCommand(game, "move");

    expect(result.bot.position).toEqual({ x: 3, y: 2 });
    expect(result.bot.fuel).toBe(9);
  });

  it("loses when a command leaves the bot with 0 fuel before reaching the goal", () => {
    const game = gameWithBot({ fuel: 1 });

    const result = executeCommand(game, "turn_left");

    expect(result.bot.fuel).toBe(0);
    expect(result.status).toBe("lost");
  });

  it("wins when the bot moves onto the goal", () => {
    const game = gameWithBot({ position: { x: 3, y: 3 } });
    game.squares[2][3] = { type: "goal" };

    const result = executeCommand(game, "move");

    expect(result.status).toBe("won");
  });

  it("loses when the bot moves onto a hazard", () => {
    const game = gameWithBot({ position: { x: 3, y: 3 } });
    game.squares[2][3] = { type: "hazard" };

    const result = executeCommand(game, "move");

    expect(result.status).toBe("lost");
  });

  it("loses when the bot moves outside the map", () => {
    const game = gameWithBot({ position: { x: 3, y: 0 } });

    const result = executeCommand(game, "move");

    expect(result.status).toBe("lost");
  });

  it("adds 5 fuel after move cost when collecting a power-up", () => {
    const game = gameWithBot({ position: { x: 3, y: 3 }, fuel: 8 });
    game.squares[2][3] = { type: "power-up" };

    const result = executeCommand(game, "move");

    expect(result.bot.fuel).toBe(12);
    expect(result.squares[2][3].collected).toBe(true);
  });

  it("does not add fuel when re-entering a collected power-up", () => {
    const game = gameWithBot({ position: { x: 3, y: 3 }, fuel: 8 });
    game.squares[2][3] = { type: "power-up", collected: true };

    const result = executeCommand(game, "move");

    expect(result.bot.fuel).toBe(7);
  });

  it("allows fuel to exceed the initial amount after collecting a power-up", () => {
    const game = gameWithBot({ position: { x: 3, y: 3 }, fuel: 10 });
    game.squares[2][3] = { type: "power-up" };

    const result = executeCommand(game, "move");

    expect(result.bot.fuel).toBe(14);
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
