# Implementation Specification

JS Bot Game is implemented as a browser game with a testable TypeScript game
engine. The game runs in the browser. Development tools run on Node.js.

## Technology Stack

- Language: TypeScript
- Build tool: Vite
- Rendering: HTML Canvas
- Game logic: framework-free TypeScript modules
- Unit tests: Vitest
- BDD tests: Cucumber.js
- Browser tests: Playwright
- Package manager: npm
- Tooling runtime: Node.js
- Game runtime: browser JavaScript

## Project Structure

```text
src/
  application/
    programRunner.ts
  game/
    types.ts
    commandExecutor.ts
    mapGenerator.ts
    engine.ts
  ui/
    canvasRenderer.ts
    controlViewModels.ts
    controls.ts
    testApi.ts
  main.ts

features/
  *.feature

tests/
  game/
    *.test.ts
  e2e/
    *.spec.ts
```

## Game Engine

The game domain owns game rules and state transitions. It does not depend on the
DOM, Canvas, browser UI, user input controls, or player-code execution details.

Domain modules expose functions for creating games and executing bot commands.
`engine.ts` re-exports the public domain and application entry points for
compatibility.

```ts
createGame() -> GameState
executeCommand(gameState, "move") -> GameState
executeCommand(gameState, "turn_left") -> GameState
```

The engine represents:

- map dimensions
- square types
- bot position
- bot direction
- remaining fuel
- collected power-ups
- game status

## Types

The game uses explicit TypeScript types for core state.

```ts
type Direction = "north" | "east" | "south" | "west";
type SquareType = "empty" | "hazard" | "power-up" | "goal";
type GameStatus = "playing" | "won" | "lost";

type Position = {
  x: number;
  y: number;
};

type BotState = {
  position: Position;
  direction: Direction;
  fuel: number;
};

type MapSquare = {
  type: SquareType;
  collected?: boolean;
};

type GameState = {
  width: 8;
  height: 8;
  bot: BotState;
  squares: MapSquare[][];
  status: GameStatus;
};
```

## Map Generation

`createGame()` creates an 8-by-8 map with:

- one bot
- one goal
- 10 hazards
- 5 power-ups
- 10 starting fuel points

The bot, goal, hazards, and power-ups are placed randomly. Generated maps are
not required to be solvable.

Map generation is implemented in `src/game/mapGenerator.ts`. Randomness is
provided through an injectable random source, with `Math.random` used by
default.

## Commands

The built-in bot commands are:

- `turn_left()`
- `move()`

`turn_left()` rotates the bot 90 degrees left and costs 1 fuel point.

`move()` moves the bot one square in the direction it is facing and costs
1 fuel point.

There is no built-in `turn_right()` command. Player code can define
`turn_right()` or any other helper function using JavaScript.

## Fuel Rules

The bot starts each attempt with 10 fuel points.

Fuel is reduced after every command according to the command cost. Turning
consumes fuel. Moving consumes fuel.

If the bot finishes a command with 0 fuel and has not reached the goal, the
game status becomes `lost`.

Power-ups add exactly 5 fuel points. Fuel can exceed 10 points.

Each power-up can be collected once. Re-entering a collected power-up square
does not add fuel.

## Square Interactions

Entering an empty square changes only the bot position and command fuel cost.

Entering a hazard sets the game status to `lost`.

Moving outside the 8-by-8 map is treated as entering a hazard and sets the game
status to `lost`.

Entering a power-up square applies the move fuel cost, then adds 5 fuel points
if the power-up has not already been collected.

Entering the goal square sets the game status to `won`.

## Player Program Execution

The player writes one complete JavaScript program per attempt.

The execution environment exposes the built-in bot commands to player code:

```js
turn_left();
move();
```

Player code can use any valid JavaScript syntax, including variables,
conditionals, loops, and function declarations.

The program runs against the current game state until:

- the program completes
- the game status becomes `won`
- the game status becomes `lost`

Commands executed after the game reaches `won` or `lost` have no effect.

Player program execution is implemented in `src/application/programRunner.ts`.
The runner passes the intended game command API to the player program and uses
the domain command executor to apply command effects. Common browser globals are
shadowed for gameplay purposes; this is not a security sandbox.

## Rendering

The UI renders the map with HTML Canvas.

The renderer displays:

- the 8-by-8 grid
- the bot
- the bot direction
- hazards
- power-ups
- the goal
- current fuel
- game status

The renderer reads game state from the engine and does not implement game
rules.

## Controls

The UI provides a text input area for the player's JavaScript program and a run
control for starting an attempt.

Running a program sends the full program text to the application runner. The
result is rendered after execution.

The browser exposes a test-only state setup API only when the page is loaded
with `?testApi=1`. It is not installed on the default page.

## Unit Tests

Vitest tests cover the game engine:

- creating a game
- turning left
- moving forward
- spending fuel
- losing at 0 fuel
- entering hazards
- leaving the map
- collecting power-ups once
- exceeding the initial fuel amount
- reaching the goal

## BDD Tests

Cucumber.js step definitions execute the scenarios in `features/` against the
game engine.

## Browser Tests

Playwright tests cover the browser UI:

- the page loads
- the map is visible
- the player can enter a program
- running a program updates the game state
- win and loss messages appear correctly
