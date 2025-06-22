export default class LoaderScene extends Phaser.Scene {
  constructor() {
    super('LoaderScene');
  }

  init(data) {
    this.nextScene = data.nextScene;
    this.assetsToLoad = data.assets || [];
  }

  preload() {
    this.loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Carregando...', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    for (const asset of this.assetsToLoad) {
      switch (asset.type) {
        case 'image':
          this.load.image(asset.key, asset.path);
          break;
        case 'spritesheet':
          this.load.spritesheet(asset.key, asset.path, asset.config);
          break;
        case 'audio':
          this.load.audio(asset.key, asset.path);
          break;
        default:
          console.warn(`Tipo não suportado: ${asset.type}`);
      }
    }
  }

  create() {
    this.scene.start(this.nextScene);
  }
}