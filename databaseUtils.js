 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
var mysql = require("mysql");
var Q = require("q");
var _ = require("underscore");
var emitter = new (require('events').EventEmitter)();
var attributes = require("./attributes.json");
var categoryAttributes = require("./textUtils").getCategoryAttributes();

//////////////////////////////////////////////////////
exports.connect         = connect;
exports.createAllTables = createAllTables;
exports.addProductToDB  = addProductToDB;
exports.disconnect      = disconnect;
//////////////////////////////////////////////////////

var connection = mysql.createConnection({
  host     : '{HOST}',
  user     : '{USER}',
  password : '{PASS}',
  database : 'sag-wedt'
});

//////////////////////////////////////////////////////
function connect() {
    var deferred = Q.defer();

    connection.connect(function(err) {
      if (err) {
        deferred.reject(err);
      }
      else {
        deferred.resolve();
      }
    });

    return deferred.promise;
}

//////////////////////////////////////////////////////
function addProductToDB(product, categoryName) {
    var deferred = Q.defer();
    var attrs = categoryAttributes[categoryName];
    var sql = "INSERT INTO `cat-" + categoryName + "` (`id`";
    _.each(attrs, function(attr) {
        sql += ",`" + attr + "`";
    });
    sql += ") VALUES (NULL";
    _.each(attrs, function(attr) {
        sql += ",'" + product[attr] + "'";
    });
    sql += ");";

    connection.query(sql, function(err, result) {
        if (err) {
            deferred.reject(err);
        }
        else {
            console.log("product inserted");
            deferred.resolve();
        }
    });

    return deferred.promise;
}

/////////////////////////////////////////////////////////////////////////////////
function createAllTables() {
    var catNames = Object.getOwnPropertyNames(categoryAttributes);
    var i = -1,
        ii = catNames.length;
    var deferred = Q.defer();

    emitter.on('nextCategory', function() {
        i++;
        if(i < ii) {
            createTable(catNames[i], categoryAttributes[ catNames[i] ]).then(function() {
                console.log('Table cat-'+catNames[i], 'created.');
                emitter.emit('nextCategory');
            },
            function(err) {
                emitter.emit('error', err);
            });
        }
        else{
            emitter.emit('done');
        }
    });

    emitter.on('done', function() {
        deferred.resolve();
    });

    emitter.on('error', function(err) {
        deferred.reject(err);
    });

    emitter.emit('nextCategory');

    return deferred.promise;
}

/////////////////////////////////////////////////////////////////////////////////
function createTable(tableName, columns) {
    var deferred = Q.defer();

    //prepare sql statement
    var sql = "DROP TABLE IF EXISTS `cat-" + tableName + "`;";

    connection.query(sql, function(err, result) {
        if (err) {
            deferred.reject(err);
        }
        else {

            var sql = "CREATE TABLE `cat-" + tableName + "` (id int(11) NOT NULL AUTO_INCREMENT, ";
            _.each(columns, function(attributeName) {
                var attrDetails = attributes[attributeName];
                if(! attrDetails ) {
                    deferred.reject("unknown attributeName");
                }
                else {
                    sql += "`" + attributeName + "` " + attrDetails.sqlType + " NOT NULL, ";
                }
            });
            sql += "PRIMARY KEY (id) );";

            connection.query(sql, function(err, refult) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(result);
                }
            });
        }
    });

    return deferred.promise;
}

function disconnect() {
    connection.end();
}
