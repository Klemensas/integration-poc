import 'isomorphic-fetch';
import { implicit, client, oauth, refresher, me, projects, companies, images, token } from '@procore/js-sdk';

const clientId = 'e9596b6c09ad96bab9f51a493df6c155d32b9c9af695076c981833ed99cf8522';
const clientSecret = 'd6e7f659b140265b2ff22f205cc85a885a8ea8126e97b5d42165661ef91f0e3d';
const redirectUri = 'http://localhost:8081/build/'; 
const hostname = 'https://sandbox.procore.com';

const accessToken = getAccessTokenFromUrl(window.location.href, 'access_token');


if (!accessToken) {
  window.location.href = implicit({ id: clientId, uri: redirectUri }, hostname);
} else {
  console.log('access token', accessToken);
}

function authFetch(url, method = 'GET', token = accessToken) {
  return fetch(url, {
    method,
    headers: {
      'Authorization': 'Bearer ' + token,
    }
  }).then(r => r.json())
}

function getAccessTokenFromUrl(url: string, target: string) {
  const regex = new RegExp(`[\\?&#]${target}=([^&#]*)`);
  const result                                     = regex.exec(url);
  return result === null ? null : decodeURIComponent(result[1].replace(/\+/g, ' '));  
}