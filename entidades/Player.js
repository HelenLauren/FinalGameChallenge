export default class Player extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture) {
    super(scene.matter.world, x, y, texture);

    scene.add.existing(this);

    this.setScale(2);
    this.setFixedRotation();
    this.setFrictionAir(0.2);
    this.setData('tag', 'player');

    this.personagem = texture;
    this.lastDirection = 'front';

    this.initAnimations(scene, texture);
  }

  initAnimations(scene, personagemSelecionado) {
    const anims = scene.anims;
    const prefix = personagemSelecionado;

    anims.create({
      key: `${prefix}_front`,
      frames: anims.generateFrameNumbers(prefix, { frames: [0, 1, 2, 3, 4] }),
      frameRate: 5,
      repeat: -1
    });
    anims.create({
      key: `${prefix}_left`,
      frames: anims.generateFrameNumbers(prefix, { frames: [12, 13, 14, 15, 16] }),
      frameRate: 5,
      repeat: -1
    });
    anims.create({
      key: `${prefix}_right`,
      frames: anims.generateFrameNumbers(prefix, { frames: [24, 25, 26, 27, 28] }),
      frameRate: 5,
      repeat: -1
    });
    anims.create({
      key: `${prefix}_back`,
      frames: anims.generateFrameNumbers(prefix, { frames: [36] }),
      frameRate: 1,
      repeat: -1
    });
    anims.create({
      key: `${prefix}_idle`,
      frames: anims.generateFrameNumbers(prefix, { frames: [0] }),
      frameRate: 1,
      repeat: -1
    });
  }

  playAnimation(direction) {
    const animKey = `${this.personagem}_${direction}`;
    if (this.anims.currentAnim?.key !== animKey) {
      this.anims.play(animKey, true);
    }
  }

  updateMovement(cursors) {
    let moving = false;
    let vx = 0, vy = 0;

    if (cursors.left.isDown) {
      vx = -2;
      this.lastDirection = 'left';
      moving = true;
    } else if (cursors.right.isDown) {
      vx = 2;
      this.lastDirection = 'right';
      moving = true;
    }

    if (cursors.up.isDown) {
      vy = -2;
      this.lastDirection = 'back';
      moving = true;
    } else if (cursors.down.isDown) {
      vy = 2;
      this.lastDirection = 'front';
      moving = true;
    }

    this.setVelocity(vx, vy);

    if (moving) {
      this.playAnimation(this.lastDirection);
    } else {
      this.playAnimation('idle');
    }
  }
}