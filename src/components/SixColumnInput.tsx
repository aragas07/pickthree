'use client'; // Required in Next.js App Router (if using App directory)

import React, { useRef } from 'react';

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
};

const SixColumnInput: React.FC<Props> = ({ values, onChange }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.slice(0, 2); // Limit to 2 characters

    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);

    // Auto-focus to next input
    if (value.length === 2 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && values[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="grid grid-cols-6 gap-2 w-fit">
      {values.map((val, index) => (
        <input
          key={index}
          type="text"
          maxLength={2}
          value={val}
          ref={(el) => (inputRefs.current[index] = el)}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          style={{
            width: '50px',
            height: '50px',
            textAlign: 'center',
            fontSize: '18px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
      ))}
    </div>
  );
};

export default SixColumnInput;
