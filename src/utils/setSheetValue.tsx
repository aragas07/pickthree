import { AssociateData, SheetData } from "@/data/reportParams";
import { GameSet, DrawSet } from "@/data/reportParams";

export async function setSheetValue(
    sheetData: SheetData[],
    params: AssociateData[]
): Promise<SheetData[]> {
    const allSheetData: SheetData[] = []
    const normalizeTime = (str: string) => {
        return str
            .toLowerCase()
            .replace(/\s+/g, "")     // remove spaces
            .replace(/[\-]/g, "")   // remove : and -
    }
    function googleTimeToHHMMSS(value: string | number | null | undefined): string | number | null | undefined {
        if (value === null || value === undefined) return value;
        // Already a number
        if (typeof value === "number") {
            const totalSeconds = Math.round(Number(value) * 24 * 60 * 60);
            const h = Math.floor(totalSeconds / 3600);
            const ampm = h >= 12 ? "PM" : "AM" 
            let hour = Number(h)
            hour = hour % 12 || 12;
            return `${hour}:00${ampm}`;
        }

        // If not numeric string, return as-is
        if (value.trim() === "" || isNaN(Number(value))) return value;

    }
    for (const sheet of sheetData) {
        for (const assoc of params) {
            if (assoc.area === sheet.name) {
                const sheetCurrentData: SheetData = { name: sheet.name, data: [] }
                let fileIndex = 0
                for (const filedata of assoc.gameData ?? []) {
                    let belong = false
                    let i = 0
                    let hitsPosition = 10
                    const tableData: string[][] = sheetCurrentData.data ?? []
                    let rowLength = 0
                    for (const row of sheet.data) {
                        if (rowLength <= row.length)
                            rowLength = row.length
                        let j = 0
                        let isGame = false
                        if (fileIndex === 0)
                            tableData.push([])
                        if (['EDDIE BOY', 'M3 EXCESS REPORT', 'M3 OVERALL REPORT', 'MATI'].includes(sheet.name)) {
                            for (let count = 0; count < rowLength; count++) {
                                let colData = ''
                                if (isGame && hitsPosition === j) {
                                    isGame = false
                                    colData = filedata.hits
                                } else if (isGame && belong) {
                                    belong = false
                                    colData = filedata.total
                                } else if (belong && row[count] !== '' && (filedata.game.replace(/\s+/g, "").includes(row[count]?.toString().replace("*", "")) || row[count]?.toString().replace("*", "").includes(filedata.game.replace(/\s+/g, "")))) {
                                    isGame = true
                                    colData = tableData[i][j] !== undefined ? tableData[i][j] : row[count]
                                } else {
                                    colData = tableData[i][j] !== undefined ? tableData[i][j] : row[count]
                                }
                                tableData[i][j] = colData
                                if (row[count]?.toString().includes(normalizeTime(filedata.drawOrArea).toUpperCase())) {
                                    belong = true
                                } else if (row[count]?.toString().includes(filedata.drawOrArea)) {
                                    belong = true
                                } else if (googleTimeToHHMMSS(row[count])?.toString().trim() === normalizeTime(filedata.drawOrArea).toUpperCase()) {
                                    belong = true
                                }
                                if (row[count]?.toString().match(/(hits)/i)) {
                                    hitsPosition = j
                                }
                                j++
                            }
                        } else {
                            for (let count = 0; count < rowLength; count++) {
                                let colData = ''
                                if (isGame && hitsPosition === j) {
                                    isGame = false
                                    colData = filedata.hits
                                } else if (belong && isGame) {
                                    belong = false
                                    colData = filedata.total
                                } else {
                                    colData = tableData[i][j] !== undefined ? tableData[i][j] : row[count]
                                }
                                console.log(row[count], GameSet[filedata.game],row[count]?.toString().includes(GameSet[filedata.game]), belong, isGame, DrawSet[filedata.drawOrArea])
                                tableData[i][j] = colData
                                if (row[count]?.toString().includes(GameSet[filedata.game])) {
                                    belong = true
                                }
                                
                                if(belong && row[count]?.toString() === DrawSet[filedata.drawOrArea]) {
                                    isGame = true
                                }
                                if (row[count]?.toString().match(/(u.h)/i)) {
                                    hitsPosition = j
                                }
                                j++
                            }

                        }
                        i++
                    }
                    fileIndex++
                }
                allSheetData.push(sheetCurrentData)
            }
        }
    }

    return allSheetData;
}
