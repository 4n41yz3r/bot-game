# Implementation Plan

This plan implements the Gherkin features in `features/` using the methodology
defined in `AGENTS.md`. Work proceeds in strict red-green-refactor cycles.

## Guiding Rules

- Start every behavior with a failing test.
- Add only enough production code to pass the failing test.
- Refactor only while all tests are passing.
- Keep domain rules independent from UI, Canvas, browser APIs, and tooling.
- Use the domain language from `README.md` and `features/`.

## Phase 1: Project Tooling

Goal: create the minimum TypeScript project structure needed to run tests and
build the browser game.

Tasks:

1. Add npm project metadata.
2. Install and configure TypeScript.
3. Install and configure Vite.
4. Install and configure Vitest.
5. Install and configure Cucumber.js.
6. Install and configure Playwright.
7. Add scripts for unit tests, BDD tests, browser tests, development server,
   and production build.

Acceptance checks:

- `npm test` runs Vitest.
- `npm run bdd` runs Cucumber.js against `features/`.
- `npm run e2e` runs Playwright tests.
- `npm run build` builds the browser app.

## Phase 2: Domain Model

Goal: define the core domain types without implementing behavior beyond what is
needed for the first failing tests.

Feature coverage:

- `game_setup.feature`
- shared setup for all other feature files

Domain concepts:

- Bot
- Map
- Square
- Hazard
- Power-up
- Goal
- Fuel
- Command
- Attempt

Tasks:

1. Write a failing test for creating a game state with an 8-by-8 map.
2. Add `src/game/types.ts`.
3. Define `Direction`, `SquareType`, `GameStatus`, `Position`, `BotState`,
   `MapSquare`, and `GameState`.
4. Add a minimal `createGame()` implementation.
5. Refactor type names and file boundaries after the first passing tests.

Acceptance checks:

- A new game has width `8`.
- A new game has height `8`.
- A new game has status `playing`.
- A new game has a bot with 10 fuel points.

## Phase 3: Game Setup Feature

Goal: satisfy `features/game_setup.feature`.

Scenario:

- Generate a new game

Tasks:

1. Write failing Vitest tests for map contents.
2. Implement random placement for one bot, one goal, 10 hazards, and
   5 power-ups.
3. Ensure generated maps are not required to be solvable.
4. Add Cucumber step definitions for the setup scenario.
5. Refactor generation code behind clear domain functions.

Acceptance checks:

- The map is an 8-by-8 grid.
- The map contains 1 bot.
- The map contains 1 goal.
- The map contains 10 hazards.
- The map contains 5 power-ups.
- The bot has 10 fuel points.
- The setup Gherkin scenario passes.

## Phase 4: Bot Movement Feature

Goal: satisfy `features/bot_movement.feature`.

Scenarios:

- Turn the bot to the left
- Move the bot forward
- Lose after using the last fuel point

Tasks:

1. Write a failing test for `turn_left()` from north to west.
2. Implement direction rotation.
3. Write a failing test for `turn_left()` fuel cost.
4. Implement fuel reduction for turning.
5. Write a failing test for `move()` moving one square forward.
6. Implement position updates by direction.
7. Write a failing test for `move()` fuel cost.
8. Implement fuel reduction for movement.
9. Write a failing test for losing when a command leaves the bot at 0 fuel
   without reaching the goal.
10. Implement loss at zero fuel.
11. Add Cucumber step definitions for movement scenarios.
12. Refactor command execution into a domain service or command handler.

Acceptance checks:

- `turn_left()` rotates north to west.
- `turn_left()` costs 1 fuel point.
- `move()` moves one square in the current direction.
- `move()` costs 2 fuel points.
- A bot at 0 fuel loses if it has not reached the goal.
- All bot movement Gherkin scenarios pass.

## Phase 5: Map Interaction Feature

Goal: satisfy `features/map_interactions.feature`.

Scenarios:

- Reach the goal
- Move into a hazard
- Leave the map
- Collect a power-up
- Collect a power-up only once
- Exceed the initial fuel amount

Tasks:

1. Write a failing test for winning when moving onto the goal.
2. Implement goal detection.
3. Write a failing test for losing when moving onto a hazard.
4. Implement hazard detection.
5. Write a failing test for losing when moving outside the map.
6. Implement out-of-bounds as a hazard.
7. Write a failing test for collecting a power-up after paying move fuel cost.
8. Implement one-time power-up collection.
9. Write a failing test for re-entering an already collected power-up square.
10. Ensure collected power-ups do not grant fuel again.
11. Write a failing test for fuel exceeding 10 after collecting a power-up.
12. Ensure fuel has no maximum cap.
13. Add Cucumber step definitions for map interaction scenarios.
14. Refactor square interaction handling.

Acceptance checks:

- Entering the goal sets status to `won`.
- Entering a hazard sets status to `lost`.
- Leaving the map sets status to `lost`.
- Entering an uncollected power-up applies move cost, then adds 3 fuel points.
- Re-entering a collected power-up applies move cost only.
- Fuel can exceed 10.
- All map interaction Gherkin scenarios pass.

## Phase 6: Program Execution Feature

Goal: satisfy `features/program_execution.feature`.

Scenarios:

- Run one complete program for an attempt
- Define and use a helper function

Tasks:

1. Write a failing test proving a complete JavaScript program runs as one
   attempt.
2. Implement `runProgram(gameState, playerCode)`.
3. Expose only `turn_left()` and `move()` to player code.
4. Stop command effects after the game reaches `won` or `lost`.
5. Write a failing test for a player-defined `turn_right()` helper using three
   `turn_left()` calls.
6. Implement helper-function support through the JavaScript execution strategy.
7. Add Cucumber step definitions for program execution scenarios.
8. Refactor execution into an application-level service that depends on the
   domain engine.

Acceptance checks:

- A full JavaScript program executes as one attempt.
- Player code can define helper functions.
- Calling a player-defined `turn_right()` turns the bot right.
- The helper-function scenario consumes 3 fuel points.
- All program execution Gherkin scenarios pass.

## Phase 7: Browser UI

Goal: provide a playable browser interface without moving game rules into the
UI layer.

Tasks:

1. Write a failing Playwright test for loading the game page.
2. Implement the Vite entry point.
3. Write a failing Playwright test for rendering the map.
4. Implement the Canvas renderer.
5. Write a failing Playwright test for entering and running a program.
6. Implement the text area and run control.
7. Write failing Playwright tests for visible win and loss messages.
8. Implement game status display.
9. Refactor UI code so Canvas and controls depend on application APIs only.

Acceptance checks:

- The page loads.
- The map is visible.
- The player can enter a JavaScript program.
- Running a program updates the rendered game state.
- Win and loss states are visible to the player.

## Phase 8: Final Verification

Goal: confirm that the implementation satisfies the specifications.

Tasks:

1. Run all Vitest tests.
2. Run all Cucumber.js scenarios.
3. Run all Playwright browser tests.
4. Run the production build.
5. Review `README.md`, `IMPLEMENTATION.md`, `features/`, and `AGENTS.md` for
   alignment.

Acceptance checks:

- Unit tests pass.
- BDD tests pass.
- Browser tests pass.
- Production build succeeds.
- No implementation behavior conflicts with the source-of-truth documents.

