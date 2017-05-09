# umvc3.js
Javascript library and tools for modding the Steam release of Ultimate Marvel vs Capcom 3.

## Goal
The goal of this repo is quickly develop tools to help modders quickly develop gameplay mods.
The code in this repository creates the JSON output used by boxdox-marvel, and it can be considered a sister project to
MarvelEditTool. The difference is that these tools are MUCH LESS user friendly, and have hard dependancies on python, nodejs, etc.
that the average user doesn't want or need to install. If you want a GUI or tools that work today and are being used to make mods,
you most likely want MarvelEditTool

## Dependancies
* Recent node.js version
* python (for the scripts in `py/` directory only though)

## Setup
* Checkout repo or download zip archive from Github and extract to a folder
* Open up a command prompt window, navigate to this folder and run `npm install`

## Included Tools
### rte-helper (Real Time Editing)
* Place your modded files in the `mods/` subdirectory. For example, a Ryu moveset would be placed in `mods/chr/Ryu/anmchr.anm`
* Launch the game.
* Run `node src/rte-cli.js`

## What it looks like

![Running and waiting for files to be loaded](http://i.imgur.com/OpUX9vk.png)
![Initializing with modded files](http://i.imgur.com/IDvvOI4.png)

## Credits
* @dantarion

## Special thanks
* UMVC3 Gameplay Modding Discord
* My Patrons (http://patreon.com/dantarion)
