import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should render the hero section with brand name', async ({ page }) => {
    await page.goto('/');
    
    // The brand name should be visible
    await expect(page.locator('h1')).toContainText('Richard');
    
    // CTA button should be visible
    const ctaButton = page.getByRole('link', { name: /ir a la tienda/i });
    await expect(ctaButton).toBeVisible();
  });

  test('should navigate to tienda from CTA', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /ir a la tienda/i }).click();
    await expect(page).toHaveURL(/\/tienda/);
  });
});

test.describe('Store Page', () => {
  test('should display the store page with products section', async ({ page }) => {
    await page.goto('/tienda');
    
    // Store header should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('mobile bottom nav should be visible on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tienda');
    
    // Bottom nav should be visible
    const nav = page.getByRole('navigation', { name: /navegación inferior/i });
    await expect(nav).toBeVisible();
  });
});
