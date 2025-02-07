import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '@/lib/logger';

const filePath = path.join(process.cwd(), 'db.json');

type Brief = {
	status: 'DRAFT' | 'RFP' | 'REVIEWING' | 'ONGOING';
	details: string;
	clientId: number;
	id: string;
	uuid: string;
	createdAt: string;
	updatedAt: string | null;
};

export async function POST(req: Request) {
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

		const newBrief: Brief = {
			...body,
			id: uuidv4(),
			uuid: uuidv4(),
			createdAt: new Date().toISOString(),
			updatedAt: null,
		};

		fileData.push(newBrief);
		await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf-8');

		return NextResponse.json({ success: true, data: newBrief }, { status: 200 });
	} catch (error) {
		logger.error('Ошибка обработки запроса:', error);
		return NextResponse.json({ error: 'Произошла ошибка на сервере' }, { status: 500 });
	}
}

export async function GET() {
	try {
		let fileData: Brief[] = [];
		try {
			fileData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
			if (!Array.isArray(fileData)) throw new Error('Invalid db.json format');
		} catch {
			fileData = [];
			await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf-8');
		}

		return NextResponse.json(fileData, { status: 200 });
	} catch (error) {
		logger.error('Ошибка обработки запроса:', error);
		return NextResponse.json({ error: 'Произошла ошибка на сервере' }, { status: 500 });
	}
}
