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

let player1StateLabel, player2StateLabel, weatherLabel, matchTimerLabel;

const anticipationFrames = 30;
const cooldownFrames = 60;

function preload() {
  this.load.image('grandpa1-idle', 'assets/grandpa1-idle.png');
  this.load.image('grandpa1-rod-in-water', 'assets/grandpa1-rod-in-water.png');
  this.load.image('grandpa1-pulling-rod-out', 'assets/grandpa1-pulling-rod-out.png');
  this.load.image('grandpa1-pull-finish-no-fish', 'assets/grandpa1-pull-finish-no-fish.png');
  this.load.image('grandpa1-pull-finish-YAY-FISH', 'assets/grandpa1-pull-finish-YAY-FISH', 'assets/grandpa1-pull-finish-YAY-FISH.png');

  this.load.image('grandpa2-idle', 'assets/grandpa2-idle.png');
  this.load.image('grandpa2-rod-in-water', 'assets/grandpa2-rod-in-water.png');
  this.load.image('grandpa2-pulling-rod-out', 'assets/grandpa2-pulling-rod-out.png');
  this.load.image('grandpa2-pull-finish-no-fish', 'assets/grandpa2-pull-finish-no-fish.png');
  this.load.image('grandpa2-pull-finish-YAY-FISH', 'assets/grandpa2-pull-finish-YAY-FISH.png');

  this.load.image('button', 'assets/button.png');
  this.load.image('play-again', 'assets/play-again.png');
}

function create() {
  player1 = this.add.sprite(this.cameras.main.centerX - 50, this.cameras.main.centerY, 'grandpa1-idle');
  player2 = this.add.sprite(this.cameras.main.centerX + 50, this.cameras.main.centerY, 'grandpa2-idle');

  player1Button = this.add.sprite(this.cameras.main.centerX - 50, this.cameras.main.centerY + 150, 'button')
    .setInteractive()
    .setOrigin(0.5);
  player2Button = this.add.sprite(this.cameras.main.centerX + 50, this.cameras.main.centerY + 150, 'button')
    .setInteractive()
    .setOrigin(0.5);

  player1Button.on('pointerdown', () => handlePlayerInput(1, 'pointerdown'));
  player1Button.on('pointerup', () => handlePlayerInput(1, 'pointerup'));
  player2Button.on('pointerdown', () => handlePlayerInput(2, 'pointerdown'));
  player2Button.on('pointerup', () => handlePlayerInput(2, 'pointerup'));

  // Add debug labels
  player1StateLabel = this.add.text(16, 16, 'Player 1 State: ' + player1State, { fontSize: '16px', fill: '#fff' });
  player2StateLabel = this.add.text(16, 36, 'Player 2 State: ' + player2State, { fontSize: '16px', fill: '#fff' });
  weatherLabel = this.add.text(16, 56, 'Weather: ' + weather, { fontSize: '16px', fill: '#fff' });
  matchTimerLabel = this.add.text(16, 76, 'Match Time: ' + matchTimer, { fontSize: '16px', fill: '#fff' });

  // Add key bindings
  this.input.keyboard.on('keydown-Z', () => handlePlayerInput(1, 'keydown'));
  this.input.keyboard.on('keyup-Z', () => handlePlayerInput(1, 'keyup'));
  this.input.keyboard.on('keydown-X', () => handlePlayerInput(2, 'keydown'));
  this.input.keyboard.on('keyup-X', () => handlePlayerInput(2, 'keyup'));
}

function update() {
  if (matchStarted) {
    matchTimer--;
    if (matchTimer <= 0) {
      endMatch();
    }
  }

  updatePlayerState(1);
  updatePlayerState(2);

  weatherTimer++;
  if (weatherTimer > Phaser.Math.Between(600, 900)) { // 10-15 seconds at 60fps
    changeWeather();
    weatherTimer = 0;
  }

  // Update debug labels
  player1StateLabel.setText('Player 1 State: ' + player1State);
  player2StateLabel.setText('Player 2 State: ' + player2State);
  weatherLabel.setText('Weather: ' + weather);
  matchTimerLabel.setText('Match Time: ' + matchTimer);
}

function handlePlayerInput(player, action) {
  let playerState, playerCooldown, playerRodTime, playerAnticipation, playerSprite, playerIdleTexture, playerRodInWaterTexture, playerPullingRodOutTexture;

  if (player === 1) {
    playerState = player1State;
    playerCooldown = player1Cooldown;
    playerRodTime = player1RodTime;
    playerAnticipation = player1Anticipation;
    playerSprite = player1;
    playerIdleTexture = 'grandpa1-idle';
    playerRodInWaterTexture = 'grandpa1-rod-in-water';
    playerPullingRodOutTexture = 'grandpa1-pulling-rod-out';
  } else {
    playerState = player2State;
    playerCooldown = player2Cooldown;
    playerRodTime = player2RodTime;
    playerAnticipation = player2Anticipation;
    playerSprite = player2;
    playerIdleTexture = 'grandpa2-idle';
    playerRodInWaterTexture = 'grandpa2-rod-in-water';
    playerPullingRodOutTexture = 'grandpa2-pulling-rod-out';
  }

  if (action === 'pointerdown' || action === 'keydown') {
    if (playerState === 'idle' && playerCooldown === 0) {
      playerState = 'rod-in-water';
      playerSprite.setTexture(playerRodInWaterTexture);
      playerRodTime = 0;
      if ((player === 1 && player2State === 'rod-in-water') || (player === 2 && player1State === 'rod-in-water')) {
        matchStarted = true;
      }
    } else if (playerState === 'pulling-rod-out') {
      playerState = 'rod-in-water';
      playerSprite.setTexture(playerRodInWaterTexture);
    }
  } else if (action === 'pointerup' || action === 'keyup') {
    if (playerState === 'rod-in-water') {
      playerState = 'pulling-rod-out';
      playerSprite.setTexture(playerPullingRodOutTexture);
      playerAnticipation = anticipationFrames;
    }
  }

  if (player === 1) {
    player1State = playerState;
    player1Cooldown = playerCooldown;
    player1RodTime = playerRodTime;
    player1Anticipation = playerAnticipation;
  } else {
    player2State = playerState;
    player2Cooldown = playerCooldown;
    player2RodTime = playerRodTime;
    player2Anticipation = playerAnticipation;
  }
}

function updatePlayerState(player) {
  let playerState, playerAnticipation, playerRodTime, playerCooldown, playerSprite, playerIdleTexture, playerPullFinishNoFishTexture, playerPullFinishYayFishTexture, playerFishCount;

  if (player === 1) {
    playerState = player1State;
    playerAnticipation = player1Anticipation;
    playerRodTime = player1RodTime;
    playerCooldown = player1Cooldown;
    playerSprite = player1;
    playerIdleTexture = 'grandpa1-idle';
    playerPullFinishNoFishTexture = 'grandpa1-pull-finish-no-fish';
    playerPullFinishYayFishTexture = 'grandpa1-pull-finish-YAY-FISH';
    playerFishCount = player1FishCount;
  } else {
    playerState = player2State;
    playerAnticipation = player2Anticipation;
    playerRodTime = player2RodTime;
    playerCooldown = player2Cooldown;
    playerSprite = player2;
    playerIdleTexture = 'grandpa2-idle';
    playerPullFinishNoFishTexture = 'grandpa2-pull-finish-no-fish';
    playerPullFinishYayFishTexture = 'grandpa2-pull-finish-YAY-FISH';
    playerFishCount = player2FishCount;
  }

  if (playerState === 'rod-in-water') {
    playerRodTime++;
  }

  if (playerState === 'pulling-rod-out') {
    playerAnticipation--;
    if (playerAnticipation === 0) {
      playerState = 'pull-finish';
      const hasFish = checkFishCatch(playerRodTime);
      playerSprite.setTexture(hasFish ? playerPullFinishYayFishTexture : playerPullFinishNoFishTexture);
      playerCooldown = cooldownFrames;
      if (hasFish) {
        playerFishCount++;
      }
    }
  }

  if (playerState === 'pull-finish') {
    playerState = 'idle';
    playerSprite.setTexture(playerIdleTexture);
  }

  if (playerCooldown > 0) {
    playerCooldown--;
  }

  if (player === 1) {
    player1State = playerState;
    player1Anticipation = playerAnticipation;
    player1RodTime = playerRodTime;
    player1Cooldown = playerCooldown;
    player1FishCount = playerFishCount;
  } else {
    player2State = playerState;
    player2Anticipation = playerAnticipation;
    player2RodTime = playerRodTime;
    player2Cooldown = playerCooldown;
    player2FishCount = playerFishCount;
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

  const playAgainButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'play-again')
    .setInteractive()
    .setOrigin(0.5)
    .setVisible(true);

  playAgainButton.on('pointerdown', () => {
    this.scene.restart();
  });
}
