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
    const { spreadsheetId, sheetName, value } = await req.json();

    if (!spreadsheetId) {
      return NextResponse.json({ message: 'Missing sheetId' }, { status: 400 });
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetName,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: value,
      },
    });

    return NextResponse.json({ message: `Updated  rows successfully` });
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }
}
