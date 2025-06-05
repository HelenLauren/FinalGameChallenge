import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#228B22',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);
