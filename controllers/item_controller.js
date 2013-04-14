
/**
 * Trade Controller
 * Renders schema and backpack items for trade creation
 */

/**
 * Renders a user's backpack
 */
exports.showbackpack = function (req, res, next) {
  require('../models/item_model').getbackpack(req, res, next, function (err, backpackitems, backpackHasNewIems) {
    var bpitems = backpackitems.items;
    var backpackslots = backpackitems.num_backpack_slots;

    // User is logged in
    // Send the params for the navbar
    // Add the backpack checkee to db if necessary
    if (req.user) {
      require('../models/user_model').get(req.user.steamid, function (err, doc) {
        if (err) throw err;
        require('../models/user_model').checkIfUserAddToDbIfNot(req.params.id); // Add owner of checked backpack to database if necessary
        require('../models/user_model').pullUserDataFromSteamAPI(req.params.id); // Get the user's information, add it to database
        require('../models/user_model').get(req.params.id, function (err, backpackOwner) {
          if (doc && backpackOwner) {
            if (err) throw err;
            res.render('backpack', {
              title: 'Backpack',
              items: bpitems,
              id: req.params.id,
              bpslots: backpackslots,
              user: doc,
              bpowner: backpackOwner,
              newItems: backpackHasNewIems
            });
          } else {
            res.render('/');
          }
        });
      });
    } else { // Not a logged in user; no navbar params
      require('../models/user_model').checkIfUserAddToDbIfNot(req.params.id);
      require('../models/user_model').pullUserDataFromSteamAPI(req.params.id);
      require('../models/user_model').get(req.params.id, function (err, backpackOwner) {
        if (backpackOwner) {
          if (err) throw err;
          res.render('backpack', {
            title: 'Backpack',
            items: bpitems,
            id: req.params.id,
            bpslots: backpackslots,
            user: null,
            bpowner: backpackOwner,
            newItems: backpackHasNewIems
          });
        } else {
          res.render('/');
        }
      });
    }
  });
};

/**
 * Renders a user's backpack
 * vars: obj = schema, doc = user
 */
exports.showschema = function (req, res, next) {
  require('../models/item_model').getschema(req, res, next, function (err, obj) {
    var steamID = '';
    if (req.user) steamID = req.user.steamid;
    require('../models/user_model').get(steamID, function (err, doc) {
      if (err) throw err;
      if (!doc) {
        res.render('schema', {
          title: 'Schema',
          results: obj.items,
          user: null
        });
      } else {
        res.render('schema', {
          title: 'Schema',
          results: obj.items,
          user: doc
        });
      }
    });
  });
};