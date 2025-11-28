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
  } catch (error: any) {
    console.error('Error fetching sheets:', error.message || error);
    return NextResponse.json({ error: 'Failed to get sheets' }, { status: 500 });
  }
}
