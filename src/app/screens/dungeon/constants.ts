export const MAP_WIDTH = 60;
export const MAP_HEIGHT = 40;
export const TILE_SIZE = 32;
export const SIGHT_RADIUS = 8;

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

export const COLORS = {
  wallVisible: 0x888888,
  wallExplored: 0x333333,
  floorVisible: 0x666666,
  floorExplored: 0x222222,
  player: 0x44ff44,
  playerHurt: 0xff4444,
  enemy: 0xff4444,
  enemyHurt: 0xff8888,
  hpBar: 0x00ff00,
  hpBarBg: 0x333333,
  hpBarBorder: 0x555555,
  uiText: 0xffffff,
  uiDim: 0x888888,
  uiAccent: 0xffcc00,
};
