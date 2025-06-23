import Player from '../../entidades/Player.js';
import Enemy from '../../entidades/Enemy.js';
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
    this.load.spritesheet('Helen', 'entidades/helen_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Helena', 'entidades/helena_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Raissa', 'entidades/raissa_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('vampiro1', 'entidades/vampiro1.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('vampiro2', 'entidades/vampiro2.png', { frameWidth: 64, frameHeight: 64 });
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
    this.load.image('bush21', 'assets/images/bush/Bush_simple2_1.png');
    this.load.image('bush22', 'assets/images/bush/Bush_simple2_2.png');
    this.load.image('bush23', 'assets/images/bush/Bush_simple2_3.png');
    this.load.image('autumnbush1', 'assets/images/bush/Autumn_bush1.png');
    this.load.image('autumnbush2', 'assets/images/bush/Autumn_bush2.png');
    this.load.image('blueflowerbush1', 'assets/images/bush/Bush_blue_flowers1.png');
    this.load.image('blueflowerbush2', 'assets/images/bush/Bush_blue_flowers2.png');
    this.load.image('orangeflowerbush1', 'assets/images/bush/Bush_orange_flowers1.png');
    this.load.image('orangeflowerbush2', 'assets/images/bush/Bush_orange_flowers2.png');
    this.load.image('medievalHouse1', 'assets/images/medieval/medievalHouse1.png');
    this.load.image('medievalHouse2', 'assets/images/medieval/medievalHouse2.png');
    this.load.image('medievalHouse4', 'assets/images/medieval/medievalHouse4.png');
    this.load.image('medievalHouse5', 'assets/images/medieval/medievalHouse5.png');
    this.load.image('medievalHouse6', 'assets/images/medieval/medievalHouse6.png');
    this.load.image('package', 'assets/images/package.png');
    this.load.audio('medievalMusic', 'assets/audio/medieval_theme.mp3');

  }

  create() {
    this.music = this.sound.add('medievalMusic', { loop: true, volume: 0.4 });
    this.music.play();

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
    this.hud = new Hud(this, personagemSelecionado);
    const medievalSpawner = new MedievalSpawner(this);
    medievalSpawner.spawnTrees();
    medievalSpawner.spawnBush();
    medievalSpawner.spawnHouses();

    this.player = new Player(this, 500, 400, personagemSelecionado);
    this.enemies = [
      new Enemy(this, 1800, 1000),
      new Enemy(this, 1900, 1000)
    ];

    this.player.vidas = 3;
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

    this.package = this.matter.add.image(2200, 200, 'package', null, { isStatic: true });
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
      this.music.stop();
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
  const cam = this.cameras.main;

  this.modalBackground = this.add.rectangle(
    cam.midPoint.x,
    cam.midPoint.y,
    cam.width,
    cam.height,
    0x000000,
    0.6
  ).setScrollFactor(0).setDepth(hudDepth - 1);

  const panel = this.add.rectangle(0, 0, 300, 200, 0xffffff, 1)
    .setStrokeStyle(2, 0x000000);

  const title = this.add.text(0, -70, 'Você Morreu!', {
    fontSize: '24px',
    color: '#000000',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  const btnRestart = this.add.text(0, -10, 'Reiniciar Fase', {
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

  const btnMenu = this.add.text(0, 50, 'Menu Principal', {
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

  this.modalContainer = this.add.container(
    cam.midPoint.x,
    cam.midPoint.y,
    [panel, title, btnRestart, btnMenu]
  ).setScrollFactor(0).setDepth(hudDepth);

  // Parar o jogador e pausar o jogo
  this.player.setVelocity(0);
  this.player.body.isStatic = true;
  this.physicsPaused = true;
}


  destroyModal() {
    if (this.modalBackground) this.modalBackground.destroy();
    if (this.modalContainer) this.modalContainer.destroy();
  }
  perderVida() {
    if (this.player.invulneravel || this.physicsPaused) return;

    this.player.vidas--;
    this.hud.atualizarVidas(this.player.vidas);

    if (this.player.vidas <= 0) {
      this.physicsPaused = true;
      this.player.setVelocity(0);
      this.player.setStatic(true);
      this.player.setTint(0xff0000);

      this.time.delayedCall(300, () => {
        this.showGameOverModal();
      });
    } else {
      this.player.invulneravel = true;
      this.player.setTint(0xff0000);
      this.time.delayedCall(1000, () => {
        this.player.clearTint();
        this.player.invulneravel = false;
      });
    }
  }
  spawnPortal() {
    const x = 250;
    const y = 350;
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

    if (this.enemies && this.player) {
  const speed = 3.5;
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
  shutdown() {
    if (this.music && this.music.isPlaying) {
      this.music.stop();
    }
  }
}