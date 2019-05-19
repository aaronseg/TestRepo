const express = require("express");
const router = express.Router();
var request = require('request');
var fs = require('fs');
const bodyParser = require("body-parser");
var playCount = 0;
const ressourceName = "playlists";
const TAG_LENGTH = 5;
var ausgabe;

// --- GET REQUESTS --- ///

//get playlist by id
router.get('/', function(req,res){

    if(req.query.sortbyuserid == undefined && req.query.sortbyname == undefined && req.query.sortbyplaylistid == undefined){
        res.status(200).send(data.playlist);
    }

    if(req.query.sortbyuserid == undefined && req.query.sortbyname != undefined && req.query.sortbyplaylistid == undefined){
        var jsondata={"playlist": []};
        for(var i=0; i<playCount; i++){
            if(data.playlist[i].name== req.query.sortbyname){
                jsondata["playlist"].push(data.playlist[i]);
            }
        }
        res.status(200).send(jsondata);
    }

    if(req.query.sortbyuserid != undefined && req.query.sortbyname == undefined && req.query.sortbyplaylistid == undefined){
        var jsondata={"playlist": []};
        for(var i=0; i<playCount; i++){
            if(data.playlist[i].user_id== req.query.sortbyuserid){
                jsondata["playlist"].push(data.playlist[i]);
            }
        }
        res.status(200).send(jsondata);
    }

    if(req.query.sortbyuserid != undefined && req.query.sortbyname == undefined && req.query.sortbyplaylistid != undefined ){
        for(var i=0; i<playCount; i++){
            if(data.playlist[i].user_id== req.query.sortbyuserid&& data.playlist[i].playlist_id== req.query.sortbyplaylistid){
                res.status(200).send(data.playlist[i]);
            }
        }
    }
});


//get artist or track by tags
router.get('/:id', function(req,res){
    var id = req.params.id;
    res.status(200).send(gettoptag(id));
});


// --- POST REQUESTS --- ///

//create playlist
router.post('/:user_id', bodyParser.json(), function(req,res){
     
    if(validate(req.params.user_id) == 0) {
        req.body.playlist_id = playCount++;
        req.body.user_id = parseInt(req.params.user_id);
        req.body.count_songs = 0;
        req.body.songs = [];
        data.users[req.params.user_id].playlistcount ++;
        console.log(req.body);
        data.playlist.push(req.body);
    
    
    if(gettoptag(req.params.user_id)!=undefined){
            console.log(gettoptag(req.params.user_id));
            var tag = gettoptag(req.params.user_id);
            var apiurl = "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag="+tag+"&api_key=e5064775c69b12741c6086227b7f6673&format=json";
            request(apiurl,function(err,response,body){
                body = JSON.parse(body);
                ausgabe = body.tracks.track[0].name;
                res.status(201).json({uri: req.protocol + "://" + req.headers.host + "/" + ressourceName + "/" + req.body.playlist_id,
                             Musiktitelvorschlag: ausgabe});
        
        });
    } else {
         
        res.status(201).json({uri: req.protocol + "://" + req.headers.host + "/" + ressourceName + "/" + req.body.playlist_id});
    }
       
    } else{
        res.status(404).type('text').send('User nicht vorhanden !');
    }
});


// --- DELETE REQUESTS --- ///

router.delete("/",function (req,res){

    var id = parseInt(req.body.id);
    var song = parseInt(req.body.song_id);

    var p=0;

        if(req.query.del === "song"){
              data.playlist[id].songs[song]= {};
              res.status(200).type('text').send('Song gelöscht');
              p = 1;
            }
        else if(req.query.del === "playlist") {
            data.playlist[id] = {};
            res.status(200).type('text').send('Playlist gelöscht');
            p = 1;
        }

    if(p==0){
      res.status(404).type('text').send('Song/Playlist nicht vorhanden !');
    }
});


// --- PUT REQUESTS --- ///

//put song into playlist
router.put('/:id/:id_playlist',bodyParser.json(), function(req,res){
var t = 0;
    for(var i= 0; i < playCount ; i++){
        if(parseInt(req.params.id) == data.playlist[i].user_id && parseInt(req.params.id_playlist) == data.playlist[i].playlist_id){
                var anz = data.playlist[req.params.id_playlist].count_songs;

                req.body.song_id = anz;
                data.playlist[i].songs.push(req.body);
                data.playlist[i].count_songs++;

                res.status(200).send(data.playlist[i].songs);
                i = playCount - 1;
                t = 1;
            }
      }

      if (t == 0) {
        res.status(400).type('text').send('Eingabe überprüfen !');
      }

});


// --- VALIDIERUNG --- ///

//validate username
function validate(id) {
    for(var i = 0; i < data.count; i++){
        if(data.users[i].id == id){
            return 0;
        }
    }
    return 1;
}

//Top Tag
function gettoptag(id) {
    var allTags = [];
    var d;
    for(var i = 0; i < playCount; i++){
        if (data.playlist[i].user_id == id){
            for(var j = 0; j < data.playlist[i].count_songs; j++){
                for(var k = 0; k < TAG_LENGTH ; k++){
                    d = 0;
                    for(var e = 0; e < allTags.length; e++){
                        var temp = (data.playlist[i].songs[j].toptags.tag[k].name).toLowerCase();
                        var temp2 = (allTags[e].name).toLowerCase();
                        if(temp ==  temp2){
                            allTags[e].count++;
                            d = 1;
                            console.log("tag gefunden")
                        }
                    }
                    if(d == 0){
                        var dataTag = {
                            name: data.playlist[i].songs[j].toptags.tag[k].name,
                            count: 1
                        };
                        allTags.push(dataTag);
                    }

                }
            }

        }
    }

    console.log(allTags);

    var nameTag;
    var countTag =0;
    for( var m=0;m<allTags.length;m++){
        if(countTag < allTags[m].count){
            countTag = allTags[m].count;
            nameTag = allTags[m].name;
        }
    }
    console.log("In gettop: " + nameTag);
    return nameTag;
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


module.exports = router;
