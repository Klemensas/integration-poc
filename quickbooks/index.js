const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

const QuickBooks = require('node-quickbooks');
const port = 8000;

const clientId = 'Q05pYHU0oiWsuI2Rv7Exia8C5hPBDl0or93fTrWT7eZy0zEsXu';
const clientSecret = 'fEj4f4gThyHBSYMcRJeZwtYD8mWmT9uV1iEjnv0c';

const authEndpoint = 'https://appcenter.intuit.com/connect/oauth2';
const tokenEndpoint = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

const app = express();
app.set('port',
port);
app.use(bodyParser.json());

app.get('/token', (req, res) => {
  const redirect = encodeURIComponent(`http://localhost:${port}/callback/`);
  res.redirect(`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirect}&scope=com.intuit.quickbooks.accounting&response_type=code&state=test`);
})

app.get('/callback', (req, res) => {
  const code = new Buffer(`${clientId}:${clientSecret}`).toString('base64');
  const body = {
    url: tokenEndpoint,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + code,
    },
    form: {
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: `http://localhost:${port}/callback/`
    }
  }
  request.post(body, (error, response) => {
    if (error) { return res.send(error).status(400); }
    initQuickbooks(JSON.parse(response.body), req.query.realmId);
  });
})

function initQuickbooks(token, realmId) {
  const quickbooks = new QuickBooks(
    clientId,
    clientSecret,
    token.access_token,
    false,
    realmId,
    true,
    false,
    4,
    '2.0',
    token.refresh_token,
  );

  quickbooks.findEstimates((error, estimates) => {
    if (error) {
      console.error('retrieval error', error);
      return;
    }

    console.log('got estimates', estimates.QueryResponse.Estimate);
    const estimate = estimates.QueryResponse.Estimate[0];
    estimate.Line[0].Description = 'Manipulated desc!';
    estimate.BillEmail.Address = 'haxed@mail.com';
    console.log('editing estimate', estimate);
    quickbooks.updateEstimate(estimate, (error, est) => {
      if (error) {
        console.error('estimate update error', error.Fault.Error)
      }
      console.log('updated estimate', est);
    })
  })
}


app.listen(port);