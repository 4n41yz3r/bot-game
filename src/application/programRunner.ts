import { executeCommand } from "../game/commandExecutor.ts";
import type { GameResult, GameState } from "../game/types";

export function runProgram(
  game: GameState,
  playerCode: string
): GameResult {
  let state = game;
  const commands = {
    turn_left() {
      state = executeCommand(state, "turn_left");
    },
    move() {
      state = executeCommand(state, "move");
    }
  };

  const program = new Function(
    "turn_left",
    "move",
    "globalThis",
    "window",
    "self",
    "document",
    "Function",
    `"use strict";\n${playerCode}`
  );

  program(
    commands.turn_left,
    commands.move,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  );

  return {
    state,
    attempts: 1
  };
}
