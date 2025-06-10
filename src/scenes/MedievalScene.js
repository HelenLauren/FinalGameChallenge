export default class MedievalScene extends Phaser.Scene {
  constructor() {
    super('MedievalScene');

    this.tileSize = 6;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;
    this.worldHeight = this.rows * this.tileSize;
  }

  preload() {
    this.load.spritesheet('helen', 'entidades/helen_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('helena', 'entidades/helena_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('raissa', 'entidades/raissa_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('heart_full', 'assets/images/coracaoCheio.png');
    this.load.image('heart_empty', 'assets/images/coracaoVazio.png');
    this.load.image('package', 'https://labs.phaser.io/assets/sprites/crate.png');
  }

  create() {
    const personagemSelecionado = localStorage.getItem('personagemSelecionado');
    if (!personagemSelecionado) {
      this.scene.start('BootScene');
      return;
    }

    const graphics = this.add.graphics();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const color = Phaser.Math.Between(0, 1) === 0 ? 0x018600 : 0x018e00;
        graphics.fillStyle(color, 1);
        graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }
    this.player = this.matter.add.sprite(500, 400, personagemSelecionado);
    this.player.setScale(2);
    this.player.setFixedRotation();
    this.player.setFrictionAir(0.2);
    this.player.setData('tag', 'player');

    //animações do personagem:
    this.anims.create({
    key: 'front',
    frames: this.anims.generateFrameNumbers(personagemSelecionado, { frames: [0, 1, 2, 3, 4]}),
    frameRate: 5,
    repeat: -1
  });
    this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers(personagemSelecionado, { frames: [12, 13, 14, 15, 16]}),
    frameRate: 5,
    repeat: -1
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers(personagemSelecionado, { frames: [24, 25, 26, 27, 28]}),
    frameRate: 5,
    repeat: -1
  });
  this.anims.create({
    key: 'back',
    frames: this.anims.generateFrameNumbers(personagemSelecionado, { frames: [36]}),
    frameRate: 5,
    repeat: -1
  });
  this.anims.create({
  key: 'idle',
  frames: this.anims.generateFrameNumbers(personagemSelecionado, { frames: [0, 1, 2, 3, 4]}),
  frameRate: 1,
  repeat: -1
});

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.package = this.matter.add.image(200, 200, 'package', null, { isStatic: true });
    this.package.setData('tag', 'package');

    this.portalMain = null;
    this.portalRings = [];
    this.portalRays = [];

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

    // === HUD de vidas ===
    this.vidas = 3;
    this.coracoes = [];
    const margin = 10;

    for (let i = 0; i < 3; i++) {
      const coracao = this.add.image(margin + i * 34, margin, 'heart_full')
        .setScrollFactor(0)
        .setDisplaySize(50, 50)
        .setOrigin(0, 0);
      this.coracoes.push(coracao);
    }

    this.nomeTexto = this.add.text(margin + 3 * 34 + 10, margin + 6, personagemSelecionado, {
      fontSize: '16px',
      fill: '#fff',
      fontFamily: '"Press Start 2P"',
      stroke: '#000',
      strokeThickness: 2
    }).setScrollFactor(0);

    // === Botão de menu canto esquerdo ===
    this.btnMenu = this.add.text(margin, margin + 60, 'Menu', {
      fontSize: '20px',
      color: '#fff',
      backgroundColor: '#5C4033',
      padding: { x: 12, y: 6 },
      fontFamily: '"Press Start 2P"',
      stroke: '#000',
      strokeThickness: 2
    })
    .setScrollFactor(0)
    .setOrigin(0, 0)
    .setInteractive({ useHandCursor: true });

    this.btnMenu.on('pointerdown', () => {
      this.confirmarVoltarMenu();
    });

  }
  spawnPortal() {
    const x = 180;
    const y = 200;

    if (this.portalMain) {
      this.portalMain.destroy();
      this.portalRings.forEach(r => r.sprite.destroy());
      this.portalRays.forEach(r => r.graphics.destroy());
      this.portalRings = [];
      this.portalRays = [];
    }

    this.portalMain = this.add.circle(x, y, 30, 0xED3FFF, 0.4);
    this.matter.add.gameObject(this.portalMain, {
      shape: { type: 'circle', radius: 30 },
      isStatic: true,
      isSensor: true,
    });
    this.portalMain.setData('tag', 'portal');

    for (let i = 1; i <= 3; i++) {
      let ring = this.add.circle(x, y, 30 + i * 10, 0xDF9CFF, 0.15);
      this.portalRings.push({ sprite: ring, baseRadius: 30 + i * 10, scale: 1, growing: true });
    }

    const rayCount = 12;
    const rayLength = 10;
    for (let i = 0; i < rayCount; i++) {
      const angle = Phaser.Math.DegToRad((360 / rayCount) * i);
      const ray = this.add.graphics();
      ray.lineStyle(2, 0xDF9CFF, 0.8);
      ray.beginPath();
      ray.moveTo(0, 0);
      ray.lineTo(rayLength, 0);
      ray.strokePath();
      ray.x = x + 30 * Math.cos(angle);
      ray.y = y + 30 * Math.sin(angle);
      ray.rotation = angle;
      this.portalRays.push({ graphics: ray, angle });
    }
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

    const panel = this.add.rectangle(0, 0, 300, 200, 0xffffff, 1);
    panel.setStrokeStyle(2, 0x000000);

    const title = this.add.text(0, -70, 'Fase Completa!', {
      fontSize: '24px',
      color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const progresso = JSON.parse(localStorage.getItem('progressoFases')) || {};
    progresso[2] = true;
    localStorage.setItem('progressoFases', JSON.stringify(progresso));

    const btnNext = this.add.text(0, -20, 'Próxima Fase', {
      fontSize: '20px',
      color: '#0077ff',
      backgroundColor: '#cce5ff',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnNext.on('pointerdown', () => {
      this.destroyModal();
      this.scene.start('DinoScene'); //prox fase -----------------
    });

    const btnRestart = this.add.text(0, 30, 'Reiniciar Fase', {
      fontSize: '20px',
      color: '#0077ff',
      backgroundColor: '#cce5ff',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnRestart.on('pointerdown', () => {
      this.destroyModal();
      this.scene.restart();
    });

    const btnMenu = this.add.text(0, 80, 'Menu Principal', {
      fontSize: '20px',
      color: '#0077ff',
      backgroundColor: '#cce5ff',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnMenu.on('pointerdown', () => {
      this.destroyModal();
      this.scene.start('MenuScene');
    });

    this.modalContainer.add([panel, title, btnNext, btnRestart, btnMenu]);
  }

  destroyModal() {
    if (this.modalBackground) this.modalBackground.destroy();
    if (this.modalContainer) this.modalContainer.destroy();
  }
  perderVida() {
    if (this.vidas > 0) {
      this.vidas--;
      this.coracoes[this.vidas].setTexture('heart_empty');
    }
  }

  update() {
    const speed = 4;
    let vx = 0;
    let vy = 0;

    const cursors = this.cursors;

    // Zerar velocidade padrão
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      vx = -speed;
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      vx = speed;
      this.player.anims.play('right', true);
    } else if (this.cursors.up.isDown) {
      vy = -speed;
      this.player.anims.play('back', true);
    } else if (this.cursors.down.isDown) {
      vy = speed;
      this.player.anims.play('front', true);
    } else {
        this.player.setVelocity(0);
        this.player.anims.play('idle', true);
    }

    this.player.setVelocity(vx, vy);

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