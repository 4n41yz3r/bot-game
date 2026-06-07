# Agent Instructions

This file defines how agents work in this repository.

## Project Summary

JavaScript Bot is a browser game for teaching children programming with
JavaScript. The player writes one complete JavaScript program per attempt to
guide a bot across an 8-by-8 grid.

## Source of Truth

- `README.md` defines the game rules.
- `IMPLEMENTATION.md` defines implementation details.
- `features/` defines executable behavior specifications.
- `AGENTS.md` defines development rules and methodology for agents.

When these files conflict, stop and ask the user for clarification before
changing behavior.

## Development Methodology

Follow test-driven development strictly.

Use the three rules of TDD:
1. Do not write production code until there is a failing test.
2. Do not write more test code than necessary to fail.
3. Do not write more production code than necessary to pass the failing test.

Do not skip the red step unless the user explicitly asks for documentation-only
or planning-only changes.

## Architecture

Use Clean Architecture.

Dependencies point inward:

- UI depends on application use cases.
- Application use cases depend on domain concepts.
- Domain code depends on nothing external.
- Infrastructure depends on inner layers, never the reverse.

The domain and application layers must not depend on the DOM, Canvas, browser
APIs, storage APIs, test frameworks, or build tooling.

## Domain-Driven Design

Use the domain language from `README.md` and `features/`.

Core domain concepts include:
- Bot
- Map
- Square
- Hazard
- Power-up
- Goal
- Fuel
- Command
- Attempt

Keep game rules in the domain layer. Do not hide game rules inside UI code,
rendering code, test code, or infrastructure adapters.

## Testing Rules

Every behavior change starts with a failing test.

Use:
- Vitest for domain and application tests.
- Cucumber.js for Gherkin feature coverage.
- Playwright for browser-level UI tests.

Prefer domain tests over UI tests for game rules. Use browser tests for browser
behavior, integration, and user-visible flows.

## Editing Rules

- Do not edit `README.md`, `IMPLEMENTATION.md`, and `features/`.
- Do not introduce new frameworks or libraries without asking first.