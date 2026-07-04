import { MAP_WIDTH, MAP_HEIGHT, SIGHT_RADIUS, TileType } from "./constants";

export class GameMap {
  tiles: TileType[][];
  visible: boolean[][];
  explored: boolean[][];

  constructor(tiles: TileType[][]) {
    this.tiles = tiles;
    this.visible = [];
    this.explored = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
      this.visible[y] = [];
      this.explored[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        this.visible[y][x] = false;
        this.explored[y][x] = false;
      }
    }
  }

  isWalkable(x: number, y: number): boolean {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
    return this.tiles[y][x] !== TileType.Wall;
  }

  isWall(x: number, y: number): boolean {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return true;
    return this.tiles[y][x] === TileType.Wall;
  }

  private hasLineOfSight(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ): boolean {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0;
    let y = y0;

    while (x !== x1 || y !== y1) {
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }

      if (x === x1 && y === y1) break;
      if (this.isWall(x, y)) return false;
    }

    return true;
  }

  computeFOV(px: number, py: number) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        this.visible[y][x] = false;
      }
    }

    this.visible[py][px] = true;
    this.explored[py][px] = true;

    const radiusSq = SIGHT_RADIUS * SIGHT_RADIUS;

    for (let y = py - SIGHT_RADIUS; y <= py + SIGHT_RADIUS; y++) {
      for (let x = px - SIGHT_RADIUS; x <= px + SIGHT_RADIUS; x++) {
        if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) continue;
        if (x === px && y === py) continue;

        const dx = x - px;
        const dy = y - py;
        if (dx * dx + dy * dy > radiusSq) continue;

        if (this.hasLineOfSight(px, py, x, y)) {
          this.visible[y][x] = true;
          this.explored[y][x] = true;
        }
      }
    }
  }

  findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    maxDist = 20,
  ): { x: number; y: number } | null {
    const visited = new Set<number>();
    const queue: { x: number; y: number; px: number; py: number }[] = [];
    const key = (x: number, y: number) => y * MAP_WIDTH + x;

    queue.push({ x: startX, y: startY, px: startX, py: startY });
    visited.add(key(startX, startY));

    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      const dist = Math.abs(cur.x - startX) + Math.abs(cur.y - startY);
      if (dist > maxDist) continue;

      if (cur.x === targetX && cur.y === targetY) {
        let node = cur;
        while (node.px !== startX || node.py !== startY) {
          for (const q of queue) {
            if (q.x === node.px && q.y === node.py) {
              node = q;
              break;
            }
          }
        }
        return { x: node.x, y: node.y };
      }

      const dirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];
      for (const d of dirs) {
        const nx = cur.x + d.x;
        const ny = cur.y + d.y;
        const k = key(nx, ny);
        if (visited.has(k)) continue;
        if (!this.isWalkable(nx, ny)) continue;

        visited.add(k);
        queue.push({ x: nx, y: ny, px: cur.x, py: cur.y });
      }
    }

    return null;
  }
}
