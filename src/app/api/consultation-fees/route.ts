import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FEES_FILE = path.join(process.cwd(), '.data', 'consultation-fees.json');

async function readFees(): Promise<Record<string, number>> {
  try {
    const raw = await fs.readFile(FEES_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeFees(fees: Record<string, number>) {
  await fs.mkdir(path.dirname(FEES_FILE), { recursive: true });
  await fs.writeFile(FEES_FILE, JSON.stringify(fees, null, 2), 'utf-8');
}

export async function GET() {
  const fees = await readFees();
  return NextResponse.json(fees);
}

export async function PUT(request: NextRequest) {
  let body: { doctorId?: string; consultationFee?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const { doctorId, consultationFee } = body;
  if (!doctorId?.trim()) {
    return NextResponse.json({ message: 'doctorId is required' }, { status: 400 });
  }

  const fees = await readFees();
  if (consultationFee == null || consultationFee <= 0) {
    delete fees[doctorId];
  } else {
    fees[doctorId] = consultationFee;
  }

  await writeFees(fees);
  return NextResponse.json({ doctorId, consultationFee: fees[doctorId] });
}
