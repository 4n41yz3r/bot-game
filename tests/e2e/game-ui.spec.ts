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

  await expect(page.getByRole("heading", { name: "JavaScript Bot" })).toBeVisible();
  await expect(page.getByTestId("game-map")).toBeVisible();
  await expect(page.getByTestId("fuel")).toContainText("10");
  await expect(page.getByTestId("status")).toContainText("Playing");
});

test("runs a player program and updates the visible game state", async ({
  page
}) => {
  await page.goto("/");

  await page.getByLabel("JavaScript program").fill("turn_left();");
  await page.getByRole("button", { name: "Run Program" }).click();

  await expect(page.getByTestId("fuel")).toContainText("9");
  await expect(page.getByTestId("status")).toContainText("Playing");
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

  await page.getByLabel("JavaScript program").fill("move();");
  await page.getByRole("button", { name: "Run Program" }).click();

  await expect(page.getByTestId("status")).toContainText("Won");
});

test("shows a loss message", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("JavaScript program").fill(
    Array.from({ length: 10 }, () => "turn_left();").join("\n")
  );
  await page.getByRole("button", { name: "Run Program" }).click();

  await expect(page.getByTestId("status")).toContainText("Lost");
});
