import { NextResponse } from 'next/server';
import { db } from '@root/lib/db/memoryStore';

export async function GET() {
    const cases = await db.getAllCases();
    return NextResponse.json(cases);
}
