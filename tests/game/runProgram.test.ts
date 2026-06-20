import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";

import { runProgram } from "../../src/application/programRunner";
import type { GameState } from "../../src/game/types";

describe("runProgram", () => {
  it("runs a complete JavaScript program as one attempt", () => {
    const game = gameWithBot();

    const result = runProgram(game, "turn_left(); move();");

    expect(result.attempts).toBe(1);
    expect(result.state.bot.direction).toBe("west");
    expect(result.state.bot.position).toEqual({ x: 2, y: 3 });
    expect(result.state.bot.fuel).toBe(8);
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

  it("exposes fire to player programs", () => {
    const game = gameWithBot();
    game.squares[2][3] = { type: "hazard" };

    const result = runProgram(game, "fire();");

    expect(result.state.squares[2][3]).toEqual({ type: "empty" });
    expect(result.state.bot.fuel).toBe(8);
  });

  it("does not let commands after a win change the game state", () => {
    const game = gameWithBot();
    game.squares[2][3] = { type: "goal" };

    const result = runProgram(game, "move(); turn_left(); move();");

    expect(result.state.status).toBe("won");
    expect(result.state.bot.direction).toBe("north");
    expect(result.state.bot.position).toEqual({ x: 3, y: 2 });
    expect(result.state.bot.fuel).toBe(9);
  });

  it("does not expose common global objects to player code", () => {
    const game = gameWithBot();

    const result = runProgram(
      game,
      `
      if (
        typeof globalThis !== "undefined" ||
        typeof window !== "undefined" ||
        typeof document !== "undefined" ||
        typeof self !== "undefined"
      ) {
        move();
      }
      turn_left();
      `
    );

    expect(result.state.bot.position).toEqual({ x: 3, y: 3 });
    expect(result.state.bot.direction).toBe("west");
  });

  it("stops executing an infinite command loop after encountering a hazard", async () => {
    const state = await runInfiniteMoveLoopInChildProcess();

    expect(state.status).toBe("lost");
    expect(state.bot.position).toEqual({ x: 3, y: 2 });
    expect(state.bot.fuel).toBe(9);
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

function runInfiniteMoveLoopInChildProcess(): Promise<GameState> {
  const script = `
    import { runProgram } from "./src/application/programRunner.ts";

    const game = {
      width: 8,
      height: 8,
      bot: {
        position: { x: 3, y: 3 },
        direction: "north",
        fuel: 10
      },
      squares: Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => ({ type: "empty" }))
      ),
      status: "playing"
    };
    game.squares[2][3] = { type: "hazard" };

    const result = runProgram(game, "while (true) { move(); }");
    console.log(JSON.stringify(result.state));
  `;

  return new Promise((resolve, reject) => {
    const child = execFile(
      process.execPath,
      ["--input-type=module", "--eval", script],
      {
        cwd: process.cwd(),
        timeout: 1000
      },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(JSON.parse(stdout) as GameState);
      }
    );

    child.on("error", reject);
  });
}
