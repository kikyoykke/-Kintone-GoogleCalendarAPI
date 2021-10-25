(function() {
  'use strict';

  kintone.events.on('app.record.detail.show', function(event){
    const header = kintone.app.record.getHeaderMenuSpaceElement();

    /* ボタン増殖バグ回避 */
    if (document.getElementById ('countrequest_button') !== null) {
        return event;
    }
    /* ボタン設置 */
    const countrequest_button = new Kuc.Button({
      id: 'countrequest_button',
      text: '予約数を更新する',
      type: 'button'
    });
    

    /* ボタンをクリックしたときのイベント */
    countrequest_button.addEventListener('click', () => {
	        
      const record = kintone.app.record.get().record;
      var app_Id = kintone.app.getRelatedRecordsTargetAppId('target_record');
      var query = 'event_id = "' + record.event_id.value + '"';
      var params = {
        'app': app_Id,
        'query': query
      };
      kintone.api(kintone.api.url('/k/v1/records'), 'GET', params , function (resp) {
        if(Number(record.target_record_count.value) === resp.records.length){
          alert("予約数に変更ありません。");
          return false;
        }
        else{
          // リクエストパラメータ
          var body = {
            'app': kintone.app.getId(),
            'id': kintone.app.record.getId(),
            'record': {
              'target_record_count': {
                'value': resp.records.length
              }
            }
          };
    
          kintone.api(
            kintone.api.url('/k/v1/record', true),'PUT',body,function(resp) {
            alert("予約数に変更がありました。");
            // success
            location.reload();
          }, function(error) {
            // error
          });
          
          
        }
      });
      
    });
    
    header.appendChild(countrequest_button);
    return event;
  });
  
})();
