import { Graphics } from "pixi.js";

import { TILE_SIZE, COLORS } from "./constants";

export class Entity {
  x: number;
  y: number;
  name: string;
  color: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  graphics: Graphics;
  hpBar: Graphics;

  constructor(config: {
    x: number;
    y: number;
    name: string;
    color: number;
    hp: number;
    attack: number;
    defense: number;
  }) {
    this.x = config.x;
    this.y = config.y;
    this.name = config.name;
    this.color = config.color;
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.attack = config.attack;
    this.defense = config.defense;
    this.graphics = new Graphics();
    this.hpBar = new Graphics();
  }

  draw() {
    this.graphics.clear();
    this.graphics
      .circle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 3)
      .fill({ color: this.color });
    this.graphics.x = this.x * TILE_SIZE;
    this.graphics.y = this.y * TILE_SIZE;

    this.hpBar.clear();
    if (this.hp < this.maxHp) {
      const barW = TILE_SIZE - 4;
      const barH = 4;
      const barX = this.x * TILE_SIZE + 2;
      const barY = this.y * TILE_SIZE - 6;
      this.hpBar.rect(barX, barY, barW, barH).fill({ color: COLORS.hpBarBg });
      this.hpBar
        .rect(barX, barY, barW * (this.hp / this.maxHp), barH)
        .fill({ color: COLORS.hpBar });
    }
  }

  takeDamage(amount: number): number {
    const damage = Math.max(1, amount - this.defense);
    this.hp -= damage;
    return damage;
  }

  get isAlive(): boolean {
    return this.hp > 0;
  }
}

export function createPlayer(x: number, y: number): Entity {
  return new Entity({
    x,
    y,
    name: "Player",
    color: COLORS.player,
    hp: 30,
    attack: 5,
    defense: 2,
  });
}

export function createEnemy(x: number, y: number, level: number): Entity {
  const hp = 8 + level * 2;
  const attack = 3 + level;
  const defense = 1 + Math.floor(level / 2);
  const names = ["Goblin", "Orc", "Skeleton", "Bat", "Slime"];
  const name = names[Math.floor(Math.random() * names.length)];

  return new Entity({
    x,
    y,
    name,
    color: COLORS.enemy,
    hp,
    attack,
    defense,
  });
}
