export default class MedievalSpawner {
  constructor(scene) {
    this.scene = scene;
    this.tileSize = 6;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;  // 3072
    this.worldHeight = this.rows * this.tileSize; // 1344

    this.houseImages = ['medievalHouse1', 'medievalHouse2',  'medievalHouse4', 'medievalHouse5','medievalHouse6',];
  }

  addTree(x, y, key, scale) {
    const tree = this.scene.add.image(x, y, key);
    tree.setScale(scale);
    tree.setOrigin(0.5, 1);  // base na vertical

    const width = tree.width * scale * 0.6;  // ajusta hitbox pra ficar mais natural
    const height = tree.height * scale * 0.8;

    const matterBody = this.scene.matter.add.rectangle(
      x,
      y - height / 2, 
      width,
      height,
      { isStatic: true }
    );

    tree.setData('matterBody', matterBody);
  }

  spawnTrees() {
    const treeKeys = [
      'Tree1', 'Tree2', 'Tree3',
      'Autumn_tree1', 'Autumn_tree2', 'Autumn_tree2', 'Autumn_tree3',
      'Burned_tree1', 'Burned_tree2', 'Burned_tree3',
      'Broken_tree1', 'Broken_tree3'
    ];

    const treeGroups = [
      { stepY: 200, countX: 2, xRangeStart: 280, xRangeEnd: 300, scaleMin: 1.6, scaleMax: 2.2, offsetX: 60, offsetYRange: 15 },
      { stepY: 160, countX: 4, xRangeStart: 40, xRangeEnd: 70, scaleMin: 1.8, scaleMax: 2.4, offsetX: 45, offsetYRange: 20 },
      { stepY: 115, countX: 4, xRangeStart: 40, xRangeEnd: 70, scaleMin: 1.8, scaleMax: 2.4, offsetX: 45, offsetYRange: 20 },
      { stepY: 120, countX: 4, xRangeStart: 50, xRangeEnd: 70, scaleMin: 1.8, scaleMax: 2.4, offsetX: 55, offsetYRange: 30 },
    ];

    treeGroups.forEach(group => {
      for (let y = this.worldHeight - 100; y > 0; y -= group.stepY) {
        for (let offset = 0; offset < group.countX; offset++) {
          const x = this.worldWidth - Phaser.Math.Between(
            group.xRangeStart + offset * group.offsetX,
            group.xRangeEnd + offset * group.offsetX
          );
          const key = Phaser.Utils.Array.GetRandom(treeKeys);
          const scale = Phaser.Math.FloatBetween(group.scaleMin, group.scaleMax);
          const yOffset = Phaser.Math.Between(-group.offsetYRange, group.offsetYRange);
          const xOffset = Phaser.Math.Between(-5, 5);
          this.addTree(x + xOffset, y + yOffset, key, scale);
        }
      }
    });

    for (let x = 0; x < this.worldWidth; x += Phaser.Math.Between(80, 110)) {
      for (let offset = 0; offset < 2; offset++) {
        const y = this.worldHeight - Phaser.Math.Between(20 + offset * 25, 40 + offset * 25);
        const key = Phaser.Utils.Array.GetRandom(treeKeys);
        const scale = Phaser.Math.FloatBetween(1.7, 2.3);
        this.addTree(x + Phaser.Math.Between(-10, 10), y, key, scale);
      }
    }

    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(this.worldWidth - 220, this.worldWidth);
      const y = Phaser.Math.Between(this.worldHeight - 220, this.worldHeight);
      const key = Phaser.Utils.Array.GetRandom(treeKeys);
      const scale = Phaser.Math.FloatBetween(1.6, 2.4);
      this.addTree(x, y, key, scale);
    }

    for (let y = this.worldHeight - 100; y > 0; y -= Phaser.Math.Between(100, 130)) {
      for (let offset = 0; offset < 4; offset++) {
        const x = Phaser.Math.Between(40 + offset * 45, 70 + offset * 45);
        const key = Phaser.Utils.Array.GetRandom(treeKeys);
        const scale = Phaser.Math.FloatBetween(1.8, 2.4);
        const yOffset = Phaser.Math.Between(-20, 20);
        const xOffset = Phaser.Math.Between(-5, 5);
        this.addTree(x + xOffset, y + yOffset, key, scale);
      }
    }
  }

  spawnHouses() {
    const houseSize = 220;
    const spacing = 10;

    // Casas no topo
    const topY = -120;
    const topXStart = 250;
    const topHouseCount = 11;
    const topHouseSpacing = 0;
    const topHousesPositions = [];

    for (let i = 0; i < topHouseCount; i++) {
      topHousesPositions.push({
        x: topXStart + i * (houseSize + topHouseSpacing),
        y: topY
      });
    }

    const layoutPositions = [
      // Linha 1 
      { x: 500, y: 300 },
      { x: 900, y: 300 },
      { x: 1200, y: 300 },
      { x: 1800, y: 300 },
      { x: 2000, y: 300 },
      { x: 2300, y: 300 },
      { x: 2500, y: 300 },

      // Linha 2
      { x: 400, y: 600 }, { x: 1800, y: 600 },
      { x: 600, y: 600 }, { x: 2100, y: 600 },
      { x: 900, y: 600 }, { x: 2450, y: 600 },
      { x: 1100, y: 600 }, 
      { x: 1300, y: 600 },

      // Linha antes do 1
      { x: 250, y: 250 },
    ];

    const allHouses = [...topHousesPositions, ...layoutPositions];

    allHouses.forEach(pos => {
      const key = Phaser.Utils.Array.GetRandom(this.houseImages);
      const house = this.scene.matter.add.sprite(
        pos.x + houseSize / 2,
        pos.y + houseSize,
        key
      );

      house.setDisplaySize(houseSize, houseSize);
      house.setOrigin(0, 1);
      house.setDepth(house.y);

      // Define colisão reduzida e fixa
      house.setRectangle(houseSize - 120, houseSize - 90);
      house.setStatic(true);
      house.setData('tag', 'house');
    });
  }

}