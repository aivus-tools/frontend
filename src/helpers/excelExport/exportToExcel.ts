import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Dayjs } from 'dayjs';
import QRCode from 'qrcode';
import { OfferExportData } from '@/types/exportData.interface';
import { computeDisplayValues, stripHtml, buildSectionFees } from './exportUtils';

const FONT_NAME = 'Montserrat';
const TEXT_ARGB = 'FF4B5675';
const WHITE_ARGB = 'FFFFFFFF';
const BORDER_ARGB = 'FFD0D5DD';
const EN_DASH = '\u2013';

const COLOR = {
  ACCENT: 'FF7CDFF1',
  SUBTOTAL: 'FFE8F5FD',
  TOTAL_PRICE: 'FF60D394',
} as const;

const THIN_BORDER: ExcelJS.Border = { style: 'thin', color: { argb: BORDER_ARGB } };

const ALL_BORDERS: Partial<ExcelJS.Borders> = {
  top: THIN_BORDER,
  left: THIN_BORDER,
  bottom: THIN_BORDER,
  right: THIN_BORDER,
};

const font = (bold = false, size = 10, color = TEXT_ARGB): Partial<ExcelJS.Font> => {
  return { name: FONT_NAME, size, bold, color: { argb: color } };
};

const fillSolid = (argb: string): ExcelJS.Fill => {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
};

const NUM_FMT = '#,##0.00';

const formatTopSheetCurrency = (value: number): string | number => {
  if (value === 0) {
    return EN_DASH;
  }
  return value;
};

const formatDetailCurrency = (value: number): number => {
  return value;
};

interface SectionGroup {
  id: string;
  code: string;
  name: string;
  tags: string[];
  children: Array<{ code: string; name: string; total: number }>;
  subtotal: number;
}

const applyRowFill = (sheet: ExcelJS.Worksheet, rowNum: number, startCol: number, endCol: number, argb: string): void => {
  const row = sheet.getRow(rowNum);
  for (let col = startCol; col <= endCol; col++) {
    row.getCell(col).fill = fillSolid(argb);
  }
};

const applyRowBorders = (sheet: ExcelJS.Worksheet, rowNum: number, startCol: number, endCol: number): void => {
  const row = sheet.getRow(rowNum);
  for (let col = startCol; col <= endCol; col++) {
    row.getCell(col).border = ALL_BORDERS;
  }
};

const setCellValue = (
  sheet: ExcelJS.Worksheet,
  rowNum: number,
  col: number,
  value: ExcelJS.CellValue,
  options?: {
    bold?: boolean;
    size?: number;
    color?: string;
    numFmt?: string;
    alignment?: Partial<ExcelJS.Alignment>;
    fill?: string;
    border?: boolean;
  },
): ExcelJS.Cell => {
  const cell = sheet.getRow(rowNum).getCell(col);
  cell.value = value;
  cell.font = font(options?.bold ?? false, options?.size ?? 10, options?.color ?? TEXT_ARGB);
  if (options?.numFmt) {
    cell.numFmt = options.numFmt;
  }
  if (options?.alignment) {
    cell.alignment = options.alignment;
  }
  if (options?.fill) {
    cell.fill = fillSolid(options.fill);
  }
  if (options?.border) {
    cell.border = ALL_BORDERS;
  }
  return cell;
};

const formatDate = (value: string | null): string => {
  if (value == null) {
    return '';
  }
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

function writeCoverSection(sheet: ExcelJS.Worksheet, data: OfferExportData, exportDate: Dayjs | null, watermark: string | null): number {
  const producer = data.collaborators.find(x => x.role === 'producer') ?? null;
  const agencyProducer = data.collaborators.find(x => x.role === 'agency_producer') ?? null;
  const firstClientManager = data.project.clientManagers.length > 0
    ? data.project.clientManagers[0]
    : null;

  const clientBrand = [data.project.clientName, data.project.brandName]
    .filter(x => x != null)
    .join(' / ') || '';

  const companyName = data.vendor.companyName ?? data.vendor.name;
  const clientManagerValue = firstClientManager != null
    ? `${firstClientManager.name}${firstClientManager.position ? ', ' + firstClientManager.position : ''}`
    : '';

  setCellValue(sheet, 1, 1, companyName, { bold: true, size: 14 });

  const pairStartRow = 6;

  let leftRow = pairStartRow;
  setCellValue(sheet, leftRow, 1, 'Production:', { size: 10 });
  setCellValue(sheet, leftRow, 2, companyName, { bold: true, size: 10 });
  leftRow++;
  setCellValue(sheet, leftRow, 1, 'Producer:', { size: 10 });
  setCellValue(sheet, leftRow, 2, producer != null ? producer.name : '', { bold: true, size: 10 });
  leftRow++;
  leftRow++;
  setCellValue(sheet, leftRow, 1, 'Term:', { size: 10 });
  setCellValue(sheet, leftRow, 2, data.offer.term ?? '', { bold: true, size: 10 });
  leftRow++;
  setCellValue(sheet, leftRow, 1, 'Territory:', { size: 10 });
  setCellValue(sheet, leftRow, 2, data.offer.territory.length > 0 ? data.offer.territory.join(', ') : '', { bold: true, size: 10 });
  leftRow++;
  setCellValue(sheet, leftRow, 1, 'Media / Placements:', { size: 10 });
  setCellValue(sheet, leftRow, 2, data.offer.mediaPlacements.length > 0 ? data.offer.mediaPlacements.join(', ') : '', { bold: true, size: 10 });
  leftRow++;

  let rightRow = pairStartRow;
  setCellValue(sheet, rightRow, 3, 'Job Name:', { size: 10 });
  setCellValue(sheet, rightRow, 4, data.project.name, { bold: true, size: 10 });
  rightRow++;
  setCellValue(sheet, rightRow, 3, 'Bid Date:', { size: 10 });
  setCellValue(sheet, rightRow, 4, formatDate(data.offer.bidDate), { bold: true, size: 10 });
  rightRow++;
  setCellValue(sheet, rightRow, 3, 'Bid Version:', { size: 10 });
  setCellValue(sheet, rightRow, 4, data.offer.revision ?? 'Initial Bidding', { bold: true, size: 10 });
  rightRow++;
  setCellValue(sheet, rightRow, 3, 'AIVUS ID:', { size: 10 });
  setCellValue(sheet, rightRow, 4, data.offer.uuid, { bold: true, size: 10 });
  rightRow++;
  rightRow++;
  setCellValue(sheet, rightRow, 3, 'Client / Brand:', { size: 10 });
  setCellValue(sheet, rightRow, 4, clientBrand, { bold: true, size: 10 });
  rightRow++;
  setCellValue(sheet, rightRow, 3, 'Client Manager:', { size: 10 });
  setCellValue(sheet, rightRow, 4, clientManagerValue, { bold: true, size: 10 });
  rightRow++;
  rightRow++;
  setCellValue(sheet, rightRow, 3, 'Agency:', { size: 10 });
  setCellValue(sheet, rightRow, 4, data.project.agencyName ?? '', { bold: true, size: 10 });
  rightRow++;
  setCellValue(sheet, rightRow, 3, 'Agency Producer:', { size: 10 });
  setCellValue(sheet, rightRow, 4, agencyProducer != null ? agencyProducer.name : '', { bold: true, size: 10 });
  rightRow++;

  let row = Math.max(leftRow, rightRow);
  row++;

  if (data.offer.deliverables.length > 0) {
    setCellValue(sheet, row, 1, 'Deliverables:', { bold: true, size: 10 });
    row++;

    for (const d of data.offer.deliverables) {
      const parts = [
        `${d.quantity} x :${d.duration} ${d.durationUnit}.`,
        d.notes ? `${EN_DASH} ${d.notes}` : null,
      ].filter(x => x != null).join(' ');

      setCellValue(sheet, row, 1, parts, { size: 10 });
      row++;
    }

    row++;
  }

  if (data.offer.coverPageNotes) {
    setCellValue(sheet, row, 1, 'Notes:', { bold: true, size: 10 });
    row++;

    const notesText = stripHtml(data.offer.coverPageNotes);
    const notesCell = setCellValue(sheet, row, 1, notesText, { size: 10 });
    notesCell.alignment = { wrapText: true, vertical: 'top' };
    sheet.mergeCells(row, 1, row, 7);
    row++;

    row++;
  }

  if (data.shareToken != null) {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/public/${data.shareToken}`;
    setCellValue(sheet, row, 1, 'Share Link:', { bold: true, size: 10 });
    const linkCell = setCellValue(sheet, row, 2, { text: shareUrl, hyperlink: shareUrl }, { size: 10, color: 'FF0563C1' });
    linkCell.font = { ...linkCell.font!, underline: true };
    row++;

    row++;
  }

  if (exportDate != null) {
    setCellValue(sheet, row, 1, 'Export Date:', { size: 10 });
    setCellValue(sheet, row, 2, exportDate.format('MM/DD/YYYY'), { bold: true, size: 10 });
    row++;
  }

  if (watermark) {
    setCellValue(sheet, row, 1, watermark, { size: 9, color: 'FF99A1B7' });
    row++;
  }

  if (exportDate != null || watermark) {
    row++;
  }

  for (let c = 1; c <= 7; c++) {
    const dividerCell = sheet.getRow(row).getCell(c);
    dividerCell.border = { bottom: { style: 'medium', color: { argb: COLOR.ACCENT } } };
  }
  row++;

  row++;

  return row;
}

function writeTopSheet(sheet: ExcelJS.Worksheet, data: OfferExportData, startRow: number): number {
  let row = startRow;

  const groupsMap = new Map<string, SectionGroup>();

  for (const cat of data.categories) {
    const parentKey = cat.parentCategoryId || cat.id;
    const existing = groupsMap.get(parentKey);
    if (existing) {
      existing.children.push({ code: cat.code, name: cat.name, total: cat.sectionTotal });
      existing.subtotal += cat.sectionTotal;
    } else {
      groupsMap.set(parentKey, {
        id: cat.parentCategoryId || cat.id,
        code: cat.parentCategoryCode || cat.code,
        name: cat.parentCategoryName || cat.name,
        tags: cat.parentTags.length > 0 ? cat.parentTags : cat.tags,
        children: [{ code: cat.code, name: cat.name, total: cat.sectionTotal }],
        subtotal: cat.sectionTotal,
      });
    }
  }

  const groups = Array.from(groupsMap.values());

  let grandTotal = 0;
  const sections = groups.map(group => {
    const fees = buildSectionFees(group.id, group.tags, group.subtotal, data.offer);
    const feesTotal = fees.reduce((sum, x) => sum + x.value, 0);
    const sectionTotal = group.subtotal + feesTotal;
    grandTotal += sectionTotal;
    return { ...group, fees, sectionTotal };
  });

  const TS_COL_CODE = 1;
  const TS_COL_NAME = 2;
  const TS_COL_NOTE = 3;
  const TS_COL_PRICE = 4;

  for (const section of sections) {
    applyRowFill(sheet, row, TS_COL_CODE, TS_COL_PRICE, COLOR.ACCENT);
    applyRowBorders(sheet, row, TS_COL_CODE, TS_COL_PRICE);

    setCellValue(sheet, row, TS_COL_NAME, section.name, { bold: true, size: 10, color: WHITE_ARGB });
    setCellValue(sheet, row, TS_COL_NOTE, 'NOTE', { bold: true, size: 10, color: WHITE_ARGB, alignment: { horizontal: 'left' } });
    row++;

    for (const child of section.children) {
      setCellValue(sheet, row, TS_COL_CODE, child.code, { border: true });
      setCellValue(sheet, row, TS_COL_NAME, child.name, { border: true });
      setCellValue(sheet, row, TS_COL_NOTE, '', { border: true });
      setCellValue(sheet, row, TS_COL_PRICE, formatTopSheetCurrency(child.total), {
        border: true,
        numFmt: NUM_FMT,
        alignment: { horizontal: 'right' },
      });
      row++;
    }

    applyRowFill(sheet, row, TS_COL_CODE, TS_COL_PRICE, COLOR.SUBTOTAL);
    applyRowBorders(sheet, row, TS_COL_CODE, TS_COL_PRICE);
    setCellValue(sheet, row, TS_COL_NOTE, `Sub-Total ${section.name}`, {
      bold: true, alignment: { horizontal: 'right' },
    });
    setCellValue(sheet, row, TS_COL_PRICE, formatTopSheetCurrency(section.subtotal), {
      bold: true, numFmt: NUM_FMT, alignment: { horizontal: 'right' },
    });
    row++;

    for (const fee of section.fees) {
      setCellValue(sheet, row, TS_COL_CODE, '', { border: true });
      setCellValue(sheet, row, TS_COL_NAME, '', { border: true });
      setCellValue(sheet, row, TS_COL_NOTE, `${fee.label} (${fee.percent}%)`, { border: true, color: 'FF99A1B7', alignment: { horizontal: 'right' } });
      setCellValue(sheet, row, TS_COL_PRICE, formatTopSheetCurrency(fee.value), {
        border: true, numFmt: NUM_FMT, alignment: { horizontal: 'right' },
      });
      row++;
    }

    applyRowFill(sheet, row, TS_COL_CODE, TS_COL_PRICE, COLOR.ACCENT);
    applyRowBorders(sheet, row, TS_COL_CODE, TS_COL_PRICE);
    setCellValue(sheet, row, TS_COL_NOTE, `${section.name.toUpperCase()} TOTAL`, {
      bold: true, color: WHITE_ARGB, alignment: { horizontal: 'right' },
    });
    setCellValue(sheet, row, TS_COL_PRICE, formatTopSheetCurrency(section.sectionTotal), {
      bold: true, color: WHITE_ARGB, numFmt: NUM_FMT, alignment: { horizontal: 'right' },
    });
    row++;

    row++;
  }

  applyRowFill(sheet, row, TS_COL_CODE, TS_COL_NOTE, COLOR.ACCENT);
  applyRowBorders(sheet, row, TS_COL_CODE, TS_COL_PRICE);
  setCellValue(sheet, row, TS_COL_NOTE, 'GRAND TOTAL', {
    bold: true, size: 12, color: 'FF0F4C5C', alignment: { horizontal: 'right' },
  });
  setCellValue(sheet, row, TS_COL_PRICE, formatTopSheetCurrency(grandTotal), {
    bold: true, size: 12, color: 'FF0F4C5C', numFmt: NUM_FMT,
    alignment: { horizontal: 'right' }, fill: COLOR.TOTAL_PRICE,
  });
  row++;

  return row;
}

function writeBudgetDetail(sheet: ExcelJS.Worksheet, data: OfferExportData, startRow: number): number {
  const detailCategories = data.categories.filter(
    x => x.entries.length > 0 && x.parentCategoryId != null,
  );

  if (detailCategories.length === 0) {
    return startRow;
  }

  const BD_COLS = 9;
  const extraColWidths: Array<{ col: number; width: number }> = [
    { col: 8, width: 12 },
    { col: 9, width: 14 },
  ];
  for (const cw of extraColWidths) {
    const current = sheet.getColumn(cw.col).width ?? 8;
    if (current < cw.width) {
      sheet.getColumn(cw.col).width = cw.width;
    }
  }

  let row = startRow;

  setCellValue(sheet, row, 1, 'Budget Detail', { bold: true, size: 14 });
  row += 2;

  const columnHeaders = ['ID', 'Description', 'Rate', 'Qty', 'Units', 'Qty', 'Units', 'Overtime', 'ESTIMATE'];

  for (const section of detailCategories) {
    const titleText = section.code ? `${section.code} ${EN_DASH} ${section.name}` : section.name;
    applyRowFill(sheet, row, 1, BD_COLS, COLOR.ACCENT);
    applyRowBorders(sheet, row, 1, BD_COLS);
    setCellValue(sheet, row, 1, titleText, { bold: true, size: 11, color: WHITE_ARGB });
    sheet.mergeCells(row, 1, row, BD_COLS);
    row++;

    applyRowFill(sheet, row, 1, BD_COLS, COLOR.SUBTOTAL);
    for (let c = 0; c < BD_COLS; c++) {
      setCellValue(sheet, row, c + 1, columnHeaders[c], {
        bold: true, size: 9, alignment: { horizontal: c >= 2 ? 'right' : 'left' }, border: true,
      });
    }
    row++;

    for (const entry of section.entries) {
      const display = computeDisplayValues(entry);
      setCellValue(sheet, row, 1, entry.code, { border: true, alignment: { horizontal: 'center' } });
      setCellValue(sheet, row, 2, entry.name, { border: true });
      setCellValue(sheet, row, 3, formatDetailCurrency(display.rate), { border: true, numFmt: NUM_FMT, alignment: { horizontal: 'right' } });
      setCellValue(sheet, row, 4, entry.units[0] != null ? entry.units[0].count : '', { border: true, alignment: { horizontal: 'right' } });
      setCellValue(sheet, row, 5, entry.units[0] != null ? entry.units[0].symbol : '', { border: true, alignment: { horizontal: 'right' } });
      setCellValue(sheet, row, 6, entry.units[1] != null ? entry.units[1].count : '', { border: true, alignment: { horizontal: 'right' } });
      setCellValue(sheet, row, 7, entry.units[1] != null ? entry.units[1].symbol : '', { border: true, alignment: { horizontal: 'right' } });
      setCellValue(sheet, row, 8, display.overtime > 0 ? formatDetailCurrency(display.overtime) : EN_DASH, { border: true, numFmt: display.overtime > 0 ? NUM_FMT : undefined, alignment: { horizontal: 'right' } });
      setCellValue(sheet, row, 9, formatDetailCurrency(entry.estimate), { bold: true, border: true, numFmt: NUM_FMT, alignment: { horizontal: 'right' } });
      row++;
    }

    applyRowFill(sheet, row, 1, BD_COLS, COLOR.SUBTOTAL);
    applyRowBorders(sheet, row, 1, BD_COLS);
    setCellValue(sheet, row, 8, 'Sub Total', { bold: true, alignment: { horizontal: 'right' } });
    setCellValue(sheet, row, 9, formatDetailCurrency(section.subTotal), { bold: true, numFmt: NUM_FMT, alignment: { horizontal: 'right' } });
    row++;

    if (section.fringes != null) {
      applyRowFill(sheet, row, 1, BD_COLS, COLOR.SUBTOTAL);
      applyRowBorders(sheet, row, 1, BD_COLS);
      setCellValue(sheet, row, 8, 'Fringes', { alignment: { horizontal: 'right' } });
      setCellValue(sheet, row, 9, formatDetailCurrency(section.fringes), { numFmt: NUM_FMT, alignment: { horizontal: 'right' } });
      row++;
    }

    applyRowFill(sheet, row, 1, BD_COLS, COLOR.ACCENT);
    applyRowBorders(sheet, row, 1, BD_COLS);
    setCellValue(sheet, row, 8, `TOTAL ${section.code ?? ''}`, { bold: true, color: WHITE_ARGB, alignment: { horizontal: 'right' } });
    setCellValue(sheet, row, 9, formatDetailCurrency(section.sectionTotal), { bold: true, color: WHITE_ARGB, numFmt: NUM_FMT, alignment: { horizontal: 'right' } });
    row++;

    row++;
  }

  return row;
}

function writeAssumptions(sheet: ExcelJS.Worksheet, data: OfferExportData, startRow: number): number {
  if (!data.offer.assumptionsExclusions) {
    return startRow;
  }

  let row = startRow;

  setCellValue(sheet, row, 1, 'Assumptions & Exclusions', { bold: true, size: 14 });
  row += 2;

  const text = stripHtml(data.offer.assumptionsExclusions);
  const cell = setCellValue(sheet, row, 1, text, { size: 10 });
  cell.alignment = { wrapText: true, vertical: 'top' };
  sheet.mergeCells(row, 1, row, 7);
  row++;

  return row;
}

async function fetchImageBuffer(url: string): Promise<{ buffer: ArrayBuffer; extension: 'png' | 'jpeg' } | null> {
  try {
    const fullUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
    const response = await fetch(fullUrl);
    if (!response.ok) {
      return null;
    }
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || '';
    const extension: 'png' | 'jpeg' = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpeg' : 'png';
    return { buffer, extension };
  } catch {
    return null;
  }
}

async function tryAddLogo(
  wb: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  logoUrl: string,
): Promise<void> {
  const image = await fetchImageBuffer(logoUrl);
  if (image == null) {
    return;
  }
  const imageId = wb.addImage({ buffer: image.buffer, extension: image.extension });
  sheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    ext: { width: 200, height: 70 },
  });
}

async function tryAddQrCode(
  wb: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  shareToken: string,
): Promise<void> {
  try {
    const shareUrl = `${window.location.origin}/public/${shareToken}`;
    const dataUrl = await QRCode.toDataURL(shareUrl, { width: 120, margin: 1 });
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    const imageId = wb.addImage({ buffer, extension: 'png' });
    sheet.addImage(imageId, {
      tl: { col: 4, row: 0 },
      ext: { width: 100, height: 100 },
    });
  } catch {
    // noop
  }
}

export async function exportOfferToExcel(
  data: OfferExportData,
  options: { fileName: string; date?: Dayjs; watermark?: string },
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.calcProperties.fullCalcOnLoad = true;

  const estimateSheet = wb.addWorksheet('Estimate');

  estimateSheet.getColumn(1).width = 18;
  estimateSheet.getColumn(2).width = 30;
  estimateSheet.getColumn(3).width = 30;
  estimateSheet.getColumn(4).width = 18;
  estimateSheet.getColumn(5).width = 18;
  estimateSheet.getColumn(6).width = 22;
  estimateSheet.getColumn(7).width = 22;

  const imagePromises: Array<Promise<void>> = [];
  if (data.vendor.logoUrl != null) {
    imagePromises.push(tryAddLogo(wb, estimateSheet, data.vendor.logoUrl));
  }
  if (data.shareToken != null) {
    imagePromises.push(tryAddQrCode(wb, estimateSheet, data.shareToken));
  }
  await Promise.all(imagePromises);

  const exportDate = options.date ?? null;
  const watermark = options.watermark ?? null;

  const topSheetStart = writeCoverSection(estimateSheet, data, exportDate, watermark);
  const afterTopSheet = writeTopSheet(estimateSheet, data, topSheetStart);

  const afterAssumptions = writeAssumptions(estimateSheet, data, afterTopSheet + 1);
  writeBudgetDetail(estimateSheet, data, afterAssumptions + 1);

  const buf = await wb.xlsx.writeBuffer();
  const fileName = options.fileName || 'estimate';
  const fullName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;

  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fullName,
  );
}
