(function() {
  'use strict';

  // 認証用URL（読み取り／更新）
  const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive';
  // Discovery Docs
  const discovery_docs = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

  var api_key = '';
  var client_id = '';
  var param = {
    'app': 81,
    'id': 1,
  };
  kintone.api(kintone.api.url('/k/v1/record', true), 'GET', param , function(resp) {
  api_key = resp.record.api_key.value;
  client_id = resp.record.client_id.value;
  });
  
  // レコード詳細画面の表示後イベント
  kintone.events.on('app.record.detail.show', (event) => {
    // APIクライアントライブラリの初期化とサインイン
    function initClient() {
      gapi.client.init({
        'apiKey': api_key,
        'discoveryDocs': discovery_docs,
        'clientId': client_id,
        'scope': scope
      }, (error) => {
        alert('Googleへの認証に失敗しました。: ' + error);
      });
    }
    // APIクライアントとOAuth2ライブラリのロード
    gapi.load('client:auth2', initClient);
    // 増殖バグ回避
    if (document.getElementById('publish_button') !== null) {
      return event;
    }
    // 画面下部にボタンを設置
    const publishButton = document.createElement('button');
    publishButton.id = 'publish_button';
    publishButton.innerHTML = 'Googleカレンダーに講習を登録・更新する';
    publishButton.className = 'button-simple-cybozu geo-search-btn';
    publishButton.style = 'margin-top: 30px; margin-left: 10px;';
    publishButton.addEventListener('click', () => {
      publishEvent();
    });
    kintone.app.record.getSpaceElement('publish_button_space').appendChild(publishButton);
    return event;
  });
  async function publishEvent() {
    // レコードのデータの取得
    const record = kintone.app.record.get().record;
    if (record) {
      // Google認証済みのチェック
      if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        // Google認証の呼び出し
        await gapi.auth2.getAuthInstance().signIn();
      }
      // API リクエスト
      // リクエストパラメータの設定
      const params = {
        // イベントのタイトル
        'summary': record.event_name.value,
        'start': {
          // 開始日・時刻
          'dateTime': record.start_datetime.value,
          'timeZone': 'Asia/Tokyo'
        },
        'end': {
          // 終了日・時刻
          'dateTime': record.end_datetime.value,
          'timeZone': 'Asia/Tokyo'
        },
        // 場所の指定
        'location': record.event_location.value,
        // イベントの説明
        'description': record.event_description.value
      };
      let request;
      // リクエストメソッドとパラメータの設定
      if (record.event_id.value = 'empty') { // 未公開のイベントを追加
        request = gapi.client.calendar.events.insert(
          {
            'calendarId': record.calendar_id.value,
            'resource': params
          });
      } else { // 公開済みイベントを更新
        request = gapi.client.calendar.events.patch(
          {
            'calendarId': record.calendar_id.value,
            'eventId': record.event_id.value,
            'resource': params
          });
      }
      // Googleカレンダーへのイベント登録の実行
      request.execute((resp) => {
        if (resp.error) {
          alert('登録に失敗しました。' + resp.error.message);
        } else {
          const body = {
            'app': kintone.app.getId(),
            'id': record.$id.value,
            'record': {
              'event_id': {
                'value': resp.result.id
              }
            }
          };
          return kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body).then((success) => {
            alert('カレンダーに登録しました。');
            location.reload();
          }).catch((error) => {
            alert('Google イベントIDの登録に失敗しました。' + error);
          });
        }
        return true;
      }, (error) => {
        alert('Google イベントIDの登録に失敗しました。' + error);
      });
    }
  }
})();
