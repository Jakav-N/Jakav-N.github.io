//Bundle.js is built from this file.

/*
Notes (to go in the main file):

TODO: When unflagging a square that has a zero next to it, make it be whatever it is?
Not sure what to do here, perhaps check what good minesweeper does here or some other
minesweeper implementation

TODO: Use the way to loop through all squares more.

TODO: No too-much-recursion --> error when Bot.run is called and there are too many moves it needs to make

TODO: delete old code which is commented out in various places

The board is internally organized with structure[y][x]

*/

import MinesweeperGame from "./minesweeperGame";
import MyBot from "./minesweeperBot";
import * as React from 'react';
//import * as ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';


let boardWidth = 10;
let boardHeight = 10;
let numMines = 5;

const rootDiv: HTMLDivElement = document.querySelector("div#root");
const game = new MinesweeperGame(boardWidth, boardHeight, numMines, rootDiv);
const bot = new MyBot(game.board, game);

const botRunButton = document.getElementById("runBot");
const botStepButton = document.getElementById("botOneMove");

botStepButton.addEventListener("click", bot.run.bind(bot, false));
botRunButton.addEventListener("click", bot.run.bind(bot, true));

function restartGame () {
    game.reset(boardWidth, boardHeight, numMines, rootDiv);
    bot.reset(game.board, game);
}

document.getElementById("newGameButton").addEventListener("click", restartGame);


//Input stuff
const numMinesInput = document.getElementById("numMines") as HTMLInputElement;

numMinesInput.addEventListener("change", function () {
    if (Number(this.value) > Number(this.max)) {
        this.value = this.max;
    }

    numMines = Number(this.value);
})

const boardSizeInput = document.getElementById("boardSize") as HTMLInputElement;

boardSizeInput.addEventListener("change", function () {
    if (Number(this.value) > Number(this.max)) {
        this.value = this.max;
    }

    boardWidth = Number(this.value);
    boardHeight = Number(this.value);
    numMinesInput.max = String(Number(this.value) ** 2);

    if (Number(numMinesInput.value) > Number(numMinesInput.max)) {
        numMinesInput.value = numMinesInput.max;
        numMines = Number(numMinesInput.value);
    }
});

//Create footer to test React functionality
function Footer () {
    return <>&copy; 2024</>;
}

const footer = document.createElement("footer");
document.body.appendChild(footer);
const root = createRoot(footer);

root.render(<Footer/>);