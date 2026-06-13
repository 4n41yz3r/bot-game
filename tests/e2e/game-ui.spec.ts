import { expect, test } from "@playwright/test";
import type { GameState, MapSquare, Position } from "../../src/game/types";

declare global {
  interface Window {
    jsBotGameTestApi?: {
      setGameState(gameState: GameState): void;
      setSquare(position: Position, square: MapSquare): void;
    };
  }
}

const TEST_API_URL = "/?testApi=1";

test("loads the game page and displays the map", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("JS Bot Game");
  await expect(page.getByRole("heading", { name: "JS Bot Game" })).toBeVisible();
  await expect(page.getByTestId("game-map")).toBeVisible();
  await expect(page.getByTestId("robot-pictogram")).toBeVisible();
  await expect(page.getByTestId("legend")).toContainText("Robot");
  await expect(page.getByTestId("legend")).toContainText("Shows the bot position and direction.");
  await expect(page.getByTestId("legend")).toContainText("Hazard");
  await expect(page.getByTestId("legend")).toContainText("Destroys the bot.");
  await expect(page.getByTestId("legend")).toContainText("Fuel");
  await expect(page.getByTestId("legend")).toContainText("Adds 5 fuel when collected.");
  await expect(page.getByTestId("legend")).toContainText("Goal");
  await expect(page.getByTestId("legend")).toContainText("Reach it to win.");
  await expect(page.getByTestId("fuel")).toContainText("10");
  await expect(page.getByTestId("status")).toContainText("Playing");
});

test("does not expose the browser test API by default", async ({ page }) => {
  await page.goto("/");

  await expect
    .poll(() => page.evaluate(() => "jsBotGameTestApi" in window))
    .toBe(false);
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

test("places map details below the map and keeps the right pane for controls", async ({
  page
}) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("/");

  const map = await page.locator(".map-frame").boundingBox();
  const legend = await page.getByTestId("legend").boundingBox();
  const fuel = await page.getByTestId("fuel").boundingBox();
  const status = await page.getByTestId("status").boundingBox();
  const editor = await page.getByTestId("code-editor-shell").boundingBox();

  expect(map).not.toBeNull();
  expect(legend).not.toBeNull();
  expect(fuel).not.toBeNull();
  expect(status).not.toBeNull();
  expect(editor).not.toBeNull();

  expect(legend!.y).toBeGreaterThan(map!.y + map!.height);
  expect(fuel!.y).toBeGreaterThan(legend!.y);
  expect(status!.y).toBeGreaterThan(fuel!.y);
  expect(editor!.x).toBeGreaterThan(map!.x + map!.width);
  await expect(page.getByText("Program Your Bot")).toHaveCount(0);
  await expect(page.getByLabel("Program Your Bot")).toBeVisible();
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

test("color codes only the status value text", async ({ page }) => {
  await page.goto(TEST_API_URL);

  await expect(page.getByTestId("status-label")).toHaveCSS(
    "color",
    "rgb(226, 232, 240)"
  );
  await expect(page.getByTestId("status-value")).toHaveCSS(
    "color",
    "rgb(56, 189, 248)"
  );

  await page.evaluate(() => {
    window.jsBotGameTestApi!.setGameState({
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
      status: "won"
    });
  });

  await expect(page.getByTestId("status-label")).toHaveCSS(
    "color",
    "rgb(226, 232, 240)"
  );
  await expect(page.getByTestId("status-value")).toHaveCSS(
    "color",
    "rgb(34, 197, 94)"
  );

  await page.evaluate(() => {
    window.jsBotGameTestApi!.setGameState({
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
      status: "lost"
    });
  });

  await expect(page.getByTestId("status-label")).toHaveCSS(
    "color",
    "rgb(226, 232, 240)"
  );
  await expect(page.getByTestId("status-value")).toHaveCSS(
    "color",
    "rgb(239, 68, 68)"
  );
});

test("highlights JavaScript syntax in the command editor", async ({ page }) => {
  await page.goto("/");

  await page
    .getByLabel("Program Your Bot")
    .fill("function turn_right() {\n  turn_left();\n}");

  await expect(page.getByTestId("code-editor")).toBeVisible();
  await expect(page.locator(".cm-editor")).toBeVisible();
  await expect(page.locator(".cm-editor")).toHaveCSS("min-height", "544px");
  await expect(page.locator(".cm-content")).toContainText("function");
  await expect(page.locator(".cm-content")).toContainText("turn_left");
});

test("wraps the command editor border around the editor children", async ({
  page
}) => {
  await page.goto("/");

  await expect(page.getByTestId("code-editor-shell")).toHaveCSS(
    "border-left-width",
    "1px"
  );
  await expect(page.getByTestId("code-editor-shell")).toHaveCSS(
    "border-radius",
    "8px"
  );
  await expect(page.getByTestId("code-editor-shell")).toHaveCSS(
    "padding",
    "3.2px"
  );
  await expect(page.locator(".cm-editor")).toHaveCSS(
    "border-left-width",
    "0px"
  );
  await expect(page.locator(".cm-editor")).toHaveCSS("border-radius", "0px");
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
  await page.goto(TEST_API_URL);

  await page.evaluate(() => {
    window.jsBotGameTestApi!.setGameState({
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
    window.jsBotGameTestApi!.setSquare({ x: 3, y: 2 }, { type: "goal" });
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
