import { describe, it, expect, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import { ExcelState } from './ExcelState';

describe('ExcelState', () => {
  let workbook: ExcelJS.Workbook;
  let worksheet: ExcelJS.Worksheet;
  let excelState: ExcelState;

  beforeEach(() => {
    workbook = new ExcelJS.Workbook();
    worksheet = workbook.addWorksheet('Test Sheet');
    excelState = new ExcelState(workbook);
  });

  describe('constructor', () => {
    it('should initialize with a workbook', () => {
      expect(excelState.wb).toBe(workbook);
    });
  });

  describe('addFont', () => {
    it('should add default font to a cell', () => {
      const cell = worksheet.getCell('A1');
      excelState.addFont(cell);

      expect(cell.font).toEqual({
        name: 'Montserrat',
        size: 10,
        bold: false,
        color: { argb: 'FF0F4C5C' },
      });
    });

    it('should add bold font to a cell', () => {
      const cell = worksheet.getCell('A1');
      excelState.addFont(cell, true);

      expect(cell.font?.bold).toBe(true);
      expect(cell.font?.name).toBe('Montserrat');
      expect(cell.font?.size).toBe(10);
    });
  });

  describe('addNumberFormat', () => {
    it('should add number format to a cell', () => {
      const cell = worksheet.getCell('A1');
      excelState.addNumberFormat(cell);

      expect(cell.numFmt).toBe('#,##0.00');
    });
  });

  describe('addBorderToCell', () => {
    it('should add borders to all sides by default', () => {
      const cell = worksheet.getCell('A1');
      excelState.addBorderToCell(cell);

      expect(cell.border?.top).toBeDefined();
      expect(cell.border?.left).toBeDefined();
      expect(cell.border?.bottom).toBeDefined();
      expect(cell.border?.right).toBeDefined();
    });

    it('should exclude specified sides', () => {
      const cell = worksheet.getCell('A1');
      excelState.addBorderToCell(cell, ['top', 'left']);

      expect(cell.border?.top).toBeUndefined();
      expect(cell.border?.left).toBeUndefined();
      expect(cell.border?.bottom).toBeDefined();
      expect(cell.border?.right).toBeDefined();
    });

    it('should use thin black border style', () => {
      const cell = worksheet.getCell('A1');
      excelState.addBorderToCell(cell);

      expect(cell.border?.top?.style).toBe('thin');
      expect(cell.border?.top?.color?.argb).toBe('FF000000');
    });
  });

  describe('getNamedCellRef', () => {
    it('should return undefined for non-existent named range', () => {
      const result = excelState.getNamedCellRef('nonExistent');
      expect(result).toBeUndefined();
    });
  });

  describe('setNamedCell', () => {
    it('should handle non-existent named cell gracefully', () => {
      expect(() => {
        excelState.setNamedCell('nonExistent', 'Test Value');
      }).not.toThrow();
    });
  });
});
