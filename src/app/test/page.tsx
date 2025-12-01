'use client';

import { useState } from 'react';

interface RowUpdate {
  row: number;
  values: (string | number)[];
}

export default function TestPage() {
  // const [data, setData] = useState<any>(null);
  // const [error, setError] = useState<string | null>(null);
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
    // const sheetId = '17TI4KhMeDYBo1fW3PGEY3mvaC3k4d_L23_y38RRNOyo';
    // const sheetName = 'Sheet1';
    // const res = await fetch(`/api/update-sheet?sheetId=${sheetId}&sheetName=${sheetName}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ updates }),
    // });
  };

  // const [cellValue, setCellValue] = useState<string | null>(null);

  const handleGetValue = async () => {
      // try {
      //   const sheetId = '17TI4KhMeDYBo1fW3PGEY3mvaC3k4d_L23_y38RRNOyo';
      //   const sheetName = 'Sheet1';

      //   const res = await fetch(`/api/get-cell?sheetId=${sheetId}&sheetName=${sheetName}`);
      //   const json = await res.json();

      //   setCellValue(json.value ?? 'No value found');
      //   if (res.ok) {
      //     setData(json.value);
      //   } else {
      //     setError(json.error || 'Failed to fetch data');
      //   }
      // } catch (err) {
      //   setError((err as Error).message);
      // }
  };
  
  const [sheets, setSheets] = useState<Sheet[]>([]);

  const handleGetSheets = async () => {
    const res = await fetch('/api/get-sheets');
    const result = await res.json();
    setSheets(result.sheets || []);
  };

  return (
    <div>
      <h1>Update Multiple Rows Dynamically</h1>



        
    <div className='mt-4'>
      <h1>All Sheets in Spreadsheet</h1>
      <button className='bg-blue-500 px-3 text-white' onClick={handleGetSheets}>Load Sheets</button>

      <ul>
      </ul>
    </div>
    </div>
  );
}
