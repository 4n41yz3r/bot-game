import type { Direction, GameState, MapSquare } from "../game/types";

const CELL_SIZE = 48;
const GRID_COLOR = "#334155";
const EMPTY_COLOR = "#f8fafc";
const HAZARD_COLOR = "#ef4444";
const POWER_UP_COLOR = "#22c55e";
const COLLECTED_POWER_UP_COLOR = "#bbf7d0";
const GOAL_COLOR = "#facc15";
const BOT_COLOR = "#2563eb";

export function createGameCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");

  canvas.width = CELL_SIZE * 8;
  canvas.height = CELL_SIZE * 8;
  canvas.dataset.testid = "game-map";
  canvas.setAttribute("aria-label", "Game map");

  return canvas;
}

export function renderGame(canvas: HTMLCanvasElement, game: GameState): void {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  game.squares.forEach((row, y) => {
    row.forEach((square, x) => {
      renderSquare(context, square, x, y);
    });
  });

  renderBot(context, game.bot.position.x, game.bot.position.y, game.bot.direction);
}

function renderSquare(
  context: CanvasRenderingContext2D,
  square: MapSquare,
  x: number,
  y: number
): void {
  context.fillStyle = squareColor(square);
  context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  context.strokeStyle = GRID_COLOR;
  context.lineWidth = 1;
  context.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function squareColor(square: MapSquare): string {
  if (square.type === "hazard") {
    return HAZARD_COLOR;
  }

  if (square.type === "power-up") {
    return square.collected ? COLLECTED_POWER_UP_COLOR : POWER_UP_COLOR;
  }

  if (square.type === "goal") {
    return GOAL_COLOR;
  }

  return EMPTY_COLOR;
}

function renderBot(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: Direction
): void {
  const centerX = x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = y * CELL_SIZE + CELL_SIZE / 2;

  context.fillStyle = BOT_COLOR;
  context.beginPath();
  context.arc(centerX, centerY, CELL_SIZE * 0.28, 0, Math.PI * 2);
  context.fill();

  const pointer = directionPointer(direction);

  context.strokeStyle = "#ffffff";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.lineTo(centerX + pointer.x * CELL_SIZE * 0.28, centerY + pointer.y * CELL_SIZE * 0.28);
  context.stroke();
}

function directionPointer(direction: Direction): { x: number; y: number } {
  const pointers: Record<Direction, { x: number; y: number }> = {
    north: { x: 0, y: -1 },
    east: { x: 1, y: 0 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 }
  };

  return pointers[direction];
}

