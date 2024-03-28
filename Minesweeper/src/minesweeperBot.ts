import {Position, SquareInfo} from "./generalTypes"
import {Board} from "./minesweeperGame"
import MinesweeperGame from "./minesweeperGame"

type Group = {numMines: NumRange, positions: Position[]};
//Inclusive range type
type NumRange = {min: number, max: number};

function posToStr (pos: Position) {
    return pos.x + "x" + pos.y;
}

//Some types for bots

//0 corresponds to left click; 2 corresponds to right click. See MinesweeperGame.handleClick
enum MoveType {
    reveal = 0,
    flag = 2
}

type Move = {pos: Position, type: MoveType};

/**
 * Class to be extended to make Minesweeper bots
 */
class Bot {
    currentMoves: Move[];
    board: Board;
    game: MinesweeperGame;

    constructor (board: Board, game: MinesweeperGame) {
        this.reset(board, game);
    }

    reset (board: Board, game: MinesweeperGame) {
        this.currentMoves = [];
        this.game = game;
        this.board = board;
    }

    generateMoves () {
        alert("Bot.generateMoves not implemented");
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


export default class MyBot extends Bot {
    getDataForGroupGeneration (group1: Group, group2: Group) {
        const intersectingPos: Position[] = [];
        
        for (const position1 of group1.positions) {
            for (const position2 of group2.positions) {
                if (position1.x === position2.x && position1.y === position2.y) {
                    intersectingPos.push(position1);
                }
            }
        }

        function getDataForGroup (group: Group) {
            const numSquaresUniqueToGroup = group.positions.length - intersectingPos.length;

            //Maximum / minimum amount of mines that can be unique to the group, but not in both
            const minesUniqueToGroup: NumRange = {min: Math.min(group.numMines.min, numSquaresUniqueToGroup), 
                max: Math.max(0, group.numMines.max - intersectingPos.length)};

            return {minesUnique: minesUniqueToGroup, positions: group.positions, numMines: group.numMines};
        }
        
        //Group 1 data
        const g1 = getDataForGroup(group1);
        const g2 = getDataForGroup(group2);
        
        const intersectingMinesRange: NumRange = {
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
    }

    generateMoves () {
        //Group type, used only here.
        //mainPos is the position that all the positions are adjacent to.
        //TODO: figure out how to make a successful groupList type.
        //type groupList = {: [{numMines: number, positions: Position[]}]};
        const usefulSquares = this.getUsefulSquares();
        const newMoves: Move[] = [];
        const groups: {[posInStrForm: string]: Group[]} = {};

        //Generate groups initially
        usefulSquares.forEach(squarePos => {
            let adjacentMines = 0;
            //let adjacentUnknowns = 0;
            const squareNumber: number = this.board.getKnown(squarePos);
            const positions: Position[] = [];
            const squarePosStr = posToStr(squarePos);

            //Get number of adjacent mines
            this.board.getAdjacentSquares(squarePos).forEach(adjPos => {
                if (this.board.getKnown(adjPos) === SquareInfo.unknown) {
                    //adjacentUnknowns++;
                    positions.push(adjPos);
                } else if (this.board.getKnown(adjPos) === SquareInfo.mine) {
                    adjacentMines++;
                }
            });

           
            
            //Create group
            const remainingMines = squareNumber - adjacentMines
            const groupData: Group = {numMines: {min: remainingMines, max: remainingMines}, positions: positions};

            if (!groups[squarePosStr]) {
                groups[squarePosStr] = [];
            }

            groups[squarePosStr].push(groupData);

        });

        //Generate groups based on existing groups
        let newGroupsGenerated = true;

        //TODO: get rid of timesRun or something else
        let timesRun = 0;
        while (newGroupsGenerated && timesRun < 50) {
            timesRun++;
            if (timesRun === 50) {
                console.log(groups);
                break;
            }

            newGroupsGenerated = false;
            console.log("Generating extra groups");

            const groupsToAdd: {[posInStrForm: string]: Group[]} = {};

            if (timesRun === 2) {
                console.log(groups);
                return;
            }

            usefulSquares.forEach(squarePos => {
                this.board.getAdjacentSquares(squarePos).forEach(adjPos => {
                    const currentGroups1 = groups[posToStr(squarePos)];
                    const currentGroups2 = groups[posToStr(adjPos)];
                    
                    if (currentGroups1 == undefined || currentGroups2 == undefined) {
                        //If there are no groups to do, end it now.
                        return;
                    }

                    //Is there code here??
                    console.log(currentGroups1.length);

                    for (const group1 of currentGroups1) {
                        
                        for (const group2 of currentGroups2) {
                            //console.log("Going in groups");

                            const currentData = this.getDataForGroupGeneration(group1, group2);
                            
                            //Now, to generate new groups based on data generated in getDataForGroupGeneration.
                            const intersectingGroup = currentData.intersectingGroup;
                            const newGroups = [intersectingGroup];
                            
                            //Check for duplicate new groups
                            //TODO
                            //This code is broken because it doesn't check for duplicates
                            //in the newGroups, but that doesn't matter right now because
                            //there is only one of them.
                            //This code is also quite inefficient
                            //It's also entirely broken.
                            newGroups.forEach(newGroup => {
                                let isDuplicateGroup = false;

                                //[squarePos, adjPos].forEach(position => {
                                this.board.getAdjacentSquares(squarePos).forEach(position => {
                                    //If the groups for this square are empty, stop now.
                                    if (groups[posToStr(position)] == undefined) {
                                        return;
                                    }

                                    groups[posToStr(position)].forEach(group => {
                                        //TODO working here.
                                        let couldBeDuplicate = true;

                                        for (let i = 0; i < group.positions.length; i++) {
                                            let positionInOtherGroup = true;

                                            for (let j = 0; j < newGroup.positions.length; j++) {
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
            this.getUsefulSquares().forEach(groupSquarePosition => {
                const pos = posToStr(groupSquarePosition);

                //Make sure that there exist groupsToAdd at this position
                if (groupsToAdd[pos] != undefined) {
                    if (groups[pos] == undefined) {
                        groups[pos] = [];
                    }

                    groups[pos] = groups[pos].concat(groupsToAdd[pos]);
                }
            });
            
        }

        //Get groups from moves
        this.board.allSquares.forEach((square) => {
            groups[posToStr(square)].forEach((group) => {
                const numMines = group.numMines;
                let moveType: MoveType;

                if (numMines.min === numMines.max && numMines.max === 0) {
                    moveType = MoveType.reveal;
                } else if (numMines.min === numMines.max && numMines.max === group.positions.length) {
                    moveType = MoveType.flag;
                }

                if (moveType) {
                    group.positions.forEach(position => {
                        const newMove: Move = {pos: position, type: moveType};
                        newMoves.push(newMove);
                    })
                    
                }
            })
        })

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

}