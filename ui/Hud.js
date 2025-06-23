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
    const HUD_DEPTH = 9000;

    for (let i = 0; i < vidas; i++) {
      const x = margin + i * (heartWidth + heartSpacing);
      const y = margin;

      const coracao = scene.add.image(x, y, 'heart_full')
        .setScrollFactor(0)
        .setDisplaySize(heartWidth, heartHeight)
        .setOrigin(0, 0)
        .setDepth(HUD_DEPTH);

      this.coracoes.push(coracao);
    }

    const nomeX = margin + vidas * (heartWidth + heartSpacing) + 10;

    this.nomeTexto = scene.add.text(nomeX, margin + 2, personagemSelecionado, {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: '"Press Start 2P"',
      stroke: '#3b2f2f',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(HUD_DEPTH);

    this.btnMenu = scene.add.text(screenWidth - margin, margin + 2, 'Menu', {
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#5C4033',
      padding: { x: 12, y: 4 },
      fontFamily: '"Press Start 2P"',
      stroke: '#3b2f2f',
      strokeThickness: 2
    }).setScrollFactor(0)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(HUD_DEPTH + 1);

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
    const centerX = width / 2;
    const centerY = height / 2;

    const HUD_DEPTH = 9000;
    const MODAL_DEPTH_BACKGROUND = 10000;
    const MODAL_DEPTH_UI = 10001;
    const MODAL_DEPTH_BUTTON = 10002;

    this.container.setVisible(false);
    this.modalBackground = this.scene.add.rectangle(
      0, 0,
      width, height,
      0xa1866f, 0.4
    ).setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(MODAL_DEPTH_BACKGROUND);

    const panel = this.scene.add.rectangle(0, 0, 360, 240, 0x3b2f2f, 0.8)
      .setStrokeStyle(2, 0x3b2f2f)
      .setDepth(MODAL_DEPTH_UI)
      .setScrollFactor(0);

    const title = this.scene.add.text(0, -90, 'Menu de Pausa', {
      fontSize: '16px',
      color: '#000000',
      fontFamily: '"Press Start 2P"',
      align: 'center',
      stroke: '#3b2f2f',
      strokeThickness: 2
    }).setOrigin(0.5)
      .setDepth(MODAL_DEPTH_UI)
      .setScrollFactor(0);

    const btnRestart = this.createMenuButton('Reiniciar Fase', -30, () => {
      this.fecharMenuModal();
      this.scene.music?.stop?.();
      this.scene.scene.restart();
    });
    btnRestart.setDepth(MODAL_DEPTH_BUTTON);

    const btnMenu = this.createMenuButton('Voltar ao Menu', 30, () => {
      this.fecharMenuModal();
      this.scene.music?.stop?.();
      this.scene.scene.start('MenuScene');
    });
    btnMenu.setDepth(MODAL_DEPTH_BUTTON);

    const btnClose = this.scene.add.text(160, -110, 'X', {
      fontSize: '12px',
      fontFamily: '"Press Start 2P"',
      color: '#ffffff',
      backgroundColor: '#8B0000',
      padding: { x: 6, y: 4 },
      align: 'center',
      stroke: '#3b2f2f',
      strokeThickness: 2,
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(MODAL_DEPTH_BUTTON)
      .setScrollFactor(0);

    btnClose.on('pointerdown', () => this.fecharMenuModal());
    btnClose.on('pointerover', () => {
      btnClose.setStyle({ backgroundColor: '#AA0000', color: '#ffffaa' });
    });
    btnClose.on('pointerout', () => {
      btnClose.setStyle({ backgroundColor: '#8B0000', color: '#ffffff' });
    });

    this.modalContainer = this.scene.add.container(centerX, centerY, [
      panel, title, btnRestart, btnMenu, btnClose
    ]).setScrollFactor(0)
      .setDepth(MODAL_DEPTH_UI);
  }


  fecharMenuModal() {
    this.modalBackground?.destroy();
    this.modalContainer?.destroy();
    this.container.setVisible(true);
  }

  createMenuButton(text, y, callback) {
    const btn = this.scene.add.text(0, y, text, {
      fontSize: '12px',
      fontFamily: '"Press Start 2P"',
      color: '#ffffff',
      backgroundColor: '#3b2f2f',
      padding: { x: 20, y: 12 },
      align: 'center',
      fixedWidth: 240,
      stroke: '#3b2f2f',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000',
        blur: 0,
        fill: true,
      },
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(2002)
      .setScrollFactor(0);

    btn.on('pointerdown', callback);
    btn.on('pointerover', () => {
      btn.setStyle({
        backgroundColor: '#5c4033',
        color: '#ffffaa',
      });
    });
    btn.on('pointerout', () => {
      btn.setStyle({
        backgroundColor: '#3b2f2f',
        color: '#ffffff',
      });
    });

    return btn;
  }
}