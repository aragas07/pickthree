'use client';
import Spinner from '@/components/spinner';
import React, { useState, useCallback, DragEvent, ChangeEvent, useRef, useEffect } from 'react';
import { RiErrorWarningFill } from "react-icons/ri";
import { ImUpload2 } from "react-icons/im";
import { IoClose } from "react-icons/io5";
import { TiArrowSortedDown } from "react-icons/ti";
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

export default function Report() {
    const [hasContent, setHasContent] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploadFileLoading, setUploadFileLoading] = useState<boolean>(false);
    const [sheetID, setSheetID] = useState('');
    const [sheets, setSheets] = useState<any[]>([]);
    const [activeSheet, setActiveSheet] = useState<number>(0);
    const [data, setData] = useState<string[][]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [params, setParams] = useState<Parameter[][]>([]);
    const [draw, setDraw] = useState<string>();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleGetSheets = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setData([]);
        const array = (e.target.value).split("/");
        const googleId = array[5]
        if (googleId.length > 20) {
            setLoading(true);
            const res = await fetch(`/api/get-sheets?sheetId=${googleId}`);
            const result = await res.json();
            setSheets(result.sheets || []);
            setSheetID(googleId);
            setParams(Array.from({ length: result.sheets.length }, () => []))
            if (res.status != 500)
                getSheet(result.sheets[0], googleId);
            else {
                setLoading(false);
                setHasContent(true);
            }
        }
    };

    const getSheet = async (e: string, sheetId: string) => {
        const res = await fetch(`/api/get-cell?sheetId=${sheetId}&sheetName=${e}`);
        const result = await res.json();
        setLoading(false);
        setHasContent(true);
        setData(result.value);
    }

    const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault(); // Necessary to allow drop
    };

    const handleDrop = useCallback((e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setSelectedFiles(Array.from(e.dataTransfer.files));
    }, [params]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])
        handleUpdate(selectedFiles)
    };

    const processFile = async (files: File[]) => {
        setUploadFileLoading(true);
        let paramArray: Parameter[] = []; 
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = await import("pdfjs-dist");
            let total: string = '';
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                "pdfjs-dist/build/pdf.worker.min.mjs",
                import.meta.url
            ).toString();

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            const detectedTables: string[][][] = [];
            const allLines: string[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items as TextItem[];

                const rows: string[][] = [];
                let currentRow: string[] = [];
                let lastY: number | null = null;

                for (const item of pageText) {
                    const text = item.str.trim();
                    if (!text) continue;

                    const y = item.transform[5];
                    // Group rows
                    if (lastY === null || Math.abs(y - lastY) < 5) {
                        currentRow.push(text);
                    } else {
                        if (currentRow.length > 1) {
                            rows.push(currentRow);
                        }
                        currentRow = [text];
                    }

                    allLines.push(text);
                    lastY = y;
                }

                if (currentRow.length > 1) {
                    rows.push(currentRow);
                }

                if (rows.length > 0) {
                    detectedTables.push(rows);
                }
            }
            const allText = allLines.join(" ")
            const match = allText.match(
                /(grand\s*total|total\s*amount)\s*[:\-]?\s*(₱|P)?\s*([\d,]+\.\d{2})/i
            );
            total = match ? match[3] : '0';
            paramArray.push({file, show: true, total, hits: 0, tables: detectedTables})
        }
        setParams(prev => 
            prev.map((group, index) =>
                index !== activeSheet ? group : [...group, ...paramArray]
            )
        );
        setUploadFileLoading(false);
    }

    useEffect(() => {
        processFile(selectedFiles)            
    },[selectedFiles])

    const handleUpdate = async (files: File[]) => {
        const wholeData = data.map(data => {
            const joinText = data.join('|')
        }).join('!')
        files.forEach(file => {

        })
        // const res = await fetch(`/api/update-sheet?sheetId=${sheetID}&sheetName=${sheet}`, {
        // method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ }),
        // });
    };
    const handleRemove = (indexToRemove: number, arrayIndex: number) => {
        setParams(prev => prev.map((param, index) => index === arrayIndex ? param.filter((_, idx) => idx !== indexToRemove) : param))
    };

    const changeActiveSheet = (index: number) => {
        setActiveSheet(index);
        getSheet(sheets[index], sheetID);
    }

    const changeDraw = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDraw(e.target.value);
    }

    const displayFunction = (fileIndex: number, index: number) => {
        setParams(prev =>
            prev.map((group, i) => 
                i !== index ? group : group.map((value, j) => j === fileIndex ? {...value, show: !value.show} : value)
            )
        )
    }


    return (
        <main className="p-4 flex flex-col min-h-screen max-w-full mx-auto">
            <header className="w-full flex pb-4">
                <a href="/" className="absolute top-1 right-4 px-4 py-0.5 rounded-md border-2 border-gray-500 hover:bg-gray-500 transition hover:text-white">P3 Finder</a>
                <p hidden>15pJpi6hLjGjZH90m8gHZMfnIhKGDWZ8YwzUkpTM2NRk</p>
                <p>https://docs.google.com/spreadsheets/d/17TI4KhMeDYBo1fW3PGEY3mvaC3k4d_L23_y38RRNOyo/edit?gid=1219487365#gid=1219487365</p>
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
                        <Spinner/>
                    </div> :
                    hasContent ?
                        sheets.length != 0 ?
                            <div className='p-4'>
                                <div className='flex w-fit gap-4 mx-auto'>
                                    <div className="grid">
                                        <label>Draw</label>
                                        <select name="" onChange={changeDraw} className='border border-gray-500 rounded-sm px-4 py-1 h-fit'>
                                            <option value="1">1st Draw</option>
                                            <option value="2">2nd Draw</option>
                                            <option value="3">3rd Draw</option>
                                        </select>
                                    </div>
                                    <div className='grid'>
                                        <label>6D / 4D</label>
                                        <input
                                            type="text"
                                            className="border rounded-sm py-1 px-3 border-gray-500"
                                        />
                                    </div>
                                    <div className='grid'>
                                        <label>3D</label>
                                        <input
                                            type="text"
                                            className="border rounded-sm py-1 px-3 border-gray-500"
                                        />
                                    </div>
                                    <div className='grid'>
                                        <label>2D</label>
                                        <input
                                            type="text"
                                            className="border rounded-sm py-1 px-3 border-gray-500"
                                        />
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
                                    <div hidden={index !== activeSheet} onLoad={() => getSheet(sheet, sheetID)} key={index} className="grid p-4">
                                        <label
                                            onDrop={(data) => handleDrop(data)}
                                            onDragOver={handleDragOver}
                                            onClick={() => inputRefs.current[index]?.click()}
                                            className='border-2 border-dashed p-16 rounded-2xl hover:bg-gray-100 bg-gray-50 hover:dark:bg-gray-900 dark:bg-gray-950'
                                        >
                                            {uploadFileLoading ? <Spinner/>:<div className="justify-center text-center font-semibold text-gray-800 dark:text-gray-100">
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
                                                onChange={(data) => handleFileSelect(data)}
                                                className="w-full mb-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-100"
                                            />
                                            {params.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="list-inside text-sm list-none">
                                                        {params.map((group, groupIndex) => (
                                                            <ul key={groupIndex} hidden={groupIndex !== index}>
                                                                {group.map((item, fileIndex) => (
                                                                    <li
                                                                        key={fileIndex}
                                                                        className="group border p-4 rounded-lg bg-gray-50 dark:bg-gray-950 mt-4 transition-all"
                                                                    >
                                                                        <div className='grid'>
                                                                            <div className='m-1 cursor-pointer flex items-center justify-between'>
                                                                                <h1 className="font-bold">{item.file.name}</h1>
                                                                                <div>
                                                                                    <TiArrowSortedDown className={`group-hover:inline hidden transition ${item.show ? 'rotate-180' : ''}`} onClick={() => { displayFunction(fileIndex, index) }} />
                                                                                    <IoClose
                                                                                        onClick={() => handleRemove(fileIndex, index)}
                                                                                        className="ml-3 group-hover:inline hidden hover:bg-gray-500 rounded-2xl hover:text-white transition duration-200 cursor-pointer"
                                                                                    />
                                                                                    <div hidden={item.show? false : true} className="group-hover:hidden inline">
                                                                                        <div className="flex space-x-8 font-semibold">
                                                                                            <p>Total amount : ₱ {item.total}</p>
                                                                                            <p>Hits : ₱ {item.hits}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div hidden={item.show? true : false}>

                                                                                {/* Results */}
                                                                                <h2 className="font-bold mt-4">Total hits: ₱ </h2>
                                                                                <pre className="bg-blue-50 dark:bg-sky-950 text-gray-900 dark:text-gray-100 p-3 rounded">
                                                                                    {/* {"textContent" || "Unit Hits."} */} textContent
                                                                                </pre>

                                                                                {/* Display extracted tables */}
                                                                                {item.tables.length > 0 && (
                                                                                    <div className="mt-8">
                                                                                        <h2 className="font-bold text-lg mb-2">Extracted Tables</h2>
                                                                                        <div className="grid table-grid gap-8">
                                                                                            {item.tables.map((table, idx) => (
                                                                                                <table key={idx} border={1} className="mb-8">
                                                                                                    <tbody>
                                                                                                        {table.map((row, rIdx) => (
                                                                                                            <tr key={rIdx}>
                                                                                                                {row.map((cell, cIdx) => {
                                                                                                                    const isMatch = false;
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
                                                                                                                    );
                                                                                                                })}
                                                                                                            </tr>
                                                                                                        ))}
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* <table className="min-w-full border border-gray-300 rounded-lg shadow">
                                    <thead className="bg-blue-600 text-white">
                                    <tr>
                                        {data[0].map((header, i) => (
                                        <th key={i} className="px-4 py-2 text-left border border-gray-300">
                                            {header}
                                        </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data.slice(1).map((row, i) => (
                                        <tr key={i} className="hover:bg-blue-50">
                                        {row.map((cell, j) => (
                                            <td key={j} className="px-4 py-2 border border-gray-300">
                                            {cell}
                                            </td>
                                        ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table> */}
                                    </div>
                                ))}
                            </div> :
                            <div>
                                <RiErrorWarningFill size="120" className='mx-auto mb-4' />
                                <h1 className='text-2xl'>Invalid Google Sheet ID</h1>
                            </div> :
                        <div>
                            <h1 className="text-6xl">No Google Sheet</h1>
                        </div>
                }
            </main>
        </main>
    );
}


