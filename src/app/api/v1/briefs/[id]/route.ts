import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Brief } from '@/types/brief.interface';
import logger from '@/lib/logger';

const filePath = path.join(process.cwd(), 'db.json');

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body: Pick<Brief, 'status' | 'clientId' | 'details'> = await req.json();

    let fileData: Brief[] = [];
    try {
      fileData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      if (!Array.isArray(fileData)) throw new Error('Invalid db.json format');
    } catch {
      fileData = [];
      await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf-8');
    }

    const briefId = (await params).id;

    const brief = fileData.find((brief) => brief.id === briefId);

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    const newBrief: Brief = {
      ...brief,
      details: body.details,
    };

    const newFileData = fileData.filter((brief) => brief.id !== briefId);

    newFileData.push(newBrief);
    console.log(newFileData);
    await fs.writeFile(filePath, JSON.stringify(newFileData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, data: newBrief }, { status: 200 });
  } catch (error) {
    logger.error('Ошибка обработки запроса:', error);
    return NextResponse.json({ error: 'Произошла ошибка на сервере' }, { status: 500 });
  }
}
