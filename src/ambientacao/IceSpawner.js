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

    this.bushSprites = [
      'Snow_bush1.png', 'Snow_bush2.png', 'Snow_bush3.png',
      'Bush_simple2_1.png', 'Bush_simple2_2.png'
    ];

    this.crystalSprites = [
      'Black_crystal1.png', 'Black_crystal2.png', 'Black_crystal3.png', 'Black_crystal4.png',
      'Blue_crystal1.png', 'Blue_crystal2.png', 'Blue_crystal3.png', 'Blue_crystal4.png',
      'White_crystal1.png', 'White_crystal2.png', 'White_crystal3.png'
    ];

    this.ruins = [
      'Snow_ruins1.png', 'Snow_ruins2.png', 'Snow_ruins3.png', 'Snow_ruins4.png'
    ];

    this.blockedAreas = [
      { x: 500, y: 400, radius: 80 }, // posição do player
      { x: 180, y: 200, radius: 80 }, // posição do portal
      { x: 60, y: 1280, radius: 80 }  // posição do package
    ];
  }

  isPositionBlocked(x, y, minDist = 80) {
    return this.blockedAreas.some(p => Phaser.Math.Distance.Between(p.x, p.y, x, y) < minDist);
  }

  addStaticAsset(x, y, key, scale = 1, hitbox = { widthFactor: 0.1, heightFactor: 0.1 }) {
    const asset = this.scene.add.image(x, y, key).setScale(scale).setOrigin(0.5, 1);
    asset.setDepth(asset.y);
    const width = asset.width * scale * hitbox.widthFactor;
    const height = asset.height * scale * hitbox.heightFactor;
    const body = this.scene.matter.add.rectangle(x, y - height / 2, width, height, { isStatic: true });
    asset.setData('matterBody', body);
    this.blockedAreas.push({ x, y });
  }

  spawnTrees(count = 40) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(100, this.worldWidth - 100);
      const y = Phaser.Math.Between(100, this.worldHeight - 100);
      if (!this.isPositionBlocked(x, y)) {
        const key = Phaser.Utils.Array.GetRandom(this.treeKeys);
        const scale = Phaser.Math.FloatBetween(1.6, 2.3);
        this.addStaticAsset(x, y, key, scale);
      }
    }
  }

  spawnBushes(count = 30) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(100, this.worldWidth - 100);
      const y = Phaser.Math.Between(100, this.worldHeight - 100);
      if (!this.isPositionBlocked(x, y)) {
        const key = Phaser.Utils.Array.GetRandom(this.bushSprites);
        const scale = Phaser.Math.FloatBetween(1.0, 1.3);
        this.addStaticAsset(x, y, key, scale, { widthFactor: 0.5, heightFactor: 0.4 });
      }
    }
  }

  spawnCrystals(count = 15) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(100, this.worldWidth - 100);
      const y = Phaser.Math.Between(100, this.worldHeight - 100);
      if (!this.isPositionBlocked(x, y)) {
        const key = Phaser.Utils.Array.GetRandom(this.crystalSprites);
        const scale = Phaser.Math.FloatBetween(1.2, 1.5);
        this.addStaticAsset(x, y, key, scale, { widthFactor: 0.3, heightFactor: 0.3 });
      }
    }
  }

  spawnRuins() {
    const positions = [
      { x: 1000, y: 1100 },
      { x: 1800, y: 1000 },
      { x: 2200, y: 1250 },
      { x: 2600, y: 1180 }
    ];
    for (let i = 0; i < this.ruins.length; i++) {
      const pos = positions[i];
      this.addStaticAsset(pos.x, pos.y, this.ruins[i], 1.5, { widthFactor: 0.3, heightFactor: 0.2 });
    }
  }

  spawnAll() {
    this.spawnTrees();
    this.spawnBushes();
    this.spawnCrystals();
    this.spawnRuins();
  }
}