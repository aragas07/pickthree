import { NextRequest, NextResponse } from 'next/server';
import { sheets } from '@/lib/googleSheets';

interface RowUpdate {
  row: number;
  values: (string | number)[];
}

interface RequestBody {
  updates: RowUpdate[];
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('sheetId')?.toString();
    const sheetName = searchParams.get('sheetName')?.toString() || 'Sheet1';

    if (!spreadsheetId) {
      return NextResponse.json({ message: 'Missing sheetId' }, { status: 400 });
    }
    if (!body.updates || !Array.isArray(body.updates)) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const data = body.updates.map(({ row, values }) => ({
      range: `${sheetName}!A${row}`, // starting at column A
      values: [values],
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data,
      },
    });

    return NextResponse.json({ message: `Updated ${body.updates.length} rows successfully` });
  } catch (error: any) {
    console.error('Google Sheets batchUpdate error:', error.message || error);
    return NextResponse.json({ message: 'Failed to update rows' }, { status: 500 });
  }
}
