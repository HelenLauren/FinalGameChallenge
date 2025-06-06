export default class FinalScene extends Phaser.Scene {
  constructor() {
    super('FinalScene');

    this.tileSize = 4;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;
    this.worldHeight = this.rows * this.tileSize;
  }

  preload() {
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
  }

  create() {
    const graphics = this.add.graphics();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const color = Phaser.Math.Between(0, 1) === 0 ? 0x018600 : 0x018e00;
        graphics.fillStyle(color, 1);
        graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }

    this.player = this.matter.add.image(400, 300, 'player');
    this.player.setFixedRotation();
    this.player.setFrictionAir(0.2);
    this.player.setBounce(0);
    this.player.setData('tag', 'player');

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const tagA = bodyA.gameObject?.getData?.('tag');
        const tagB = bodyB.gameObject?.getData?.('tag');

        if ([tagA, tagB].includes('player') && [tagA, tagB].includes('package')) {
          this.package.destroy();
          this.spawnPortal();
        }

        if ([tagA, tagB].includes('player') && [tagA, tagB].includes('portal')) {
          this.player.setVelocity(0);
          this.player.body.isStatic = true;
          this.showLevelCompleteModal();
        }
      });
    });
  }

  showLevelCompleteModal() {
    this.modalBackground = this.add.rectangle(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.6
    ).setScrollFactor(0);

    this.modalContainer = this.add.container(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2
    ).setScrollFactor(0);

    const panel = this.add.rectangle(0, 0, 350, 200, 0xffffff, 1);
    panel.setStrokeStyle(2, 0x000000);

    const title = this.add.text(0, -40, 'Parabéns!', {
        fontSize: '28px',
        color: '#28a745',
        fontStyle: 'bold',
    }).setOrigin(0.5);

    const message = this.add.text(0, 10, 'Você concluiu todas as fases!', {
        fontSize: '18px',
        color: '#000',
        align: 'center',
        wordWrap: { width: 300 },
    }).setOrigin(0.5);
    
    const btnMenu = this.add.text(0, 60, 'Menu Principal', {
        fontSize: '20px',
        color: '#0077ff',
        backgroundColor: '#cce5ff',
        padding: { x: 10, y: 5 },
        alpha: 0
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnMenu.on('pointerdown', () => {
        this.destroyModal();
        this.scene.start('MenuScene');
    });

    this.modalContainer.add([panel, title, message, btnMenu]);
    this.tweens.add({
        targets: btnMenu,
        alpha: 1,
        duration: 2000,
        ease: 'Power2'
    });
    this.time.delayedCall(5000, () => {
        if (this.scene.isActive()) {
        this.scene.start('MenuScene');
        }
    });
    }
    
  destroyModal() {
    if (this.modalBackground) this.modalBackground.destroy();
    if (this.modalContainer) this.modalContainer.destroy();
  }

  update() {
    const speed = 4;

    // Movimento horizontal
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // Movimento vertical
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // Limitar a posição do jogador dentro do mundo
    const halfWidth = this.player.displayWidth / 2;
    const halfHeight = this.player.displayHeight / 2;

    if (this.player.x < halfWidth) {
      this.player.x = halfWidth;
      this.player.setVelocityX(0);
    } else if (this.player.x > this.worldWidth - halfWidth) {
      this.player.x = this.worldWidth - halfWidth;
      this.player.setVelocityX(0);
    }

    if (this.player.y < halfHeight) {
      this.player.y = halfHeight;
      this.player.setVelocityY(0);
    } else if (this.player.y > this.worldHeight - halfHeight) {
      this.player.y = this.worldHeight - halfHeight;
      this.player.setVelocityY(0);
    }

    // Animações do portal
    if (this.portalRings) {
      this.portalRings.forEach(ringObj => {
        if (ringObj.growing) {
          ringObj.scale += 0.01;
          if (ringObj.scale >= 1.0) ringObj.growing = false;
        } else {
          ringObj.scale -= 0.01;
          if (ringObj.scale <= 1) ringObj.growing = true;
        }
        ringObj.sprite.setScale(ringObj.scale);
      });
    }

    if (this.portalRays && this.portalMain) {
      const rotationSpeed = 0.02;
      this.portalRays.forEach(rayObj => {
        rayObj.angle += rotationSpeed;
        rayObj.graphics.x = this.portalMain.x + 30 * Math.cos(rayObj.angle);
        rayObj.graphics.y = this.portalMain.y + 30 * Math.sin(rayObj.angle);
        rayObj.graphics.rotation = rayObj.angle;
      });
    }
  }
}