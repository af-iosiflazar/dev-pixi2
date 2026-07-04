export const MAP_WIDTH = 60;
export const MAP_HEIGHT = 40;
export const TILE_SIZE = 32;
export const SIGHT_RADIUS = 8;

/** Native pixel size of the tileset sprites (before scaling) */
export const TILE_SET_SIZE = 16;
/** Scale factor from tileset native size to game tile size */
export const SPRITE_SCALE = TILE_SIZE / TILE_SET_SIZE; // 2

export enum TileType {
  Wall = 0,
  Floor = 1,
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Sprite frame names from the dungeon spritesheet (without .png extension) */
export const TileSpriteKey = {
  floor: [
    "floor_1",
    "floor_2",
    "floor_3",
    "floor_4",
    "floor_5",
    "floor_6",
    "floor_7",
    "floor_8",
  ],
  wall: "wall_mid",
  wallTop: "wall_top_mid",
  wallLeft: "wall_left",
  wallRight: "wall_right",
  wallTopLeft: "wall_top_left",
  wallTopRight: "wall_top_right",
  wallOuterTopLeft: "wall_outer_top_left",
  wallOuterTopRight: "wall_outer_top_right",
} as const;

/** Map entity names to their sprite frame key */
export const EntitySpriteKey: Record<string, string> = {
  Player: "knight_m_idle_anim_f0",
  Goblin: "goblin_idle_anim_f0",
  Orc: "orc_warrior_idle_anim_f0",
  Skeleton: "skelet_idle_anim_f0",
  Bat: "imp_idle_anim_f0",
  Slime: "slug_anim_f0",
};

export const COLORS = {
  playerHurt: 0xff4444,
  enemyHurt: 0xff8888,
  hpBar: 0x00ff00,
  hpBarBg: 0x333333,
  hpBarBorder: 0x555555,
  uiText: 0xffffff,
  uiDim: 0x888888,
  uiAccent: 0xffcc00,
};
