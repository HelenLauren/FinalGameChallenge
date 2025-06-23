export default class Enemy extends Phaser.Physics.Matter.Image {
  constructor(scene, x, y) {
    const radius = 20;

    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff0000, 1); 
    graphics.fillCircle(radius, radius, radius);

    const textureKey = 'enemyCircle';

    if (!scene.textures.exists(textureKey)) {
      graphics.generateTexture(textureKey, radius * 2, radius * 2);
    }
    graphics.destroy(); 
    super(scene.matter.world, x, y, textureKey);

    scene.add.existing(this);

    this.setCircle(radius);
    this.setFixedRotation();
    this.setFrictionAir(0.2);
    this.setData('tag', 'enemy');
  }
}
