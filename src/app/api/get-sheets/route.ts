import { NextRequest, NextResponse } from 'next/server';
import { sheets } from '@/lib/googleSheets';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('sheetId')?.toString();

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetList = response.data.sheets?.map(
      (sheet) => sheet.properties?.title
    ) || [];


    return NextResponse.json({ sheets: sheetList });
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }
}
