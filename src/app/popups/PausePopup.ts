import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { StoneButton } from "../ui/StoneButton";

/** Popup that shows up when gameplay is paused */
export class PausePopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The popup title label */
  private title: Label;
  /** Button that closes the popup */
  private doneButton: StoneButton;
  /** The panel background */
  private panelBase: RoundedBox;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({
      height: 270,
      color: 0x333333,
      shadowColor: 0x111111,
    });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: "Paused",
      style: { fill: 0xffcc00, fontSize: 50 },
    });
    this.title.y = -70;
    this.panel.addChild(this.title);

    this.doneButton = new StoneButton({
      text: "Resume",
      width: 280,
      height: 64,
      fontSize: 22,
    });
    this.doneButton.y = 65;
    this.doneButton.onPress = () => engine().navigation.dismissPopup();
    this.panel.addChild(this.doneButton);
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Present the popup, animated */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: "backIn" },
    );
  }
}
