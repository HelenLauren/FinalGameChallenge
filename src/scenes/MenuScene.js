export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('package', 'https://labs.phaser.io/assets/sprites/crate.png');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    this.createPortalBackground();
    this.package = this.add.image(centerX, centerY, 'package').setOrigin(0.5);
    this.createMainMenu(centerX);
    this.createSobreSection(centerX, centerY);
    this.createComoJogarSection(centerX, centerY);
    this.createSelecionarFaseSection(centerX, centerY);
    this.showMenu();
  }

  createPortalBackground() {
    const centerX = 400;
    const centerY = 300;
    this.portalGraphics = this.add.graphics();
    this.orbiters = [];

    const orbiterCount = 6;
    const radius = 70;

    for (let i = 0; i < orbiterCount; i++) {
      const angle = Phaser.Math.DegToRad((360 / orbiterCount) * i);
      const orbiter = this.add.circle(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle),
        10,
        0x3399ff,
        0.8
      );
      this.orbiters.push({ sprite: orbiter, angle });
    }

    this.portalCenter = { x: centerX, y: centerY };
  }

  createMainMenu() {
    this.menuContainer = this.add.container(550, 100);

    const title = this.add.text(0, 0, 'Jogo sem nome por enquanto', {
      fontSize: '40px',
      color: '#00bfff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const btnJogar = this.createMenuButton('Jogar (Fase 1)', 60, () => {
      this.scene.start('GameScene');
    });

    const btnSelecionarFase = this.createMenuButton('Selecionar Fase', 120, () => {
      this.showSelecionarFaseSection();
    });

    const btnComoJogar = this.createMenuButton('Como Jogar', 180, () => {
      this.showComoJogarSection();
    });

    const btnSobre = this.createMenuButton('Sobre', 240, () => {
      this.showSobreSection();
    });

    const btnResetar = this.createMenuButton('Resetar Progresso', 300, () => {
      localStorage.removeItem('progressoFases');
      this.scene.restart(); // reinicia o menu
    });

    this.menuContainer.add([title, btnJogar, btnSelecionarFase, btnComoJogar, btnSobre, btnResetar]);
  }

  createMenuButton(text, y, callback) {
    const btn = this.add.text(0, y, text, {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#0077ff',
      padding: { x: 20, y: 10 },
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', callback);

    btn.on('pointerover', () => {
      btn.setStyle({ backgroundColor: '#005fa3' });
    });

    btn.on('pointerout', () => {
      btn.setStyle({ backgroundColor: '#0077ff' });
    });

    return btn;
  }

  createSobreSection() {
    this.sobreContainer = this.add.container(400, 300).setVisible(false);

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

  createComoJogarSection() {
    this.comoJogarContainer = this.add.container(400, 300).setVisible(false);

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

  createSelecionarFaseSection() {
    this.selecionarFaseContainer = this.add.container(400, 300).setVisible(false);

    const bg = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.8);

    const title = this.add.text(0, -170, 'Selecionar Fase', {
      fontSize: '32px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Fases disponíveis
    this.fases = [
      { nome: 'Fase 1', key: 'GameScene', desbloqueada: true },
      { nome: 'Fase 2', key: 'IceScene', desbloqueada: false },
      { nome: 'Fase 3', key: 'BrazilScene', desbloqueada: false },
    ];

    const progresso = JSON.parse(localStorage.getItem('progressoFases')) || { 1: true };
    this.fases.forEach((fase, idx) => {
      fase.desbloqueada = !!progresso[idx + 1];
    });

    this.faseButtons = [];

    this.fases.forEach((fase, idx) => {
      const y = -70 + idx * 60;
      const btn = this.add.text(0, y, fase.nome, {
        fontSize: '28px',
        color: fase.desbloqueada ? '#00ff00' : '#777777',
        backgroundColor: fase.desbloqueada ? '#005500' : '#222222',
        padding: { x: 20, y: 10 },
        align: 'center',
      }).setOrigin(0.5);

      if (fase.desbloqueada) {
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => {
          this.scene.start(fase.key);
        });

        btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#007700' }));
        btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#005500' }));
      }

      this.selecionarFaseContainer.add(btn);
      this.faseButtons.push(btn);
    });

    const btnVoltar = this.createMenuButton('Voltar', 150, () => {
      this.showMenu();
    });

    this.selecionarFaseContainer.add([bg, title, btnVoltar]);
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
  }

  update() {
    if (!this.orbiters) return;
    const orbitRadius = 70;
    const orbitSpeed = 0.02;
    this.orbiters.forEach(o => {
      o.angle += orbitSpeed;
      o.sprite.x = this.portalCenter.x + orbitRadius * Math.cos(o.angle);
      o.sprite.y = this.portalCenter.y + orbitRadius * Math.sin(o.angle);
    });
  }
}