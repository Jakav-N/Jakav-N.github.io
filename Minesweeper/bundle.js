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
    MyBot.prototype.getDataForGroupGeneration = function (group1, group2) {
        var intersectingPos = [];
        for (var _i = 0, _a = group1.positions; _i < _a.length; _i++) {
            var position1 = _a[_i];
            for (var _b = 0, _c = group2.positions; _b < _c.length; _b++) {
                var position2 = _c[_b];
                if (position1.x === position2.x && position1.y === position2.y) {
                    intersectingPos.push(position1);
                }
            }
        }
        function getDataForGroup(group) {
            var numSquaresUniqueToGroup = group.positions.length - intersectingPos.length;
            //Maximum / minimum amount of mines that can be unique to the group, but not in both
            var minesUniqueToGroup = { min: Math.min(group.numMines.min, numSquaresUniqueToGroup),
                max: Math.max(0, group.numMines.max - intersectingPos.length) };
            return { minesUnique: minesUniqueToGroup, positions: group.positions, numMines: group.numMines };
        }
        //Group 1 data
        var g1 = getDataForGroup(group1);
        var g2 = getDataForGroup(group2);
        var intersectingMinesRange = {
            min: Math.max(g1.positions.length - g1.minesUnique.max, g2.positions.length - g2.minesUnique.max),
            max: Math.min(intersectingPos.length, group1.numMines.max, group2.numMines.max)
        };
        //For this variable, the minimum generated isn't actually the minimum. It needs to be limited by the maximum too.
        if (intersectingMinesRange.min > intersectingMinesRange.max) {
            intersectingMinesRange.min = intersectingMinesRange.max;
        }
        return {
            group1: g1,
            group2: g2,
            intersectingGroup: {
                numMines: intersectingMinesRange,
                positions: intersectingPos
            }
        };
    };
    MyBot.prototype.generateMoves = function () {
        var _this = this;
        //Group type, used only here.
        //mainPos is the position that all the positions are adjacent to.
        //TODO: figure out how to make a successful groupList type.
        //type groupList = {: [{numMines: number, positions: Position[]}]};
        var usefulSquares = this.getUsefulSquares();
        var newMoves = [];
        var groups = {};
        //Generate groups initially
        usefulSquares.forEach(function (squarePos) {
            var adjacentMines = 0;
            //let adjacentUnknowns = 0;
            var squareNumber = _this.board.getKnown(squarePos);
            var positions = [];
            var squarePosStr = posToStr(squarePos);
            //Get number of adjacent mines
            _this.board.getAdjacentSquares(squarePos).forEach(function (adjPos) {
                if (_this.board.getKnown(adjPos) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.unknown) {
                    //adjacentUnknowns++;
                    positions.push(adjPos);
                }
                else if (_this.board.getKnown(adjPos) === _generalTypes__WEBPACK_IMPORTED_MODULE_0__.SquareInfo.mine) {
                    adjacentMines++;
                }
            });
            //Create group
            var remainingMines = squareNumber - adjacentMines;
            var groupData = { numMines: { min: remainingMines, max: remainingMines }, positions: positions };
            if (!groups[squarePosStr]) {
                groups[squarePosStr] = [];
            }
            groups[squarePosStr].push(groupData);
        });
        //Generate groups based on existing groups
        var newGroupsGenerated = true;
        //TODO: get rid of timesRun or something else
        var timesRun = 0;
        var _loop_1 = function () {
            timesRun++;
            if (timesRun === 50) {
                console.log(groups);
                return "break";
            }
            newGroupsGenerated = false;
            console.log("Generating extra groups");
            var groupsToAdd = {};
            if (timesRun === 2) {
                console.log(groups);
                return { value: void 0 };
            }
            usefulSquares.forEach(function (squarePos) {
                _this.board.getAdjacentSquares(squarePos).forEach(function (adjPos) {
                    var currentGroups1 = groups[posToStr(squarePos)];
                    var currentGroups2 = groups[posToStr(adjPos)];
                    if (currentGroups1 == undefined || currentGroups2 == undefined) {
                        //If there are no groups to do, end it now.
                        return;
                    }
                    //Is there code here??
                    console.log(currentGroups1.length);
                    for (var _i = 0, currentGroups1_1 = currentGroups1; _i < currentGroups1_1.length; _i++) {
                        var group1 = currentGroups1_1[_i];
                        for (var _a = 0, currentGroups2_1 = currentGroups2; _a < currentGroups2_1.length; _a++) {
                            var group2 = currentGroups2_1[_a];
                            //console.log("Going in groups");
                            var currentData = _this.getDataForGroupGeneration(group1, group2);
                            //Now, to generate new groups based on data generated in getDataForGroupGeneration.
                            var intersectingGroup = currentData.intersectingGroup;
                            var newGroups = [intersectingGroup];
                            //Check for duplicate new groups
                            //TODO
                            //This code is broken because it doesn't check for duplicates
                            //in the newGroups, but that doesn't matter right now because
                            //there is only one of them.
                            //This code is also quite inefficient
                            //It's also entirely broken.
                            newGroups.forEach(function (newGroup) {
                                var isDuplicateGroup = false;
                                //[squarePos, adjPos].forEach(position => {
                                _this.board.getAdjacentSquares(squarePos).forEach(function (position) {
                                    //If the groups for this square are empty, stop now.
                                    if (groups[posToStr(position)] == undefined) {
                                        return;
                                    }
                                    groups[posToStr(position)].forEach(function (group) {
                                        //TODO working here.
                                        var couldBeDuplicate = true;
                                        for (var i = 0; i < group.positions.length; i++) {
                                            var positionInOtherGroup = true;
                                            for (var j = 0; j < newGroup.positions.length; j++) {
                                                if (newGroup.positions[j].x !== group.positions[i].x &&
                                                    newGroup.positions[j].y !== group.positions[i].y) {
                                                    positionInOtherGroup = false;
                                                }
                                            }
                                            if (!positionInOtherGroup) {
                                                couldBeDuplicate = false;
                                            }
                                        }
                                        //Again, inefficient, bad code TODO
                                        if (newGroup.numMines.max === group.numMines.max &&
                                            newGroup.numMines.min === group.numMines.min && couldBeDuplicate) {
                                            isDuplicateGroup = true;
                                            console.log("We caught a duplicate");
                                            return;
                                        }
                                    });
                                    if (isDuplicateGroup) {
                                        return;
                                    }
                                });
                                if (!isDuplicateGroup) {
                                    if (groupsToAdd[posToStr(squarePos)] == undefined) {
                                        groupsToAdd[posToStr(squarePos)] = [];
                                    }
                                    groupsToAdd[posToStr(squarePos)].push(newGroup);
                                    newGroupsGenerated = true;
                                }
                            });
                        }
                    }
                });
            });
            //Add the groupsToAdd to the groups
            this_1.getUsefulSquares().forEach(function (groupSquarePosition) {
                var pos = posToStr(groupSquarePosition);
                //Make sure that there exist groupsToAdd at this position
                if (groupsToAdd[pos] != undefined) {
                    if (groups[pos] == undefined) {
                        groups[pos] = [];
                    }
                    groups[pos] = groups[pos].concat(groupsToAdd[pos]);
                }
            });
        };
        var this_1 = this;
        while (newGroupsGenerated && timesRun < 50) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
            if (state_1 === "break")
                break;
        }
        //Get groups from moves
        this.board.allSquares.forEach(function (square) {
            groups[posToStr(square)].forEach(function (group) {
                var numMines = group.numMines;
                var moveType;
                if (numMines.min === numMines.max && numMines.max === 0) {
                    moveType = MoveType.reveal;
                }
                else if (numMines.min === numMines.max && numMines.max === group.positions.length) {
                    moveType = MoveType.flag;
                }
                if (moveType) {
                    group.positions.forEach(function (position) {
                        var newMove = { pos: position, type: moveType };
                        newMoves.push(newMove);
                    });
                }
            });
        });
        //Only do it if it came up with a move
        /*if (moveType !== undefined) {
            this.board.getAdjacentSquares(squarePos).forEach(adjPos => {
                if (this.board.getKnown(adjPos) === SquareInfo.unknown) {
                    newMoves.push({pos: adjPos, type: moveType});
                }
                
            })
        }*/
        //Remove Duplicate Moves
        //TODO this may be unnecessary because this should be covered in group generation already.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnQkFBZ0I7QUFDeEMsNEJBQTRCLGlCQUFpQjtBQUM3QyxzQ0FBc0MsWUFBWSxtQkFBbUIsWUFBWTtBQUNqRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixpQkFBaUI7QUFDekMsNEJBQTRCLGdCQUFnQjtBQUM1QywwQ0FBMEMsWUFBWTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsaUVBQWUsZUFBZSxFQUFDOzs7Ozs7O1VDNVYvQjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDZ0Q7QUFDWDtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsd0RBQWU7QUFDOUIsY0FBYyx1REFBSztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbWluZXN3ZWVwZXIvLi9zcmMvZ2VuZXJhbFR5cGVzLnRzIiwid2VicGFjazovL21pbmVzd2VlcGVyLy4vc3JjL21pbmVzd2VlcGVyQm90LnRzIiwid2VicGFjazovL21pbmVzd2VlcGVyLy4vc3JjL21pbmVzd2VlcGVyR2FtZS50cyIsIndlYnBhY2s6Ly9taW5lc3dlZXBlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9taW5lc3dlZXBlci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbWluZXN3ZWVwZXIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9taW5lc3dlZXBlci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL21pbmVzd2VlcGVyLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vRm9yIHR5cGVzIHRoYXQgYXJlIHVzZWQgaW4gbXVsdGlwbGUgZmlsZXNcbmV4cG9ydCBmdW5jdGlvbiBtYWtlUG9zaXRpb24oeCwgeSkge1xuICAgIHJldHVybiB7IHg6IHgsIHk6IHkgfTtcbn1cbmV4cG9ydCB2YXIgU3F1YXJlSW5mbztcbihmdW5jdGlvbiAoU3F1YXJlSW5mbykge1xuICAgIFNxdWFyZUluZm9bU3F1YXJlSW5mb1tcIm1pbmVcIl0gPSAtMV0gPSBcIm1pbmVcIjtcbiAgICBTcXVhcmVJbmZvW1NxdWFyZUluZm9bXCJ1bmtub3duXCJdID0gLTJdID0gXCJ1bmtub3duXCI7XG59KShTcXVhcmVJbmZvIHx8IChTcXVhcmVJbmZvID0ge30pKTtcbiIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5pbXBvcnQgeyBTcXVhcmVJbmZvIH0gZnJvbSBcIi4vZ2VuZXJhbFR5cGVzXCI7XG5mdW5jdGlvbiBwb3NUb1N0cihwb3MpIHtcbiAgICByZXR1cm4gcG9zLnggKyBcInhcIiArIHBvcy55O1xufVxuLy9Tb21lIHR5cGVzIGZvciBib3RzXG4vLzAgY29ycmVzcG9uZHMgdG8gbGVmdCBjbGljazsgMiBjb3JyZXNwb25kcyB0byByaWdodCBjbGljay4gU2VlIE1pbmVzd2VlcGVyR2FtZS5oYW5kbGVDbGlja1xudmFyIE1vdmVUeXBlO1xuKGZ1bmN0aW9uIChNb3ZlVHlwZSkge1xuICAgIE1vdmVUeXBlW01vdmVUeXBlW1wicmV2ZWFsXCJdID0gMF0gPSBcInJldmVhbFwiO1xuICAgIE1vdmVUeXBlW01vdmVUeXBlW1wiZmxhZ1wiXSA9IDJdID0gXCJmbGFnXCI7XG59KShNb3ZlVHlwZSB8fCAoTW92ZVR5cGUgPSB7fSkpO1xuLyoqXG4gKiBDbGFzcyB0byBiZSBleHRlbmRlZCB0byBtYWtlIE1pbmVzd2VlcGVyIGJvdHNcbiAqL1xudmFyIEJvdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCb3QoYm9hcmQsIGdhbWUpIHtcbiAgICAgICAgdGhpcy5yZXNldChib2FyZCwgZ2FtZSk7XG4gICAgfVxuICAgIEJvdC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoYm9hcmQsIGdhbWUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50TW92ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICAgICAgdGhpcy5ib2FyZCA9IGJvYXJkO1xuICAgIH07XG4gICAgQm90LnByb3RvdHlwZS5nZW5lcmF0ZU1vdmVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhbGVydChcIkJvdC5nZW5lcmF0ZU1vdmVzIG5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgICB9O1xuICAgIEJvdC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKHVudGlsRG9uZSkge1xuICAgICAgICBpZiAodW50aWxEb25lID09PSB2b2lkIDApIHsgdW50aWxEb25lID0gdHJ1ZTsgfVxuICAgICAgICBpZiAodGhpcy5nYW1lLnN0YXRlICE9PSBcIm9uZ29pbmdcIikge1xuICAgICAgICAgICAgYWxlcnQoXCJHYW1lIGlzIG92ZXIuXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRNb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNb3ZlcygpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudE1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiQm90IGZhaWxlZFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5leHRNb3ZlID0gdGhpcy5jdXJyZW50TW92ZXMuc2hpZnQoKTtcbiAgICAgICAgdGhpcy5nYW1lLmhhbmRsZUNsaWNrKG5leHRNb3ZlLnR5cGUsIG5leHRNb3ZlLnBvcyk7XG4gICAgICAgIGlmICh0aGlzLmdhbWUuc3RhdGUgPT09IFwib25nb2luZ1wiICYmIHVudGlsRG9uZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgLy9MZXQgdGhlIEhUTUwgdXBkYXRlIGJlZm9yZSBydW5uaW5nIGFnYWluXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnJ1bi5iaW5kKHRoaXMpLCAwLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIEJvdDtcbn0oKSk7XG52YXIgTXlCb3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE15Qm90LCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIE15Qm90KCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIE15Qm90LnByb3RvdHlwZS5nZXREYXRhRm9yR3JvdXBHZW5lcmF0aW9uID0gZnVuY3Rpb24gKGdyb3VwMSwgZ3JvdXAyKSB7XG4gICAgICAgIHZhciBpbnRlcnNlY3RpbmdQb3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IGdyb3VwMS5wb3NpdGlvbnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24xID0gX2FbX2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgX2IgPSAwLCBfYyA9IGdyb3VwMi5wb3NpdGlvbnM7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uMiA9IF9jW19iXTtcbiAgICAgICAgICAgICAgICBpZiAocG9zaXRpb24xLnggPT09IHBvc2l0aW9uMi54ICYmIHBvc2l0aW9uMS55ID09PSBwb3NpdGlvbjIueSkge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcnNlY3RpbmdQb3MucHVzaChwb3NpdGlvbjEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBnZXREYXRhRm9yR3JvdXAoZ3JvdXApIHtcbiAgICAgICAgICAgIHZhciBudW1TcXVhcmVzVW5pcXVlVG9Hcm91cCA9IGdyb3VwLnBvc2l0aW9ucy5sZW5ndGggLSBpbnRlcnNlY3RpbmdQb3MubGVuZ3RoO1xuICAgICAgICAgICAgLy9NYXhpbXVtIC8gbWluaW11bSBhbW91bnQgb2YgbWluZXMgdGhhdCBjYW4gYmUgdW5pcXVlIHRvIHRoZSBncm91cCwgYnV0IG5vdCBpbiBib3RoXG4gICAgICAgICAgICB2YXIgbWluZXNVbmlxdWVUb0dyb3VwID0geyBtaW46IE1hdGgubWluKGdyb3VwLm51bU1pbmVzLm1pbiwgbnVtU3F1YXJlc1VuaXF1ZVRvR3JvdXApLFxuICAgICAgICAgICAgICAgIG1heDogTWF0aC5tYXgoMCwgZ3JvdXAubnVtTWluZXMubWF4IC0gaW50ZXJzZWN0aW5nUG9zLmxlbmd0aCkgfTtcbiAgICAgICAgICAgIHJldHVybiB7IG1pbmVzVW5pcXVlOiBtaW5lc1VuaXF1ZVRvR3JvdXAsIHBvc2l0aW9uczogZ3JvdXAucG9zaXRpb25zLCBudW1NaW5lczogZ3JvdXAubnVtTWluZXMgfTtcbiAgICAgICAgfVxuICAgICAgICAvL0dyb3VwIDEgZGF0YVxuICAgICAgICB2YXIgZzEgPSBnZXREYXRhRm9yR3JvdXAoZ3JvdXAxKTtcbiAgICAgICAgdmFyIGcyID0gZ2V0RGF0YUZvckdyb3VwKGdyb3VwMik7XG4gICAgICAgIHZhciBpbnRlcnNlY3RpbmdNaW5lc1JhbmdlID0ge1xuICAgICAgICAgICAgbWluOiBNYXRoLm1heChnMS5wb3NpdGlvbnMubGVuZ3RoIC0gZzEubWluZXNVbmlxdWUubWF4LCBnMi5wb3NpdGlvbnMubGVuZ3RoIC0gZzIubWluZXNVbmlxdWUubWF4KSxcbiAgICAgICAgICAgIG1heDogTWF0aC5taW4oaW50ZXJzZWN0aW5nUG9zLmxlbmd0aCwgZ3JvdXAxLm51bU1pbmVzLm1heCwgZ3JvdXAyLm51bU1pbmVzLm1heClcbiAgICAgICAgfTtcbiAgICAgICAgLy9Gb3IgdGhpcyB2YXJpYWJsZSwgdGhlIG1pbmltdW0gZ2VuZXJhdGVkIGlzbid0IGFjdHVhbGx5IHRoZSBtaW5pbXVtLiBJdCBuZWVkcyB0byBiZSBsaW1pdGVkIGJ5IHRoZSBtYXhpbXVtIHRvby5cbiAgICAgICAgaWYgKGludGVyc2VjdGluZ01pbmVzUmFuZ2UubWluID4gaW50ZXJzZWN0aW5nTWluZXNSYW5nZS5tYXgpIHtcbiAgICAgICAgICAgIGludGVyc2VjdGluZ01pbmVzUmFuZ2UubWluID0gaW50ZXJzZWN0aW5nTWluZXNSYW5nZS5tYXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdyb3VwMTogZzEsXG4gICAgICAgICAgICBncm91cDI6IGcyLFxuICAgICAgICAgICAgaW50ZXJzZWN0aW5nR3JvdXA6IHtcbiAgICAgICAgICAgICAgICBudW1NaW5lczogaW50ZXJzZWN0aW5nTWluZXNSYW5nZSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnM6IGludGVyc2VjdGluZ1Bvc1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG4gICAgTXlCb3QucHJvdG90eXBlLmdlbmVyYXRlTW92ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIC8vR3JvdXAgdHlwZSwgdXNlZCBvbmx5IGhlcmUuXG4gICAgICAgIC8vbWFpblBvcyBpcyB0aGUgcG9zaXRpb24gdGhhdCBhbGwgdGhlIHBvc2l0aW9ucyBhcmUgYWRqYWNlbnQgdG8uXG4gICAgICAgIC8vVE9ETzogZmlndXJlIG91dCBob3cgdG8gbWFrZSBhIHN1Y2Nlc3NmdWwgZ3JvdXBMaXN0IHR5cGUuXG4gICAgICAgIC8vdHlwZSBncm91cExpc3QgPSB7OiBbe251bU1pbmVzOiBudW1iZXIsIHBvc2l0aW9uczogUG9zaXRpb25bXX1dfTtcbiAgICAgICAgdmFyIHVzZWZ1bFNxdWFyZXMgPSB0aGlzLmdldFVzZWZ1bFNxdWFyZXMoKTtcbiAgICAgICAgdmFyIG5ld01vdmVzID0gW107XG4gICAgICAgIHZhciBncm91cHMgPSB7fTtcbiAgICAgICAgLy9HZW5lcmF0ZSBncm91cHMgaW5pdGlhbGx5XG4gICAgICAgIHVzZWZ1bFNxdWFyZXMuZm9yRWFjaChmdW5jdGlvbiAoc3F1YXJlUG9zKSB7XG4gICAgICAgICAgICB2YXIgYWRqYWNlbnRNaW5lcyA9IDA7XG4gICAgICAgICAgICAvL2xldCBhZGphY2VudFVua25vd25zID0gMDtcbiAgICAgICAgICAgIHZhciBzcXVhcmVOdW1iZXIgPSBfdGhpcy5ib2FyZC5nZXRLbm93bihzcXVhcmVQb3MpO1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdmFyIHNxdWFyZVBvc1N0ciA9IHBvc1RvU3RyKHNxdWFyZVBvcyk7XG4gICAgICAgICAgICAvL0dldCBudW1iZXIgb2YgYWRqYWNlbnQgbWluZXNcbiAgICAgICAgICAgIF90aGlzLmJvYXJkLmdldEFkamFjZW50U3F1YXJlcyhzcXVhcmVQb3MpLmZvckVhY2goZnVuY3Rpb24gKGFkalBvcykge1xuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5ib2FyZC5nZXRLbm93bihhZGpQb3MpID09PSBTcXVhcmVJbmZvLnVua25vd24pIHtcbiAgICAgICAgICAgICAgICAgICAgLy9hZGphY2VudFVua25vd25zKys7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKGFkalBvcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKF90aGlzLmJvYXJkLmdldEtub3duKGFkalBvcykgPT09IFNxdWFyZUluZm8ubWluZSkge1xuICAgICAgICAgICAgICAgICAgICBhZGphY2VudE1pbmVzKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL0NyZWF0ZSBncm91cFxuICAgICAgICAgICAgdmFyIHJlbWFpbmluZ01pbmVzID0gc3F1YXJlTnVtYmVyIC0gYWRqYWNlbnRNaW5lcztcbiAgICAgICAgICAgIHZhciBncm91cERhdGEgPSB7IG51bU1pbmVzOiB7IG1pbjogcmVtYWluaW5nTWluZXMsIG1heDogcmVtYWluaW5nTWluZXMgfSwgcG9zaXRpb25zOiBwb3NpdGlvbnMgfTtcbiAgICAgICAgICAgIGlmICghZ3JvdXBzW3NxdWFyZVBvc1N0cl0pIHtcbiAgICAgICAgICAgICAgICBncm91cHNbc3F1YXJlUG9zU3RyXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ3JvdXBzW3NxdWFyZVBvc1N0cl0ucHVzaChncm91cERhdGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9HZW5lcmF0ZSBncm91cHMgYmFzZWQgb24gZXhpc3RpbmcgZ3JvdXBzXG4gICAgICAgIHZhciBuZXdHcm91cHNHZW5lcmF0ZWQgPSB0cnVlO1xuICAgICAgICAvL1RPRE86IGdldCByaWQgb2YgdGltZXNSdW4gb3Igc29tZXRoaW5nIGVsc2VcbiAgICAgICAgdmFyIHRpbWVzUnVuID0gMDtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aW1lc1J1bisrO1xuICAgICAgICAgICAgaWYgKHRpbWVzUnVuID09PSA1MCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGdyb3Vwcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld0dyb3Vwc0dlbmVyYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJHZW5lcmF0aW5nIGV4dHJhIGdyb3Vwc1wiKTtcbiAgICAgICAgICAgIHZhciBncm91cHNUb0FkZCA9IHt9O1xuICAgICAgICAgICAgaWYgKHRpbWVzUnVuID09PSAyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZ3JvdXBzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdm9pZCAwIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2VmdWxTcXVhcmVzLmZvckVhY2goZnVuY3Rpb24gKHNxdWFyZVBvcykge1xuICAgICAgICAgICAgICAgIF90aGlzLmJvYXJkLmdldEFkamFjZW50U3F1YXJlcyhzcXVhcmVQb3MpLmZvckVhY2goZnVuY3Rpb24gKGFkalBvcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudEdyb3VwczEgPSBncm91cHNbcG9zVG9TdHIoc3F1YXJlUG9zKV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50R3JvdXBzMiA9IGdyb3Vwc1twb3NUb1N0cihhZGpQb3MpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRHcm91cHMxID09IHVuZGVmaW5lZCB8fCBjdXJyZW50R3JvdXBzMiA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSWYgdGhlcmUgYXJlIG5vIGdyb3VwcyB0byBkbywgZW5kIGl0IG5vdy5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL0lzIHRoZXJlIGNvZGUgaGVyZT8/XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGN1cnJlbnRHcm91cHMxLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgY3VycmVudEdyb3VwczFfMSA9IGN1cnJlbnRHcm91cHMxOyBfaSA8IGN1cnJlbnRHcm91cHMxXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ3JvdXAxID0gY3VycmVudEdyb3VwczFfMVtfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYSA9IDAsIGN1cnJlbnRHcm91cHMyXzEgPSBjdXJyZW50R3JvdXBzMjsgX2EgPCBjdXJyZW50R3JvdXBzMl8xLmxlbmd0aDsgX2ErKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBncm91cDIgPSBjdXJyZW50R3JvdXBzMl8xW19hXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiR29pbmcgaW4gZ3JvdXBzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50RGF0YSA9IF90aGlzLmdldERhdGFGb3JHcm91cEdlbmVyYXRpb24oZ3JvdXAxLCBncm91cDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vTm93LCB0byBnZW5lcmF0ZSBuZXcgZ3JvdXBzIGJhc2VkIG9uIGRhdGEgZ2VuZXJhdGVkIGluIGdldERhdGFGb3JHcm91cEdlbmVyYXRpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGludGVyc2VjdGluZ0dyb3VwID0gY3VycmVudERhdGEuaW50ZXJzZWN0aW5nR3JvdXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0dyb3VwcyA9IFtpbnRlcnNlY3RpbmdHcm91cF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DaGVjayBmb3IgZHVwbGljYXRlIG5ldyBncm91cHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1RPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1RoaXMgY29kZSBpcyBicm9rZW4gYmVjYXVzZSBpdCBkb2Vzbid0IGNoZWNrIGZvciBkdXBsaWNhdGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9pbiB0aGUgbmV3R3JvdXBzLCBidXQgdGhhdCBkb2Vzbid0IG1hdHRlciByaWdodCBub3cgYmVjYXVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhlcmUgaXMgb25seSBvbmUgb2YgdGhlbS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1RoaXMgY29kZSBpcyBhbHNvIHF1aXRlIGluZWZmaWNpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9JdCdzIGFsc28gZW50aXJlbHkgYnJva2VuLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0dyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChuZXdHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXNEdXBsaWNhdGVHcm91cCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1tzcXVhcmVQb3MsIGFkalBvc10uZm9yRWFjaChwb3NpdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmJvYXJkLmdldEFkamFjZW50U3F1YXJlcyhzcXVhcmVQb3MpLmZvckVhY2goZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0lmIHRoZSBncm91cHMgZm9yIHRoaXMgc3F1YXJlIGFyZSBlbXB0eSwgc3RvcCBub3cuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXBzW3Bvc1RvU3RyKHBvc2l0aW9uKV0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBzW3Bvc1RvU3RyKHBvc2l0aW9uKV0uZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1RPRE8gd29ya2luZyBoZXJlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3VsZEJlRHVwbGljYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3VwLnBvc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb25Jbk90aGVyR3JvdXAgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG5ld0dyb3VwLnBvc2l0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0dyb3VwLnBvc2l0aW9uc1tqXS54ICE9PSBncm91cC5wb3NpdGlvbnNbaV0ueCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0dyb3VwLnBvc2l0aW9uc1tqXS55ICE9PSBncm91cC5wb3NpdGlvbnNbaV0ueSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uSW5PdGhlckdyb3VwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwb3NpdGlvbkluT3RoZXJHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bGRCZUR1cGxpY2F0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQWdhaW4sIGluZWZmaWNpZW50LCBiYWQgY29kZSBUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0dyb3VwLm51bU1pbmVzLm1heCA9PT0gZ3JvdXAubnVtTWluZXMubWF4ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0dyb3VwLm51bU1pbmVzLm1pbiA9PT0gZ3JvdXAubnVtTWluZXMubWluICYmIGNvdWxkQmVEdXBsaWNhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNEdXBsaWNhdGVHcm91cCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV2UgY2F1Z2h0IGEgZHVwbGljYXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNEdXBsaWNhdGVHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNEdXBsaWNhdGVHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3Vwc1RvQWRkW3Bvc1RvU3RyKHNxdWFyZVBvcyldID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3Vwc1RvQWRkW3Bvc1RvU3RyKHNxdWFyZVBvcyldID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm91cHNUb0FkZFtwb3NUb1N0cihzcXVhcmVQb3MpXS5wdXNoKG5ld0dyb3VwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0dyb3Vwc0dlbmVyYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL0FkZCB0aGUgZ3JvdXBzVG9BZGQgdG8gdGhlIGdyb3Vwc1xuICAgICAgICAgICAgdGhpc18xLmdldFVzZWZ1bFNxdWFyZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChncm91cFNxdWFyZVBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvcyA9IHBvc1RvU3RyKGdyb3VwU3F1YXJlUG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIC8vTWFrZSBzdXJlIHRoYXQgdGhlcmUgZXhpc3QgZ3JvdXBzVG9BZGQgYXQgdGhpcyBwb3NpdGlvblxuICAgICAgICAgICAgICAgIGlmIChncm91cHNUb0FkZFtwb3NdICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXBzW3Bvc10gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cHNbcG9zXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGdyb3Vwc1twb3NdID0gZ3JvdXBzW3Bvc10uY29uY2F0KGdyb3Vwc1RvQWRkW3Bvc10pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgdGhpc18xID0gdGhpcztcbiAgICAgICAgd2hpbGUgKG5ld0dyb3Vwc0dlbmVyYXRlZCAmJiB0aW1lc1J1biA8IDUwKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGVfMSA9IF9sb29wXzEoKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdGVfMSA9PT0gXCJvYmplY3RcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVfMS52YWx1ZTtcbiAgICAgICAgICAgIGlmIChzdGF0ZV8xID09PSBcImJyZWFrXCIpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLy9HZXQgZ3JvdXBzIGZyb20gbW92ZXNcbiAgICAgICAgdGhpcy5ib2FyZC5hbGxTcXVhcmVzLmZvckVhY2goZnVuY3Rpb24gKHNxdWFyZSkge1xuICAgICAgICAgICAgZ3JvdXBzW3Bvc1RvU3RyKHNxdWFyZSldLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG51bU1pbmVzID0gZ3JvdXAubnVtTWluZXM7XG4gICAgICAgICAgICAgICAgdmFyIG1vdmVUeXBlO1xuICAgICAgICAgICAgICAgIGlmIChudW1NaW5lcy5taW4gPT09IG51bU1pbmVzLm1heCAmJiBudW1NaW5lcy5tYXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbW92ZVR5cGUgPSBNb3ZlVHlwZS5yZXZlYWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG51bU1pbmVzLm1pbiA9PT0gbnVtTWluZXMubWF4ICYmIG51bU1pbmVzLm1heCA9PT0gZ3JvdXAucG9zaXRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBtb3ZlVHlwZSA9IE1vdmVUeXBlLmZsYWc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtb3ZlVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBncm91cC5wb3NpdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdNb3ZlID0geyBwb3M6IHBvc2l0aW9uLCB0eXBlOiBtb3ZlVHlwZSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TW92ZXMucHVzaChuZXdNb3ZlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvL09ubHkgZG8gaXQgaWYgaXQgY2FtZSB1cCB3aXRoIGEgbW92ZVxuICAgICAgICAvKmlmIChtb3ZlVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLmdldEFkamFjZW50U3F1YXJlcyhzcXVhcmVQb3MpLmZvckVhY2goYWRqUG9zID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ib2FyZC5nZXRLbm93bihhZGpQb3MpID09PSBTcXVhcmVJbmZvLnVua25vd24pIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3TW92ZXMucHVzaCh7cG9zOiBhZGpQb3MsIHR5cGU6IG1vdmVUeXBlfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSovXG4gICAgICAgIC8vUmVtb3ZlIER1cGxpY2F0ZSBNb3Zlc1xuICAgICAgICAvL1RPRE8gdGhpcyBtYXkgYmUgdW5uZWNlc3NhcnkgYmVjYXVzZSB0aGlzIHNob3VsZCBiZSBjb3ZlcmVkIGluIGdyb3VwIGdlbmVyYXRpb24gYWxyZWFkeS5cbiAgICAgICAgdmFyIG5ld2VyTW92ZXMgPSBbXTtcbiAgICAgICAgLy9SZW1vdmUgZHVwbGljYXRlcyBpbiBuZXdNb3ZlczogKGJpZyBPIG5vdCBpZGVhbCkgVE9ET1xuICAgICAgICBuZXdNb3Zlcy5mb3JFYWNoKGZ1bmN0aW9uIChtb3ZlKSB7XG4gICAgICAgICAgICB2YXIgYWxyZWFkeUluTW92ZXMgPSBmYWxzZTtcbiAgICAgICAgICAgIG5ld2VyTW92ZXMuZm9yRWFjaChmdW5jdGlvbiAobW92ZUluTmV3ZXJNb3Zlcykge1xuICAgICAgICAgICAgICAgIC8vT25seSBwb3NpdGlvbiBpcyBuZWVkZWQgdG8gcm9vdCBvdXQgZHVwbGljYXRlIG1vdmVzXG4gICAgICAgICAgICAgICAgaWYgKG1vdmVJbk5ld2VyTW92ZXMucG9zLnggPT09IG1vdmUucG9zLnggJiYgbW92ZUluTmV3ZXJNb3Zlcy5wb3MueSA9PT0gbW92ZUluTmV3ZXJNb3Zlcy5wb3MueSkge1xuICAgICAgICAgICAgICAgICAgICBhbHJlYWR5SW5Nb3ZlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIWFscmVhZHlJbk1vdmVzKSB7XG4gICAgICAgICAgICAgICAgbmV3ZXJNb3Zlcy5wdXNoKG1vdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jdXJyZW50TW92ZXMgPSB0aGlzLmN1cnJlbnRNb3Zlcy5jb25jYXQobmV3ZXJNb3Zlcyk7XG4gICAgfTtcbiAgICBNeUJvdC5wcm90b3R5cGUuZ2V0VXNlZnVsU3F1YXJlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHNxdWFyZXMgPSBbXTtcbiAgICAgICAgdGhpcy5ib2FyZC5wb3NpdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIHNxdWFyZUlzVXNlZnVsID0gZmFsc2U7XG4gICAgICAgICAgICBfdGhpcy5ib2FyZC5nZXRBZGphY2VudFNxdWFyZXMocG9zaXRpb24pLmZvckVhY2goZnVuY3Rpb24gKGFkalBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmJvYXJkLmdldEtub3duKGFkalBvc2l0aW9uKSA9PT0gU3F1YXJlSW5mby51bmtub3duKSB7XG4gICAgICAgICAgICAgICAgICAgIHNxdWFyZUlzVXNlZnVsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vT25seSBwdXQgdGhlIHNxdWFyZSBvbiBpdCdzIGl0J3MgXCJ1c2VmdWxcIiBhbmQgaXQncyBhIG51bWJlciBzcXVhcmUgKD4gMClcbiAgICAgICAgICAgIGlmIChzcXVhcmVJc1VzZWZ1bCAmJiBfdGhpcy5ib2FyZC5nZXRLbm93bihwb3NpdGlvbikgPiAwKSB7XG4gICAgICAgICAgICAgICAgc3F1YXJlcy5wdXNoKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzcXVhcmVzO1xuICAgIH07XG4gICAgcmV0dXJuIE15Qm90O1xufShCb3QpKTtcbmV4cG9ydCBkZWZhdWx0IE15Qm90O1xuIiwiaW1wb3J0IHsgU3F1YXJlSW5mbywgbWFrZVBvc2l0aW9uIH0gZnJvbSBcIi4vZ2VuZXJhbFR5cGVzXCI7XG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBudW1iZXIgYmV0d2VlbiBtaW4gYW5kIG1heCwgbWluIGluY2x1c2l2ZSBtYXggZXhjbHVzaXZlXG4gKiBAcGFyYW0gbWluIE1pbmltdW0gbnVtYmVyIChpbmNsdXNpdmUpXG4gKiBAcGFyYW0gbWF4IE1heGltdW0gbnVtYmVyIChleGNsdXNpdmUpXG4gKi9cbmZ1bmN0aW9uIHJhbmRvbUludChtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG59XG4vKipcbiAqIENvbnZlcnRzIG51bWJlciB0byBlbW9qaSAodGhlIFNxdWFyZUluZm9UeXBlIGZvcm0pXG4gKiBAcGFyYW0gbnVtIE51bWJlciB0byBiZSBjb252ZXJ0ZWQgdG8gYW4gZW1vamlcbiAqIEBwYXJhbSBnYW1lTG9zdCBXaGV0aGVyIHRoZSBnYW1lIGlzIGxvc3QsIHVzZWQgdHlwZSBvZiBtaW5lXG4gKiBAcmV0dXJucyBUaGUgcmVzdWx0aW5nIGVtb2ppXG4gKi9cbmZ1bmN0aW9uIG51bVRvRW1vamkobnVtLCBnYW1lTG9zdCkge1xuICAgIGlmIChnYW1lTG9zdCA9PT0gdm9pZCAwKSB7IGdhbWVMb3N0ID0gZmFsc2U7IH1cbiAgICAvL05vdGU6IHRoZSBmb2xsb3dpbmcgbGluZSBtYXkgY29udGFpbiBub3Qtc28tZ29vZCBpbnZpc2libGUgZW1vamlcbiAgICByZXR1cm4gW1wi4qycXCIsIGdhbWVMb3N0ID8gXCLwn5KjXCIgOiBcIvCfmqlcIiwgXCLwn5+mXCIsIFwiMe+4j+KDo1wiLCBcIjLvuI/ig6NcIiwgXCIz77iP4oOjXCIsIFwiNO+4j+KDo1wiLCBcIjXvuI/ig6NcIiwgXCI277iP4oOjXCIsIFwiN++4j+KDo1wiLCBcIjjvuI/ig6NcIl1bbnVtICsgMl07XG59XG5mdW5jdGlvbiB1cGRhdGVSZW1haW5pbmdNaW5lcyhudW1NaW5lcykge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVtYWluaW5nTWluZXNcIikudGV4dENvbnRlbnQgPSBTdHJpbmcobnVtTWluZXMpO1xufVxuZnVuY3Rpb24gdXBkYXRlR2FtZVN0YXR1cyhzdGF0ZSkge1xuICAgIHZhciBzdGF0dXNFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGF0dXNcIik7XG4gICAgdmFyIHN0YXRlVG9TdGF0dXMgPSB7XG4gICAgICAgIFwib25nb2luZ1wiOiBcIlBsYXlpbmdcIixcbiAgICAgICAgXCJ3b25cIjogXCJZb3Ugd29uIVwiLFxuICAgICAgICBcImxvc3RcIjogXCJZb3UgbG9zdFwiXG4gICAgfTtcbiAgICBzdGF0dXNFbGVtZW50LnRleHRDb250ZW50ID0gc3RhdGVUb1N0YXR1c1tzdGF0ZV07XG59XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5mdW5jdGlvbiBwb3NGcm9tU3RyKHN0cikge1xuICAgIHZhciBpdGVtcyA9IHN0ci5zcGxpdChcIixcIik7XG4gICAgcmV0dXJuIHsgeDogaXRlbXNbMF0sIHk6IGl0ZW1zWzFdIH07XG59XG4vL0V4cG9ydGVkIGZvciBtaW5lc3dlZXBlckJvdC50c1xudmFyIEJvYXJkID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEJvYXJkKHdpZHRoLCBoZWlnaHQsIG51bU1pbmVzKSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMubnVtTWluZXMgPSBudW1NaW5lcztcbiAgICAgICAgdGhpcy5taW5lc0xlZnQgPSBudW1NaW5lcztcbiAgICAgICAgdGhpcy5zdHJ1Y3R1cmUgPSBbXTtcbiAgICAgICAgdGhpcy5rbm93blN0cnVjdHVyZSA9IFtdO1xuICAgICAgICAvL0luaXRpYWxpemUga25vd25TdHJ1Y3R1cmVcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICB0aGlzLmtub3duU3RydWN0dXJlLnB1c2goW10pO1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmtub3duU3RydWN0dXJlW3ldLnB1c2goU3F1YXJlSW5mby51bmtub3duKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL0luaXRpYWxpemUgYWxsU3F1YXJlc1xuICAgICAgICB0aGlzLmFsbFNxdWFyZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWxsU3F1YXJlcy5wdXNoKG1ha2VQb3NpdGlvbih4LCB5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZW5lcmF0ZUJvYXJkKCk7XG4gICAgfVxuICAgIEJvYXJkLnByb3RvdHlwZS5wb3NpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKHsgeDogeCwgeTogeSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH07XG4gICAgQm9hcmQucHJvdG90eXBlLmdlbmVyYXRlTWluZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBtaW5lTGlzdCA9IFtdO1xuICAgICAgICAvL0dlbmVyYXRlIHJhbmRvbSBjb29yZGluYXRlcyBmb3IgbWluZXMuXG4gICAgICAgIGZvciAodmFyIG1pbmUgPSAwOyBtaW5lIDwgdGhpcy5udW1NaW5lczsgbWluZSsrKSB7XG4gICAgICAgICAgICB2YXIgbWluZU5vdEdlbmVyYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgbWluZUxvY2F0aW9uID0gdm9pZCAwO1xuICAgICAgICAgICAgd2hpbGUgKG1pbmVOb3RHZW5lcmF0ZWQpIHtcbiAgICAgICAgICAgICAgICBtaW5lTG9jYXRpb24gPSB7IHg6IHJhbmRvbUludCgwLCB0aGlzLndpZHRoKSwgeTogcmFuZG9tSW50KDAsIHRoaXMuaGVpZ2h0KSB9O1xuICAgICAgICAgICAgICAgIC8vQXNzdW1lIHRoZSBtaW5lIGhhcyBiZWVuIGdlbmVyYXRlZFxuICAgICAgICAgICAgICAgIG1pbmVOb3RHZW5lcmF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIHRoZSBtaW5lIGlzIGFscmVhZHkgaW4gdGhlIGxpc3Q6XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtaW5lTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWluZUxpc3RbaV0ueCA9PT0gbWluZUxvY2F0aW9uLnggJiYgbWluZUxpc3RbaV0ueSA9PT0gbWluZUxvY2F0aW9uLnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTmVlZCB0byByZXJ1biB0aGUgdGhpbmcuXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5lTm90R2VuZXJhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1pbmVMaXN0LnB1c2gobWluZUxvY2F0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluZUxpc3Q7XG4gICAgfTtcbiAgICBCb2FyZC5wcm90b3R5cGUuZ2V0QWRqYWNlbnRTcXVhcmVzID0gZnVuY3Rpb24gKGxvY2F0aW9uKSB7XG4gICAgICAgIHZhciBsb2NhdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgZHggPSAtMTsgZHggPD0gMTsgZHgrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgZHkgPSAtMTsgZHkgPD0gMTsgZHkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4TG9jYXRpb24gPSBsb2NhdGlvbi54ICsgZHg7XG4gICAgICAgICAgICAgICAgdmFyIHlMb2NhdGlvbiA9IGxvY2F0aW9uLnkgKyBkeTtcbiAgICAgICAgICAgICAgICBpZiAoeExvY2F0aW9uIDwgMCB8fCB5TG9jYXRpb24gPCAwIHx8IHhMb2NhdGlvbiA+PSB0aGlzLndpZHRoIHx8IHlMb2NhdGlvbiA+PSB0aGlzLmhlaWdodCB8fCAoZHggPT09IDAgJiYgZHkgPT09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25zLnB1c2goeyB4OiB4TG9jYXRpb24sIHk6IHlMb2NhdGlvbiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvY2F0aW9ucztcbiAgICB9O1xuICAgIEJvYXJkLnByb3RvdHlwZS5nZW5lcmF0ZUJvYXJkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbWluZUxvY2F0aW9ucyA9IHRoaXMuZ2VuZXJhdGVNaW5lcygpO1xuICAgICAgICAvL0luaXRpYWxpemUgYm9hcmQgc3RydWN0dXJlXG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgdGhpcy5zdHJ1Y3R1cmUucHVzaChbXSk7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RydWN0dXJlW3ldLnB1c2goMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9QdXQgdGhlIG1pbmVzIGludG8gdGhlIGJvYXJkXG4gICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgdGhpcy5udW1NaW5lczsgbisrKSB7XG4gICAgICAgICAgICB2YXIgbWluZUxvY2F0aW9uID0gbWluZUxvY2F0aW9uc1tuXTtcbiAgICAgICAgICAgIHRoaXMuc2V0KG1pbmVMb2NhdGlvbiwgU3F1YXJlSW5mby5taW5lKTtcbiAgICAgICAgfVxuICAgICAgICAvL0FkZCB0aGUgbnVtYmVycyBhcm91bmQgdGhlIG1pbmVzIGxpa2UgbWluZXN3ZWVwZXIgaGFzXG4gICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgdGhpcy5udW1NaW5lczsgbisrKSB7XG4gICAgICAgICAgICB2YXIgbWluZUxvY2F0aW9uID0gbWluZUxvY2F0aW9uc1tuXTtcbiAgICAgICAgICAgIC8vQWRkIGFkamFjZW50IG1pbmUgbnVtYmVyc1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuZ2V0QWRqYWNlbnRTcXVhcmVzKG1pbmVMb2NhdGlvbik7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uXzEgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0KGxvY2F0aW9uXzEpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLnN0cnVjdHVyZVtsb2NhdGlvbi55XVtsb2NhdGlvbi54XSArPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldChsb2NhdGlvbl8xLCB0aGlzLmdldChsb2NhdGlvbl8xKSArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV2ZWFscyBhIHNxdWFyZSBvbiB0aGUgYm9hcmQuIERvZXMgbm90IGhhbmRsZSBnYW1lIHdpbiBvciBsb3NzXG4gICAgICogQHBhcmFtIHBvcyBUaGUgcG9zaXRpb24gb2YgdGhlIHNxdWFyZSB0byByZXZlYWxcbiAgICAgKiBAcmV0dXJucyBUaGUgdmFsdWUgb2YgdGhlIHNxdWFyZSB0byBiZSByZXZlYWxlZFxuICAgICAqXG4gICAgICovXG4gICAgQm9hcmQucHJvdG90eXBlLnJldmVhbFNxdWFyZSA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgdGhpcy5rbm93blN0cnVjdHVyZVtwb3MueV1bcG9zLnhdID0gdGhpcy5zdHJ1Y3R1cmVbcG9zLnldW3Bvcy54XTtcbiAgICAgICAgaWYgKHRoaXMuZ2V0KHBvcykgPT09IDApIHtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmdldEFkamFjZW50U3F1YXJlcyhwb3MpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbl8yID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldEtub3duKGxvY2F0aW9uXzIpID09PSBTcXVhcmVJbmZvLnVua25vd24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXZlYWxTcXVhcmUobG9jYXRpb25fMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldChwb3MpO1xuICAgIH07XG4gICAgQm9hcmQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RydWN0dXJlW3Bvcy55XVtwb3MueF07XG4gICAgfTtcbiAgICBCb2FyZC5wcm90b3R5cGUuZ2V0S25vd24gPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmtub3duU3RydWN0dXJlW3Bvcy55XVtwb3MueF07XG4gICAgfTtcbiAgICBCb2FyZC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHBvcywgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zdHJ1Y3R1cmVbcG9zLnldW3Bvcy54XSA9IHZhbHVlO1xuICAgIH07XG4gICAgQm9hcmQucHJvdG90eXBlLnNldEtub3duID0gZnVuY3Rpb24gKHBvcywgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5rbm93blN0cnVjdHVyZVtwb3MueV1bcG9zLnhdID0gdmFsdWU7XG4gICAgfTtcbiAgICBCb2FyZC5wcm90b3R5cGUuZmxhZyA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgdGhpcy5zZXRLbm93bihwb3MsIFNxdWFyZUluZm8ubWluZSk7XG4gICAgICAgIHRoaXMubWluZXNMZWZ0ID0gdGhpcy5taW5lc0xlZnQgLSAxO1xuICAgIH07XG4gICAgQm9hcmQucHJvdG90eXBlLnVuRmxhZyA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgdGhpcy5zZXRLbm93bihwb3MsIFNxdWFyZUluZm8udW5rbm93bik7XG4gICAgICAgIHRoaXMubWluZXNMZWZ0ID0gdGhpcy5taW5lc0xlZnQgKyAxO1xuICAgIH07XG4gICAgcmV0dXJuIEJvYXJkO1xufSgpKTtcbmV4cG9ydCB7IEJvYXJkIH07XG52YXIgTWluZXN3ZWVwZXJHYW1lID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE1pbmVzd2VlcGVyR2FtZSh3aWR0aCwgaGVpZ2h0LCBudW1NaW5lcywgcm9vdEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5yZXNldCh3aWR0aCwgaGVpZ2h0LCBudW1NaW5lcywgcm9vdEVsZW1lbnQsIHRydWUpO1xuICAgIH1cbiAgICBNaW5lc3dlZXBlckdhbWUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIG51bU1pbmVzLCByb290RWxlbWVudCwgaW5pdGlhbGl6ZSkge1xuICAgICAgICBpZiAoaW5pdGlhbGl6ZSA9PT0gdm9pZCAwKSB7IGluaXRpYWxpemUgPSBmYWxzZTsgfVxuICAgICAgICB2YXIgcmVtYWtlQm9hcmQgPSB0cnVlO1xuICAgICAgICAvL0JvYXJkIGhhcyBhbHJlYWR5IGJlZW4gbWFkZSwgYW5kIHdpZHRoIGFuZCBoZWlnaHQgYXJlIHRoZSBzYW1lLlxuICAgICAgICBpZiAoIWluaXRpYWxpemUgJiYgdGhpcy53aWR0aCAmJiB0aGlzLmhlaWdodCAmJiB0aGlzLndpZHRoID09PSB3aWR0aCAmJiB0aGlzLmhlaWdodCA9PT0gaGVpZ2h0KSB7XG4gICAgICAgICAgICByZW1ha2VCb2FyZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQod2lkdGgsIGhlaWdodCwgbnVtTWluZXMpO1xuICAgICAgICB1cGRhdGVSZW1haW5pbmdNaW5lcyh0aGlzLmJvYXJkLm1pbmVzTGVmdCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm9uZ29pbmdcIjtcbiAgICAgICAgdXBkYXRlR2FtZVN0YXR1cyh0aGlzLnN0YXRlKTtcbiAgICAgICAgaWYgKHJlbWFrZUJvYXJkKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkRWxlbWVudCA9IHRoaXMuZ2VuZXJhdGVCb2FyZEhUTUwoKTtcbiAgICAgICAgICAgIGlmIChyb290RWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByb290RWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJvb3RFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuYm9hcmRFbGVtZW50KTtcbiAgICAgICAgICAgIC8vUHJldmVudCB0aGUgY29udGV4dCBtZW51IGZyb20gYmVpbmcgb3BlbmVkIHdoZW4gcmlnaHQtY2xpY2tpbmcgb24gdGhlIGJvYXJkXG4gICAgICAgICAgICByb290RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9NYWtlIHRoZSBib2FyZCBnbyBiYWNrIHRvIHVuc2V0LlxuICAgICAgICBpZiAoIWluaXRpYWxpemUpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQm9hcmRIVE1MKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE1pbmVzd2VlcGVyR2FtZS5wcm90b3R5cGUuZ2VuZXJhdGVCb2FyZEhUTUwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VHcmlkU3F1YXJlKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgbmV3U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICAgICAgbmV3U3Bhbi50ZXh0Q29udGVudCA9IHZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIG5ld1NwYW47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRhYmxlXCIpO1xuICAgICAgICB2YXIgdGJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGJvZHlcIik7XG4gICAgICAgIHRhYmxlLmFwcGVuZENoaWxkKHRib2R5KTtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoeSkge1xuICAgICAgICAgICAgdmFyIHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRyXCIpO1xuICAgICAgICAgICAgdmFyIF9sb29wXzIgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHZhciB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcbiAgICAgICAgICAgICAgICAvL0FkZCBvbi1jbGljayBzdHVmZi5zXG4gICAgICAgICAgICAgICAgdGQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWNrKGUuYnV0dG9uLCB7IHg6IHgsIHk6IHkgfSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXNfMSkpO1xuICAgICAgICAgICAgICAgIHRkLmFwcGVuZENoaWxkKG1ha2VHcmlkU3F1YXJlKG51bVRvRW1vamkodGhpc18xLmJvYXJkLmdldEtub3duKHsgeDogeCwgeTogeSB9KSkpKTtcbiAgICAgICAgICAgICAgICB0ci5hcHBlbmRDaGlsZCh0ZCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzXzEuYm9hcmQud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIF9sb29wXzIoeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0Ym9keS5hcHBlbmRDaGlsZCh0cik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB0aGlzXzEgPSB0aGlzO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuYm9hcmQuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIF9sb29wXzEoeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhYmxlO1xuICAgIH07XG4gICAgTWluZXN3ZWVwZXJHYW1lLnByb3RvdHlwZS51cGRhdGVCb2FyZEhUTUwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5ib2FyZC5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmJvYXJkLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkRWxlbWVudC50Qm9kaWVzWzBdLmNoaWxkcmVuW3ldLmNoaWxkcmVuW3hdLmZpcnN0RWxlbWVudENoaWxkLnRleHRDb250ZW50ID0gbnVtVG9FbW9qaSh0aGlzLmJvYXJkLmdldEtub3duKHsgeDogeCwgeTogeSB9KSwgdGhpcy5zdGF0ZSA9PSBcImxvc3RcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlUmVtYWluaW5nTWluZXModGhpcy5ib2FyZC5taW5lc0xlZnQpO1xuICAgIH07XG4gICAgTWluZXN3ZWVwZXJHYW1lLnByb3RvdHlwZS5kb0Nob3JkID0gZnVuY3Rpb24gKHBvcykge1xuICAgICAgICB2YXIgbnVtTWluZXMgPSAwO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5ib2FyZC5nZXRBZGphY2VudFNxdWFyZXMocG9zKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBsb2NhdGlvbl8zID0gX2FbX2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQuZ2V0S25vd24obG9jYXRpb25fMykgPT0gU3F1YXJlSW5mby5taW5lKSB7XG4gICAgICAgICAgICAgICAgbnVtTWluZXMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobnVtTWluZXMgPT09IHRoaXMuYm9hcmQuZ2V0S25vd24ocG9zKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgX2IgPSAwLCBfYyA9IHRoaXMuYm9hcmQuZ2V0QWRqYWNlbnRTcXVhcmVzKHBvcyk7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uXzQgPSBfY1tfYl07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQuZ2V0S25vd24obG9jYXRpb25fNCkgIT09IFNxdWFyZUluZm8ubWluZVxuICAgICAgICAgICAgICAgICAgICAmJiB0aGlzLmJvYXJkLmdldChsb2NhdGlvbl80KSA9PT0gU3F1YXJlSW5mby5taW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlTG9zaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucmV2ZWFsU3F1YXJlKGxvY2F0aW9uXzQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBNaW5lc3dlZXBlckdhbWUucHJvdG90eXBlLmhhbmRsZUNsaWNrID0gZnVuY3Rpb24gKGJ1dHRvbiwgcG9zLCBjYXNjYWRpbmcpIHtcbiAgICAgICAgaWYgKGNhc2NhZGluZyA9PT0gdm9pZCAwKSB7IGNhc2NhZGluZyA9IGZhbHNlOyB9XG4gICAgICAgIC8vRG9uJ3QgY2hhbmdlIGFueXRoaW5nIGFmdGVyIHRoZSBnYW1lIGlzIG92ZXJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT0gXCJsb3N0XCIgfHwgdGhpcy5zdGF0ZSA9PSBcIndvblwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy9DaG9yZFxuICAgICAgICBpZiAodGhpcy5ib2FyZC5nZXRLbm93bihwb3MpID4gMCkge1xuICAgICAgICAgICAgdGhpcy5kb0Nob3JkKHBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy9odHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTW91c2VFdmVudC9idXR0b25cbiAgICAgICAgLy8wID0gbGVmdCBjbGljaywgMiA9IHJpZ2h0IGNsaWNrXG4gICAgICAgIGlmICh0aGlzLmJvYXJkLmdldEtub3duKHBvcykgPT09IFNxdWFyZUluZm8ubWluZSkge1xuICAgICAgICAgICAgdGhpcy5ib2FyZC51bkZsYWcocG9zKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChidXR0b24gPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQucmV2ZWFsU3F1YXJlKHBvcyk7XG4gICAgICAgICAgICBpZiAodGhpcy5ib2FyZC5nZXQocG9zKSA9PT0gU3F1YXJlSW5mby5taW5lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVMb3NpbmcoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYnV0dG9uID09PSAyICYmIHRoaXMuYm9hcmQuZ2V0S25vd24ocG9zKSA9PT0gU3F1YXJlSW5mby51bmtub3duKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLmZsYWcocG9zKTtcbiAgICAgICAgfVxuICAgICAgICAvL0lmIHRoaXMgZnVuY3Rpb24gaGFzbid0IGJlZW4gY2FsbGVkIGJ5IGl0c2VsZiwgZG8gdGhpcy5cbiAgICAgICAgaWYgKCFjYXNjYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQm9hcmRIVE1MKCk7XG4gICAgICAgICAgICAvL0NoZWNrIEdhbWUtd2luXG4gICAgICAgICAgICBpZiAodGhpcy5oYXNXb25HYW1lKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVdpbm5pbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBnYW1lIGlzIHdvblxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGdhbWUgaGFzIGJlZW4gd29uIG9yIG5vdFxuICAgICAqL1xuICAgIE1pbmVzd2VlcGVyR2FtZS5wcm90b3R5cGUuaGFzV29uR2FtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT09IFwibG9zdFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGhhc1dvbiA9IHRydWU7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy53aWR0aDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuaGVpZ2h0OyB4KyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ib2FyZC5nZXQoeyB4OiB4LCB5OiB5IH0pICE9PSB0aGlzLmJvYXJkLmdldEtub3duKHsgeDogeCwgeTogeSB9KSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLmdldCh7IHg6IHgsIHk6IHkgfSkgIT09IFNxdWFyZUluZm8ubWluZSkge1xuICAgICAgICAgICAgICAgICAgICBoYXNXb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc1dvbjtcbiAgICB9O1xuICAgIE1pbmVzd2VlcGVyR2FtZS5wcm90b3R5cGUuaGFuZGxlV2lubmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwid29uXCI7XG4gICAgICAgIHVwZGF0ZUdhbWVTdGF0dXModGhpcy5zdGF0ZSk7XG4gICAgICAgIHRoaXMuYm9hcmQubWluZXNMZWZ0ID0gMDtcbiAgICAgICAgLy9NYWtlIGFsbCB0aGUgbWluZXMgc2hvd25cbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLndpZHRoOyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5oZWlnaHQ7IHgrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc2V0S25vd24oeyB4OiB4LCB5OiB5IH0sIHRoaXMuYm9hcmQuZ2V0KHsgeDogeCwgeTogeSB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVCb2FyZEhUTUwoKTtcbiAgICB9O1xuICAgIE1pbmVzd2VlcGVyR2FtZS5wcm90b3R5cGUuaGFuZGxlTG9zaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJsb3N0XCI7XG4gICAgICAgIC8vTWFrZSBhbGwgc3F1YXJlcyBjbGVhcjtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucmV2ZWFsU3F1YXJlKHsgeDogeCwgeTogeSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUJvYXJkSFRNTCgpO1xuICAgICAgICB1cGRhdGVHYW1lU3RhdHVzKHRoaXMuc3RhdGUpO1xuICAgIH07XG4gICAgcmV0dXJuIE1pbmVzd2VlcGVyR2FtZTtcbn0oKSk7XG5leHBvcnQgZGVmYXVsdCBNaW5lc3dlZXBlckdhbWU7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vQnVuZGxlLmpzIGlzIGJ1aWx0IGZyb20gdGhpcyBmaWxlLlxuLypcbk5vdGVzICh0byBnbyBpbiB0aGUgbWFpbiBmaWxlKTpcblxuVE9ETzogV2hlbiB1bmZsYWdnaW5nIGEgc3F1YXJlIHRoYXQgaGFzIGEgemVybyBuZXh0IHRvIGl0LCBtYWtlIGl0IGJlIHdoYXRldmVyIGl0IGlzP1xuTm90IHN1cmUgd2hhdCB0byBkbyBoZXJlLCBwZXJoYXBzIGNoZWNrIHdoYXQgZ29vZCBtaW5lc3dlZXBlciBkb2VzIGhlcmUgb3Igc29tZSBvdGhlclxubWluZXN3ZWVwZXIgaW1wbGVtZW50YXRpb25cblxuVE9ETzogVXNlIHRoZSB3YXkgdG8gbG9vcCB0aHJvdWdoIGFsbCBzcXVhcmVzIG1vcmUuXG5cblRPRE86IE5vIHRvby1tdWNoLXJlY3Vyc2lvbiAtLT4gZXJyb3Igd2hlbiBCb3QucnVuIGlzIGNhbGxlZCBhbmQgdGhlcmUgYXJlIHRvbyBtYW55IG1vdmVzIGl0IG5lZWRzIHRvIG1ha2VcblxuVE9ETzogZGVsZXRlIG9sZCBjb2RlIHdoaWNoIGlzIGNvbW1lbnRlZCBvdXQgaW4gdmFyaW91cyBwbGFjZXNcblxuVGhlIGJvYXJkIGlzIGludGVybmFsbHkgb3JnYW5pemVkIHdpdGggc3RydWN0dXJlW3ldW3hdXG5cbiovXG5pbXBvcnQgTWluZXN3ZWVwZXJHYW1lIGZyb20gXCIuL21pbmVzd2VlcGVyR2FtZVwiO1xuaW1wb3J0IE15Qm90IGZyb20gXCIuL21pbmVzd2VlcGVyQm90XCI7XG52YXIgYm9hcmRXaWR0aCA9IDEwO1xudmFyIGJvYXJkSGVpZ2h0ID0gMTA7XG52YXIgbnVtTWluZXMgPSA1O1xudmFyIHJvb3REaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I3Jvb3RcIik7XG52YXIgZ2FtZSA9IG5ldyBNaW5lc3dlZXBlckdhbWUoYm9hcmRXaWR0aCwgYm9hcmRIZWlnaHQsIG51bU1pbmVzLCByb290RGl2KTtcbnZhciBib3QgPSBuZXcgTXlCb3QoZ2FtZS5ib2FyZCwgZ2FtZSk7XG52YXIgYm90UnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJydW5Cb3RcIik7XG52YXIgYm90U3RlcEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm90T25lTW92ZVwiKTtcbmJvdFN0ZXBCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGJvdC5ydW4uYmluZChib3QsIGZhbHNlKSk7XG5ib3RSdW5CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGJvdC5ydW4uYmluZChib3QsIHRydWUpKTtcbmZ1bmN0aW9uIHJlc3RhcnRHYW1lKCkge1xuICAgIGdhbWUucmVzZXQoYm9hcmRXaWR0aCwgYm9hcmRIZWlnaHQsIG51bU1pbmVzLCByb290RGl2KTtcbiAgICBib3QucmVzZXQoZ2FtZS5ib2FyZCwgZ2FtZSk7XG59XG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ld0dhbWVCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHJlc3RhcnRHYW1lKTtcbi8vSW5wdXQgc3R1ZmZcbnZhciBudW1NaW5lc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJudW1NaW5lc1wiKTtcbm51bU1pbmVzSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKE51bWJlcih0aGlzLnZhbHVlKSA+IE51bWJlcih0aGlzLm1heCkpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubWF4O1xuICAgIH1cbiAgICBudW1NaW5lcyA9IE51bWJlcih0aGlzLnZhbHVlKTtcbn0pO1xudmFyIGJvYXJkU2l6ZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZFNpemVcIik7XG5ib2FyZFNpemVJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoTnVtYmVyKHRoaXMudmFsdWUpID4gTnVtYmVyKHRoaXMubWF4KSkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5tYXg7XG4gICAgfVxuICAgIGJvYXJkV2lkdGggPSBOdW1iZXIodGhpcy52YWx1ZSk7XG4gICAgYm9hcmRIZWlnaHQgPSBOdW1iZXIodGhpcy52YWx1ZSk7XG4gICAgbnVtTWluZXNJbnB1dC5tYXggPSBTdHJpbmcoTWF0aC5wb3coTnVtYmVyKHRoaXMudmFsdWUpLCAyKSk7XG4gICAgaWYgKE51bWJlcihudW1NaW5lc0lucHV0LnZhbHVlKSA+IE51bWJlcihudW1NaW5lc0lucHV0Lm1heCkpIHtcbiAgICAgICAgbnVtTWluZXNJbnB1dC52YWx1ZSA9IG51bU1pbmVzSW5wdXQubWF4O1xuICAgICAgICBudW1NaW5lcyA9IE51bWJlcihudW1NaW5lc0lucHV0LnZhbHVlKTtcbiAgICB9XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==