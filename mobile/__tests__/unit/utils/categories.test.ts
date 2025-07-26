// Jest 型参照を追加
/// <reference types="jest" />

import {
  getCategoryHierarchyColor,
  getCategoryHierarchyIcon,
  getMainCategories,
  getSubCategories,
  getCategoryHierarchyInfo
} from '../../../src/utils/categories';
import { CategoryHierarchy, MainCategory } from '../../../src/types';

describe('categories utils', () => {
  test('getMainCategories returns correct categories', () => {
    const categories = getMainCategories();
    expect(categories).toContain('恋愛');
    expect(categories).toContain('その他');
    expect(categories.length).toBeGreaterThan(0);
  });

  test('getCategoryHierarchyColor returns color for valid category', () => {
    const category: CategoryHierarchy = { main: '恋愛', sub: 'デート' };
    const color = getCategoryHierarchyColor(category);
    expect(color).toBeTruthy();
    expect(typeof color).toBe('string');
    expect(color.startsWith('#')).toBe(true);
  });

  test('getCategoryHierarchyIcon returns icon for valid category', () => {
    const category: CategoryHierarchy = { main: '恋愛', sub: 'デート' };
    const icon = getCategoryHierarchyIcon(category);
    expect(icon).toBeTruthy();
    expect(typeof icon).toBe('string');
  });

  test('getSubCategories returns sub categories for main category', () => {
    const subCategories = getSubCategories('恋愛');
    expect(Array.isArray(subCategories)).toBe(true);
    expect(subCategories.length).toBeGreaterThan(0);
    expect(subCategories).toContain('デート');
  });

  test('getCategoryHierarchyInfo returns valid info for existing category', () => {
    const category: CategoryHierarchy = { main: '恋愛', sub: 'デート' };
    const info = getCategoryHierarchyInfo(category);
    
    expect(info).toBeDefined();
    expect(info.main).toBeDefined();
    expect(info.sub).toBeDefined();
    expect(info.main?.name).toBe('恋愛');
    expect(info.sub?.name).toBe('デート');
  });
}); 