import type { Direction, GameState, MapSquare } from "../game/types";

const CELL_SIZE = 48;
const GRID_COLOR = "#334155";
const EMPTY_COLOR = "#f8fafc";
const HAZARD_COLOR = "#ef444421";
const POWER_UP_COLOR = "#22c55e2b";
const COLLECTED_POWER_UP_COLOR = "#bbf7d00b";
const GOAL_COLOR = "#facc152a";
const ICON_STROKE = "#0f172a";
const ICON_STROKE_WIDTH = 2;

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

}

export function createRobotPictogram(): HTMLElement {
  const robot = document.createElement("div");

  robot.className = "robot-pictogram";
  robot.dataset.testid = "robot-pictogram";
  robot.setAttribute("aria-label", "Robot");
  robot.innerHTML = `
    <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
      <path class="robot-track" d="M9 16h6v20H9z" />
      <path class="robot-track" d="M33 16h6v20h-6z" />
      <path class="robot-body" d="M15 11h18a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V15a4 4 0 0 1 4-4z" />
      <path class="robot-front" d="M24 4 32 13H16z" />
      <circle class="robot-sensor" cx="24" cy="24" r="6" />
      <path class="robot-panel" d="M18 33h12" />
    </svg>
  `;

  return robot;
}

export function positionRobotPictogram(
  robot: HTMLElement,
  game: GameState
): void {
  const centerX = game.bot.position.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = game.bot.position.y * CELL_SIZE + CELL_SIZE / 2;

  robot.style.left = `${centerX}px`;
  robot.style.top = `${centerY}px`;
  robot.style.transform = `translate(-50%, -50%) rotate(${directionDegrees(
    game.bot.direction
  )}deg)`;
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

  renderSquarePictogram(context, square, x, y);
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

function renderSquarePictogram(
  context: CanvasRenderingContext2D,
  square: MapSquare,
  x: number,
  y: number
): void {
  const centerX = x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = y * CELL_SIZE + CELL_SIZE / 2;

  if (square.type === "hazard") {
    renderHazardIcon(context, centerX, centerY);
  }

  if (square.type === "power-up" && !square.collected) {
    renderFuelIcon(context, centerX, centerY);
  }

  if (square.type === "goal") {
    renderGoalIcon(context, centerX, centerY);
  }
}

function renderHazardIcon(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
): void {
  context.save();
  context.translate(centerX, centerY);
  context.fillStyle = "#fee2e2";
  context.strokeStyle = ICON_STROKE;
  context.lineJoin = "round";
  context.lineWidth = ICON_STROKE_WIDTH;
  context.beginPath();
  context.moveTo(0, -17);
  context.lineTo(17, 16);
  context.lineTo(-17, 16);
  context.closePath();
  context.fill();
  context.stroke();

  context.strokeStyle = "#991b1b";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, -6);
  context.lineTo(0, 6);
  context.stroke();
  context.beginPath();
  context.arc(0, 11, 1.8, 0, Math.PI * 2);
  context.fillStyle = "#991b1b";
  context.fill();
  context.restore();
}

function renderFuelIcon(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
): void {
  context.save();
  context.translate(centerX, centerY);
  context.fillStyle = "#facc15";
  context.strokeStyle = ICON_STROKE;
  context.lineJoin = "round";
  context.lineWidth = ICON_STROKE_WIDTH;
  context.beginPath();
  context.moveTo(5, -17);
  context.lineTo(-12, 2);
  context.lineTo(-2, 2);
  context.lineTo(-8, 17);
  context.lineTo(13, -5);
  context.lineTo(2, -5);
  context.closePath();
  context.fill();
  context.stroke();
  context.restore();
}

function renderGoalIcon(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
): void {
  context.save();
  context.translate(centerX, centerY);
  context.strokeStyle = ICON_STROKE;
  context.lineWidth = ICON_STROKE_WIDTH;
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(-13, 17);
  context.lineTo(-13, -17);
  context.stroke();

  context.fillStyle = "#fef3c7";
  context.beginPath();
  context.moveTo(-13, -17);
  context.lineTo(16, -11);
  context.lineTo(-13, -5);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = "#0f172a";
  context.fillRect(-17, 16, 25, 3);
  context.restore();
}

function directionDegrees(direction: Direction): number {
  const rotations: Record<Direction, number> = {
    north: 0,
    east: 90,
    south: 180,
    west: 270
  };

  return rotations[direction];
}
