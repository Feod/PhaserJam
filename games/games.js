/*
id: game no.
name: string (folder name (lower case only))
title: string
description: string
phaserVersion: string
isPlayable: boolean
screenshots: array
references: array
tags: array (lowercase except particular name)
inspirations: array
demos: array (game play and video)
*/

var games = [

  {
    id: 26,
    name: 'digger',
    title: 'Digger',
    description: '',
    phaserVersion: '2.0.7',
    isPlayable: false,
    screenshots: [
      'digger.jpg'
    ],
    references: [
      'https://gamedevacademy.org/make-a-quick-phaser-compatible-game-using-mightyeditor/'
    ],
    tags: [
      'MightyEditor'
    ],
    inspirations: [],
    demos: []
  },
  {
    id: 35,
    name: 'dice-simulator',
    title: 'Dice Simulator',
    description: '',
    phaserVersion: '3.87.0',
    isPlayable: true,
    screenshots: [
      'flappy-bird.jpg'
    ],
    references: [
      'https://developer.amazon.com/public/community/post/Tx1NQ9QEA4MWGTY/Intro-To-Phaser-Part-1-Setting-Up-Your-Dev-Environment-and-Phaser'
    ],
    tags: [],
    inspirations: [],
    demos: []
  },
  {
    id: 37,
    name: 'flappy-bird-reborn',
    title: 'Flappy Bird Reborn',
    description: '',
    phaserVersion: '2.4.4',
    isPlayable: true,
    screenshots: [
      'flappy-bird-reborn.jpg'
    ],
    references: [
      'https://github.com/codevinsky/flappy-bird-reborn'
    ],
    tags: [],
    inspirations: [],
    demos: [
      'http://flappy-bird-reborn.herokuapp.com/'
    ]
  },
  {
    id: 122,
    name: 'dice-simulator',
    title: 'Dice Simulator',
    description: 'A simple dice rolling simulator',
    phaserVersion: '3.87.0',
    isPlayable: true,
    screenshots: [
      'dice-simulator.jpg'
    ],
    references: [],
    tags: [],
    inspirations: [],
    demos: []
  },
];

function debugGameObject()
{
  var nGames = games.length;
  var i = 0;

  console.log('nGames', nGames);
  for (i = 0; i < nGames; i++)
  {
    var text = `i: ${i}, id: ${games[i].id}, ${games[i].name}`;
    console.log(text);
  }
}

debugGameObject();
