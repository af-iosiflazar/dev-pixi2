import { Container, Graphics, Text, TextStyle } from "pixi.js";

import { engine } from "../getEngine";

const DEFAULT_OPTIONS = {
  text: "",
  width: 200,
  height: 56,
  fontSize: 20,
};

type StoneButtonOptions = Partial<typeof DEFAULT_OPTIONS>;

/**
 * A stone-slab button with a chiseled border, dungeon-themed.
 */
export class StoneButton extends Container {
  private bg: Graphics;
  private textLabel: Text;
  private btnWidth: number;
  private btnHeight: number;

  /** Assign a callback to be called when the button is pressed. */
  public onPress: (() => void) | null = null;

  constructor(options: StoneButtonOptions = {}) {
    super();

    const opts = { ...DEFAULT_OPTIONS, ...options };
    this.btnWidth = opts.width;
    this.btnHeight = opts.height;

    // Background slab
    this.bg = new Graphics();
    this.drawSlab(0x555555, 0x888888, 0x333333);
    this.addChild(this.bg);

    // Label
    this.textLabel = new Text({
      text: opts.text,
      style: new TextStyle({
        fontFamily: "monospace",
        fontSize: opts.fontSize,
        fill: 0xffcc00,
        fontWeight: "bold",
        align: "center",
      }),
    });
    this.textLabel.anchor.set(0.5);
    this.textLabel.x = this.btnWidth / 2;
    this.textLabel.y = this.btnHeight / 2 - 2;
    this.addChild(this.textLabel);

    // Pivot at center so x/y acts like anchor(0.5)
    this.pivot.set(this.btnWidth / 2, this.btnHeight / 2);

    // Event listeners using Pixi events
    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerover", this.onHover.bind(this));
    this.on("pointerout", this.onOut.bind(this));
    this.on("pointerdown", this.onDown.bind(this));
    this.on("pointerup", this.onUp.bind(this));
  }

  private drawSlab(fill: number, light: number, dark: number) {
    this.bg.clear();
    const w = this.btnWidth;
    const h = this.btnHeight;

    // Main body
    this.bg.rect(2, 2, w - 4, h - 4).fill({ color: fill });

    // Top & left highlights (chiseled edge)
    this.bg.rect(0, 0, w, 2).fill({ color: light });
    this.bg.rect(0, 2, 2, h - 4).fill({ color: light });

    // Bottom & right shadows
    this.bg.rect(0, h - 2, w, 2).fill({ color: dark });
    this.bg.rect(w - 2, 2, 2, h - 4).fill({ color: dark });

    // Inner engraved line
    this.bg.rect(4, 4, w - 8, h - 8).stroke({ color: dark, width: 1 });
  }

  private onHover() {
    engine().audio.sfx.play("main/sounds/sfx-hover.wav");
    this.bg.clear();
    this.drawSlab(0x666666, 0xaaaaaa, 0x444444);
    this.scale.set(1.05);
  }

  private onOut() {
    this.bg.clear();
    this.drawSlab(0x555555, 0x888888, 0x333333);
    this.scale.set(1);
  }

  private onDown() {
    engine().audio.sfx.play("main/sounds/sfx-press.wav");
    // Pressed-in effect: darker, shift text
    this.bg.clear();
    this.drawSlab(0x444444, 0x666666, 0x222222);
    this.textLabel.y = this.btnHeight / 2 + 1;
  }

  private onUp() {
    // restore hover or idle
    this.textLabel.y = this.btnHeight / 2 - 2;
    this.onHover();
    this.onPress?.();
  }
}
