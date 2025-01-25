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

//Game is about two grandpas fishing.

function preload() {
  this.load.image('grandpa1-idle', 'assets/grandpa1-idle.png');
  this.load.image('grandpa1-rod-in-water', 'assets/grandpa1-rod-in-water.png');
  this.load.image('grandpa1-pulling-rod-out', 'assets/grandpa1-pulling-rod-out.png');
  this.load.image('grandpa1-pull-finish-no-fish', 'assets/grandpa1-pull-finish-no-fish.png');
  this.load.image('grandpa1-pull-finish-YAY-FISH', 'assets/grandpa1-pull-finish-YAY-FISH.png');

  this.load.image('grandpa2-idle', 'assets/grandpa2-idle.png');
  this.load.image('grandpa2-rod-in-water', 'assets/grandpa2-rod-in-water.png');
  this.load.image('grandpa2-pulling-rod-out', 'assets/grandpa2-pulling-rod-out.png');
  this.load.image('grandpa2-pull-finish-no-fish', 'assets/grandpa2-pull-finish-no-fish.png');
  this.load.image('grandpa2-pull-finish-YAY-FISH', 'assets/grandpa2-pull-finish-YAY-FISH.png');

  this.load.image('button', 'assets/button.png');

}

function create() {

}

function update() {
  // You can add animations or other dynamic behavior here
}

