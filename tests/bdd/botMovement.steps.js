import assert from "node:assert/strict";

import { Given, Then, When } from "@cucumber/cucumber";

import { executeCommand } from "../../src/game/commandExecutor.ts";

Given("the bot has {int} fuel point", function (fuel) {
  ensureGame(this);
  this.game.bot.fuel = fuel;
});

Given("the bot has {int} fuel points", function (fuel) {
  ensureGame(this);

  if (this.previousGame || this.createdGame) {
    assert.equal(this.game.bot.fuel, fuel);
    return;
  }

  this.game.bot.fuel = fuel;
});

Given("the bot is facing north", function () {
  ensureGame(this);
  this.game.bot.direction = "north";
});

Given("the square north of the bot is empty", function () {
  ensureGame(this);
  const north = {
    x: this.game.bot.position.x,
    y: this.game.bot.position.y - 1
  };

  this.game.squares[north.y][north.x] = { type: "empty" };
});

Given("the bot has not reached the goal", function () {
  ensureGame(this);
  this.game.status = "playing";
});

When("the bot executes {string}", function (commandText) {
  ensureGame(this);
  this.previousGame = structuredClone(this.game);
  this.game = executeCommand(this.game, parseCommand(commandText));
});

Then("the bot is facing west", function () {
  assert.equal(this.game.bot.direction, "west");
});

Then("the bot moves {int} square north", function (distance) {
  assert.equal(this.game.bot.position.x, this.previousGame.bot.position.x);
  assert.equal(
    this.game.bot.position.y,
    this.previousGame.bot.position.y - distance
  );
});

Then("the player loses the game", function () {
  assert.equal(this.game.status, "lost");
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

function parseCommand(commandText) {
  if (commandText === "turn_left()") {
    return "turn_left";
  }

  if (commandText === "move()") {
    return "move";
  }

  if (commandText === "fire()") {
    return "fire";
  }

  throw new Error(`Unknown bot command: ${commandText}`);
}
