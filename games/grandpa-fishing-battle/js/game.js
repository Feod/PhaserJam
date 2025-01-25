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
let player1ShowLootTime = 0;
let player2ShowLootTime = 0;
let weather = 'sunny';
let weatherTimer = 0;
let matchStarted = false;
let matchTimer = 120; // 2 minutes in seconds
let player1FishCount = 0;
let player2FishCount = 0;
let waitingForMatchStart = true;
let player1GotFish = false;
let player2GotFish = false;

let player1StateLabel, player2StateLabel, weatherLabel, matchTimerLabel;

const anticipationFrames = 30;
const cooldownFrames = 60;
const showLootFrames = 90;

let plopSound, grandpaAPullFromWaterSound, grandpaBPullFromWaterSound, outOfWaterSplashSounds, grandpaAHappySound, grandpaBHappySound, grandpaASadSound, grandpaBSadSound;

let grandpaTween;

function preload() {
  this.load.image('background', 'assets/background.png');

  this.load.spritesheet('granpaA_fishing', 'assets/granpaA_fishing.png', { frameWidth: 1024, frameHeight: 1024 });
  this.load.spritesheet('granpaA_results', 'assets/granpaA_results.png', { frameWidth: 1024, frameHeight: 1024 });

  this.load.spritesheet('granpaB_fishing', 'assets/granpaB_fishing.png', { frameWidth: 1024, frameHeight: 1024 });
  this.load.spritesheet('granpaB_results', 'assets/granpaB_results.png', { frameWidth: 1024, frameHeight: 1024 });

  this.load.image('button', 'assets/button.png');
  this.load.image('play-again', 'assets/play-again.png');


  //Use random plop each time
  this.load.audio('plop-0', 'assets/sfx/plop.wav');
  this.load.audio('plop-1', 'assets/sfx/rodouttawater7.wav');
  this.load.audio('plop-2', 'assets/sfx/rodouttawater6_outplop.wav');

  this.load.audio('grandpaA-pull-from-water', 'assets/sfx/rodouttawater2_maybetoocomedicandnotwetenough.wav');
  this.load.audio('grandpaB-pull-from-water', 'assets/sfx/rodouttawater1.wav');

  //Use random splash each time
  this.load.audio('out-of-water-splash-0', 'assets/sfx/rodouttawater10.wav');
  this.load.audio('out-of-water-splash-1', 'assets/sfx/rodouttawater9.wav');
  this.load.audio('out-of-water-splash-2', 'assets/sfx/rodouttawater8.wav');

  this.load.audio('grandpaA-happy', 'assets/sfx/grandpahappy07.wav');
  this.load.audio('grandpaB-happy', 'assets/sfx/grandpahappy09.wav');
  this.load.audio('grandpaA-sad', 'assets/sfx/sadgrandpa09.wav');
  this.load.audio('grandpaB-sad', 'assets/sfx/sadgrandpa08.wav');

}

function create() {
  // Add background image
  const background = this.add.image(0, 0, 'background');
  background.setOrigin(0, 0);
  background.displayWidth = this.sys.game.config.width;
  background.displayHeight = this.sys.game.config.height;

  player1 = this.add.sprite(this.cameras.main.centerX - 100, this.cameras.main.centerY, 'granpaA_fishing', 0);
  player2 = this.add.sprite(this.cameras.main.centerX + 100, this.cameras.main.centerY, 'granpaB_fishing', 0);

  // Scale down player1 by 1/4
  player1.setScale(0.25);
  player2.setScale(0.25);

  player1Button = this.add.sprite(this.cameras.main.centerX - 50, this.cameras.main.centerY + 150, 'button')
    .setInteractive()
    .setOrigin(0.5);
  player2Button = this.add.sprite(this.cameras.main.centerX + 50, this.cameras.main.centerY + 150, 'button')
    .setInteractive()
    .setOrigin(0.5);

  player1Button.on('pointerdown', () => handlePlayerInput(1, 'pointerdown', this));
  player1Button.on('pointerup', () => handlePlayerInput(1, 'pointerup', this));
  player2Button.on('pointerdown', () => handlePlayerInput(2, 'pointerdown', this));
  player2Button.on('pointerup', () => handlePlayerInput(2, 'pointerup', this));

  // Add debug labels
  player1StateLabel = this.add.text(16, 16, 'Player 1 State: ' + player1State, { fontSize: '16px', fill: '#fff' });
  player2StateLabel = this.add.text(16, 36, 'Player 2 State: ' + player2State, { fontSize: '16px', fill: '#fff' });
  weatherLabel = this.add.text(16, 56, 'Weather: ' + weather, { fontSize: '16px', fill: '#fff' });
  matchTimerLabel = this.add.text(16, 76, 'Match Time: ' + matchTimer, { fontSize: '16px', fill: '#fff' });

  // Add key bindings
  this.input.keyboard.on('keydown-Z', () => handlePlayerInput(1, 'keydown', this));
  this.input.keyboard.on('keyup-Z', () => handlePlayerInput(1, 'keyup', this));
  this.input.keyboard.on('keydown-X', () => handlePlayerInput(2, 'keydown', this));
  this.input.keyboard.on('keyup-X', () => handlePlayerInput(2, 'keyup', this));

  plopSound = [
    this.sound.add('plop-0'),
    this.sound.add('plop-1'),
    this.sound.add('plop-2')
  ];
  grandpaAPullFromWaterSound = this.sound.add('grandpaA-pull-from-water');
  grandpaBPullFromWaterSound = this.sound.add('grandpaB-pull-from-water');
  outOfWaterSplashSounds = [
    this.sound.add('out-of-water-splash-0'),
    this.sound.add('out-of-water-splash-1'),
    this.sound.add('out-of-water-splash-2')
  ];
  grandpaAHappySound = this.sound.add('grandpaA-happy');
  grandpaBHappySound = this.sound.add('grandpaB-happy');
  grandpaASadSound = this.sound.add('grandpaA-sad');
  grandpaBSadSound = this.sound.add('grandpaB-sad');

  // Add tween animation for grandpa's scale and rotation
  grandpaTween = this.tweens.add({
    targets: [player1, player2],
    scaleX: { from: 0.25, to: 0.3, yoyo: true, duration: 300 },
    scaleY: { from: 0.25, to: 0.3, yoyo: true, duration: 400 },
    rotation: { from: 0, to: 0.1, yoyo: true }, // rotation doesn't have duration. Is that a problem?
    ease: 'Power2',
    paused: true
  });
}

function update() {
  if (matchStarted) {
    matchTimer--;
    if (matchTimer <= 0) {
      matchTimer = 0;
      endMatch.call(this); // Bind the function to the Scene
    }
  }

  updatePlayerState(1, this);
  updatePlayerState(2, this);

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

let inputCooldown = false;
function handlePlayerInput(player, action, scene) {

  if (inputCooldown) return;
  inputCooldown = true;
  setTimeout(() => (inputCooldown = false), 10); // 200ms cooldown
  // Your existing input handling logic here...


  if (!matchStarted && !waitingForMatchStart) return; // Disable player input when match ends and not waiting for match start

  let playerState, playerCooldown, playerRodTime, playerAnticipation, playerShowLootTime, playerSprite, playerIdleTexture, playerRodInWaterTexture, playerPullingRodOutTexture;

  let tweenTarget;

  if (player === 1) {

    tweenTarget = player1;

    
    playerState = player1State;
    playerCooldown = player1Cooldown;
    playerRodTime = player1RodTime;
    playerAnticipation = player1Anticipation;
    playerShowLootTime = player1ShowLootTime;
    playerSprite = player1;
    playerIdleTexture = 'granpaA_fishing';
    playerRodInWaterTexture = 'granpaA_fishing';
    playerPullingRodOutTexture = 'granpaA_fishing';
  } else {

    tweenTarget = player2;

    scene.tweens.add({
      targets: [player2],
      scaleX: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
      scaleY: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
      rotation: { from: 0, to: 0.1, yoyo: true, duration: 50 },
      ease: 'Power2',
      paused: true
    }).play();

    playerState = player2State;
    playerCooldown = player2Cooldown;
    playerRodTime = player2RodTime;
    playerAnticipation = player2Anticipation;
    playerShowLootTime = player2ShowLootTime;
    playerSprite = player2;
    playerIdleTexture = 'granpaB_fishing';
    playerRodInWaterTexture = 'granpaB_fishing';
    playerPullingRodOutTexture = 'granpaB_fishing';
  }

  if (action === 'pointerdown' || action === 'keydown') {
    if (playerState === 'idle' && playerCooldown === 0) {
      playerState = 'rod-in-water';

      scene.tweens.add({
        targets: tweenTarget,
        scaleX: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
        scaleY: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
        rotation: { from: 0, to: 0.1, yoyo: true, duration: 50 },
        ease: 'Power2',
        paused: true
      }).play();

      playerSprite.setTexture(playerRodInWaterTexture, 1);
      playerRodTime = 0;
      const randomPlopSound = Phaser.Math.Between(0, plopSound.length - 1);
      plopSound[randomPlopSound].play();
      if ((player === 1 && player2State === 'rod-in-water') || (player === 2 && player1State === 'rod-in-water')) {
        matchStarted = true;
        waitingForMatchStart = false;
        matchTimer = 120; // Reset match timer to 120 seconds
        matchTimerLabel.setText('Match Time: ' + matchTimer); // Update match timer label
      }

      // Play tween animation for grandpa's scale and rotation
      //if (grandpaTween.isPlaying()) {
      //  grandpaTween.restart();
      //} else {
      //  grandpaTween.play();
      //}

      //scene.tweens.add({
      //  targets: [player1, player2],
      //  scaleX: { from: 0.25, to: 0.3, yoyo: true, duration: 100 },
      //  scaleY: { from: 0.25, to: 0.2, yoyo: true, duration: 200 },
      //  rotation: { from: 0, to: 0.1, yoyo: true, duration: 300 },
      //  ease: 'Power2',
      //  paused: true
      //}).play();

      
    } else if (playerState === 'pulling-rod-out') {
      playerState = 'rod-in-water';

      scene.tweens.add({
        targets: tweenTarget,
        scaleX: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
        scaleY: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
        rotation: { from: 0, to: 0.1, yoyo: true, duration: 50 },
        ease: 'Power2',
        paused: true
      }).play();

      playerSprite.setTexture(playerRodInWaterTexture, 1);
      const randomPlopSound = Phaser.Math.Between(0, 2);
      plopSound[randomPlopSound].play();
    }
  } else if (action === 'pointerup' || action === 'keyup') {
    if (playerState === 'rod-in-water') {
      playerState = 'pulling-rod-out';

      scene.tweens.add({
        targets: tweenTarget,
        scaleX: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
        scaleY: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
        rotation: { from: 0, to: 0.1, yoyo: true, duration: 50 },
        ease: 'Power2',
        paused: true
      }).play();

      playerSprite.setTexture(playerPullingRodOutTexture, 2);
      playerAnticipation = anticipationFrames;
      if (player === 1) {
        grandpaAPullFromWaterSound.play();
      } else {
        grandpaBPullFromWaterSound.play();
      }
      const randomSplashSound = Phaser.Math.Between(0, 2);
      outOfWaterSplashSounds[randomSplashSound].play();
    }
  }

  if (player === 1) {
    player1State = playerState;
    player1Cooldown = playerCooldown;
    player1RodTime = playerRodTime;
    player1Anticipation = playerAnticipation;
    player1ShowLootTime = playerShowLootTime;
  } else {
    player2State = playerState;
    player2Cooldown = playerCooldown;
    player2RodTime = playerRodTime;
    player2Anticipation = playerAnticipation;
    player2ShowLootTime = playerShowLootTime;
  }
}

function updatePlayerState(player, scene) {
  let playerState, playerAnticipation, playerRodTime, playerCooldown, playerShowLootTime, playerSprite, playerIdleTexture, playerPullFinishNoFishTexture, playerPullFinishYayFishTexture, playerFishCount, gotFish;
  let tweenTarget;

  if (player === 1) {
    tweenTarget = player1;
    gotFish = player1GotFish;

    playerState = player1State;
    playerAnticipation = player1Anticipation;
    playerRodTime = player1RodTime;
    playerCooldown = player1Cooldown;
    playerShowLootTime = player1ShowLootTime;
    playerSprite = player1;
    playerIdleTexture = 'granpaA_fishing';
    playerPullFinishNoFishTexture = 'granpaA_results';
    playerPullFinishYayFishTexture = 'granpaA_results';
    playerFishCount = player1FishCount;
  } else {
    tweenTarget = player2;
    gotFish = player2GotFish;

    playerState = player2State;
    playerAnticipation = player2Anticipation;
    playerRodTime = player2RodTime;
    playerCooldown = player2Cooldown;
    playerShowLootTime = player2ShowLootTime;
    playerSprite = player2;
    playerIdleTexture = 'granpaB_fishing';
    playerPullFinishNoFishTexture = 'granpaB_results';
    playerPullFinishYayFishTexture = 'granpaB_results';
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
      playerSprite.setTexture(hasFish ? playerPullFinishYayFishTexture : playerPullFinishNoFishTexture, hasFish ? 3 : 2);
      playerCooldown = cooldownFrames;
      if (hasFish) {
        
        playerFishCount++;
        if (player === 1) {
          player1GotFish = true;
          grandpaAHappySound.play();
        } else {
          player2GotFish = true;
          grandpaBHappySound.play();
        }

      } else {

        if (player === 1) {
          player1GotFish = false;
          grandpaASadSound.play();
        } else {
          player2GotFish = false;
          grandpaBSadSound.play();
        }
      }
    }
  }

  if (playerState === 'pull-finish') {

    if (gotFish) {
      scene.tweens.add({
        targets: tweenTarget,
        scaleX: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
        scaleY: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
        rotation: { from: 0, to: 0.1, yoyo: true, duration: 50 },
        ease: 'Power2',
        paused: true
      }).play();
    }else{
      scene.tweens.add({
        targets: tweenTarget,
        scaleX: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
        scaleY: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
        rotation: { from: 0, to: 0.1, yoyo: true, duration: 50 },
        ease: 'Power2',
        paused: true
      }).play();
    }

    playerState = 'show-loot';
    playerShowLootTime = showLootFrames;
  }

  if (playerState === 'show-loot') {
    playerShowLootTime--;
    if (playerShowLootTime === 0) {
      playerState = 'idle';
      playerSprite.setTexture(playerIdleTexture, 0);
    }
  }

  if (playerCooldown > 0) {
    playerCooldown--;
  }

  if (player === 1) {
    player1State = playerState;
    player1Anticipation = playerAnticipation;
    player1RodTime = playerRodTime;
    player1Cooldown = playerCooldown;
    player1ShowLootTime = playerShowLootTime;
    player1FishCount = playerFishCount;
  } else {
    player2State = playerState;
    player2Anticipation = playerAnticipation;
    player2RodTime = playerRodTime;
    player2Cooldown = playerCooldown;
    player2ShowLootTime = playerShowLootTime;
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


const endMatch = function () {
  matchStarted = false;
  waitingForMatchStart = true;
  let winner;
  if (player1FishCount > player2FishCount) {
    winner = 'Player 1';
    player1.setTexture('granpaA_results', 3); // Winning player with fish captured sprite
    player2.setTexture('granpaB_results', 2); // Losing player with sad sprite
  } else if (player2FishCount > player1FishCount) {
    winner = 'Player 2';
    player2.setTexture('granpaB_results', 3); // Winning player with fish captured sprite
    player1.setTexture('granpaA_results', 2); // Losing player with sad sprite
  } else {
    winner = 'No one';
    player1.setTexture('granpaA_results', 2); // Both players with sad sprite
    player2.setTexture('granpaB_results', 2);
  }

  // Add winner text
  const winnerText = this.add.text(
    this.cameras.main.centerX,
    this.cameras.main.centerY - 100,
    `${winner} wins!`,
    { fontSize: '32px', fill: '#fff' }
  );
  winnerText.setOrigin(0.5);

  // Add "Play Again" button
  const playAgainButton = this.add.sprite(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    'play-again'
  )
    .setInteractive()
    .setOrigin(0.5)
    .setVisible(true);

  playAgainButton.on('pointerdown', () => {
    this.scene.restart(); // Restart the scene
  });
}
