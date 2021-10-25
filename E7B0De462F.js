(function() {
  'use strict';
  // 認証用URL（読み取り／更新）
  const scopes = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive';
  // Discovery Docs
  const discovery_docs = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  var api_key;
  var client_id;

  var param = {
    'app': 81,
    'id': 1,
  };
  kintone.api(kintone.api.url('/k/v1/record', true), 'GET', param , function (event) {
    api_key = event.record.api_key.value;
    client_id = event.record.client_id.value;
  });
  
  kintone.events.on('app.record.detail.show', function(event){
    const header = kintone.app.record.getHeaderMenuSpaceElement();

    /* ボタン増殖バグ回避 */
    if (document.getElementById ('gapi_calendar_button') !== null) {
        return event;
    }
    /* ボタン設置 */
    const gapi_calendar_button = new Kuc.Button({
      id: 'gapi_calendar_button',
      text: 'Googleカレンダーにイベントを登録する',
      type: 'button'
    });
    
    // APIクライアントライブラリの初期化とサインイン
    function initClient() {
      gapi.client.init({
        'apiKey': api_key,
        'discoveryDocs': discovery_docs,
        'clientId': client_id,
        'scope': scopes
      }, (error) => {
        alert('Googleへの認証に失敗しました。: ' + error);
      });
    }
    // APIクライアントとOAuth2ライブラリのロード
    gapi.load('client:auth2', initClient);
    
    /* ボタンをクリックしたときのイベント */
    gapi_calendar_button.addEventListener('click', () => {
      publishEvent()
    });
    header.appendChild(gapi_calendar_button);
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
      if (record.event_id.value) { // 公開済みイベントを更新
        request = gapi.client.calendar.events.patch(
          {
            'calendarId': record.calendar_id.value,
            'eventId': record.event_id.value,
            'resource': params
          });
      } else { // 未公開のイベントを追加
        request = gapi.client.calendar.events.insert(
          {
            'calendarId': record.calendar_id.value,
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
