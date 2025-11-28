'use client';

import { useEffect, useState } from 'react';

interface RowUpdate {
  row: number;
  values: (string | number)[];
}

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<RowUpdate[]>([
    { row: 1, values: ['Hello', 123] },
    { row: 4, values: ['World', 456] },
    { row: 5, values: ['Argie', 456] },
  ]);

  // Update a row value (simple example)
  const handleChangeRowValue = (index: number, value: string) => {
    const updated = [...updates];
    updated[index].values = value.split(',');
    setUpdates(updated);
  };

  const handleUpdate = async () => {
    const sheetId = '17TI4KhMeDYBo1fW3PGEY3mvaC3k4d_L23_y38RRNOyo';
    const sheetName = 'Sheet1';
    const res = await fetch(`/api/update-sheet?sheetId=${sheetId}&sheetName=${sheetName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
  };

  const [cellValue, setCellValue] = useState<string | null>(null);

  const handleGetValue = async () => {
      try {
        const sheetId = '17TI4KhMeDYBo1fW3PGEY3mvaC3k4d_L23_y38RRNOyo';
        const sheetName = 'Sheet1';

        const res = await fetch(`/api/get-cell?sheetId=${sheetId}&sheetName=${sheetName}`);
        const json = await res.json();

        setCellValue(json.value ?? 'No value found');
        if (res.ok) {
          setData(json.value);
        } else {
          setError(json.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError((err as Error).message);
      }
  };
  
  const [sheets, setSheets] = useState<any[]>([]);

  const handleGetSheets = async () => {
    const res = await fetch('/api/get-sheets');
    const result = await res.json();
    setSheets(result.sheets || []);
  };

  return (
    <div>
      <h1>Update Multiple Rows Dynamically</h1>

      {updates.map((update, idx) => (
        <div key={idx} style={{ marginBottom: 10 }}>
          <label>
            Row:
            <input
              type="number"
              value={update.row}
              min={1}
              onChange={(e) => {
                const rowNum = Number(e.target.value);
                setUpdates((prev) => {
                  const copy = [...prev];
                  copy[idx].row = rowNum;
                  return copy;
                });
              }}
            />
          </label>

          <label>
            Values (comma separated):
            <input
              type="text"
              value={update.values.join(',')}
              onChange={(e) => handleChangeRowValue(idx, e.target.value)}
            />
          </label>
        </div>
      ))}

      <button className="bg-blue-500 px-3 text-white" onClick={handleUpdate}>Update Rows</button>


        <div className='mt-4'>
        <h1>Read Cell from Google Sheet</h1>
        <button className='bg-blue-500 px-3 text-white' onClick={handleGetValue}>Get Value from B3</button>
        {cellValue && <p>Value in B3: {cellValue}</p>}
        </div>


        
    <div className='mt-4'>
      <h1>All Sheets in Spreadsheet</h1>
      <button className='bg-blue-500 px-3 text-white' onClick={handleGetSheets}>Load Sheets</button>

      <ul>
        {sheets.map((sheet, index) => (
          <li key={index}>
            {sheet.title} (ID: {sheet.sheetId}, Rows: {sheet.rowCount}, Cols: {sheet.columnCount})
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}
