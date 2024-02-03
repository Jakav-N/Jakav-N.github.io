/*
Notes:

TODO: When unflagging a square that has a zero next to it, make it be whatever it is?
Not sure what to do here, perhaps check what good minesweeper does here or some other
minesweeper implementation

TODO: Use the way to loop through all squares more.

TODO: No too-much-recurtion --> error when Bot.run is called and there are too many moves it needs to make

The board is internally organized with structure[y][x]

*/
var SquareInfo;
(function (SquareInfo) {
    SquareInfo[SquareInfo["mine"] = -1] = "mine";
    SquareInfo[SquareInfo["unknown"] = -2] = "unknown";
})(SquareInfo || (SquareInfo = {}));
/**
 * Generates a random number between min and max, min inclusive max exclusive
 * @param min Minimum number (inclusive)
 * @param max Maximum number (exclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
/**
 * Converts number to emoji (the SquareInfoType form)
 * @param num Number to be converted to an emoji
 * @param gameLost Whether the game is lost, used type of mine
 * @returns The resulting emoji
 */
function numToEmoji(num, gameLost) {
    if (gameLost === void 0) { gameLost = false; }
    //Note: the following line may contain not-so-good invisible emoji
    return ["⬜", gameLost ? "💣" : "🚩", "🟦", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"][num + 2];
}
function updateRemainingMines(numMines) {
    document.getElementById("remainingMines").textContent = String(numMines);
}
function updateGameStatus(state) {
    var statusElement = document.getElementById("status");
    var stateToStatus = {
        "ongoing": "Playing",
        "won": "You won!",
        "lost": "You lost"
    };
    statusElement.textContent = stateToStatus[state];
}
var Board = /** @class */ (function () {
    function Board(width, height, numMines) {
        this.width = width;
        this.height = height;
        this.numMines = numMines;
        this.minesLeft = numMines;
        this.structure = [];
        this.knownStructure = [];
        //Initialize knownStructure
        for (var y = 0; y < this.height; y++) {
            this.knownStructure.push([]);
            for (var x = 0; x < this.width; x++) {
                this.knownStructure[y].push(SquareInfo.unknown);
            }
        }
        this.generateBoard();
    }
    Board.prototype.positions = function () {
        var positions = [];
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                positions.push({ x: x, y: y });
            }
        }
        return positions;
    };
    Board.prototype.generateMines = function () {
        var mineList = [];
        //Generate random coordinates for mines.
        for (var mine = 0; mine < this.numMines; mine++) {
            var mineNotGenerated = true;
            var mineLocation = void 0;
            while (mineNotGenerated) {
                mineLocation = { x: randomInt(0, this.width), y: randomInt(0, this.height) };
                //Assume the mine has been generated
                mineNotGenerated = false;
                //Check if the mine is already in the list:
                for (var i = 0; i < mineList.length; i++) {
                    if (mineList[i].x === mineLocation.x && mineList[i].y === mineLocation.y) {
                        //Need to rerun the thing.
                        mineNotGenerated = true;
                    }
                }
            }
            mineList.push(mineLocation);
        }
        return mineList;
    };
    Board.prototype.getAdjacentSquares = function (location) {
        var locations = [];
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                var xLocation = location.x + dx;
                var yLocation = location.y + dy;
                if (xLocation < 0 || yLocation < 0 || xLocation >= this.width || yLocation >= this.height || (dx === 0 && dy === 0)) {
                    continue;
                }
                else {
                    locations.push({ x: xLocation, y: yLocation });
                }
            }
        }
        return locations;
    };
    Board.prototype.generateBoard = function () {
        var mineLocations = this.generateMines();
        //Initialize board structure
        for (var y = 0; y < this.height; y++) {
            this.structure.push([]);
            for (var x = 0; x < this.width; x++) {
                this.structure[y].push(0);
            }
        }
        //Put the mines into the board
        for (var n = 0; n < this.numMines; n++) {
            var mineLocation = mineLocations[n];
            this.set(mineLocation, SquareInfo.mine);
        }
        //Add the numbers around the mines like minesweeper has
        for (var n = 0; n < this.numMines; n++) {
            var mineLocation = mineLocations[n];
            //Add adjacent mine numbers
            for (var _i = 0, _a = this.getAdjacentSquares(mineLocation); _i < _a.length; _i++) {
                var location_1 = _a[_i];
                if (this.get(location_1) >= 0) {
                    //this.structure[location.y][location.x] += 1;
                    this.set(location_1, this.get(location_1) + 1);
                }
            }
        }
    };
    /**
     * Reveals a square on the board. Does not handle game win or loss
     * @param pos The position of the square to reveal
     * @returns The value of the square to be revealed
     *
     */
    Board.prototype.revealSquare = function (pos) {
        this.knownStructure[pos.y][pos.x] = this.structure[pos.y][pos.x];
        if (this.get(pos) === 0) {
            for (var _i = 0, _a = this.getAdjacentSquares(pos); _i < _a.length; _i++) {
                var location_2 = _a[_i];
                if (this.getKnown(location_2) === SquareInfo.unknown) {
                    this.revealSquare(location_2);
                }
            }
        }
        return this.get(pos);
    };
    Board.prototype.get = function (pos) {
        return this.structure[pos.y][pos.x];
    };
    Board.prototype.getKnown = function (pos) {
        return this.knownStructure[pos.y][pos.x];
    };
    Board.prototype.set = function (pos, value) {
        this.structure[pos.y][pos.x] = value;
    };
    Board.prototype.setKnown = function (pos, value) {
        this.knownStructure[pos.y][pos.x] = value;
    };
    Board.prototype.flag = function (pos) {
        this.setKnown(pos, SquareInfo.mine);
        this.minesLeft = this.minesLeft - 1;
    };
    Board.prototype.unFlag = function (pos) {
        this.setKnown(pos, SquareInfo.unknown);
        this.minesLeft = this.minesLeft + 1;
    };
    return Board;
}());
var MinesweeperGame = /** @class */ (function () {
    function MinesweeperGame(width, height, numMines, rootElement) {
        this.reset(width, height, numMines, rootElement, true);
    }
    MinesweeperGame.prototype.reset = function (width, height, numMines, rootElement, initialize) {
        if (initialize === void 0) { initialize = false; }
        var remakeBoard = true;
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
    };
    MinesweeperGame.prototype.generateBoardHTML = function () {
        function makeGridSquare(value) {
            var newSpan = document.createElement("span");
            newSpan.textContent = value;
            return newSpan;
        }
        var table = document.createElement("table");
        var tbody = document.createElement("tbody");
        table.appendChild(tbody);
        var _loop_1 = function (y) {
            var tr = document.createElement("tr");
            var _loop_2 = function (x) {
                var td = document.createElement("td");
                //Add on-click stuff.s
                td.addEventListener("mouseup", function (e) {
                    e.preventDefault();
                    this.handleClick(e.button, { x: x, y: y });
                }.bind(this_1));
                td.appendChild(makeGridSquare(numToEmoji(this_1.board.getKnown({ x: x, y: y }))));
                tr.appendChild(td);
            };
            for (var x = 0; x < this_1.board.width; x++) {
                _loop_2(x);
            }
            tbody.appendChild(tr);
        };
        var this_1 = this;
        for (var y = 0; y < this.board.height; y++) {
            _loop_1(y);
        }
        return table;
    };
    MinesweeperGame.prototype.updateBoardHTML = function () {
        for (var y = 0; y < this.board.height; y++) {
            for (var x = 0; x < this.board.width; x++) {
                this.boardElement.tBodies[0].children[y].children[x].firstElementChild.textContent = numToEmoji(this.board.getKnown({ x: x, y: y }), this.state == "lost");
            }
        }
        updateRemainingMines(this.board.minesLeft);
    };
    MinesweeperGame.prototype.doChord = function (pos) {
        var numMines = 0;
        for (var _i = 0, _a = this.board.getAdjacentSquares(pos); _i < _a.length; _i++) {
            var location_3 = _a[_i];
            if (this.board.getKnown(location_3) == SquareInfo.mine) {
                numMines++;
            }
        }
        if (numMines === this.board.getKnown(pos)) {
            for (var _b = 0, _c = this.board.getAdjacentSquares(pos); _b < _c.length; _b++) {
                var location_4 = _c[_b];
                if (this.board.getKnown(location_4) !== SquareInfo.mine
                    && this.board.get(location_4) === SquareInfo.mine) {
                    this.handleLosing();
                }
                this.board.revealSquare(location_4);
            }
        }
    };
    MinesweeperGame.prototype.handleClick = function (button, pos, cascading) {
        if (cascading === void 0) { cascading = false; }
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
        }
        else if (button === 0) {
            this.board.revealSquare(pos);
            if (this.board.get(pos) === SquareInfo.mine) {
                this.handleLosing();
                return;
            }
        }
        else if (button === 2 && this.board.getKnown(pos) === SquareInfo.unknown) {
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
    };
    /**
     * Checks if the game is won
     * @returns Whether the game has been won or not
     */
    MinesweeperGame.prototype.hasWonGame = function () {
        if (this.state === "lost") {
            return false;
        }
        var hasWon = true;
        for (var y = 0; y < this.width; y++) {
            for (var x = 0; x < this.height; x++) {
                if (this.board.get({ x: x, y: y }) !== this.board.getKnown({ x: x, y: y }) &&
                    this.board.get({ x: x, y: y }) !== SquareInfo.mine) {
                    hasWon = false;
                }
            }
        }
        return hasWon;
    };
    MinesweeperGame.prototype.handleWinning = function () {
        this.state = "won";
        updateGameStatus(this.state);
        this.board.minesLeft = 0;
        //Make all the mines shown
        for (var y = 0; y < this.width; y++) {
            for (var x = 0; x < this.height; x++) {
                this.board.setKnown({ x: x, y: y }, this.board.get({ x: x, y: y }));
            }
        }
        this.updateBoardHTML();
    };
    MinesweeperGame.prototype.handleLosing = function () {
        this.state = "lost";
        //Make all squares clear;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.board.revealSquare({ x: x, y: y });
            }
        }
        this.updateBoardHTML();
        updateGameStatus(this.state);
    };
    return MinesweeperGame;
}());
//0 corrresponds to left click; 2 corresponds to right click. See MinesweeperGame.handleClick
var MoveType;
(function (MoveType) {
    MoveType[MoveType["reveal"] = 0] = "reveal";
    MoveType[MoveType["flag"] = 2] = "flag";
})(MoveType || (MoveType = {}));
//Deal with bot stuff
var Bot = /** @class */ (function () {
    function Bot(board, game) {
        this.board = board;
        this.game = game;
        this.currentMoves = [];
    }
    Bot.prototype.reset = function (game, board) {
        this.currentMoves = [];
        this.game = game;
        this.board = board;
    };
    Bot.prototype.generateMoves = function () {
        var _this = this;
        var usefulSquares = this.getUsefulSquares();
        var newMoves = [];
        usefulSquares.forEach(function (squarePos) {
            var adjacentMines = 0;
            var adjacentUnknowns = 0;
            var squareNumber = _this.board.getKnown(squarePos);
            //Get number of adjacent mines
            _this.board.getAdjacentSquares(squarePos).forEach(function (adjPos) {
                if (_this.board.getKnown(adjPos) === SquareInfo.unknown) {
                    adjacentUnknowns++;
                }
                else if (_this.board.getKnown(adjPos) === SquareInfo.mine) {
                    adjacentMines++;
                }
            });
            var moveType = undefined;
            //TODO: Make sure this logic works, I hope it does.
            if (squareNumber - adjacentMines === 0) {
                moveType = MoveType.reveal;
            }
            else if (squareNumber - adjacentMines === adjacentUnknowns) {
                moveType = MoveType.flag;
            }
            //Only do it if it came up with a move
            if (moveType !== undefined) {
                _this.board.getAdjacentSquares(squarePos).forEach(function (adjPos) {
                    if (_this.board.getKnown(adjPos) === SquareInfo.unknown) {
                        //TODO remove the following line, it's for debugging and it's inefficient
                        _this.game.updateBoardHTML();
                        newMoves.push({ pos: adjPos, type: moveType });
                    }
                });
            }
        });
        //New moves without duplicates
        var newerMoves = [];
        //Remove duplicates in newMoves: (big O not ideal) TODO
        newMoves.forEach(function (move) {
            var alreadyInMoves = false;
            newerMoves.forEach(function (moveInNewerMoves) {
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
    };
    Bot.prototype.getUsefulSquares = function () {
        var _this = this;
        var squares = [];
        this.board.positions().forEach(function (position) {
            var squareIsUseful = false;
            _this.board.getAdjacentSquares(position).forEach(function (adjPosition) {
                if (_this.board.getKnown(adjPosition) === SquareInfo.unknown) {
                    squareIsUseful = true;
                }
            });
            //Only put the square on it's it's "useful" and it's a number square (> 0)
            if (squareIsUseful && _this.board.getKnown(position) > 0) {
                squares.push(position);
            }
        });
        return squares;
    };
    Bot.prototype.run = function (untilDone) {
        if (untilDone === void 0) { untilDone = true; }
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
        var nextMove = this.currentMoves.shift();
        this.game.handleClick(nextMove.type, nextMove.pos);
        if (this.game.state === "ongoing" && untilDone === true) {
            //Let the HTML update before running again
            window.setTimeout(this.run.bind(this), 0, true);
        }
    };
    return Bot;
}());
var boardWidth = 10;
var boardHeight = 10;
var numMines = 5;
var rootDiv = document.querySelector("div#root");
var game = new MinesweeperGame(boardWidth, boardHeight, numMines, rootDiv);
var bot = new Bot(game.board, game);
var botRunButton = document.getElementById("runBot");
var botStepButton = document.getElementById("botOneMove");
botStepButton.addEventListener("click", bot.run.bind(bot, false));
botRunButton.addEventListener("click", bot.run.bind(bot, true));
function restartGame() {
    game.reset(boardWidth, boardHeight, numMines, rootDiv);
    bot.reset(game, game.board);
}
document.getElementById("newGameButton").addEventListener("click", restartGame);
//Input stuff
var numMinesInput = document.getElementById("numMines");
numMinesInput.addEventListener("change", function () {
    if (Number(this.value) > Number(this.max)) {
        this.value = this.max;
    }
    numMines = Number(this.value);
});
var boardSizeInput = document.getElementById("boardSize");
boardSizeInput.addEventListener("change", function () {
    if (Number(this.value) > Number(this.max)) {
        this.value = this.max;
    }
    boardWidth = Number(this.value);
    boardHeight = Number(this.value);
    numMinesInput.max = String(Math.pow(Number(this.value), 2));
    if (Number(numMinesInput.value) > Number(numMinesInput.max)) {
        numMinesInput.value = numMinesInput.max;
        numMines = Number(numMinesInput.value);
    }
});
//# sourceMappingURL=main.js.map