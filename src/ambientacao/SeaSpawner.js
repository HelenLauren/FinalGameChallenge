export default class SeaSpawner {
  constructor(scene) {
    this.scene = scene;
    this.tileSize = 6;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;
    this.worldHeight = this.rows * this.tileSize;

    this.ruinImages = ['ruins1', 'ruins2'];

    this.coralKeys = [
      'coral_roxo', 'coral1', 'coral2', 'coral3',
      'coralP1', 'coralP2'
    ];

    this.bushSprites = [
      'coral_roxo', 'coralP1', 'coralP2', 'seaUrchin1', 'seaUrchin2'
    ];

    this.coralPositions = [
      { x: 680, y: 500 }, { x: 1620, y: 300 }, { x: 1560, y: 980 },
      { x: 2100, y: 990 }, { x: 2220, y: 1100 }, { x: 80, y: 300 },
      { x: 2540, y: 990 }, { x: 1500, y: 600 }
    ];

    this.ruinPositions = [
      { x: 400, y: 300 }, { x: 800, y: 500 }, { x: 1200, y: 400 }, { x: 1800, y: 600 }
    ];
  }

  isPositionTaken(x, y, usedPositions, minDist = 50) {
    return usedPositions.some(p => Phaser.Math.Distance.Between(p.x, p.y, x, y) < minDist);
  }

  isNearRuins(x, y, minDist = 150) {
    return this.ruinPositions.some(p => Phaser.Math.Distance.Between(p.x, p.y, x, y) < minDist);
  }

  addCoral(x, y, key, scale) {
    const coral = this.scene.add.image(x, y, key);
    coral.setScale(scale);
    coral.setOrigin(0.5, 1);

    const trunkWidth = coral.width * scale * 0.03;
    const trunkHeight = coral.height * scale * 0.03;

    const matterBody = this.scene.matter.add.rectangle(
      x,
      y - trunkHeight / 2,
      trunkWidth,
      trunkHeight,
      { isStatic: true }
    );

    coral.setData('matterBody', matterBody);
    coral.setDepth(coral.y);
  }

  spawnCoral() {
    const usedPositions = [...this.coralPositions];

    this.addCoral(60, 300, Phaser.Utils.Array.GetRandom(this.coralKeys), 1.8);
    this.addCoral(this.worldWidth - 60, 300, Phaser.Utils.Array.GetRandom(this.coralKeys), 1.8);
    this.addCoral(60, this.worldHeight - 60, Phaser.Utils.Array.GetRandom(this.coralKeys), 1.8);
    this.addCoral(this.worldWidth - 60, this.worldHeight - 60, Phaser.Utils.Array.GetRandom(this.coralKeys), 1.8);

    this.coralPositions.forEach(pos => {
      const key = Phaser.Utils.Array.GetRandom(this.coralKeys);
      this.addCoral(pos.x, pos.y, key, 0.8);
    });

    const columnSpacing = 140;
    const coralScale = 1.9;
    const coralCount = Math.floor(this.worldHeight / columnSpacing) - 1;

    for (let i = 0; i < coralCount; i++) {
      const y = 100 + i * columnSpacing;
      this.addCoral(60, y, Phaser.Utils.Array.GetRandom(this.coralKeys), coralScale);
      this.addCoral(this.worldWidth - 60, y, Phaser.Utils.Array.GetRandom(this.coralKeys), coralScale);
    }

    for (let i = 0; i < coralCount; i++) {
      const y = 100 + i * columnSpacing;
      this.addCoral(60, this.worldHeight - y, Phaser.Utils.Array.GetRandom(this.coralKeys), coralScale);
      this.addCoral(this.worldWidth - 60, this.worldHeight - y, Phaser.Utils.Array.GetRandom(this.coralKeys), coralScale);
    }

    const rowSpacing = 120;
    const coralScaleRow = 1.5;
    const coralCountRow = Math.floor(this.worldWidth / rowSpacing) - 1;

    for (let i = 0; i < coralCountRow; i++) {
      const x = 100 + i * rowSpacing;
      this.addCoral(x, 100, Phaser.Utils.Array.GetRandom(this.coralKeys), coralScaleRow);
      this.addCoral(x, this.worldHeight - 30, Phaser.Utils.Array.GetRandom(this.coralKeys), coralScaleRow);
    }

    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(60, this.worldWidth - 60);
      const y = Phaser.Math.Between(60, this.worldHeight - 60);
      const key = Phaser.Utils.Array.GetRandom(this.coralKeys);
      const scale = Phaser.Math.FloatBetween(1.0, 1.4);

      if (!this.isPositionTaken(x, y, usedPositions, 60) && !this.isNearRuins(x, y)) {
        this.addCoral(x, y, key, scale);
        usedPositions.push({ x, y });
      }
    }
  }

  spawnBush() {
    const positions = [];
    const count = 50;
    const margin = 60;

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(margin, this.worldWidth - margin);
      const y = Phaser.Math.Between(margin, this.worldHeight - margin);

      if (!this.isNearRuins(x, y)) {
        const spriteKey = Phaser.Utils.Array.GetRandom(this.bushSprites);
        const scale = Phaser.Math.FloatBetween(0.5, 2.0);
        const bush = this.scene.add.sprite(x, y, spriteKey);
        bush.setScale(scale);
        bush.setOrigin(0.5, 1);
        bush.setDepth(bush.y);
      }
    }
  }

  spawnRuins() {
    this.ruinPositions.forEach(pos => {
      const key = Phaser.Utils.Array.GetRandom(this.ruinImages);
      const ruin = this.scene.matter.add.sprite(pos.x, pos.y, key);
      ruin.setScale(1.5);
      ruin.setOrigin(0.5, 1);
      ruin.setDepth(ruin.y + 1000);
      ruin.setStatic(true);
      ruin.setData('tag', 'ruin');
    });
  }

  spawnAll() {
    this.spawnCoral();
    this.spawnRuins();
    this.spawnBush();
  }
}