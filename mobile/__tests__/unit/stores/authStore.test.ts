/// <reference types="jest" />

import { mockUserData } from '../../__mocks__/sampleData';

// Zustandストアをテストするための基本的なテスト
describe('AuthStore', () => {
  test('mock user data is valid', () => {
    expect(mockUserData).toBeDefined();
    expect(mockUserData.uid).toBe('test-user-id');
    expect(mockUserData.email).toBe('test@example.com');
    expect(mockUserData.displayName).toBe('テストユーザー');
  });

  test('user has required properties', () => {
    expect(mockUserData).toHaveProperty('uid');
    expect(mockUserData).toHaveProperty('email');
    expect(mockUserData).toHaveProperty('displayName');
    expect(mockUserData).toHaveProperty('isAnonymous');
    expect(mockUserData).toHaveProperty('providerId');
  });

  test('user email is valid format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(mockUserData.email)).toBe(true);
  });

  test('user is anonymous', () => {
    expect(mockUserData.isAnonymous).toBe(true);
    expect(mockUserData.providerId).toBe('anonymous');
  });
}); 