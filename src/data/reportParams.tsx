export type GameData = {
    file: File,
    game: string,
    show: boolean,
    total: string,
    hits: string,
    drawOrArea: string,
    tables: string [][][]
}

export type AssociateData = {
    area: string,
    gameData?: GameData[] | null
}


export const SheetNameMap: Record<string, string> = {
    "EDDIE BOY": "A:D",
    "M3 EXCESS REPORT": "B1:E24",
    "M3 OVERALL REPORT": "B1:E19",
    "MATI": "B:D",
    "PJ": "D:H",
    "MORTAR": "D:H"
}

export const GameSet: Record<string, string> = {
    "Last 2": "SIM 1",
    "Swertres": "SIM 2",
    "Last 3": "SIM 2",
    "4 Digit": "SIM 3"
}

export const DrawSet: Record<string, string> = {
    "2-PM": "1",
    "5-PM": "2",
    "9-PM": "3"
}

export type SheetData = {
    name: string,
    data: string [][]
}