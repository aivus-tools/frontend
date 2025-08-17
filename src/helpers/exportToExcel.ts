import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface DataRow {
  name: string;
  qty: number;
  price: number;
}

type DefinedRef = {
  sheet: ExcelJS.Worksheet;
  a1: string; // например "$B$2"
  row: number; // 2
  col: number; // 2 (для B)
};

/** Берём первый диапазон по имени, поддерживая разные сигнатуры getRanges() в ExcelJS */
function getFirstNamedRange(wb: ExcelJS.Workbook, name: string): string {
  const dn: any = (wb as any).definedNames;
  const raw = dn.getRanges(name);

  let first: string | undefined;

  if (Array.isArray(raw)) {
    first = raw[0];
  } else if (raw && typeof raw === 'object') {
    // словарь вида { "'Лист1'!$B$2": ["'Лист1'!$B$2"], ... } или { addressStr: string[] }
    for (const v of Object.values(raw as Record<string, string[] | undefined>)) {
      if (Array.isArray(v) && v.length > 0) {
        first = v[0];
        break;
      }
    }
    // иногда ключом уже является адрес
    if (!first) {
      const keys = Object.keys(raw as Record<string, unknown>);
      if (keys.length > 0) first = keys[0];
    }
  }

  if (!first) throw new Error(`Named range "${name}" not found`);
  return first;
}

function a1ToRC(a1: string): { row: number; col: number } {
  const m = a1.match(/\$?([A-Z]+)\$?(\d+)/i);

  if (!m) {
    throw new Error(`Bad A1 address: ${a1}`);
  }
  const letters = m[1].toUpperCase();
  const row = parseInt(m[2], 10);
  let col = 0;

  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }

  return { row, col };
}

/** return a link to a named cell */
function getDefinedRef(wb: ExcelJS.Workbook, name: string): DefinedRef {
  const ref = getFirstNamedRange(wb, name); // "'Отчёт'!$B$2"
  const [sheetQuoted, addr] = ref.split('!');
  const sheetName = sheetQuoted.replace(/^'/, '').replace(/'$/, '');
  const sheet = wb.getWorksheet(sheetName);

  if (!sheet) {
    throw new Error(`Worksheet "${sheetName}" not found for named range "${name}"`);
  }

  const rc = a1ToRC(addr);

  return { sheet, a1: addr, row: rc.row, col: rc.col };
}

/** add value to a named cell */
function setNamedCell(wb: ExcelJS.Workbook, name: string, value: ExcelJS.CellValue) {
  const ref = getDefinedRef(wb, name);
  ref.sheet.getCell(ref.a1).value = value;
}

export async function exportToExcel(
  data: DataRow[],
  clientTotal: string,
  clientCostPerVideo: number,
  fileName: string,
  date?: string,
  watermark?: string
) {
  const res = await fetch('/template.xlsx');
  if (!res.ok) {
    throw new Error(`Failed to fetch template.xlsx: ${res.status} ${res.statusText}`);
  }

  const arrBuf = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(arrBuf);

  // add data to named excel ranges
  if (date) {
    setNamedCell(wb, 'date', date);
  }
  if (watermark) {
    setNamedCell(wb, 'watermark', watermark);
  }

  // add data from TableStart
  const start = getDefinedRef(wb, 'TableStart');
  const sheet = start.sheet;

  for (let i = 0; i < data.length; i++) {
    const rowIdx = start.row + i;
    const r = sheet.getRow(rowIdx);
    const c0 = start.col;

    r.getCell(c0 + 0).value = data[i].name;
    r.getCell(c0 + 1).value = data[i].qty;
    r.getCell(c0 + 2).value = data[i].price;
    // формула суммы по строке — используем фактические буквы колонки из TableStart
    const colB = c0 + 1; // вторая колонка относительно старта
    const colC = c0 + 2;
    const toA1 = (col: number, row: number) => {
      let s = '';
      let n = col;
      while (n > 0) {
        const rem = (n - 1) % 26;
        s = String.fromCharCode(65 + rem) + s;
        n = Math.floor((n - 1) / 26);
      }
      return `$${s}$${row}`;
    };
    r.getCell(c0 + 3).value = { formula: `${toA1(colB, rowIdx)}*${toA1(colC, rowIdx)}` };
    r.commit?.();
  }

  wb.calcProperties.fullCalcOnLoad = true;

  // 5) скачиваем
  const buf = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fileName || 'report.xlsx'
  );
}
