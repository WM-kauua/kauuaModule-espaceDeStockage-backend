'use strict'

const models = require(__dirname+'/../../../models');
const jwtOptions = require(__dirname+'/../../../authentication').optionsJWT;
const secret = jwtOptions.secretOrKey;
const jwt = require('jsonwebtoken');
const errorMessage = require(__dirname+'/../../../assets/error_message');
const fs = require('fs');
const util = require('util');
const stockageMkdir = util.promisify(fs.mkdir);
const stockageReaddir = util.promisify(fs.readdir);
const stockageCopyFile = util.promisify(fs.copyFile);
const stockageUnlink = util.promisify(fs.unlink);
const stockageStatSync = fs.statSync ;
const stockageStat = util.promisify(fs.stat);
const mime = require('mime-types');
const stockageRemoveDir = util.promisify(fs.rmdir);

const User = models.User;
const stockageDirName = __dirname+'/../../../../fileSystemExposure';
const stockageDirCache = __dirname+'/../../../../cache';
const path = require('path');
const disk = require('diskusage');

let directoryListing = {} ;

function diskcheck(path) {
  return new Promise( (resolve, reject) => {
    disk.check(path , (error, info) => {
      if(error){
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}

module.exports = {

  /**
   * @function createDir - create a directory
   */
  createDir(request, response){
    // retrieve use by euthenticating :
    let requestingUserId, requestingUser ;
    try{
      let token = request.get('Authorization').trim().slice(6).trim();
      let decoded = jwt.verify(token, secret);
      requestingUserId = decoded.id;
    }catch( exception ){
      return setTimeout(function() {
        return response.status(500).json({ error: errorMessage.server });
      },100);
    }

    let baseDirName ;

    User.findById(requestingUserId).then(user => {
      if(user){
        requestingUser = user;
        baseDirName = path.resolve(stockageDirName,requestingUser.name);
        // check if we are inside the user dir
        if(path.resolve(baseDirName,request.body.dirname).startsWith(baseDirName)){
          return stockageMkdir(path.resolve(baseDirName,request.body.dirname));
        }else{
          return response.status(403).end();
        }
        //return stockageMkdir(path.resolve(baseDirName,request.body.dirname));
      } else {
        return response.status(404).json({ error: errorMessage.userNotFound });
      }
    }).then( ok => {
      console.log('dir created');
      return stockageReaddir(path.resolve(baseDirName,request.body.dirname,'..'));
    }).then( files => {
      // send the parent directory listing
      let fileArray = [] ;
      let dirArray = [] ;
      let fullpathfile ;
      files.forEach( file => {
        console.log(file);
        fullpathfile = path.resolve(baseDirName,request.body.dirname,'..',file);
        let fileObject = {} ;

        if(stockageStatSync(path.resolve(fullpathfile)).isFile()){
          fileObject.name = file ;
          fileObject.type = mime.lookup(fullpathfile);
          fileArray.push(fileObject);
        }else if(stockageStatSync(path.resolve(fullpathfile)).isDirectory()){
          dirArray.push(file);
        }
      });

      directoryListing.files = fileArray ;
      directoryListing.directories = dirArray ;
      return response.status(200).json(directoryListing);

      // return response.status(201).json(files);
     
    }).catch( error => {
      console.log(error);
      try{
        return response.status(400).json({ error: errorMessage.badRequest });
      }catch(e) {}
    });

  },

  /**
   * @function removeDir - remove directory
   */

  removeDir( request, response ){
    let requestingUserId, requestingUser ;
    try{
      let token = request.get('Authorization').trim().slice(6).trim();
      let decoded = jwt.verify(token, secret);
      requestingUserId = decoded.id;
    }catch( exception ){
      return setTimeout(function() {
        return response.status(500).json({ error: errorMessage.server });
      },100);
    }

    let baseDirName ;

    User.findById(requestingUserId).then(user => {
      if(user){
        requestingUser = user;
        baseDirName = path.resolve(stockageDirName,requestingUser.name);
        // check if we are inside the user dir
        if(path.resolve(baseDirName,request.body.dirname).startsWith(baseDirName)){
          // remove the directory :
          return stockageRemoveDir(path.resolve(baseDirName,request.body.dirname));
        }else{
          return response.status(403).end();
        }
      }else{
        return response.status(404).json({ error: errorMessage.userNotFound });
      }
    }).then( ok => {
      console.log('dir created');
      return stockageReaddir(path.resolve(baseDirName,request.body.dirname,'..'));
    }).then( files => {
      // send the parent directory listing
      let fileArray = [] ;
      let dirArray = [] ;
      let fullpathfile ;
      files.forEach( file => {
        fullpathfile = path.resolve(baseDirName,file);
        let fileObject = {} ;

        if(stockageStatSync(path.resolve(baseDirName,file)).isFile()){
          fileObject.name = file ;
          fileObject.type = mime.lookup(fullpathfile);
          fileArray.push(fileObject);
        }else if(stockageStatSync(path.resolve(baseDirName,file)).isDirectory()){
          dirArray.push(file);
        }
      });

      directoryListing.files = fileArray ;
      directoryListing.directories = dirArray ;
      return response.status(200).json(directoryListing);

      // return response.status(201).json(files);

    }).catch( error => {
      console.log(error);
      try{
        return response.status(400).json({ error: errorMessage.badRequest });
      }catch(e) {}
    });


  },

  /**
   * @function uploadFile - upload a single file
   */
  uploadFile(request,response){
    console.log('upload file called');
    let requestingUserId, requestingUser ;
    try{
      let token = request.get('Authorization').trim().slice(6).trim();
      let decoded = jwt.verify(token, secret);
      requestingUserId = decoded.id;
    }catch( exception ){
      return setTimeout(function() {
        return response.status(500).json({ error: errorMessage.server });
      },100);
    }

    let baseDirName ;

    User.findById(requestingUserId).then(user => {
      if(user){
        console.log("user checked");
        requestingUser = user;
        Object.keys(request.body).forEach( clef => {
          console.log(' clef: '+request.body.clef+', '+request.body[clef]);
        });
        Object.keys(request.query).forEach( clef => {
          console.log(' clef: '+request.body.clef+', '+request.body[clef]);
        });
        baseDirName = path.resolve(stockageDirName,requestingUser.name);
        //return stockageMkdir(baseDirName+request.body.dirname);
        return request.file;
      } else {
        return response.status(404).json({ error: errorMessage.userNotFound });
      }
    }).then( somethin => {
      console.log(somethin);
      console.log(request.body.destinationpath);
      // copy the file from cache to destination path :
      if( path.resolve(baseDirName,request.body.destinationpath).startsWith(baseDirName)){
        baseDirName = path.resolve(baseDirName,request.body.destinationpath);
        let fullpathfile = path.resolve(baseDirName,request.file.originalname);
        console.log(fullpathfile);
        return stockageCopyFile(request.file.path,fullpathfile);
      }else{
        stockageUnlink(request.file.path);
        return response.status(403).end();
      }
    }).then (ok => {
      // should have been copied 
      // then ulink the cache for garbage collector
      return stockageUnlink(request.file.path);
    }).then( ok => {
      // as file is unlinked, send back the list of the destination dir :
      return stockageReaddir(baseDirName);
    }).then( files => {
      let fileArray = [] ;
      let dirArray = [] ;
      let fullpathfile ;
      files.forEach( file => {
        fullpathfile = path.resolve(baseDirName,file);
        let fileObject = {} ;

        if(stockageStatSync(path.resolve(baseDirName,file)).isFile()){
          fileObject.name = file ;
          fileObject.type = mime.lookup(fullpathfile);
          fileArray.push(fileObject);
        }else if(stockageStatSync(path.resolve(baseDirName,file)).isDirectory()){
          dirArray.push(file);
        }
      });

      directoryListing.files = fileArray ;
      directoryListing.directories = dirArray ;
      return response.status(200).json(directoryListing);

      //return response.status(200).json(files);
    }).catch(error => {
      console.log(error);
      try{
        return response.status(400).json({ error: errorMessage.badRequest });
      }catch(e) {}
    });

  },

  /**
   * @function removeFile - remove files
   */
  removeFile(request,response){
    let requestingUserId, requestingUser ;
    try{
      let token = request.get('Authorization').trim().slice(6).trim();
      let decoded = jwt.verify(token, secret);
      requestingUserId = decoded.id;
    }catch( exception ){
      return setTimeout(function() {
        return response.status(500).json({ error: errorMessage.server });
      },100);
    }

    let baseDirName,fileToRemove ;

    User.findById(requestingUserId).then(user => {
      if(user){
        requestingUser = user;
        baseDirName = path.resolve(stockageDirName,requestingUser.name);
        fileToRemove = request.body.fileToRemove;
        fullPathToFile = path.resolve(baseDirName,fileToRemove);
        //checkDir = path.resolve(stockageDirName,requestingUser.name);
        if(fullPathToFile.startsWith(baseDirName)){
          return stockageUnLink(fullPathToFile);
        }else{
          return response.status(403).end();
        }
      } else {
        return response.status(404).json({ error: errorMessage.userNotFound });
      }
    }).then( ok => {
      return response.status(204).end();
    }).catch( error => {
      console.log(error);
      try{
        return response.status(400).json({ error: errorMessage.badRequest });
      }catch(e) {}
    });
  },
  

  /**
   * @function uploadFiles - upload an array of files
   */
  uploadFiles(request,response){
    let requestingUserId, requestingUser ;
    try{
      let token = request.get('Authorization').trim().slice(6).trim();
      let decoded = jwt.verify(token, secret);
      requestingUserId = decoded.id;
    }catch( exception ){
      return setTimeout(function() {
        return response.status(500).json({ error: errorMessage.server });
      },100);
    }

    let baseDirName ;

    User.findById(requestingUserId).then(user => {
      if(user){
        requestingUser = user;
        baseDirName = path.resolve(stockageDirName,requestingUser.name);
        //return stockageMkdir(baseDirName+request.body.dirname);
      } else {
        return response.status(404).json({ error: errorMessage.userNotFound });
      }
    }).then( somethin => {

    }).catch(error => {
      console.log(error);
      try{
        return response.status(400).json({ error: errorMessage.badRequest });
      }catch(e) {}
    });
  },

  /**
   * @function listDirectory - renvoi le contenu du repertoire 
   */
  listDirectory(request,response){
    let requestingUserId, requestingUser ;
    try{
      let token = request.get('Authorization').trim().slice(6).trim();
      let decoded = jwt.verify(token, secret);
      requestingUserId = decoded.id;
    }catch( exception ){
      return setTimeout(function() {
        return response.status(500).json({ error: errorMessage.server });
      },100);
    }

    let baseDirName,checkDir ;
    User.findById(requestingUserId).then(user => {
      if(user){
        requestingUser = user;
        console.log(request.body.dirname);
        checkDir = path.resolve(stockageDirName,requestingUser.name);
        baseDirName = path.resolve(stockageDirName,requestingUser.name,request.body.dirname || './');
        if(baseDirName.startsWith(checkDir)){
          return stockageReaddir(baseDirName);
        }else{
          return response.status(403).end();
        }
//        return stockageReaddir(baseDirName);
      }else{
        return response.status(404).json({ error: errorMessage.userNotFound });
      }
    }).then(files => {
      let fileArray = [] ;
      let dirArray = [] ;
      let fullpathfile ;
      files.forEach( file => {
        fullpathfile = path.resolve(baseDirName,file);
        let fileObject = {} ;

        if(stockageStatSync(path.resolve(baseDirName,file)).isFile()){
          fileObject.name = file ;
          fileObject.type = mime.lookup(fullpathfile);
          fileArray.push(fileObject);
        }else if(stockageStatSync(path.resolve(baseDirName,file)).isDirectory()){
          dirArray.push(file);
        }
      });

      directoryListing.files = fileArray ;
      directoryListing.directories = dirArray ;
      return response.status(200).json(directoryListing);
    }).catch( error => {
      console.log(error);
      try{
        return response.status(400).json({ error: errorMessage.badRequest });
      }catch(e) {}
    });
    
    //console.log('been hit');
    //return response.status(200).end();
  },

  /**
   *  @function downloadFile - retrieve the file set in the request's body
   */
  downloadFile(request, response){
    let requestingUserId, requestingUser ;
    try{
      let token = request.get('Authorization').trim().slice(6).trim();
      let decoded = jwt.verify(token, secret);
      requestingUserId = decoded.id;
    }catch( exception ){
      return setTimeout(function() {
        return response.status(500).json({ error: errorMessage.server });
      },100);
    }

    let baseDirName, checkDir ;
    User.findById(requestingUserId).then( user => {
      requestingUser = user ;
      console.log(request.body.filename);
      checkDir = path.resolve(stockageDirName,requestingUser.name);
      baseDirName = path.resolve(stockageDirName,requestingUser.name,request.body.filename || './');
      console.log(baseDirName);
      if( baseDirName.startsWith(checkDir) ){
        //response.set('Content-Type','application/octet-stream');
        let server_filename = path.basename(baseDirName) ;
        response.set('Content-Disposition','attachment; filename='+server_filename);
        return response.sendFile(baseDirName);
      }else {
        return response.status(403).end();
      }
    }).catch( error => {
      console.log(error);
      try{
        return response.status(400).json({ error: errorMessage.badRequest });
      }catch(e) {}
    });
    
  },

  anotherDownloadFile(request, response){
    let requestingUserId, requestingUser ;
    try{
      let token = request.get('Authorization').trim().slice(6).trim();
      let decoded = jwt.verify(token, secret);
      requestingUserId = decoded.id;
    }catch( exception ){
      return setTimeout(function() {
        return response.status(500).json({ error: errorMessage.server });
      },100);
    }

    let baseDirName, checkDir ;
    User.findById(requestingUserId).then( user => {
      console.log('another downloadfile request '+request.query.fichier);
      requestingUser = user ;
      console.log(request.query.fichier);
      checkDir = path.resolve(stockageDirName,requestingUser.name);
      baseDirName = path.resolve(stockageDirName,requestingUser.name,request.query.fichier || './');
      console.log(baseDirName);
      if( baseDirName.startsWith(checkDir) ){
        //response.set('Content-Type','application/octet-stream');
        //let server_filename = path.basename(baseDirName) ;
        //response.set('Content-Disposition','attachment; filename='+server_filename);
        //return response.sendFile(baseDirName);
        //return response.attachment(baseDirName).sendFile(baseDirName);
        return response.download(baseDirName);
      }else {
        return response.status(403).end();
      }
    }).catch( error => {
      console.log(error);
      try{
        return response.status(400).json({ error: errorMessage.badRequest });
      }catch(e) {}
    });

  },

  /**
   * @function checkRemainingSpace - send the available space back to the requester
   */
  
  checkRemainingSpace(request,response){
    let requestingUserId, requestingUser ;
    try{
      let token = request.get('Authorization').trim().slice(6).trim();
      let decoded = jwt.verify(token, secret);
      requestingUserId = decoded.id;
    }catch( exception ){
      return setTimeout(function() {
        return response.status(500).json({ error: errorMessage.server });
      },100);
    }

    User.findById(requestingUserId).then( user => {
      requestingUser = user ;
      return checkdisk('/');
    }).then(info => {
      return response.status(200).json({ available: info.available, free: info.free, total: info.total });
    }).catch( error => {
      console.log(error);
      try{
        return response.status(400).json({ error: errorMessage.badRequest });
      }catch(e) {}
    });
  }


}
