export default class GameSpawner {
  constructor(scene) {
    this.scene = scene;
    this.tileSize = 6;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;  // 3072
    this.worldHeight = this.rows * this.tileSize; // 1344

    this.houseImages = [
      'medievalHouse4',
      'medievalHouse5',
      'medievalHouse6',
      'medievalHouse7',
      'medievalHouse8',
      'medievalHouse9',
    ];

    this.treeKeys = [
      'Tree1', 'Tree2', 'Tree3',
      'fruitTree1', 'fruitTree2', 'fruitTree3',
      'Broken_tree1', 'Broken_tree3'
    ];

    this.bushSprites = [
      'pinkflowerbush2', 'pinkflowerbush1', 'pinkflowerbush3',
      'blueflowerbush1', 'blueflowerbush2',
      'orangeflowerbush1','orangeflowerbush2',
      'bush21', 'bush22', 'bush23'
    ];

    this.treePositions = [
      { x: 680, y: 500 }, { x: 1620, y: 300 }, { x: 1560, y: 980 },
      { x: 2100, y: 990 }, { x: 2220, y:1100 }, { x: 80, y: 300 },
      { x: 2540, y: 990 }, { x: 1500, y: 600 }
    ];
  }

  isPositionTaken(x, y, usedPositions, minDist = 80) {
    const avoidCenter = Phaser.Math.Distance.Between(x, y, this.worldWidth / 2, this.worldHeight / 2) < 100;
    if (avoidCenter) return true;

    return usedPositions.some(p => Phaser.Math.Distance.Between(p.x, p.y, x, y) < minDist);
  }
  addTree(x, y, key, scale) {
    const tree = this.scene.add.image(x, y, key);
    tree.setScale(scale);
    tree.setOrigin(0.5, 1);

    const trunkWidth = tree.width * scale * 0.1; 
    const trunkHeight = tree.height * scale * 0.1; 

    const matterBody = this.scene.matter.add.rectangle(
      x,
      y - trunkHeight / 2,
      trunkWidth,
      trunkHeight,
      { isStatic: true }
    );

    tree.setData('matterBody', matterBody);
    tree.setDepth(tree.y);
  }

  spawnTrees() {
    // Adiciona posições fixas, evitando duplicação
    this.treePositions.forEach(pos => {
      const key = Phaser.Utils.Array.GetRandom(this.treeKeys);
      this.addTree(pos.x, pos.y, key, 1.8);
    });

    const treeGroups = [
      { stepY: 200, countX: 2, xRangeStart: 280, xRangeEnd: 300, scaleMin: 1.6, scaleMax: 2.2, offsetX: 60, offsetYRange: 15 },
      { stepY: 160, countX: 4, xRangeStart: 40, xRangeEnd: 70, scaleMin: 1.8, scaleMax: 2.4, offsetX: 45, offsetYRange: 20 },
      { stepY: 115, countX: 4, xRangeStart: 40, xRangeEnd: 70, scaleMin: 1.8, scaleMax: 2.4, offsetX: 45, offsetYRange: 20 },
      { stepY: 120, countX: 4, xRangeStart: 50, xRangeEnd: 70, scaleMin: 1.8, scaleMax: 2.4, offsetX: 55, offsetYRange: 30 },
    ];

    const usedPositions = [...this.treePositions];

    treeGroups.forEach(group => {
      for (let y = this.worldHeight - 100; y > 0; y -= group.stepY) {
        for (let offset = 0; offset < group.countX; offset++) {
          const x = this.worldWidth - Phaser.Math.Between(
            group.xRangeStart + offset * group.offsetX,
            group.xRangeEnd + offset * group.offsetX
          );
          const key = Phaser.Utils.Array.GetRandom(this.treeKeys);
          const scale = Phaser.Math.FloatBetween(group.scaleMin, group.scaleMax);
          const yOffset = Phaser.Math.Between(-group.offsetYRange, group.offsetYRange);
          const xOffset = Phaser.Math.Between(-5, 5);
          const finalX = x + xOffset;
          const finalY = y + yOffset;

          if (!this.isPositionTaken(finalX, finalY, usedPositions, 60)) {
            this.addTree(finalX, finalY, key, scale);
            usedPositions.push({ x: finalX, y: finalY });
          }
        }
      }
    });

    for (let x = 0; x < this.worldWidth; x += Phaser.Math.Between(80, 110)) {
      for (let offset = 0; offset < 2; offset++) {
        const y = this.worldHeight - Phaser.Math.Between(20 + offset * 25, 40 + offset * 25);
        const key = Phaser.Utils.Array.GetRandom(this.treeKeys);
        const scale = Phaser.Math.FloatBetween(1.7, 2.3);
        const finalX = x + Phaser.Math.Between(-10, 10);
        const finalY = y;

        if (!this.isPositionTaken(finalX, finalY, usedPositions, 60)) {
          this.addTree(finalX, finalY, key, scale);
          usedPositions.push({ x: finalX, y: finalY });
        }
      }
    }

    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(this.worldWidth - 220, this.worldWidth);
      const y = Phaser.Math.Between(this.worldHeight - 220, this.worldHeight);
      const key = Phaser.Utils.Array.GetRandom(this.treeKeys);
      const scale = Phaser.Math.FloatBetween(1.6, 2.4);

      if (!this.isPositionTaken(x, y, usedPositions, 60)) {
        this.addTree(x, y, key, scale);
        usedPositions.push({ x, y });
      }
    }

    for (let y = this.worldHeight - 100; y > 0; y -= Phaser.Math.Between(100, 130)) {
      for (let offset = 0; offset < 4; offset++) {
        const x = Phaser.Math.Between(40 + offset * 45, 70 + offset * 45);
        const key = Phaser.Utils.Array.GetRandom(this.treeKeys);
        const scale = Phaser.Math.FloatBetween(1.8, 2.4);
        const yOffset = Phaser.Math.Between(-20, 20);
        const xOffset = Phaser.Math.Between(-5, 5);
        const finalX = x + xOffset;
        const finalY = y + yOffset;

        if (!this.isPositionTaken(finalX, finalY, usedPositions, 60)) {
          this.addTree(finalX, finalY, key, scale);
          usedPositions.push({ x: finalX, y: finalY });
        }
      }
    }
  }

  spawnBush() {
    const bushSize = 50;
    const uniqueBushPositions = [];

    this.treePositions.forEach(pos => {
      uniqueBushPositions.push({ x: pos.x + 50, y: pos.y + 40 });
    });

    uniqueBushPositions.forEach(pos => {
      const spriteKey = Phaser.Utils.Array.GetRandom(this.bushSprites);
      const bush = this.scene.add.sprite(pos.x, pos.y, spriteKey);
      bush.setDisplaySize(bushSize, bushSize);
      bush.setOrigin(0.5, 1);
      bush.setDepth(bush.y);
    });
  }

  spawnHouses() {
    const houseSize = 220;
    const spacing = 10;

    const topY = -120;
    const topXStart = 250;
    const topHouseCount = 11;

    const topHousesPositions = [];
    for (let i = 0; i < topHouseCount; i++) {
      topHousesPositions.push({
        x: topXStart + i * (houseSize + spacing),
        y: topY
      });
    }

    const layoutPositions = [
      { x: 500, y: 300 }, { x: 900, y: 300 }, { x: 1200, y: 300 },
      { x: 1800, y: 300 }, { x: 2000, y: 300 }, { x: 2300, y: 300 },
      { x: 2500, y: 300 }, { x: 400, y: 600 }, { x: 600, y: 600 },
      { x: 900, y: 600 }, { x: 1100, y: 600 }, { x: 1300, y: 600 },
      { x: 1800, y: 600 }, { x: 2100, y: 600 }, { x: 2450, y: 600 },
      { x: 250, y: 250 }
    ];

    const allHouses = topHousesPositions.concat(layoutPositions);

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
      house.setRectangle(houseSize - 120, houseSize - 90);
      house.setStatic(true);
      house.setData('tag', 'house');
    });
  }
}