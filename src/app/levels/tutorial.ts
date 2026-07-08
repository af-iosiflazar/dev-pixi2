import type { LevelData } from "./LevelData";
import mapText from "./data/tutorial.txt?raw";

const level: LevelData = {
  id: "tutorial",
  name: "Tutorial Dungeon",
  description: "A big open room. Defeat the goblin and find the treasure!",
  mapText,
  playerStart: { x: 5, y: 5 },
  entities: [
    { type: "Goblin", x: 30, y: 20, level: 1 },
    { type: "Goblin", x: 40, y: 10, level: 1 },
  ],
  decorations: [
    { type: "Chest", x: 50, y: 5 },
    { type: "PotionRed", x: 20, y: 25 },
  ],
};

export default level;
