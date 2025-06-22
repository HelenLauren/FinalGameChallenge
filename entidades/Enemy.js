export default class Enemy extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture) {
    super(scene.matter.world, x, y, texture);

    scene.add.existing(this);

    this.setScale(2);
    this.setFixedRotation();
    this.setFrictionAir(0.2);
    this.setData('tag', 'enemy');

    this.enemyKey = texture;

    this.initAnimations(scene, texture);
    this.play(`${texture}`);
  }

  initAnimations(scene, texture) {
    const anims = scene.anims;
    const key = `${texture}`;

    if (!anims.exists(key)) {
      anims.create({
        key,
        frames: anims.generateFrameNumbers(texture, { frames: [0, 1, 2, 3, 4, 5] }),
        frameRate: 5,
        repeat: -1
      });
    }
  }
}