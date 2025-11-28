import { NextRequest, NextResponse } from 'next/server';
import { sheets } from '@/lib/googleSheets';

export async function GET(req: NextRequest) {
  try {
    // const spreadsheetId = '15pJpi6hLjGjZH90m8gHZMfnIhKGDWZ8YwzUkpTM2NRk'; // Replace with actual ID
    // const range = 'Sheet1'; // Cell to read
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('sheetId')?.toString();
    const range = searchParams.get('sheetName')?.toString();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const value = response.data.values;

    return NextResponse.json({ value });
  } catch (error: any) {
    console.error('Error reading cell:', error.message || error);
    return NextResponse.json({ error: 'Failed to read cell' }, { status: 500 });
  }
}
