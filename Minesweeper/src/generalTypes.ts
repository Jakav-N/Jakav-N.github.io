//For types that are used in multiple files


export type Position = {x: number, y: number};

export function makePosition (x: number, y: number) {
    return {x: x, y: y}
}

export enum SquareInfo {
    mine = -1,
    unknown = -2,
}