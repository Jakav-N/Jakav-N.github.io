/*
Notes:

TODO: When unflagging a square that has a zero next to it, make it be whatever it is?
Not sure what to do here, perhaps check what good minesweeper does here or some other
minesweeper implementation

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

const boardWidth = 10;
const boardHeight = 10;
const numMines = 5;
const statusElement = document.getElementById("status");

/**
 * Generates a random number between min and max, min inclusive max exclusive
 * @param min Minimum number (inclusive)
 * @param max Maximum number (exclusive)
 */
function randomInt (min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

function numToEmoji (num: number, gameLost = false): string {
    //Note: the following line may contain not-so-good invisible emoji
    return ["⬜",gameLost ? "💣": "🚩","🟦","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣", "7️⃣", "8️⃣"][num + 2];
}

function updateRemainingMines (numMines: number | string) {
    document.getElementById("remainingMines").textContent = String(numMines);
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

                if (xLocation < 0 || yLocation < 0 || xLocation >= this.width || yLocation >= this.height || (dx == 0 && dy == 0)) {
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
        this.width = width;
        this.height = height;
        this.board = new Board(width, height, numMines);
        updateRemainingMines(this.board.minesLeft);
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

        this.state = "ongoing";
        statusElement.textContent = "Playing";
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
        if (button === 0) {
            this.board.revealSquare(pos);

            if (this.board.get(pos) === SquareInfo.mine) {
                this.handleLosing();
                return;
            }
        } else if (button === 2) {
            if (this.board.getKnown(pos) === SquareInfo.mine) {
                this.board.unFlag(pos);
            } else if (this.board.getKnown(pos) === SquareInfo.unknown) {
                this.board.flag(pos);
            }
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
        statusElement.textContent = "You won!";

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
        statusElement.textContent = "You lost";
    }
}


const rootDiv: HTMLDivElement = document.querySelector("div#root");

//Need to have a framework for starting a new game, so the ignores here. TODO
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let game = new MinesweeperGame(boardWidth, boardHeight, numMines, rootDiv);

document.getElementById("newGameButton").addEventListener("click", function () {
    game = new MinesweeperGame(boardWidth, boardHeight, numMines, rootDiv);
})