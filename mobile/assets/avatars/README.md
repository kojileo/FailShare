# Avatar Assets

このディレクトリには、AIアバター「SPECTRA」の画像アセットが含まれています。

## 🎨 画像仕様

### カラーバリエーション
- **Green**: 緑系カラーパレット ✅ **完了**
- **Blue**: ブルー系カラーパレット ⏳ **準備中**

### 感情表現
各カラーバリエーションで以下の6つの感情表現を提供：

1. **neutral**: 通常の表情 ✅
2. **happy**: 嬉しい表情 ✅
3. **angry**: 怒った表情 ✅
4. **surprised**: 驚いた表情 ✅
5. **thinking**: 考えている表情 ✅
6. **wink**: ウィンクした表情 ✅

### 感情マッピング
アプリ内の感情タイプと画像ファイルのマッピング：
- `neutral` → neutral.png
- `happy` → happy.png
- `sad` → thinking.png（考えている表情を使用）
- `worried` → thinking.png（考えている表情を使用）
- `angry` → angry.png
- `confused` → wink.png（ウィンク表情を使用）
- `surprised` → surprised.png
- `thinking` → thinking.png

## 📁 ファイル命名規則

```
spectra_[color]_[emotion].png

例:
- spectra_green_neutral.png
- spectra_blue_happy.png
```

## 🚀 実装状況

### ✅ 完了済み
- PixelAvatarコンポーネントの画像ベース実装
- React Native FastImageの統合
- 感情変化アニメーション
- カラーバリエーション対応
- AIアバター画面での統合
- 表情テスト機能

### ⏳ 次のステップ
1. **blueバリエーション画像の作成**
   - 現在greenバリエーションの画像をベースに
   - ブルー系カラーパレットで6つの感情表現を作成
   
2. **ダミーファイルの置き換え**
   ```
   spectra_blue_neutral.png
   spectra_blue_happy.png
   spectra_blue_angry.png
   spectra_blue_surprised.png
   spectra_blue_thinking.png
   spectra_blue_wink.png
   ```

## 🔧 使用方法

### 基本的な使用
```typescript
import PixelAvatar from '../components/PixelAvatar';

<PixelAvatar
  size={120}
  emotion="happy"
  color="green"
  isTyping={false}
/>
```

### 感情変化の例
```typescript
const [emotion, setEmotion] = useState('neutral');
const [color, setColor] = useState('green');

// 感情を変更
setEmotion('happy');

// カラーを変更
setColor('blue');
```

## 🎯 テスト方法

1. アプリを起動: `npm start`
2. AIアバター画面に移動
3. ヘッダーのパレットアイコンでカラー切り替え
4. ウェルカムメッセージの「表情テスト」で感情切り替え
5. 各表情とアニメーションの動作確認

