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
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

const Page = function () {
    const [boardWidth, setBoardWidth] = useState(10);
    const [boardHeight, setBoardHeight] = useState(10);
    const [numMines, setNumMines] = useState(5);

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


    return <>
        <Rules/>
        <Game/>
        <Settings/>
        <BotStuff/>
        <Footer/>
    </>
}

function Rules () {
    return <div>
        <h2>Game Rules</h2>
        <p>This is a version of Minesweeper. Search it up for more information.</p>
    </div>
}

function Game (): React.JSX.Element {
    return <div id="gameContainer">
        <div className="gameHeader">
            <span>Mines remaining: <span id="remainingMines"></span></span>
            <span id="status"></span>
        </div>
        <div id="root"></div>
    </div>
}

function BotStuff () {
    return <div>
        <h3>Bot Stuff</h3>
        <button id="runBot">Run Bot</button><br/><br/>
        <button id="botOneMove">Run Bot (one square)</button>
    </div>
}

function Settings () {
    
    const [boardSize, setBoardSize] = useState(10);
    const [maxNumMines, setMaxNumMines] = useState(boardSize ** 2);
    const maxBoardSize = 20;

    function numMinesChangeHandler (event: React.ChangeEvent<HTMLInputElement>) {
        setNumMines(Number(event.currentTarget.value));

        if (Number(event.currentTarget.value) > Number(maxNumMines)) {
            //Change the value in the form
            this.value = maxNumMines;

            //Change the value that is used in most of the code
            setNumMines(maxNumMines);
        }
    }
    
    function boardSizeChangeHandler (event: React.ChangeEvent<HTMLInputElement>) {
        const newBoardSize = Number(event.currentTarget.value);
        setBoardSize(newBoardSize);

        //Deal with board sizes greater than maximum allowed
        if (newBoardSize > maxBoardSize) {
            this.value = maxBoardSize;
            setBoardSize(maxBoardSize);
        }
    
        boardWidth = newBoardSize;
        boardHeight = newBoardSize;
        //Square newBoardSize to compute the maximum number of mines the board could fit
        setMaxNumMines(newBoardSize ** 2);
    
        if (numMines > maxNumMines) {
            //This updates the form
            const numMinesInput = document.getElementById("numMines") as HTMLInputElement;
            numMinesInput.value = numMinesInput.max;

            //Update numMines to it's max, since it's above it.
            setNumMines(maxNumMines);
        }
    }


    return <div>
    <h3>Settings</h3>
        <button id="newGameButton">Start a new game</button>
        <label htmlFor="numMines">Number of Mines: </label>
        <input id="numMines" type="number" value="5" min="0" max={maxNumMines} onChange={numMinesChangeHandler} />
        <br/>
        <label htmlFor="boardSize">Size of Board: </label>
        <input id="boardSize" type="number" min="1" max={maxBoardSize} value="10" onChange={boardSizeChangeHandler} />
        <p>Note: settings are only applied to new games.</p>
    </div>
}

function Footer () {
    return <footer>&copy; 2024</footer>;
}

const root = createRoot(document.getElementById("reactRoot"));

root.render(<Page/>);





//Input stuff



/*const numMinesInput = document.getElementById("numMines") as HTMLInputElement;

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
});*/
