const sheets = require('./sheets');
const request = require("request");
const base64 = require('base-64');
const SHIP_API_KEY = '6dff7c5f65cd43c78eeea5b79282c4cd';
const SHIP_API_SECRET = 'bb1af1c0e01e4206b3072bf9a889df13';
module.exports = {
    fetchSheets: async function() {
        try {
            return await sheets.fetchSheetData();
        } catch (error) {
            return error;
        }
    },
    compareData: function(sku, sheetData) {
        const skuIndex = sheetData.bundles.indexOf(sku);
        if (skuIndex === -1) {
            return null;
        }
        return sheetData.mapToBundles[skuIndex];
    },
    createShipstationOrder: function(obj) {
        const encodedAuth = base64.encode(`${SHIP_API_KEY}:${SHIP_API_SECRET}`);
        var options = {
            method: 'POST',
            url: 'https://ssapi.shipstation.com/orders/createorder',
            headers: {
                authorization: `Basic ${encodedAuth}`,
                'content-type': 'application/json'
            },
            body: obj,
            json: true
        };
        return new Promise((res, rej) => {
            request(options, function(error, response, body) {
                if (error) {
                    return rej(error);
                }
                return res(body);
            });

        });
    }
}