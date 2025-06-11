export default class Hud {
  constructor(scene, personagemSelecionado, vidas = 3) {
    this.scene = scene;
    this.vidas = vidas;
    this.coracoes = [];

    const margin = 10;

    for (let i = 0; i < vidas; i++) {
      const coracao = scene.add.image(margin + i * 34, margin, 'heart_full')
        .setScrollFactor(0)
        .setDisplaySize(50, 50)
        .setOrigin(0, 0);
      this.coracoes.push(coracao);
    }

    this.nomeTexto = scene.add.text(margin + 3 * 34 + 10, margin + 6, personagemSelecionado, {
      fontSize: '16px',
      fill: '#fff',
      fontFamily: '"Press Start 2P"',
      stroke: '#000',
      strokeThickness: 2
    }).setScrollFactor(0);

    this.btnMenu = scene.add.text(margin, margin + 60, 'Menu', {
      fontSize: '20px',
      color: '#fff',
      backgroundColor: '#5C4033',
      padding: { x: 12, y: 6 },
      fontFamily: '"Press Start 2P"',
      stroke: '#000',
      strokeThickness: 2
    }).setScrollFactor(0)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.btnMenu.on('pointerdown', () => {
      scene.menuJogo();
    });

    this.container = scene.add.container(0, 0, [
      ...this.coracoes,
      this.nomeTexto,
      this.btnMenu
    ]);
    this.container.setScrollFactor(0).setDepth(5);
  }
}