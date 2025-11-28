'use client';
import React, { useState, useEffect, useRef } from 'react';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

type Props = {
  file: File;
  combination: string,
  className: string,
};

const ReportPDFReader: React.FC<Props> = ({ file, combination, className }) => {
  const [textContent, setTextContent] = useState('');
  const [total, setTotal] = useState<number>(0.0);
  const [tables, setTables] = useState<string[][][]>([]);
  const [gross, setGross] = useState<string>();
  const [files, setFiles] = useState<File[][]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const ran = useRef(false);
  useEffect(() => {
    console.log("useeffect")
    if(file) {
      processFile(file);
    }
  }, [file]);
  
  // Utility to process each file
  const processFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import("pdfjs-dist");

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
          if(text.toLowerCase().includes('total') && text.toLowerCase().includes(':')) {
            
          const numberStr = text.replace(/[^\d.,]/g, '')
          }
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
    setLines(allLines);
    setTables(detectedTables);
  };

  // Match logic (can be improved as needed)
  const matchHits = (linesToCheck: string[], combination: string) => {
    const newPermutations = [[...combination]]; // You'll want actual permutations if needed
    const flatPerms = newPermutations.map((p) => p.join('').replace(/\s+/g, ''));
    const newHits: string[] = [];
    let matchedTotal = 0;

    for (let i = 0; i < linesToCheck.length; i++) {
      const line = linesToCheck[i].replace(/\s+/g, '');
      if (flatPerms.includes(line)) {
        const nextLine = linesToCheck[i + 2] ?? '0';
        newHits.push(`${linesToCheck[i]} = ${linesToCheck[i + 1]} ${nextLine}`);
        matchedTotal += parseFloat(nextLine);
      }
    }

    setTotal((prevTotal) => prevTotal + matchedTotal);
    if (newHits.length == 0) {
      setTextContent((prev) => prev + '\nNo Winning Hits in one file!');
    } else {
      setTextContent((prev) => prev + '\n' + newHits.join('\n'));
    }
  };

  return (
    <div className={className}>

      {/* Results */}
      <h2 className="font-bold mt-4">Total hits: ₱ {total.toFixed(2)}</h2>
      <pre className="bg-blue-50 dark:bg-sky-950 text-gray-900 dark:text-gray-100 p-3 rounded">
        {textContent || "Unit Hits."}
      </pre>

      {/* Display extracted tables */}
      {tables.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-lg mb-2">Extracted Tables</h2>
          <div className="grid table-grid gap-8">
            {tables.map((table, idx) => (
              <table key={idx} border={1} className="mb-8">
                <tbody>
                  {table.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => {
                        const isMatch =
                          cell.replace(/\s+/g, "") === combination.replace(/\s+/g, "");
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
  );
};

export default ReportPDFReader;
