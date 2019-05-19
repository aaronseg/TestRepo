var express =require('express'),
request = require('request'),
http = require('http');
var app = express();
var faye = require('faye');
const bodyParser = require("body-parser");
var eingeloggt = 0;

var fayeservice = new faye.NodeAdapter({
    mount:'/faye',
    timeout: 45
});
var f_server = http.createServer();

var client = new faye.Client('http://localhost:8080/faye');

var main = "http://ws.audioscrobbler.com/2.0/?method=";
var keyAndJson = "&api_key=e5064775c69b12741c6086227b7f6673&format=json";

var dHost = "https://wba2ss17project.herokuapp.com";
//var dHost ='http://localhost:3000';
//var dPort= 3000;
var dURL = dHost;

app.use(function (req, res, next) {
	console.log('Zeit: %d ' + ' Request-Pfad: ' + req.path, Date.now());
	next();
});


// --- GET REQUESTS --- ///

//login
/*
app.get("/login/:name/:psw", function(req,res){
    var url;
    url = dURL + "/user/login/" + req.params.name + "/" + req.params.psw;

    request(url,function(err,response,body){
        res.json(body);
    });
});

*/

//all users
app.get("/user/", function(req,res){

        var url;
        if (req.query.sortbyuserid == undefined && req.query.sortbyname == undefined) {
            url = dURL + "/user";
        }

        if (req.query.sortbyuserid != undefined && req.query.sortbyname == undefined) {
            url = dURL + "/user/?sortbyuserid=" + req.query.sortbyuserid;
        }

        if (req.query.sortbyuserid == undefined && req.query.sortbyname != undefined) {
            url = dURL + "/user/?sortbyname=" + req.query.sortbyname;
        }

        request(url, function (err, response, body) {
            body = JSON.parse(body);
            res.json(body);
        });

});


//all playlists
app.get("/playlist", function(req,res){
        var url;

        if (req.query.sortbyuserid == undefined && req.query.sortbyname == undefined && req.query.sortbyplaylistid == undefined) {
            url = dURL + "/playlist";
        }

        if (req.query.sortbyuserid == undefined && req.query.sortbyname != undefined && req.query.sortbyplaylistid == undefined) {
            url = dURL + "/playlist/?sortbyname=" + req.query.sortbyname;
        }

        if (req.query.sortbyuserid != undefined && req.query.sortbyname == undefined && req.query.sortbyplaylistid == undefined) {
            url = dURL + "/playlist/?sortbyuserid=" + req.query.sortbyuserid;
        }

        if (req.query.sortbyuserid != undefined && req.query.sortbyname == undefined && req.query.sortbyplaylistid != undefined) {
            url = dURL + "/playlist/?sortbyuserid=" + req.query.sortbyuserid + "&&sortbyplaylistid=" + req.query.sortbyplaylistid;
        }

        request(url, function (err, response, body) {
            body = JSON.parse(body);
            res.json(body);
        });
});

//get top tracks or artists by tags
app.get('/:user_id/', function(req,res){
    var url = dURL + "/playlist/" + req.params.user_id;
    var tag;

    request(url,function(err,response,body){
        tag = body;


        var type2 ="&tag="
        if(req.query.type != undefined) {

            if(req.query.type == "artist"){
                var type = "tag.gettopartists";
            }
            else if(req.query.type == "track"){
                var type = "tag.gettoptracks"
            }
            else{
                res.status(400).type("text").send("Eingabe nicht gültig !");
            }

        }

        var url2 = main + type + type2 + tag + keyAndJson;
        console.log(url2);

        request(url2,function(err,response,body){
            body = JSON.parse(body);
            res.json(body);
        });

    });

});



//an artist by name direkte anfrage an API
app.get('/artist', function(req,res){

    var type = "artist.getInfo&artist=";
    var name = req.query.artist;
    var url = main + type + name + keyAndJson;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var apiJSON = JSON.parse(body);
            var obj = JSON.stringify(apiJSON);

            fs.writeFile("data/music.json", obj, function(err){
                if (err) throw err;
            });
        }

        fs.readFile("data/music.json","utf8",function(err, rep){
            if(rep){
                res.type('json').send(rep);
            }
            else {
                res.status(404).type('text').send('Der Interpret "' + req.params.nameInterpret +'" wurde nicht gefunden');

            }
        });
    });
});

// --- DELETE REQUESTS --- ///

//delete playlist
//delete song in playlist
app.delete("/playlist/", bodyParser.json(), function(req,res){

  var url = dURL +"/playlist/?del=";

  if(req.query.del === "playlist"){
      url = url + "playlist";
  }

  if(req.query.del === "song"){
      url = url + "song";
  }


    var data = {
        id: req.body.id,
        song_id: req.body.song_id
    };

  var options = {
        uri: url,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
      json: data
    };


	request.delete(options,function(err,response,body){
			res.json(body);
	});
});

//user oder playlist deabonnieren
// wird noch mit faye angepasst
/*app.delete("/:user_id/:deabo_id", function(req,res){

    var user_id = req.params.user_id;
    var deabo_id = req.params.deabo_id;

    var url = dURL +"/user/deabo/" + user_id + "/" + deabo_id;

    if(req.query.type != undefined) {

        if(req.query.type == "user"){
            url += "/?type=user"
        }
        else if(req.query.type == "playlist"){
            url += "/?type=playlist"
        }
        else{
            res.status(400).type("text").send("Eingabe nicht gültig !");
        }
    }

    console.log(url);

    request.delete(url,function(err,response,body){
        res.json(body);
        console.log(body);
    });

});*/


//user oder playlist abonnieren
//!Wird noch mit faye angepasst
// --- PUT REQUESTS --- ///
/*
app.put("/user/UA/:id/:aboid",function(req,res){
	var url = dURL + "/user/"+ "UA/"+parseInt(req.params.id)+"/"+parseInt(req.params.aboid);

	var options = {
        uri: url,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    };
	request(options,function(err,response,body){
			res.json(body);
	});
});

app.put("/user/PA/:id/:aboid",function(req,res){
	var url = dURL + "/user/"+"PA/"+parseInt(req.params.id)+"/"+parseInt(req.params.aboid);
    var options = {
        uri: url,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    };
	request(options,function(err,response,body){
			res.json(body);
	});
});*/


//Put song into playlist (with api)
app.put("/playlist/:id/:id_playlist",bodyParser.json(),function(req,res){
    var userid = req.params.id;
    var playlistid= req.params.id_playlist;
    var artistundname = req.body.liedname +" - "+ req.body.artist;
    var type = "track.getInfo";
    var type2 ="&artist="
    var type3 ="&track="
    var url2 = main + type + type2 + req.body.artist + type3+req.body.liedname + keyAndJson;
    request(url2, function (error, response, body) {
        var apiJSON = JSON.parse(body);

        if (apiJSON.message != "Track not found") {
            var data = {
                name: apiJSON.track.name,
                duration: apiJSON.track.duration,
                artist: apiJSON.track.artist,
                toptags: apiJSON.track.toptags,
            };
            var url = dURL + "/playlist/" + req.params.id + "/" + req.params.id_playlist;
            console.log(url);
            var options = {
                uri: url,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: data
            };


            request(options, function (err, response, body) {
                res.json(body);
                if(body.Fehler == undefined){
                  client.publish('/followPlaylist/' + playlistid , { text: 'Der User mit der ID ' + userid + ' hat einen neuen Song mit dem Namen: '+artistundname+' in die Playlist mit der ID '+ playlistid+' hinzugefügt! '})
                  .then(function(){
                    console.log('Message received by server');
                  }, function(error){
                    console.log('Error on publishing ' + error.message);
                  });
                }
            });
        }else {res.status(404).type('text').send('Titel nicht gefunden !');}
    });


});

var fayeserver = new faye.NodeAdapter({mount: '/faye', timeout: 45});
fayeserver.attach(f_server);

//serverseitiger Client
var client = new faye.Client('http://localhost:8080' + '/faye');
client.subscribe('/followPlaylist', function(message) {
    console.log(message.text);
});
client.subscribe('/followUser', function(message) {
    console.log(message.text);
});
f_server.listen(3001, function() {
    console.log("Listening on 3001");
});

var server = app.listen(8080, function(){
				console.log("Der Dienstnutzer läuft auf Port 8080");
});



function isLogged() {
    return data.loggedUser !== -1;
}




fayeservice.attach(server);
