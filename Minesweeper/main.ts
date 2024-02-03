/*
Notes:

TODO: When unflagging a square that has a zero next to it, make it be whatever it is?
Not sure what to do here, perhaps check what good minesweeper does here or some other
minesweeper implementation

TODO: Use the way to loop through all squares more.

TODO: No too-much-recurtion --> error when Bot.run is called and there are too many moves it needs to make

The board is internally organized with structure[y][x]

*/


enum SquareInfo {
    mine = -1,
    unknown = -2,
}

type SquareInfoType = 0|1|2|3|4|5|6|7|8|SquareInfo.mine|SquareInfo.unknown;
type BoardStructure = SquareInfoType[][];
type Position = {x: number, y: number};
type BoardLocationList = Position[];
type GameState = "lost" | "ongoing" | "won"



/**
 * Generates a random number between min and max, min inclusive max exclusive
 * @param min Minimum number (inclusive)
 * @param max Maximum number (exclusive)
 */
function randomInt (min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Converts number to emoji (the SquareInfoType form)
 * @param num Number to be converted to an emoji
 * @param gameLost Whether the game is lost, used type of mine
 * @returns The resulting emoji
 */
function numToEmoji (num: number, gameLost = false): string {
    //Note: the following line may contain not-so-good invisible emoji
    return ["⬜",gameLost ? "💣": "🚩","🟦","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣", "7️⃣", "8️⃣"][num + 2];
}

function updateRemainingMines (numMines: number | string) {
    document.getElementById("remainingMines").textContent = String(numMines);
}

function updateGameStatus (state: GameState) {
    const statusElement = document.getElementById("status");

    const stateToStatus = {
        "ongoing": "Playing",
        "won": "You won!",
        "lost": "You lost"
    }

    statusElement.textContent = stateToStatus[state];
}

class Board {
    width: number;
    height: number;
    numMines: number;
    minesLeft: number;
    structure: BoardStructure;
    knownStructure: BoardStructure;


    constructor (width: number, height: number, numMines: number) {
        this.width = width;
        this.height = height;
        this.numMines = numMines;
        this.minesLeft = numMines;
        this.structure = [];
        this.knownStructure = [];
        
        //Initialize knownStructure
        for (let y = 0; y < this.height; y++) {
            this.knownStructure.push([]);
            for (let x = 0; x < this.width; x++) {
                this.knownStructure[y].push(SquareInfo.unknown);
            }
        }

        this.generateBoard();
    }

    
    positions (): Position[] {
        const positions: Position[] = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                positions.push({x: x, y: y});
            }
        }

        return positions;
    }

    generateMines (): BoardLocationList {
        const mineList: BoardLocationList = [];
    
        //Generate random coordinates for mines.
        for (let mine: number = 0; mine < this.numMines; mine++) {
            let mineNotGenerated = true;
            let mineLocation: Position;
    
            while (mineNotGenerated) {
                mineLocation = {x: randomInt(0, this.width), y: randomInt(0, this.height)};
    
                //Assume the mine has been generated
                mineNotGenerated = false;
                
                //Check if the mine is already in the list:
                for (let i = 0; i < mineList.length; i++) {
                    if (mineList[i].x === mineLocation.x && mineList[i].y === mineLocation.y) {
                        //Need to rerun the thing.
                        mineNotGenerated = true;
                    }
                }
            }
    
            mineList.push(mineLocation);
        }
    
        return mineList;
    }

    getAdjacentSquares (location: Position): Position[] {
        const locations = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const xLocation = location.x + dx;
                const yLocation = location.y + dy;

                if (xLocation < 0 || yLocation < 0 || xLocation >= this.width || yLocation >= this.height || (dx === 0 && dy === 0)) {
                    continue;
                } else {
                    locations.push({x: xLocation, y: yLocation});
                }
            }
        }

        return locations;
    }

    generateBoard () {
        const mineLocations = this.generateMines();

        //Initialize board structure
        for (let y = 0; y < this.height; y++) {
            this.structure.push([]);

            for (let x = 0; x < this.width; x++) {
                this.structure[y].push(0);
            }
        }

        //Put the mines into the board
        for (let n = 0; n < this.numMines; n++) {
            const mineLocation = mineLocations[n];
            this.set(mineLocation, SquareInfo.mine);
        }

        //Add the numbers around the mines like minesweeper has
        for (let n = 0; n < this.numMines; n++) {
            const mineLocation = mineLocations[n];

            //Add adjacent mine numbers
            for (const location of this.getAdjacentSquares(mineLocation)) {
                if (this.get(location) >= 0) {
                    //this.structure[location.y][location.x] += 1;
                    this.set(location, this.get(location) + 1)
                }
            }
        }
    }

    /**
     * Reveals a square on the board. Does not handle game win or loss
     * @param pos The position of the square to reveal
     * @returns The value of the square to be revealed
     * 
     */
    revealSquare (pos: Position): SquareInfoType {
        this.knownStructure[pos.y][pos.x] = this.structure[pos.y][pos.x];

        if (this.get(pos) === 0) {
            for (const location of this.getAdjacentSquares(pos)) {
                if (this.getKnown(location) === SquareInfo.unknown) {
                    this.revealSquare(location);
                }
            }
        }

        return this.get(pos);
    }

    get (pos: Position) {
        return this.structure[pos.y][pos.x];
    }

    getKnown (pos: Position) {
        return this.knownStructure[pos.y][pos.x];
    }
    
    set (pos: Position, value: SquareInfoType) {
        this.structure[pos.y][pos.x] = value;
    }

    setKnown (pos: Position, value: SquareInfoType) {
        this.knownStructure[pos.y][pos.x] = value;
    }

    flag (pos: Position) {
        this.setKnown(pos, SquareInfo.mine);
        this.minesLeft = this.minesLeft - 1;
    }

    unFlag (pos: Position) {
        this.setKnown(pos, SquareInfo.unknown);
        this.minesLeft = this.minesLeft + 1;
    }
}

class MinesweeperGame {
    width: number;
    height: number;
    board: Board;
    boardElement: HTMLTableElement;
    state: GameState;

    constructor (width: number, height: number, numMines: number, rootElement: HTMLDivElement) {
        this.reset(width, height, numMines, rootElement, true);
    }

    reset (width: number, height: number, numMines: number, rootElement: HTMLDivElement, initialize: boolean=false) {
        let remakeBoard = true;

        //Board has already been made, and width and height are the same.
        if (!initialize && this.width && this.height && this.width === width && this.height === height) {
            remakeBoard = false;
        }
        
        this.width = width;
        this.height = height;
        this.board = new Board(width, height, numMines);
        updateRemainingMines(this.board.minesLeft);

        this.state = "ongoing";
        updateGameStatus(this.state);
        

        if (remakeBoard) {
            this.boardElement = this.generateBoardHTML();

            if (rootElement.firstElementChild != undefined) {
                rootElement.firstElementChild.remove();
            }

            rootElement.appendChild(this.boardElement);
        

            //Prevent the context menu from being opened when right-clicking on the board
            rootElement.addEventListener("contextmenu", function (e) {
                e.preventDefault();
                return false;
            });
        }
        
        //Make the board go back to unset.
        if (!initialize) {
            this.updateBoardHTML();
        }
    }

    generateBoardHTML (): HTMLTableElement {
        function makeGridSquare (value: string): HTMLSpanElement {
            const newSpan = document.createElement("span");
            newSpan.textContent = value;
            return newSpan;
        }   

        const table = document.createElement("table");
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);

        for (let y = 0; y < this.board.height; y++) {
            const tr = document.createElement("tr");
            for (let x = 0; x < this.board.width; x++) {
                const td = document.createElement("td");

                //Add on-click stuff.s
                td.addEventListener("mouseup", function (e: MouseEvent) {
                    e.preventDefault();
                    this.handleClick(e.button, {x: x, y: y});
                }.bind(this));

                td.appendChild(makeGridSquare(numToEmoji(this.board.getKnown({x: x, y: y}))));
                tr.appendChild(td);
            }
    
            tbody.appendChild(tr);
        }
    
        return table;
    }

    updateBoardHTML (): void {
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                this.boardElement.tBodies[0].children[y].children[x].firstElementChild.textContent = numToEmoji(this.board.getKnown({x: x, y: y}), this.state == "lost");
            }
        }

        updateRemainingMines(this.board.minesLeft);
    }

    doChord (pos: Position) {
        let numMines = 0;
            
        for (const location of this.board.getAdjacentSquares(pos)) {
            if (this.board.getKnown(location) == SquareInfo.mine) {
                numMines++;
            }
        }

        if (numMines === this.board.getKnown(pos)) {
            for (const location of this.board.getAdjacentSquares(pos)) {
                if (this.board.getKnown(location) !== SquareInfo.mine
                    && this.board.get(location) === SquareInfo.mine) {
                    this.handleLosing();
                }

                this.board.revealSquare(location);
            }
        }
    }

    handleClick (button: number, pos: Position, cascading=false) {
        //Don't change anything after the game is over
        if (this.state == "lost" || this.state == "won") {
            return;
        }

        //Chord
        if (this.board.getKnown(pos) > 0) {
            this.doChord(pos);
        }

        //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
        //0 = left click, 2 = right click
        if (this.board.getKnown(pos) === SquareInfo.mine) {
            this.board.unFlag(pos);
        } else if (button === 0) {
            this.board.revealSquare(pos);

            if (this.board.get(pos) === SquareInfo.mine) {
                this.handleLosing();
                return;
            }
        } else if (button === 2 && this.board.getKnown(pos) === SquareInfo.unknown) {
            this.board.flag(pos);
        }
        
        
        //If this function hasn't been called by itself, do this.
        if (!cascading) {
            this.updateBoardHTML();

            //Check Game-win
            if (this.hasWonGame()) {
                this.handleWinning();
            }
        }
    }

    /**
     * Checks if the game is won
     * @returns Whether the game has been won or not
     */
    hasWonGame (): boolean {
        if (this.state === "lost") {
            return false;
        }

        let hasWon: boolean = true;

        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.height; x++) {
                if (this.board.get({x: x, y: y}) !== this.board.getKnown({x: x, y: y}) && 
                this.board.get({x: x, y: y}) !== SquareInfo.mine) {
                    hasWon = false;
                }
            }
        }

        return hasWon;
    }

    handleWinning () {
        this.state = "won";
        updateGameStatus(this.state);
        this.board.minesLeft = 0;

        //Make all the mines shown
        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.height; x++) {
                this.board.setKnown({x: x, y: y}, this.board.get({x: x, y: y}));
            }
        }

        this.updateBoardHTML();
    }

    handleLosing () {
        this.state = "lost";
        //Make all squares clear;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.board.revealSquare({x: x, y: y});
            }
        }

        this.updateBoardHTML();
        updateGameStatus(this.state);
    }
}


//0 corrresponds to left click; 2 corresponds to right click. See MinesweeperGame.handleClick
enum MoveType {
    reveal = 0,
    flag = 2
}

type Move = {pos: Position, type: MoveType};

//Deal with bot stuff
class Bot {
    currentMoves: Move[];
    board: Board;
    game: MinesweeperGame;

    constructor (board: Board, game: MinesweeperGame) {
        this.board = board;
        this.game = game;
        this.currentMoves = [];
    }

    reset (game: MinesweeperGame, board: Board) {
        this.currentMoves = [];
        this.game = game;
        this.board = board;
    }

    generateMoves () {
        const usefulSquares = this.getUsefulSquares();
        const newMoves: Move[] = [];

        usefulSquares.forEach(squarePos => {
            let adjacentMines = 0;
            let adjacentUnknowns = 0;
            const squareNumber: number = this.board.getKnown(squarePos);
            

            //Get number of adjacent mines
            this.board.getAdjacentSquares(squarePos).forEach(adjPos => {
                if (this.board.getKnown(adjPos) === SquareInfo.unknown) {
                    adjacentUnknowns++;
                } else if (this.board.getKnown(adjPos) === SquareInfo.mine) {
                    adjacentMines++;
                }
            });

           
            let moveType: MoveType = undefined;

            //TODO: Make sure this logic works, I hope it does.
            if (squareNumber - adjacentMines === 0) {
                moveType = MoveType.reveal;
            } else if (squareNumber - adjacentMines === adjacentUnknowns) {
                moveType = MoveType.flag;
            }


            
            //Only do it if it came up with a move
            if (moveType !== undefined) {
                this.board.getAdjacentSquares(squarePos).forEach(adjPos => {
                    if (this.board.getKnown(adjPos) === SquareInfo.unknown) {
                        //TODO remove the following line, it's for debugging and it's inefficient
                        this.game.updateBoardHTML()
                        newMoves.push({pos: adjPos, type: moveType});
                    }
                    
                })
            }   
        });

        //New moves without duplicates
        const newerMoves: Move[] = [];

        //Remove duplicates in newMoves: (big O not ideal) TODO
        newMoves.forEach(move => {
            let alreadyInMoves = false;
            newerMoves.forEach(moveInNewerMoves => {
                //Only position is needed to root out duplicate moves
                if (moveInNewerMoves.pos.x === move.pos.x && moveInNewerMoves.pos.y === moveInNewerMoves.pos.y) {
                    alreadyInMoves = true;
                }
            });

            if (!alreadyInMoves) {
                newerMoves.push(move);
            }
        });

        this.currentMoves = this.currentMoves.concat(newerMoves);

    }

    getUsefulSquares (): Position[] {
        const squares: Position[] = [];

        this.board.positions().forEach((position) => {
            let squareIsUseful = false;

            this.board.getAdjacentSquares(position).forEach((adjPosition) => {
                if (this.board.getKnown(adjPosition) === SquareInfo.unknown) {
                    squareIsUseful = true;
                }
            });

            //Only put the square on it's it's "useful" and it's a number square (> 0)
            if (squareIsUseful && this.board.getKnown(position) > 0) {
                squares.push(position);
            }
        });
        
        return squares;
    }

    run (untilDone=true): void {
        if (this.game.state !== "ongoing") {
            alert("Game is over.");
            return;
        }
    
        if (this.currentMoves.length === 0) {
            this.generateMoves();
            if (this.currentMoves.length === 0) {
                alert("Bot failed");
                return;
            }
        }
    
        const nextMove = this.currentMoves.shift();
        
        
        this.game.handleClick(nextMove.type, nextMove.pos); 
        if (this.game.state === "ongoing" && untilDone === true) {
            //Let the HTML update before running again
            window.setTimeout(this.run.bind(this), 0, true);
        }
    }
}

let boardWidth = 10;
let boardHeight = 10;
let numMines = 5;

const rootDiv: HTMLDivElement = document.querySelector("div#root");
const game = new MinesweeperGame(boardWidth, boardHeight, numMines, rootDiv);
const bot = new Bot(game.board, game);

const botRunButton = document.getElementById("runBot");
const botStepButton = document.getElementById("botOneMove");

botStepButton.addEventListener("click", bot.run.bind(bot, false));
botRunButton.addEventListener("click", bot.run.bind(bot, true));

function restartGame () {
    game.reset(boardWidth, boardHeight, numMines, rootDiv);
    bot.reset(game, game.board);
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

