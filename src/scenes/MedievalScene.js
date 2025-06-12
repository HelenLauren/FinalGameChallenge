import Player from '../../entidades/Player.js';
import Hud from '../../ui/Hud.js';
import MedievalSpawner from '../ambientacao/MedievalSpawner.js';
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
    this.load.image('portal_center', 'assets/images/portal.png');
    this.load.image('heart_full', 'assets/images/coracaoRosa.png');
    this.load.image('heart_empty', 'assets/images/coracaoCinza.PNG');
    this.load.image('Autumn_tree1', 'assets/images/trees/Autumn_tree1.png');
    this.load.image('Autumn_tree2', 'assets/images/trees/Autumn_tree2.png');
    this.load.image('Autumn_tree3', 'assets/images/trees/Autumn_tree3.png');
    this.load.image('Burned_tree1', 'assets/images/trees/Burned_tree1.png');
    this.load.image('Burned_tree2', 'assets/images/trees/Burned_tree2.png');
    this.load.image('Burned_tree3', 'assets/images/trees/Burned_tree3.png');
    this.load.image('Broken_tree1', 'assets/images/trees/Broken_tree1.png');
    this.load.image('Broken_tree3', 'assets/images/trees/Broken_tree3.png');
    this.load.image('Tree1', 'assets/images/trees/Tree1.png');
    this.load.image('Tree2', 'assets/images/trees/Tree2.png');
    this.load.image('Tree3', 'assets/images/trees/Tree3.png');
    this.load.image('medievalHouse1', 'assets/images/medieval/medievalHouse1.png');
    this.load.image('medievalHouse2', 'assets/images/medieval/medievalHouse2.png');
    this.load.image('medievalHouse4', 'assets/images/medieval/medievalHouse4.png');
    this.load.image('medievalHouse5', 'assets/images/medieval/medievalHouse5.png');
    this.load.image('medievalHouse6', 'assets/images/medieval/medievalHouse6.png');
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

    const medievalSpawner = new MedievalSpawner(this);
    medievalSpawner.spawnTrees();
    medievalSpawner.spawnHouses();

    this.player = new Player(this, 500, 400, personagemSelecionado);
    this.hud = new Hud(this, personagemSelecionado);

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
    progresso[5] = true;
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
    // Anéis
    for (let i = 1; i <= 2; i++) {
      let ring = this.add.circle(x, y, 30 + i * 10, 0xDF9CFF, 0.3);
      this.portalRings.push({ sprite: ring, baseRadius: 30 + i * 10, scale: 1, growing: true });
    }
  }

  update() {
    this.player.updateMovement(this.cursors);
    // Animações do portal
    if (this.portalMain) {
      this.portalMain.rotation += 0.02;
    }
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
  }
}