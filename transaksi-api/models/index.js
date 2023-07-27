const dbConfig = require("../db");
const mongoose = require('mongoose');
const users    = require("./register")

module.exports = {
    mongoose,
    url: dbConfig.url,
    transaksi_db : require('./transaksi-data.js')(mongoose),
    users : require('./register')(mongoose)
}
