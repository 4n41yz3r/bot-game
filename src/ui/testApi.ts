import type { GameState, MapSquare, Position } from "../game/types";

export type GameTestApi = {
  setGameState(gameState: GameState): void;
  setSquare(position: Position, square: MapSquare): void;
};

export function shouldInstallTestApi(location: Pick<Location, "search">): boolean {
  return new URLSearchParams(location.search).get("testApi") === "1";
}

export function installTestApi(api: GameTestApi): void {
  window.jsBotGameTestApi = api;
}

declare global {
  interface Window {
    jsBotGameTestApi?: GameTestApi;
  }
}
