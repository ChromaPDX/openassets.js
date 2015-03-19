var fs = require('fs')
var url = require('url')
// Required modules
var openassets = require('openassets'),
    // Bitcore provides an excellent JSON-RPC client implementation. Substitute your favorite.
    request  = require('request');

var settings = JSON.parse(fs.readFileSync("settings.json"))
var config = { url: "https://api.chain.com/v2"};

// A wrapper to generate a "transaction provider" given a config.
//
// For generality, connection to the Bitcoin JSON-RPC service is
// externalized into the concept of a "transaction provider" that is
// expected to conform to the following simple API: given a Bitcoin
// transaction hash and a callback function, the provider must
// populate the callback with the results of the 'getRawTransaction'
// JSON-RPC call.
getTransactionProvider = function getTransactionProvider(config) {
  return function transactionProvider(hash, cb) {
    var api = url.parse(config.url)
    api.auth = settings.key+":"+settings.secret
    api.pathname = api.pathname+"/bitcoin/transactions/"+hash+"/hex"
    request(url.format(api), function(err, resp, body){
      var response = JSON.parse(body)
      cb(err, {result:response.hex}) // body.message body.result
    });
  };
};

// Create an instance of the Open Assets ColoringEngine, and pass to
// it a configured transaction provider
ce = new openassets.ColoringEngine(getTransactionProvider(config));

// Use the coloring engine to obtain information about a transaction. In
// this case, get the 0th output of a known Open Assets 'issuance' transaction.
// The first argument is the hash of the transaction, the 2nd is the index
// of the output to retrieve, and the third is a callback function that will
// be populated with the asset ID and asset quantity information, if any, associated with
// that output.
ce.getOutput(
  '77a6bbc65aa0326015835a3813778df4a037c15fb655e8678f234d8e2fc7439c',
  0, function (err, data) {

  // If anything went wrong, say so
  if (err) console.log(err.message);

  // Print the asset information as a raw TransactionOutput object
  console.log(data);

  // Use the TransactionOutput.toString() method to get a more readable representation
  console.log(data.toString());

});
