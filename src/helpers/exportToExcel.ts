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
  address: string;
  row: number;
  col: number;
};

function getNamedCellRef(wb: ExcelJS.Workbook, name: string): DefinedRef {
  for (const sheet of wb.worksheets) {
    sheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        const names = (cell as any).names as string[] | undefined;
        if (names?.includes(name)) {
          const { row: r, col: c } = a1ToRC(cell.address);
          return {
            sheet,
            a1: cell.address.startsWith('$') ? cell.address : `$${sheet.getColumn(c).letter}$${r}`,
            row: r,
            col: c,
          };
        }
      });
    });
  }
  throw new Error(`Named single-cell "${name}" not found. Make sure it's a single named cell in the template.`);
}

function a1ToRC(a1: string): { row: number; col: number } {
  const m = a1.match(/\$?([A-Z]+)\$?(\d+)$/i);
  if (!m) throw new Error(`Bad A1 address: ${a1}`);
  const letters = m[1].toUpperCase();
  const row = parseInt(m[2], 10);
  let col = 0;
  for (let i = 0; i < letters.length; i++) col = col * 26 + (letters.charCodeAt(i) - 64);
  return { row, col };
}

function setNamedCell(wb: ExcelJS.Workbook, name: string, value: ExcelJS.CellValue): void {
  const ref = getNamedCellRef(wb, name);
  ref.sheet.getCell(ref.address).value = value;
}

function writeNamedDate(wb: ExcelJS.Workbook, namedRange = 'date', value?: Dayjs) {
  const ref = getNamedCellRef(wb, namedRange);
  const cell = ref.sheet.getCell(ref.address);

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
  cell.font = { name: 'Montserrat', size: 10, bold, color: { argb: 'FF0F4C5C' } };
}

function addNumberFormat(cell: ExcelJS.Cell): void {
  cell.numFmt = '#,##0.00';
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
    unit1KeyCell.alignment = { horizontal: 'right', vertical: 'middle' };

    const unit1ValCell = getCell(sheet, nextRow, colIndex + 3);
    unit1ValCell.value = unit1Name !== defaultValue ? unit1?.value || 0 : defaultValue;
    addFont(unit1ValCell);
    unit1ValCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const unit2KeyCell = getCell(sheet, nextRow, colIndex + 4);
    unit2KeyCell.value = unit2Name;
    addFont(unit2KeyCell);
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
      const headerTotalCell = getCell(sheet, prevRow, colIndex + 6);
      headerTotalCell.value = { formula: totalCell.address };
      addFont(headerTotalCell, true);
      addNumberFormat(headerTotalCell);
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
  for (let col = startColumn; col <= endColumn; col++) {
    const cell = sheet.getCell(rowIndex, col);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
  }
};

const isCategoryWithSubcategories = (
  v: CategoryWithSubcategories | CategoryWithoutSubcategories
): v is CategoryWithSubcategories => Array.isArray(v.data);

export async function exportToExcel(data: CategoriesExportData, fileName: string, date?: Dayjs, watermark?: string) {
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

  const startCell = getNamedCellRef(wb, 'tableStart');
  const sheet = startCell.sheet;
  let nextRow = startCell.row;

  const categoryTotals: string[] = [];
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
      const headerTotalCell = getCell(sheet, nextRow - 1, startCell.col + 6);

      const blockData = currentBlock.data;

      for (let j = 0; j < blockData.length; j++) {
        const sub = blockData.at(j);
        const subcategory = sub?.subcategory;

        if (!subcategory) {
          continue;
        }

        addColorToCellGroup(sheet, nextRow, startCell.col, startCell.col + 6, 'FFB2F7EF');
        addBorderToLine(sheet, nextRow, startCell.col, startCell.col + 6);

        const subcategoryCell = getCell(sheet, nextRow, startCell.col);
        subcategoryCell.value = subcategory;
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

          addColorToCellGroup(sheet, nextRow, startCell.col, startCell.col + 5, 'FF7BDFF2');
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
          categoryTotals.push(categoryResultCell.address);

          headerTotalCell.value = { formula: categoryResultCell.address };
          addFont(headerTotalCell, true);
          addNumberFormat(headerTotalCell);
        }

        nextRow += 1;
      }
    } else {
      nextRow = addItems(currentBlock.data.items ?? [], nextRow, startCell.col, sheet, 'FF60D394', startCell.row);
      const totalCell = getCell(sheet, nextRow - 1, startCell.col + 5);
      totalCell.value = `ИТОГО ${currentBlock.category.toUpperCase()}`;
      totalCell.alignment = { horizontal: 'right', vertical: 'middle' };
      addFont(totalCell, true);
      categoryTotals.push(getCell(sheet, nextRow - 1, startCell.col + 6).address);

      addColorToCellGroup(sheet, nextRow - 1, startCell.col, startCell.col + 5, 'FF7BDFF2');
      addBorderToLine(sheet, nextRow - 1, startCell.col, startCell.col + 5);
      nextRow += 1;
    }
  }

  nextRow += 1;

  const managementTitleCell = getCell(sheet, nextRow, startCell.col);
  managementTitleCell.value = 'Управление проектом';
  addBorderToLine(sheet, nextRow, startCell.col, startCell.col + 5);
  addFont(managementTitleCell);

  const managementValueCell = getCell(sheet, nextRow, startCell.col + 6);
  addBorderToCell(managementValueCell);

  nextRow += 1;

  const totalSumBeforeTaxTitleCell = getCell(sheet, nextRow, startCell.col);
  totalSumBeforeTaxTitleCell.value = 'Общая сумма до налогов';
  addBorderToLine(sheet, nextRow, startCell.col, startCell.col + 5);
  addColorToCellGroup(sheet, nextRow, startCell.col, startCell.col + 6, 'FFB2F7EF');
  addFont(totalSumBeforeTaxTitleCell, true);

  const totalSumBeforeTaxValueCell = getCell(sheet, nextRow, startCell.col + 6);
  addBorderToCell(totalSumBeforeTaxValueCell);
  addFont(totalSumBeforeTaxValueCell, true);
  totalSumBeforeTaxValueCell.value = { formula: `SUM(${categoryTotals.join(',')}, ${managementValueCell.address})` };
  totalSumBeforeTaxValueCell.alignment = { horizontal: 'right', vertical: 'middle' };
  addNumberFormat(totalSumBeforeTaxValueCell);

  nextRow += 2;

  const taxTitleCell = getCell(sheet, nextRow, startCell.col);
  taxTitleCell.value = 'Налоги';
  addBorderToLine(sheet, nextRow, startCell.col, startCell.col + 5);
  addFont(taxTitleCell);

  const taxInfoCell1 = getCell(sheet, nextRow, startCell.col + 4);
  taxInfoCell1.value = 'УСН';
  addFont(taxInfoCell1);
  taxInfoCell1.alignment = { horizontal: 'right', vertical: 'middle' };

  const taxInfoCell2 = getCell(sheet, nextRow, startCell.col + 5);
  taxInfoCell2.value = 0.06;
  taxInfoCell2.numFmt = '0%';
  addFont(taxInfoCell2);
  taxInfoCell2.alignment = { horizontal: 'center', vertical: 'middle' };

  const taxValueCell = getCell(sheet, nextRow, startCell.col + 6);
  taxValueCell.alignment = { horizontal: 'right', vertical: 'middle' };
  addBorderToCell(taxValueCell);
  addNumberFormat(taxValueCell);
  addFont(taxValueCell);
  taxValueCell.value = { formula: `${taxInfoCell2.address} * ${totalSumBeforeTaxValueCell.address}` };

  nextRow += 1;

  const totalSumTitleCell = getCell(sheet, nextRow, startCell.col);
  totalSumTitleCell.value = 'Общая сумма (Без НДС)';
  addBorderToLine(sheet, nextRow, startCell.col, startCell.col + 5);
  addColorToCellGroup(sheet, nextRow, startCell.col, startCell.col + 5, 'FF7BDFF2');
  addFont(totalSumTitleCell, true);

  const totalSumValueCell = getCell(sheet, nextRow, startCell.col + 6);
  addBorderToCell(totalSumValueCell);
  addFont(totalSumValueCell, true);
  totalSumValueCell.value = { formula: `${taxValueCell.address} + ${totalSumBeforeTaxValueCell.address}` };
  totalSumValueCell.alignment = { horizontal: 'right', vertical: 'middle' };
  addNumberFormat(totalSumValueCell);
  totalSumValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF60D394' } };

  nextRow += 1;

  const videoTitleCell = getCell(sheet, nextRow, startCell.col);
  videoTitleCell.value = 'Примерно за один ролик (для справки)';
  addBorderToLine(sheet, nextRow, startCell.col, startCell.col + 5);
  addFont(videoTitleCell);

  const videoValueCell = getCell(sheet, nextRow, startCell.col + 6);
  videoValueCell.alignment = { horizontal: 'right', vertical: 'middle' };
  addBorderToCell(videoValueCell);
  addNumberFormat(videoValueCell);
  addFont(videoValueCell);
  const videoCountCell = getNamedCellRef(wb, 'videoCount');

  videoValueCell.value = { formula: `IFERROR(${totalSumValueCell.address}/${videoCountCell.address}, "-")` };

  wb.calcProperties.fullCalcOnLoad = true;

  const buf = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fileName || 'report.xlsx'
  );
}
