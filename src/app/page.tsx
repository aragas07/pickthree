'use client';

import React, { useState } from 'react';
import SixColumnInput from '@/components/SixColumnInput';
import { getPermutationsOfLength } from '@/utils/permutations';
import PDFReader from '@/components/PDFReader';

export default function Home() {
  const [inputValues, setInputValues] = useState<string[]>(Array(6).fill(''));
  const [permutations, setPermutations] = useState<string[][]>([]);

  const handleGenerate = () => {
    // Filter out empty inputs
    const cleaned = inputValues.filter(val => val !== '');

    if (cleaned.length < 3) {
      alert('Please enter at least 3 values');
      return;
    }

    const result = getPermutationsOfLength(cleaned, 3);
    setPermutations(result);
    console.log(`Total permutations of length 3: ${permutations.length}`);
  
  };

  return (
    <main>
      <a href="/report"  className="absolute top-1 right-4 px-4 py-0.5 rounded-md border-2 border-gray-500 hover:bg-gray-500 transition hover:text-white">Report</a>
      <div className="w-full flex justify-center">
        <div className="w-fit">
          <h1 className='p-3 text-2xl font-bold w-full text-center'>Enter combinations</h1>
          <SixColumnInput values={inputValues} onChange={setInputValues} />
          <button type="button" className="text-white bg-blue-700 hover:bg-blue800 px-6 py-1.5 mt-4 rounded-lg" onClick={handleGenerate}>Find</button>
        </div>
      </div>
      <div className="mt-4 p-4">
        <PDFReader permutations={permutations}/>
      </div>
    </main>
  );
}
