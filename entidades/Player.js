export default class Player extends Phaser.Physics.Matter.Sprite {
  constructor(scene, x, y, texture) {
    super(scene.matter.world, x, y, texture);

    scene.add.existing(this);

    this.setScale(2);
    this.setFixedRotation();
    this.setFrictionAir(0.2);
    this.setData('tag', 'player');

    this.initAnimations(scene, texture);
  }

  initAnimations(scene, personagemSelecionado) {
    const anims = scene.anims;
    anims.create({
      key: 'front',
      frames: anims.generateFrameNumbers(personagemSelecionado, { frames: [0, 1, 2, 3, 4]}),
      frameRate: 5,
      repeat: -1
    });
    anims.create({
      key: 'left',
      frames: anims.generateFrameNumbers(personagemSelecionado, { frames: [12, 13, 14, 15, 16]}),
      frameRate: 5,
      repeat: -1
    });
    anims.create({
      key: 'right',
      frames: anims.generateFrameNumbers(personagemSelecionado, { frames: [24, 25, 26, 27, 28]}),
      frameRate: 5,
      repeat: -1
    });
    anims.create({
      key: 'back',
      frames: anims.generateFrameNumbers(personagemSelecionado, { frames: [36]}),
      frameRate: 5,
      repeat: -1
    });
    anims.create({
      key: 'idle',
      frames: anims.generateFrameNumbers(personagemSelecionado, { frames: [0, 1, 2, 3, 4]}),
      frameRate: 1,
      repeat: -1
    });
  }
}