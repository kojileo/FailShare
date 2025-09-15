import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AdminLoginScreen from '../../../src/screens/AdminLoginScreen';
import { useAdminAuthStore } from '../../../src/stores/adminAuthStore';

// ストアのモック
jest.mock('../../../src/stores/adminAuthStore', () => ({
  useAdminAuthStore: jest.fn()
}));

// ナビゲーションのモック
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack
  })
}));

const mockUseAdminAuthStore = useAdminAuthStore as jest.MockedFunction<typeof useAdminAuthStore>;

describe('AdminLoginScreen', () => {
  const mockSignIn = jest.fn();
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAdminAuthStore.mockReturnValue({
      admin: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      signIn: mockSignIn,
      signOut: jest.fn(),
      setError: mockSetError
    });
  });

  it('レンダリングされる', () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    expect(getByText('管理者ログイン')).toBeTruthy();
    expect(getByPlaceholderText('管理者ID')).toBeTruthy();
    expect(getByPlaceholderText('パスワード')).toBeTruthy();
  });

  it('管理者IDとパスワードを入力してログインする', async () => {
    mockSignIn.mockResolvedValue(undefined);

    const { getByPlaceholderText, getByTestId } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    const adminIdInput = getByPlaceholderText('管理者ID');
    const passwordInput = getByPlaceholderText('パスワード');
    const loginButton = getByTestId('login-button');

    fireEvent.changeText(adminIdInput, 'admin-123');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('admin-123', 'password123');
    });
  });

  it('空のフィールドでログインを試行するとエラーが表示される', async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('管理者IDとパスワードを入力してください')).toBeTruthy();
    });
  });

  it('ログイン中はローディング状態が表示される', () => {
    mockUseAdminAuthStore.mockReturnValue({
      admin: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      signIn: mockSignIn,
      signOut: jest.fn(),
      setError: mockSetError
    });

    const { getByTestId } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('ログインエラーが表示される', () => {
    const errorMessage = 'ログインに失敗しました';
    
    mockUseAdminAuthStore.mockReturnValue({
      admin: null,
      isAuthenticated: false,
      isLoading: false,
      error: errorMessage,
      signIn: mockSignIn,
      signOut: jest.fn(),
      setError: mockSetError
    });

    const { getByText } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('ログイン成功時にダッシュボードに遷移する', async () => {
    const mockAdmin = {
      id: 'admin-123',
      displayName: 'テスト管理者',
      avatar: 'avatar1',
      isOnline: true,
      status: 'available' as const,
      specialties: [],
      responseTimeAvg: 30,
      satisfactionScore: 4.5,
      activeChats: 0,
      maxConcurrentChats: 5,
      lastActiveAt: new Date()
    };

    mockUseAdminAuthStore.mockReturnValue({
      admin: mockAdmin,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      signIn: mockSignIn,
      signOut: jest.fn(),
      setError: mockSetError
    });

    render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('AdminDashboard');
    });
  });

  it('戻るボタンが機能する', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('パスワードの表示/非表示を切り替える', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    const passwordInput = getByPlaceholderText('パスワード');
    const toggleButton = getByTestId('password-toggle');

    // 初期状態は非表示
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // 表示に切り替え
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    // 非表示に切り替え
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('フォームのバリデーションが機能する', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    const adminIdInput = getByPlaceholderText('管理者ID');
    const passwordInput = getByPlaceholderText('パスワード');
    const loginButton = getByTestId('login-button');

    // 管理者IDのみ入力
    fireEvent.changeText(adminIdInput, 'admin-123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('パスワードを入力してください')).toBeTruthy();
    });

    // パスワードのみ入力
    fireEvent.changeText(adminIdInput, '');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('管理者IDを入力してください')).toBeTruthy();
    });
  });

  it('キーボードの完了ボタンでログインを実行する', async () => {
    mockSignIn.mockResolvedValue(undefined);

    const { getByPlaceholderText } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    const adminIdInput = getByPlaceholderText('管理者ID');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(adminIdInput, 'admin-123');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent(passwordInput, 'submitEditing');

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('admin-123', 'password123');
    });
  });

  it('エラーメッセージをクリアする', async () => {
    const { getByPlaceholderText, getByTestId, getByText, queryByText } = render(
      <NavigationContainer>
        <AdminLoginScreen />
      </NavigationContainer>
    );

    const adminIdInput = getByPlaceholderText('管理者ID');
    const passwordInput = getByPlaceholderText('パスワード');

    // エラーを発生させる
    fireEvent.press(getByTestId('login-button'));
    
    await waitFor(() => {
      expect(getByText('管理者IDとパスワードを入力してください')).toBeTruthy();
    });

    // 入力するとエラーがクリアされる
    fireEvent.changeText(adminIdInput, 'admin-123');
    
    await waitFor(() => {
      expect(queryByText('管理者IDとパスワードを入力してください')).toBeNull();
    });
  });
});
