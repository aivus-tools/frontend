# Frontend Test Suite - AIVUS Project

## Overview
This document describes the comprehensive test setup for the AIVUS frontend application using Vitest and React Testing Library.

## Test Stack
- **Test Framework**: Vitest 4.0.18
- **Testing Library**: @testing-library/react
- **Assertion Library**: @testing-library/jest-dom
- **User Interaction**: @testing-library/user-event
- **Environment**: jsdom

## Configuration

### Vitest Config (`vitest.config.ts`)
- **Environment**: jsdom (for DOM simulation)
- **Globals**: Enabled for describe/it/expect
- **Setup File**: `src/test/setup.ts`
- **Coverage**: V8 provider with text and HTML reporters
- **Path Alias**: `@` → `./src`

### Test Setup (`src/test/setup.ts`)
- Imports jest-dom matchers
- Sets environment variables:
  - `NEXT_PUBLIC_LOCALE = 'en'`
  - `HMAC_SECRET = 'test-hmac-secret-key'`

## Test Coverage

### Current Statistics
- **Total Tests**: 117
- **Test Files**: 8
- **Pass Rate**: 100%

### Test Files and Coverage

#### 1. i18n System (`src/lib/i18n.test.ts`) - 11 tests
Tests the internationalization system:
- ✓ String translation keys
- ✓ Function-based translations with parameters
- ✓ Fallback behavior for missing keys
- ✓ Rich text parsing with component replacement
- ✓ Locale detection

**Key Functions Tested**:
- `t()` - Translation function
- `tRich()` - Rich text translation
- Locale configuration

#### 2. HMAC Authentication (`src/lib/hmac.test.ts`) - 7 tests
Tests HMAC signature generation for API security:
- ✓ SHA-256 signature generation
- ✓ Signature consistency
- ✓ Hex string format validation
- ✓ Edge cases (empty strings, special characters)
- ✓ JSON payload handling

**Key Functions Tested**:
- `createHmacSHA256(message)` - HMAC signature generation

#### 3. Utility Functions (`src/lib/utils.test.ts`) - 19 tests
Tests core utility functions for calculations and formatting:
- ✓ Percentage calculations
- ✓ Number rounding
- ✓ Currency formatting with locale support
- ✓ Edge cases (zero, negative, large numbers)

**Key Functions Tested**:
- `applyPercentage(value, percent)` - Calculate percentage of value
- `round(x)` - Round to 2 decimal places
- `formatCurrency(value)` - Format as USD currency

#### 4. Form Validation (`src/lib/definitions.test.ts`) - 13 tests
Tests Zod schemas for form validation:
- ✓ Email validation (various formats)
- ✓ Password validation (minimum 8 characters)
- ✓ Invalid input rejection
- ✓ Error message generation

**Key Schemas Tested**:
- `SignupFormSchema` - Email validation
- `PasswordSchema` - Password requirements

#### 5. Fetcher Service (`src/lib/fetcher.test.ts`) - 6 tests
Tests the base fetch wrapper:
- ✓ Successful JSON parsing
- ✓ Error handling (404, 500, etc.)
- ✓ Fetch options passing
- ✓ TypeScript type inference

**Key Functions Tested**:
- `fetcher<T>(...args)` - Generic fetch wrapper

#### 6. Offer Selectors (`src/store/slices/offer/selectors.test.ts`) - 32 tests
**Most critical business logic tests**. Tests Redux selectors for offer calculations:

**Basic Selectors** (5 tests):
- ✓ Offer details, dictionary, metadata
- ✓ External flag, cost per video visibility

**Category Selectors** (3 tests):
- ✓ Root category filtering
- ✓ Subcategory hierarchies
- ✓ Empty state handling

**Offer Item Selectors** (3 tests):
- ✓ Filter offers by category
- ✓ Find offer by ID
- ✓ Non-existent offer handling

**Cost Calculations** (3 tests):
- ✓ Total sum calculation (vendor)
- ✓ Client total sum calculation
- ✓ Empty offers handling

**Unforeseen Expenses** (3 tests):
- ✓ Percentage-based expense calculation
- ✓ Vendor vs client percentages
- ✓ Visibility toggle

**Grand Total** (2 tests):
- ✓ Total with unforeseen expenses
- ✓ Total without unforeseen expenses

**Category Totals** (3 tests):
- ✓ Category sum including subcategories
- ✓ Category sum without subcategories
- ✓ Non-existent category handling

**Surcharge Selectors** (3 tests):
- ✓ Category-specific surcharge
- ✓ Overall surcharge
- ✓ Default values

**Cost Per Video** (4 tests):
- ✓ Division by video count
- ✓ Single video handling
- ✓ Zero count safety (defaults to 1)
- ✓ Decimal video counts

**Export Data** (3 tests):
- ✓ Category data preparation
- ✓ Subcategory inclusion
- ✓ Unit filtering

#### 7. Excel Export State (`src/helpers/excelExport/ExcelState.test.ts`) - 9 tests
Tests ExcelJS wrapper for XLSX export:
- ✓ Workbook initialization
- ✓ Font styling (Montserrat, bold, colors)
- ✓ Number formatting (#,##0.00)
- ✓ Border application (all sides, selective)
- ✓ Named cell references
- ✓ Error handling for missing cells

**Key Methods Tested**:
- `addFont(cell, bold)` - Font styling
- `addNumberFormat(cell)` - Number format
- `addBorderToCell(cell, exclude)` - Border styling
- `getNamedCellRef(name)` - Named range lookup
- `setNamedCell(name, value)` - Named cell setter

#### 8. Helper Functions (`src/helpers/helper.test.tsx`) - 20 tests
Tests common helper functions:

**Price Formatting** (7 tests):
- ✓ Dollar sign and decimal formatting
- ✓ Comma separators for thousands
- ✓ Rounding to 1 decimal place
- ✓ Null/undefined handling
- ✓ Negative values

**Cost Calculation** (5 tests):
- ✓ Price × quantity
- ✓ Zero handling
- ✓ Decimal values
- ✓ Negative values

**Date Manipulation** (8 tests):
- ✓ Add/subtract months in UTC
- ✓ Year rollover
- ✓ Month-end date handling
- ✓ Zero months (no change)
- ✓ Large month increments

**Key Functions Tested**:
- `formatPrice(price)` - Format with $, comma separators, 1 decimal
- `getCost(price, quantity)` - Calculate item cost
- `addMonthsUTC(date, months)` - Add months to UTC date

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### UI Mode (interactive browser)
```bash
npm run test:ui
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Patterns

### Unit Test Structure
```typescript
import { describe, it, expect } from 'vitest';

describe('Module/Function Name', () => {
  describe('specific function', () => {
    it('should handle typical case', () => {
      const result = functionUnderTest(input);
      expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
      const result = functionUnderTest(edgeInput);
      expect(result).toBe(edgeExpected);
    });
  });
});
```

### Selector Test Pattern
```typescript
const createMockState = (overrides?: Partial<OfferState>) => ({
  offer: {
    offerDetails: { /* default state */ },
    ...overrides,
  },
});

describe('selector', () => {
  it('should select and transform data', () => {
    const state = createMockState();
    const result = selector(state);
    expect(result).toEqual(expected);
  });
});
```

### Validation Test Pattern
```typescript
describe('Schema', () => {
  it('should accept valid input', () => {
    const result = Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid input', () => {
    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBeDefined();
    }
  });
});
```

## Critical Business Logic Covered

### Financial Calculations
- ✓ Total cost calculation (vendor + client)
- ✓ Unforeseen expenses (percentage-based)
- ✓ Grand total (with/without expenses)
- ✓ Category subtotals (including subcategories)
- ✓ Cost per video (division with safety)
- ✓ Surcharge application

### Data Transformation
- ✓ Category hierarchies (root + subcategories)
- ✓ Offer filtering by category
- ✓ Export data preparation (XLSX format)
- ✓ Unit normalization

### User Input Validation
- ✓ Email format validation
- ✓ Password strength (min 8 chars)
- ✓ Form error messages

### Security
- ✓ HMAC signature generation
- ✓ Payload integrity

## What's NOT Covered (Future Work)

### Component Tests
- Client/Vendor dashboard components
- ComparisonTable component
- ClientOfferTable component
- Sidebar components
- Form components (Brief, Estimation)

### Integration Tests
- RTK Query API integration
- NextAuth.js authentication flow
- Redux store integration

### E2E Tests
- Full user workflows
- Multi-page navigation
- File upload/download

## Dependencies

```json
{
  "devDependencies": {
    "vitest": "^4.0.18",
    "@vitejs/plugin-react": "latest",
    "jsdom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/user-event": "latest",
    "@vitest/ui": "latest"
  }
}
```

## Best Practices

1. **Test Business Logic First**: Focus on calculations, transformations, and critical paths
2. **Use Descriptive Names**: Test names should explain what's being tested
3. **Test Edge Cases**: Zero, null, undefined, negative, large numbers
4. **Mock External Dependencies**: Keep tests isolated and fast
5. **Use Type Safety**: Leverage TypeScript in tests
6. **Follow AAA Pattern**: Arrange, Act, Assert
7. **Keep Tests Simple**: One concept per test
8. **Use Factory Functions**: Create reusable test data generators

## Continuous Integration

Tests are designed to run in CI/CD pipelines:
- Fast execution (< 12 seconds for 117 tests)
- No external dependencies
- Deterministic results
- Clear error messages

## Maintenance

### Adding New Tests
1. Create `*.test.ts` or `*.test.tsx` file next to source
2. Import test utilities from vitest
3. Follow existing patterns
4. Run `npm run test:watch` during development

### Updating Tests
- Update tests when business logic changes
- Keep tests in sync with implementation
- Add tests for bug fixes

## Contributing

When adding new features:
1. Write tests for new functions/components
2. Ensure existing tests pass
3. Aim for meaningful coverage (not just percentage)
4. Focus on testing behavior, not implementation

---

**Last Updated**: 2026-02-13
**Test Suite Version**: 1.0.0
**Vitest Version**: 4.0.18
