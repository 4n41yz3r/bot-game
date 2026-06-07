import type { GameState, MapSquare, Position, SquareType } from "./types";

const MAP_WIDTH = 8;
const MAP_HEIGHT = 8;
const STARTING_FUEL = 10;
const HAZARD_COUNT = 10;
const POWER_UP_COUNT = 5;

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

function createEmptyMap(): MapSquare[][] {
  return Array.from({ length: MAP_HEIGHT }, () =>
    Array.from({ length: MAP_WIDTH }, () => ({ type: "empty" }))
  );
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
