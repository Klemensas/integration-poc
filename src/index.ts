// TODO: use a legit import once https://github.com/dropbox/dropbox-sdk-js/pull/137 gets merged
declare const Dropbox: any;
declare const process: any;

if (!process.env.APP_KEY || process.env.APP_KEY === 'xxxxxxxxxxxxxxx') {
  throw ('Please create a dropbox app and provide an app key in webpack config file.');
}

let dbx;

function getAccessTokenFromUrl(url: string) {
  const regex = new RegExp('[\\?&#]access_token=([^&#]*)');
  const result = regex.exec(url);
  return result === null ? null : decodeURIComponent(result[1].replace(/\+/g, ' '));  
}

function initialize() {
  const accessToken = getAccessTokenFromUrl(window.location.hash);
  if (!accessToken) {
    dbx = new Dropbox({ clientId: process.env.APP_KEY });
    const authUrl = dbx.getAuthenticationUrl('http://localhost:8080/build');
    window.location.replace(authUrl);
    return;
  }
  dbx = new Dropbox({ accessToken });
  listFolders(dbx);
}

function listFolders(DB = dbx) {
  DB.filesListFolder({ path: ''})
  .then(files => {
    console.log('available files', files);
    const randomFileIndex = Math.round(Math.random() * (files.entries.length - 1));
    const randomFile = files.entries[randomFileIndex];
    console.log('picking random file, we got:', randomFile.name);
    fetchFile(randomFile.id)
  })
  .catch(error => console.error('file list error', error))
}

function fetchFile(path: string, DB = dbx) {
  const reader = new FileReader();
  let downloadedBlob;
  DB.filesDownload({ path })
    .then(file => {
      console.log('downloaded file', file);
      console.log('reading file as text')
      reader.readAsText(file.fileBlob);
      downloadedBlob = file.fileBlob;
    })
    .catch(error => console.error('download error', error));

  reader.onload = ((event) => {
    console.log('file read as text', event)
    uploadFile(path, downloadedBlob, DB);
  })
}

function uploadFile(path, contents, DB = dbx) {
  DB.filesUpload({ path, contents: contents, mode: { '.tag': 'overwrite' } })
    .then(file => console.log('upload success', file))
    .catch(error => console.error('upload error'));
}

initialize();