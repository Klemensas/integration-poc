const fs = require('fs');

const client = require('smartsheet');

const appId = '1cm8257kfnwl0taasrt';
const appSecret = '1l836mdedpuz91xir4k';
const accessToken = '2xf05l1kz2oq93erswk3mpazo6';

const smartsheet = client.createClient({ accessToken });

smartsheet.sheets.listSheets({})
  .then((sheetsList) => {
    console.log('available sheets', sheetsList);
    const randomFileIndex = Math.round(Math.random() * (sheetsList.data.length - 1));
    const randomFile = sheetsList.data[randomFileIndex];
    return randomFile;
  })
  .then(sheet => smartsheet.sheets.getSheet({ id: sheet.id }))
  .then(sheet => {
    const row = sheet.rows[0];
    return ({ body: {
      id: row.id,
      cells: [{
        columnId: row.cells[0].columnId,
        value: 'test!'
      }]
    }, sheetId: sheet.id })
  })
  .then(sheet => smartsheet.sheets.updateRow({ ...sheet }))
  .then(z => console.log('sheet', z))
  .catch(function(error) {
    console.log('sheet error', error);
  });