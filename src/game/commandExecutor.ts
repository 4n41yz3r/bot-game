import type { BotCommand, Direction, GameState, Position } from "./types";

const TURN_LEFT_FUEL_COST = 1;
const MOVE_FUEL_COST = 1;
const FIRE_FUEL_COST = 2;
const POWER_UP_FUEL_GAIN = 5;

export function executeCommand(game: GameState, command: BotCommand): GameState {
  if (game.status !== "playing") {
    return game;
  }

  const updatedGame = executePlayingCommand(game, command);

  if (updatedGame.bot.fuel <= 0 && updatedGame.status !== "won") {
    return {
      ...updatedGame,
      status: "lost"
    };
  }

  return updatedGame;
}

function executePlayingCommand(
  game: GameState,
  command: BotCommand
): GameState {
  if (command === "turn_left") {
    return turnLeft(game);
  }

  if (command === "move") {
    return moveForward(game);
  }

  return fire(game);
}

function turnLeft(game: GameState): GameState {
  return {
    ...game,
    bot: {
      ...game.bot,
      direction: leftOf(game.bot.direction),
      fuel: game.bot.fuel - TURN_LEFT_FUEL_COST
    }
  };
}

function moveForward(game: GameState): GameState {
  const position = nextPosition(game.bot.position, game.bot.direction);
  const movedGame = {
    ...game,
    bot: {
      ...game.bot,
      position,
      fuel: game.bot.fuel - MOVE_FUEL_COST
    }
  };

  return applySquareInteraction(movedGame, position);
}

function fire(game: GameState): GameState {
  const firedGame = {
    ...game,
    bot: {
      ...game.bot,
      fuel: game.bot.fuel - FIRE_FUEL_COST
    }
  };
  const target = findShotTarget(firedGame);

  if (!target) {
    return firedGame;
  }

  return {
    ...firedGame,
    squares: firedGame.squares.map((row, y) =>
      row.map((square, x) =>
        x === target.x && y === target.y ? { type: "empty" } : square
      )
    )
  };
}

function leftOf(direction: Direction): Direction {
  const leftTurns: Record<Direction, Direction> = {
    north: "west",
    west: "south",
    south: "east",
    east: "north"
  };

  return leftTurns[direction];
}

function nextPosition(position: Position, direction: Direction): Position {
  const offset = directionOffset(direction);

  return {
    x: position.x + offset.x,
    y: position.y + offset.y
  };
}

function directionOffset(direction: Direction): Position {
  const movement: Record<Direction, Position> = {
    north: { x: 0, y: -1 },
    east: { x: 1, y: 0 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 }
  };

  return movement[direction];
}

function findShotTarget(game: GameState): Position | null {
  const offset = directionOffset(game.bot.direction);
  let position = {
    x: game.bot.position.x + offset.x,
    y: game.bot.position.y + offset.y
  };

  while (isInsideMap(game, position)) {
    const square = game.squares[position.y][position.x];

    if (square.type === "hazard" || square.type === "power-up") {
      return position;
    }

    position = {
      x: position.x + offset.x,
      y: position.y + offset.y
    };
  }

  return null;
}

function applySquareInteraction(game: GameState, position: Position): GameState {
  if (!isInsideMap(game, position)) {
    return {
      ...game,
      status: "lost"
    };
  }

  const square = game.squares[position.y][position.x];

  if (square.type === "goal") {
    return {
      ...game,
      status: "won"
    };
  }

  if (square.type === "hazard") {
    return {
      ...game,
      status: "lost"
    };
  }

  if (square.type === "power-up" && !square.collected) {
    return collectPowerUp(game, position);
  }

  return game;
}

function collectPowerUp(game: GameState, position: Position): GameState {
  return {
    ...game,
    bot: {
      ...game.bot,
      fuel: game.bot.fuel + POWER_UP_FUEL_GAIN
    },
    squares: game.squares.map((row, y) =>
      row.map((square, x) =>
        x === position.x && y === position.y
          ? { ...square, collected: true }
          : square
      )
    )
  };
}

function isInsideMap(game: GameState, position: Position): boolean {
  return (
    position.x >= 0 &&
    position.x < game.width &&
    position.y >= 0 &&
    position.y < game.height
  );
}
