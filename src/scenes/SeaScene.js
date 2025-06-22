import Player from '../../entidades/Player.js';
import SeaSpawner from '../ambientacao/SeaSpawner.js';
import MedievalScene from './MedievalScene.js';
import Hud from '../../ui/Hud.js';

export default class SeaScene extends Phaser.Scene {
  constructor(key, musicKey, nextSceneKey) {
    super(key);

    this.sceneKey = SeaScene;
    this.musicKey = 'sea_theme';
    this.nextSceneKey = MedievalScene;

    this.tileSize = 6;
    this.cols = 512;
    this.rows = 224;
    this.worldWidth = this.cols * this.tileSize;
    this.worldHeight = this.rows * this.tileSize;

    this.spawner = SeaSpawner
  }

  preload() {
    this.load.spritesheet('Helen', 'entidades/helen_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Helena', 'entidades/helena_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Raissa', 'entidades/raissa_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('heart_full', 'assets/images/coracaoRosa.png');
    this.load.image('heart_empty', 'assets/images/coracaoCinza.PNG');
    this.load.image('mar.png', 'assets/images/sea/mar.png');
    this.load.image('sea_ruin1.png', 'assets/images/sea/ruins1.png');
    this.load.image('sea_ruin2.png', 'assets/images/sea/ruins2.png');
    this.load.image('coral1.png', 'assets/images/sea/coral1.png');
    this.load.image('coral2.png', 'assets/images/sea/coral2.png');
    this.load.image('rock1.png', 'assets/images/sea/rock1.png');
    this.load.image('portal_center', 'assets/images/portal.png');
    this.load.image('package', 'assets/images/package.png');
    this.load.audio(this.musicKey, `assets/audio/${this.musicKey}.mp3`);
  
  }

  create() {
    this.music = this.sound.add(this.musicKey, { loop: true, volume: 0.4 });
    this.music.play();

    const personagemSelecionado = localStorage.getItem('personagemSelecionado');
    if (!personagemSelecionado) {
      this.scene.start('BootScene');
      return;
    }

    this.drawFundo();

    if (this.spawner) {
      const spawnerInstance = new this.spawner(this);
      spawnerInstance.spawnAll?.();
    }

    this.player = new Player(this, 500, 400, personagemSelecionado);
    this.hud = new Hud(this, personagemSelecionado);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.package = this.matter.add.image(350, 900, 'package', null, { isStatic: true });
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

    this.events.on('abrirMenuModal', () => {
      this.abrirMenuModal();
    });
  }

  drawFundo() {
    const graphics = this.add.graphics();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const cor = Phaser.Math.Between(0, 1) === 0 ? 0xcccccc : 0xdddddd;
        graphics.fillStyle(cor, 1);
        graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
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
    ).setScrollFactor(0).setDepth(999);

    this.modalContainer = this.add.container(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2
    ).setScrollFactor(0).setDepth(1000);

    const panel = this.add.rectangle(0, 0, 300, 200, 0xffffff, 1).setStrokeStyle(2, 0x000000);
    const title = this.add.text(0, -70, 'Fase Completa!', { fontSize: '24px', color: '#000' }).setOrigin(0.5);

    const progresso = JSON.parse(localStorage.getItem('progressoFases')) || {};
    progresso[this.sceneKey] = true;
    localStorage.setItem('progressoFases', JSON.stringify(progresso));

    const btnNext = this.add.text(0, -20, 'Próxima Fase', {
      fontSize: '20px', color: '#0077ff', backgroundColor: '#cce5ff', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    btnNext.on('pointerdown', () => {
      this.destroyModal();
      this.music.stop();
      this.scene.start(this.nextSceneKey);
    });

    const btnRestart = this.add.text(0, 30, 'Reiniciar Fase', {
      fontSize: '20px', color: '#0077ff', backgroundColor: '#cce5ff', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    btnRestart.on('pointerdown', () => {
      this.destroyModal();
      this.music.stop();
      this.scene.restart();
    });

    const btnMenu = this.add.text(0, 80, 'Menu Principal', {
      fontSize: '20px', color: '#0077ff', backgroundColor: '#cce5ff', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

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

  spawnPortal() {
    const x = 180;
    const y = 200;

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
      let ring = this.add.circle(x, y, 30 + i * 10, 0xDF9CFF, 0.3);
      this.portalRings.push({ sprite: ring, baseRadius: 30 + i * 10, scale: 1, growing: true });
    }
  }

  update() {
    this.player?.updateMovement?.(this.cursors);

    if (this.portalMain) {
      this.portalMain.rotation += 0.02;
    }

    this.portalRings?.forEach(ring => {
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
    if (this.music && this.music.isPlaying) {
      this.music.stop();
    }
  }
}