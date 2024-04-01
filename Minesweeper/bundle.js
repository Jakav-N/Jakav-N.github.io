/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/generalTypes.ts":
/*!*****************************!*\
  !*** ./src/generalTypes.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SquareInfo: () => (/* binding */ SquareInfo),
/* harmony export */   makePosition: () => (/* binding */ makePosition)
/* harmony export */ });
//For types that are used in multiple files
function makePosition(x, y) {
    return { x: x, y: y };
}
var SquareInfo;
(function (SquareInfo) {
    SquareInfo[SquareInfo["mine"] = -1] = "mine";
    SquareInfo[SquareInfo["unknown"] = -2] = "unknown";
})(SquareInfo || (SquareInfo = {}));


/***/ }),

/***/ "./src/minesweeperBot.ts":
/*!*******************************!*\
  !*** ./src/minesweeperBot.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _generalTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./generalTypes */ "./src/generalTypes.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

function posToStr(pos) {
    return pos.x + "x" + pos.y;
}
//Some types for bots
//0 corresponds to left click; 2 corresponds to right click. See MinesweeperGame.handleClick
var MoveType;
(function (MoveType) {
    MoveType[MoveType["reveal"] = 0] = "reveal";
    MoveType[MoveType["flag"] = 2] = "flag";
})(MoveType || (MoveType = {}));
/**
 * Class to be extended to make Minesweeper bots
 */
var Bot = /** @class */ (function () {
    function Bot(board, game) {
        this.reset(board, game);
    }
    Bot.prototype.reset = function (board, game) {
        this.currentMoves = [];
        this.game = game;
        this.board = board;
    };
    Bot.prototype.generateMoves = function () {
        alert("Bot.generateMoves not implemented");
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
var MyBot = /** @class */ (function (_super) {
    __extends(MyBot, _super);
    function MyBot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyBot.prototype.generateMoves = function () {
        var _this = this;
        var usefulSquares = this.getUsefulSquares();
        var newMoves = [];
        usefulSquares.forEach(function (squarePos) {
            var adjacentMines = 0;
            var adjacentUnknowns = 0;
            var squareNumber = _this.board.getKnown(squarePos);
            //Get number of adjacent mines
            _this.board.getAdjacentSquares(squarePos).forEach(function (adjPos) {
                if (_this.board.getKnown(adjPos) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.unknown) {
                    adjacentUnknowns++;
                }
                else if (_this.board.getKnown(adjPos) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine) {
                    adjacentMines++;
                }
            });
            var moveType = undefined;
            //TODO: Explanation of logic
            if (squareNumber - adjacentMines === 0) {
                moveType = MoveType.reveal;
            }
            else if (squareNumber - adjacentMines === adjacentUnknowns) {
                moveType = MoveType.flag;
            }
            //Only do it if it came up with a move
            if (moveType !== undefined) {
                _this.board.getAdjacentSquares(squarePos).forEach(function (adjPos) {
                    if (_this.board.getKnown(adjPos) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.unknown) {
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
    MyBot.prototype.getUsefulSquares = function () {
        var _this = this;
        var squares = [];
        this.board.positions().forEach(function (position) {
            var squareIsUseful = false;
            _this.board.getAdjacentSquares(position).forEach(function (adjPosition) {
                if (_this.board.getKnown(adjPosition) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.unknown) {
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
    return MyBot;
}(Bot));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyBot);


/***/ }),

/***/ "./src/minesweeperGame.ts":
/*!********************************!*\
  !*** ./src/minesweeperGame.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Board: () => (/* binding */ Board),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _generalTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./generalTypes */ "./src/generalTypes.ts");

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function posFromStr(str) {
    var items = str.split(",");
    return { x: items[0], y: items[1] };
}
//Exported for minesweeperBot.ts
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
                this.knownStructure[y].push(_generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.unknown);
            }
        }
        //Initialize allSquares
        this.allSquares = [];
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.allSquares.push((0,_generalTypes__WEBPACK_IMPORTED_MODULE_0__.makePosition)(x, y));
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
            this.set(mineLocation, _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine);
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
                if (this.getKnown(location_2) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.unknown) {
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
        this.setKnown(pos, _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine);
        this.minesLeft = this.minesLeft - 1;
    };
    Board.prototype.unFlag = function (pos) {
        this.setKnown(pos, _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.unknown);
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
            if (this.board.getKnown(location_3) == _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine) {
                numMines++;
            }
        }
        if (numMines === this.board.getKnown(pos)) {
            for (var _b = 0, _c = this.board.getAdjacentSquares(pos); _b < _c.length; _b++) {
                var location_4 = _c[_b];
                if (this.board.getKnown(location_4) !== _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine
                    && this.board.get(location_4) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine) {
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
        if (this.board.getKnown(pos) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine) {
            this.board.unFlag(pos);
        }
        else if (button === 0) {
            this.board.revealSquare(pos);
            if (this.board.get(pos) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine) {
                this.handleLosing();
                return;
            }
        }
        else if (button === 2 && this.board.getKnown(pos) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.unknown) {
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
                    this.board.get({ x: x, y: y }) !== _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine) {
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MinesweeperGame);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _minesweeperGame__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./minesweeperGame */ "./src/minesweeperGame.ts");
/* harmony import */ var _minesweeperBot__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./minesweeperBot */ "./src/minesweeperBot.ts");
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


var boardWidth = 10;
var boardHeight = 10;
var numMines = 5;
var rootDiv = document.querySelector("div#root");
var game = new _minesweeperGame__WEBPACK_IMPORTED_MODULE_0__["default"](boardWidth, boardHeight, numMines, rootDiv);
var bot = new _minesweeperBot__WEBPACK_IMPORTED_MODULE_1__["default"](game.board, game);
var botRunButton = document.getElementById("runBot");
var botStepButton = document.getElementById("botOneMove");
botStepButton.addEventListener("click", bot.run.bind(bot, false));
botRunButton.addEventListener("click", bot.run.bind(bot, true));
function restartGame() {
    game.reset(boardWidth, boardHeight, numMines, rootDiv);
    bot.reset(game.board, game);
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

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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dEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGlFQUFlLGVBQWUsRUFBQzs7Ozs7OztVQzVWL0I7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ2dEO0FBQ1g7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLHdEQUFlO0FBQzlCLGNBQWMsdURBQUs7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL21pbmVzd2VlcGVyLy4vc3JjL2dlbmVyYWxUeXBlcy50cyIsIndlYnBhY2s6Ly9taW5lc3dlZXBlci8uL3NyYy9taW5lc3dlZXBlckJvdC50cyIsIndlYnBhY2s6Ly9taW5lc3dlZXBlci8uL3NyYy9taW5lc3dlZXBlckdhbWUudHMiLCJ3ZWJwYWNrOi8vbWluZXN3ZWVwZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbWluZXN3ZWVwZXIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL21pbmVzd2VlcGVyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbWluZXN3ZWVwZXIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9taW5lc3dlZXBlci8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvL0ZvciB0eXBlcyB0aGF0IGFyZSB1c2VkIGluIG11bHRpcGxlIGZpbGVzXG5leHBvcnQgZnVuY3Rpb24gbWFrZVBvc2l0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4geyB4OiB4LCB5OiB5IH07XG59XG5leHBvcnQgdmFyIFNxdWFyZUluZm87XG4oZnVuY3Rpb24gKFNxdWFyZUluZm8pIHtcbiAgICBTcXVhcmVJbmZvW1NxdWFyZUluZm9bXCJtaW5lXCJdID0gLTFdID0gXCJtaW5lXCI7XG4gICAgU3F1YXJlSW5mb1tTcXVhcmVJbmZvW1widW5rbm93blwiXSA9IC0yXSA9IFwidW5rbm93blwiO1xufSkoU3F1YXJlSW5mbyB8fCAoU3F1YXJlSW5mbyA9IHt9KSk7XG4iLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuaW1wb3J0IHsgU3F1YXJlSW5mbyB9IGZyb20gXCIuL2dlbmVyYWxUeXBlc1wiO1xuZnVuY3Rpb24gcG9zVG9TdHIocG9zKSB7XG4gICAgcmV0dXJuIHBvcy54ICsgXCJ4XCIgKyBwb3MueTtcbn1cbi8vU29tZSB0eXBlcyBmb3IgYm90c1xuLy8wIGNvcnJlc3BvbmRzIHRvIGxlZnQgY2xpY2s7IDIgY29ycmVzcG9uZHMgdG8gcmlnaHQgY2xpY2suIFNlZSBNaW5lc3dlZXBlckdhbWUuaGFuZGxlQ2xpY2tcbnZhciBNb3ZlVHlwZTtcbihmdW5jdGlvbiAoTW92ZVR5cGUpIHtcbiAgICBNb3ZlVHlwZVtNb3ZlVHlwZVtcInJldmVhbFwiXSA9IDBdID0gXCJyZXZlYWxcIjtcbiAgICBNb3ZlVHlwZVtNb3ZlVHlwZVtcImZsYWdcIl0gPSAyXSA9IFwiZmxhZ1wiO1xufSkoTW92ZVR5cGUgfHwgKE1vdmVUeXBlID0ge30pKTtcbi8qKlxuICogQ2xhc3MgdG8gYmUgZXh0ZW5kZWQgdG8gbWFrZSBNaW5lc3dlZXBlciBib3RzXG4gKi9cbnZhciBCb3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQm90KGJvYXJkLCBnYW1lKSB7XG4gICAgICAgIHRoaXMucmVzZXQoYm9hcmQsIGdhbWUpO1xuICAgIH1cbiAgICBCb3QucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGJvYXJkLCBnYW1lKSB7XG4gICAgICAgIHRoaXMuY3VycmVudE1vdmVzID0gW107XG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgICAgIHRoaXMuYm9hcmQgPSBib2FyZDtcbiAgICB9O1xuICAgIEJvdC5wcm90b3R5cGUuZ2VuZXJhdGVNb3ZlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWxlcnQoXCJCb3QuZ2VuZXJhdGVNb3ZlcyBub3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfTtcbiAgICBCb3QucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICh1bnRpbERvbmUpIHtcbiAgICAgICAgaWYgKHVudGlsRG9uZSA9PT0gdm9pZCAwKSB7IHVudGlsRG9uZSA9IHRydWU7IH1cbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5zdGF0ZSAhPT0gXCJvbmdvaW5nXCIpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiR2FtZSBpcyBvdmVyLlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jdXJyZW50TW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlTW92ZXMoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRNb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIkJvdCBmYWlsZWRcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBuZXh0TW92ZSA9IHRoaXMuY3VycmVudE1vdmVzLnNoaWZ0KCk7XG4gICAgICAgIHRoaXMuZ2FtZS5oYW5kbGVDbGljayhuZXh0TW92ZS50eXBlLCBuZXh0TW92ZS5wb3MpO1xuICAgICAgICBpZiAodGhpcy5nYW1lLnN0YXRlID09PSBcIm9uZ29pbmdcIiAmJiB1bnRpbERvbmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIC8vTGV0IHRoZSBIVE1MIHVwZGF0ZSBiZWZvcmUgcnVubmluZyBhZ2FpblxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQodGhpcy5ydW4uYmluZCh0aGlzKSwgMCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBCb3Q7XG59KCkpO1xudmFyIE15Qm90ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhNeUJvdCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBNeUJvdCgpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgIH1cbiAgICBNeUJvdC5wcm90b3R5cGUuZ2VuZXJhdGVNb3ZlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHVzZWZ1bFNxdWFyZXMgPSB0aGlzLmdldFVzZWZ1bFNxdWFyZXMoKTtcbiAgICAgICAgdmFyIG5ld01vdmVzID0gW107XG4gICAgICAgIHVzZWZ1bFNxdWFyZXMuZm9yRWFjaChmdW5jdGlvbiAoc3F1YXJlUG9zKSB7XG4gICAgICAgICAgICB2YXIgYWRqYWNlbnRNaW5lcyA9IDA7XG4gICAgICAgICAgICB2YXIgYWRqYWNlbnRVbmtub3ducyA9IDA7XG4gICAgICAgICAgICB2YXIgc3F1YXJlTnVtYmVyID0gX3RoaXMuYm9hcmQuZ2V0S25vd24oc3F1YXJlUG9zKTtcbiAgICAgICAgICAgIC8vR2V0IG51bWJlciBvZiBhZGphY2VudCBtaW5lc1xuICAgICAgICAgICAgX3RoaXMuYm9hcmQuZ2V0QWRqYWNlbnRTcXVhcmVzKHNxdWFyZVBvcykuZm9yRWFjaChmdW5jdGlvbiAoYWRqUG9zKSB7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmJvYXJkLmdldEtub3duKGFkalBvcykgPT09IFNxdWFyZUluZm8udW5rbm93bikge1xuICAgICAgICAgICAgICAgICAgICBhZGphY2VudFVua25vd25zKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKF90aGlzLmJvYXJkLmdldEtub3duKGFkalBvcykgPT09IFNxdWFyZUluZm8ubWluZSkge1xuICAgICAgICAgICAgICAgICAgICBhZGphY2VudE1pbmVzKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgbW92ZVR5cGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAvL1RPRE86IEV4cGxhbmF0aW9uIG9mIGxvZ2ljXG4gICAgICAgICAgICBpZiAoc3F1YXJlTnVtYmVyIC0gYWRqYWNlbnRNaW5lcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIG1vdmVUeXBlID0gTW92ZVR5cGUucmV2ZWFsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3F1YXJlTnVtYmVyIC0gYWRqYWNlbnRNaW5lcyA9PT0gYWRqYWNlbnRVbmtub3ducykge1xuICAgICAgICAgICAgICAgIG1vdmVUeXBlID0gTW92ZVR5cGUuZmxhZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vT25seSBkbyBpdCBpZiBpdCBjYW1lIHVwIHdpdGggYSBtb3ZlXG4gICAgICAgICAgICBpZiAobW92ZVR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmJvYXJkLmdldEFkamFjZW50U3F1YXJlcyhzcXVhcmVQb3MpLmZvckVhY2goZnVuY3Rpb24gKGFkalBvcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMuYm9hcmQuZ2V0S25vd24oYWRqUG9zKSA9PT0gU3F1YXJlSW5mby51bmtub3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1RPRE8gcmVtb3ZlIHRoZSBmb2xsb3dpbmcgbGluZSwgaXQncyBmb3IgZGVidWdnaW5nIGFuZCBpdCdzIGluZWZmaWNpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5nYW1lLnVwZGF0ZUJvYXJkSFRNTCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TW92ZXMucHVzaCh7IHBvczogYWRqUG9zLCB0eXBlOiBtb3ZlVHlwZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9OZXcgbW92ZXMgd2l0aG91dCBkdXBsaWNhdGVzXG4gICAgICAgIHZhciBuZXdlck1vdmVzID0gW107XG4gICAgICAgIC8vUmVtb3ZlIGR1cGxpY2F0ZXMgaW4gbmV3TW92ZXM6IChiaWcgTyBub3QgaWRlYWwpIFRPRE9cbiAgICAgICAgbmV3TW92ZXMuZm9yRWFjaChmdW5jdGlvbiAobW92ZSkge1xuICAgICAgICAgICAgdmFyIGFscmVhZHlJbk1vdmVzID0gZmFsc2U7XG4gICAgICAgICAgICBuZXdlck1vdmVzLmZvckVhY2goZnVuY3Rpb24gKG1vdmVJbk5ld2VyTW92ZXMpIHtcbiAgICAgICAgICAgICAgICAvL09ubHkgcG9zaXRpb24gaXMgbmVlZGVkIHRvIHJvb3Qgb3V0IGR1cGxpY2F0ZSBtb3Zlc1xuICAgICAgICAgICAgICAgIGlmIChtb3ZlSW5OZXdlck1vdmVzLnBvcy54ID09PSBtb3ZlLnBvcy54ICYmIG1vdmVJbk5ld2VyTW92ZXMucG9zLnkgPT09IG1vdmVJbk5ld2VyTW92ZXMucG9zLnkpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxyZWFkeUluTW92ZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFhbHJlYWR5SW5Nb3Zlcykge1xuICAgICAgICAgICAgICAgIG5ld2VyTW92ZXMucHVzaChtb3ZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY3VycmVudE1vdmVzID0gdGhpcy5jdXJyZW50TW92ZXMuY29uY2F0KG5ld2VyTW92ZXMpO1xuICAgIH07XG4gICAgTXlCb3QucHJvdG90eXBlLmdldFVzZWZ1bFNxdWFyZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBzcXVhcmVzID0gW107XG4gICAgICAgIHRoaXMuYm9hcmQucG9zaXRpb25zKCkuZm9yRWFjaChmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBzcXVhcmVJc1VzZWZ1bCA9IGZhbHNlO1xuICAgICAgICAgICAgX3RoaXMuYm9hcmQuZ2V0QWRqYWNlbnRTcXVhcmVzKHBvc2l0aW9uKS5mb3JFYWNoKGZ1bmN0aW9uIChhZGpQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5ib2FyZC5nZXRLbm93bihhZGpQb3NpdGlvbikgPT09IFNxdWFyZUluZm8udW5rbm93bikge1xuICAgICAgICAgICAgICAgICAgICBzcXVhcmVJc1VzZWZ1bCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL09ubHkgcHV0IHRoZSBzcXVhcmUgb24gaXQncyBpdCdzIFwidXNlZnVsXCIgYW5kIGl0J3MgYSBudW1iZXIgc3F1YXJlICg+IDApXG4gICAgICAgICAgICBpZiAoc3F1YXJlSXNVc2VmdWwgJiYgX3RoaXMuYm9hcmQuZ2V0S25vd24ocG9zaXRpb24pID4gMCkge1xuICAgICAgICAgICAgICAgIHNxdWFyZXMucHVzaChwb3NpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3F1YXJlcztcbiAgICB9O1xuICAgIHJldHVybiBNeUJvdDtcbn0oQm90KSk7XG5leHBvcnQgZGVmYXVsdCBNeUJvdDtcbiIsImltcG9ydCB7IFNxdWFyZUluZm8sIG1ha2VQb3NpdGlvbiB9IGZyb20gXCIuL2dlbmVyYWxUeXBlc1wiO1xuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gbWluIGFuZCBtYXgsIG1pbiBpbmNsdXNpdmUgbWF4IGV4Y2x1c2l2ZVxuICogQHBhcmFtIG1pbiBNaW5pbXVtIG51bWJlciAoaW5jbHVzaXZlKVxuICogQHBhcmFtIG1heCBNYXhpbXVtIG51bWJlciAoZXhjbHVzaXZlKVxuICovXG5mdW5jdGlvbiByYW5kb21JbnQobWluLCBtYXgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xufVxuLyoqXG4gKiBDb252ZXJ0cyBudW1iZXIgdG8gZW1vamkgKHRoZSBTcXVhcmVJbmZvVHlwZSBmb3JtKVxuICogQHBhcmFtIG51bSBOdW1iZXIgdG8gYmUgY29udmVydGVkIHRvIGFuIGVtb2ppXG4gKiBAcGFyYW0gZ2FtZUxvc3QgV2hldGhlciB0aGUgZ2FtZSBpcyBsb3N0LCB1c2VkIHR5cGUgb2YgbWluZVxuICogQHJldHVybnMgVGhlIHJlc3VsdGluZyBlbW9qaVxuICovXG5mdW5jdGlvbiBudW1Ub0Vtb2ppKG51bSwgZ2FtZUxvc3QpIHtcbiAgICBpZiAoZ2FtZUxvc3QgPT09IHZvaWQgMCkgeyBnYW1lTG9zdCA9IGZhbHNlOyB9XG4gICAgLy9Ob3RlOiB0aGUgZm9sbG93aW5nIGxpbmUgbWF5IGNvbnRhaW4gbm90LXNvLWdvb2QgaW52aXNpYmxlIGVtb2ppXG4gICAgcmV0dXJuIFtcIuKsnFwiLCBnYW1lTG9zdCA/IFwi8J+So1wiIDogXCLwn5qpXCIsIFwi8J+fplwiLCBcIjHvuI/ig6NcIiwgXCIy77iP4oOjXCIsIFwiM++4j+KDo1wiLCBcIjTvuI/ig6NcIiwgXCI177iP4oOjXCIsIFwiNu+4j+KDo1wiLCBcIjfvuI/ig6NcIiwgXCI477iP4oOjXCJdW251bSArIDJdO1xufVxuZnVuY3Rpb24gdXBkYXRlUmVtYWluaW5nTWluZXMobnVtTWluZXMpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlbWFpbmluZ01pbmVzXCIpLnRleHRDb250ZW50ID0gU3RyaW5nKG51bU1pbmVzKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZUdhbWVTdGF0dXMoc3RhdGUpIHtcbiAgICB2YXIgc3RhdHVzRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhdHVzXCIpO1xuICAgIHZhciBzdGF0ZVRvU3RhdHVzID0ge1xuICAgICAgICBcIm9uZ29pbmdcIjogXCJQbGF5aW5nXCIsXG4gICAgICAgIFwid29uXCI6IFwiWW91IHdvbiFcIixcbiAgICAgICAgXCJsb3N0XCI6IFwiWW91IGxvc3RcIlxuICAgIH07XG4gICAgc3RhdHVzRWxlbWVudC50ZXh0Q29udGVudCA9IHN0YXRlVG9TdGF0dXNbc3RhdGVdO1xufVxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuZnVuY3Rpb24gcG9zRnJvbVN0cihzdHIpIHtcbiAgICB2YXIgaXRlbXMgPSBzdHIuc3BsaXQoXCIsXCIpO1xuICAgIHJldHVybiB7IHg6IGl0ZW1zWzBdLCB5OiBpdGVtc1sxXSB9O1xufVxuLy9FeHBvcnRlZCBmb3IgbWluZXN3ZWVwZXJCb3QudHNcbnZhciBCb2FyZCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCb2FyZCh3aWR0aCwgaGVpZ2h0LCBudW1NaW5lcykge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLm51bU1pbmVzID0gbnVtTWluZXM7XG4gICAgICAgIHRoaXMubWluZXNMZWZ0ID0gbnVtTWluZXM7XG4gICAgICAgIHRoaXMuc3RydWN0dXJlID0gW107XG4gICAgICAgIHRoaXMua25vd25TdHJ1Y3R1cmUgPSBbXTtcbiAgICAgICAgLy9Jbml0aWFsaXplIGtub3duU3RydWN0dXJlXG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgdGhpcy5rbm93blN0cnVjdHVyZS5wdXNoKFtdKTtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rbm93blN0cnVjdHVyZVt5XS5wdXNoKFNxdWFyZUluZm8udW5rbm93bik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9Jbml0aWFsaXplIGFsbFNxdWFyZXNcbiAgICAgICAgdGhpcy5hbGxTcXVhcmVzID0gW107XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFsbFNxdWFyZXMucHVzaChtYWtlUG9zaXRpb24oeCwgeSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVCb2FyZCgpO1xuICAgIH1cbiAgICBCb2FyZC5wcm90b3R5cGUucG9zaXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcG9zaXRpb25zID0gW107XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnMucHVzaCh7IHg6IHgsIHk6IHkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9O1xuICAgIEJvYXJkLnByb3RvdHlwZS5nZW5lcmF0ZU1pbmVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbWluZUxpc3QgPSBbXTtcbiAgICAgICAgLy9HZW5lcmF0ZSByYW5kb20gY29vcmRpbmF0ZXMgZm9yIG1pbmVzLlxuICAgICAgICBmb3IgKHZhciBtaW5lID0gMDsgbWluZSA8IHRoaXMubnVtTWluZXM7IG1pbmUrKykge1xuICAgICAgICAgICAgdmFyIG1pbmVOb3RHZW5lcmF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIG1pbmVMb2NhdGlvbiA9IHZvaWQgMDtcbiAgICAgICAgICAgIHdoaWxlIChtaW5lTm90R2VuZXJhdGVkKSB7XG4gICAgICAgICAgICAgICAgbWluZUxvY2F0aW9uID0geyB4OiByYW5kb21JbnQoMCwgdGhpcy53aWR0aCksIHk6IHJhbmRvbUludCgwLCB0aGlzLmhlaWdodCkgfTtcbiAgICAgICAgICAgICAgICAvL0Fzc3VtZSB0aGUgbWluZSBoYXMgYmVlbiBnZW5lcmF0ZWRcbiAgICAgICAgICAgICAgICBtaW5lTm90R2VuZXJhdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiB0aGUgbWluZSBpcyBhbHJlYWR5IGluIHRoZSBsaXN0OlxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWluZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pbmVMaXN0W2ldLnggPT09IG1pbmVMb2NhdGlvbi54ICYmIG1pbmVMaXN0W2ldLnkgPT09IG1pbmVMb2NhdGlvbi55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL05lZWQgdG8gcmVydW4gdGhlIHRoaW5nLlxuICAgICAgICAgICAgICAgICAgICAgICAgbWluZU5vdEdlbmVyYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtaW5lTGlzdC5wdXNoKG1pbmVMb2NhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbmVMaXN0O1xuICAgIH07XG4gICAgQm9hcmQucHJvdG90eXBlLmdldEFkamFjZW50U3F1YXJlcyA9IGZ1bmN0aW9uIChsb2NhdGlvbikge1xuICAgICAgICB2YXIgbG9jYXRpb25zID0gW107XG4gICAgICAgIGZvciAodmFyIGR4ID0gLTE7IGR4IDw9IDE7IGR4KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGR5ID0gLTE7IGR5IDw9IDE7IGR5KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgeExvY2F0aW9uID0gbG9jYXRpb24ueCArIGR4O1xuICAgICAgICAgICAgICAgIHZhciB5TG9jYXRpb24gPSBsb2NhdGlvbi55ICsgZHk7XG4gICAgICAgICAgICAgICAgaWYgKHhMb2NhdGlvbiA8IDAgfHwgeUxvY2F0aW9uIDwgMCB8fCB4TG9jYXRpb24gPj0gdGhpcy53aWR0aCB8fCB5TG9jYXRpb24gPj0gdGhpcy5oZWlnaHQgfHwgKGR4ID09PSAwICYmIGR5ID09PSAwKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9ucy5wdXNoKHsgeDogeExvY2F0aW9uLCB5OiB5TG9jYXRpb24gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb2NhdGlvbnM7XG4gICAgfTtcbiAgICBCb2FyZC5wcm90b3R5cGUuZ2VuZXJhdGVCb2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG1pbmVMb2NhdGlvbnMgPSB0aGlzLmdlbmVyYXRlTWluZXMoKTtcbiAgICAgICAgLy9Jbml0aWFsaXplIGJvYXJkIHN0cnVjdHVyZVxuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIHRoaXMuc3RydWN0dXJlLnB1c2goW10pO1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0cnVjdHVyZVt5XS5wdXNoKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vUHV0IHRoZSBtaW5lcyBpbnRvIHRoZSBib2FyZFxuICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHRoaXMubnVtTWluZXM7IG4rKykge1xuICAgICAgICAgICAgdmFyIG1pbmVMb2NhdGlvbiA9IG1pbmVMb2NhdGlvbnNbbl07XG4gICAgICAgICAgICB0aGlzLnNldChtaW5lTG9jYXRpb24sIFNxdWFyZUluZm8ubWluZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9BZGQgdGhlIG51bWJlcnMgYXJvdW5kIHRoZSBtaW5lcyBsaWtlIG1pbmVzd2VlcGVyIGhhc1xuICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHRoaXMubnVtTWluZXM7IG4rKykge1xuICAgICAgICAgICAgdmFyIG1pbmVMb2NhdGlvbiA9IG1pbmVMb2NhdGlvbnNbbl07XG4gICAgICAgICAgICAvL0FkZCBhZGphY2VudCBtaW5lIG51bWJlcnNcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmdldEFkamFjZW50U3F1YXJlcyhtaW5lTG9jYXRpb24pOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbl8xID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldChsb2NhdGlvbl8xKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zdHJ1Y3R1cmVbbG9jYXRpb24ueV1bbG9jYXRpb24ueF0gKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQobG9jYXRpb25fMSwgdGhpcy5nZXQobG9jYXRpb25fMSkgKyAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldmVhbHMgYSBzcXVhcmUgb24gdGhlIGJvYXJkLiBEb2VzIG5vdCBoYW5kbGUgZ2FtZSB3aW4gb3IgbG9zc1xuICAgICAqIEBwYXJhbSBwb3MgVGhlIHBvc2l0aW9uIG9mIHRoZSBzcXVhcmUgdG8gcmV2ZWFsXG4gICAgICogQHJldHVybnMgVGhlIHZhbHVlIG9mIHRoZSBzcXVhcmUgdG8gYmUgcmV2ZWFsZWRcbiAgICAgKlxuICAgICAqL1xuICAgIEJvYXJkLnByb3RvdHlwZS5yZXZlYWxTcXVhcmUgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHRoaXMua25vd25TdHJ1Y3R1cmVbcG9zLnldW3Bvcy54XSA9IHRoaXMuc3RydWN0dXJlW3Bvcy55XVtwb3MueF07XG4gICAgICAgIGlmICh0aGlzLmdldChwb3MpID09PSAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5nZXRBZGphY2VudFNxdWFyZXMocG9zKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25fMiA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXRLbm93bihsb2NhdGlvbl8yKSA9PT0gU3F1YXJlSW5mby51bmtub3duKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmV2ZWFsU3F1YXJlKGxvY2F0aW9uXzIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQocG9zKTtcbiAgICB9O1xuICAgIEJvYXJkLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0cnVjdHVyZVtwb3MueV1bcG9zLnhdO1xuICAgIH07XG4gICAgQm9hcmQucHJvdG90eXBlLmdldEtub3duID0gZnVuY3Rpb24gKHBvcykge1xuICAgICAgICByZXR1cm4gdGhpcy5rbm93blN0cnVjdHVyZVtwb3MueV1bcG9zLnhdO1xuICAgIH07XG4gICAgQm9hcmQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChwb3MsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc3RydWN0dXJlW3Bvcy55XVtwb3MueF0gPSB2YWx1ZTtcbiAgICB9O1xuICAgIEJvYXJkLnByb3RvdHlwZS5zZXRLbm93biA9IGZ1bmN0aW9uIChwb3MsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMua25vd25TdHJ1Y3R1cmVbcG9zLnldW3Bvcy54XSA9IHZhbHVlO1xuICAgIH07XG4gICAgQm9hcmQucHJvdG90eXBlLmZsYWcgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHRoaXMuc2V0S25vd24ocG9zLCBTcXVhcmVJbmZvLm1pbmUpO1xuICAgICAgICB0aGlzLm1pbmVzTGVmdCA9IHRoaXMubWluZXNMZWZ0IC0gMTtcbiAgICB9O1xuICAgIEJvYXJkLnByb3RvdHlwZS51bkZsYWcgPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHRoaXMuc2V0S25vd24ocG9zLCBTcXVhcmVJbmZvLnVua25vd24pO1xuICAgICAgICB0aGlzLm1pbmVzTGVmdCA9IHRoaXMubWluZXNMZWZ0ICsgMTtcbiAgICB9O1xuICAgIHJldHVybiBCb2FyZDtcbn0oKSk7XG5leHBvcnQgeyBCb2FyZCB9O1xudmFyIE1pbmVzd2VlcGVyR2FtZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNaW5lc3dlZXBlckdhbWUod2lkdGgsIGhlaWdodCwgbnVtTWluZXMsIHJvb3RFbGVtZW50KSB7XG4gICAgICAgIHRoaXMucmVzZXQod2lkdGgsIGhlaWdodCwgbnVtTWluZXMsIHJvb3RFbGVtZW50LCB0cnVlKTtcbiAgICB9XG4gICAgTWluZXN3ZWVwZXJHYW1lLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0LCBudW1NaW5lcywgcm9vdEVsZW1lbnQsIGluaXRpYWxpemUpIHtcbiAgICAgICAgaWYgKGluaXRpYWxpemUgPT09IHZvaWQgMCkgeyBpbml0aWFsaXplID0gZmFsc2U7IH1cbiAgICAgICAgdmFyIHJlbWFrZUJvYXJkID0gdHJ1ZTtcbiAgICAgICAgLy9Cb2FyZCBoYXMgYWxyZWFkeSBiZWVuIG1hZGUsIGFuZCB3aWR0aCBhbmQgaGVpZ2h0IGFyZSB0aGUgc2FtZS5cbiAgICAgICAgaWYgKCFpbml0aWFsaXplICYmIHRoaXMud2lkdGggJiYgdGhpcy5oZWlnaHQgJiYgdGhpcy53aWR0aCA9PT0gd2lkdGggJiYgdGhpcy5oZWlnaHQgPT09IGhlaWdodCkge1xuICAgICAgICAgICAgcmVtYWtlQm9hcmQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKHdpZHRoLCBoZWlnaHQsIG51bU1pbmVzKTtcbiAgICAgICAgdXBkYXRlUmVtYWluaW5nTWluZXModGhpcy5ib2FyZC5taW5lc0xlZnQpO1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJvbmdvaW5nXCI7XG4gICAgICAgIHVwZGF0ZUdhbWVTdGF0dXModGhpcy5zdGF0ZSk7XG4gICAgICAgIGlmIChyZW1ha2VCb2FyZCkge1xuICAgICAgICAgICAgdGhpcy5ib2FyZEVsZW1lbnQgPSB0aGlzLmdlbmVyYXRlQm9hcmRIVE1MKCk7XG4gICAgICAgICAgICBpZiAocm9vdEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcm9vdEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByb290RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmJvYXJkRWxlbWVudCk7XG4gICAgICAgICAgICAvL1ByZXZlbnQgdGhlIGNvbnRleHQgbWVudSBmcm9tIGJlaW5nIG9wZW5lZCB3aGVuIHJpZ2h0LWNsaWNraW5nIG9uIHRoZSBib2FyZFxuICAgICAgICAgICAgcm9vdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vTWFrZSB0aGUgYm9hcmQgZ28gYmFjayB0byB1bnNldC5cbiAgICAgICAgaWYgKCFpbml0aWFsaXplKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJvYXJkSFRNTCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNaW5lc3dlZXBlckdhbWUucHJvdG90eXBlLmdlbmVyYXRlQm9hcmRIVE1MID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBtYWtlR3JpZFNxdWFyZSh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG5ld1NwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgICAgIG5ld1NwYW4udGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBuZXdTcGFuO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0YWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0YWJsZVwiKTtcbiAgICAgICAgdmFyIHRib2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRib2R5XCIpO1xuICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZCh0Ym9keSk7XG4gICAgICAgIHZhciBfbG9vcF8xID0gZnVuY3Rpb24gKHkpIHtcbiAgICAgICAgICAgIHZhciB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0clwiKTtcbiAgICAgICAgICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGRcIik7XG4gICAgICAgICAgICAgICAgLy9BZGQgb24tY2xpY2sgc3R1ZmYuc1xuICAgICAgICAgICAgICAgIHRkLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGljayhlLmJ1dHRvbiwgeyB4OiB4LCB5OiB5IH0pO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzXzEpKTtcbiAgICAgICAgICAgICAgICB0ZC5hcHBlbmRDaGlsZChtYWtlR3JpZFNxdWFyZShudW1Ub0Vtb2ppKHRoaXNfMS5ib2FyZC5nZXRLbm93bih7IHg6IHgsIHk6IHkgfSkpKSk7XG4gICAgICAgICAgICAgICAgdHIuYXBwZW5kQ2hpbGQodGQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpc18xLmJvYXJkLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICBfbG9vcF8yKHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGJvZHkuYXBwZW5kQ2hpbGQodHIpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdGhpc18xID0gdGhpcztcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmJvYXJkLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBfbG9vcF8xKHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWJsZTtcbiAgICB9O1xuICAgIE1pbmVzd2VlcGVyR2FtZS5wcm90b3R5cGUudXBkYXRlQm9hcmRIVE1MID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuYm9hcmQuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5ib2FyZC53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZEVsZW1lbnQudEJvZGllc1swXS5jaGlsZHJlblt5XS5jaGlsZHJlblt4XS5maXJzdEVsZW1lbnRDaGlsZC50ZXh0Q29udGVudCA9IG51bVRvRW1vamkodGhpcy5ib2FyZC5nZXRLbm93bih7IHg6IHgsIHk6IHkgfSksIHRoaXMuc3RhdGUgPT0gXCJsb3N0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZVJlbWFpbmluZ01pbmVzKHRoaXMuYm9hcmQubWluZXNMZWZ0KTtcbiAgICB9O1xuICAgIE1pbmVzd2VlcGVyR2FtZS5wcm90b3R5cGUuZG9DaG9yZCA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgdmFyIG51bU1pbmVzID0gMDtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuYm9hcmQuZ2V0QWRqYWNlbnRTcXVhcmVzKHBvcyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgbG9jYXRpb25fMyA9IF9hW19pXTtcbiAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLmdldEtub3duKGxvY2F0aW9uXzMpID09IFNxdWFyZUluZm8ubWluZSkge1xuICAgICAgICAgICAgICAgIG51bU1pbmVzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG51bU1pbmVzID09PSB0aGlzLmJvYXJkLmdldEtub3duKHBvcykpIHtcbiAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSB0aGlzLmJvYXJkLmdldEFkamFjZW50U3F1YXJlcyhwb3MpOyBfYiA8IF9jLmxlbmd0aDsgX2IrKykge1xuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbl80ID0gX2NbX2JdO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLmdldEtub3duKGxvY2F0aW9uXzQpICE9PSBTcXVhcmVJbmZvLm1pbmVcbiAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5ib2FyZC5nZXQobG9jYXRpb25fNCkgPT09IFNxdWFyZUluZm8ubWluZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUxvc2luZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnJldmVhbFNxdWFyZShsb2NhdGlvbl80KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgTWluZXN3ZWVwZXJHYW1lLnByb3RvdHlwZS5oYW5kbGVDbGljayA9IGZ1bmN0aW9uIChidXR0b24sIHBvcywgY2FzY2FkaW5nKSB7XG4gICAgICAgIGlmIChjYXNjYWRpbmcgPT09IHZvaWQgMCkgeyBjYXNjYWRpbmcgPSBmYWxzZTsgfVxuICAgICAgICAvL0Rvbid0IGNoYW5nZSBhbnl0aGluZyBhZnRlciB0aGUgZ2FtZSBpcyBvdmVyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09IFwibG9zdFwiIHx8IHRoaXMuc3RhdGUgPT0gXCJ3b25cIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vQ2hvcmRcbiAgICAgICAgaWYgKHRoaXMuYm9hcmQuZ2V0S25vd24ocG9zKSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZG9DaG9yZChwb3MpO1xuICAgICAgICB9XG4gICAgICAgIC8vaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL01vdXNlRXZlbnQvYnV0dG9uXG4gICAgICAgIC8vMCA9IGxlZnQgY2xpY2ssIDIgPSByaWdodCBjbGlja1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5nZXRLbm93bihwb3MpID09PSBTcXVhcmVJbmZvLm1pbmUpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQudW5GbGFnKHBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYnV0dG9uID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLnJldmVhbFNxdWFyZShwb3MpO1xuICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQuZ2V0KHBvcykgPT09IFNxdWFyZUluZm8ubWluZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlTG9zaW5nKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGJ1dHRvbiA9PT0gMiAmJiB0aGlzLmJvYXJkLmdldEtub3duKHBvcykgPT09IFNxdWFyZUluZm8udW5rbm93bikge1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5mbGFnKHBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy9JZiB0aGlzIGZ1bmN0aW9uIGhhc24ndCBiZWVuIGNhbGxlZCBieSBpdHNlbGYsIGRvIHRoaXMuXG4gICAgICAgIGlmICghY2FzY2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJvYXJkSFRNTCgpO1xuICAgICAgICAgICAgLy9DaGVjayBHYW1lLXdpblxuICAgICAgICAgICAgaWYgKHRoaXMuaGFzV29uR2FtZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVXaW5uaW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZ2FtZSBpcyB3b25cbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBnYW1lIGhhcyBiZWVuIHdvbiBvciBub3RcbiAgICAgKi9cbiAgICBNaW5lc3dlZXBlckdhbWUucHJvdG90eXBlLmhhc1dvbkdhbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlID09PSBcImxvc3RcIikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBoYXNXb24gPSB0cnVlO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMud2lkdGg7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmhlaWdodDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQuZ2V0KHsgeDogeCwgeTogeSB9KSAhPT0gdGhpcy5ib2FyZC5nZXRLbm93bih7IHg6IHgsIHk6IHkgfSkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5nZXQoeyB4OiB4LCB5OiB5IH0pICE9PSBTcXVhcmVJbmZvLm1pbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzV29uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNXb247XG4gICAgfTtcbiAgICBNaW5lc3dlZXBlckdhbWUucHJvdG90eXBlLmhhbmRsZVdpbm5pbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIndvblwiO1xuICAgICAgICB1cGRhdGVHYW1lU3RhdHVzKHRoaXMuc3RhdGUpO1xuICAgICAgICB0aGlzLmJvYXJkLm1pbmVzTGVmdCA9IDA7XG4gICAgICAgIC8vTWFrZSBhbGwgdGhlIG1pbmVzIHNob3duXG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy53aWR0aDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuaGVpZ2h0OyB4KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnNldEtub3duKHsgeDogeCwgeTogeSB9LCB0aGlzLmJvYXJkLmdldCh7IHg6IHgsIHk6IHkgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlQm9hcmRIVE1MKCk7XG4gICAgfTtcbiAgICBNaW5lc3dlZXBlckdhbWUucHJvdG90eXBlLmhhbmRsZUxvc2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwibG9zdFwiO1xuICAgICAgICAvL01ha2UgYWxsIHNxdWFyZXMgY2xlYXI7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnJldmVhbFNxdWFyZSh7IHg6IHgsIHk6IHkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVCb2FyZEhUTUwoKTtcbiAgICAgICAgdXBkYXRlR2FtZVN0YXR1cyh0aGlzLnN0YXRlKTtcbiAgICB9O1xuICAgIHJldHVybiBNaW5lc3dlZXBlckdhbWU7XG59KCkpO1xuZXhwb3J0IGRlZmF1bHQgTWluZXN3ZWVwZXJHYW1lO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvL0J1bmRsZS5qcyBpcyBidWlsdCBmcm9tIHRoaXMgZmlsZS5cbi8qXG5Ob3RlcyAodG8gZ28gaW4gdGhlIG1haW4gZmlsZSk6XG5cblRPRE86IFdoZW4gdW5mbGFnZ2luZyBhIHNxdWFyZSB0aGF0IGhhcyBhIHplcm8gbmV4dCB0byBpdCwgbWFrZSBpdCBiZSB3aGF0ZXZlciBpdCBpcz9cbk5vdCBzdXJlIHdoYXQgdG8gZG8gaGVyZSwgcGVyaGFwcyBjaGVjayB3aGF0IGdvb2QgbWluZXN3ZWVwZXIgZG9lcyBoZXJlIG9yIHNvbWUgb3RoZXJcbm1pbmVzd2VlcGVyIGltcGxlbWVudGF0aW9uXG5cblRPRE86IFVzZSB0aGUgd2F5IHRvIGxvb3AgdGhyb3VnaCBhbGwgc3F1YXJlcyBtb3JlLlxuXG5UT0RPOiBObyB0b28tbXVjaC1yZWN1cnNpb24gLS0+IGVycm9yIHdoZW4gQm90LnJ1biBpcyBjYWxsZWQgYW5kIHRoZXJlIGFyZSB0b28gbWFueSBtb3ZlcyBpdCBuZWVkcyB0byBtYWtlXG5cblRPRE86IGRlbGV0ZSBvbGQgY29kZSB3aGljaCBpcyBjb21tZW50ZWQgb3V0IGluIHZhcmlvdXMgcGxhY2VzXG5cblRoZSBib2FyZCBpcyBpbnRlcm5hbGx5IG9yZ2FuaXplZCB3aXRoIHN0cnVjdHVyZVt5XVt4XVxuXG4qL1xuaW1wb3J0IE1pbmVzd2VlcGVyR2FtZSBmcm9tIFwiLi9taW5lc3dlZXBlckdhbWVcIjtcbmltcG9ydCBNeUJvdCBmcm9tIFwiLi9taW5lc3dlZXBlckJvdFwiO1xudmFyIGJvYXJkV2lkdGggPSAxMDtcbnZhciBib2FyZEhlaWdodCA9IDEwO1xudmFyIG51bU1pbmVzID0gNTtcbnZhciByb290RGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiNyb290XCIpO1xudmFyIGdhbWUgPSBuZXcgTWluZXN3ZWVwZXJHYW1lKGJvYXJkV2lkdGgsIGJvYXJkSGVpZ2h0LCBudW1NaW5lcywgcm9vdERpdik7XG52YXIgYm90ID0gbmV3IE15Qm90KGdhbWUuYm9hcmQsIGdhbWUpO1xudmFyIGJvdFJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicnVuQm90XCIpO1xudmFyIGJvdFN0ZXBCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvdE9uZU1vdmVcIik7XG5ib3RTdGVwQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBib3QucnVuLmJpbmQoYm90LCBmYWxzZSkpO1xuYm90UnVuQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBib3QucnVuLmJpbmQoYm90LCB0cnVlKSk7XG5mdW5jdGlvbiByZXN0YXJ0R2FtZSgpIHtcbiAgICBnYW1lLnJlc2V0KGJvYXJkV2lkdGgsIGJvYXJkSGVpZ2h0LCBudW1NaW5lcywgcm9vdERpdik7XG4gICAgYm90LnJlc2V0KGdhbWUuYm9hcmQsIGdhbWUpO1xufVxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXdHYW1lQnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByZXN0YXJ0R2FtZSk7XG4vL0lucHV0IHN0dWZmXG52YXIgbnVtTWluZXNJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibnVtTWluZXNcIik7XG5udW1NaW5lc0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgIGlmIChOdW1iZXIodGhpcy52YWx1ZSkgPiBOdW1iZXIodGhpcy5tYXgpKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm1heDtcbiAgICB9XG4gICAgbnVtTWluZXMgPSBOdW1iZXIodGhpcy52YWx1ZSk7XG59KTtcbnZhciBib2FyZFNpemVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmRTaXplXCIpO1xuYm9hcmRTaXplSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKE51bWJlcih0aGlzLnZhbHVlKSA+IE51bWJlcih0aGlzLm1heCkpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubWF4O1xuICAgIH1cbiAgICBib2FyZFdpZHRoID0gTnVtYmVyKHRoaXMudmFsdWUpO1xuICAgIGJvYXJkSGVpZ2h0ID0gTnVtYmVyKHRoaXMudmFsdWUpO1xuICAgIG51bU1pbmVzSW5wdXQubWF4ID0gU3RyaW5nKE1hdGgucG93KE51bWJlcih0aGlzLnZhbHVlKSwgMikpO1xuICAgIGlmIChOdW1iZXIobnVtTWluZXNJbnB1dC52YWx1ZSkgPiBOdW1iZXIobnVtTWluZXNJbnB1dC5tYXgpKSB7XG4gICAgICAgIG51bU1pbmVzSW5wdXQudmFsdWUgPSBudW1NaW5lc0lucHV0Lm1heDtcbiAgICAgICAgbnVtTWluZXMgPSBOdW1iZXIobnVtTWluZXNJbnB1dC52YWx1ZSk7XG4gICAgfVxufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=