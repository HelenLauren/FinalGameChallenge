export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // Você pode trocar isso por uma imagem depois
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
  }

  create() {
    //cria jogador no centro da tela
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 200;
    const player = this.player;

    player.setVelocity(0);

    if (this.cursors.left.isDown) {
      player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      player.setVelocityY(speed);
    }
  }
}