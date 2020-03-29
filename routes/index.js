/*
* GET home page.
*/
 
exports.index = function(req, res){
    var message = 'To Our Education Board';
  res.render('index',{message: message});
 
};
