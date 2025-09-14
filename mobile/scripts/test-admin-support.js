const admin = require('firebase-admin');

// Firebase Admin SDK の初期化
const serviceAccount = require('../config/firebase-admin-dev.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function testAdminSupport() {
  console.log('🧪 管理者サポート機能のテスト開始...');

  try {
    // 1. 管理者プロファイルの確認
    console.log('\n1️⃣ 管理者プロファイルの確認...');
    const adminProfilesSnapshot = await db.collection('adminProfiles').get();
    console.log(`   管理者数: ${adminProfilesSnapshot.size}`);
    
    adminProfilesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.displayName}: ${data.status} (${data.isOnline ? 'オンライン' : 'オフライン'})`);
    });

    // 2. テスト用サポートリクエストの作成
    console.log('\n2️⃣ テスト用サポートリクエストの作成...');
    const testRequest = {
      userId: 'test-user-123',
      message: '恋愛で失敗してしまいました。アドバイスをお願いします。',
      emotion: '悲しい',
      priority: 'normal',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const requestDoc = await db.collection('adminSupportRequests').add(testRequest);
    console.log(`   ✅ サポートリクエスト作成完了: ${requestDoc.id}`);

    // 3. 利用可能な管理者の取得テスト
    console.log('\n3️⃣ 利用可能な管理者の取得テスト...');
    const availableAdminsQuery = await db.collection('adminProfiles')
      .where('status', 'in', ['available', 'busy'])
      .get();
    
    const availableAdmins = [];
    availableAdminsQuery.forEach(doc => {
      const data = doc.data();
      availableAdmins.push({
        id: doc.id,
        displayName: data.displayName,
        status: data.status,
        activeChats: data.activeChats || 0,
        responseTimeAvg: data.responseTimeAvg || 30
      });
    });

    // JavaScriptで並び替え
    availableAdmins.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'available' ? -1 : 1;
      }
      if (a.activeChats !== b.activeChats) {
        return a.activeChats - b.activeChats;
      }
      return a.responseTimeAvg - b.responseTimeAvg;
    });

    console.log(`   利用可能な管理者: ${availableAdmins.length}名`);
    availableAdmins.forEach(admin => {
      console.log(`   - ${admin.displayName}: ${admin.status} (チャット数: ${admin.activeChats})`);
    });

    // 4. 最適な管理者を選択
    if (availableAdmins.length > 0) {
      const bestAdmin = availableAdmins[0];
      console.log(`\n4️⃣ 最適な管理者を選択: ${bestAdmin.displayName}`);

      // リクエストを更新
      await requestDoc.update({
        assignedAdminId: bestAdmin.id,
        status: 'assigned',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('   ✅ サポートリクエストが管理者に割り当てられました');
    }

    console.log('\n🎉 管理者サポート機能のテスト完了！');

  } catch (error) {
    console.error('❌ テストエラー:', error);
  }

  process.exit(0);
}

// テスト実行
testAdminSupport();
