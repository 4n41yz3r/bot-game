import { describe, expect, it } from "vitest";

import { createGame } from "../../src/game/mapGenerator";

describe("createGame", () => {
  it("creates a new playing game on an 8 by 8 map with a fueled bot", () => {
    const game = createGame();

    expect(game.width).toBe(8);
    expect(game.height).toBe(8);
    expect(game.status).toBe("playing");
    expect(game.bot.fuel).toBe(10);
  });

  it("creates an 8 by 8 square map", () => {
    const game = createGame();

    expect(game.squares).toHaveLength(8);
    expect(game.squares.every((row) => row.length === 8)).toBe(true);
  });

  it("places the bot inside the map", () => {
    const game = createGame();

    expect(game.bot.position.x).toBeGreaterThanOrEqual(0);
    expect(game.bot.position.x).toBeLessThan(8);
    expect(game.bot.position.y).toBeGreaterThanOrEqual(0);
    expect(game.bot.position.y).toBeLessThan(8);
  });

  it("places one goal, 10 hazards, and 5 power-ups", () => {
    const game = createGame();
    const counts = countSquares(game.squares);

    expect(counts.goal).toBe(1);
    expect(counts.hazard).toBe(10);
    expect(counts["power-up"]).toBe(5);
  });

  it("uses an injected random source for deterministic placement", () => {
    const game = createGame({ random: () => 0 });

    expect(game.bot.position).toEqual({ x: 0, y: 0 });
    expect(game.squares[7][7]).toEqual({ type: "goal" });
    expect(game.squares[7][6]).toEqual({ type: "hazard" });
    expect(game.squares[7][5]).toEqual({ type: "hazard" });
    expect(game.squares[6][4]).toEqual({ type: "power-up" });
  });
});

function countSquares(squares: ReturnType<typeof createGame>["squares"]) {
  return squares.flat().reduce(
    (counts, square) => ({
      ...counts,
      [square.type]: counts[square.type] + 1
    }),
    {
      empty: 0,
      hazard: 0,
      "power-up": 0,
      goal: 0
    }
  );
}
