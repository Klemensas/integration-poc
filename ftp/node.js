const path = require('path');
const fs = require('fs');
const stream = require('stream');

const FtpClient = require('ftp');

const host = '145.14.144.87';
const user = 'phonemic-launcher';
const password = 'N3ijJ9pJ90K7';
const ftp = new FtpClient();
const listPath = '.';
const savedFile = 'test.txt';

function _promiseResolve(resolve, reject) {
  return (error, data) => {
    if (error) {
      return reject(error);
    }
    return resolve(data);
  }
}

function connect(host, user, password) {
  return new Promise((resolve, reject) => {
    ftp.on('ready', _promiseResolve(resolve, reject));
    ftp.connect({
      host,
      user,
      password
    })
  });
}

function listFiles(path) {
  return new Promise((resolve,reject) => ftp.list(path, _promiseResolve(resolve, reject)));
}

function getFile(path) {
  return new Promise((resolve, reject) => ftp.get(path, _promiseResolve(resolve, reject)));
}

function uploadFile(path, name) {
  return new Promise((resolve, reject) => ftp.put(path, name, _promiseResolve(resolve, reject)));
}

connect(host, user, password)
  .then(() => listFiles(listPath))
  .then(data => data.filter(({ type }) => type !== 'd' ))
  .then(files => {
    console.log('files', files)
    const randomFileIndex = Math.round(Math.random() * (files.length - 1 ));
    const randomFile = files[randomFileIndex];
    return randomFile.name;
  })
  .then(name => getFile(path.join(listPath, name)))
  .then(stream => {
    stream.pipe(fs.createWriteStream(savedFile));
    return new Promise((resolve, reject) => stream.on('close', _promiseResolve(resolve, reject)));
  })
  .then(() => uploadFile(path.join(__dirname, savedFile), path.join(listPath, savedFile)))
  .then(d => console.log('upload success', d))
  .catch(error => console.error('uh oh', error));