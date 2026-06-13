import { describe, expect, it } from "vitest";

import { legendItems, statusText } from "../../src/ui/controlViewModels";

describe("control view models", () => {
  it("describes each legend item", () => {
    expect(legendItems).toEqual([
      {
        icon: "🤖",
        name: "Robot",
        description: "Shows the bot position and direction."
      },
      {
        icon: "⚠️",
        name: "Hazard",
        description: "Destroys the bot."
      },
      {
        icon: "⚡",
        name: "Fuel",
        description: "Adds 5 fuel when collected."
      },
      {
        icon: "🚩",
        name: "Goal",
        description: "Reach it to win."
      }
    ]);
  });

  it("maps game statuses to display text", () => {
    expect(statusText("playing")).toBe("Playing");
    expect(statusText("won")).toBe("Won");
    expect(statusText("lost")).toBe("Lost");
  });
});
