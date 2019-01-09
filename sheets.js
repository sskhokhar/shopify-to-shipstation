const serviceAcc = require('./shopifytoshipsta-1546259610638-030b6b7b3514.json');
const {
    google
} = require('googleapis');
module.exports = {
    fetchSheetData: async function() {
        let jwtClient = new google.auth.JWT(
            serviceAcc.client_email,
            null,
            serviceAcc.private_key, ['https://www.googleapis.com/auth/spreadsheets']);
        try {
            //authenticate request
            await jwtClient.authorize();
            const data = await getData(jwtClient);
            return data;
        } catch (error) {
            return error;
        }
    }
}

function getData(jwtClient) {
    return new Promise((resolve, reject) => {
        let spreadsheetId = '1t7IAqvzaWY49lnlKFrDb1MQMCI-jEdxMyIs-Q78FsIg';
        let sheetName = "D:E"
        let sheets = google.sheets('v4');
        sheets.spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: spreadsheetId,
            range: sheetName,
            majorDimension: "COLUMNS"
        }, function(err, response) {
            if (err) {
                return reject(err);
            } else {
                const bundles = response.data.values[0].slice(1, response.data.values[0].length);
                const mapToBundles = response.data.values[1].slice(1, response.data.values[1].length);
                return resolve({
                    bundles,
                    mapToBundles
                });
            }
        });
    })

}