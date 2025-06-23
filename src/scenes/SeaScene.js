import Player from '../../entidades/Player.js';
import Enemy from '../../entidades/Enemy.js';
import Hud from '../../ui/Hud.js';
import SeaSpawner from '../ambientacao/SeaSpawner.js';

export default class SeaScene extends Phaser.Scene {
  constructor() {
    super('SeaScene');
    this.tileSize = 6;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;
    this.worldHeight = this.rows * this.tileSize;
  }

  preload() {
    this.load.spritesheet('Helen', 'entidades/helen_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Helena', 'entidades/helena_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Raissa', 'entidades/raissa_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('portal_center', 'assets/images/portal.png');
    this.load.image('heart_full', 'assets/images/coracaoRosa.png');
    this.load.image('heart_empty', 'assets/images/coracaoCinza.PNG');
    this.load.image('package', 'assets/images/package.png');
    this.load.audio('sea_theme', 'assets/audio/sea_theme.mp3');

    this.load.image('ruins1', 'assets/images/sea/ruins1.png');
    this.load.image('ruins2', 'assets/images/sea/ruins2.png');
    this.load.image('coral1', 'assets/images/sea/coral1.png');
    this.load.image('coral2', 'assets/images/sea/coral2.png');
    this.load.image('coral3', 'assets/images/sea/coral3.png');
    this.load.image('coralP1', 'assets/images/sea/coralP1.png');
    this.load.image('coralP2', 'assets/images/sea/coralP2.png');
    this.load.image('coral_roxo', 'assets/images/sea/coral_roxo.png');
    this.load.image('seaUrchin1', 'assets/images/sea/seaUrchin1.png');
    this.load.image('seaUrchin2', 'assets/images/sea/seaUrchin2.png');
  }

  create() {
    this.music = this.sound.add('sea_theme', { loop: true, volume: 0.4 });
    this.music.play();

    const personagemSelecionado = localStorage.getItem('personagemSelecionado');
    if (!personagemSelecionado) {
      this.scene.start('BootScene');
      return;
    }

    const graphics = this.add.graphics();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const color = Phaser.Math.Between(0, 1) === 0 ? 0xC2B280 : 0xD2B48C;
        graphics.fillStyle(color, 1);
        graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }

    this.hud = new Hud(this, personagemSelecionado);
    const seaSpawner = new SeaSpawner(this);
    seaSpawner.spawnAll?.();


    this.player = new Player(this, 400, 300, personagemSelecionado);
    this.enemy = new Enemy(this, 1900, 1000);

    this.player.perderVida();
    this.player.invulneravel = false;

    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach(({ bodyA, bodyB }) => {
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

        if ([tagA, tagB].includes('player') && [tagA, tagB].includes('enemy')) {
          this.perderVida();
        }
      });
    });

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.package = this.matter.add.image(1950, 600, 'package', null, { isStatic: true });
    this.package.setData('tag', 'package');

    this.portalMain = null;
    this.portalRings = [];

    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach(({ bodyA, bodyB }) => {
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
  perderVida() {
    if (this.player.invulneravel || this.physicsPaused) return;

    this.player.vidas--;
    this.hud.atualizarVidas(this.player.vidas);

    if (this.player.vidas <= 0) {
      this.showGameOverModal();
    } else {
      this.player.invulneravel = true;
      this.player.setTint(0xff0000);
      this.time.delayedCall(1000, () => {
        this.player.clearTint();
        this.player.invulneravel = false;
      });
    }
  }
  showLevelCompleteModal() {
      const hudDepth = 9000;
      this.modalBackground = this.add.rectangle(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.6
      ).setScrollFactor(0).setDepth(hudDepth-1);

      this.modalContainer = this.add.container(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2
      ).setScrollFactor(0).setDepth(hudDepth);

      const panel = this.add.rectangle(0, 0, 300, 200, 0xffffff, 1).setStrokeStyle(2, 0x000000);
      const title = this.add.text(0, -70, 'Fase Completa!', {
        fontSize: '24px',
        color: '#000',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      const progresso = JSON.parse(localStorage.getItem('progressoFases')) || {};
      progresso[4] = true;
      localStorage.setItem('progressoFases', JSON.stringify(progresso));

      const btnNext = this.add.text(0, -20, 'Próxima Fase', {
        fontSize: '20px',
        color: '#0077ff',
        backgroundColor: '#cce5ff',
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btnNext.on('pointerdown', () => {
        this.destroyModal();
        this.music.stop();
        this.scene.start('MedievalScene'); //prox fase -----------------
      });

      const btnRestart = this.add.text(0, 30, 'Reiniciar Fase', {
        fontSize: '20px',
        color: '#0077ff',
        backgroundColor: '#cce5ff',
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

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
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btnMenu.on('pointerdown', () => {
        this.destroyModal();
        this.music.stop();
        this.scene.start('MenuScene');
      });

      this.modalContainer.add([panel, title, btnNext, btnRestart, btnMenu]);
  }
  showGameOverModal() {
  const hudDepth = 9000;
    this.modalBackground = this.add.rectangle(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.6
    ).setScrollFactor(0).setDepth(hudDepth-1);

   this.modalContainer = this.add.container(
      this.cameras.main.midPoint.x,
      this.cameras.main.midPoint.y,
      [panel, title, btnNext, btnRestart, btnMenu]
    ).setScrollFactor(0).setDepth(hudDepth);


    const panel = this.add.rectangle(0, 0, 300, 200, 0xffffff, 1).setStrokeStyle(2, 0x000000);
    const title = this.add.text(0, -70, 'Fase Completa!', {
      fontSize: '24px',
      color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

  const btnRestart = this.add.text(0, 30, 'Reiniciar Fase', {
      fontSize: '20px',
      color: '#0077ff',
      backgroundColor: '#cce5ff',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

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
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnMenu.on('pointerdown', () => {
      this.destroyModal();
      this.music.stop();
      this.scene.start('MenuScene');
    });

    this.modalContainer.add([panel, title, btnRestart, btnMenu]);
  }


  destroyModal() {
    this.modalBackground?.destroy();
    this.modalContainer?.destroy();
  }

  spawnPortal() {
    const x = 300;
    const y = 350;

    this.portalMain?.destroy();
    this.portalRings.forEach(r => r.sprite.destroy());
    this.portalRings = [];

    this.portalMain = this.add.image(x, y, 'portal_center').setScale(1).setAlpha(0.9);
    this.matter.add.gameObject(this.portalMain, {
      shape: { type: 'circle', radius: 30 },
      isStatic: true,
      isSensor: true,
    });
    this.portalMain.setData('tag', 'portal');

    for (let i = 1; i <= 2; i++) {
      const ring = this.add.circle(x, y, 30 + i * 10, 0xDF9CFF, 0.3);
      this.portalRings.push({ sprite: ring, baseRadius: 30 + i * 10, scale: 1, growing: true });
    }
  }

  update() {
    this.player?.updateMovement?.(this.cursors);

    if (this.enemies && this.player) {
  const speed = 2.5;
  this.enemies.forEach(enemy => {
    const { x: ex, y: ey } = enemy.body.position;
    const { x: px, y: py } = this.player.body.position;
    const dx = px - ex;
    const dy = py - ey;
    const length = Math.hypot(dx, dy);

    if (length > 0) {
      enemy.setVelocity((dx / length) * speed, (dy / length) * speed);
    }
  });
}

    this.portalMain?.setRotation(this.portalMain.rotation + 0.02);

    this.portalRings.forEach(ring => {
      if (ring.growing) {
        ring.scale += 0.01;
        if (ring.scale >= 1.0) ring.growing = false;
      } else {
        ring.scale -= 0.01;
        if (ring.scale <= 1) ring.growing = true;
      }
      ring.sprite.setScale(ring.scale);
    });
  }

  shutdown() {
    if (this.music?.isPlaying) {
      this.music.stop();
    }
  }
}