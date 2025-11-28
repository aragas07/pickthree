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
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }
}
