export default class Hud {
  constructor(scene, personagemSelecionado, vidas = 3) {
    this.scene = scene;
    this.vidas = vidas;
    this.coracoes = [];

    const margin = 16;
    const heartWidth = 25;
    const heartHeight = 20;
    const heartSpacing = 6;
    const screenWidth = scene.cameras.main.width;
    const hudDepth = 1000;

    for (let i = 0; i < vidas; i++) {
      const x = margin + i * (heartWidth + heartSpacing);
      const y = margin;

      const coracao = scene.add.image(x, y, 'heart_full')
        .setScrollFactor(0)
        .setDisplaySize(heartWidth, heartHeight)
        .setOrigin(0, 0)
        .setDepth(hudDepth);

      this.coracoes.push(coracao);
    }

    const nomeX = margin + vidas * (heartWidth + heartSpacing) + 10;

    this.nomeTexto = scene.add.text(nomeX, margin + 2, personagemSelecionado, {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: '"Press Start 2P"',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(hudDepth);

    this.btnMenu = scene.add.text(screenWidth - margin, margin + 2, 'Menu', {
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#5C4033',
      padding: { x: 12, y: 4 },
      fontFamily: '"Press Start 2P"',
      stroke: '#000',
      strokeThickness: 2
    }).setScrollFactor(0)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(hudDepth);

    this.btnMenu.on('pointerdown', () => {
      this.abrirMenuModal();
    });

    this.container = scene.add.container(0, 0, [
      ...this.coracoes,
      this.nomeTexto,
      this.btnMenu
    ]).setScrollFactor(0);
  }

  abrirMenuModal() {
    const cam = this.scene.cameras.main;
    const width = cam.width;
    const height = cam.height;

    const centerX = cam.worldView.x + width / 2;
    const centerY = cam.worldView.y + height / 2;

    const modalBackgroundDepth = 2000;
    const modalUIdepth = 2001;

    this.container.setVisible(false);

    this.modalBackground = this.scene.add.rectangle(
      cam.worldView.x,
      cam.worldView.y,
      width,
      height,
      0x000000,
      0.6
    )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(modalBackgroundDepth);

    this.modalContainer = this.scene.add.container(centerX, centerY)
      .setScrollFactor(0)
      .setDepth(modalUIdepth);

    const panel = this.scene.add.rectangle(0, 0, 320, 180, 0xffffff, 1)
      .setStrokeStyle(2, 0x000000)
      .setDepth(modalUIdepth);

    const title = this.scene.add.text(0, -60, 'Menu de Pausa', {
      fontSize: '24px',
      color: '#000',
      fontStyle: 'bold',
      fontFamily: '"Press Start 2P"',
    }).setOrigin(0.5).setDepth(modalUIdepth);

    const btnRestart = this.scene.add.text(0, -10, 'Reiniciar Fase', {
      fontSize: '20px',
      color: '#0077ff',
      backgroundColor: '#e0e0e0',
      padding: { x: 10, y: 5 },
      fontFamily: '"Press Start 2P"',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(modalUIdepth);

    btnRestart.on('pointerdown', () => {
      this.fecharMenuModal();
      this.scene.music?.stop?.();
      this.scene.scene.restart();
    });

    const btnMenu = this.scene.add.text(0, 50, 'Voltar ao Menu', {
      fontSize: '20px',
      color: '#0077ff',
      backgroundColor: '#e0e0e0',
      padding: { x: 10, y: 5 },
      fontFamily: '"Press Start 2P"',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(modalUIdepth);

    btnMenu.on('pointerdown', () => {
      this.fecharMenuModal();
      this.scene.music?.stop?.();
      this.scene.scene.start('MenuScene');
    });

    this.modalContainer.add([panel, title, btnRestart, btnMenu]);
  }

  fecharMenuModal() {
    this.modalBackground?.destroy();
    this.modalContainer?.destroy();
    this.container.setVisible(true);
  }
}