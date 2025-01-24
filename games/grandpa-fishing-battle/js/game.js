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

//Game description: Game is about two grandpas fishing. 2player game played with from the same keyboard.

function preload() {
  this.load.image('grandpaTest', 'assets/grandpaTest.png');
}

function create() {

}

function update() {
  // You can add animations or other dynamic behavior here
}

