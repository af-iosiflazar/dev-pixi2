import { MAP_WIDTH, MAP_HEIGHT, TileType } from "./constants";
import type { Rect } from "./constants";

export interface GenerationResult {
  tiles: TileType[][];
  rooms: Rect[];
  playerStart: { x: number; y: number };
  /** Pre-defined entities (for puzzle levels — skip random placement) */
  entities?: Array<{ type: string; x: number; y: number; level?: number }>;
  /** Pre-defined decorations (for puzzle levels — skip random placement) */
  decorations?: Array<{ type: string; x: number; y: number }>;
}

function carveRoom(tiles: TileType[][], room: Rect) {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      tiles[y][x] = TileType.Floor;
    }
  }
}

function carveCorridor(
  tiles: TileType[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  let cx = x1;
  let cy = y1;

  while (cx !== x2) {
    tiles[cy][cx] = TileType.Floor;
    cx += cx < x2 ? 1 : -1;
  }
  while (cy !== y2) {
    tiles[cy][cx] = TileType.Floor;
    cy += cy < y2 ? 1 : -1;
  }
}

function roomsOverlap(room: Rect, rooms: Rect[], padding = 1): boolean {
  for (const other of rooms) {
    if (
      room.x - padding < other.x + other.w &&
      room.x + room.w + padding > other.x &&
      room.y - padding < other.y + other.h &&
      room.y + room.h + padding > other.y
    ) {
      return true;
    }
  }
  return false;
}

export function generateDungeon(): GenerationResult {
  const tiles: TileType[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    tiles[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      tiles[y][x] = TileType.Wall;
    }
  }

  const rooms: Rect[] = [];
  const maxRooms = 8;
  const minSize = 4;
  const maxSize = 9;

  for (let i = 0; i < 50; i++) {
    if (rooms.length >= maxRooms) break;

    const w = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));
    const h = minSize - 1 + Math.floor(Math.random() * (maxSize - minSize));
    const rx = 1 + Math.floor(Math.random() * (MAP_WIDTH - w - 2));
    const ry = 1 + Math.floor(Math.random() * (MAP_HEIGHT - h - 2));

    const room: Rect = { x: rx, y: ry, w, h };
    if (!roomsOverlap(room, rooms)) {
      carveRoom(tiles, room);
      rooms.push(room);
    }
  }

  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i - 1];
    const curr = rooms[i];
    const cx = Math.floor(prev.x + prev.w / 2);
    const cy = Math.floor(prev.y + prev.h / 2);
    const nx = Math.floor(curr.x + curr.w / 2);
    const ny = Math.floor(curr.y + curr.h / 2);
    carveCorridor(tiles, cx, cy, nx, ny);
  }

  const firstRoom = rooms[0];
  const playerStart = {
    x: Math.floor(firstRoom.x + firstRoom.w / 2),
    y: Math.floor(firstRoom.y + firstRoom.h / 2),
  };

  return { tiles, rooms, playerStart };
}
