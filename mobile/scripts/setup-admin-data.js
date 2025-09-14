const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK の初期化
const serviceAccount = require('../config/firebase-admin-dev.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

// 管理者データの設定
const setupAdminData = async () => {
  try {
    console.log('🔧 管理者データの設定を開始...');

    // 管理者プロファイルを作成
    const adminProfile = {
      displayName: '管理者',
      avatar: 'admin-avatar',
      password: process.env.ADMIN_PASSWORD || 'dev_password_123', // 環境変数から取得
      isOnline: false,
      status: 'offline',
      specialties: ['感情サポート', '失敗談分析', 'コミュニティ管理'],
      responseTimeAvg: 15, // 平均応答時間（分）
      satisfactionScore: 4.8, // 満足度スコア
      activeChats: 0,
      maxConcurrentChats: 5,
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 管理者プロファイルをFirestoreに保存
    const adminRef = await db.collection('adminProfiles').doc('admin-1').set(adminProfile);
    
    console.log('✅ 管理者プロファイル作成完了:', 'admin-1');
    console.log('📋 管理者情報:');
    console.log('   - 管理者ID: admin-1');
    console.log('   - パスワード: [環境変数から設定]');
    console.log('   - 表示名:', adminProfile.displayName);
    console.log('   - 専門分野:', adminProfile.specialties.join(', '));

    // 追加の管理者を作成（オプション）
    const additionalAdmins = [
      {
        id: 'admin-2',
        displayName: 'サブ管理者',
        specialties: ['技術サポート', 'バグ対応']
      }
    ];

    for (const adminData of additionalAdmins) {
      const additionalAdminProfile = {
        ...adminProfile,
        displayName: adminData.displayName,
        password: process.env.ADMIN_PASSWORD_2 || 'dev_admin_123',
        specialties: adminData.specialties,
        responseTimeAvg: 20,
        satisfactionScore: 4.5
      };

      await db.collection('adminProfiles').doc(adminData.id).set(additionalAdminProfile);
      console.log('✅ 追加管理者作成完了:', adminData.id);
      console.log(`   - 管理者ID: ${adminData.id}`);
      console.log(`   - パスワード: [環境変数から設定]`);
    }

    console.log('🎉 管理者データの設定が完了しました！');
    console.log('');
    console.log('🔐 ログイン情報:');
    console.log('   管理者ID: admin-1');
    console.log('   パスワード: 環境変数 ADMIN_PASSWORD から設定');
    console.log('');
    console.log('   管理者ID: admin-2');
    console.log('   パスワード: 環境変数 ADMIN_PASSWORD_2 から設定');
    console.log('');
    console.log('📝 環境変数の設定例:');
    console.log('   export ADMIN_PASSWORD="your_secure_password"');
    console.log('   export ADMIN_PASSWORD_2="your_second_password"');

  } catch (error) {
    console.error('❌ 管理者データ設定エラー:', error);
    throw error;
  }
};

// スクリプト実行
setupAdminData()
  .then(() => {
    console.log('✅ 管理者データ設定スクリプト完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 管理者データ設定スクリプト失敗:', error);
    process.exit(1);
  });