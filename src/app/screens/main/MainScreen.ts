import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container, Sprite, Text, TextStyle, Texture } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { StoneButton } from "../../ui/StoneButton";

import { GameScreen } from "../dungeon/GameScreen";

import { TILE_SIZE, SPRITE_SCALE, TileSpriteKey } from "../dungeon/constants";

const ROOM_W = 28;
const ROOM_H = 18;

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main", "default"];

  private dungeonContainer: Container;
  private titleText: Text;
  private playButton: StoneButton;
  private tutorialButton: StoneButton;
  private settingsButton: StoneButton;
  constructor() {
    super();

    // --- Dungeon background ---
    this.dungeonContainer = new Container();
    this.addChild(this.dungeonContainer);

    const ox = -(ROOM_W * TILE_SIZE * SPRITE_SCALE) / 2;
    const oy = -(ROOM_H * TILE_SIZE * SPRITE_SCALE) / 2;

    for (let y = 0; y < ROOM_H; y++) {
      for (let x = 0; x < ROOM_W; x++) {
        const isEdge =
          x === 0 || x === ROOM_W - 1 || y === 0 || y === ROOM_H - 1;
        let key: string;
        if (isEdge) {
          if (y === 0 || y === ROOM_H - 1) key = TileSpriteKey.wall;
          else if (x === 0) key = TileSpriteKey.wallRight;
          else key = TileSpriteKey.wallLeft;
        } else {
          key =
            TileSpriteKey.floor[
              Math.floor(Math.random() * TileSpriteKey.floor.length)
            ];
        }
        const sprite = new Sprite(Texture.from(`${key}.png`));
        sprite.scale.set(SPRITE_SCALE);
        sprite.x = ox + x * TILE_SIZE * SPRITE_SCALE;
        sprite.y = oy + y * TILE_SIZE * SPRITE_SCALE;
        this.dungeonContainer.addChild(sprite);
      }
    }

    // --- Decorative chests in the room ---
    const chestPositions = [
      { x: 3, y: Math.floor(ROOM_H / 2) },
      { x: ROOM_W - 4, y: Math.floor(ROOM_H / 2) },
    ];
    for (const pos of chestPositions) {
      const chest = new Sprite(Texture.from("chest_full_open_anim_f0.png"));
      chest.scale.set(SPRITE_SCALE);
      chest.anchor.set(0.5, 0.5);
      chest.x =
        ox + pos.x * TILE_SIZE * SPRITE_SCALE + (TILE_SIZE * SPRITE_SCALE) / 2;
      chest.y =
        oy + pos.y * TILE_SIZE * SPRITE_SCALE + (TILE_SIZE * SPRITE_SCALE) / 2;
      this.dungeonContainer.addChild(chest);
    }

    // --- Potions on a side table area ---
    const potionPositions = [
      { x: 6, y: 4 },
      { x: 6, y: 6 },
      { x: ROOM_W - 7, y: 4 },
      { x: ROOM_W - 7, y: 6 },
    ];
    const potionTypes = [
      "flask_red",
      "flask_blue",
      "flask_green",
      "flask_yellow",
    ];
    for (let i = 0; i < potionPositions.length; i++) {
      const potion = new Sprite(
        Texture.from(`${potionTypes[i % potionTypes.length]}.png`),
      );
      potion.scale.set(SPRITE_SCALE);
      potion.anchor.set(0.5, 0.5);
      potion.x =
        ox +
        potionPositions[i].x * TILE_SIZE * SPRITE_SCALE +
        (TILE_SIZE * SPRITE_SCALE) / 2;
      potion.y =
        oy +
        potionPositions[i].y * TILE_SIZE * SPRITE_SCALE +
        (TILE_SIZE * SPRITE_SCALE) / 2;
      this.dungeonContainer.addChild(potion);
    }

    // --- Title ---
    this.titleText = new Text({
      text: "DUNGEON\nCRAWLER",
      style: new TextStyle({
        fontFamily: "monospace",
        fontSize: 64,
        fill: 0xffcc00,
        fontWeight: "bold",
        align: "center",
        dropShadow: {
          color: 0x000000,
          blur: 6,
          distance: 4,
        },
      }),
    });
    this.titleText.anchor.set(0.5);
    this.addChild(this.titleText);

    // --- Buttons ---
    this.settingsButton = new StoneButton({
      text: "Settings",
      width: 200,
      height: 60,
      fontSize: 24,
    });
    this.settingsButton.onPress = () =>
      engine().navigation.presentPopup(SettingsPopup);
    this.addChild(this.settingsButton);

    this.playButton = new StoneButton({
      text: "Enter the Dungeon",
      width: 320,
      height: 80,
      fontSize: 28,
    });
    this.playButton.onPress = () => engine().navigation.showScreen(GameScreen);
    this.addChild(this.playButton);

    this.tutorialButton = new StoneButton({
      text: "Tutorial",
      width: 200,
      height: 60,
      fontSize: 24,
    });
    this.tutorialButton.onPress = () => {
      GameScreen.nextLevelId = "tutorial";
      engine().navigation.showScreen(GameScreen);
    };
    this.addChild(this.tutorialButton);
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {}

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.interactiveChildren = false;
  }

  /** Resume gameplay */
  public async resume() {
    this.interactiveChildren = true;
  }

  /** Fully reset */
  public reset() {}

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.dungeonContainer.x = centerX;
    this.dungeonContainer.y = centerY;

    this.titleText.x = centerX;
    this.titleText.y = centerY - 150;

    this.playButton.x = centerX;
    this.playButton.y = centerY + 40;

    this.tutorialButton.x = centerX;
    this.tutorialButton.y = centerY + 105;

    this.settingsButton.x = centerX;
    this.settingsButton.y = centerY + 170;
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    const elementsToAnimate = [
      this.titleText,
      this.playButton,
      this.tutorialButton,
      this.settingsButton,
    ];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.4, delay: 0.5, ease: "backOut" },
      );
    }

    await finalPromise;
  }

  /** Hide screen with animations */
  public async hide() {}

  /** Auto pause the app when window go out of focus */
  public blur() {
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }
}
