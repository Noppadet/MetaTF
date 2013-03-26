
/*
 * GET home page.
 */

exports.index = function(req, res){
  if(req.user) var steamID = req.user.steamid; // If user is logged in, set req.user to their steam id
  require('../controllers/user_controller').get(steamID, function(err, doc) {
    if (err) throw err;
    if(!doc) {
      res.render('index', { title: 'Meta.tf', user: null });
    } else {
      res.render('index', { title: 'Meta.tf', user: doc });
    }
  });
};
