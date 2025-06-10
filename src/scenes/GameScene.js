import HUD from '../ui/HUD.js';
import ModalManager from '../ui/ModalManager.js';
import PlayerFactory from '../entidades/Player.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
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
    if (!personagemSelecionado) return this.scene.start('BootScene');

    this.createWorld();
    this.player = PlayerFactory.create(this, personagemSelecionado);
    this.setupCamera();
    this.setupControls();
    this.spawnPackage();

    this.hud = new HUD(this, personagemSelecionado);
    this.modal = new ModalManager(this);

    this.handleCollisions();
  }

  createWorld() {
    const graphics = this.add.graphics();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const color = Phaser.Math.Between(0, 1) === 0 ? 0x018600 : 0x018e00; //cores certas por enquanto, ver se adiciono uma imagem ao inves de cirar por pixel
        graphics.fillStyle(color, 1);
        graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }
  }

  setupCamera() {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  spawnPackage() {
    this.package = this.matter.add.image(200, 200, 'package', null, { isStatic: true });
    this.package.setData('tag', 'package');
  }

  spawnPortal() {
    this.portalMain = this.matter.add.rectangle(600, 200, 100, 100, { isStatic: true });
    const portal = this.add.rectangle(600, 200, 100, 100, 0x00ffff, 0.5);
    this.matter.add.gameObject(portal, this.portalMain);
    portal.setData('tag', 'portal');
  }

  handleCollisions() {
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
          this.modal.showLevelCompleteModal();
        }
      });
    });
  }
}