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

let player1, player2;
let player1Button, player2Button;
let player1State = 'idle';
let player2State = 'idle';
let player1Anticipation = 0;
let player2Anticipation = 0;
let player1Cooldown = 0;
let player2Cooldown = 0;
let player1RodTime = 0;
let player2RodTime = 0;
let weather = 'sunny';
let weatherTimer = 0;
let matchStarted = false;
let matchTimer = 120; // 2 minutes in seconds
let player1FishCount = 0;
let player2FishCount = 0;

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
  this.load.image('play-again', 'assets/play-again.png');
}

function create() {
  player1 = this.add.sprite(this.cameras.main.centerX - 200, this.cameras.main.centerY, 'grandpa1-idle');
  player2 = this.add.sprite(this.cameras.main.centerX + 200, this.cameras.main.centerY, 'grandpa2-idle');

  player1Button = this.add.sprite(this.cameras.main.centerX - 200, this.cameras.main.centerY + 200, 'button')
    .setInteractive()
    .setOrigin(0.5);
  player2Button = this.add.sprite(this.cameras.main.centerX + 200, this.cameras.main.centerY + 200, 'button')
    .setInteractive()
    .setOrigin(0.5);

  player1Button.on('pointerdown', () => {
    if (player1State === 'idle' && player1Cooldown === 0) {
      player1State = 'rod-in-water';
      player1.setTexture('grandpa1-rod-in-water');
      player1RodTime = 0;
      if (player2State === 'rod-in-water' && !matchStarted) {
        matchStarted = true;
      }
    } else if (player1State === 'rod-in-water') {
      player1State = 'pulling-rod-out';
      player1Anticipation = 30; // 30 frames anticipation
    } else if (player1State === 'pulling-rod-out') {
      player1State = 'idle';
      player1.setTexture('grandpa1-idle');
    }
  });

  player1Button.on('pointerup', () => {
    if (player1State === 'pulling-rod-out' && player1Anticipation > 0) {
      player1State = 'rod-in-water';
      player1.setTexture('grandpa1-rod-in-water');
    }
  });

  player2Button.on('pointerdown', () => {
    if (player2State === 'idle' && player2Cooldown === 0) {
      player2State = 'rod-in-water';
      player2.setTexture('grandpa2-rod-in-water');
      player2RodTime = 0;
      if (player1State === 'rod-in-water' && !matchStarted) {
        matchStarted = true;
      }
    } else if (player2State === 'rod-in-water') {
      player2State = 'pulling-rod-out';
      player2Anticipation = 30; // 30 frames anticipation
    } else if (player2State === 'pulling-rod-out') {
      player2State = 'idle';
      player2.setTexture('grandpa2-idle');
    }
  });

  player2Button.on('pointerup', () => {
    if (player2State === 'pulling-rod-out' && player2Anticipation > 0) {
      player2State = 'rod-in-water';
      player2.setTexture('grandpa2-rod-in-water');
    }
  });
}

function update() {
  if (matchStarted) {
    matchTimer--;
    if (matchTimer <= 0) {
      endMatch();
    }
  }

  if (player1State === 'rod-in-water') {
    player1RodTime++;
  }

  if (player2State === 'rod-in-water') {
    player2RodTime++;
  }

  if (player1State === 'pulling-rod-out' && player1Anticipation > 0) {
    player1Anticipation--;
    if (player1Anticipation === 0) {
      player1State = 'pull-finish';
      const hasFish = checkFishCatch(player1RodTime);
      player1.setTexture(hasFish ? 'grandpa1-pull-finish-YAY-FISH' : 'grandpa1-pull-finish-no-fish');
      player1Cooldown = 60; // 60 frames cooldown
      if (hasFish) {
        player1FishCount++;
      }
    }
  }

  if (player2State === 'pulling-rod-out' && player2Anticipation > 0) {
    player2Anticipation--;
    if (player2Anticipation === 0) {
      player2State = 'pull-finish';
      const hasFish = checkFishCatch(player2RodTime);
      player2.setTexture(hasFish ? 'grandpa2-pull-finish-YAY-FISH' : 'grandpa2-pull-finish-no-fish');
      player2Cooldown = 60; // 60 frames cooldown
      if (hasFish) {
        player2FishCount++;
      }
    }
  }

  if (player1State === 'pull-finish') {
    player1State = 'idle';
    player1.setTexture('grandpa1-idle');
  }

  if (player2State === 'pull-finish') {
    player2State = 'idle';
    player2.setTexture('grandpa2-idle');
  }

  if (player1Cooldown > 0) {
    player1Cooldown--;
  }

  if (player2Cooldown > 0) {
    player2Cooldown--;
  }

  weatherTimer++;
  if (weatherTimer > Phaser.Math.Between(600, 900)) { // 10-15 seconds at 60fps
    changeWeather();
    weatherTimer = 0;
  }
}

function checkFishCatch(rodTime) {
  switch (weather) {
    case 'sunny':
      return rodTime >= 60 && rodTime <= 300; // 1-5 seconds
    case 'cloudy':
      return (rodTime % 480) >= 300 && (rodTime % 480) <= 480; // 5s fail, 3s success
    case 'rainbows':
      return true;
    case 'winter':
      return rodTime >= 300; // 5 seconds or more
    default:
      return false;
  }
}

function changeWeather() {
  const weathers = ['sunny', 'cloudy', 'rainbows', 'winter'];
  weather = weathers[Phaser.Math.Between(0, weathers.length - 1)];
}

function endMatch() {
  matchStarted = false;
  let winner;
  if (player1FishCount > player2FishCount) {
    winner = 'Player 1';
  } else if (player2FishCount > player1FishCount) {
    winner = 'Player 2';
  } else {
    winner = 'No one';
  }

  const winnerText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, `${winner} wins!`, { fontSize: '32px', fill: '#fff' });
  winnerText.setOrigin(0.5);

  const playAgainButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'play-again')
    .setInteractive()
    .setOrigin(0.5);

  playAgainButton.on('pointerdown', () => {
    this.scene.restart();
  });
}
