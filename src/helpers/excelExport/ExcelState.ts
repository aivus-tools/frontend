import ExcelJS, { type BorderStyle } from 'exceljs';
import { Dayjs } from 'dayjs';

type CellSide = 'top' | 'left' | 'bottom' | 'right';
const FONT_NAME = 'Montserrat';
const FONT_COLOR = { argb: 'FF0F4C5C' };

export class ExcelState {
  constructor(wb: ExcelJS.Workbook) {
    this.wb = wb;
  }

  wb: ExcelJS.Workbook;

  get startCell() {
    return this.getNamedCellRef('tableStart');
  }

  addBorderToCell(cell: ExcelJS.Cell, exclude: CellSide[] = []): void {
    const thinBorder = { style: 'thin' as BorderStyle, color: { argb: 'FF000000' } };

    cell.border = {
      top: exclude.includes('top') ? undefined : thinBorder,
      left: exclude.includes('left') ? undefined : thinBorder,
      bottom: exclude.includes('bottom') ? undefined : thinBorder,
      right: exclude.includes('right') ? undefined : thinBorder,
    };
  }

  addFont(cell: ExcelJS.Cell, bold: boolean = false): void {
    cell.font = { name: FONT_NAME, size: 10, bold, color: FONT_COLOR };
  }

  addColorToCellGroup(rowIndex: number, length: number, color: string, startColumn?: number): void {
    if (!this.startCell) {
      return;
    }

    const start = startColumn ?? this.startCell.col;
    const end = start + length;

    for (let col = start; col <= end; col++) {
      const cell = this.startCell.sheet.getCell(rowIndex, col);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    }
  }

  addNumberFormat(cell: ExcelJS.Cell): void {
    cell.numFmt = '#,##0.00';
  }

  addBorderToRow(rowIndex: number, startCol: number, endCol: number) {
    if (!this.startCell) {
      return;
    }

    const row = this.startCell.sheet.getRow(rowIndex);

    for (let col = startCol; col <= endCol; col++) {
      this.addBorderToCell(row.getCell(col));
    }
  }

  addBorderToLine(rowIndex: number, length: number, startColumn?: number) {
    if (!this.startCell) {
      return;
    }

    const start = startColumn ?? this.startCell.col;
    const end = start + length;

    const row = this.startCell.sheet.getRow(rowIndex);

    for (let col = start; col <= end; col++) {
      const exclude: CellSide[] = [];
      if (col === start) {
        exclude.push('right');
      } else if (col === end) {
        exclude.push('left');
      } else {
        exclude.push('left', 'right');
      }

      this.addBorderToCell(row.getCell(col), exclude);
    }
  }

  getCell(row: number, col: number, startColumn?: number): ExcelJS.Cell {
    const start = startColumn ?? this.startCell!.col;

    return this.startCell!.sheet.getCell(row, start + col);
  }

  getNamedCellRef(name: string):
    | {
        sheet: ExcelJS.Worksheet;
        a1: string;
        row: number;
        col: number;
      }
    | undefined {
    const matrix = this.wb.definedNames.getMatrix(name);

    const cells = matrix.map((cell) => cell);

    if (cells.length === 0) {
      return undefined;
    }

    let bestCell = cells[0];
    let minRow = Infinity;
    let minCol = Infinity;

    for (const cell of cells) {
      // eslint-disable-next-line
      const cellWithAddress = cell as any;
      const address = cellWithAddress.$col$row || cellWithAddress.address || cell.address;
      const { row, col } = this.a1ToRC(String(address));

      if (row < minRow || (row === minRow && col < minCol)) {
        minRow = row;
        minCol = col;
        bestCell = cell;
      }
    }

    const sheet = bestCell.worksheet;
    const a1 = `$${sheet.getColumn(minCol).letter}$${minRow}`;

    return { sheet, a1, row: minRow, col: minCol };
  }

  setNamedCell(name: string, value: ExcelJS.CellValue): void {
    const ref = this.getNamedCellRef(name);

    if (ref) {
      ref.sheet.getCell(ref.a1).value = value;
    }
  }

  writeNamedDate(namedRange = 'date', value?: Dayjs) {
    const ref = this.getNamedCellRef(namedRange);

    if (!ref) {
      return;
    }

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
    cell.font = { name: FONT_NAME, size: 12, color: FONT_COLOR };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  }

  private a1ToRC(a1: string): { row: number; col: number } {
    const match = a1.match(/\$?([A-Z]+)\$?(\d+)$/i);

    if (!match) {
      throw new Error(`Bad A1 address: ${a1}`);
    }

    const letters = match[1].toUpperCase();
    const row = parseInt(match[2], 10);
    let col = 0;

    for (let i = 0; i < letters.length; i++) {
      col = col * 26 + (letters.charCodeAt(i) - 64);
    }
    return { row, col };
  }
}
