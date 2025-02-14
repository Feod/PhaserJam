const config = {
  type: Phaser.AUTO,
  //width: window.innerWidth,
  //height: window.innerWidth,
  width: 1024,
  height: 1024,
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

let p1key;
let p2key;

let background;
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
let matchFinished = false;
let matchTimer = 120; // 2 minutes in seconds
let player1FishCount = 0;
let player2FishCount = 0;
let waitingForMatchStart = true;
let player1GotFish = false;
let player2GotFish = false;
let matchResult = null; // Add a flag to indicate the match result

let player1StateLabel, player2StateLabel, weatherLabel, matchTimerLabel, largeTimerText;
let player1ScoreText, player2ScoreText;

const anticipationFrames = 30;
const cooldownFrames = 40;
const showLootFrames = 70;

let plopSound, grandpaAPullFromWaterSound, grandpaBPullFromWaterSound, outOfWaterSplashSounds, grandpaAHappySound, grandpaBHappySound, grandpaASadSound, grandpaBSadSound, matchStartSound, ambienceSound, idleSound;

let grandpaTween;

let fishParticles;
let fishEmitter;

let player1HoldingButton = false;
let player2HoldingButton = false;

function preload() {
  this.load.image('background', 'assets/background.png');

  this.load.spritesheet('granpaA_fishing', 'assets/granpaA_fishing.png', { frameWidth: 1024, frameHeight: 1024 });
  this.load.spritesheet('granpaA_results', 'assets/granpaA_results.png', { frameWidth: 1024, frameHeight: 1024 });

  this.load.spritesheet('granpaB_fishing', 'assets/granpaB_fishing.png', { frameWidth: 1024, frameHeight: 1024 });
  this.load.spritesheet('granpaB_results', 'assets/granpaB_results.png', { frameWidth: 1024, frameHeight: 1024 });

  this.load.image('button', 'assets/button.png');
  this.load.image('play-again', 'assets/again_button.png');
  this.load.spritesheet('lure', 'assets/lure.png', { frameWidth: 512, frameHeight: 512 });

  // Define lure animation
  //this.anims.create({
  //  key: 'lure-animate',
  //  frames: this.anims.generateFrameNumbers('assets/lure.png', { start: 0, end: 3 }),
  //  frameRate: 10,
  //  repeat: -1
  //});

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
  this.load.audio('grandpaB-sad', 'assets/sfx/sadgrandpa06.wav');

  this.load.audio('match-start', 'assets/sfx/grandpahappy01.wav'); // Match start sound effect

  this.load.audio('ambience', 'assets/music/Forest_Ambience.mp3'); // Load ambience soundtrack

  this.load.audio('match-start-music', 'assets/music/C_Cthulhu.mp3'); // Load match start music
  this.load.audio('match-end-music', 'assets/music/Best Grandpa_Cthulhu.mp3'); // Load match end music

  // Load fish image
  this.load.image('fish', 'assets/fish.png');

  // Load boat image
  this.load.image('boat', 'assets/boat.png'); // Pf8d8

  this.load.audio('idle', 'assets/sfx/rodouttawater6_outplop.wav'); // Load idle sound effect

}

function create() {
  // Add background image
  background = this.add.image(0, 0, 'background');
  background.setOrigin(0, 0);
  background.displayWidth = this.sys.game.config.width;
  background.displayHeight = this.sys.game.config.height;

  // Add boat sprite above background but behind grandpas
  const boat = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY+10, 'boat'); // P4236
  boat.setScale(0.25); // P4983

  setBackgroundTint.call(this, weather); // Set initial background tint based on weather

  player1 = this.add.sprite(this.cameras.main.centerX - 120, this.cameras.main.centerY-150, 'granpaA_fishing', 0);
  player2 = this.add.sprite(this.cameras.main.centerX + 120, this.cameras.main.centerY-150, 'granpaB_fishing', 0);

  // Scale down player1 by 1/4
  player1.setScale(0.25);
  player2.setScale(0.25);

  player1Button = this.add.sprite(this.cameras.main.centerX - 400, this.cameras.main.centerY + 300, 'button')
    .setInteractive()
    .setOrigin(0.5)
    .setScale(6)
    .setAlpha(0.1);
  player2Button = this.add.sprite(this.cameras.main.centerX + 400, this.cameras.main.centerY + 300, 'button')
    .setInteractive()
    .setOrigin(0.5)
    .setScale(6)
    .setAlpha(0.1);

  player1Button.on('pointerdown', () => handlePlayerInput(1, 'keydown', this));
  player1Button.on('pointerup', () => handlePlayerInput(1, 'keyup', this));
  player2Button.on('pointerdown', () => handlePlayerInput(2, 'keydown', this));
  player2Button.on('pointerup', () => handlePlayerInput(2, 'keyup', this));

  // Add debug labels
  player1StateLabel = this.add.text(16, 16, 'Player 1 State: ' + player1State, { fontSize: '16px', fill: '#fff' });
  player2StateLabel = this.add.text(16, 36, 'Player 2 State: ' + player2State, { fontSize: '16px', fill: '#fff' });
  weatherLabel = this.add.text(16, 56, 'Weather: ' + weather, { fontSize: '16px', fill: '#fff' });
  matchTimerLabel = this.add.text(16, 76, 'Match Time: ' + matchTimer, { fontSize: '16px', fill: '#fff' });

  // Add large timer text
  largeTimerText = this.add.text(this.cameras.main.centerX, 100, matchTimer, { fontSize: '48px', fill: '#fff', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 });
  largeTimerText.setOrigin(0.5);
  largeTimerText.setVisible(false);

  // Add score text objects for each player
  player1ScoreText = this.add.text(this.cameras.main.centerX - 300, this.cameras.main.centerY - 200, '0', { fontSize: '48px', fill: '#fff', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 });
  player2ScoreText = this.add.text(this.cameras.main.centerX + 300, this.cameras.main.centerY - 200, '0', { fontSize: '48px', fill: '#fff', fontStyle: 'bold', stroke: '#000', strokeThickness: 6 });

  // Hide score texts initially
  player1ScoreText.setVisible(false);
  player2ScoreText.setVisible(false);

  // Initialize score variables
  player1FishCount = 0;
  player2FishCount = 0;

  // Add key bindings
  //this.input.keyboard.on('keydown-Z', () => handlePlayerInput(1, 'keydown', this));
  //this.input.keyboard.on('keyup-Z', () => handlePlayerInput(1, 'keyup', this));
  //this.input.keyboard.on('keydown-X', () => handlePlayerInput(2, 'keydown', this));
  //this.input.keyboard.on('keyup-X', () => handlePlayerInput(2, 'keyup', this));

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
  matchStartSound = this.sound.add('match-start'); // Match start sound effect

  ambienceSound = this.sound.add('ambience'); // Add ambience sound
  ambienceSound.play({ loop: true }); // Play ambience sound in a loop

  this.matchStartMusic = this.sound.add('match-start-music'); // Add match start music
  this.matchEndMusic = this.sound.add('match-end-music'); // Add match end music

  idleSound = this.sound.add('idle'); // Add idle sound effect

  // Add lure sprites for each player and scale them to 1/4 size
  const lure1 = this.add.sprite(this.cameras.main.centerX - 200, this.cameras.main.centerY + 150, 'lure');
  lure1.setScale(0.25);
  const lure2 = this.add.sprite(this.cameras.main.centerX + 200, this.cameras.main.centerY + 150, 'lure');
  lure2.setScale(0.25);

  // Hide lures initially
  SetLureVisible(lure1, false, this);
  SetLureVisible(lure2, false, this);

  // Store lures in player objects
  player1.lure = lure1;
  player2.lure = lure2;

  this.p1key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  this.p2key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

  // Add credits text object
  this.creditsText = this.add.text(
    this.cameras.main.centerX,
    this.cameras.main.height - 350,
    "Made at FGJ Tampere 2025\nRepository: Feod/PhaserJam\nArt & Design: Silakka, Design & Production: Miikka\nGrandpa voices and other SFX: Pyry (Routalanttu)\nTools used: Phaser 3.87.0, Visual Studio Code, Audacity\nAI services utilized: Github Copilot Workspace (CODE), SUNO 3.5 (MUSIC)\nForest_Ambience.mp3 author: TinyWorlds from opengameart.org",
    { fontSize: '16px', fill: '#fff', align: 'center' }
  );
  this.creditsText.setOrigin(0.5);
  this.creditsText.setVisible(false); // Hide credits initially

  // Stop any currently playing ambience sound before starting a new one
  if (ambienceSound.isPlaying) {
    ambienceSound.stop();
  }
  ambienceSound.play({ loop: true });

 

  
}

function update() {

  //Inputs
  if (Phaser.Input.Keyboard.JustDown(this.p1key))
  {
      handlePlayerInput(1, 'keydown', this);
  }

  if(Phaser.Input.Keyboard.JustUp(this.p1key))
  {
    handlePlayerInput(1, 'keyup', this);
  }

  if (Phaser.Input.Keyboard.JustDown(this.p2key))
  {
    handlePlayerInput(2, 'keydown', this);
  }

  if(Phaser.Input.Keyboard.JustUp(this.p2key))
  {
    handlePlayerInput(2, 'keyup', this);
  }

    
  if (matchStarted) {
    matchTimer--;
    if (matchTimer <= 0) {
      matchTimer = 0;
      endMatch.call(this); // Bind the function to the Scene
    }
    largeTimerText.setText(matchTimer);
    largeTimerText.setVisible(true);
  } else {
    largeTimerText.setVisible(false);
  }

  updatePlayerState(1, this);
  updatePlayerState(2, this);

  weatherTimer++;
  if (weatherTimer > Phaser.Math.Between(600, 900)) { // 10-15 seconds at 60fps
    changeWeather.call(this);
    weatherTimer = 0;
  }

  // Update debug labels
  player1StateLabel.setText('Player 1 State: ' + player1State);
  player2StateLabel.setText('Player 2 State: ' + player2State);
  weatherLabel.setText('Weather: ' + weather);
  matchTimerLabel.setText('Match Time: ' + matchTimer);
}

let inputCooldownP1 = false;
let inputCooldownP2 = false;

function handlePlayerInput(player, action, scene) {

  //if (!matchStarted && !waitingForMatchStart) return; // Disable player input when match ends and not waiting for match start

  let playerState, playerCooldown, playerRodTime, playerAnticipation, playerShowLootTime, playerSprite, playerIdleTexture, playerRodInWaterTexture, playerPullingRodOutTexture, playerLure;

  let tweenTarget;

  if (player === 1) {

    if (inputCooldownP1) return;
    inputCooldownP1 = true;
    setTimeout(() => (inputCooldownP1 = false), 10); // 200ms cooldown
    
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
    playerLure = player1.lure;

    if (action === 'keydown') {
      player1HoldingButton = true;
    } else if (action === 'keyup') {
      player1HoldingButton = false;
    }

  } else {

    tweenTarget = player2;

    playerState = player2State;
    playerCooldown = player2Cooldown;
    playerRodTime = player2RodTime;
    playerAnticipation = player2Anticipation;
    playerShowLootTime = player2ShowLootTime;
    playerSprite = player2;
    playerIdleTexture = 'granpaB_fishing';
    playerRodInWaterTexture = 'granpaB_fishing';
    playerPullingRodOutTexture = 'granpaB_fishing';
    playerLure = player2.lure;

    if (action === 'keydown') {
      player2HoldingButton = true;
    } else if (action === 'keyup') {
      player2HoldingButton = false;
    }

  }

  if(matchFinished){
    
    if(action === 'keydown')
    {
      scene.tweens.add({
        targets: tweenTarget,
        scaleX: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
        scaleY: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
        //y: { from: playerSprite.y, to: playerSprite.y + 10, yoyo: true, duration: 20 },
        ease: 'Power2',
        paused: true
      }).play();
    }else{    
      scene.tweens.add({
        targets: tweenTarget,
        scaleX: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
        scaleY: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
        y: { from: playerSprite.y, to: playerSprite.y - 20, yoyo: true, duration: 40 },
        ease: 'Power2',
        paused: true
      }).play();
    }

    // Play grandpa sounds based on match result
    if (matchResult === 'Player 1' && player === 1) {
      grandpaAHappySound.play();
    } else if (matchResult === 'Player 2' && player === 2) {
      grandpaBHappySound.play();
    } else if (matchResult === 'Player 1' && player === 2) {
      grandpaBSadSound.play();
    } else if (matchResult === 'Player 2' && player === 1) {
      grandpaASadSound.play();
    } else if (matchResult === 'Everyone') {
      if (player === 1) {
        grandpaAHappySound.play();
      } else {
        grandpaBHappySound.play();
      }
    }

    return;
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
      if (waitingForMatchStart && ((player === 1 && player2State === 'rod-in-water') || (player === 2 && player1State === 'rod-in-water'))) {
        matchStarted = true;
        waitingForMatchStart = false;
        matchFinished = false;
        //matchTimer = 1200;
        //matchTimer = 6600; //maybe good??
        matchTimer = 3300;
        matchTimerLabel.setText('Match Time: ' + matchTimer); // Update match timer label
        SetLureVisible(player1.lure, matchStarted, scene);
        SetLureVisible(player2.lure, matchStarted, scene);
        startMatchAnimation.call(scene); // Start match animation and effects

      }

      // Show lure
      SetLureVisible(playerLure, matchStarted, scene);

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

      // Show lure
      SetLureVisible(playerLure, true, scene);
    }else if(playerCooldown > 0){
      //Give some sort of tiny animation as a feedback
      scene.tweens.add({
        targets: tweenTarget,
        scaleX: { from: 0.25, to: 0.28, yoyo: true, duration: 50 },
        scaleY: { from: 0.25, to: 0.24, yoyo: true, duration: 50 },
        rotation: { from: 0, to: 0.1, yoyo: true, duration: 50 },
        ease: 'Power2',
        paused: true
      }).play();
    }
    
  } else if (action === 'pointerup' || action === 'keyup') {
    if(!matchStarted){
      playerState = 'idle';
      playerSprite.setTexture(playerIdleTexture, 0);
      playerCooldown = 0;
    }
    else if (playerState === 'rod-in-water') {
      playerState = 'pulling-rod-out';
      playerSprite.setTexture(playerPullingRodOutTexture, 2);
      playerAnticipation = anticipationFrames;
      if (player === 1) {
        grandpaAPullFromWaterSound.play();
      } else {
        grandpaBPullFromWaterSound.play();
      }
      const randomSplashSound = Phaser.Math.Between(0, 2);
      outOfWaterSplashSounds[randomSplashSound].play();

      // Show lure
      SetLureVisible(playerLure, matchStarted, scene);
    }

    scene.tweens.add({
      targets: tweenTarget,
      scaleX: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
      scaleY: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
      rotation: { from: 0, to: 0.1, yoyo: true, duration: 50 },
      ease: 'Power2',
      paused: true
    }).play();

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

function SetLureVisible(theLure, visible, scene){
  //if state didnt change then dont do anything
  if(theLure.visible === visible) return;

  theLure.setVisible(visible);
  //Tween lure
  if(visible){

    scene.tweens.add({
      targets: theLure,
      scaleX: { from: 0.25, to: 0.3, yoyo: true, duration: 50 },
      scaleY: { from: 0.25, to: 0.2, yoyo: true, duration: 50 },
      //y: { from: theLure.y, to: theLure.y - 10, yoyo: true, duration: 50 },
      ease: 'Power2',
      paused: true
    }).play();

  }
  
}


//function animateLure(theLure, hasFish) {
//  if (hasFish) {
//    theLure.play('lure-animate');
//  } else {
//    theLure.stop();
//  }
//}

function updatePlayerState(player, scene) {

  if(matchFinished) return;

  let playerState, playerAnticipation, playerRodTime, playerCooldown, playerShowLootTime, playerSprite, playerIdleTexture, playerPullFinishNoFishTexture, playerPullFinishYayFishTexture, playerFishCount, gotFish, playerLure;
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
    playerPullingRodOutTexture = 'granpaA_fishing';
    playerFishCount = player1FishCount;
    playerLure = player1.lure;
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
    playerPullingRodOutTexture = 'granpaB_fishing';
    playerFishCount = player2FishCount;
    playerLure = player2.lure;
  }

  if (playerState === 'rod-in-water') {
    playerRodTime++;
  }

  if (playerState === 'pulling-rod-out') {
    playerAnticipation--;

    if (playerAnticipation === (anticipationFrames / 2)-5) {
      playerSprite.setTexture(playerPullingRodOutTexture, 3);
    }

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

        // Play particle explosion effect
        //scene.fishEmitter.setPosition(playerSprite.x, playerSprite.y);
        //scene.fishEmitter.explode(30); // Pea0e

        createParticleExplosion(playerSprite.x, playerSprite.y, scene);


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

    if(matchStarted){

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

      //Balance for the benefit of losing player
      if(gotFish){
        playerShowLootTime = showLootFrames;
      }else{
        playerShowLootTime = showLootFrames-10;
      }

    }else{
      playerState = 'idle';
      playerSprite.setTexture(playerIdleTexture, 0);
      playerCooldown = 0;

      if (player === 1 && player1HoldingButton) {
        //default all wait times
        player1State = 'idle';
        player1Anticipation = 0;
        player1RodTime = 0;
        player1Cooldown = 0;
        player1ShowLootTime = 0;
        handlePlayerInput(1, 'keydown', scene);
        return; // P8d32
      } else if (player === 2 && player2HoldingButton) {
        //default all wait times
        player2State = 'idle';
        player2Anticipation = 0;
        player2RodTime = 0;
        player2Cooldown = 0;
        player2ShowLootTime = 0;
        handlePlayerInput(2, 'keydown', scene);
        return; // P8d32
      }
    }

    // Hide lure
    SetLureVisible(playerLure, false, scene);
    
  }

  if (playerState === 'show-loot') {
    playerShowLootTime--;
    if (playerShowLootTime === 0) {
      playerState = 'idle';
      playerSprite.setTexture(playerIdleTexture, 0);
      idleSound.play(); // Play idle sound effect

      if (player === 1 && player1HoldingButton) {
        //default all wait times
        player1State = 'idle';
        player1Anticipation = 0;
        player1RodTime = 0;
        player1Cooldown = 0;
        player1ShowLootTime = 0;
        handlePlayerInput(1, 'keydown', scene);
        return;
      } else if (player === 2 && player2HoldingButton) {
        //default all wait times
        player2State = 'idle';
        player2Anticipation = 0;
        player2RodTime = 0;
        player2Cooldown = 0;
        player2ShowLootTime = 0;
        handlePlayerInput(2, 'keydown', scene);
        return;
      }
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
    player1ScoreText.setText(playerFishCount);
    scene.tweens.add({
      targets: player1ScoreText,
      scaleX: { from: 1, to: 1.2, yoyo: true, duration: 100 },
      scaleY: { from: 1, to: 1.2, yoyo: true, duration: 100 },
      ease: 'Power2',
      paused: true
    }).play();
  } else {
    player2State = playerState;
    player2Anticipation = playerAnticipation;
    player2RodTime = playerRodTime;
    player2Cooldown = playerCooldown;
    player2ShowLootTime = playerShowLootTime;
    player2FishCount = playerFishCount;
    player2ScoreText.setText(playerFishCount);
    scene.tweens.add({
      targets: player2ScoreText,
      scaleX: { from: 1, to: 1.2, yoyo: true, duration: 100 },
      scaleY: { from: 1, to: 1.2, yoyo: true, duration: 100 },
      ease: 'Power2',
      paused: true
    }).play();
  }

  // Animate lure if visible and there is a catch
  if (playerLure.visible) {
    if(checkFishCatch(playerRodTime)){
      //set lure texture to random
      const randomFrame = Phaser.Math.Between(0, 3);
      playerLure.setFrame(randomFrame);
    }else{
      playerLure.setFrame(0);
    }
    //animateLure(playerLure, checkFishCatch(playerRodTime));
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
  setBackgroundTint.call(this, weather); // Update background tint when weather changes
}

function setBackgroundTint(weather) {
  let targetTint;
  switch (weather) {
    case 'sunny':
      targetTint = 0xffffff; // No tint
      break;
    case 'cloudy':
      targetTint = 0x808080; // Gray tint
      break;
    case 'rainbows':
      targetTint = 0xff69b4; // Pink tint
      break;
    case 'winter':
      targetTint = 0xadd8e6; // Light blue tint
      break;
    default:
      targetTint = 0xffffff; // No tint
  }
  background.setTint(targetTint); // No tint

  //this.tweens.add({
  //  targets: background,
  //  tint: targetTint,
  //  duration: 500,
  //  ease: 'Linear'
  //});
}

const endMatch = function () {
  matchStarted = false;
  matchFinished = true;
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
    winner = 'Everyone';
    player1.setTexture('granpaA_results', 3); // Both players with happy sprite
    player2.setTexture('granpaB_results', 3);
  }

  matchResult = winner; // Set the match result flag

  // Add winner text
  const winnerText = this.add.text(
    this.cameras.main.centerX,
    this.cameras.main.centerY - 200,
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
    .setVisible(true)
    .setScale(0.25); // Set the scale of the "Play Again" button to 0.25

  playAgainButton.on('pointerdown', () => {
    matchFinished = false;
    this.matchEndMusic.stop(); // Stop match end music
    ambienceSound.stop(); // Stop ambience sound
    this.scene.restart(); // Restart the scene
    player1FishCount = 0; // Reset player 1 score
    player2FishCount = 0; // Reset player 2 score
  });

  // Add screen flash effect
  this.cameras.main.flash(500, 255, 255, 255);

  // Add zooming camera effect
  this.cameras.main.zoomTo(1.3, 1000, 'Sine.easeInOut');

  // Show credits
  this.creditsText.setVisible(true);

  // Hide lures instead of removing them
  SetLureVisible(player1.lure, false, this);
  SetLureVisible(player2.lure, false, this);

  this.matchStartMusic.stop(); // Stop match start music
  this.matchEndMusic.play({ volume: 0.55 }); // Play match end music

  // Hide large timer text
  largeTimerText.setVisible(false);
}

function startMatchAnimation() {
  // Add screen flash effect
  this.cameras.main.flash(500, 0, 255, 0); // Make flash more green and less bright

  // Add zooming camera effect
  this.cameras.main.zoomTo(1.05, 1000, 'Power2');

  // Play match start sound effect
  matchStartSound.play();

  this.matchStartMusic.play({ volume: 0.55 }); // Play match start music

  // Show score texts when the match starts
  player1ScoreText.setVisible(true);
  player2ScoreText.setVisible(true);

  // Reset player fish counts
  player1FishCount = 0;
  player2FishCount = 0;
}


function createParticleExplosion(x, y, scene) {
  for (let i = 0; i < 5; i++) {
    const fish = scene.add.image(x, y, 'fish');

    // Randomize speed and direction
    const speedX = Phaser.Math.Between(-200, 200);
    const speedY = Phaser.Math.Between(-200, 100);

    //Random rotation
    fish.rotation = Phaser.Math.Between(0, 360);

    //Random size
    fish.setScale(Phaser.Math.Between(0.05, 0.2));

    //Random duration
    const durationNew = Phaser.Math.Between(200, 500);

    // Animate position
    scene.tweens.add({
      targets: fish,
      x: fish.x + speedX,
      y: fish.y + speedY,
      //alpha: 0, // Fade out
      scale: 0, // Shrink to nothing
      duration: durationNew,
      ease: 'Power2',
      onComplete: () => fish.destroy(), // Clean up
    });
  }
}
