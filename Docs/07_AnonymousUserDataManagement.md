# 匿名ユーザーのデータ管理戦略

## 概要

FailShareでは、ユーザーの匿名性を保護するため、Firebase Anonymous Authenticationを使用しています。しかし、この仕組みにはデータ管理上の重要な注意点があります。

## Firebase Anonymous Authenticationの仕組み

### 1. 匿名ユーザーの特徴

- **一意のユーザーID**: 各匿名ユーザーには一意のUIDが割り当てられる
- **再認証不可**: サインアウト後、同じユーザーとして再認証することは不可能
- **新しいUID**: 再サインイン時は毎回新しいUIDが生成される
- **セッション一時性**: アプリをアンインストールやデータ削除で認証情報が失われる

### 2. データ残存の問題

**問題点:**
```
匿名ユーザーA (UID: abc123)
  ↓ 投稿・データ作成
anonymousUsers/abc123 → プロフィール情報
stories/story1 → authorId: abc123
stories/story2 → authorId: abc123
  ↓ サインアウト
認証情報削除（Firebase Auth）
  ↓ 再サインイン
匿名ユーザーB (UID: def456) ← 新しいUID
  ↓ 結果
abc123のデータが孤立化（アクセス不可、削除不可）
```

## 実装した解決策

### 1. サインアウト時の包括的データ削除

**authService.ts**
```typescript
// サインアウト時にFirestoreデータも削除
const deleteUserData = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const batch = writeBatch(db);
    
    // 1. ユーザーの投稿を削除
    const storiesQuery = query(
      collection(db, 'stories'),
      where('authorId', '==', userId)
    );
    
    const storiesSnapshot = await getDocs(storiesQuery);
    storiesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 2. ユーザープロフィールを削除
    const userDocRef = doc(db, 'anonymousUsers', userId);
    batch.delete(userDocRef);
    
    // 3. バッチ処理を実行
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
    };
  }
};
```

### 2. 将来的な機能拡張への対応

**削除対象データ（将来実装予定）:**
- コメント (`comments` コレクション)
- 学習記録 (`learningRecords` コレクション)
- 支援アクション (`supportActions` コレクション)
- 通報データ (`reports` コレクション)

### 3. ユーザーへの確認機能

**ProfileScreen.tsx**
```typescript
const handleSignOut = async () => {
  Alert.alert(
    'サインアウト確認',
    '匿名ユーザーではサインアウト後に同じアカウントで再ログインできません。\n\n投稿した失敗談やプロフィール情報は完全に削除されます。\n\n本当にサインアウトしますか？',
    [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: 'サインアウト',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]
  );
};
```

## データ削除の詳細

### 1. 削除対象データ

#### 現在実装済み
- **anonymousUsers/{userId}**: ユーザープロフィール
- **stories/{storyId}**: ユーザーの投稿（`authorId`でフィルタ）

#### 将来実装予定
- **comments/{commentId}**: ユーザーのコメント
- **learningRecords/{recordId}**: 学習記録
- **supportActions/{actionId}**: 支援アクション（いいね等）
- **reports/{reportId}**: 通報データ

### 2. 削除処理のフロー

```
1. ユーザーがサインアウトボタンを押す
   ↓
2. 確認ダイアログを表示
   ↓
3. ユーザーが確認
   ↓
4. Firebase Auth 現在のユーザーを取得
   ↓
5. Firestore バッチ処理で関連データを削除
   - ユーザーの投稿を検索・削除
   - ユーザープロフィールを削除
   - 将来的には他のデータも削除
   ↓
6. Firebase Auth からサインアウト
   ↓
7. AsyncStorage からユーザー情報を削除
   ↓
8. 認証画面に遷移
```

### 3. エラーハンドリング

```typescript
// サインアウト結果の処理
const result = await signOutUser();

if (result.success) {
  // サインアウト成功
  if (result.dataDeleted) {
    console.log('ユーザーデータが正常に削除されました');
  } else if (result.error) {
    console.warn('データ削除でエラーが発生しました:', result.error);
    // サインアウトは成功したが、データ削除で問題が発生
  }
} else {
  // サインアウト失敗
  console.error('サインアウトエラー:', result.error);
}
```

## セキュリティ考慮事項

### 1. Firestore セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 匿名ユーザーは自分のデータのみ削除可能
    match /anonymousUsers/{userId} {
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // 投稿は投稿者のみ削除可能
    match /stories/{storyId} {
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

### 2. バッチ処理による効率的な削除

- **一括削除**: 複数のドキュメントを一度に削除
- **トランザクション**: 削除処理の整合性を保証
- **エラー処理**: 部分的な削除失敗にも対応

## 運用上の考慮事項

### 1. 削除失敗時の対応

```typescript
// 削除失敗時でもサインアウトは継続
if (!deleteResult.success) {
  console.error('データ削除に失敗しましたが、サインアウトを継続します');
  // 管理者に通知する仕組みを将来実装
}
```

### 2. 孤立データの監視

**将来実装予定:**
- Cloud Functions による定期的な孤立データ検出
- 管理画面での孤立データ確認機能
- 自動クリーンアップ機能

### 3. データ削除の監査

**ログ記録:**
- 削除実行時刻
- 削除対象データの種類と件数
- 削除成功/失敗の記録

## 今後の改善予定

### 1. 高度な削除機能

- **段階的削除**: 重要度に応じた削除優先度
- **復元機能**: 削除前の一時保存（24時間以内）
- **データエクスポート**: 削除前のデータ出力

### 2. 監視とアラート

- **削除失敗アラート**: 管理者への通知
- **孤立データ検出**: 定期的なデータ整合性チェック
- **使用量監視**: ストレージ使用量の追跡

### 3. ユーザー体験の向上

- **削除完了通知**: 削除が完了したことの確認
- **データ概要表示**: 削除されるデータの詳細表示
- **部分削除オプション**: 特定のデータのみ残す選択肢

## まとめ

Firebase Anonymous Authenticationを使用する際は、データの孤立化を防ぐための適切なデータ管理戦略が必要です。FailShareでは、サインアウト時の包括的なデータ削除機能を実装し、ユーザーの匿名性を保護しながら、データベースの効率的な運用を実現しています。

この仕組みにより、以下の利点が得られます：

1. **データの孤立化防止**: 使用されないデータの蓄積を回避
2. **プライバシー保護**: ユーザーの完全な匿名性を維持
3. **ストレージ効率**: 不要なデータの削除によるコスト削減
4. **セキュリティ向上**: 個人データの完全な削除保証 