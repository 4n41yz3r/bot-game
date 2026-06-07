import assert from "node:assert/strict";

import { Then, When } from "@cucumber/cucumber";

import { createGame } from "../../src/game/engine.ts";

When("a new game is started", function () {
  this.game = createGame();
  this.createdGame = true;
});

Then("the map is an {int} by {int} grid", function (width, height) {
  assert.equal(this.game.width, width);
  assert.equal(this.game.height, height);
  assert.equal(this.game.squares.length, height);
  assert.ok(this.game.squares.every((row) => row.length === width));
});

Then("the map contains {int} bot", function (count) {
  const botCount = this.game.bot ? 1 : 0;

  assert.equal(botCount, count);
  assert.equal(isInsideMap(this.game.bot.position, this.game), true);
});

Then("the map contains {int} goal", function (count) {
  assert.equal(countSquares(this.game, "goal"), count);
});

Then("the map contains {int} hazards", function (count) {
  assert.equal(countSquares(this.game, "hazard"), count);
});

Then("the map contains {int} power-ups", function (count) {
  assert.equal(countSquares(this.game, "power-up"), count);
});

function countSquares(game, squareType) {
  return game.squares.flat().filter((square) => square.type === squareType)
    .length;
}

function isInsideMap(position, game) {
  return (
    position.x >= 0 &&
    position.x < game.width &&
    position.y >= 0 &&
    position.y < game.height
  );
}
