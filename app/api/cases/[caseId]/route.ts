import { NextResponse } from 'next/server';
import { db } from '@root/lib/db/memoryStore';

export async function GET(req: Request, { params }: { params: Promise<{ caseId: string }> }) {
    const { caseId } = await params;
    const c = await db.getCase(caseId);

    if (!c) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(c);
}
