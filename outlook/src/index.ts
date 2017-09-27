import { Client } from '@microsoft/microsoft-graph-client';
declare const Msal;

const clientId = '2a1caee3-4638-4036-badb-0b84c4b90253';
const scopes = ['User.Read', 'Files.ReadWrite.All'];
const uploadedName = 'test';
let client;
const userAgentApplication = new Msal.UserAgentApplication(clientId, null, (errorDescription, token, error, tokenType) => {
  // this callback is called after loginRedirect OR acquireTokenRedirect (not used for loginPopup/aquireTokenPopup)
})

userAgentApplication.loginPopup(scopes)
  .then(token => {
    console.log('user', userAgentApplication.getUser(), token);
    return userAgentApplication.acquireTokenSilent(scopes)
  })
  .then(token => {
    return token;
  }, error => {
    if (error.indexOf("interaction_required") != -1) {
      return userAgentApplication.acquireTokenPopup(scopes);
    }
  })
  .then(authToken => {
    client = Client.init({
      authProvider: (done) => done(null, authToken)
    });
    return listFiles();
  })
  .then(items => {
    const files = items.value.filter((item) => !item.hasOwnProperty('folder'));
    console.log('listed files', items.value, files)
    const randomItemIndex = Math.round(Math.random() * (files.length - 1));
    const randomItem = files[randomItemIndex];
    return downloadFile(randomItem)
  })
  .then(file => uploadFile(file))
  .then(w => console.log('okay', w))


function listFiles() {
  console.log('listing fikles')
  return client.api('/me/drive/root/children')
    .get()
}

function downloadFile(file) {
  // return client.api(`/me/drive/root/children/${file.name}/content`)
  //   .get()
  return fetch(file['@microsoft.graph.downloadUrl'])
    .then(response => response.blob())
}

function uploadFile(file, name = uploadedName) {
  return client.api(`/me/drive/root/children/${name}/content`)
    .put(file)
}

const authEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
const redirectUri = 'http://localhost:8081/build';
// import * as BoxSdk from 'box-javascript-sdk';
// // declare const BoxSdk;
// console.log('hi from box', BoxSdk);

// const clientId = 'xvj9izb00ozapwrk2vnx7pxrozj0xnbp';
// const clientSecret = 'H6GsWh1IId5iPzDDCcVTqxhjBR5wUGZe';
// const redirectUri = 'http://localhost:8080/build';
// const box = new BoxSdk.default();
// let boxClient;
// console.log('wat', box);

// function getAccessTokenFromUrl(url: string, target: string) {
//   const regex = new RegExp(`[\\?&#]${target}=([^&#]*)`);
//   const result = regex.exec(url);
//   return result === null ? null : decodeURIComponent(result[1].replace(/\+/g, ' '));  
// }

// function initialize() {
//   const code = getAccessTokenFromUrl(window.location.href, 'code');
//   if (!code) {
//     debugger;
//     window.location.replace(`${authEndpoint}response_type=&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}`);
//     return;
//   }
//   // accessToken(code)
// //     .then(() => getItem())
// }

// function accessToken(code) {
//   return fetch('https://api.box.com/oauth2/token', {
//     method: 'POST',
//     body: `grant_type=authorization_code&code=${code}&client_id=${clientId}&client_secret=${clientSecret}`,
//   })
//     .then(d => d.json())
//     .then(token => {
//       const accessToken = token.access_token;
//       console.log('got the accessToken', accessToken);
//       boxClient = new box.BasicBoxClient({ accessToken });
//     })
// }

// function getItem(id: string = '0') {
//   boxClient.folders.get({
//     id,
//     // params: {
//     //   fields: 'name, item_collection',
//     // }
//   })
//     .then(folder => {
//       console.log('root folder content', folder);
//       const items = folder.item_collection.entries.filter(item => item.type !== 'folder');
//       const randomItemIndex = Math.round(Math.random() * (items.length - 1));
//       const randomItem = items[randomItemIndex];
//       downloadItem(randomItem)
//     })
//     .catch(error => console.error('error', error))
// }
// function downloadItem(item) {
//   // return fetch(`https://api.box.com/2.0/files/${id}/content`, {
//   //   method: 'GET',
//   // })
//   boxClient.files.getDownloadUrl({
//     id: item.id,
//   })
//     .then(file => fetch(file.download_url, {
//       method: 'GET'
//     }))
//     .then(data => data.blob())
//     .then(file => uploadFile(item, file));
//     // .then(result => console.log('doiwnload', result));
// }

// function uploadFile(item, file) {
//   const formData = new FormData();
//   formData.append(item.name, file);
//   formData.append('parent_id', '0');
//   boxClient.files.upload({
//       body: formData,
//       url: `https://upload.box.com/api/2.0/files/${item.id}/content`
//   })
//     .then(data => console.log('uplaod success', data))
//     .catch(error => console.error('upload error', error))
// }

// initialize();