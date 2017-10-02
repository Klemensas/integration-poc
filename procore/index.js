const fs = require('fs');
const { implicit, client, oauth, refresher, me, projects, images } = require('@procore/js-sdk');

const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzUxMiJ9.eyJhaWQiOiJlOTU5NmI2YzA5YWQ5NmJhYjlmNTFhNDkzZGY2YzE1NWQzMmI5YzlhZjY5NTA3NmM5ODE4MzNlZDk5Y2Y4NTIyIiwiZXhwIjoxNTA2NzE0NTg0LCJ1aWQiOjExMjV9.ALVSkP_nxvREJt2uQm5h18yOiIvbH1LBEFqoPkx-U9MjhOXEe5Dmxx7XbI82Bq_T-uNPmKYiNi7HgLtSXuzWIwf-AD-QQHKHVOpYH_6zLIm4jtqc_UmfYVIYDcpOBSHWgZXbFW2d37SQ_FFji5ymHUpwKEEZqhAKfF4iNkqxAxGCqN1I";
const hostname = 'https://sandbox.procore.com';

let proj;
authFetch(`${hostname}/vapid/companies`)
  .then(companies => companies[0].id)
  .then(company => authFetch(`${hostname}/vapid/projects/?company_id=${company}`))
  .then(projects => proj = projects[0].id)
  .then(project => authFetch(`${hostname}/vapid/folders/?project_id=${project}`))
  .then(files => {console.log('f', files.files); return files.files[0].id })
  .then((file, project = proj) => authFetch(`${hostname}/vapid/files/${file}/?project_id=${project}`))
  .then(file => file.file_versions[0].url)
  .then(() => fs.readFileSync('package.json', 'utf8'))
  // .then(file => authFetch(file, 'get', accessToken, 'blob'))
  .then((file, project = proj) => authFetch(`${hostname}/vapid/files/?project_id=${project}`, 'POST', { file: {
    name: 'test.json',
    data: file,
    description: 'test desc'
  }}))
  .then(response => console.log('done', response))
  .catch(error => console.error('uh oh', error))

function authFetch(url, method = 'GET', body = {}, token = accessToken) {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(body),
  })
  .then(r => r.json())
}
