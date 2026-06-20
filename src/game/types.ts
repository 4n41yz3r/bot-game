export type Direction = "north" | "east" | "south" | "west";

export type SquareType = "empty" | "hazard" | "power-up" | "goal";

export type GameStatus = "playing" | "won" | "lost";

export type BotCommand = "turn_left" | "move" | "fire";

export type Position = {
  x: number;
  y: number;
};

export type BotState = {
  position: Position;
  direction: Direction;
  fuel: number;
};

export type MapSquare = {
  type: SquareType;
  collected?: boolean;
};

export type GameState = {
  width: 8;
  height: 8;
  bot: BotState;
  squares: MapSquare[][];
  status: GameStatus;
};

export type GameResult = {
  state: GameState;
  attempts: 1;
};
