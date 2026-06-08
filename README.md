# JavaScript Bot

JavaScript Bot is a planned programming game for teaching children basic
programming concepts. The player writes a JavaScript program that guides a bot
across a map. The bot must reach the goal before it runs out of fuel or moves
into a hazard.

## How to Play

The player writes and runs one complete program per attempt. Any valid
JavaScript code is allowed, including variables, conditionals, loops, and
player-defined helper functions.

The bot provides two built-in commands:

| Command | Effect | Fuel cost |
| --- | --- | ---: |
| `turn_left()` | Turns the bot 90 degrees to the left. | 1 point |
| `move()` | Moves the bot one square in the direction it is facing. | 1 point |

There is no built-in `turn_right()` command. A player can turn right by calling
`turn_left()` three times, or define a helper function such as:

```js
function turn_right() {
  turn_left();
  turn_left();
  turn_left();
}
```

## Map

Each game uses an 8-by-8 grid. The bot, goal, hazards, and power-ups are placed
randomly. A generated map is not guaranteed to be solvable.

Squares can contain:

| Square | Effect |
| --- | --- |
| Empty | Nothing happens. |
| Hazard | The bot is destroyed and the player loses the game. |
| Power-up | The bot gains 5 fuel points the first time it enters the square. |
| Goal | The player wins the game. |

Any position outside the map is treated as a hazard.

## Fuel and Outcomes

The bot starts each attempt with 10 fuel points. Fuel can exceed 10 points after
collecting power-ups.

The player wins when the bot enters the goal square. The player loses if the bot
moves into a hazard, leaves the map, or finishes a command with zero fuel
without having reached the goal.

## Initial Setup

Each game starts with:

- one bot
- one goal
- 10 hazards
- 5 power-ups
- 10 fuel points
