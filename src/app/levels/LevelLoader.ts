import { MAP_WIDTH, MAP_HEIGHT, TileType } from "../screens/dungeon/constants";
import type { GenerationResult } from "../screens/dungeon/DungeonGenerator";
import type { LevelData, LevelHooks } from "./LevelData";

// ---------------------------------------------------------------------------
// Dynamic discovery of level modules via Vite's import.meta.glob
// Every .ts file in this directory is a potential level module.
// Infrastructure files (LevelData, LevelLoader) are filtered out by name.
// ---------------------------------------------------------------------------

const levelModules = import.meta.glob<{ default: LevelData }>(
  "./*.ts",
  { eager: false },
);

/**
 * Load a puzzle level by its ID (the filename without .ts extension).
 * Returns a GenerationResult that can be passed to GameScreen.initGame().
 */
export async function loadLevel(
  id: string,
): Promise<GenerationResult & { hooks?: LevelHooks }> {
  const path = `./${id}.ts`;
  const loader = levelModules[path];
  if (!loader) {
    const available = Object.keys(levelModules)
      .filter((p) => !p.includes("Level"))
      .map((p) => p.replace("./", "").replace(".ts", ""));
    throw new Error(
      `Level "${id}" not found. Available levels: ${available.join(", ") || "(none)"}`,
    );
  }

  const mod = await loader();
  return parseLevelData(mod.default);
}

/**
 * Parse a LevelData object into a GenerationResult.
 */
export function parseLevelData(
  level: LevelData,
): GenerationResult & { hooks?: LevelHooks } {
  // Normalise line endings and trim trailing newline
  const raw = level.mapText.replace(/\r\n/g, "\n").replace(/\n$/, "");
  const lines = raw.split("\n");

  if (lines.length !== MAP_HEIGHT) {
    throw new Error(
      `Level "${level.id}": expected ${MAP_HEIGHT} rows, got ${lines.length}. ` +
        `Each row must be exactly ${MAP_WIDTH} characters.`,
    );
  }

  const tiles: TileType[][] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    const line = lines[y];
    if (line.length !== MAP_WIDTH) {
      throw new Error(
        `Level "${level.id}" row ${y}: expected ${MAP_WIDTH} characters, got ${line.length}. ` +
          `Line content: "${line.substring(0, 30)}..."`,
      );
    }

    tiles[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      const ch = line[x];
      // '.' or space = Floor, everything else = Wall
      tiles[y][x] = ch === "." || ch === " " ? TileType.Floor : TileType.Wall;
    }
  }

  return {
    tiles,
    rooms: [],
    playerStart: level.playerStart,
    entities: level.entities,
    decorations: level.decorations,
    hooks: level.hooks,
  };
}
