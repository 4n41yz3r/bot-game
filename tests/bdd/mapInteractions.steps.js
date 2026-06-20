import assert from "node:assert/strict";

import { Given, Then, When } from "@cucumber/cucumber";

import { executeCommand } from "../../src/game/commandExecutor.ts";

Given("the square in front of the bot is the goal", function () {
  ensureGame(this);
  setSquareInFront(this.game, { type: "goal" });
});

Given("the square in front of the bot is a hazard", function () {
  ensureGame(this);
  setSquareInFront(this.game, { type: "hazard" });
});

Given("the bot is at the edge of the map", function () {
  ensureGame(this);
  this.game.bot.position = { x: 3, y: 0 };
});

Given("the bot is facing away from the map", function () {
  ensureGame(this);
  this.game.bot.direction = "north";
});

Given("the square in front of the bot is a power-up", function () {
  ensureGame(this);
  setSquareInFront(this.game, { type: "power-up" });
});

Given("a hazard is {int} squares in front of the bot", function (distance) {
  ensureGame(this);
  this.hazardPosition = positionInFront(this.game, distance);
  this.game.squares[this.hazardPosition.y][this.hazardPosition.x] = {
    type: "hazard"
  };
});

Given("a power-up is {int} square in front of the bot", function (distance) {
  ensureGame(this);
  this.powerUpPosition = positionInFront(this.game, distance);
  this.game.squares[this.powerUpPosition.y][this.powerUpPosition.x] = {
    type: "power-up"
  };
});

Given("the bot has already collected a power-up", function () {
  ensureGame(this);
  setSquareInFront(this.game, { type: "power-up", collected: true });
});

When("the bot moves onto the same power-up square again", function () {
  ensureGame(this);
  this.previousGame = structuredClone(this.game);
  this.game = executeCommand(this.game, "move");
});

Then("the player wins the game", function () {
  assert.equal(this.game.status, "won");
});

Then("the bot is destroyed", function () {
  assert.equal(this.game.status, "lost");
});

Then("the hazard is destroyed", function () {
  assert.deepEqual(squareAt(this.game, this.hazardPosition), { type: "empty" });
});

Then("the power-up is destroyed", function () {
  assert.deepEqual(squareAt(this.game, this.powerUpPosition), {
    type: "empty"
  });
});

Then("the hazard remains", function () {
  assert.deepEqual(squareAt(this.game, this.hazardPosition), {
    type: "hazard"
  });
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

function setSquareInFront(game, square) {
  const position = positionInFront(game);

  game.squares[position.y][position.x] = square;
}

function positionInFront(game, distance = 1) {
  const offsets = {
    north: { x: 0, y: -1 },
    east: { x: 1, y: 0 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 }
  };
  const offset = offsets[game.bot.direction];

  return {
    x: game.bot.position.x + offset.x * distance,
    y: game.bot.position.y + offset.y * distance
  };
}

function squareAt(game, position) {
  return game.squares[position.y][position.x];
}
