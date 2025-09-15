# FailShare 管理者認証システム実装戦略

## 📋 概要

管理者認証システムの実装戦略と開発計画について説明します。

### 🚨 緊急実装の必要性

現在、管理者ダッシュボードへのアクセス制御が未実装のため、**誰でも管理者機能にアクセス可能**な状態です。これは重大なセキュリティリスクです。

---

## 🎯 実装目標

### 短期目標（1週間以内）
1. **管理者ログイン画面の実装**
2. **基本的な認証システムの構築**
3. **管理者ダッシュボードへのアクセス制御**
4. **セキュリティリスクの解消**

### 中期目標（1ヶ月以内）
1. **セッション管理の実装**
2. **管理者権限の階層化**
3. **監査ログの実装**
4. **セキュリティ強化**

---

## 🏗️ アーキテクチャ設計

### 技術選択

#### Phase 1: シンプルなパスワード認証（推奨）
```typescript
interface AdminAuth {
  adminId: string;
  password: string;
  role: 'admin' | 'super-admin';
  permissions: string[];
}
```

**選定理由:**
- ✅ 実装が簡単（1-2日で完了）
- ✅ 開発・テスト環境に適している
- ✅ 既存Firebaseインフラを活用
- ✅ コストゼロ

#### Phase 2: Firebase Authentication + Custom Claims（将来実装）
```typescript
interface AdminAuthAdvanced {
  email: string;
  password: string;
  role: 'admin' | 'super-admin';
  permissions: string[];
  customClaims: {
    role: string;
    permissions: string[];
  };
}
```

**選定理由:**
- ✅ 業界標準の認証システム
- ✅ スケーラブルでセキュア
- ✅ 本番環境に適している
- ⚠️ 実装コストが高い

---

## 📁 実装ファイル構成

### 新規作成ファイル
```
src/
├── screens/
│   └── AdminLoginScreen.tsx          # 管理者ログイン画面
├── stores/
│   └── adminAuthStore.ts             # 管理者認証ストア
├── services/
│   └── adminAuthService.ts           # 管理者認証サービス
└── types/
    └── adminAuth.ts                  # 管理者認証型定義
```

### 修正ファイル
```
src/
├── screens/
│   └── AdminDashboardScreen.tsx      # アクセス制御追加
├── navigation/
│   └── AppNavigator.tsx              # 管理者認証ルート追加
└── stores/
    └── adminSupportStore.ts          # 管理者認証連携
```

---

## 🔧 実装詳細

### 1. 管理者認証サービス

```typescript
// src/services/adminAuthService.ts
class AdminAuthService {
  private readonly ADMINS_COLLECTION = 'adminProfiles';

  async signIn(adminId: string, password: string): Promise<AdminProfile> {
    try {
      // 管理者情報をFirestoreから取得
      const adminDoc = await getDoc(doc(db, this.ADMINS_COLLECTION, adminId));
      
      if (!adminDoc.exists()) {
        throw new Error('管理者が見つかりません');
      }
      
      const adminData = adminDoc.data();
      if (adminData.password !== password) {
        throw new Error('パスワードが間違っています');
      }
      
      // 最終ログイン時間を更新
      await updateDoc(doc(db, this.ADMINS_COLLECTION, adminId), {
        lastLoginAt: serverTimestamp(),
        isOnline: true
      });
      
      return adminData;
    } catch (error) {
      console.error('管理者認証エラー:', error);
      throw error;
    }
  }

  async signOut(adminId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.ADMINS_COLLECTION, adminId), {
        isOnline: false,
        lastActiveAt: serverTimestamp()
      });
    } catch (error) {
      console.error('管理者サインアウトエラー:', error);
      throw error;
    }
  }
}
```

### 2. 管理者認証ストア

```typescript
// src/stores/adminAuthStore.ts
interface AdminAuthState {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  signIn: (adminId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  signIn: async (adminId: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const admin = await adminAuthService.signIn(adminId, password);
      set({ admin, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'ログインに失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const { admin } = get();
      if (admin) {
        await adminAuthService.signOut(admin.id);
      }
      set({ admin: null, isAuthenticated: false });
    } catch (error) {
      console.error('サインアウトエラー:', error);
      throw error;
    }
  },
  
  setError: (error: string | null) => {
    set({ error });
  }
}));
```

### 3. 管理者ログイン画面

```typescript
// src/screens/AdminLoginScreen.tsx
const AdminLoginScreen: React.FC = () => {
  const { signIn, isLoading, error, setError } = useAdminAuthStore();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signIn(adminId, password);
      // ログイン成功時は自動的にAdminDashboardに遷移
    } catch (error) {
      // エラーは既にストアで処理済み
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.background}>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>管理者ログイン</Text>
          
          <TextInput
            style={styles.input}
            placeholder="管理者ID"
            value={adminId}
            onChangeText={setAdminId}
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
          >
            ログイン
          </Button>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};
```

### 4. 管理者ダッシュボードのアクセス制御

```typescript
// src/screens/AdminDashboardScreen.tsx の修正
const AdminDashboardScreen: React.FC = () => {
  const { admin, isAuthenticated } = useAdminAuthStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('AdminLogin');
      return;
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF88" />
        <Text style={styles.loadingText}>認証中...</Text>
      </View>
    );
  }

  // 既存の管理者ダッシュボード実装
  const [currentAdminId] = useState(admin?.id || '');
  
  // ... 既存のコード
};
```

---

## 🔒 セキュリティ対策

### 1. パスワード管理
```typescript
// パスワードのハッシュ化（将来実装）
import bcrypt from 'bcrypt';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

### 2. セッション管理
```typescript
// セッションタイムアウト設定
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分

const checkSessionTimeout = (lastActivity: Date): boolean => {
  const now = new Date();
  return (now.getTime() - lastActivity.getTime()) > SESSION_TIMEOUT;
};
```

### 3. Firestoreセキュリティルール
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 管理者認証必須
    match /adminProfiles/{adminId} {
      allow read, write: if request.auth != null 
                        && request.auth.token.role == 'admin';
    }
    
    match /adminSupportRequests/{requestId} {
      allow read, write: if request.auth != null 
                        && request.auth.token.role == 'admin';
    }
  }
}
```

---

## 📊 実装スケジュール

### Week 1: 基本認証システム
- **Day 1-2**: 管理者認証サービス実装
- **Day 3-4**: 管理者認証ストア実装
- **Day 5**: 管理者ログイン画面実装
- **Day 6-7**: 管理者ダッシュボードアクセス制御実装

### Week 2: セキュリティ強化
- **Day 1-2**: セッション管理実装
- **Day 3-4**: Firestoreセキュリティルール更新
- **Day 5-7**: テスト・デバッグ・最適化

---

## 🧪 テスト戦略

### 1. ユニットテスト
```typescript
// adminAuthService.test.ts
describe('AdminAuthService', () => {
  test('正しい認証情報でログイン成功', async () => {
    const result = await adminAuthService.signIn('admin-1', 'password123');
    expect(result).toBeDefined();
    expect(result.id).toBe('admin-1');
  });

  test('間違った認証情報でログイン失敗', async () => {
    await expect(adminAuthService.signIn('admin-1', 'wrong-password'))
      .rejects.toThrow('パスワードが間違っています');
  });
});
```

### 2. インテグレーションテスト
```typescript
// AdminLoginScreen.test.tsx
describe('AdminLoginScreen', () => {
  test('ログイン成功後にダッシュボードに遷移', async () => {
    render(<AdminLoginScreen />);
    
    fireEvent.changeText(screen.getByPlaceholderText('管理者ID'), 'admin-1');
    fireEvent.changeText(screen.getByPlaceholderText('パスワード'), 'password123');
    fireEvent.press(screen.getByText('ログイン'));
    
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminDashboard');
    });
  });
});
```

---

## 📈 成功指標

### 技術指標
- ✅ 管理者認証成功率: 100%
- ✅ セッションタイムアウト: 30分以内
- ✅ ログイン応答時間: 2秒以内
- ✅ セキュリティテスト通過率: 100%

### 運用指標
- ✅ 管理者ログイン成功率: 95%以上
- ✅ セッション管理エラー: 0件
- ✅ セキュリティインシデント: 0件

---

## 🔗 関連ドキュメント

- **[開発進捗](./03_DevelopmentProgress.md)**
- **[セキュリティポリシー](./06_SecurityPolicy.md)**
- **[技術選定](./02_TechChoice.md)**

---

## 📝 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|----------|--------|
| 2025-01-XX | 管理者認証システム実装戦略作成 | 開発チーム |
