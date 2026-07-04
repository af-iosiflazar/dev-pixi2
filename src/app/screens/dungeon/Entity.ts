import { AnimatedSprite, Graphics, Texture } from "pixi.js";

import {
  TILE_SIZE,
  SPRITE_SCALE,
  COLORS,
  EntitySpriteConfig,
  IDLE_ANIM_SPEED,
} from "./constants";

export class Entity {
  x: number;
  y: number;
  name: string;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  sprite: AnimatedSprite;
  hpBar: Graphics;

  constructor(config: {
    x: number;
    y: number;
    name: string;
    spritePrefix: string;
    frameCount: number;
    hp: number;
    attack: number;
    defense: number;
  }) {
    this.x = config.x;
    this.y = config.y;
    this.name = config.name;
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.attack = config.attack;
    this.defense = config.defense;

    // Create animated sprite from spritesheet frames
    const textures = Array.from({ length: config.frameCount }, (_, i) =>
      Texture.from(`${config.spritePrefix}_f${i}.png`),
    );
    this.sprite = new AnimatedSprite(textures);
    this.sprite.scale.set(SPRITE_SCALE);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.animationSpeed = IDLE_ANIM_SPEED;
    this.sprite.play();
    this.sprite.x = this.x * TILE_SIZE + TILE_SIZE / 2;
    this.sprite.y = this.y * TILE_SIZE + TILE_SIZE;

    this.hpBar = new Graphics();
  }

  draw() {
    this.sprite.x = this.x * TILE_SIZE + TILE_SIZE / 2;
    this.sprite.y = this.y * TILE_SIZE + TILE_SIZE;

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
  const cfg = EntitySpriteConfig.Player;
  return new Entity({
    x,
    y,
    name: "Player",
    spritePrefix: cfg.prefix,
    frameCount: cfg.frames,
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
  const cfg = EntitySpriteConfig[name] ?? EntitySpriteConfig.Goblin;

  return new Entity({
    x,
    y,
    name,
    spritePrefix: cfg.prefix,
    frameCount: cfg.frames,
    hp,
    attack,
    defense,
  });
}
