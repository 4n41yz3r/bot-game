import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { basicSetup, EditorView } from "codemirror";
import { createGame, runProgram } from "../game/engine";
import type { GameState, MapSquare, Position } from "../game/types";
import {
  createGameCanvas,
  createRobotPictogram,
  positionRobotPictogram,
  renderGame
} from "./canvasRenderer";

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
  heading.textContent = "JS Bot";

  const layout = document.createElement("section");
  layout.className = "game-layout";

  const mapFrame = document.createElement("div");
  mapFrame.className = "map-frame";

  const canvas = createGameCanvas();
  const robot = createRobotPictogram();

  mapFrame.append(canvas, robot);

  const panel = document.createElement("section");
  panel.className = "control-panel";

  const legend = document.createElement("ul");
  legend.className = "legend";
  legend.dataset.testid = "legend";
  legend.setAttribute("aria-label", "Map pictogram legend");
  legend.innerHTML = `
    <li><span aria-hidden="true">🤖</span> Robot</li>
    <li><span aria-hidden="true">⚠️</span> Hazard</li>
    <li><span aria-hidden="true">⚡</span> Fuel</li>
    <li><span aria-hidden="true">🚩</span> Goal</li>
  `;

  const fuel = document.createElement("p");
  fuel.dataset.testid = "fuel";

  const status = document.createElement("p");
  status.dataset.testid = "status";
  status.setAttribute("aria-live", "polite");

  const label = document.createElement("label");
  label.id = "player-code-label";
  label.textContent = "Program Your Bot";

  const editorFrame = document.createElement("div");
  editorFrame.className = "editor-frame";
  editorFrame.dataset.testid = "code-editor";

  const editorView = new EditorView({
    doc: "turn_left();\nmove();",
    extensions: [
      basicSetup,
      javascript(),
      syntaxHighlighting(
        HighlightStyle.define([
          { tag: tags.keyword, color: "#c084fc", fontWeight: "700" },
          { tag: tags.function(tags.variableName), color: "#38bdf8" },
          { tag: tags.number, color: "#facc15" },
          { tag: tags.string, color: "#86efac" },
          { tag: tags.comment, color: "#94a3b8", fontStyle: "italic" }
        ])
      ),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        "aria-labelledby": "player-code-label"
      }),
      EditorView.theme({
        "&": {
          backgroundColor: "#020617",
          border: "1px solid #64748b",
          borderRadius: "0.5rem",
          color: "#e2e8f0",
          fontSize: "1rem",
          minHeight: "28rem"
        },
        ".cm-content": {
          caretColor: "#ffffff",
          fontFamily: 'Consolas, "Courier New", monospace',
          minHeight: "28rem",
          padding: "0.75rem"
        },
        ".cm-cursor, .cm-dropCursor": {
          borderLeftColor: "#ffffff"
        },
        ".cm-focused": {
          outline: "2px solid #38bdf8",
          outlineOffset: "2px"
        },
        ".cm-gutters": {
          backgroundColor: "#020617",
          borderColor: "#334155",
          color: "#64748b"
        },
        ".cm-activeLine": {
          backgroundColor: "rgb(30 41 59 / 0.6)"
        },
        ".cm-activeLineGutter": {
          backgroundColor: "rgb(30 41 59 / 0.6)"
        },
        ".cm-scroller": {
          fontFamily: 'Consolas, "Courier New", monospace'
        }
      })
    ],
    parent: editorFrame
  });

  const runButton = document.createElement("button");
  runButton.type = "button";
  runButton.textContent = "Run Program";

  runButton.addEventListener("click", () => {
    game = runProgram(game, editorView.state.doc.toString()).state;
    update();
  });

  panel.append(legend, fuel, status, label, editorFrame, runButton);
  layout.append(mapFrame, panel);
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
    positionRobotPictogram(robot, game);
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
