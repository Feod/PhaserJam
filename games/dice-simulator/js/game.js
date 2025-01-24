const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerWidth,
  backgroundColor: '#182d3b',
  parent: 'game',
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    activePointers: 3 // Allow up to 3 active pointers for multitouch
  }
};

const game = new Phaser.Game(config);

let diceBase1;
let diceOverlay1;
let rollButton1;
let diceBase2;
let diceOverlay2;
let rollButton2;
let cumulativeScore = 0;
let scoreText;

function preload() {
  this.load.image('dice1', 'assets/dice1.png');
  this.load.image('dice2', 'assets/dice2.png');
  this.load.image('dice3', 'assets/dice3.png');
  this.load.image('dice4', 'assets/dice4.png');
  this.load.image('dice5', 'assets/dice5.png');
  this.load.image('dice6', 'assets/dice6.png');
  this.load.image('dice_base_128', 'assets/dice_base_128.png');
  this.load.image('rollButton', 'assets/rollButton.png');
}

function create() {
  // Add the first dice base sprite
  diceBase1 = this.add.sprite(this.cameras.main.centerX - 100, this.cameras.main.centerY, 'dice_base_128');
  diceBase1.setOrigin(0.5);
  diceBase1.setTint(0xff0000);

  // Add the first dice overlay sprite
  diceOverlay1 = this.add.sprite(this.cameras.main.centerX - 100, this.cameras.main.centerY, 'dice1');
  diceOverlay1.setOrigin(0.5);

  // Add the first roll button
  rollButton1 = this.add.sprite(this.cameras.main.centerX - 100, this.cameras.main.centerY + 100, 'rollButton')
    .setInteractive()
    .setOrigin(0.5);
  rollButton1.setScale(2); // P054e

  // Add input listener for the first roll button
  rollButton1.on('pointerdown', (pointer) => {
    if (pointer.isDown) {
      rollDice.call(this);
    }
  });

  // Add the second dice base sprite
  diceBase2 = this.add.sprite(this.cameras.main.centerX + 100, this.cameras.main.centerY, 'dice_base_128');
  diceBase2.setOrigin(0.5);
  diceBase2.setTint(0x0000ff);

  // Add the second dice overlay sprite
  diceOverlay2 = this.add.sprite(this.cameras.main.centerX + 100, this.cameras.main.centerY, 'dice1');
  diceOverlay2.setOrigin(0.5);

  // Add the second roll button
  rollButton2 = this.add.sprite(this.cameras.main.centerX + 100, this.cameras.main.centerY + 100, 'rollButton')
    .setInteractive()
    .setOrigin(0.5);
  rollButton2.setScale(2); // P054e

  // Add input listener for the second roll button
  rollButton2.on('pointerdown', (pointer) => {
    if (pointer.isDown) {
      rollDice2.call(this);
    }
  });

  // Add the score text
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
}

function update() {
  // You can add animations or other dynamic behavior here
}

function rollDice() {
  const diceRoll = Phaser.Math.Between(1, 6);

  // Add tween to animate dice roll
  this.tweens.add({
    targets: [diceBase1, diceOverlay1],
    rotation: { from: 0, to: 2 * Math.PI },
    scaleX: { from: 1, to: 1.5, yoyo: true },
    scaleY: { from: 1, to: 1.5, yoyo: true },
    duration: 300,
    ease: 'Power2',
    onUpdate: () => {
      const randomFrame = Phaser.Math.Between(1, 6);
      diceOverlay1.setTexture('dice' + randomFrame);
    },
    onComplete: () => {
      diceOverlay1.setTexture('dice' + diceRoll);
      cumulativeScore += diceRoll;
      scoreText.setText('Score: ' + cumulativeScore);
    }
  });
}

function rollDice2() {
  const diceRoll = Phaser.Math.Between(1, 6);

  // Add tween to animate dice roll
  this.tweens.add({
    targets: [diceBase2, diceOverlay2],
    rotation: { from: 0, to: 2 * Math.PI },
    scaleX: { from: 1, to: 1.5, yoyo: true },
    scaleY: { from: 1, to: 1.5, yoyo: true },
    duration: 300,
    ease: 'Power2',
    onUpdate: () => {
      const randomFrame = Phaser.Math.Between(1, 6);
      diceOverlay2.setTexture('dice' + randomFrame);
    },
    onComplete: () => {
      diceOverlay2.setTexture('dice' + diceRoll);
      cumulativeScore += diceRoll;
      scoreText.setText('Score: ' + cumulativeScore);
    }
  });
}
