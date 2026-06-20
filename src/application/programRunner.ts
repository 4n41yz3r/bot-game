import { executeCommand } from "../game/commandExecutor.ts";
import type { GameResult, GameState } from "../game/types";

const PROGRAM_STOPPED = Symbol("program stopped");

export function runProgram(
  game: GameState,
  playerCode: string
): GameResult {
  let state = game;
  const commands = {
    turn_left() {
      state = executeCommand(state, "turn_left");
      stopProgramIfGameEnded(state);
    },
    move() {
      state = executeCommand(state, "move");
      stopProgramIfGameEnded(state);
    },
    fire() {
      state = executeCommand(state, "fire");
      stopProgramIfGameEnded(state);
    }
  };

  const program = new Function(
    "turn_left",
    "move",
    "fire",
    "globalThis",
    "window",
    "self",
    "document",
    "Function",
    `"use strict";\n${playerCode}`
  );

  try {
    program(
      commands.turn_left,
      commands.move,
      commands.fire,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
  } catch (error) {
    if (error !== PROGRAM_STOPPED) {
      throw error;
    }
  }

  return {
    state,
    attempts: 1
  };
}

function stopProgramIfGameEnded(state: GameState): void {
  if (state.status !== "playing") {
    throw PROGRAM_STOPPED;
  }
}
