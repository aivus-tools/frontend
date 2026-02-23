import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  CategoriesExportData,
  CategoryWithoutSubcategories,
  CategoryWithSubcategories,
  ExportItem,
} from '@/types/store.interface';
import { Dayjs } from 'dayjs';
import { ExcelState } from './ExcelState';

const COLOR = {
  HEADER: 'FF7BDFF2',
  SUB: 'FFB2F7EF',
  TOTAL: 'FF60D394',
} as const;

const RIGHT_MIDDLE = { horizontal: 'right', vertical: 'middle' } as const;
const CENTER_MIDDLE = { horizontal: 'center', vertical: 'middle' } as const;

function addItems(
  excel: ExcelState,
  items: ExportItem[],
  rowIdx: number,
  colIndex: number,
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

    const nameCell = excel.getCell(nextRow, 0);
    nameCell.value = item.name;
    excel.addFont(nameCell);

    const priceCell = excel.getCell(nextRow, 1);
    priceCell.value = item.price ?? defaultValue;
    excel.addFont(priceCell);
    excel.addNumberFormat(priceCell);

    const [unit1, unit2] = item.units ?? [];
    const unit1Name = unit1?.key ?? defaultValue;
    const unit2Name = unit2?.key ?? defaultValue;

    const unit1KeyCell = excel.getCell(nextRow, 2);
    unit1KeyCell.value = unit1Name;
    excel.addFont(unit1KeyCell);
    unit1KeyCell.alignment = RIGHT_MIDDLE;

    const unit1ValCell = excel.getCell(nextRow, 3);
    unit1ValCell.value = unit1Name !== defaultValue ? (unit1?.value ?? 0) : defaultValue;
    excel.addFont(unit1ValCell);
    unit1ValCell.alignment = CENTER_MIDDLE;

    const unit2KeyCell = excel.getCell(nextRow, 4);
    unit2KeyCell.value = unit2Name;
    excel.addFont(unit2KeyCell);
    unit2KeyCell.alignment = RIGHT_MIDDLE;

    const unit2ValCell = excel.getCell(nextRow, 5);
    unit2ValCell.value = unit2Name !== defaultValue ? (unit2?.value ?? 0) : defaultValue;
    excel.addFont(unit2ValCell);
    unit2ValCell.alignment = CENTER_MIDDLE;

    // Insert the formula into the next cell: IF(ISNUMBER(price),price,0) * IF(ISNUMBER(u1),u1,1) * IF(ISNUMBER(u2),u2,1)
    const priceCellAddress = priceCell.address;
    const unit1ValAddress = unit1ValCell.address;
    const unit2ValAddress = unit2ValCell.address;

    const itemSumFormula =
      `IF(ISNUMBER(${priceCellAddress}),${priceCellAddress},0)` +
      `*IF(ISNUMBER(${unit1ValAddress}),${unit1ValAddress},1)` +
      `*IF(ISNUMBER(${unit2ValAddress}),${unit2ValAddress},1)`;

    const sumCell = excel.getCell(nextRow, 6);
    sumCell.value = { formula: itemSumFormula };
    excel.addFont(sumCell, true);
    excel.addNumberFormat(sumCell);

    excel.addBorderToRow(nextRow, colIndex, 6);

    nextRow += 1;
  }

  // Sum all item totals calculated above in this block (column  6)
  if (nextRow > rowIdx) {
    const firstAddr = excel.getCell(rowIdx, 6).address;
    const lastAddr = excel.getCell(nextRow - 1, 6).address;
    const itemsSumFormula = `SUM(${firstAddr}:${lastAddr})`;

    const totalCell = excel.getCell(nextRow, 6);
    totalCell.value = { formula: itemsSumFormula };
    totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    excel.addBorderToCell(totalCell);
    excel.addFont(totalCell, true);
    excel.addNumberFormat(totalCell);

    const prevRow = rowIdx - 1;

    if (minPrevRowForRollup === undefined || prevRow >= minPrevRowForRollup) {
      const headerTotalCell = excel.getCell(prevRow, 6);
      headerTotalCell.value = { formula: totalCell.address };
      excel.addFont(headerTotalCell, true);
      excel.addNumberFormat(headerTotalCell);
    }
  } else {
    // No items added; avoid empty SUM range
    excel.getCell(nextRow, 6).value = defaultValue;
  }

  nextRow += 1;

  return nextRow;
}

const isCategoryWithSubcategories = (
  v: CategoryWithSubcategories | CategoryWithoutSubcategories
): v is CategoryWithSubcategories => Array.isArray(v.data);

export async function exportToExcel(data: CategoriesExportData, fileName: string, date?: Dayjs, watermark?: string, offerId?: string, agencyFeePercent?: number) {
  const res = await fetch('/template.xlsx');
  if (!res.ok) {
    throw new Error(`Failed to fetch template.xlsx: ${res.status} ${res.statusText}`);
  }

  const arrBuf = await res.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(arrBuf);

  const excel = new ExcelState(wb);

  if (!excel.startCell) {
    throw new Error(`Failed to fetch template.xlsx: ${res.status} ${res.statusText}`);
  }

  const { col: startCol, row: startRow } = excel.startCell;

  if (date) {
    excel.writeNamedDate('date', date);
  }
  if (watermark) {
    excel.setNamedCell('watermark', watermark);
  }
  if (offerId) {
    excel.setNamedCell('offer_id', offerId);
  }

  let nextRow = excel.startCell.row;

  const categoryTotals: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const currentBlock = data.at(i);

    if (!currentBlock) {
      continue;
    }

    excel.addColorToCellGroup(nextRow, 6, COLOR.HEADER);
    excel.addBorderToLine(nextRow, 6);

    const categoryTitleCell = excel.getCell(nextRow, 0);
    categoryTitleCell.value = currentBlock.category.toUpperCase();
    excel.addFont(categoryTitleCell, true);

    nextRow += 1;

    if (isCategoryWithSubcategories(currentBlock)) {
      const headerTotalCell = excel.getCell(nextRow - 1, 6);

      const blockData = currentBlock.data;
      const subcategoryTotalAddresses: string[] = [];

      for (let j = 0; j < blockData.length; j++) {
        const sub = blockData.at(j);
        const subcategory = sub?.subcategory;

        if (!subcategory) {
          continue;
        }

        excel.addColorToCellGroup(nextRow, 6, COLOR.SUB);
        excel.addBorderToLine(nextRow, 6);

        const subcategoryCell = excel.getCell(nextRow, 0);
        subcategoryCell.value = subcategory;
        excel.addFont(subcategoryCell, true);

        nextRow += 1;

        nextRow = addItems(excel, sub?.items ?? [], nextRow, startCol, COLOR.SUB, startRow);

        subcategoryTotalAddresses.push(excel.getCell(nextRow - 1, 6).address);

        const subTotalCell = excel.getCell(nextRow - 1, 5);
        subTotalCell.value = `Section Total ${currentBlock.category.toUpperCase()} | ${subcategory}`;
        excel.addFont(subTotalCell, true);
        subTotalCell.alignment = RIGHT_MIDDLE;

        if (j === blockData.length - 1) {
          const totalCell = excel.getCell(nextRow, 5);
          totalCell.value = `TOTAL ${currentBlock.category.toUpperCase()}`;
          excel.addFont(totalCell, true);
          totalCell.alignment = RIGHT_MIDDLE;

          excel.addColorToCellGroup(nextRow, 5, COLOR.HEADER);
          excel.addBorderToLine(nextRow, 5);

          const categoryResultCell = excel.getCell(nextRow, 6);
          categoryResultCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.TOTAL } };

          categoryResultCell.value = {
            formula: `SUM(${subcategoryTotalAddresses.join(',')})`,
          };
          excel.addFont(categoryResultCell, true);
          excel.addNumberFormat(categoryResultCell);
          excel.addBorderToCell(categoryResultCell);
          categoryTotals.push(categoryResultCell.address);

          headerTotalCell.value = { formula: categoryResultCell.address };
          excel.addFont(headerTotalCell, true);
          excel.addNumberFormat(headerTotalCell);
        }

        nextRow += 1;
      }
    } else {
      nextRow = addItems(excel, currentBlock.data.items ?? [], nextRow, startCol, COLOR.TOTAL, startRow);
      const totalCell = excel.getCell(nextRow - 1, 5);
      totalCell.value = `TOTAL ${currentBlock.category.toUpperCase()}`;
      totalCell.alignment = RIGHT_MIDDLE;
      excel.addFont(totalCell, true);
      categoryTotals.push(excel.getCell(nextRow - 1, 6).address);

      excel.addColorToCellGroup(nextRow - 1, 5, COLOR.HEADER);
      excel.addBorderToLine(nextRow - 1, 5);
      nextRow += 1;
    }
  }

  nextRow += 1;

  const subtotalTitleCell = excel.getCell(nextRow, 0);
  subtotalTitleCell.value = 'Subtotal for All Sections';
  excel.addBorderToLine(nextRow, 5);
  excel.addColorToCellGroup(nextRow, 6, COLOR.SUB);
  excel.addFont(subtotalTitleCell, true);

  const subtotalValueCell = excel.getCell(nextRow, 6);
  excel.addBorderToCell(subtotalValueCell);
  excel.addFont(subtotalValueCell, true);
  subtotalValueCell.value = { formula: `SUM(${categoryTotals.join(',')})` };
  subtotalValueCell.alignment = RIGHT_MIDDLE;
  excel.addNumberFormat(subtotalValueCell);

  nextRow += 1;

  const feePercent = agencyFeePercent ?? 0;

  const agencyFeeTitleCell = excel.getCell(nextRow, 0);
  agencyFeeTitleCell.value = 'Agency Fee';
  excel.addBorderToLine(nextRow, 5);
  excel.addFont(agencyFeeTitleCell);

  const agencyFeePercentCell = excel.getCell(nextRow, 4);
  agencyFeePercentCell.value = 'Agency Fee';
  excel.addFont(agencyFeePercentCell);
  agencyFeePercentCell.alignment = RIGHT_MIDDLE;

  const agencyFeeRateCell = excel.getCell(nextRow, 5);
  agencyFeeRateCell.value = feePercent / 100;
  agencyFeeRateCell.numFmt = '0%';
  excel.addFont(agencyFeeRateCell);
  agencyFeeRateCell.alignment = CENTER_MIDDLE;

  const agencyFeeValueCell = excel.getCell(nextRow, 6);
  agencyFeeValueCell.alignment = RIGHT_MIDDLE;
  excel.addBorderToCell(agencyFeeValueCell);
  excel.addNumberFormat(agencyFeeValueCell);
  excel.addFont(agencyFeeValueCell);
  agencyFeeValueCell.value = { formula: `${agencyFeeRateCell.address}*${subtotalValueCell.address}` };

  nextRow += 1;

  const totalSumBeforeTaxTitleCell = excel.getCell(nextRow, 0);
  totalSumBeforeTaxTitleCell.value = 'Total Before Tax';
  excel.addBorderToLine(nextRow, 5);
  excel.addColorToCellGroup(nextRow, 6, COLOR.SUB);
  excel.addFont(totalSumBeforeTaxTitleCell, true);

  const totalSumBeforeTaxValueCell = excel.getCell(nextRow, 6);
  excel.addBorderToCell(totalSumBeforeTaxValueCell);
  excel.addFont(totalSumBeforeTaxValueCell, true);
  totalSumBeforeTaxValueCell.value = { formula: `${subtotalValueCell.address}+${agencyFeeValueCell.address}` };
  totalSumBeforeTaxValueCell.alignment = RIGHT_MIDDLE;
  excel.addNumberFormat(totalSumBeforeTaxValueCell);

  nextRow += 2;

  const taxTitleCell = excel.getCell(nextRow, 0);
  taxTitleCell.value = 'Sales Tax';
  excel.addBorderToLine(nextRow, 5);
  excel.addFont(taxTitleCell);

  const taxInfoCell1 = excel.getCell(nextRow, 4);
  taxInfoCell1.value = 'Sales Tax';
  excel.addFont(taxInfoCell1);
  taxInfoCell1.alignment = RIGHT_MIDDLE;

  const taxInfoCell2 = excel.getCell(nextRow, 5);
  taxInfoCell2.value = 0.09;
  taxInfoCell2.numFmt = '0%';
  excel.addFont(taxInfoCell2);
  taxInfoCell2.alignment = CENTER_MIDDLE;

  const taxValueCell = excel.getCell(nextRow, 6);
  taxValueCell.alignment = RIGHT_MIDDLE;
  excel.addBorderToCell(taxValueCell);
  excel.addNumberFormat(taxValueCell);
  excel.addFont(taxValueCell);
  taxValueCell.value = { formula: `${taxInfoCell2.address} * ${totalSumBeforeTaxValueCell.address}` };

  nextRow += 1;

  const totalSumTitleCell = excel.getCell(nextRow, 0);
  totalSumTitleCell.value = 'GRAND TOTAL';
  excel.addBorderToLine(nextRow, 5);
  excel.addColorToCellGroup(nextRow, 5, COLOR.HEADER);
  excel.addFont(totalSumTitleCell, true);

  const totalSumValueCell = excel.getCell(nextRow, 6);
  excel.addBorderToCell(totalSumValueCell);
  excel.addFont(totalSumValueCell, true);
  totalSumValueCell.value = { formula: `${taxValueCell.address} + ${totalSumBeforeTaxValueCell.address}` };
  totalSumValueCell.alignment = RIGHT_MIDDLE;
  excel.addNumberFormat(totalSumValueCell);
  totalSumValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.TOTAL } };

  nextRow += 1;

  const videoTitleCell = excel.getCell(nextRow, 0);
  videoTitleCell.value = 'Cost Per Video';
  excel.addBorderToLine(nextRow, 5);
  excel.addFont(videoTitleCell);

  const videoValueCell = excel.getCell(nextRow, 6);
  videoValueCell.alignment = RIGHT_MIDDLE;
  excel.addBorderToCell(videoValueCell);
  excel.addNumberFormat(videoValueCell);
  excel.addFont(videoValueCell);
  const videoCountCell = excel.getNamedCellRef('videoCount');

  if (videoCountCell) {
    videoValueCell.value = { formula: `IFERROR(${totalSumValueCell.address}/${videoCountCell.a1}, "-")` };
  }

  wb.calcProperties.fullCalcOnLoad = true;

  const buf = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fileName || 'report.xlsx'
  );
}
