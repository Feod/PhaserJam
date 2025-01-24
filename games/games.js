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
  {
    id: 123,
    name: 'grandpa-fishing-battle',
    title: 'Grandpa Fishing Battle',
    description: '2 player game on a single keyboard',
    phaserVersion: '3.87.0',
    isPlayable: true,
    screenshots: [
      'grandpa-fishing-battle.jpg'
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
