(function() {
  kintone.events.on('app.record.detail.show',function(event) {

    const appId = kintone.app.getRelatedRecordsTargetAppId("target_record");
    const query = 'event_id="' + event.record.event_id.value + '"';
    const getbody = {
      'app' : appId,
      'query' : query
    };
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', getbody, function(resp) {
      var count = 0;
      resp.records.forEach((record)=>{
        count += 1;
      });

      if(Number(event.record.target_record_count.value) === count){return false;}

       // リクエストパラメータ
      var body = {
        'app': kintone.app.getId(),
        'id': kintone.app.record.getId(),
        'record': {
          'target_record_count': {
            'value': count
          }
        }
      };

      kintone.api(
        kintone.api.url('/k/v1/record', true),'PUT',body,function(resp) {
        // success
        location.reload();
      }, function(error) {
        // error
      });
    });
  });
})();
