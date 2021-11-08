(function() {
  'use strict';
  
  var keysObj;
  var keysArray = [];
  var table_keysArray = [];
  var headerArray = [];
  var tabel_column_button = [];
  
  /*　項目設定オブジェクト格納　*/
  var body = {
    'app': 85,
    'id': 1
  };
  kintone.api(kintone.api.url('/k/v1/record.json', true), 'GET', body, function(resp) {
    keysObj = resp; 
  });
  
  /*　ボタンの設置及び処理の設定　*/
  kintone.events.on(['app.record.edit.show','app.record.create.show','app.record.detail.show'], function(event) {
    const space = kintone.app.record.getSpaceElement('table_button_space');
    const numButton = keysObj.record.序列設定.value.length;

    /* ボタン設置 */
    if(numButton>tabel_column_button.length){
      for (let i = 0; i < keysObj.record.序列設定.value.length; i++){
        keysArray.push(keysObj.record.序列設定.value[i].value.序列設定項目.value);
      }
    }
      
    for (let i = 0; i < keysArray.length; i++){
      tabel_column_button.push(new Kuc.Button({id:'tabel_column_button'+i,text:keysArray[i],type: 'button'}));
      space.appendChild(tabel_column_button[i]);
    }

    for (let i = 0; i < tabel_column_button.length; i++){
      tabel_column_button[i].addEventListener('click', event => {setFieldShown(tabel_column_button[i].text);});
    }
    
    /*　受講者情報テーブルのフィールドIDを取得　*/
    var tableObj = Object.values(Object.values(cybozu.data.page.FORM_DATA.schema.subTable));
    tableObj = tableObj.filter(item => item.var === 'students_table');
    tableObj = Object.values(tableObj[0].fieldList);
    for(let i = 0; i < tableObj.length; i++){
      table_keysArray.push(tableObj[i].var);
    }
    setAllFieldShownFalse();
    setFieldShown('共通');
    return event;
    
  }, function(error) {
    // error
    console.log('設定が見つかりません' + error);
  });
  
  function setAllFieldShownFalse(){
    /*　全列非表示　*/
    for(let i = 0; i < table_keysArray.length; i++){
      kintone.app.record.setFieldShown(table_keysArray[i], false);
    }
    /*　先頭列格納　*/
    for (let i = 0; i < keysObj.record.先頭列.value.length; i++){
      headerArray.push(keysObj.record.先頭列.value[i].value.先頭列項目.value);
    }
    /*　先頭列表示　*/
    for (let i = 0; i < headerArray.length; i++){
      kintone.app.record.setFieldShown(headerArray[i], true);
    }
  }
  
  function setFieldShown(buttonText){
    /*　初期化　*/
    setAllFieldShownFalse();
    
    /*　項目名表示　*/
    var keyName = buttonText + '項目';
    for(let i = 0; i < keysObj.record[buttonText].value.length; i++){
      kintone.app.record.setFieldShown(keysObj.record[buttonText].value[i].value[keyName].value, true);
    }
    return;
  }
  
  
})();
