import * as BoxSdk from 'box-javascript-sdk';


const clientId = 'xvj9izb00ozapwrk2vnx7pxrozj0xnbp';
const clientSecret = 'H6GsWh1IId5iPzDDCcVTqxhjBR5wUGZe';
const redirectUri = 'http://localhost:8080/build';
const box = new BoxSdk.default();
let boxClient;

function getAccessTokenFromUrl(url: string, target: string) {
  const regex = new RegExp(`[\\?&#]${target}=([^&#]*)`);
  const result = regex.exec(url);
  return result === null ? null : decodeURIComponent(result[1].replace(/\+/g, ' '));  
}

function initialize() {
  const code = getAccessTokenFromUrl(window.location.href, 'code');
  if (!code) {
    window.location.replace(`https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`);
    return;
  }
  accessToken(code)
    .then(() => getItem())
}

function accessToken(code) {
  return fetch('https://api.box.com/oauth2/token', {
    method: 'POST',
    body: `grant_type=authorization_code&code=${code}&client_id=${clientId}&client_secret=${clientSecret}`,
  })
    .then(d => d.json())
    .then(token => {
      const accessToken = token.access_token;
      console.log('got the accessToken', accessToken);
      boxClient = new box.BasicBoxClient({ accessToken });
    })
}

function getItem(id: string = '0') {
  boxClient.folders.get({
    id,
    // params: {
    //   fields: 'name, item_collection',
    // }
  })
    .then(folder => {
      console.log('root folder content', folder);
      const items = folder.item_collection.entries.filter(item => item.type !== 'folder');
      const randomItemIndex = Math.round(Math.random() * (items.length - 1));
      const randomItem = items[randomItemIndex];
      downloadItem(randomItem)
        .then(file => uploadFile(randomItem, file))
    })
    .catch(error => console.error('error', error))
}

function downloadItem(item) {
  return boxClient.files.getDownloadUrl({
    id: item.id,
  })
    .then(file => fetch(file.download_url, {
      method: 'GET'
    }))
    .then(data => data.blob());
}

function uploadFile(item, file) {
  const formData = new FormData();
  formData.append(item.name, file);
  formData.append('parent_id', '0');

  return boxClient.files.upload({
      body: formData,
      url: `https://upload.box.com/api/2.0/files/${item.id}/content`
  })
    .then(data => console.log('uplaod success', data))
    .catch(error => console.error('upload error', error))
}

initialize();