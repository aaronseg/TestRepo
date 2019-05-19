/**
 * Created by fmark on 29.06.2017.
 */
const express = require("express");
const router = express.Router();
var fs = require('fs');
const bodyParser = require("body-parser");
const ressourceName = "users";

// --- POST REQUESTS --- ///

//neuen nutzer eingeben
router.post('/', bodyParser.json(), function(req,res){
    if(validate(req.body.name) == 0){
        if(req.body.passwort== null){
            res.status(400).type('text').send('Passwort eingeben');
        }
        else{
            req.body.id = data.count++;
            req.body.abonnieren = {};
            req.body.abonnieren.user = [];
            req.body.abonnieren.playlist = [];
            req.body.playlistcount =0;
            console.log(req.body);
            data.users.push(req.body);
            res.status(201).json({uri: req.protocol + "://" + req.headers.host + "/" + ressourceName + "/" + req.body.id})
        }
    }else{
        res.status(400).type('text').send('Username schon vorhanden !');
    }
});


// --- GET REQUESTS --- ///

//login (username + passwort überprüfung)
/*
router.get('/login/:username/:userpasswort', function(req,res){
        var username= req.params.username;
        var userpasswort= req.params.userpasswort;
        var c = 0;

    for(var i= 0; i < data.count ; i++){
        if(username === data.users[i].name ){
            if(userpasswort === data.users[i].passwort){
                data.loggedUser = data.users[i].id;
                res.status(200).type('text').send("User " + username + " mit ID " + data.users[i].id + " eingeloggt !");
                c = 1;
            }else{
                res.status(400).type('text').send("Falsches Passwort !");
                c = 1;
            }

        }
    }

    if(c === 0){
        res.status(400).type('text').send("User nicht vorhanden !");
    }

});
*/

//get user by id
router.get('/', function(req,res){
    if(req.query.sortbyuserid == undefined && req.query.sortbyname == undefined ){
        res.status(200).send(data.users);
    }

    if(req.query.sortbyuserid != undefined && req.query.sortbyname == undefined ){
        var id = parseInt(req.query.sortbyuserid);
        var user = data.users.filter(function (u) {
            return u.id == id;
        })
        res.status(200).send(user);
    }

    if(req.query.sortbyuserid == undefined && req.query.sortbyname != undefined ){
        var name = req.query.sortbyname;
        var user = data.users.filter(function (u) {
            return u.name == name;
        })
        res.status(200).send(user);
    }
});



// --- PUT REQUESTS --- ///

//abo user wird noch mit faye angepasst
router.put("/UA/:id/:aboid" , bodyParser.json(), function(req,res){
  var t = 0;

  if((validateid(parseInt(req.params.id)))==0){
    res.status(404).type('text').send('Userid nicht vorhanden !');
    t = 1;
  }
  if((validateid(parseInt(req.params.aboid)))==0 && t==0){
    res.status(404).type('text').send('Zu abonnierende Id nicht vorhanden !');
    t = 1;
  }

    if(t==0){
        for(var i= 0; i < data.count ; i++){
            if(parseInt(req.params.id) == data.users[i].id ){
                for(var j = 0; j < data.users[i].abonnieren.user.length ; j++){
                    if(data.users[i].abonnieren.user[j] == req.params.aboid){
                        res.status(400).type('text').send('User bereits abonniert !');
                        t = 1;
                    }
                }
            }
        }
    }

  console.log("prüfung erfolgreich !");
  if(t==0){
    for(var i= 0; i < data.count ; i++){
      if(parseInt(req.params.id) == data.users[i].id ){
            data.users[i].abonnieren.user.push(parseInt(req.params.aboid));
            res.status(200).type('text').send("User mit ID " + req.params.aboid + " abonniert !");
            i=data.count;
          }
    }
  }

});

//abo playlist wird noch mit faye angepasst
  router.put("/PA/:id/:aboid" , bodyParser.json(), function(req,res){
    var t = 0;

    if((validateid(parseInt(req.params.id)))==0){
      res.status(404).type('text').send('Userid nicht vorhanden !');
      t = 1;
    }
    if((validatepid(parseInt(req.params.aboid)))==0 && t==0){
      res.status(404).type('text').send('Zu abonnierende Playlist nicht vorhanden !');
      t = 1;
    }

      if(t==0){
          for(var i= 0; i < data.count ; i++){
              if(parseInt(req.params.id) == data.users[i].id ){
                  for(var j = 0; j < data.users[i].abonnieren.playlist.length ; j++){
                      if(data.users[i].abonnieren.playlist[j] == req.params.aboid){
                          res.status(400).type('text').send('Playlist bereits abonniert !');
                          t = 1;
                      }
                  }
              }
          }
      }

    console.log("prüfung erfolgreich !");
    if(t==0){
      for(var i= 0; i < data.count ; i++){
        if(parseInt(req.params.id) == data.users[i].id ){
              data.users[i].abonnieren.playlist.push(parseInt(req.params.aboid));
              res.status(200).type('text').send("Playlist mit ID " + req.params.aboid + " abonniert !");
              i=data.count;
            }
      }
    }


});



// --- DELETE REQUESTS --- ///

//Nutzer oder Playlist deabonnieren (WIrd noch mit faye angepasst)
/*
router.delete("/deabo/:user_id/:user_id_deabo",function (req,res){

    for(var i = 0; i < data.count; i++){
        if(data.users.id[i] === req.params.user_id){

            if(req.query.type !== undefined) {

                if(req.query.type === "user"){
                    for(var j = 0; j < data.users[i].abonnieren.user.length; j++){
                           if(data.users[i].abonnieren.user[j] === req.params.user_id_deabo){
                               data.users[i].abonnieren.user[j] = {};
                               res.status(200).type('text').send("Playlist mit ID " + req.params.aboid + " deabonniert !");
                           }
                    }
                }
                else if(req.query.type === "playlist"){
                    for(var k = 0; k < data.users[i].abonnieren.playlist.length; k++){
                        if(data.users[i].abonnieren.playlist[k] === req.params.user_id_deabo){
                            data.users[i].abonnieren.playlist[k] = {};
                            res.status(200).type('text').send("Playlist mit ID " + req.params.aboid + " deabonniert !");
                        }
                    }
                }

                else{
                    res.status(400).type("text").send("Eingabe nicht gültig !");
                }
            }
        }
    }

});*/


// --- VALIDIERUNG --- ///

//validate username
function validate(name) {
    for(var i = 0; i < data.count; i++){
        if(data.users[i].name == name){
            return 1;
        }
    }
    return 0;
}

function validatepid(id) {
    for(var i = 0; i < data.playlist.length; i++){
        if(data.playlist[i].playlist_id == id){
            return 1;
        }
    }
    return 0;
}

//validate userid
function validateid(id) {
    for(var i = 0; i < data.count; i++){
        if(data.users[i].id == id){
            return 1;
        }
    }
    return 0;
}

function getUserIdbyName(name) {
    for(var i = 0; i < data.count; i++){
        if(data.users[i].name == name){
            return data.users[i].id;
        }
    }
    return 0;
}


module.exports = router;
