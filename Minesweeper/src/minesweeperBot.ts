import {Position, SquareInfo} from "./generalTypes"
import {Board} from "./minesweeperGame"
import MinesweeperGame from "./minesweeperGame"


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

            //TODO: Explanation of logic
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

}