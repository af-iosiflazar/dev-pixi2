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

/** Map entity names to their sprite animation config (prefix + frame count) */
export const EntitySpriteConfig: Record<
  string,
  { prefix: string; frames: number }
> = {
  Player: { prefix: "knight_m_idle_anim", frames: 4 },
  Goblin: { prefix: "goblin_idle_anim", frames: 4 },
  Orc: { prefix: "orc_warrior_idle_anim", frames: 4 },
  Skeleton: { prefix: "skelet_idle_anim", frames: 4 },
  Bat: { prefix: "imp_idle_anim", frames: 4 },
  Slime: { prefix: "slug_anim", frames: 4 },
};

/** Animation speed for idle sprites (1 = 60fps, 0.15 ≈ 9fps) */
export const IDLE_ANIM_SPEED = 0.15;

/** Decoration sprite configs (prefix + frame count) */
export const DecorationSpriteConfig = {
  Chest: { prefix: "chest_full_open_anim", frames: 3 },
  Coin: { prefix: "coin_anim", frames: 4 },
  PotionRed: { prefix: "flask_red", frames: 1 },
  PotionBlue: { prefix: "flask_blue", frames: 1 },
  PotionGreen: { prefix: "flask_green", frames: 1 },
  PotionYellow: { prefix: "flask_yellow", frames: 1 },
} as const;

export type DecorationType = keyof typeof DecorationSpriteConfig;

/** How many of each decoration type to place per room (after first room) */
export const DECORATIONS_PER_ROOM = {
  Chest: 1,
  Coin: 2,
  PotionRed: 0.3, // 30% chance
  PotionBlue: 0.3,
  PotionGreen: 0.2,
  PotionYellow: 0.2,
} as const satisfies Record<DecorationType, number>;

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
