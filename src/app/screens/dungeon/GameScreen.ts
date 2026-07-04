import type { Ticker } from "pixi.js";
import { Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";

import { engine } from "../../getEngine";
import { MainScreen } from "../main/MainScreen";

import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE_SIZE,
  SPRITE_SCALE,
  COLORS,
  TileType,
  TileSpriteKey,
} from "./constants";
import { generateDungeon } from "./DungeonGenerator";
import { GameMap } from "./GameMap";
import { Entity, createPlayer, createEnemy } from "./Entity";

enum GameState {
  Playing = 0,
  PlayerActed = 1,
  EnemyTurn = 2,
  Victory = 3,
  GameOver = 4,
}

export class GameScreen extends Container {
  public static assetBundles = ["default"];

  private gameState = GameState.Playing;
  private map!: GameMap;
  private player!: Entity;
  private enemies: Entity[] = [];
  private messages: string[] = [];
  private turnCount = 0;

  private mapContainer: Container;
  private tileContainer: Container;
  private entityContainer: Container;
  private mapGraphics: Graphics;
  private uiContainer: Container;
  private hpText: Text;
  private turnText: Text;
  private messageTexts: Text[];
  private overlayText: Text;

  private screenWidth = 768;
  private screenHeight = 1024;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private keysPressed = new Set<string>();
  private lastActionTime = 0;
  private readonly ACTION_COOLDOWN = 150;

  constructor() {
    super();

    this.mapContainer = new Container();
    this.addChild(this.mapContainer);

    this.tileContainer = new Container();
    this.mapContainer.addChild(this.tileContainer);

    this.mapGraphics = new Graphics();
    this.mapContainer.addChild(this.mapGraphics);

    this.entityContainer = new Container();
    this.mapContainer.addChild(this.entityContainer);

    this.uiContainer = new Container();
    this.addChild(this.uiContainer);

    const textStyle = new TextStyle({
      fontFamily: "monospace",
      fontSize: 14,
      fill: COLORS.uiText,
    });

    this.hpText = new Text({ style: textStyle });
    this.uiContainer.addChild(this.hpText);

    this.turnText = new Text({
      style: new TextStyle({
        fontFamily: "monospace",
        fontSize: 12,
        fill: COLORS.uiDim,
      }),
    });
    this.uiContainer.addChild(this.turnText);

    this.messageTexts = [];
    for (let i = 0; i < 3; i++) {
      const t = new Text({
        style: new TextStyle({
          fontFamily: "monospace",
          fontSize: 12,
          fill: COLORS.uiDim,
        }),
      });
      this.messageTexts.push(t);
      this.uiContainer.addChild(t);
    }

    this.overlayText = new Text({
      style: new TextStyle({
        fontFamily: "monospace",
        fontSize: 24,
        fill: COLORS.uiAccent,
        fontWeight: "bold",
      }),
    });
    this.overlayText.anchor.set(0.5);
    this.overlayText.visible = false;
    this.addChild(this.overlayText);

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
  }

  prepare() {
    this.initGame();
  }

  async show() {
    document.addEventListener("keydown", this.boundKeyDown);
    document.addEventListener("keyup", this.boundKeyUp);
    this.visible = true;
  }

  async hide() {
    document.removeEventListener("keydown", this.boundKeyDown);
    document.removeEventListener("keyup", this.boundKeyUp);
    this.visible = false;
  }

  async pause() {
    this.keysPressed.clear();
  }

  async resume() {}

  reset() {
    this.keysPressed.clear();
    this.enemies = [];
    this.messages = [];
    this.tileContainer.removeChildren();
    this.entityContainer.removeChildren();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_time: Ticker) {
    if (this.gameState === GameState.Playing) {
      this.processInput();
    }
  }

  resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
    this.updateCamera();
    this.layoutUI();
  }

  private initGame() {
    const result = generateDungeon();
    this.map = new GameMap(result.tiles);
    this.enemies = [];
    this.messages = [];
    this.turnCount = 0;
    this.gameState = GameState.Playing;

    this.player = createPlayer(result.playerStart.x, result.playerStart.y);
    this.map.computeFOV(this.player.x, this.player.y);

    for (let i = 1; i < result.rooms.length; i++) {
      const room = result.rooms[i];
      const numEnemies = 1 + Math.floor(Math.random() * 2);
      for (let e = 0; e < numEnemies; e++) {
        const ex = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
        const ey = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
        const enemy = createEnemy(ex, ey, 1);
        this.enemies.push(enemy);
      }
    }

    // Create tile sprites
    this.tileContainer.removeChildren();
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.map.tiles[y][x];
        const textureKey =
          tile === TileType.Wall
            ? this.getWallTextureKey(x, y)
            : TileSpriteKey.floor[
                Math.floor(Math.random() * TileSpriteKey.floor.length)
              ];
        const sprite = new Sprite(Texture.from(`${textureKey}.png`));
        sprite.scale.set(SPRITE_SCALE);
        sprite.x = x * TILE_SIZE;
        sprite.y = y * TILE_SIZE;
        sprite.visible = false;
        this.tileContainer.addChild(sprite);
      }
    }

    // Add entity sprites
    this.entityContainer.removeChildren();
    this.entityContainer.addChild(this.player.sprite);
    this.entityContainer.addChild(this.player.hpBar);
    for (const enemy of this.enemies) {
      this.entityContainer.addChild(enemy.sprite);
      this.entityContainer.addChild(enemy.hpBar);
    }

    this.overlayText.visible = false;
    this.addMessage("You descend into the dungeon...");
    this.render();
  }

  /** Pick the right wall sprite based on which neighbors are floor tiles */
  private getWallTextureKey(x: number, y: number): string {
    const isFloor = (cx: number, cy: number) =>
      cy >= 0 && cy < MAP_HEIGHT && cx >= 0 && cx < MAP_WIDTH
        ? this.map.tiles[cy][cx] === TileType.Floor
        : false;

    const w = isFloor(x - 1, y);
    const e = isFloor(x + 1, y);

    // Side edges — show adjacent face
    if (w && !e) return TileSpriteKey.wallLeft;
    if (e && !w) return TileSpriteKey.wallRight;

    // Default: wall face (mid)
    return TileSpriteKey.wall;
  }

  private handleKeyDown(event: KeyboardEvent) {
    this.keysPressed.add(event.key);
    event.preventDefault();
  }

  private handleKeyUp(event: KeyboardEvent) {
    this.keysPressed.delete(event.key);
  }

  private processInput() {
    if (
      this.gameState === GameState.Victory ||
      this.gameState === GameState.GameOver
    ) {
      if (
        this.keysPressed.has("Enter") ||
        this.keysPressed.has("r") ||
        this.keysPressed.has("R")
      ) {
        this.keysPressed.clear();
        this.initGame();
        return;
      }
      if (
        this.keysPressed.has("Escape") ||
        this.keysPressed.has("q") ||
        this.keysPressed.has("Q")
      ) {
        this.keysPressed.clear();
        engine().navigation.showScreen(MainScreen);
        return;
      }
      return;
    }

    let dx = 0;
    let dy = 0;

    if (this.keysPressed.has("ArrowUp") || this.keysPressed.has("w")) dy = -1;
    else if (this.keysPressed.has("ArrowDown") || this.keysPressed.has("s"))
      dy = 1;
    else if (this.keysPressed.has("ArrowLeft") || this.keysPressed.has("a"))
      dx = -1;
    else if (this.keysPressed.has("ArrowRight") || this.keysPressed.has("d"))
      dx = 1;
    else return;

    this.keysPressed.clear();

    if (dx === 0 && dy === 0) return;

    const now = performance.now();
    if (now - this.lastActionTime < this.ACTION_COOLDOWN) return;
    this.lastActionTime = now;

    this.handlePlayerAction(dx, dy);
  }

  private handlePlayerAction(dx: number, dy: number) {
    const targetX = this.player.x + dx;
    const targetY = this.player.y + dy;

    if (!this.map.isWalkable(targetX, targetY)) {
      this.addMessage("You bump into a wall.");
      return;
    }

    const enemyAtTarget = this.enemies.find(
      (e) => e.x === targetX && e.y === targetY && e.isAlive,
    );

    if (enemyAtTarget) {
      const damage = this.player.attack - enemyAtTarget.defense;
      const actualDmg = Math.max(1, damage);
      enemyAtTarget.hp -= actualDmg;
      this.addMessage(`You hit ${enemyAtTarget.name} for ${actualDmg} damage.`);

      if (!enemyAtTarget.isAlive) {
        this.addMessage(`${enemyAtTarget.name} dies!`);
      }
    } else {
      this.player.x = targetX;
      this.player.y = targetY;
    }

    this.gameState = GameState.PlayerActed;
    this.enemyTurn();
  }

  private enemyTurn() {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      if (!this.map.visible[enemy.y][enemy.x]) continue;

      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.abs(dx) + Math.abs(dy);

      if (dist <= 1) {
        const damage = enemy.attack - this.player.defense;
        const actualDmg = Math.max(1, damage);
        this.player.hp -= actualDmg;
        this.addMessage(`${enemy.name} hits you for ${actualDmg} damage.`);
        continue;
      }

      if (dist <= 8) {
        const nextStep = this.map.findPath(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y,
        );
        if (nextStep) {
          const blocked = this.enemies.some(
            (e) =>
              e !== enemy &&
              e.x === nextStep.x &&
              e.y === nextStep.y &&
              e.isAlive,
          );
          if (!blocked) {
            enemy.x = nextStep.x;
            enemy.y = nextStep.y;
          }
        }
      }
    }

    this.checkGameState();
    this.turnCount++;

    this.map.computeFOV(this.player.x, this.player.y);
    this.render();

    this.gameState = GameState.Playing;
  }

  private checkGameState() {
    if (!this.player.isAlive) {
      this.gameState = GameState.GameOver;
      this.addMessage("You have been defeated!");
      this.showOverlay("GAME OVER\n\nPress R to restart\nPress Q to quit");
      return;
    }

    const aliveEnemies = this.enemies.filter((e) => e.isAlive);
    if (aliveEnemies.length === 0) {
      this.gameState = GameState.Victory;
      this.addMessage("You cleared the dungeon!");
      this.showOverlay("VICTORY!\n\nPress R to play again\nPress Q to quit");
    }
  }

  private showOverlay(text: string) {
    this.overlayText.text = text;
    this.overlayText.visible = true;
  }

  private addMessage(msg: string) {
    this.messages.push(msg);
    if (this.messages.length > 10) {
      this.messages.splice(0, this.messages.length - 10);
    }
  }

  private updateCamera() {
    const camX =
      this.screenWidth / 2 - this.player.x * TILE_SIZE - TILE_SIZE / 2;
    const camY =
      this.screenHeight / 2 - this.player.y * TILE_SIZE - TILE_SIZE / 2;

    const maxX = 0;
    const maxY = 0;
    const minX = -(MAP_WIDTH * TILE_SIZE - this.screenWidth);
    const minY = -(MAP_HEIGHT * TILE_SIZE - this.screenHeight);

    this.mapContainer.x = Math.max(minX, Math.min(maxX, camX));
    this.mapContainer.y = Math.max(minY, Math.min(maxY, camY));
  }

  private layoutUI() {
    const margin = 8;
    this.hpText.x = margin;
    this.hpText.y = margin;

    this.turnText.x = margin;
    this.turnText.y = margin + 20;

    const msgY = this.screenHeight - 60;
    for (let i = 0; i < this.messageTexts.length; i++) {
      this.messageTexts[i].x = margin;
      this.messageTexts[i].y = msgY + i * 18;
    }

    this.overlayText.x = this.screenWidth / 2;
    this.overlayText.y = this.screenHeight / 2;
  }

  private render() {
    this.renderTiles();
    this.renderEntities();
    this.updateUI();
  }

  private renderTiles() {
    for (let i = 0; i < this.tileContainer.children.length; i++) {
      const sprite = this.tileContainer.children[i];
      const x = i % MAP_WIDTH;
      const y = Math.floor(i / MAP_WIDTH);

      if (!this.map.explored[y][x]) {
        sprite.visible = false;
        continue;
      }

      sprite.visible = true;
      if (this.map.visible[y][x]) {
        sprite.tint = 0xffffff;
      } else {
        sprite.tint = 0x555555;
      }
    }
  }

  private renderEntities() {
    this.player.draw();
    for (const enemy of this.enemies) {
      if (enemy.isAlive && this.map.visible[enemy.y][enemy.x]) {
        enemy.draw();
        enemy.sprite.visible = true;
        enemy.hpBar.visible = true;
      } else {
        enemy.sprite.visible = false;
        enemy.hpBar.visible = false;
      }
    }
  }

  private updateUI() {
    this.hpText.text = `HP: ${this.player.hp}/${this.player.maxHp}`;

    if (this.player.hp < this.player.maxHp * 0.3) {
      this.hpText.style = new TextStyle({
        fontFamily: "monospace",
        fontSize: 14,
        fill: COLORS.playerHurt,
      });
    } else {
      this.hpText.style = new TextStyle({
        fontFamily: "monospace",
        fontSize: 14,
        fill: COLORS.uiText,
      });
    }

    this.turnText.text = `Turn: ${this.turnCount} | Enemies: ${this.enemies.filter((e) => e.isAlive).length}`;

    for (let i = 0; i < this.messageTexts.length; i++) {
      const idx = this.messages.length - this.messageTexts.length + i;
      if (idx >= 0 && idx < this.messages.length) {
        this.messageTexts[i].text = this.messages[idx];
        this.messageTexts[i].visible = true;
      } else {
        this.messageTexts[i].visible = false;
      }
    }

    this.updateCamera();
  }
}
