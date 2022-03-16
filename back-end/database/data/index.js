const fs = require('fs');
const path = require('path');
const papaparse = require('papaparse');


const file = path.resolve(__dirname, 'data.csv');
const data = fs.readFileSync(file, { encoding: 'utf-8' }).toString().trim()


module.exports.getSampleData = (async function getSampleData() {

  return new Promise((resolve, reject) => {
    papaparse.parse(data, {
      header: true,
      fastMode: true,
      complete: results => {
        console.log(`Parsing complete! Total rows: ${results.data.length}`);
        resolve(results.data);
      },
      error: error => {
        console.log(error);
        reject(error);
      }
    });

  });

});
