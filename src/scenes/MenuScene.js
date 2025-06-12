export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('background', 'assets/images/background.png');
    this.load.spritesheet('helen', 'entidades/helen_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('helena', 'entidades/helena_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('raissa', 'entidades/raissa_idle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.audio('menu-theme', 'assets/audio/menu-theme.mp3');
  }

  create() {
  this.centerX = this.cameras.main.width / 2;
  this.centerY = this.cameras.main.height / 2;

  this.backgroundImage = this.add.image(this.centerX, this.centerY, 'background')
    .setOrigin(0.5)
    .setDepth(-1)
    .setDisplaySize(this.cameras.main.width, this.cameras.main.height);


  if (!localStorage.getItem('progressoFases')) {
    localStorage.setItem('progressoFases', JSON.stringify({ 1: true }));
  }
  //seções do menu
  this.createMainMenu(); 
  this.createSelecionarPersonagemSection();
  this.createSobreSection();
  this.createComoJogarSection();
  this.createSelecionarFaseSection();


  this.showMenu();
  if (!this.sound.get('menu-theme')) {
  this.menuMusic = this.sound.add('menu-theme', {
    loop: true,
    volume: 0.0
  });
  this.menuMusic.play();
}
}

  createMainMenu() {
    this.menuContainer = this.add.container(this.centerX, this.centerY - 80);

    const title = this.add.text(0, -120, 'Vertere', {
      fontSize: '40px',
      fontFamily: '"Press Start 2P"',
      color: '#81d3fc',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
    }).setOrigin(0.5);

    const btnJogar = this.createMenuButton('Iniciar jogo', -40, () => {
      this.showSelecionarPersonagem();
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
      const confirmar = confirm("Tem certeza que deseja resetar seu progresso?");
      if (confirmar) {
        localStorage.removeItem('progressoFases');
        this.scene.restart();
      }
    });


    this.menuContainer.add([title, btnJogar, btnSelecionarFase, btnComoJogar, btnSobre, btnResetar]);
  }

  createMenuButton(text, y, callback) {
  const btn = this.add.text(0, y, text, {
    fontSize: '12px',
    fontFamily: '"Press Start 2P"',
    color: '#ffffff',
    backgroundColor: '#3b2f2f',
    padding: { x: 20, y: 12 },
    align: 'center',
    fixedWidth: 240,
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#000',
      blur: 0,
      fill: true,
    },
    stroke: '#000000',
    strokeThickness: 4,
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });

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
  createSelecionarPersonagemSection() {
    this.selecionarPersonagemContainer = this.add.container(this.centerX, this.centerY);

    const bg = this.add.rectangle(0, 0, 640, 400, 0x3b2f2f, 0.8).setOrigin(0.5);
    const title = this.add.text(0, -170, 'Selecione seu personagem', {
      fontSize: '20px',
      fontFamily: '"Press Start 2P"',
      color: '#81d3fc',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const personagens = [
      { nome: 'Helen', sprite: 'helen' },
      { nome: 'Helena', sprite: 'helena' },
      { nome: 'Raissa', sprite: 'raissa' },
    ];

    const spacingX = 150;

    this.selecionarPersonagemContainer.add(bg);
    this.selecionarPersonagemContainer.add(title);

    personagens.forEach((p, idx) => {
      const x = (idx - 1) * spacingX;

      const animKey = `${p.sprite}_frente`;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers(p.sprite, { start: 0, end: 4 }),
          frameRate: 3,
          repeat: -1,
          repeatDelay: 800
        });
      }

      const sprite = this.add.sprite(x, -30, p.sprite)
        .setScale(3)
        .setInteractive({ useHandCursor: true })
        .play(animKey);

      sprite.on('pointerover', () => {
        sprite.setScale(3.3);
        sprite.setTint(0x81d3fc);
      });

      sprite.on('pointerout', () => {
        sprite.setScale(3);
        sprite.clearTint();
      });

      sprite.on('pointerdown', () => {
        this.selecionarPersonagemContainer.setVisible(false);
        this.startPreview(p.sprite);
      });

      const nomeText = this.add.text(x, 70, p.nome, {
        fontSize: '10px',
        fontFamily: '"Press Start 2P"',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      this.selecionarPersonagemContainer.add([sprite, nomeText]);
    });

    const btnVoltar = this.createMenuButton('Voltar', 150, () => {
      this.showMenu();
    });

    this.selecionarPersonagemContainer.add(btnVoltar);
    this.selecionarPersonagemContainer.setVisible(false);
  }
  startPreview(personagemKey) {
    this.selectedCharacter = personagemKey;

    if (this.personagem) this.personagem.destroy();
    if (this.previewContainer) this.previewContainer.destroy();
    if (!this.anims.exists(`${personagemKey}_frente`)) {
      this.anims.create({
        key: `${personagemKey}_frente`,
        frames: this.anims.generateFrameNumbers(personagemKey, { start: 0, end: 4 }),
        frameRate: 3,
        repeat: -1,
        repeatDelay: 800
      });
    }

    this.previewContainer = this.add.container(0, 0);

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const bg = this.add.rectangle(centerX, centerY, 500, 350, 0x000000, 0.85)
      .setStrokeStyle(3, 0x81d3fc)
      .setOrigin(0.5);

    this.personagem = this.add.sprite(centerX, centerY - 40, personagemKey).setOrigin(0.5);
    this.personagem.play(`${personagemKey}_frente`);
    this.personagem.setScale(3.5);

    const textBg = this.add.rectangle(centerX, centerY + 100, 360, 40, 0x1f1f1f, 0.9).setOrigin(0.5);
    const enterText = this.add.text(centerX, centerY + 100, 'PRESSIONE ENTER PARA CONFIRMAR', {
      fontSize: '12px',
      fontFamily: '"Press Start 2P"',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5);
    const btnVoltarPreview = this.createMenuButton('Voltar', centerY + 150 - centerY, () => {
      this.previewContainer.destroy();
      this.selecionarPersonagemContainer.setVisible(true);
    });
    btnVoltarPreview.setPosition(centerX, centerY + 150);

    this.previewContainer.add([
      bg,
      this.personagem,
      textBg,
      enterText,
      btnVoltarPreview
    ]);
    this.input.keyboard.once('keydown-ENTER', () => {
      localStorage.setItem('personagemSelecionado', personagemKey);
      if (this.menuMusic) {
        this.menuMusic.stop();
      }
      this.scene.start('GameScene');
    });
  }

  createSobreSection() {
    this.sobreContainer = this.add.container(this.centerX, this.centerY);

    const bg = this.add.rectangle(0, 0, 760, 400, 0x3b2f2f, 0.8);
    const title = this.add.text(0, -170, 'Sobre o jogo', {
      fontSize: '20px',
      fontFamily:'"Press Start 2P"',
      color: '#81d3fc',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const texto = `
O nome Vertere vem do latim “transformar”, “mudar”.
Neste jogo, o desafio é coletar o pacote perdido e levá-lo até o portal para completar a fase. Cada cenário traz obstáculos únicos que testam a habilidade e estratégia do jogador.

Desenvolvido por:

-Helen Lauren
-Helena Picinin
-Raissa Queiroz`;

    const text = this.add.text(0, -50, texto, {
      fontSize: '15px',
      fontFamily:'"Press Start 2P"',
      color: '#ffffff',
      align: 'left',
      stroke: '#000',
      strokeThickness: 2,
      wordWrap: { width: 720 }
    }).setOrigin(0.5);

    const btnVoltar = this.createMenuButton('Voltar', 150, () => {
      this.showMenu();
    });

    this.sobreContainer.add([bg, title, text, btnVoltar]);
    this.sobreContainer.setVisible(false);
  }

  createComoJogarSection() {
    this.comoJogarContainer = this.add.container(this.centerX, this.centerY);

    const bg = this.add.rectangle(0, 0, 760, 400, 0x3b2f2f, 0.8);
    const title = this.add.text(0, -170, 'Como Jogar', {
      fontSize: '20px',
      fontFamily:'"Press Start 2P"',
      color: '#81d3fc',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const instrucoes = `
- Use as setas para movimentar o jogador.
- Ache e pegue o pacote.
- Entre no portal para terminar suas entregas.
- Complete as fases para desbloquear as próximas.

- Divirta-se!
    `;

    const text = this.add.text(0, -60, instrucoes, {
      fontSize: '15px',
      fontFamily:'"Press Start 2P"',
      color: '#ffffff',
      align: 'left',
      stroke: '#000',
      strokeThickness: 2,
      wordWrap: { width: 720 }
    }).setOrigin(0.5);

    const btnVoltar = this.createMenuButton('Voltar', 150, () => {
      this.showMenu();
    });

    this.comoJogarContainer.add([bg, title, text, btnVoltar]);
    this.comoJogarContainer.setVisible(false);
  }

  createSelecionarFaseSection() {
    this.selecionarFaseContainer = this.add.container(this.centerX, this.centerY);

    const bg = this.add.rectangle(0, 0, 760, 400, 0x3b2f2f, 0.8).setOrigin(0.5);
    this.selecionarFaseContainer.add(bg);

    const title = this.add.text(0, -170, 'Selecionar Fase', {
      fontSize: '20px',
      fontFamily: '"Press Start 2P"',
      color: '#81d3fc',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.selecionarFaseContainer.add(title);

    this.fases = [
      { nome: 'Fase 1', key: 'GameScene' },
      { nome: 'Fase 2', key: 'IceScene' },
      { nome: 'Fase 3', key: 'EightiesScene' },
      { nome: 'Fase 4', key: 'MedievalScene' },
      { nome: 'Fase 5', key: 'DinoScene' },
      { nome: 'Fase 6', key: 'FutureScene' },
      { nome: 'Fase Final', key: 'FinalScene' }
    ];

    const progresso = JSON.parse(localStorage.getItem('progressoFases')) || {};
    progresso[1] = true;
    localStorage.setItem('progressoFases', JSON.stringify(progresso));

    this.faseButtons = [];

    const colCount = 3;
    const btnWidth = 170;
    const btnHeight = 50;
    const gapX = 30;
    const gapY = 20;
    const startY = -100;

    this.fases.forEach((fase, idx) => {
      const row = Math.floor(idx / colCount);
      const col = idx % colCount;
      const rowStartIdx = row * colCount;
      const colInRow = this.fases.slice(rowStartIdx, rowStartIdx + colCount).length;
      const rowStartX = -(colInRow - 1) * (btnWidth + gapX) / 2;

      const x = rowStartX + col * (btnWidth + gapX);
      const y = startY + row * (btnHeight + gapY);

      const btn = this.createMenuButton(fase.nome, y, () => {
        this.scene.start(fase.key);
      });
      btn.x = x;

      if (!progresso[idx + 1]) {
        btn.setAlpha(0.5);
        btn.disableInteractive();
      }

      this.selecionarFaseContainer.add(btn);
      this.faseButtons.push(btn);
    });

    const btnVoltar = this.createMenuButton('Voltar', 140, () => {
      this.showMenu();
    });
    this.selecionarFaseContainer.add(btnVoltar);

    this.selecionarFaseContainer.setVisible(false);
  }

  showMenu() {
    this.menuContainer.setVisible(true);
    this.sobreContainer.setVisible(false);
    this.comoJogarContainer.setVisible(false);
    this.selecionarFaseContainer.setVisible(false);
    this.selecionarPersonagemContainer.setVisible(false);
  }
  showSelecionarPersonagem() {
    this.menuContainer.setVisible(false);
    this.sobreContainer.setVisible(false);
    this.comoJogarContainer.setVisible(false);
    this.selecionarFaseContainer.setVisible(false);
    this.selecionarPersonagemContainer.setVisible(true);
  }
  showSelecionarFaseSection() {
    this.menuContainer.setVisible(false);
    this.sobreContainer.setVisible(false);
    this.comoJogarContainer.setVisible(false);
    this.selecionarFaseContainer.setVisible(true);
    this.selecionarPersonagemContainer.setVisible(false);
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
}