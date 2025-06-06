export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('package', 'https://labs.phaser.io/assets/sprites/crate.png');
  }

  create() {
    // Garantir progresso inicial
    if (!localStorage.getItem('progressoFases')) {
      localStorage.setItem('progressoFases', JSON.stringify({ 1: true }));
    }

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.package = this.add.image(centerX, centerY, 'package').setOrigin(0.5);
    this.createMainMenu(centerX);
    this.createSobreSection(centerX, centerY);
    this.createComoJogarSection(centerX, centerY);
    this.createSelecionarFaseSection(centerX, centerY);
    this.showMenu();
  }

  createMainMenu(centerX) {
    const centerY = this.cameras.main.height / 2;
    this.menuContainer = this.add.container(centerX, centerY - 80);

    const title = this.add.text(0, -120, 'Jogo sem nome por enquanto', {
      fontSize: '40px',
      fontFamily: 'Arial',
      color: '#00bfff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
    }).setOrigin(0.5);

    const btnJogar = this.createMenuButton('Jogar (Fase 1)', -40, () => {
      this.scene.start('GameScene');
    });

    const btnSelecionarFase = this.createMenuButton('Selecionar Fase', 20, () => {
      this.showSelecionarFaseSection();
    });

    const btnComoJogar = this.createMenuButton('Como Jogar', 80, () => {
      this.showComoJogarSection();
    });

    const btnSobre = this.createMenuButton('Sobre', 140, () => {
      this.showSobreSection();
    });

    const btnResetar = this.createMenuButton('Resetar Progresso', 200, () => {
      localStorage.removeItem('progressoFases');
      this.scene.restart();
    });

    this.menuContainer.add([title, btnJogar, btnSelecionarFase, btnComoJogar, btnSobre, btnResetar]);
  }

  createMenuButton(text, y, callback) {
    const btn = this.add.text(0, y, text, {
      fontSize: '28px',
      fontFamily: 'Verdana',
      color: '#ffffff',
      backgroundColor: '#0077ff',
      padding: { x: 30, y: 10 },
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', callback);
    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#005fa3' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#0077ff' }));

    return btn;
  }

  createSobreSection(centerX, centerY) {
    this.sobreContainer = this.add.container(centerX, centerY);

    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.8);
    const title = this.add.text(0, -170, 'Sobre', {
      fontSize: '32px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const texto = `
Este jogo foi criado como projeto de aprendizado com Phaser.
Seu objetivo é coletar o pacote e chegar até o portal.

Participantes:
- Helen Lauren
- Helena Picinin
- Raissa Queiroz
    `;

    const text = this.add.text(0, -50, texto, {
      fontSize: '22px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 560 },
    }).setOrigin(0.5);

    const btnVoltar = this.createMenuButton('Voltar', 150, () => {
      this.showMenu();
    });

    this.sobreContainer.add([bg, title, text, btnVoltar]);
  }

  createComoJogarSection(centerX, centerY) {
    this.comoJogarContainer = this.add.container(centerX, centerY);

    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.8);
    const title = this.add.text(0, -170, 'Como Jogar', {
      fontSize: '32px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const instrucoes = `
- Use as setas para movimentar o jogador.
- Ache e pegue o pacote.
- Entre no portal para terminar suas entregas.
- Complete as fases para desbloquear as próximas.
- Divirta-se!
    `;

    const text = this.add.text(0, -70, instrucoes, {
      fontSize: '22px',
      color: '#ffffff',
      align: 'left',
      wordWrap: { width: 560 }
    }).setOrigin(0.5);

    const btnVoltar = this.createMenuButton('Voltar', 150, () => {
      this.showMenu();
    });

    this.comoJogarContainer.add([bg, title, text, btnVoltar]);
  }

  createSelecionarFaseSection(centerX, centerY) {
    this.selecionarFaseContainer = this.add.container(centerX, centerY);

    const bg = this.add.rectangle(0, 0, 640, 400, 0x000000, 0.9).setOrigin(0.5);
    this.selecionarFaseContainer.add(bg);

    const title = this.add.text(0, -170, 'Selecionar Fase', {
      fontSize: '32px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.selecionarFaseContainer.add(title);

    this.fases = [
      { nome: 'Fase 1', key: 'GameScene' },
      { nome: 'Fase 2', key: 'IceScene' },
      { nome: 'Fase 3', key: 'EightiesScene' },
      { nome: 'Fase 4', key: 'MedievalScene' },
      { nome: 'Fase 5', key: 'DinoScene' },
      { nome: 'Fase 6', key: 'FutureScene' },
      { nome: 'Final', key: 'FinalScene' }
    ];

    this.faseButtons = [];

    const colCount = 3;
    const btnWidth = 170;
    const btnHeight = 50;
    const gapX = 30;//espaçamentos
    const gapY = 20;

    this.fases.forEach((fase, idx) => {
      const col = idx % colCount;
      const row = Math.floor(idx / colCount);
      const startX = -((colCount - 1) * (btnWidth + gapX)) / 2;
      const x = startX + col * (btnWidth + gapX);
      const y = -70 + row * (btnHeight + gapY);

      const btn = this.add.text(x, y, fase.nome, {
        fontSize: '24px',
        color: '#cccccc',
        backgroundColor: '#555555',
        padding: { x: 20, y: 10 },
        align: 'center',
        fixedWidth: btnWidth,
        fixedHeight: btnHeight,
      }).setOrigin(0.5);

      this.selecionarFaseContainer.add(btn);
      this.faseButtons.push(btn);
    });

    const btnVoltar = this.createMenuButton('Voltar', 140, () => {
      this.showMenu();
    });
    this.selecionarFaseContainer.add(btnVoltar);
  }

  showMenu() {
    this.menuContainer.setVisible(true);
    this.sobreContainer.setVisible(false);
    this.comoJogarContainer.setVisible(false);
    this.selecionarFaseContainer.setVisible(false);
  }

  showSobreSection() {
    this.menuContainer.setVisible(false);
    this.sobreContainer.setVisible(true);
    this.comoJogarContainer.setVisible(false);
    this.selecionarFaseContainer.setVisible(false);
  }

  showComoJogarSection() {
    this.menuContainer.setVisible(false);
    this.sobreContainer.setVisible(false);
    this.comoJogarContainer.setVisible(true);
    this.selecionarFaseContainer.setVisible(false);
  }

  showSelecionarFaseSection() {
    this.menuContainer.setVisible(false);
    this.sobreContainer.setVisible(false);
    this.comoJogarContainer.setVisible(false);
    this.selecionarFaseContainer.setVisible(true);

    const progresso = JSON.parse(localStorage.getItem('progressoFases')) || { 1: true };

    this.faseButtons.forEach((btn, idx) => {
      const fase = this.fases[idx];
      const numeroFase = idx + 1;
      const desbloqueada = progresso[numeroFase] === true;

      if (desbloqueada) {
        btn.setStyle({
          color: '#ffffff',
          backgroundColor: '#00aa00'
        });

        btn.setInteractive({ useHandCursor: true });
        btn.removeAllListeners();
        btn.on('pointerdown', () => this.scene.start(fase.key));
        btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#008800' }));
        btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#00aa00' }));
      } else {
        btn.setStyle({
          color: '#cccccc',
          backgroundColor: '#555555'
        });
        btn.disableInteractive();
        btn.removeAllListeners();
      }
    });
  }

  update() {
   
  }
}