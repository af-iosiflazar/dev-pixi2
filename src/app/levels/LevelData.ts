import type { GameScreen } from "../screens/dungeon/GameScreen";
import type { GenerationResult } from "../screens/dungeon/DungeonGenerator";

/** A single entity placed in a pre-defined level */
export interface EntityDef {
  type: string;
  x: number;
  y: number;
  level?: number;
}

/** A single decoration placed in a pre-defined level */
export interface DecorationDef {
  type: string;
  x: number;
  y: number;
}

/** Custom behaviour hooks attached to a level */
export interface LevelHooks {
  /** Called after the level is fully loaded and rendered */
  onLoad?: (screen: GameScreen) => void;
  /** Called at the end of every turn (both player and enemy) */
  onTurn?: (screen: GameScreen) => void;
  /** Override the default win condition. Return true to trigger victory. */
  winCondition?: (screen: GameScreen) => boolean;
}

/**
 * A pre-defined puzzle level.
 *
 * The `mapText` field is a raw text file imported via `?raw`.
 * Each line is one row of the map. Characters map to tiles:
 *   `W` / `#` → Wall,  ` ` / `.` → Floor
 * All rows must be exactly MAP_WIDTH characters long,
 * and there must be exactly MAP_HEIGHT rows.
 */
export interface LevelData {
  /** Unique identifier for this level (matches the .ts filename without extension) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Optional description / hint */
  description?: string;
  /** Raw map text (from importing a `.txt?raw` file) */
  mapText: string;
  /** Where the player spawns */
  playerStart: { x: number; y: number };
  /** Enemies to place (optional — can be placed programmatically in onLoad) */
  entities?: EntityDef[];
  /** Decorations to place (optional) */
  decorations?: DecorationDef[];
  /** Custom behaviour hooks */
  hooks?: LevelHooks;
}

/** Parser output: a GenerationResult augmented with hooks */
export interface LevelResult extends GenerationResult {
  hooks?: LevelHooks;
}
