var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
  preload: preload,
  create: create,
  update: update
});

function preload() {
  game.load.image('dice1', 'assets/dice1.png');
  game.load.image('dice2', 'assets/dice2.png');
  game.load.image('dice3', 'assets/dice3.png');
  game.load.image('dice4', 'assets/dice4.png');
  game.load.image('dice5', 'assets/dice5.png');
  game.load.image('dice6', 'assets/dice6.png');
}

var dice;
var rollButton;

function create() {
  game.stage.backgroundColor = '#182d3b';

  dice = game.add.sprite(game.world.centerX, game.world.centerY, 'dice1');
  dice.anchor.setTo(0.5, 0.5);

  rollButton = game.add.button(game.world.centerX, game.world.centerY + 200, 'rollButton', rollDice, this);
  rollButton.anchor.setTo(0.5, 0.5);
}

function update() {
}

function rollDice() {
  var diceRoll = Math.floor(Math.random() * 6) + 1;
  dice.loadTexture('dice' + diceRoll);
}
