export default class SeaSpawner {
  constructor(scene) {
    this.scene = scene;
    this.tileSize = 6;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;
    this.worldHeight = this.rows * this.tileSize;

    this.ruinSprites = ['ruins1.png', 'ruins2.png'];
    this.decorationSprites = ['coral1.png', 'coral2.png', 'rock1.png'];

    this.ruinPositions = [
      { x: 600, y: 600 }, { x: 1000, y: 700 },
      { x: 1400, y: 800 }, { x: 1800, y: 650 },
      { x: 2200, y: 700 }, { x: 2600, y: 750 },
      { x: 3000, y: 800 }, { x: 3300, y: 650 },
    ];

    this.blockedAreas = [
      { x: 400, y: 300, radius: 120 },
      { x: this.worldWidth - 200, y: this.worldHeight - 100, radius: 120 },
    ];
  }

  isPositionBlocked(x, y, minDist = 100) {
    return this.blockedAreas.some(pos => Phaser.Math.Distance.Between(pos.x, pos.y, x, y) < minDist);
  }

  isPositionTaken(x, y, usedPositions, minDist = 80) {
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

  spawnSea() {
    const tileSize = 128;
    const seaXStart = this.worldWidth - 6 * tileSize;
    const seaYTiles = Math.ceil(this.worldHeight / tileSize);
    const seaXTiles = 6;

    for (let i = 0; i < seaXTiles; i++) {
      for (let j = 0; j < seaYTiles; j++) {
        const x = seaXStart + i * tileSize;
        const y = j * tileSize;
        const tile = this.scene.add.image(x, y, 'mar.png');
        tile.setOrigin(0, 0);
        tile.setDepth(0);
      }
    }

    this.blockedAreas.push({ x: seaXStart + 3 * tileSize, y: this.worldHeight / 2, radius: 500 });
  }

  spawnRuins() {
    const used = [];

    this.ruinPositions.forEach((basePos, i) => {
      let { x, y } = basePos;
      let tentativas = 0;
      const maxTentativas = 5;
      let colocado = false;

      while (tentativas < maxTentativas && !colocado) {
        if (!this.isPositionBlocked(x, y) && !this.isPositionTaken(x, y, used)) {
          const key = this.ruinSprites[i % this.ruinSprites.length];
          const scale = 2;
          this.addStaticAsset(x, y, key, scale, { widthFactor: 0.3, heightFactor: 0.2 });
          used.push({ x, y });
          colocado = true;
        } else {
          x += Phaser.Math.Between(-80, 80);
          y += Phaser.Math.Between(-80, 80);
          tentativas++;
        }
      }
    });
  }

  spawnDecorations(count = 40) {
    const used = [];

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(100, this.worldWidth - 400);
      const y = Phaser.Math.Between(100, this.worldHeight - 100);

      if (!this.isPositionBlocked(x, y) && !this.isPositionTaken(x, y, used)) {
        const key = Phaser.Utils.Array.GetRandom(this.decorationSprites);
        const scale = Phaser.Math.FloatBetween(1.2, 1.7);
        this.addStaticAsset(x, y, key, scale, { widthFactor: 0.1, heightFactor: 0.1 });
        used.push({ x, y });
      }
    }
  }

  spawnAll() {
    this.spawnSea();
    this.spawnRuins();
    this.spawnDecorations();
  }
}