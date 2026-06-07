import assert from "node:assert/strict";

import { Given, Then, When } from "@cucumber/cucumber";

import { runProgram } from "../../src/game/engine.ts";

Given("the player has written a valid JavaScript program", function () {
  ensureGame(this);
  this.playerCode = "turn_left();";
});

Given("the player has written:", function (docString) {
  ensureGame(this);
  this.playerCode = docString;
});

When("the player runs the program", function () {
  ensureGame(this);
  this.previousGame = structuredClone(this.game);
  this.result = runProgram(this.game, this.playerCode);
  this.game = this.result.state;
});

Then("the program is executed as one attempt", function () {
  assert.equal(this.result.attempts, 1);
});

Then("the bot turns {int} degrees to the right", function (degrees) {
  assert.equal(degrees, 90);
  assert.equal(this.previousGame.bot.direction, "north");
  assert.equal(this.game.bot.direction, "east");
});

Then("the bot uses {int} fuel points", function (fuel) {
  assert.equal(this.previousGame.bot.fuel - this.game.bot.fuel, fuel);
});

function ensureGame(world) {
  if (world.game) {
    return;
  }

  world.game = {
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
  };
}

