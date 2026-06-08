import { expect, test } from "@playwright/test";
import type { GameState, MapSquare, Position } from "../../src/game/types";

declare global {
  interface Window {
    javascriptBotGame: {
      setGameState(gameState: GameState): void;
      setSquare(position: Position, square: MapSquare): void;
    };
  }
}

test("loads the game page and displays the map", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "JS Bot" })).toBeVisible();
  await expect(page.getByTestId("game-map")).toBeVisible();
  await expect(page.getByTestId("robot-pictogram")).toBeVisible();
  await expect(page.getByTestId("legend")).toContainText("Robot");
  await expect(page.getByTestId("legend")).toContainText("Hazard");
  await expect(page.getByTestId("legend")).toContainText("Fuel");
  await expect(page.getByTestId("legend")).toContainText("Goal");
  await expect(page.getByTestId("fuel")).toContainText("10");
  await expect(page.getByTestId("status")).toContainText("Playing");
});

test("uses the remaining right-side space on wide screens", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("/");

  const layout = await page.locator(".game-layout").boundingBox();
  const map = await page.locator(".map-frame").boundingBox();
  const panel = await page.locator(".control-panel").boundingBox();

  expect(layout).not.toBeNull();
  expect(map).not.toBeNull();
  expect(panel).not.toBeNull();

  const gap = panel!.x - (map!.x + map!.width);
  const panelRight = panel!.x + panel!.width;
  const layoutRight = layout!.x + layout!.width;

  expect(gap).toBeGreaterThanOrEqual(24);
  expect(gap).toBeLessThanOrEqual(40);
  expect(panelRight).toBeGreaterThan(layoutRight - 4);
});

test("orients the robot pictogram with CSS transforms", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("robot-pictogram")).toHaveCSS(
    "transform",
    /matrix\(1, 0, 0, 1/
  );

  await page.getByLabel("Program Your Bot").fill("turn_left();");
  await page.getByRole("button", { name: "Run Program" }).click();

  await expect(page.getByTestId("robot-pictogram")).toHaveCSS(
    "transform",
    /matrix\(0, -1, 1, 0/
  );
});

test("runs a player program and updates the visible game state", async ({
  page
}) => {
  await page.goto("/");

  await page.getByLabel("Program Your Bot").fill("turn_left();");
  await page.getByRole("button", { name: "Run Program" }).click();

  await expect(page.getByTestId("fuel")).toContainText("9");
  await expect(page.getByTestId("status")).toContainText("Playing");
});

test("highlights JavaScript syntax in the command editor", async ({ page }) => {
  await page.goto("/");

  await page
    .getByLabel("Program Your Bot")
    .fill("function turn_right() {\n  turn_left();\n}");

  await expect(page.getByTestId("code-editor")).toBeVisible();
  await expect(page.locator(".cm-editor")).toBeVisible();
  await expect(page.locator(".cm-editor")).toHaveCSS("min-height", "448px");
  await expect(page.locator(".cm-content")).toContainText("function");
  await expect(page.locator(".cm-content")).toContainText("turn_left");
});

test("uses a white cursor in the command editor", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Program Your Bot").click();

  await expect(page.locator(".cm-cursor").first()).toHaveCSS(
    "border-left-color",
    "rgb(255, 255, 255)"
  );
});

test("shows a win message", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    window.javascriptBotGame.setGameState({
      width: 8,
      height: 8,
      bot: {
        position: { x: 3, y: 3 },
        direction: "north",
        fuel: 10
      },
      squares: Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => ({ type: "empty" }))
      ),
      status: "playing"
    });
    window.javascriptBotGame.setSquare({ x: 3, y: 2 }, { type: "goal" });
  });

  await page.getByLabel("Program Your Bot").fill("move();");
  await page.getByRole("button", { name: "Run Program" }).click();

  await expect(page.getByTestId("status")).toContainText("Won");
});

test("shows a loss message", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Program Your Bot").fill(
    Array.from({ length: 10 }, () => "turn_left();").join("\n")
  );
  await page.getByRole("button", { name: "Run Program" }).click();

  await expect(page.getByTestId("status")).toContainText("Lost");
});
