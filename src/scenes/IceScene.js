import Player from '../../entidades/Player.js';
import Hud from '../../ui/Hud.js';
import IceSpawner from '../ambientacao/IceSpawner.js';

export default class IceScene extends Phaser.Scene {
  constructor() {
    super('IceScene');
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
    this.load.image('heart_full', 'assets/images/coracaoRosa.png');
    this.load.image('heart_empty', 'assets/images/coracaoCinza.PNG');
    this.load.image('package', 'assets/images/package.png');
    this.load.image('portal_center', 'assets/images/portal.png');
    this.load.audio('iceMusic', 'assets/audio/ice_theme.mp3');
  }

  create() {
    this.music = this.sound.add('iceMusic', { loop: true, volume: 0.2 });
    this.music.play();

    const personagemSelecionado = localStorage.getItem('personagemSelecionado');
    if (!personagemSelecionado) {
      this.scene.start('BootScene');
      return;
    }

    const graphics = this.add.graphics();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const color = Phaser.Display.Color.GetColor(230, 240, 255);
        graphics.fillStyle(color, 1);
        graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }

    this.spawner = new IceSpawner(this);
    this.spawner.spawnAll();

    this.package = this.matter.add.image(80, this.worldHeight - 80, 'package', null, {
      isStatic: true
    });
    this.package.setData('tag', 'package');
    this.package.setDepth(this.package.y);

    this.portalMain = null;
    this.portalRings = [];
    this.portalRays = [];

    this.player = new Player(this, 500, 400, personagemSelecionado);
    this.hud = new Hud(this, personagemSelecionado);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        const tagA = pair.bodyA.gameObject?.getData?.('tag');
        const tagB = pair.bodyB.gameObject?.getData?.('tag');

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

  spawnPortal() {
    const x = 180;
    const y = 200;
    this.portalMain?.destroy();
    this.portalRings?.forEach(r => r.sprite.destroy());
    this.portalRings = [];

    this.portalMain = this.add.image(x, y, 'portal_center').setScale(1).setAlpha(0.9);
    this.matter.add.gameObject(this.portalMain, {
      shape: { type: 'circle', radius: 30 },
      isStatic: true,
      isSensor: true,
    });
    this.portalMain.setData('tag', 'portal');
    this.portalMain.setDepth(this.portalMain.y);

    for (let i = 1; i <= 2; i++) {
      let ring = this.add.circle(x, y, 30 + i * 10, 0xDF9CFF, 0.3);
      ring.setDepth(this.portalMain.depth - 1);
      this.portalRings.push({ sprite: ring, baseRadius: 30 + i * 10, scale: 1, growing: true });
    }
  }

  showLevelCompleteModal() {
    const centerX = this.cameras.main.midPoint.x;
    const centerY = this.cameras.main.midPoint.y;

    this.modalBackground = this.add.rectangle(centerX, centerY, 360, 220, 0x3b2f2f, 0.4)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10001);

    this.modalContainer = this.add.container(centerX, centerY)
      .setScrollFactor(0)
      .setDepth(10002);

    const panel = this.add.rectangle(0, 0, 300, 200, 0xffffff, 1)
      .setStrokeStyle(2, 0x3b2f2f)
      .setOrigin(0.5)
      .setDepth(10002);

    const title = this.add.text(0, -70, 'Fase Completa!', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Press Start 2P'
    }).setOrigin(0.5).setDepth(10002);

    const progresso = JSON.parse(localStorage.getItem('progressoFases')) || {};
    progresso[3] = true;
    localStorage.setItem('progressoFases', JSON.stringify(progresso));

    const btnNext = this.add.text(0, -20, 'Próxima Fase', {
      fontSize: '20px',
      color: '#0077ff',
      backgroundColor: '#cce5ff',
      padding: { x: 10, y: 5 },
      fontFamily: 'Press Start 2P'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10002);

    btnNext.on('pointerdown', () => {
      this.destroyModal();
      this.music.stop();
      this.scene.start('FinalScene');
    });

    const btnRestart = this.add.text(0, 30, 'Reiniciar Fase', {
      fontSize: '20px',
      color: '#0077ff',
      backgroundColor: '#cce5ff',
      padding: { x: 10, y: 5 },
      fontFamily: 'Press Start 2P'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10002);

    btnRestart.on('pointerdown', () => {
      this.destroyModal();
      this.music.stop();
      this.scene.restart();
    });

    const btnMenu = this.add.text(0, 80, 'Menu Principal', {
      fontSize: '20px',
      color: '#0077ff',
      backgroundColor: '#cce5ff',
      padding: { x: 10, y: 5 },
      fontFamily: 'Press Start 2P'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10002);

    btnMenu.on('pointerdown', () => {
      this.destroyModal();
      this.music.stop();
      this.scene.start('MenuScene');
    });

    this.modalContainer.add([panel, title, btnNext, btnRestart, btnMenu]);
  }

  destroyModal() {
    this.modalBackground?.destroy();
    this.modalContainer?.destroy();
  }

  update() {
    this.player.updateMovement(this.cursors);

    if (this.portalMain) {
      this.portalMain.rotation += 0.02;
    }
    if (this.portalRings) {
      this.portalRings.forEach(ringObj => {
        ringObj.scale += ringObj.growing ? 0.01 : -0.01;
        if (ringObj.scale >= 1.0) ringObj.growing = false;
        if (ringObj.scale <= 1.0) ringObj.growing = true;
        ringObj.sprite.setScale(ringObj.scale);
      });
    }
  }

  shutdown() {
    if (this.music?.isPlaying) this.music.stop();
  }
}