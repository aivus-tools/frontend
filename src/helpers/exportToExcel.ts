import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  CategoriesExportData,
  CategoryWithoutSubcategories,
  CategoryWithSubcategories,
  ExportItem,
} from '@/types/store.interface';
import { Dayjs } from 'dayjs';

type DefinedRef = {
  sheet: ExcelJS.Worksheet;
  /** Всегда одиночный A1-адрес верхней-левой ячейки */
  a1: string; // например "$B$2"
  row: number; // 2
  col: number; // 2 (для B)
};

/** Берём ПЕРВЫЙ диапазон по имени, приводим к строке "'Лист'!$C$21" ИЛИ "'Лист'!$C$21:$D$21" */
function getFirstNamedRangeRaw(wb: ExcelJS.Workbook, name: string): string {
  const dn: any = (wb as any).definedNames;
  if (!dn?.getRanges) {
    throw new Error('Workbook.definedNames.getRanges is unavailable in this ExcelJS version');
  }

  const raw = dn.getRanges(name);
  let first: string | undefined;

  if (Array.isArray(raw)) {
    first = raw[0];
  } else if (raw && typeof raw === 'object') {
    for (const v of Object.values(raw as Record<string, string[] | undefined>)) {
      if (Array.isArray(v) && v.length > 0) {
        first = v[0];
        break;
      }
    }
    if (!first) {
      const keys = Object.keys(raw as Record<string, unknown>);
      if (keys.length > 0) first = keys[0] as string;
    }
  }

  if (!first) {
    throw new Error(`Named range "${name}" not found`);
  }

  return first; // например "'EXPORT_TMP'!$C$21:$D$21"
}

/** Возвращает пару [sheetName, addr] где addr может быть "A1" или "A1:B2" */
function splitSheetAndAddr(namedRef: string): { sheetName: string; addr: string } {
  const [sheetQuoted, addrRaw] = namedRef.split('!');
  const sheetName = sheetQuoted.replace(/^'/, '').replace(/'$/, '');
  const addr = addrRaw.replace(/\s+/g, '');
  return { sheetName, addr };
}

/** Берём верхнюю-левую ячейку из адреса, поддерживая и одиночные A1, и диапазоны A1:A2 */
function addrToTopLeftA1(addr: string): string {
  if (!addr.includes(':')) return addr;
  const [leftTop] = addr.split(':');
  return leftTop;
}

function a1ToRC(a1: string): { row: number; col: number } {
  const m = a1.match(/\$?([A-Z]+)\$?(\d+)$/i);
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

/** Ссылка на именованную верхнюю-левую ячейку (если диапазон — берём её верхнюю-левую) */
function getDefinedRef(wb: ExcelJS.Workbook, name: string): DefinedRef {
  const raw = getFirstNamedRangeRaw(wb, name);
  const { sheetName, addr } = splitSheetAndAddr(raw);
  const topLeft = addrToTopLeftA1(addr);
  const sheet = wb.getWorksheet(sheetName);
  if (!sheet) {
    throw new Error(`Worksheet "${sheetName}" not found for named range "${name}"`);
  }

  const rc = a1ToRC(topLeft);
  return { sheet, a1: topLeft, row: rc.row, col: rc.col };
}

/** Поставить значение в именованную (или верхнюю-левую) ячейку */
function setNamedCell(wb: ExcelJS.Workbook, name: string, value: ExcelJS.CellValue): void {
  const ref = getDefinedRef(wb, name);
  ref.sheet.getCell(ref.a1).value = value;
}

function writeNamedDate(wb: ExcelJS.Workbook, namedRange = 'date', value?: Dayjs) {
  const ref = getDefinedRef(wb, namedRange);
  const cell = ref.sheet.getCell(ref.a1);

  let y: number, m: number, d: number;

  if (value) {
    y = value.year();
    m = value.month();
    d = value.date();
  } else {
    const now = new Date();
    y = now.getFullYear();
    m = now.getMonth();
    d = now.getDate();
  }

  cell.value = new Date(Date.UTC(y, m, d));
  cell.numFmt = '[$-419]dd mmmm yyyy "г."';
  cell.font = { name: 'Montserrat', size: 12, color: { argb: 'FF0F4C5C' } };
  cell.alignment = { horizontal: 'left', vertical: 'middle' };
}

type CellSide = 'top' | 'left' | 'bottom' | 'right';
function addBorderToCell(cell: ExcelJS.Cell, exclude: CellSide[] = []): void {
  cell.border = {
    top: exclude.includes('top') ? undefined : { style: 'thin', color: { argb: 'FF000000' } },
    left: exclude.includes('left') ? undefined : { style: 'thin', color: { argb: 'FF000000' } },
    bottom: exclude.includes('bottom') ? undefined : { style: 'thin', color: { argb: 'FF000000' } },
    right: exclude.includes('right') ? undefined : { style: 'thin', color: { argb: 'FF000000' } },
  };
}

function addFont(cell: ExcelJS.Cell, bold: boolean = false): void {
  cell.font = {
    name: 'Montserrat',
    size: 10,
    bold,
    color: { argb: 'FF0F4C5C' },
  };
}

function addNumberFormat(cell: ExcelJS.Cell): void {
  if (typeof cell.value === 'number') {
    cell.numFmt = '#,##0.00';
  }
}

function addBorderToRow(sheet: ExcelJS.Worksheet, rowIndex: number, startCol: number, endCol: number) {
  const row = sheet.getRow(rowIndex);

  for (let col = startCol; col <= endCol; col++) {
    addBorderToCell(row.getCell(col));
  }
}

function addBorderToLine(sheet: ExcelJS.Worksheet, rowIndex: number, startCol: number, endCol: number) {
  const row = sheet.getRow(rowIndex);

  for (let col = startCol; col <= endCol; col++) {
    const exclude: CellSide[] = [];
    if (col === startCol) {
      exclude.push('right');
    } else if (col === endCol) {
      exclude.push('left');
    } else {
      exclude.push('left', 'right');
    }

    addBorderToCell(row.getCell(col), exclude);
  }
}

const getCell = (sheet: ExcelJS.Worksheet, row: number, col: number): ExcelJS.Cell => sheet.getCell(row, col);

function addItems(
  items: ExportItem[],
  rowIdx: number,
  colIndex: number,
  sheet: ExcelJS.Worksheet,
  color: string,
  minPrevRowForRollup?: number
): number {
  let nextRow = rowIdx;

  const defaultValue = '-';

  for (let i = 0; i < items.length; i++) {
    const item = items.at(i);

    if (!item) {
      continue;
    }

    const nameCell = getCell(sheet, nextRow, colIndex);
    nameCell.value = item.name;
    addFont(nameCell);
    const clientPriceCell = getCell(sheet, nextRow, colIndex + 1);
    clientPriceCell.value = item.clientPrice ?? defaultValue;
    addFont(clientPriceCell);
    addNumberFormat(clientPriceCell);

    const [unit1, unit2] = item.units ?? [];
    const unit1Name = unit1?.key ?? defaultValue;
    const unit2Name = unit2?.key ?? defaultValue;

    const unit1KeyCell = getCell(sheet, nextRow, colIndex + 2);
    unit1KeyCell.value = unit1Name;
    addFont(unit1KeyCell);
    addNumberFormat(unit1KeyCell);
    unit1KeyCell.alignment = { horizontal: 'right', vertical: 'middle' };

    const unit1ValCell = getCell(sheet, nextRow, colIndex + 3);
    unit1ValCell.value = unit1Name !== defaultValue ? unit1?.value || 0 : defaultValue;
    addFont(unit1ValCell);
    unit1ValCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const unit2KeyCell = getCell(sheet, nextRow, colIndex + 4);
    unit2KeyCell.value = unit2Name;
    addFont(unit2KeyCell);
    addNumberFormat(unit2KeyCell);
    unit2KeyCell.alignment = { horizontal: 'right', vertical: 'middle' };

    const unit2ValCell = getCell(sheet, nextRow, colIndex + 5);
    unit2ValCell.value = unit2Name !== defaultValue ? unit2?.value || 0 : defaultValue;
    addFont(unit2ValCell);
    unit2ValCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Insert the formula into the next cell: IF(ISNUMBER(price),price,0) * IF(ISNUMBER(u1),u1,1) * IF(ISNUMBER(u2),u2,1)
    const clientPriceCellAddress = clientPriceCell.address;
    const unit1ValAddress = unit1ValCell.address;
    const unit2ValAddress = unit2ValCell.address;

    const itemSumFormula =
      `IF(ISNUMBER(${clientPriceCellAddress}),${clientPriceCellAddress},0)` +
      `*IF(ISNUMBER(${unit1ValAddress}),${unit1ValAddress},1)` +
      `*IF(ISNUMBER(${unit2ValAddress}),${unit2ValAddress},1)`;

    const sumCell = getCell(sheet, nextRow, colIndex + 6);
    sumCell.value = { formula: itemSumFormula };
    addFont(sumCell, true);
    addNumberFormat(sumCell);

    addBorderToRow(sheet, nextRow, colIndex, colIndex + 6);

    nextRow += 1;
  }

  // Sum all item totals calculated above in this block (column colIndex + 6)
  if (nextRow > rowIdx) {
    const firstAddr = getCell(sheet, rowIdx, colIndex + 6).address;
    const lastAddr = getCell(sheet, nextRow - 1, colIndex + 6).address;
    const itemsSumFormula = `SUM(${firstAddr}:${lastAddr})`;

    const totalCell = getCell(sheet, nextRow, colIndex + 6);
    totalCell.value = { formula: itemsSumFormula };
    totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    addBorderToCell(totalCell);
    addFont(totalCell, true);
    addNumberFormat(totalCell);

    const prevRow = rowIdx - 1;

    if (minPrevRowForRollup === undefined || prevRow >= minPrevRowForRollup) {
      const secondTotalCell = getCell(sheet, prevRow, colIndex + 6);
      secondTotalCell.value = { formula: totalCell.address };
      addFont(secondTotalCell, true);
      addNumberFormat(secondTotalCell);
    }
  } else {
    // No items added; avoid empty SUM range
    getCell(sheet, nextRow, colIndex + 6).value = defaultValue;
  }

  nextRow += 1;

  return nextRow;
}

const addColorToCellGroup = (
  sheet: ExcelJS.Worksheet,
  rowIndex: number,
  startColumn: number,
  endColumn: number,
  color: string
): void => {
  // const row = sheet.getRow(rowIndex);

  for (let col = startColumn; col <= endColumn; col++) {
    // const cell = row.getCell(col);
    const cell = sheet.getCell(rowIndex, col);
    cell.value = cell.value ?? null; // заставляем создать именно ячейку
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
  }
};

const isCategoryWithSubcategories = (
  v: CategoryWithSubcategories | CategoryWithoutSubcategories
): v is CategoryWithSubcategories => Array.isArray(v.data);

export async function exportToExcel(
  data: CategoriesExportData,
  clientTotal: string,
  clientCostPerVideo: number,
  fileName: string,
  date?: Dayjs,
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
    writeNamedDate(wb, 'date', date);
  }
  if (watermark) {
    setNamedCell(wb, 'watermark', watermark);
  }

  const startCell = getDefinedRef(wb, 'tableStart');
  const sheet = startCell.sheet;
  let nextRow = startCell.row;

  for (let i = 0; i < data.length; i++) {
    const currentBlock = data.at(i);

    if (!currentBlock) {
      continue;
    }

    addColorToCellGroup(sheet, nextRow, startCell.col, startCell.col + 6, 'FF7BDFF2');
    addBorderToLine(sheet, nextRow, startCell.col, startCell.col + 6);

    const categoryTitleCell = getCell(sheet, nextRow, startCell.col);
    categoryTitleCell.value = currentBlock.category.toUpperCase();
    addFont(categoryTitleCell, true);

    nextRow += 1;

    if (isCategoryWithSubcategories(currentBlock)) {
      const blockData = currentBlock.data;

      for (let j = 0; j < blockData.length; j++) {
        const sub = blockData.at(j);
        const subcategory = sub?.subcategory;

        if (!subcategory) {
          continue;
        }

        addColorToCellGroup(sheet, nextRow, startCell.col, startCell.col + 6, 'FFB2F7EF');
        addBorderToLine(sheet, nextRow, startCell.col, startCell.col + 5);

        const subcategoryCell = getCell(sheet, nextRow, startCell.col);
        subcategoryCell.value = subcategory.toUpperCase();
        addFont(subcategoryCell, true);

        nextRow += 1;

        const totalTitle = 'Итог по разделу';

        nextRow = addItems(sub?.items ?? [], nextRow, startCell.col, sheet, 'FFB2F7EF', startCell.row);

        const subTotalCell = getCell(sheet, nextRow - 1, startCell.col + 5);
        subTotalCell.value = `${totalTitle} ${currentBlock.category.toUpperCase()} | ${subcategory}`;
        addFont(subTotalCell, true);
        subTotalCell.alignment = { horizontal: 'right', vertical: 'middle' };

        if (j === blockData.length - 1) {
          const totalCell = getCell(sheet, nextRow, startCell.col + 5);
          totalCell.value = `ИТОГО ${currentBlock.category.toUpperCase()}`;
          addFont(totalCell, true);
          totalCell.alignment = { horizontal: 'right', vertical: 'middle' };

          addColorToCellGroup(sheet, nextRow, startCell.col, startCell.col + 5, 'FFB2F7EF');
          addBorderToLine(sheet, nextRow, startCell.col, startCell.col + 5);

          const categoryResultCell = getCell(sheet, nextRow, startCell.col + 6);
          categoryResultCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF60D394' } };
          categoryResultCell.value = {
            formula:
              `SUMIF($${sheet.getColumn(startCell.col + 5).letter}:$${sheet.getColumn(startCell.col + 5).letter},` +
              `"${totalTitle} "&${categoryTitleCell.address}&"*",$${sheet.getColumn(startCell.col + 6).letter}:$${sheet.getColumn(startCell.col + 6).letter})`,
          };
          addFont(categoryResultCell, true);
          addNumberFormat(categoryResultCell);
          addBorderToCell(categoryResultCell);
        }

        nextRow += 1;
      }
    } else {
      nextRow = addItems(currentBlock.data.items ?? [], nextRow, startCell.col, sheet, 'FF60D394', startCell.row);
      const totalCell = getCell(sheet, nextRow - 1, startCell.col + 5);
      totalCell.value = `ИТОГО ${currentBlock.category.toUpperCase()}`;
      totalCell.alignment = { horizontal: 'right', vertical: 'middle' };
      addFont(totalCell, true);

      addColorToCellGroup(sheet, nextRow - 1, startCell.col, startCell.col + 5, 'FF7BDFF2');
      addBorderToLine(sheet, nextRow - 1, startCell.col, startCell.col + 5);
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
