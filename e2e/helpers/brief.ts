import { Page, expect } from '@playwright/test';

export class BriefHelper {
  constructor(private readonly page: Page) {}

  async startPublicBrief(initialMessage: string): Promise<string> {
    await this.page.goto('/public-brief');
    await expect(this.page).toHaveURL('/public-brief');

    const textarea = this.page.getByPlaceholder(/What.*project/i).or(this.page.getByRole('textbox').first());
    await textarea.fill(initialMessage);

    const createButton = this.page.getByRole('button', { name: /Create|Создать/i });
    await createButton.click();

    await this.page.waitForURL(/\/public-brief\/[a-f0-9-]+/);
    await this.waitForAIGenerationComplete();

    const url = this.page.url();
    const match = url.match(/\/public-brief\/([a-f0-9-]+)/);
    if (!match) {
      throw new Error('Failed to extract brief ID from URL');
    }
    return match[1];
  }

  async waitForAIGenerationComplete(timeout = 60000): Promise<void> {
    await expect(this.page.locator('text=/Generating|Генерируется/i')).toBeHidden({ timeout });
    const editor = this.page.locator('[contenteditable]').first();
    await editor.waitFor({ state: 'visible', timeout: 30000 });
    await this.page.waitForTimeout(2000);
  }

  async sendChatMessage(message: string): Promise<void> {
    const chatInput = this.page.getByPlaceholder(/Enter.*answer|Введите/i).or(this.page.getByRole('textbox').last());
    await chatInput.fill(message);

    const sendButton = this.page
      .getByRole('button', { name: /send/i })
      .or(this.page.locator('button[aria-label*="send"]'));
    await sendButton.click();

    await this.waitForChatResponse();
  }

  async waitForChatResponse(timeout = 60000): Promise<void> {
    await this.page.waitForResponse((response) => response.url().includes('/chat') && response.status() === 200, {
      timeout,
    });
    await this.page.waitForTimeout(500);
  }

  async expectChatMessageVisible(messageText: string): Promise<void> {
    await expect(this.page.locator(`text=${messageText}`)).toBeVisible();
  }

  async navigateToDashboard(): Promise<void> {
    await this.page.goto('/app/dashboard');
    await expect(this.page).toHaveURL(/\/app\/dashboard/);
  }

  async expectBriefInDashboard(briefName: string): Promise<void> {
    await expect(this.page.locator(`text=${briefName}`)).toBeVisible();
  }

  async openBriefFromDashboard(briefName: string): Promise<void> {
    await this.page.locator(`text=${briefName}`).click();
    await this.page.waitForURL(/\/app\/brief\//);
  }

  async finalizeBrief(): Promise<void> {
    const finalizeButton = this.page.getByRole('button', { name: /Finalize|Завершить/i });
    await finalizeButton.click();

    await this.page.waitForResponse((response) => response.url().includes('/finalize'));
    await expect(this.page.locator('text=/complete|завершен/i')).toBeVisible();
  }

  async expectSharePopupVisible(): Promise<void> {
    await expect(this.page.locator('text=/Share|Поделиться/i')).toBeVisible();
  }

  async startAuthenticatedBrief(initialMessage: string): Promise<void> {
    await this.page.goto('/app/brief/create-v2');

    const textarea = this.page.locator('textarea').first();
    await textarea.fill(initialMessage);

    const createButton = this.page
      .getByRole('main')
      .getByRole('button', { name: /Create|Создать/i })
      .last();
    await createButton.click();

    await this.waitForAIGenerationComplete();
  }

  async clickFinalize(): Promise<void> {
    const finalizeButton = this.page.getByRole('button', { name: /Finalize|Завершить/i });
    await finalizeButton.click();
    await this.page.waitForTimeout(2000);
  }

  async expectBriefFinalized(): Promise<void> {
    const exportPdfButton = this.page.getByRole('button', { name: /Export.*PDF|Экспорт/i });
    const shareButton = this.page.getByRole('button', { name: /Share|Поделиться/i });

    await expect(exportPdfButton).toBeVisible();
    await expect(shareButton).toBeVisible();
  }
}
