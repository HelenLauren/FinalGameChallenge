export default class IceScene extends Phaser.Scene {
  constructor() {
    super('IceScene');
  }

  preload() {
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
  }

  create() {
    const tileSize = 4;
    const cols = 512;
    const rows = 224;
    const worldWidth = cols * tileSize;
    const worldHeight = rows * tileSize;

    //Fundo de gelo
    const graphics = this.add.graphics();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const color = Phaser.Math.Between(0, 1) === 0 ? 0xBCFEFF : 0xE2FFFF;
        graphics.fillStyle(color, 1);
        graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    //Player
    this.player = this.matter.add.image(400, 300, 'player');
    this.player.setFixedRotation();
    this.player.setFrictionAir(0.2);
    this.player.setBounce(0);

    //Câmera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    //Controles
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 4;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}