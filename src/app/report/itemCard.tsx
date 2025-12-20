import { GameData } from "@/data/reportParams"
import React from "react"
type Props = {
    item: GameData;
    twoD: string;
    threeD: string;
    fourD: string;
    sheet: string;
    draw: string
}
export const ItemCard: React.FC<Props> = ({item, twoD, threeD, fourD, sheet, draw}) => {
    return (
        <>
            <h1 className="font-bold text-lg mt-4">Total hits: ₱ {item.hits}</h1>

            {item.tables.length > 0 && (
                <div className="mt-4">
                    <h2 className="font-bold text-lg mb-2">Grand Total: ₱ {item.total}</h2>
                    <div className="grid table-grid gap-8">
                        {item.tables.map((table, idx) => (
                            <table key={idx} border={1} className="mb-8">
                                <tbody>
                                    {table.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                            {row.map((cell, cIdx) => {
                                                const LST3 = item.game.match(/(LST3)/i)
                                                const SWR2 = item.game.match(/(SWR2)/i)
                                                const isEZgame = item.game.match(/(EZ2[1-3])/i)
                                                const threeMatch = threeD === cell
                                                const fourAndTwoD = fourD.slice(-4) === cell || fourD.slice(-2) === cell
                                                const isMatch = isEZgame ? twoD === cell ? true : false :
                                                    SWR2 ? threeD.substring(1) === cell ? true : false :
                                                        LST3 ? fourD.slice(-3) === cell ? true : false : draw === '9pm' ?
                                                            sheet === 'PJ' && (fourAndTwoD || fourD.slice(-3) === cell) ?
                                                                true : fourAndTwoD || threeMatch ?
                                                                    true : false :
                                                            threeD.substring(1) === cell || threeMatch || fourD.slice(-4) === cell
                                                return (
                                                    <td
                                                        key={cIdx}
                                                        className={isMatch
                                                            ? "bg-black text-white dark:bg-neutral-500"
                                                            : ""}
                                                        style={{
                                                            padding: "4px 8px",
                                                            border: "1px solid #ccc",
                                                            whiteSpace: "nowrap",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {cell}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}