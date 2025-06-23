export default class DinoSpawner {
  constructor(scene) {
    this.scene = scene;
    this.tileSize = 6;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;
    this.worldHeight = this.rows * this.tileSize;

    this.cactusKeys = [
      'cactus1', 'cactus2', 'cactus3', 'cactus4', 'cactus5', 'cactus6'
    ];

    this.fossilKeys = [
      'dino_inc', 'dino_dir', 'dino_esq', 'dino_head'
    ];

    this.rockKeys = [
      'rocha', 'rocha2', 'rocha3', 'rocha4', 'rocha_big'
    ];

    this.blockedAreas = [];
  }

  isPositionTaken(x, y, usedPositions, minDist = 60) {
    return usedPositions.some(p => Phaser.Math.Distance.Between(p.x, p.y, x, y) < minDist);
  }

  addStaticObstacle(x, y, key, scale = 1, widthFactor = 0.2, heightFactor = 0.2) {
    const sprite = this.scene.add.image(x, y, key).setScale(scale).setOrigin(0.5, 1);
    sprite.setDepth(sprite.y);

    const width = sprite.width * scale * widthFactor;
    const height = sprite.height * scale * heightFactor;

    const body = this.scene.matter.add.rectangle(x, y - height / 2, width, height, { isStatic: true });
    sprite.setData('matterBody', body);

    this.blockedAreas.push({ x, y, radius: 100 });
  }

  spawnCacti() {
    const usedPositions = [];
    const spacing = 140;
    const cactusScale = 1.6;
    const count = Math.floor(this.worldHeight / spacing);

    const cactusBarrierScale = 2.1;

    // Bordas laterais
    for (let i = 0; i < count; i++) {
      const y = 100 + i * spacing;
      this.addStaticObstacle(60, y, Phaser.Utils.Array.GetRandom(this.cactusKeys), cactusBarrierScale);
      this.addStaticObstacle(this.worldWidth - 60, y, Phaser.Utils.Array.GetRandom(this.cactusKeys), cactusBarrierScale);
    }

    // Bordas superior e inferior
    const horizontalSpacing = 120;
    const horizontalCount = Math.floor(this.worldWidth / horizontalSpacing);
    for (let i = 0; i < horizontalCount; i++) {
      const x = 60 + i * horizontalSpacing;
      this.addStaticObstacle(x, 60, Phaser.Utils.Array.GetRandom(this.cactusKeys), cactusBarrierScale);
      this.addStaticObstacle(x, this.worldHeight - 60, Phaser.Utils.Array.GetRandom(this.cactusKeys), cactusBarrierScale);
    }

    // Cactos aleatórios
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(100, this.worldWidth - 100);
      const y = Phaser.Math.Between(100, this.worldHeight - 100);
      const scale = Phaser.Math.FloatBetween(1.3, 1.8);
      if (!this.isPositionTaken(x, y, usedPositions, 100)) {
        this.addStaticObstacle(x, y, Phaser.Utils.Array.GetRandom(this.cactusKeys), scale);
        usedPositions.push({ x, y });
      }
    }
  }

  spawnFossils() {
    const positions = [
      { x: 600, y: 800 }, { x: 1200, y: 600 },
      { x: 1800, y: 700 }, { x: 2400, y: 900 }
    ];

    positions.forEach(pos => {
      const key = Phaser.Utils.Array.GetRandom(this.fossilKeys);
      this.addStaticObstacle(pos.x, pos.y, key, 1.7, 0.4, 0.2);
    });
  }

  spawnRocks() {
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(100, this.worldWidth - 100);
      const y = Phaser.Math.Between(100, this.worldHeight - 100);
      const key = Phaser.Utils.Array.GetRandom(this.rockKeys);
      const scale = Phaser.Math.FloatBetween(1.0, 2.0);

      const sprite = this.scene.add.image(x, y, key);
      sprite.setScale(scale);
      sprite.setOrigin(0.5, 1);
      sprite.setDepth(sprite.y);

      if (key === 'rocha_big') {
        const width = sprite.width * scale * 0.2;
        const height = sprite.height * scale * 0.2;
        const body = this.scene.matter.add.rectangle(x, y - height / 2, width, height, { isStatic: true });
        sprite.setData('matterBody', body);
      }
    }
  }

  spawnAll() {
    this.spawnCacti();
    this.spawnFossils();
    this.spawnRocks();
  }
}