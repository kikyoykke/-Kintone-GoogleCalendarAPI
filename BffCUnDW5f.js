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
      text: 'Gカレンダーに科目を登録する',
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
    const table = record.subject_table.value;
    var start_datetime;
    var end_datetime;
    let request;
    if (record) {

      for (let i = 0; i < table.length; i++){
        
        var event_id_array = [];
        
        for (let j = 0; j < table.length; j++){
          event_id_array.push({'id':table[j].id});
        }
        
        start_datetime = moment(table[i].value.自_日付.value + "T" + table[i].value.自_時刻.value + ":00Z").subtract(9, 'hours');
        end_datetime = moment(table[i].value.至_日付.value + "T" + table[i].value.至_時刻.value + ":00Z").subtract(9, 'hours');
        
        // API リクエスト
        // リクエストパラメータの設定
        const params = {
          // イベントのタイトル
          'summary': table[i].value.event_name.value,
          'start': {
            // 開始日・時刻
            'dateTime': start_datetime,
            'timeZone': 'Asia/Tokyo'
          },
          'end': {
            // 終了日・時刻
            'dateTime': end_datetime,
            'timeZone': 'Asia/Tokyo'
          }
        };
        if (!table[i].value.event_id.value) { // 未公開のイベントを追加
          request = gapi.client.calendar.events.insert({
            'calendarId': record.calendar_id.value,
            'resource': params
          });
          request.execute((resp) => {
            if (resp.error) {
              alert(table[i].value.event_name.value + 'の登録に失敗しました。' + resp.error.message);
            } else { //イベントIDの登録
              event_id_array[i]={'id':table[i].id,'value':{'event_id':{'value': resp.result.id}}};
              const body = {
                'app': kintone.app.getId(),
                'id': record.$id.value,
                'record': {
                  'subject_table': {
                    'value': event_id_array
                  }
                }
              };
             return kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', body, function(resp) {
                // success
                alert('Gカレンダーに科目を登録しました。');
                location.reload();
              }, function(error) {
                // error
                alert(table[i].value.event_name.value + 'のテーブルデータの更新に失敗しました。' + error);
              });
            }
            return true;
          });
            
        } else { // 公開済みイベントを更新
          request = gapi.client.calendar.events.patch({
            'calendarId': record.calendar_id.value,
            'eventId': table[i].value.event_id.value,
            'resource': params
          });
          request.execute((resp) => {
            if (resp.error) {
              alert(table[i].value.event_name.value + 'の登録に失敗しました。' + resp.error.message);
            } else {
              alert('Gカレンダーに科目を更新しました。');
              location.reload();
            }
            return true;
          });
        }
      }
    }
  }
})();
