(function() {
  'use strict';
  var api_key,client_id,scopes;
  var discovery_docs = [];
  var param = {'app': 81,'id': 1};
  kintone.api(kintone.api.url('/k/v1/record', true), 'GET', param , function (event) {
    api_key = event.record.api_key.value;
    client_id = event.record.client_id.value;
    scopes = event.record.scopes.value;
    discovery_docs = event.record.discovery_docs.value.split(','));
    
    gapi.load('client:auth2', initClient);
  });
  
  // APIクライアントライブラリの初期化とサインイン
  async function initClient() {
    await gapi.client.init({
      apiKey: api_key,
      clientId: client_id,
      discoveryDocs: discovery_docs,
      scope: scopes
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function(error) {
      appendPre(JSON.stringify(error, null, 2));
    });
  }
  
  function updateSigninStatus(isSignedIn) {
    if (!isSignedIn) {
      gapi.auth2.getAuthInstance().signIn();
    }
  }

  function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }
})();
