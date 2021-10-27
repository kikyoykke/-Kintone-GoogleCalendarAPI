(function() {
  'use strict';

  kintone.events.on('app.record.detail.show', function(event){
    const header = kintone.app.record.getHeaderMenuSpaceElement();

    /* ボタン増殖バグ回避 */
    if (document.getElementById ('gapi_calendar_button2') !== null) {
        return event;
    }
    /* ボタン設置 */
    const gapi_calendar_button2 = new Kuc.Button({
      id: 'gapi_calendar_button2',
      text: 'Gカレンダーに講習を登録する',
      type: 'button'
    });

    /* ボタンをクリックしたときのイベント */
    gapi_calendar_button2.addEventListener('click', () => {
      publishEvent();
    });
    header.appendChild(gapi_calendar_button2);
    return event;
  });

  function publishEvent() {
    // レコードのデータの取得
    const record = kintone.app.record.get().record;
    if (record) {
      let end_date = moment(record.end_date.value).subtract(-1,'day').format("YYYY-MM-DD");
      // API リクエスト
      // リクエストパラメータの設定
      const params = {
        // イベントのタイトル
        'summary': record.alldayevent_name.value,
        'start': {
          // 開始日・時刻
          'date': record.start_date.value,
          'timeZone': 'Asia/Tokyo'
        },
        'end': {
          // 終了日・時刻
          'date': end_date,
          'timeZone': 'Asia/Tokyo'
        },
        // 場所の指定
        'location': record.event_location.value,
        // イベントの説明
        'description': record.event_description.value
      };
      let request;
      // リクエストメソッドとパラメータの設定
      if (record.alldayevent_id.value) { // 公開済みイベントを更新
        request = gapi.client.calendar.events.patch(
          {
            'calendarId': record.calendar_id.value,
            'eventId': record.alldayevent_id.value,
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
              'alldayevent_id': {
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
