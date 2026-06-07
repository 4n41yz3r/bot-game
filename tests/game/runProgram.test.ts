import { describe, expect, it } from "vitest";

import { runProgram } from "../../src/game/engine";
import type { GameState } from "../../src/game/types";

describe("runProgram", () => {
  it("runs a complete JavaScript program as one attempt", () => {
    const game = gameWithBot();

    const result = runProgram(game, "turn_left(); move();");

    expect(result.attempts).toBe(1);
    expect(result.state.bot.direction).toBe("west");
    expect(result.state.bot.position).toEqual({ x: 2, y: 3 });
    expect(result.state.bot.fuel).toBe(7);
  });

  it("allows player-defined helper functions", () => {
    const game = gameWithBot();

    const result = runProgram(
      game,
      `
      function turn_right() {
        turn_left();
        turn_left();
        turn_left();
      }

      turn_right();
      `
    );

    expect(result.state.bot.direction).toBe("east");
    expect(result.state.bot.fuel).toBe(7);
  });

  it("does not let commands after a win change the game state", () => {
    const game = gameWithBot();
    game.squares[2][3] = { type: "goal" };

    const result = runProgram(game, "move(); turn_left(); move();");

    expect(result.state.status).toBe("won");
    expect(result.state.bot.direction).toBe("north");
    expect(result.state.bot.position).toEqual({ x: 3, y: 2 });
    expect(result.state.bot.fuel).toBe(8);
  });
});

function gameWithBot(): GameState {
  return {
    width: 8,
    height: 8,
    bot: {
      position: { x: 3, y: 3 },
      direction: "north",
      fuel: 10
    },
    squares: Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => ({ type: "empty" as const }))
    ),
    status: "playing"
  };
}

