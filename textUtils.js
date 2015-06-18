 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
var _           = require("underscore");
var Q           = require("q");
var jsdom       = require("jsdom");
var htmlToText  = require("html-to-text");

var attrRegex   = require("./komputronikRegex").getRegex();
var attributes  = require("./attributes.json");
var structure   = require("./categories.json");

/////////////////////////////////////////////////////////////////
exports.getCategoryAttributes   = getCategoryAttributes;
exports.getProductInfo          = getProductInfo;
/////////////////////////////////////////////////////////////////

var categoryAttributes = findAllCategoryAttributes(structure);
function getCategoryAttributes() {
    return categoryAttributes;
}


//////////////////////////////////////////////////////////////////////////////////////////
function getProductInfo(url, categoryName) {
    var deferred = Q.defer();
    try {
        jsdom.env(url, ["http://code.jquery.com/jquery.js"], function (err, window) {
            if ( err ) {
                throw err;
            }

            var htmlSpecification = window.$(".specification").html();
            var htmlName = window.$(".header .name").html();
            var htmlPrice = window.$(".innerPriceValue").html();
            if(!htmlPrice) {
                htmlPrice = window.$("[itemprop='lowPrice']").html();
            }
            if( htmlPrice ){
                htmlPrice = htmlPrice.replace(/(&nbsp;)|(\s+)|(zł)/g, "");
                htmlPrice = +htmlPrice.replace(",", ".");
            }

            var strSpecification = htmlToText.fromString( htmlSpecification );
            var product = getAllAttr(strSpecification, categoryAttributes[categoryName]);
            product.model = htmlName;
            product.price = htmlPrice;


            deferred.resolve(product);
        });
    }
    catch (err) {
        deferred.reject(err);
    }

    return deferred.promise;
}

/////////////////////////////////////////////////////////////////
function getAllAttr(descriptionStr, attributes) {
    var ret = {};
    _.each(attributes, function(attrName) {
        ret[attrName] = getAttrValue(attrName, descriptionStr);
    });
    return ret;
}

//////////////////////////////////////////////////////////////////////////////////////////
function getAttrValue(attrName, text) {
    var ret = "";
    var regEx = attrRegex[attrName];
    if( regEx ) if (regEx.exec(text)) {
        var attr = regEx.exec(text)[0];
        ret = attr.replace(regEx, "$1");

        if(attrName == "brand") {
            ret = ret.toLowerCase();
        }
        if(attrName == "hard-drive-size") { //zawsze w GB
            if (attr.replace(regEx, "$2") == "TB") {
                ret = +ret * 1024;
            }
        }
        else if(attrName == "ram-size") { // zawsze w GB
            if (attr.replace(regEx, "$2") == "MB") {
                ret = +ret / 1024;
            }
        }
        else if(attrName == "weight") { // zawsze w g
            if (attr.replace(regEx, "$2") == "kg") {
                ret = +ret * 1000;
            }
        }
        else if(attrName == "memory-size") { //zawsze w GB
            if (attr.replace(regEx, "$2") == "MB") {
                ret = +ret / 1024;
            }
        }
    }

    if(attributes[attrName].type == "number") {
            ret = +ret;
    }
    return ret;
}

/////////////////////////////////////////////////////////////////
function findAllCategoryAttributes(mainCategory) {
    var categoriesAttributes = {};

    function getCatAtt(category, categoryName, parentAttributes) {
        var ownAttributes = category["__attributes__"];

        if( ownAttributes instanceof Array ) {
            delete category["__attributes__"];

            if( parentAttributes ) {
                ownAttributes = ownAttributes.concat( parentAttributes );
            }
        }
        else {
            ownAttributes = parentAttributes;
        }

        if( Object.getOwnPropertyNames(category).length > 0 ) {
            _.each(category, function(cat, key) {

                //recursive call
                getCatAtt(cat, key, ownAttributes);

            });
        }
        else {
            categoriesAttributes[categoryName] = ownAttributes;
        }
    }

    getCatAtt(mainCategory, "mainCategory", null);

    return categoriesAttributes;
}
