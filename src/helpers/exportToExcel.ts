import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  CategoriesExportData,
  CategoryWithoutSubcategories,
  CategoryWithSubcategories,
  ExportItem,
} from '@/types/store.interface';

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
function setNamedCell(wb: ExcelJS.Workbook, name: string, value: ExcelJS.CellValue): void {
  const ref = getDefinedRef(wb, name);
  ref.sheet.getCell(ref.a1).value = value;
}

const getCell = (sheet: ExcelJS.Worksheet, row: number, col: number): ExcelJS.Cell => sheet.getRow(row).getCell(col);

function addItems(items: ExportItem[], rowIdx: number, colIndex: number, sheet: ExcelJS.Worksheet): number {
  let nextRow = rowIdx;

  const defaultValue = '-';

  for (let i = 0; i < items.length; i++) {
    const item = items.at(i);

    if (!item) {
      continue;
    }

    getCell(sheet, nextRow, colIndex).value = item.name;
    getCell(sheet, nextRow, colIndex + 1).value = item.clientPrice ?? defaultValue;

    const [unit1, unit2] = item.units ?? [];

    const unit1Name = unit1.key ?? defaultValue;
    const unit2Name = unit2.key ?? defaultValue;
    getCell(sheet, nextRow, colIndex + 2).value = unit1Name;
    getCell(sheet, nextRow, colIndex + 3).value = unit1Name !== defaultValue ? unit1.value || 0 : defaultValue;
    getCell(sheet, nextRow, colIndex + 4).value = unit2Name;
    getCell(sheet, nextRow, colIndex + 5).value = unit2Name !== defaultValue ? unit2.value || 0 : defaultValue;

    // Insert the formula into the next cell: clientPrice * (unit1.value ?? 1) * (unit2.value ?? 1)
    const clientPriceCellAddress = getCell(sheet, nextRow, colIndex + 1).address;
    const unit1ValAddress = getCell(sheet, nextRow, colIndex + 3).address;
    const unit2ValAddress = getCell(sheet, nextRow, colIndex + 5).address;

    const itemSumFormula = `=${clientPriceCellAddress}*IF(ISNUMBER(${unit1ValAddress}),${unit1ValAddress},1)*IF(ISNUMBER(${unit2ValAddress}),${unit2ValAddress},1)`;
    getCell(sheet, nextRow, colIndex + 6).value = { formula: itemSumFormula };

    nextRow += 1;
  }

  // Sum all item totals calculated above in this block (column colIndex + 6)
  if (nextRow > rowIdx) {
    const firstAddr = getCell(sheet, rowIdx, colIndex + 6).address;
    const lastAddr = getCell(sheet, nextRow - 1, colIndex + 6).address;
    const itemsSumFormula = `=SUM(${firstAddr}:${lastAddr})`;
    getCell(sheet, nextRow, colIndex + 6).value = { formula: itemsSumFormula };
  } else {
    // No items added; avoid empty SUM range
    getCell(sheet, nextRow, colIndex + 6).value = defaultValue;
  }

  nextRow += 1;

  return nextRow;
}

const isCategoryWithSubcategories = (
  v: CategoryWithSubcategories | CategoryWithoutSubcategories
): v is CategoryWithSubcategories => Array.isArray(v.data);

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

    getCell(sheet, nextRow, startCell.col).value = currentBlock.category;

    nextRow += 1;

    if (isCategoryWithSubcategories(currentBlock)) {
      const blockData = currentBlock.data;

      for (let j = 0; j < blockData.length; j++) {
        getCell(sheet, nextRow, startCell.col).value = blockData.at(j)?.subcategory;
        nextRow += 1;

        nextRow = addItems(blockData.at(j)?.items ?? [], nextRow, startCell.col, sheet);

        nextRow += 1;
      }
    } else {
      nextRow = addItems(currentBlock.data.items ?? [], nextRow, startCell.col, sheet);

      nextRow += 1;
    }
  }

  wb.calcProperties.fullCalcOnLoad = true;

  const buf = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fileName || 'report.xlsx'
  );
}
