const admin = require('firebase-admin');

// Firebase Admin SDK の初期化
const serviceAccount = require('../config/firebase-admin-dev.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function sendAdminMessage() {
  console.log('📨 管理者メッセージ送信テスト...');

  try {
    // 1. 最新のサポートリクエストを取得
    const requestsSnapshot = await db.collection('adminSupportRequests')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (requestsSnapshot.empty) {
      console.log('❌ サポートリクエストが見つかりません');
      return;
    }

    const requestDoc = requestsSnapshot.docs[0];
    const requestData = requestDoc.data();
    console.log(`📋 サポートリクエスト: ${requestDoc.id}`);
    console.log(`   ユーザー: ${requestData.userId}`);
    console.log(`   メッセージ: ${requestData.message}`);
    console.log(`   ステータス: ${requestData.status}`);

    // 2. 管理者からのメッセージを送信
    const adminMessage = {
      supportRequestId: requestDoc.id,
      senderId: 'admin-1',
      senderType: 'admin',
      content: 'こんにちは！カノンです🌟 お悩みを聞かせていただきました。恋愛での失敗は誰にでもあることですし、それを乗り越えることで成長できます。具体的にどのような状況だったのか、もう少し詳しく教えていただけますか？',
      messageType: 'text',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      readBy: ['admin-1']
    };

    const messageDoc = await db.collection('adminSupportMessages').add(adminMessage);
    console.log(`✅ 管理者メッセージ送信完了: ${messageDoc.id}`);

    // 3. サポートリクエストのステータスを更新
    await requestDoc.ref.update({
      status: 'in_progress',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('📝 サポートリクエストステータス更新: in_progress');

    // 4. セッションを作成（まだ存在しない場合）
    const existingSessionQuery = await db.collection('adminSupportSessions')
      .where('userId', '==', requestData.userId)
      .where('status', '==', 'active')
      .get();

    if (existingSessionQuery.empty) {
      const session = {
        userId: requestData.userId,
        adminId: 'admin-1',
        supportRequestId: requestDoc.id,
        status: 'active',
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const sessionDoc = await db.collection('adminSupportSessions').add(session);
      console.log(`🎯 セッション作成完了: ${sessionDoc.id}`);
    } else {
      console.log('📞 既存のアクティブセッションを使用');
    }

    console.log('\n🎉 管理者メッセージ送信テスト完了！');
    console.log('\n📱 アプリでの確認方法:');
    console.log('1. プロフィール画面の「🛡️ 管理者ダッシュボード」をクリック');
    console.log('2. 管理者サポート画面で「サポートをリクエストしてください...」と入力');
    console.log('3. カノンからのメッセージが表示されます');

  } catch (error) {
    console.error('❌ エラー:', error);
  }

  process.exit(0);
}

// スクリプト実行
sendAdminMessage();

