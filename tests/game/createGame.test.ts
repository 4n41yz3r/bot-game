import { describe, expect, it } from "vitest";

import { createGame } from "../../src/game/engine";

describe("createGame", () => {
  it("creates a new playing game on an 8 by 8 map with a fueled bot", () => {
    const game = createGame();

    expect(game.width).toBe(8);
    expect(game.height).toBe(8);
    expect(game.status).toBe("playing");
    expect(game.bot.fuel).toBe(10);
  });
});

