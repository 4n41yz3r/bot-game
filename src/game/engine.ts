import type {
  BotCommand,
  Direction,
  GameState,
  MapSquare,
  Position,
  SquareType
} from "./types";

const MAP_WIDTH = 8;
const MAP_HEIGHT = 8;
const STARTING_FUEL = 10;
const HAZARD_COUNT = 10;
const POWER_UP_COUNT = 5;
const TURN_LEFT_FUEL_COST = 1;
const MOVE_FUEL_COST = 2;

export function createGame(): GameState {
  const squares = createEmptyMap();
  const positions = shuffledPositions();
  const botPosition = positions.pop() ?? { x: 0, y: 0 };

  placeSquare(squares, positions, "goal");
  placeSquares(squares, positions, "hazard", HAZARD_COUNT);
  placeSquares(squares, positions, "power-up", POWER_UP_COUNT);

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    bot: {
      position: botPosition,
      direction: "north",
      fuel: STARTING_FUEL
    },
    squares,
    status: "playing"
  };
}

export function executeCommand(game: GameState, command: BotCommand): GameState {
  if (game.status !== "playing") {
    return game;
  }

  const updatedGame =
    command === "turn_left" ? turnLeft(game) : moveForward(game);

  if (updatedGame.bot.fuel === 0 && updatedGame.status !== "won") {
    return {
      ...updatedGame,
      status: "lost"
    };
  }

  return updatedGame;
}

function createEmptyMap(): MapSquare[][] {
  return Array.from({ length: MAP_HEIGHT }, () =>
    Array.from({ length: MAP_WIDTH }, () => ({ type: "empty" }))
  );
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
  return {
    ...game,
    bot: {
      ...game.bot,
      position: nextPosition(game.bot.position, game.bot.direction),
      fuel: game.bot.fuel - MOVE_FUEL_COST
    }
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
  const movement: Record<Direction, Position> = {
    north: { x: 0, y: -1 },
    east: { x: 1, y: 0 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 }
  };
  const offset = movement[direction];

  return {
    x: position.x + offset.x,
    y: position.y + offset.y
  };
}

function shuffledPositions(): Position[] {
  const positions = Array.from({ length: MAP_HEIGHT }, (_, y) =>
    Array.from({ length: MAP_WIDTH }, (_, x) => ({ x, y }))
  ).flat();

  return positions.sort(() => Math.random() - 0.5);
}

function placeSquares(
  squares: MapSquare[][],
  positions: Position[],
  type: SquareType,
  count: number
): void {
  for (let placed = 0; placed < count; placed += 1) {
    placeSquare(squares, positions, type);
  }
}

function placeSquare(
  squares: MapSquare[][],
  positions: Position[],
  type: SquareType
): void {
  const position = positions.pop();

  if (!position) {
    return;
  }

  squares[position.y][position.x] = { type };
}
