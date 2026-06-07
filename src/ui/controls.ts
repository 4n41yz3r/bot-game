import { createGame, runProgram } from "../game/engine";
import type { GameState, MapSquare, Position } from "../game/types";
import { createGameCanvas, renderGame } from "./canvasRenderer";

declare global {
  interface Window {
    javascriptBotGame: {
      setGameState(gameState: GameState): void;
      setSquare(position: Position, square: MapSquare): void;
    };
  }
}

export function mountGame(root: HTMLElement): void {
  let game = createGame();

  const heading = document.createElement("h1");
  heading.textContent = "JavaScript Bot";

  const layout = document.createElement("section");
  layout.className = "game-layout";

  const canvas = createGameCanvas();

  const panel = document.createElement("section");
  panel.className = "control-panel";

  const fuel = document.createElement("p");
  fuel.dataset.testid = "fuel";

  const status = document.createElement("p");
  status.dataset.testid = "status";
  status.setAttribute("aria-live", "polite");

  const label = document.createElement("label");
  label.htmlFor = "player-code";
  label.textContent = "JavaScript program";

  const editor = document.createElement("textarea");
  editor.id = "player-code";
  editor.rows = 10;
  editor.spellcheck = false;
  editor.value = "turn_left();\nmove();";

  const runButton = document.createElement("button");
  runButton.type = "button";
  runButton.textContent = "Run Program";

  runButton.addEventListener("click", () => {
    game = runProgram(game, editor.value).state;
    update();
  });

  panel.append(fuel, status, label, editor, runButton);
  layout.append(canvas, panel);
  root.replaceChildren(heading, layout);

  window.javascriptBotGame = {
    setGameState(gameState: GameState) {
      game = structuredClone(gameState);
      update();
    },
    setSquare(position: Position, square: MapSquare) {
      game = {
        ...game,
        squares: game.squares.map((row, y) =>
          row.map((currentSquare, x) =>
            x === position.x && y === position.y ? square : currentSquare
          )
        )
      };
      update();
    }
  };

  update();

  function update(): void {
    renderGame(canvas, game);
    fuel.textContent = `Fuel: ${game.bot.fuel}`;
    status.textContent = `Status: ${statusText(game.status)}`;
  }
}

function statusText(status: GameState["status"]): string {
  const labels: Record<GameState["status"], string> = {
    playing: "Playing",
    won: "Won",
    lost: "Lost"
  };

  return labels[status];
}

