export default class IceSpawner {
  constructor(scene) {
    this.scene = scene;
    this.tileSize = 6;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;
    this.worldHeight = this.rows * this.tileSize;

    this.treeKeys = [
      'Snow_tree1.png', 'Snow_tree2.png', 'Snow_tree3.png',
      'Snow_tree4.png', 'Snow_tree5.png', 'Snow_tree6.png'
    ];

    this.treePositions = [
      { x: 2500, y: 990 }, { x: 1500, y: 600 },
      { x: 300, y: 1100 }, { x: 2700, y: 300 }, { x: 2880, y: 1200 }
    ];

    this.cornerTreePositions = [
      { x: 60, y: 300 },
      { x: this.worldWidth - 60, y: 300 },
      { x: 60, y: this.worldHeight - 60 },
      { x: this.worldWidth - 60, y: this.worldHeight - 60 }
    ];

    this.bushSprites = [
      'Snow_bush1.png', 'Snow_bush2.png', 'Snow_bush3.png',
      'Bush_simple2_1.png', 'Bush_simple2_2.png'
    ];

    this.crystalSprites = [
      'Black_crystal1.png', 'Black_crystal2.png', 'Black_crystal3.png', 'Black_crystal4.png',
      'Blue_crystal1.png', 'Blue_crystal2.png', 'Blue_crystal3.png', 'Blue_crystal4.png',
      'White_crystal1.png', 'White_crystal2.png', 'White_crystal3.png'
    ];

    this.ruinSprites = [
      'Snow_ruins1.png', 'Snow_ruins2.png', 'Snow_ruins3.png', 'Snow_ruins4.png'
    ];

    this.ruinPositions = [
      { x: 1000, y: 1100 }, { x: 1050, y: 1140 },
      { x: 1800, y: 1000 }, { x: 1850, y: 1040 },
      { x: 2200, y: 1250 }, { x: 2250, y: 1290 },
      { x: 2600, y: 1180 }, { x: 2650, y: 1220 }
    ];

    this.blockedAreas = [
      { x: 500, y: 400, radius: 120 },
      { x: 200, y: 350, radius: 120 },
      { x: 2500, y: 1050, radius: 120 },
      { x: 80, y: this.worldHeight - 60, radius: 120 },
    ];
  }

  isPositionBlocked(x, y, minDist = 100) {
    return this.blockedAreas.some(pos => Phaser.Math.Distance.Between(pos.x, pos.y, x, y) < minDist);
  }

  isPositionTaken(x, y, usedPositions, minDist = 60) {
    return usedPositions.some(p => Phaser.Math.Distance.Between(p.x, p.y, x, y) < minDist);
  }

  addStaticAsset(x, y, key, scale = 1, hitbox = { widthFactor: 0.1, heightFactor: 0.1 }) {
    const sprite = this.scene.add.image(x, y, key).setScale(scale).setOrigin(0.5, 1);
    sprite.setDepth(sprite.y - 100);

    const bodyWidth = sprite.width * scale * hitbox.widthFactor;
    const bodyHeight = sprite.height * scale * hitbox.heightFactor;

    const body = this.scene.matter.add.rectangle(x, y - bodyHeight / 2, bodyWidth, bodyHeight, { isStatic: true });
    sprite.setData('matterBody', body);

    this.blockedAreas.push({ x, y, radius: 100 });
  }

  addTree(x, y, key, scale) {
    const tree = this.scene.add.image(x, y, key);
    tree.setScale(scale);
    tree.setOrigin(0.5, 1);

    const trunkWidth = tree.width * scale * 0.3;
    const trunkHeight = tree.height * scale * 0.15;

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
    const usedPositions = [...this.cornerTreePositions, ...this.treePositions];

    const columnSpacing = 140;
    const treeScale = 1.9;
    const treeCount = Math.floor(this.worldHeight / columnSpacing) - 1;

    for (let i = 0; i < treeCount; i++) {
      const y = 100 + i * columnSpacing;

      this.addTree(60, y, Phaser.Utils.Array.GetRandom(this.treeKeys), treeScale);
      this.addTree(this.worldWidth - 60, y, Phaser.Utils.Array.GetRandom(this.treeKeys), treeScale);
    }

    for (let i = 0; i < treeCount; i++) {
      const y = 100 + i * columnSpacing;

      this.addTree(60, this.worldHeight - y, Phaser.Utils.Array.GetRandom(this.treeKeys), treeScale);
      this.addTree(this.worldWidth - 60, this.worldHeight - y, Phaser.Utils.Array.GetRandom(this.treeKeys), treeScale);
    }

    const rowSpacing = 100;
    const treeScaleRow = 1.8;
    const treeCountRow = Math.floor(this.worldWidth / rowSpacing) - 1;

    for (let i = 0; i < treeCountRow; i++) {
      const x = 100 + i * rowSpacing;

      this.addTree(x, 100, Phaser.Utils.Array.GetRandom(this.treeKeys), treeScaleRow);
      this.addTree(x, this.worldHeight - 30, Phaser.Utils.Array.GetRandom(this.treeKeys), treeScaleRow);
    }

    this.treePositions.forEach(pos => {
      const key = Phaser.Utils.Array.GetRandom(this.treeKeys);
      this.addTree(pos.x, pos.y + 40, key, 1.8);
    });

    const treeGroups = [
      { stepY: 200, countX: 2, xRangeStart: 280, xRangeEnd: 300, scaleMin: 1.6, scaleMax: 2.2, offsetX: 60, offsetYRange: 15 },
      { stepY: 160, countX: 4, xRangeStart: 40, xRangeEnd: 70, scaleMin: 1.8, scaleMax: 2.4, offsetX: 45, offsetYRange: 20 },
      { stepY: 115, countX: 4, xRangeStart: 40, xRangeEnd: 70, scaleMin: 1.8, scaleMax: 2.4, offsetX: 45, offsetYRange: 20 },
      { stepY: 120, countX: 4, xRangeStart: 50, xRangeEnd: 70, scaleMin: 1.8, scaleMax: 2.4, offsetX: 55, offsetYRange: 30 }
    ];

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
          const finalY = y + yOffset + 40;

          if (!this.isPositionTaken(finalX, finalY, usedPositions, 100)) {
            this.addTree(finalX, finalY, key, scale);
            usedPositions.push({ x: finalX, y: finalY });
            this.blockedAreas.push({ x: finalX, y: finalY, radius: 100 });
          }
        }
      }
    });

    const margin = 120;
    const extraTreeCount = 30;
    let placed = 0;
    let attempts = 0;

    while (placed < extraTreeCount && attempts < extraTreeCount * 10) {
      const x = Phaser.Math.Between(margin, this.worldWidth - margin);
      const y = Phaser.Math.Between(margin, this.worldHeight - margin);
      attempts++;

      if (!this.isPositionBlocked(x, y) && !this.isPositionTaken(x, y, usedPositions, 100)) {
        const key = Phaser.Utils.Array.GetRandom(this.treeKeys);
        const scale = Phaser.Math.FloatBetween(1.6, 2.3);
        this.addTree(x, y, key, scale);
        usedPositions.push({ x, y });
        this.blockedAreas.push({ x, y, radius: 100 });
        placed++;
      }
    }
  }

  spawnBushes(count = 60) {
    const margin = 100;
    let tries = 0;
    let placed = 0;

    while (placed < count && tries < count * 10) {
      const x = Phaser.Math.Between(margin, this.worldWidth - margin);
      const y = Phaser.Math.Between(margin, this.worldHeight - margin);
      tries++;

      if (!this.isPositionBlocked(x, y)) {
        const key = Phaser.Utils.Array.GetRandom(this.bushSprites);
        const scale = Phaser.Math.FloatBetween(1.3, 1.6);
        const sprite = this.scene.add.image(x, y, key).setScale(scale).setOrigin(0.5, 1);
        sprite.setDepth(sprite.y);
        this.blockedAreas.push({ x, y, radius: 80 });
        placed++;
      }
    }
  }

  spawnCrystals(count = 35) {
    const margin = 100;

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(margin, this.worldWidth - margin);
      const y = Phaser.Math.Between(margin, this.worldHeight - margin);
      if (!this.isPositionBlocked(x, y)) {
        const key = Phaser.Utils.Array.GetRandom(this.crystalSprites);
        const scale = Phaser.Math.FloatBetween(1.4, 1.8);
        this.addStaticAsset(x, y, key, scale, { widthFactor: 0.12, heightFactor: 0.12 });
      }
    }
  }

  spawnRuins() {
    const margin = 120;

    for (let i = 0; i < this.ruinPositions.length; i++) {
      const { x, y } = this.ruinPositions[i];
      if (
        x < margin || x > this.worldWidth - margin ||
        y < margin || y > this.worldHeight - margin ||
        this.isPositionBlocked(x, y)
      ) continue;

      const key = this.ruinSprites[i % this.ruinSprites.length];
      const scale = 2;
      this.addStaticAsset(x, y, key, scale, { widthFactor: 0.3, heightFactor: 0.2 });
    }
  }

  spawnAll() {
    this.spawnTrees();
    this.spawnBushes();
    this.spawnCrystals();
    this.spawnRuins();
  }
}