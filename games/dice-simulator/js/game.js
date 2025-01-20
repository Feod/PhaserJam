const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#182d3b',
  parent: 'game',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let dice;
let rollButton;

function preload() {
  this.load.image('dice1', 'assets/dice1.png');
  this.load.image('dice2', 'assets/dice2.png');
  this.load.image('dice3', 'assets/dice3.png');
  this.load.image('dice4', 'assets/dice4.png');
  this.load.image('dice5', 'assets/dice5.png');
  this.load.image('dice6', 'assets/dice6.png');
  this.load.image('rollButton', 'assets/rollButton.png'); // Ensure you have this asset
}

function create() {
  // Add the dice sprite
  dice = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'dice1');
  dice.setOrigin(0.5);

  // Add the roll button
  rollButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 200, 'rollButton')
    .setInteractive()
    .setOrigin(0.5);

  // Add input listener for the roll button
  rollButton.on('pointerdown', rollDice, this);
}

function update() {
  // You can add animations or other dynamic behavior here
}

function rollDice() {
  const diceRoll = Phaser.Math.Between(1, 6); // Generate a random number between 1 and 6
  dice.setTexture('dice' + diceRoll); // Change the dice texture
}
