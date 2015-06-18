 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
var _           = require("underscore");
var Q           = require("q");
var emitter = new (require('events').EventEmitter)();

var products = require("./products.json");

var textUtils   = require("./textUtils");
var dbUtils     = require("./databaseUtils");

////////////////////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////////////////////
dbUtils.connect()
	.then(dbUtils.createAllTables)
	.then(processAllProducts)
	.then(function() {
		console.log('done');
		dbUtils.disconnect();
	});

////////////////////////////////////////////////////////////////////////////////
function processAllProducts() {
	var deferred = Q.defer();
	var categories = Object.getOwnPropertyNames(products);
	var i = -1, ii = categories.length;
	var urls, j, jj;

	emitter.on('nextCategory', function() {
		if(++i < ii) {
			urls = products[ categories[i] ];
			j = -1;
			jj = urls.length;
			emitter.emit('nextProduct');
		}
		else {
			emitter.emit('done');
		}
	});

	emitter.on('nextProduct', function() {
		if(++j < jj) {
			var url = urls[j];
			var category = categories[i];

			textUtils.getProductInfo(url, category).then(function(productInfo) {
				console.log(category + ": " + productInfo.model);

				dbUtils.addProductToDB(productInfo, category).then(function() {
					emitter.emit('nextProduct');
				});

			});
		}
		else {
			emitter.emit('nextCategory');
		}
	});

	emitter.on('done', function() {
		deferred.resolve();
	});

	emitter.emit('nextCategory');

	return deferred.promise;
}
