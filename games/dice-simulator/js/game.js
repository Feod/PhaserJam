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
  }
};

const game = new Phaser.Game(config);

let diceBase;
let diceOverlay;
let rollButton;
let cumulativeScore = 0; // P66d5
let scoreText; // P5326

function preload() {
  this.load.image('dice1', 'assets/dice1.png');
  this.load.image('dice2', 'assets/dice2.png');
  this.load.image('dice3', 'assets/dice3.png');
  this.load.image('dice4', 'assets/dice4.png');
  this.load.image('dice5', 'assets/dice5.png');
  this.load.image('dice6', 'assets/dice6.png');
  this.load.image('dice_base_128', 'assets/dice_base_128.png'); // Load the dice base image
  this.load.image('rollButton', 'assets/rollButton.png'); // Ensure you have this asset
}

function create() {
  // Add the dice base sprite
  diceBase = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'dice_base_128');
  diceBase.setOrigin(0.5);

  // Add the dice overlay sprite
  diceOverlay = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'dice1');
  diceOverlay.setOrigin(0.5);

  // Add the roll button
  rollButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'rollButton') // P0e42
    .setInteractive()
    .setOrigin(0.5);

  // Add input listener for the roll button
  rollButton.on('pointerdown', rollDice, this);

  // Add the score text
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' }); // P5326
}

function update() {
  // You can add animations or other dynamic behavior here
}

function rollDice() {
  const diceRoll = Phaser.Math.Between(1, 6); // Generate a random number between 1 and 6

  // Add tween to animate dice roll
  this.tweens.add({
    targets: [diceBase, diceOverlay],
    rotation: { from: 0, to: 2 * Math.PI },
    scaleX: { from: 1, to: 1.5, yoyo: true },
    scaleY: { from: 1, to: 1.5, yoyo: true },
    duration: 300, // Make tween faster
    ease: 'Power2',
    onUpdate: () => {
      const randomFrame = Phaser.Math.Between(1, 6);
      diceOverlay.setTexture('dice' + randomFrame); // Change the dice texture continuously
    },
    onComplete: () => {
      diceOverlay.setTexture('dice' + diceRoll); // Set the final dice texture
      cumulativeScore += diceRoll; // P0970
      scoreText.setText('Score: ' + cumulativeScore); // P5326
    }
  });
}
