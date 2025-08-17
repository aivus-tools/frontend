import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  CategoriesExportData,
  CategoryWithoutSubcategories,
  CategoryWithSubcategories,
  ExportItem,
} from '@/types/store.interface';

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

function getNextRowFirstColumn(sheet: ExcelJS.Worksheet, rowIdx: number, colIndex: number) {
  const row = sheet.getRow(rowIdx);

  return row.getCell(colIndex);
}

function addItems(items: ExportItem[], rowIdx: number, colIndex: number, sheet: ExcelJS.Worksheet) {
  let nextRow = rowIdx;

  const defaultValue = '-';

  for (let i = 0; i < items.length; i++) {
    const itemName = items.at(i)?.name;

    if (!itemName) {
      continue;
    }

    getNextRowFirstColumn(sheet, nextRow, colIndex).value = itemName;
    getNextRowFirstColumn(sheet, nextRow, colIndex + 1).value = items.at(i)?.clientPrice ?? defaultValue;
    const unit1Name = items.at(i)?.units.at(0)?.key ?? defaultValue;
    const unit2Name = items.at(i)?.units.at(1)?.key ?? defaultValue;
    getNextRowFirstColumn(sheet, nextRow, colIndex + 2).value = unit1Name;
    getNextRowFirstColumn(sheet, nextRow, colIndex + 3).value =
      unit1Name !== defaultValue ? items.at(i)?.units.at(0)?.value || 0 : defaultValue;
    getNextRowFirstColumn(sheet, nextRow, colIndex + 4).value = unit2Name;
    getNextRowFirstColumn(sheet, nextRow, colIndex + 5).value =
      unit2Name !== defaultValue ? items.at(i)?.units.at(1)?.value || 0 : defaultValue;

    nextRow += 1;
  }

  return nextRow;
}

export async function exportToExcel(
  data: CategoriesExportData,
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
  const startCell = getDefinedRef(wb, 'TableStart');
  const sheet = startCell.sheet;
  let nextRow = startCell.row + 1;

  for (let i = 0; i < data.length; i++) {
    const currentBlock = data.at(i);

    if (!currentBlock) {
      continue;
    }

    getNextRowFirstColumn(sheet, nextRow, startCell.col).value = currentBlock.category;

    nextRow += 1;

    export const isCategoryWithSubcategories = (
      v: CategoryWithSubcategories | CategoryWithoutSubcategories
    ): v is CategoryWithSubcategories => Array.isArray(v.data);

    if (isCategoryWithSubcategories(currentBlock)) {
      const blockData = currentBlock.data;

      for (let j = 0; j < blockData.length; i++) {
        getNextRowFirstColumn(sheet, nextRow, startCell.col).value = blockData.at(j)?.subcategory;
        nextRow += 1;

        nextRow = addItems(blockData.at(j)?.items ?? [], nextRow, startCell.col, sheet);

        nextRow += 1;
      }
    } else {
      nextRow = addItems(currentBlock.data.items ?? [], nextRow, startCell.col, sheet);

      nextRow += 1;
    }

    // row.commit?.();
  }

  wb.calcProperties.fullCalcOnLoad = true;

  const buf = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fileName || 'report.xlsx'
  );
}
