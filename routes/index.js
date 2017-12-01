'use strict'

const passport = require(__dirname + '/../../../authentication').passport;
const espaceDeStockageController = require(__dirname + '/../controllers').stockage;
const espaceDeStockageDir = __dirname+'/../../../../fileSystemExposure';
const multer = require('multer');
const upload = multer({ dest: espaceDeStockageDir });
const path = require('path');

module.exports = (app) => {

  app.post('/api/kmodule/espaceDeStockage/directory',	passport.authenticate('jwt', { session: false }),	espaceDeStockageController.createDir);

  app.post('/api/kmodule/espaceDeStockage/file',		passport.authenticate('jwt', { session: false }), upload.single('fichier'),  espaceDeStockageController.uploadFile);
  app.post('/api/kmodule/espaceDeStockage/files',       	passport.authenticate('jwt', { session: false }), upload.single('fichiers'), espaceDeStockageController.uploadFiles);
  app.put('/api/kmodule/espaceDeStockage/directory',	 	passport.authenticate('jwt', { session: false }), espaceDeStockageController.listDirectory);
  app.put('/api/kmodule/espaceDeStockage/file',			passport.authenticate('jwt', { session: false }), espaceDeStockageController.downloadFile);
  app.get('/api/kmodule/espaceDeStockage/file',			passport.authenticate('jwt', { session: false }), espaceDeStockageController.anotherDownloadFile);

  // serving assets :
  app.get('/icons/:filename', (request, response) => {
    let filepath = path.resolve(__dirname,'../../../../fileSystemExposure/icons',request.params.filename);
    if(filepath.startsWith("/home/")){
      response.sendFile(filepath);
    } else{
      response.status(401).end()
    }
  });

}
