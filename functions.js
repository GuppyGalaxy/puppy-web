var bcrypt = require('bcryptjs'),
    Q = require('q'),
	fs = require('fs');
fs.readFile("./users.localReg.JSON", "utf-8", function(err, data){if(data !== undefined){exports.users = JSON.parse(data);}});
var saveUsers = function(users2){
  fs.writeFile("./users.localReg.JSON", JSON.stringify(users2));
}
//used in local-signup strategy
exports.localReg = function (username, password) {
  var deferred = Q.defer();
  if(exports.users[username] !== undefined){
    console.log('username already exists');
    deferred.resolve(false); //username already exists
  } else {
    var hash = bcrypt.hashSync(password, 8);
    var user = {
      "username": username,
      "password": hash,
      "avatar": "http://placepuppy.it/images/homepage/Beagle_puppy_6_weeks.JPG"
    }
    var result = user
    console.log("creating user");
    exports.users[username] = user
    saveUsers(exports.users);
    deferred.resolve(user)
  }
  return deferred.promise
}


//check if user exists
    //if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
      //if password matches take into website
  //if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function (username, password) {
  var deferred = Q.defer();
  if (exports.users[username] !== undefined){
    var result = exports.users[username]
    console.log("FOUND USER");
    var hash = result.password;
    console.log(hash);
    console.log(bcrypt.compareSync(password, hash));
    if (bcrypt.compareSync(password, hash)) {
      deferred.resolve(result);
    } else {
      console.log("PASSWORDS NOT MATCH");
      deferred.resolve(false);
    }
  }
  saveUsers(exports.users);
  return deferred.promise;
}