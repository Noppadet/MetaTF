/**
 * Downloads TF2 Schema, and then downloads the item icons
 */
/**
 * Module dependencies
 */
var fs = require('fs'),
    qs = require('querystring'),
    im = require('imagemagick'),
    http = require('http');

/**
 * Download TF2 Schema (as JSON txt file)
 */
exports.download = function (req, res, next) {
  var PullFromSteamApi = require('./models/steamapi_model');
  PullFromSteamApi(null, 'schema', function (err, schema) {
    var stream = fs.createWriteStream("./models/tf2item_schema.txt");
    try {
      stream.once('open', function (fd) {
        var result = schema.result;
        stream.write(JSON.stringify(result), null, 4); // Schema.result is all we want.
        stream.end();
        console.log('Schema written to file');
        DownloadItemIcons(req, res, next);
      });
    } catch (e) {
      return fn(new Error('Bad Steam response. Try again later.'));
    }
  });
};

/**
 * Downloads item icons, resizes them, and writes them to /public/item_icons/
 */
function DownloadItemIcons(req, res, next) {
  require('../routes/user_route').schema(req, res, next, function (err, doc) {
    if (doc) {
      var length = doc.items.length;
      var items = doc.items;
      console.log(length);
      for (var i = 0; i < length; i++) {
        try {
          if (items[i].image_url) {
            ConnectAndGet(req, res, next, items[i].defindex, items[i].image_url); // Download the items
            //ResizeItemIcons(items[i].defindex); Crashing the server here
          }
        } catch (e) {
          //return fn(new Error('Error code: #48102'));
          console.log(e);
        }
      }
    }
  });

  function ConnectAndGet(req, res, next, defindex, imageurl) {
    var imagePath = __dirname + '/../public/item_icons/';
    var request = http.get(imageurl, function (res) {
      var imagedata = '';
      res.setEncoding('binary');
      res.on('data', function (chunk) {
        imagedata += chunk;
      });

      res.on('end', function () {
        var currentdir = process.cwd();
        fs.writeFile(imagePath + defindex + '.png', imagedata, 'binary', function (err) {
          if (err) throw err;
          // Resize with imagemagick
          console.log('File saved. ' + defindex + '.png');
        });
      });
    });
  }
}

exports.resizeitems = function (req, res, next) {
  require('../routes/user_route').schema(req, res, next, function (err, doc) {
    if (doc) {
      var length = doc.items.length;
      var items = doc.items;
      var currentdir = process.cwd();
      process.chdir(__dirname + '/../public/item_icons');
      for (var i = 0; i < length; i++) {
        var defindex = doc.items[i].defindex;
        try {
          if (items[i].image_url) {
            im.resize({
              srcPath: defindex + '.png',
              dstPath: defindex + '.png',
              width: 80
            }, function (err, stdout, stderr) {
              if (err) throw err;
              console.log('resized ' + defindex + '.png');
            });
          }
        } catch (e) {
          //return fn(new Error('Error code: #48102'));
          console.log(e);
        }
      }
      process.chdir(currentdir);
    }
  });
};