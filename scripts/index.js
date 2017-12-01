'use strict'

const fs = require('fs');
const util = require('util');
const stockageMkdir = util.promisify(fs.mkdir);
const models = require(__dirname+'/../../../models');
const User = models.User ;
const dirStockage = __dirname+'/../../../../fileSystemExposure';
const path = require('path');

module.exports = (user) => {

  /**
   * @function - script d'association 
   *   - cree un repertoire pour le stockage.
   *   - return a promise
   */

  return stockageMkdir(path.resolve(dirStockage,user.name));

}

