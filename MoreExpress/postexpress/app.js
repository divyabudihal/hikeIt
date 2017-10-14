var express = require("express");
var app = express();
var bodyParser = require("body-parser");
// var googleMapsClient = require('@google/maps').createClient({
//   key: 'AIzaSyAnevWuDBeKlVUTM5H1p7Db9rOt9pS1CNY'
// });

var distance = require('google-distance-matrix');
distance.key('AIzaSyAnevWuDBeKlVUTM5H1p7Db9rOt9pS1CNY');
distance.units('metric');

var startLocation = ['Vancouver,BC'] ;
var hikeName = ['Pacific Spirit Regional Park', // 0
                'Cypress Falls Park',           // 1
                'Lighthouse Park',              // 2
                'The Grouse Grind',             // 3
                'Quarry Rock'] ;                // 4
var hikeAddress = ['5495 Chancellor Blvd, Vancouver, BC V6T 1E4',
                   '4902 Beacon Ln, West Vancouver, BC V7W 1K5', 
                   '6400 Nancy Greene Way, North Vancouver, BC V7R 4K9',
                   'Baden Powell Trail, North Vancouver, BC V7G 1V6' ] ;
                   
// var testOrigin = [{
//                     'lat': 23,
//                     'lng': 25
//                  }] ;
// var testDestination = [{
//                         'lat': 23,
//                         'lng': 25
//                       }] ;

var carDistance = [];
var carTime = [];

var transitDistance = [];
var transitTime = [];
                
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");

app.get("/",function(req,res){
    res.render("home");
});

app.post("/addstartLocation", function(req,res){
    var newstartLocation = req.body.newstartLocation;
    startLocation[0] = newstartLocation;
    console.log("POST func: ", startLocation[0])
    res.redirect("/location");
});


app.get("/location",function(req,res){
    console.log("GET func: ", startLocation[0]);
    // googleMapsClient.distanceMatrix({
    //     'origins': testOrigin,
    //     'destinations': testDestination,
        
    // })
    distance.mode('driving');
    
    
    distance.matrix(startLocation, hikeAddress, function (err, distances) {
    if (err) {
        return console.log(err);
    }
    if(!distances) {
        return console.log('No distances');
    }
    if (distances.status == 'OK') {
        for (var i=0; i < startLocation.length; i++) {
            for (var j = 0; j < hikeAddress.length; j++) {
                var origin = distances.origin_addresses[i];
                var destination = hikeName[j];
                if (distances.rows[0].elements[j].status == 'OK') {
                    carDistance[j] = distances.rows[i].elements[j].distance.text;
                    carTime[j] = distances.rows[i].elements[j].duration.text;
                    console.log('Distance from ' + origin + ' to ' + destination + ' is ' + carDistance[j] + ' and it will take ' + carTime[j]);
                } else {
                    console.log(destination + ' is not reachable by land from ' + origin);
                }
            }
        }
    }
    });
    
    distance.mode('transit');
   
    
    distance.matrix(startLocation, hikeAddress, function (err, distances) {
    if (err) {
        return console.log(err);
    }
    if(!distances) {
        return console.log('No distances');
    }
    if (distances.status == 'OK') {
        for (var i=0; i < startLocation.length; i++) {
            for (var j = 0; j < hikeAddress.length; j++) {
                var origin = distances.origin_addresses[i];
                var destination = hikeName[j];
                if (distances.rows[0].elements[j].status == 'OK') {
                    transitDistance[j] = distances.rows[i].elements[j].distance.text;
                    transitTime[j] = distances.rows[i].elements[j].duration.text;
                    console.log('Distance from ' + origin + ' to ' + destination + ' is ' + transitDistance[j] + ' and it will take ' + transitTime[j] + ' by transit. ');
                } else {
                    console.log(destination + ' is not reachable by land from ' + origin);
                }
            }
        }
    }
    });
    
    // res.render("location",{ carDistance: carDistance});
    // res.render("location",{ carTime: carTime});
    // res.render("location",{ transitDistance: transitDistance});
    // res.render("location",{ transitTime: transitTime});
    
    // res.render("location", { carDistance: carDistance },
    //                         { carTime: carTime},
    //                         { transitDistance: transitDistance},
    //                         { transitDistance: transitDistance} );
    res.render("location", {trip: {carDistance: carDistance,
                                    carTime: carTime,
                                    transitDistance: transitDistance,
                                    transitTime: transitTime}});

    
    
});

app.listen(process.env.PORT, process.env.IP,function(){
    console.log("Server started!!");
});