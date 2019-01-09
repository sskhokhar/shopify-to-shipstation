const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const utils = require('./utils');
const nodeUtils = require('util');
app.use(bodyparser.json());



app.get('/', async function(req, res) {
    return res.send('hola');
});

app.post('/', async function(req, res) {

    try {
        const sheetData = await utils.fetchSheets();
        const shipStationObj = {
            "orderNumber": "",
            "orderKey": "",
            "orderDate": "",
            "orderStatus": "awaiting_shipment",
            "customerId": null,
            "customerEmail": "",
            "billTo": {
                "name": "",
                "company": null,
                "street1": null,
                "street2": null,
                "city": null,
                "state": null,
                "postalCode": null,
                "country": null,
                "phone": null
            },
            "shipTo": {
                "name": "",
                "company": "",
                "street1": "",
                "street2": "",
                "city": "",
                "state": "",
                "postalCode": "",
                "country": "",
                "phone": ""
            },
            "items": [],
            "amountPaid": 0,
            "taxAmount": 0,


        }
        console.log(req.body);
        const shopifyObj = req.body;
        shipStationObj.orderNumber = shopifyObj.order_number;
        shipStationObj.orderKey = shopifyObj.id;
        shipStationObj.orderDate = shopifyObj.created_at;
        shipStationObj.amountPaid = parseFloat(shopifyObj.total_price);
        shipStationObj.customerEmail = shopifyObj.customer.email;
        shipStationObj.customerUsername = shopifyObj.customer.email;
        shipStationObj.taxAmount = parseFloat(shopifyObj.total_tax);

        shipStationObj.billTo.name = shopifyObj.billing_address.name;
        shipStationObj.billTo.street1 = shopifyObj.billing_address.address1;
        shipStationObj.billTo.street2 = shopifyObj.billing_address.address2;
        shipStationObj.billTo.city = shopifyObj.billing_address.city;
        shipStationObj.billTo.state = shopifyObj.billing_address.province;
        shipStationObj.billTo.postalCode = parseInt(shopifyObj.billing_address.zip);
        shipStationObj.billTo.company = shopifyObj.billing_address.company;
        shipStationObj.billTo.phone = shopifyObj.billing_address.phone;

        shipStationObj.shipTo.name = shopifyObj.shipping_address.name;
        shipStationObj.shipTo.street1 = shopifyObj.shipping_address.address1;
        shipStationObj.shipTo.street2 = shopifyObj.shipping_address.address2;
        shipStationObj.shipTo.city = shopifyObj.shipping_address.city;
        shipStationObj.shipTo.state = shopifyObj.shipping_address.province;
        shipStationObj.shipTo.postalCode = parseInt(shopifyObj.shipping_address.zip);
        shipStationObj.shipTo.company = shopifyObj.shipping_address.company;
        shipStationObj.shipTo.phone = shopifyObj.shipping_address.phone;

        const items = processLineItems(shopifyObj.line_items, sheetData);
        shipStationObj.items = items;
        if (items.length > 0) {
            utils.createShipstationOrder(shipStationObj).then((res) => {
                console.log(nodeUtils.inspect(res))
            }).catch((err) => console.log(nodeUtils.inspect(err)))
        }
        console.log(items);
        console.log(shipStationObj);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(200);
    }
});

app.listen(3000);

function processLineItems(lineItemsArr, sheetObj) {
    const newArray = lineItemsArr;
    const items = [];
    const simples = [];
    const bundles = [];
    lineItemsArr.forEach((item, index) => {
        const itemSku = item.sku;
        const newSku = utils.compareData(itemSku, sheetObj);
        if (!newSku) {
            // do not map to anything. Just process it as it is because this is simple item.
            return simples.push({
                lineItemKey: JSON.stringify(item.id),
                sku: item.sku,
                name: item.name,
                weight: {
                    "value": item.grams,
                    "units": "grams"
                },
                quantity: item.quantity,
                unitPrice: parseFloat(item.price)
            });
        }
        if (newSku == "Nothing") {
            // do not import this order. Strip it from array because this item is digital.
            // return newArray.splice(index, 1);
            return;
        }
        return bundles.push({
            lineItemKey: JSON.stringify(item.id),
            sku: item.sku,
            name: item.name,
            weight: {
                "value": item.grams,
                "units": "grams"
            },
            quantity: item.quantity,
            unitPrice: parseFloat(item.price)
        });
        // newArray[index].sku = newSku;
    });
    // newArray.forEach(obj => {

    // });
    return bundles.length == 0 ? [] : bundles.concat(simples);
}