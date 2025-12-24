'use client'
import Spinner from '@/components/spinner'
import { date, day, sleep } from '@/utils/utils'
import { SheetNameMap, AssociateData, GameData, SheetData, Mati, Eddieboy } from '@/data/reportParams'
import React, { useState, useCallback, DragEvent, ChangeEvent, useRef, useEffect } from 'react'
import { RiErrorWarningFill } from "react-icons/ri"
import { ImUpload2 } from "react-icons/im"
import { IoClose } from "react-icons/io5"
import { TiArrowSortedDown } from "react-icons/ti"
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import Link from 'next/link'
import { setSheetValue } from '@/utils/setSheetValue'
import { ItemCard } from './itemCard'
import { toast, Toaster } from 'react-hot-toast'
import Image from "next/image"
import SixColumnInput from '@/components/SixColumnInput'
import { pj, edieboy, other } from './hitting'

export default function Report() {
    const [hasContent, setHasContent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploadFileLoading, setUploadFileLoading] = useState(false)
    const [sheetID, setSheetID] = useState('')
    const [sheets, setSheets] = useState<string[]>([])
    const [activeSheet, setActiveSheet] = useState(0)
    const [data, setData] = useState<SheetData[]>([])
    const [params, setParams] = useState<AssociateData[]>([])
    const [draw, setDraw] = useState('')
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [fourD, setFourD] = useState('')
    const [threeD, setThreeD] = useState('')
    const [twoD, setTwoD] = useState('')
    const [hitsTrigger, setHitsTrigger] = useState(0)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [inputValues, setInputValues] = useState<string[]>(Array(6).fill(''))
    const [pickThreeTitle, setPickThreeTitle] = useState("")


    const handleGetSheets = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true)
        const array = (e.target.value).split("/")
        getSheets(array[5])
        setSheetID(array[5])
        setHasContent(true)
    }

    const getSheets = async (googleId: string) => {
        if (googleId.length > 20) {
            const res = await fetch(`/api/get-sheets?sheetId=${googleId}`)
            const result = await res.json()
            setSheets(result.sheets || [])
            if (res.status != 500)
                getAllSheet(googleId)
            else {
                setLoading(false)
                if (result.error) {
                    setError(result.error)
                }
            }
        }
        setPickThreeTitle(sheets[activeSheet] === "MATI" ? Mati[day()] : Eddieboy[day()])
        timeDraw()
        console.log(day() !== 'Sunday' && draw === '9pm')
        console.log(`${draw}`)
    }

    const getAllSheet = async (sheetId: string) => {
        for (const key of Object.keys(SheetNameMap)) {
            const limit = SheetNameMap[key];
            const res = await fetch(`/api/get-cell?sheetId=${sheetId}&sheetName=${key}!${limit}`)
            const result = await res.json()
            setLoading(false)
            setData(prev => [...prev, { name: key, data: result.value }])
            if (params.length === 0) {
                setParams(prev => [...prev, { area: key, gameData: null }])
            }
        }
        if (params !== null) {
            setParams(prev => prev.map(({ gameData, ...rest }) => rest))
        }
    }

    const timeDraw = () => {
        if (date() < 14) setDraw('2pm')
        else if (date() < 17) setDraw('5pm')
        else setDraw('9pm')
    }

    const clear = () => {
        timeDraw()
        setTwoD("")
        setThreeD("")
        setFourD("")
        getSheets(sheetID)
    }

    const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault() // Necessary to allow drop
    }

    const handleDrop = useCallback((e: DragEvent<HTMLLabelElement>, sheetName: string) => {
        e.preventDefault()
        processFile(Array.from(e.dataTransfer.files), sheetName)
    }, [])

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, sheetName: string) => {
        processFile(e.target.files ? Array.from(e.target.files) : [], sheetName)
    }

    const processFile = useCallback(async (files: File[], sheetName: string) => {
        setUploadFileLoading(true)
        const paramArray: GameData[] = []
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer()
            const pdfjsLib = await import("pdfjs-dist")
            let total: string = ''
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                "pdfjs-dist/build/pdf.worker.min.mjs",
                import.meta.url
            ).toString()

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
            const pdf = await loadingTask.promise

            const detectedTables: string[][][] = []
            const allLines: string[] = []
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const content = await page.getTextContent()
                const pageText = content.items as TextItem[]

                const rows: string[][] = []
                let currentRow: string[] = []
                let lastY: number | null = null

                for (const item of pageText) {
                    const text = item.str.trim()
                    if (!text) continue

                    const y = item.transform[5]
                    // Group rows
                    if (lastY === null || Math.abs(y - lastY) < 5) {
                        currentRow.push(text)
                    } else {
                        if (currentRow.length > 1) {
                            rows.push(currentRow)
                        }
                        currentRow = [text]
                    }

                    allLines.push(text)
                    lastY = y
                }

                if (currentRow.length > 1) {
                    rows.push(currentRow)
                }

                if (rows.length > 0) {
                    detectedTables.push(rows)
                }
            }
            const allText = allLines.join(" ")
            const match = allText.match(/(grand\s*total|total\s*amount)\s*[:\-]?\s*(₱|P)?\s*([\d,]+\.\d{2})/i)
            const game = allText.match(/(2D[1-3]|3D[1-3]|EZ2[1-3]|4DN|LST3|SWR2|S[2-4]|P3N|P3|last\s*[2-4]|[2-4]\s*digit|swertres)/i)
            const drawOrArea = allText.match(/([2-9]PM|[2-9]-PM|[2-9]:00\s*PM|central|d11)/i)
            total = match ? match[3] : '0'
            paramArray.push({ file, game: game ? game[0].trimStart() : '', show: true, total, hits: '0', drawOrArea: drawOrArea ? drawOrArea[0] : '', tables: detectedTables })
        }
        setParams(prev =>
            prev.map(group =>
                group.area !== sheetName
                    ? group
                    : { area: group.area, gameData: group.gameData === null ? [...paramArray] : [...group.gameData ?? [], ...paramArray] }
            )
        )
        setUploadFileLoading(false)
    }, [])


    const handleRemove = (indexToRemove: number, sheetName: string) => {
        setParams(prev => prev.map(item => item.area === sheetName ? {
            ...item,
            gameData: item.gameData?.filter((_, idx) => idx !== indexToRemove)
        }
            : item))
    }

    const changeActiveSheet = (index: number) => {
        setActiveSheet(index)
        setPickThreeTitle(sheets[index] === "MATI" ? Mati[day()] : Eddieboy[day()])
    }

    const displayFunction = (fileIndex: number, sheetName: string) => {
        setParams(prev =>
            prev.map(group =>
                group.area !== sheetName
                    ? group
                    : { ...group, gameData: group.gameData?.map((item, index) => index === fileIndex ? { ...item, show: !item.show } : item) }
            )
        )
    }
    const findHits = async () => {
        setSubmitting(true)
        await sleep(1000)
        setParams(prev =>
            prev.map(group =>
            ({
                ...group,
                gameData: group.gameData?.map((item) => {
                    item.hits = '0'
                    const EZ2 = item.game.match(/(EZ2[1-3])/i)
                    const SWR2 = item.game.match(/(SWR2)/i)
                    const LST3 = item.game.match(/(LST3)/i)
                    if (item.game === 'P3N') {

                    } else if (item.game == 'P3') {

                    }
                    else {
                        for (let i = 0; i < item.tables.length; i++) {
                            const tableGroup = item.tables[i]
                            for (let j = 0; j < tableGroup.length; j++) {
                                const table = tableGroup[j]
                                for (let k = 0; k < table.length; k++) {
                                    const hits = item.tables[i][j][k + 1] === '₱' ? item.tables[i][j][k + 2] : item.tables[i][j][k + 1]
                                    if (EZ2) {
                                        if (twoD === table[k])
                                            item.hits = hits
                                    } else if (SWR2) {
                                        if (threeD.substring(1) === table[k])
                                            item.hits = hits
                                    } else if (LST3) {
                                        if (fourD.slice(-3) === table[k])
                                            item.hits = hits
                                    } else {
                                        if (draw === '9pm' && day() !== 'Sunday') {
                                            const fourAndTwoD = fourD.slice(-4) === table[k] || fourD.slice(-2) === table[k]
                                            console.log(`${table[k]} ${table[k].length}`)
                                            if (sheets[activeSheet] === 'PJ' && pj(fourD, table[k], item.game)) {
                                                item.hits = hits
                                            } else if (sheets[activeSheet] === 'EDDIE BOY' && edieboy(fourD, threeD, twoD, table[k], item.game)) {
                                                item.hits = hits
                                            } else if (sheets[activeSheet] !== 'PJ' && other(fourD, threeD, table[k])) {
                                                item.hits = hits
                                            }
                                        } else {
                                            if (threeD === table[k] || threeD.substring(1) === table[k] || fourD.slice(-4) === table[k]) {
                                                item.hits = hits
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    return item
                })
            })
            )
        )
        setHitsTrigger(prev => prev + 1)
    }

    useEffect(() => {
        loadData()
    }, [hitsTrigger])

    async function loadData() {
        const result = await setSheetValue(data, params)
        for (const value of result) {
            const sheetRange = SheetNameMap[value.name]
            const res = await fetch(`/api/update-sheet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spreadsheetId: sheetID,
                    sheetName: `${value.name}!${sheetRange}`,
                    value: value.data
                })
            });
            if (res.status !== 500) {
                for (const par of params)
                    if (par.gameData !== undefined && par.area === value.name) {
                        toast.success(`${value.name} has been filled up!`)
                    }
            }
        }
        setSubmitting(false)
    }


    return (
        <main className="p-4 flex flex-col min-h-screen max-w-full mx-auto">
            <Toaster position="bottom-right" />
            <header className="w-full flex pb-4">
                <Link href="/" className="absolute top-1 right-4 px-4 py-0.5 rounded-md border-2 border-gray-500 hover:bg-gray-500 transition hover:text-white">P3 Finder</Link>
                <input
                    type="text"
                    placeholder="Enter Google Sheet ID"
                    className="border rounded-sm py-1 px-3 mx-auto w-5/12 border-gray-500"
                    onChange={handleGetSheets}
                />
            </header>

            <main className={`flex-grow overflow-y-auto items-center justify-center ${data.length == 0 ? 'flex' : ''}`}>
                {loading ?
                    <div className="content-center">
                        <h1 className='text-4xl'>Loading</h1>
                        <Spinner />
                    </div> :
                    hasContent ?
                        sheets.length != 0 ?
                            <div className='p-4'>
                                <div className="w-fit mx-auto">
                                    <div className='flex gap-4'>
                                        <div className="grid">
                                            <label className="mb-2">Draw</label>
                                            <select
                                                className="w-full px-3 py-2.5 border border-gray-500 rounded-sm text-m rounded-base"
                                                value={draw}
                                                onChange={it => setDraw(it.target.value)}
                                            >
                                                <option value="2pm">1st Draw</option>
                                                <option value="5pm">2nd Draw</option>
                                                <option value="9pm">3rd Draw</option>
                                            </select>
                                        </div>
                                        <div hidden={draw !== '9pm'} className='grid'>
                                            <label>6D / 4D</label>
                                            <input
                                                type="text"
                                                className="border rounded-sm py-1 px-3 border-gray-500"
                                                value={fourD}
                                                onChange={it => setFourD(it.target.value)}
                                            />
                                        </div>
                                        <div className='grid'>
                                            <label>3D</label>
                                            <input
                                                type="text"
                                                className="border rounded-sm py-1 px-3 border-gray-500"
                                                value={threeD}
                                                onChange={it => setThreeD(it.target.value)}
                                            />
                                        </div>
                                        <div className='grid'>
                                            <label>EZ2 (2D)</label>
                                            <input
                                                type="text"
                                                className="border rounded-sm py-1 px-3 border-gray-500"
                                                value={twoD}
                                                onChange={it => setTwoD(it.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {/* {sheets[activeSheet] === 'MATI' || sheets[activeSheet] === 'EDDIE BOY' ?
                                        <div className="grid justify-center mt-4">
                                            <label>Input {pickThreeTitle}</label>
                                            <SixColumnInput values={inputValues} onChange={setInputValues} />
                                        </div> : null
                                    } */}
                                    <div className="flex justify-between">
                                        {submitting ? <Image className="ml-4" src="loading.svg" color='#444' alt="Spinner" width={24} height={24} /> :
                                            <button type="button" onClick={findHits} className="text-white w-fit bg-blue-700 hover:bg-blue800 px-8 py-1.5 mt-4 rounded-lg">Submit</button>
                                        }
                                        <button type="button" onClick={clear} className="bg-amber-400 px-8 mt-4 py-1.5 text-white rounded-lg dark:text-black">Clear</button>
                                    </div>
                                </div>
                                <div className='flex'>
                                    {sheets.map((sheet, index) => (
                                        <div key={index} className='px-3 py-4'>
                                            <a onClick={() => changeActiveSheet(index)} className={` hover:bg-blue-100 hover:dark:bg-blue-950 py-2 px-6 rounded-2xl ${index === activeSheet ? 'bg-blue-700 text-white' : ''} cursor-default`}>{sheet}</a>
                                        </div>
                                    ))}
                                </div>
                                {sheets.map((sheet, index) => (
                                    index === activeSheet ?
                                        <div key={index} className="grid p-4">
                                            <label
                                                onDrop={(data) => handleDrop(data, sheet)}
                                                onDragOver={handleDragOver}
                                                onClick={() => inputRefs.current[index]?.click()}
                                                className='border-2 border-dashed p-16 rounded-2xl hover:bg-gray-100 bg-gray-50 hover:dark:bg-gray-900 dark:bg-gray-950'
                                            >
                                                {uploadFileLoading ? <Spinner /> : <div className="justify-center text-center font-semibold text-gray-800 dark:text-gray-100">
                                                    <ImUpload2 className='mx-auto mb-2' size='36' />
                                                    <p>Drag & Drop to Upload multiple file</p>
                                                    <p>Or</p>
                                                    <p>Browse</p>
                                                </div>}
                                            </label>
                                            <div>
                                                <input
                                                    hidden
                                                    type="file"
                                                    multiple
                                                    ref={(el) => { inputRefs.current[index] = el }}
                                                    accept=".pdf"
                                                    onChange={(data) => handleFileSelect(data, sheet)}
                                                    className="w-full mb-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-100"
                                                />
                                                <div className="mb-4">
                                                    <div className="list-inside text-sm list-none">
                                                        {params.map((group, groupIndex) => (
                                                            <ul key={groupIndex} hidden={group.area !== sheet}>
                                                                {group.gameData?.map((item, fileIndex) => (
                                                                    <li
                                                                        key={fileIndex}
                                                                        className="group border p-4 rounded-lg bg-gray-50 dark:bg-gray-950 mt-4 transition-all"
                                                                    >
                                                                        <div className='grid'>
                                                                            <div className='m-1 cursor-pointer flex items-center justify-between'>
                                                                                <h1 className="font-bold" onClick={() => { displayFunction(fileIndex, group.area) }}>{`${item.game} ( ${item.drawOrArea} )`}</h1>
                                                                                <div>
                                                                                    <TiArrowSortedDown className={`group-hover:inline text-xl hidden transition ${item.show ? 'rotate-180' : ''}`} onClick={() => { displayFunction(fileIndex, sheet) }} />
                                                                                    <IoClose
                                                                                        onClick={() => handleRemove(fileIndex, group.area)}
                                                                                        className="ml-3 group-hover:inline hidden text-xl hover:bg-gray-500 rounded-2xl hover:text-white transition duration-200 cursor-pointer"
                                                                                    />
                                                                                    <div hidden={item.show ? false : true} className="group-hover:hidden inline">
                                                                                        <div className="flex space-x-8 font-semibold">
                                                                                            <p>Total amount : ₱ {item.total}</p>
                                                                                            <p>Hits : ₱ {item.hits}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {item.show ?
                                                                                <></> :
                                                                                <ItemCard item={item} twoD={twoD} threeD={threeD} fourD={fourD} sheet={sheets[activeSheet]} draw={draw} />
                                                                            }
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div> : null
                                ))}
                            </div> :
                            <div>
                                <RiErrorWarningFill size="120" className='mx-auto mb-4' />
                                <h1 className='text-2xl'>{error || 'Invalid Google Sheet ID'}</h1>
                            </div> :
                        <div>
                            <h1 className="text-6xl">No Google Sheet</h1>
                        </div>
                }
            </main>
        </main>
    )
}


