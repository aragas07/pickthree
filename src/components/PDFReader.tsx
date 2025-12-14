'use client';
import React, { useState, useEffect } from 'react';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
type Props = {
  permutations: string[][];
};

const PDFReader: React.FC<Props>= ({permutations}) => {
  const [textContent, setTextContent] = useState('');
  const [total, setTotal] = useState<number>(0.00);
  const [tables, setTables] = useState<string[][][]>([]);
  const [lines] = useState<string[]>([]);
  const [gross, setGross] = useState('');
  useEffect(() => {
    if (lines.length > 0 && permutations.length > 0) {
      matchHits(lines, permutations);
    }
  }, [lines, permutations]);
  
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');

    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
    ).toString();

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const detectedTables: string[][][] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const pageTextItems = content.items as TextItem[];
      const rows: string[][] = [];

      let currentRow: string[] = [];
      let lastY: number | null = null;

      for (const item of pageTextItems) {
        const text = item.str.trim();
        if(text.length != 0) {
          const y = item.transform[5]; // Y coordinate
          // Group items that are on the same line (same Y)
          if (lastY === null || Math.abs(y - lastY) < 5) {
            currentRow.push(text);
          } else {
            if (currentRow.length > 1) {
              if(currentRow[0] != "CENTRAL" && currentRow[0] != "Grand" && currentRow[0] != "Draw")
                rows.push(currentRow);
            }
            currentRow = [text];
          }

          lastY = y;
          lines.push(text);
        }
      }

      // Add the last row if it's likely a table row
      if (currentRow.length > 1) {
        rows.push(currentRow);
      }
      if (rows.length > 0) {
        detectedTables.push(rows);
      }
    }

    const allText = lines.join(" ")
    const match = allText.match(/(grand\s*total|total\s*amount)\s*[:\-]?\s*(₱|P)?\s*([\d,]+\.\d{2})/i)
    setGross(match ? match[3] : '0')
    console.log(match)
    setTables(detectedTables);
  };
  const matchHits = (linesToCheck: string[], newPermutations: string[][]) => {
    const flatPerms = newPermutations.map(p => p.join('').replace(/\s+/g, ''));
    const newHits: string[] = [];
    let total = 0

    for (let i = 0; i < linesToCheck.length; i++) {
      const line = linesToCheck[i].replace(/\s+/g, '');
      if (flatPerms.includes(line)) {
        newHits.push(`${linesToCheck[i]} = ${linesToCheck[i + 1]} ${linesToCheck[i + 2]}`);
        total += parseFloat(linesToCheck[i + 2]);
      }
    }
    setTotal(total)
    if(newHits.length == 0)
      setTextContent("No Winning Hits!");
    else
      setTextContent(newHits.join('\n'));
  };

  return (
    <div>
      <input
        id="file_input"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="w-full text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-100"
      />
      {/* Display plain text */}
      <h2 className="mt-8 font-bold">Total hits: ₱ {total.toFixed(2)}</h2>
      <pre className="bg-blue-50 dark:bg-sky-950 text-gray-950 dark:text-gray-100 p-3 rounded-b-md">
        {textContent || 'Unit Hits.'}
      </pre>

      {/* Display extracted tables */}
      {tables.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-lg mb-2">Grand Total : {gross}</h2>
          <div className="grid table-grid gap-8">
            {tables.map((table, idx) => (
              <table key={idx} border={1} className='mb-8'>
                <tbody>
                  {table.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #ccc',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                          }}
                          className={permutations.map(p => p.join('')).includes(cell.replace(/\s+/g, '')) ? 'bg-black text-white dark:bg-neutral-500 ' : ''}
                        >
                          {cell}
                        </td>
                      ))}
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

export default PDFReader;
