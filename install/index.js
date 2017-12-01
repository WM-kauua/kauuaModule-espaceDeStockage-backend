'use strict'

const fs = require('fs');
const util = require('util');
const stockageMkdir = util.promisify(fs.mkdir) ;
const path = require('path');

const stockageDirName = __dirname+'/../../../../fileSystemExposure';
const stockageDirCache = __dirname+'/../../../../cache';


/**
 * used to migrate the database once to install the module
 */

module.exports = function(queryInterface, Sequelize){

  // queryInterface is from the sequelize instance method : getQueryInterface 
  //  called from the controller module once routed to insert the module in the database

  console.log('installer : check it');
  
  // Pas de migrations pour le module espace de stockage pour le moment
  console.log('create directory for cache');
  stockageMkdir(path.resolve(stockageDirCache)).then( ok => {
    console.log('for cache : '+ok);
  }).catch( error => {
    console.log(error);
  });
  
  console.log('create directory for user storage');
  stockageMkdir(path.resolve(stockageDirName)).then( ok => {
    console.log(' for user :'+ok);
  }).catch( error => {
    console.log(error);
  });
}


