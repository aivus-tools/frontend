import { Page, Locator, expect } from '@playwright/test';

export class BriefEditorHelper {
  constructor(private readonly page: Page) {}

  async getEditorTextbox(): Promise<Locator> {
    return this.page.locator('[contenteditable]').first();
  }

  async getSectionByKey(sectionKey: string): Promise<Locator> {
    return this.page.locator(`[data-section="${sectionKey}"]`);
  }

  async clickIntoSection(sectionKey: string): Promise<void> {
    const section = await this.getSectionByKey(sectionKey);
    await section.click();
  }

  async typeInCurrentSection(text: string): Promise<void> {
    const editor = await this.getEditorTextbox();
    await editor.press('End');
    await editor.pressSequentially(text, { delay: 50 });
  }

  async expectSectionContainsText(sectionKey: string, text: string): Promise<void> {
    const section = await this.getSectionByKey(sectionKey);
    await expect(section).toContainText(text);
  }

  async waitForSaveRequest(): Promise<void> {
    await this.page.waitForResponse(
      (response) => response.url().includes('/section') && response.request().method() === 'PATCH',
      { timeout: 2000 }
    );
  }

  async expectVersionIncremented(previousVersion: number): Promise<void> {
    const response = await this.page.waitForResponse(
      (response) => response.url().includes('/section') && response.request().method() === 'PATCH'
    );
    const data = await response.json();
    expect(data.version).toBeGreaterThan(previousVersion);
  }

  async getAllToolbarButtons(): Promise<Locator> {
    return this.page.locator('[class*="Toolbar"] button, [class*="toolbar"] button').first();
  }

  async expectEditorIsReadOnly(): Promise<void> {
    const editor = await this.getEditorTextbox();
    await expect(editor).toHaveAttribute('contenteditable', 'false');
  }

  async expectEditorIsEditable(): Promise<void> {
    const editor = await this.getEditorTextbox();
    await expect(editor).toHaveAttribute('contenteditable', 'true');
  }

  async getCostBadge(): Promise<Locator> {
    return this.page.locator('text=/Стоимость:|Cost:/');
  }
}
