declare const gapi;
window.onload = (() => gapi.load('client:auth2', start));

const b64 = 'https://gist.githubusercontent.com/Klemensas/2bbeb6c7f5e9e8ba134e1170b25bee32/raw/666012ec0f424a47309bc8dc65d8615d5269c343/a';

function start() {
  gapi.client.init({
      apiKey: 'AIzaSyA6avKgntzlUt-BdaUmac3_fCQFw4OurvA',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest', 'https://sheets.googleapis.com/$discovery/rest?version=v4'],
      clientId: '642064418666-8dmspmuvi5khqn7042edp558ogva4a90.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/spreadsheets https://picasaweb.google.com/data',
  }).then(() => {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  })
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    driveApiCall();
    drivePhotosApiCall();
    fetch(b64).then(res => res.arrayBuffer()).then(blob => {
      console.log('got blob', blob);
      uploadPhoto(blob);
    })
    // uploadFile();
    return;
  }
  gapi.auth2.getAuthInstance().signIn();
}

function driveApiCall() {
  gapi.client.drive.files.list({
    fields: 'files(id, name, webContentLink, webViewLink, mimeType)'
  }).then((response) => {
    console.log('drive file list', response);

    const files = response.result.files;
    const randomFile = Math.round(Math.random() * (files.length - 1));
    const spreadsheet = files.find(f => f.mimeType === 'application/vnd.google-apps.spreadsheet');
    sheetsApiCall(spreadsheet);
    // getFile(files[randomFile]);
    getFile(spreadsheet);
  })
}

function drivePhotosApiCall() {
  gapi.client.drive.files.list({
    spaces: 'photos',
    fields: 'files(id, name, webContentLink, webViewLink, mimeType)'
  })
    .then((response) => console.log('photos', response));
}

function uploadPhoto(file) {
  const user = gapi.auth2.getAuthInstance().currentUser.get();
  const token = user.getAuthResponse().access_token;
  console.log('was is das', file);
  return fetch('https://picasaweb.google.com/data/feed/api/user/default/albumid/12323?{alt=FETCH_AS_JSON}', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Authorization': 'Bearer ' + token
    },
    method: 'POST',
    body: file
  })
    .then(r => r.json())
    .then(r => console.log('upl done', r))
    .catch(error => console.error('err', error));
}

function sheetsApiCall(sheet) {
  return gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: sheet.id,
    range: 'Sheet1!G21',
    valueInputOption: 'USER_ENTERED',
    values: [ ['1,23', 'hey', true] ]
  })
    .then((response) => console.log('sheets', response, sheet))
}

function getFile(file) {
  console.log('getting random file', file.name, file.webContentLink, file);
  const user = gapi.auth2.getAuthInstance().currentUser.get();
  const token = user.getAuthResponse().access_token;
  console.log('export');
  return gapi.client.drive.files.export({
    fileId: file.id,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    // mimeType: 'application/vnd.google-apps.document'
  }).then((response) => {
    console.log('got file', response)
  })
}

function updateFile(file) {
  console.log('updating')
  const user = gapi.auth2.getAuthInstance().currentUser.get();
  const token = user.getAuthResponse().access_token;
  return fetch('https://www.googleapis.com/upload/drive/v3/files/' + file.id, {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': file.mimeType,
    },
    body: file.body
  })
  .then(res => res.json())
  .then(d => console.log('updated file', d))
}