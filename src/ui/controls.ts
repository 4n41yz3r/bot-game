import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { basicSetup, EditorView } from "codemirror";
import { runProgram } from "../application/programRunner";
import { createGame } from "../game/mapGenerator";
import type { GameState, MapSquare, Position } from "../game/types";
import {
  createGameCanvas,
  createRobotPictogram,
  positionRobotPictogram,
  renderGame
} from "./canvasRenderer";
import { legendItems, statusText } from "./controlViewModels";
import { installTestApi, shouldInstallTestApi } from "./testApi";

export function mountGame(root: HTMLElement): void {
  let game = createGame();

  const canvas = createGameCanvas();
  const robot = createRobotPictogram();
  const mapFrame = createMapFrame(canvas, robot);
  const legend = createLegend();
  const fuel = createFuelView();
  const statusView = createStatusView();
  const programEditor = createProgramEditor();
  const runButton = createRunButton();

  runButton.addEventListener("click", () => {
    game = runProgram(game, programEditor.view.state.doc.toString()).state;
    update();
  });

  const heading = createHeading();
  const layout = createLayout();
  const mapPane = createMapPane();
  const panel = createControlPanel();

  mapPane.append(mapFrame, legend, fuel, statusView.container);
  panel.append(programEditor.shell, runButton);
  layout.append(mapPane, panel);
  root.replaceChildren(heading, layout);

  if (shouldInstallTestApi(window.location)) {
    installTestApi({
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
    });
  }

  update();

  function update(): void {
    renderGame(canvas, game);
    positionRobotPictogram(robot, game);
    fuel.textContent = `Fuel: ${game.bot.fuel}`;
    statusView.value.className = `status-value status-${game.status}`;
    statusView.value.textContent = statusText(game.status);
  }
}

function createHeading(): HTMLHeadingElement {
  const heading = document.createElement("h1");
  heading.textContent = "JS Bot Game";

  return heading;
}

function createLayout(): HTMLElement {
  const layout = document.createElement("section");
  layout.className = "game-layout";

  return layout;
}

function createMapPane(): HTMLElement {
  const mapPane = document.createElement("section");
  mapPane.className = "map-pane";

  return mapPane;
}

function createMapFrame(
  canvas: HTMLCanvasElement,
  robot: HTMLElement
): HTMLElement {
  const mapFrame = document.createElement("div");
  mapFrame.className = "map-frame";
  mapFrame.append(canvas, robot);

  return mapFrame;
}

function createControlPanel(): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "control-panel";

  return panel;
}

function createLegend(): HTMLUListElement {
  const legend = document.createElement("ul");
  legend.className = "legend";
  legend.dataset.testid = "legend";
  legend.setAttribute("aria-label", "Map pictogram legend");

  for (const item of legendItems) {
    const listItem = document.createElement("li");
    const icon = document.createElement("span");
    const name = document.createElement("strong");
    const description = document.createElement("small");

    icon.setAttribute("aria-hidden", "true");
    icon.textContent = item.icon;
    name.textContent = item.name;
    description.textContent = item.description;
    listItem.append(icon, name, description);
    legend.append(listItem);
  }

  return legend;
}

function createFuelView(): HTMLParagraphElement {
  const fuel = document.createElement("p");
  fuel.dataset.testid = "fuel";

  return fuel;
}

function createStatusView(): {
  container: HTMLParagraphElement;
  value: HTMLSpanElement;
} {
  const status = document.createElement("p");
  status.className = "status";
  status.dataset.testid = "status";
  status.setAttribute("aria-live", "polite");

  const statusLabel = document.createElement("span");
  statusLabel.dataset.testid = "status-label";
  statusLabel.textContent = "Status: ";

  const statusValue = document.createElement("span");
  statusValue.dataset.testid = "status-value";
  status.append(statusLabel, statusValue);

  return {
    container: status,
    value: statusValue
  };
}

function createProgramEditor(): {
  shell: HTMLElement;
  view: EditorView;
} {
  const editorShell = document.createElement("div");
  editorShell.className = "editor-shell";
  editorShell.dataset.testid = "code-editor-shell";

  const editorFrame = document.createElement("div");
  editorFrame.className = "editor-frame";
  editorFrame.dataset.testid = "code-editor";
  editorShell.append(editorFrame);

  return {
    shell: editorShell,
    view: new EditorView({
      doc: "turn_left();\nmove();",
      extensions: editorExtensions(),
      parent: editorFrame
    })
  };
}

function editorExtensions() {
  return [
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
      "aria-label": "Program Your Bot"
    }),
    EditorView.theme({
      "&": {
        backgroundColor: "#020617",
        border: "0",
        borderRadius: "0",
        color: "#e2e8f0",
        fontSize: "1rem",
        minHeight: "34rem"
      },
      ".cm-content": {
        caretColor: "#ffffff",
        fontFamily: 'Consolas, "Courier New", monospace',
        minHeight: "34rem",
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
  ];
}

function createRunButton(): HTMLButtonElement {
  const runButton = document.createElement("button");
  runButton.type = "button";
  runButton.textContent = "Run Program";

  return runButton;
}
