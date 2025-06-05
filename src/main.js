import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import IceScene from './scenes/IceScene.js';
import BrazilScene from './scenes/BrazilScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 580,
  backgroundColor: '#2ecc71',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 }
    }
  },
  scene: [MenuScene, GameScene, IceScene, BrazilScene]
};

const game = new Phaser.Game(config);