var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var request = require('request');
const user = require("./user");
const playlist = require("./playlist");
global.data = require("./data");

const settings = {
	port: process.env.PORT || 3000
};

app.use(bodyParser.json());
app.use("/user", user);
app.use("/playlist", playlist);

//Errorhandler
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.end(err.status + ' ' + err.messages);
});

//Log mit Pfad und Zeitangabe für jeden Request-Pfad
app.use(function (req, res, next) {
	console.log('Zeit: %d ' + ' Request-Pfad: ' + req.path, Date.now());
	next();
});

//Bindung an den Port 3000 immer als letztes im Code.
//Dabei prüfen ob das funktioniert.
app.listen(settings.port, function(){
				console.log("Der Dienstgeber läuft auf Port 3000");
});
