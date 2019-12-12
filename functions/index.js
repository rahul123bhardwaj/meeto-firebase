const functions = require("firebase-functions");
var admin = require("firebase-admin");

var serviceAccount = require("/Users/rahul/Downloads/meetofinal-firebase-adminsdk-kjfqy-d85889b11d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://meetofinal.firebaseio.com"
});

const payload = {
              notification: {
                  title: 'You have been invited to a trip.',
                  body: 'Tap here to check it out!'
              }
         };


exports.helloWorld = functions.https.onRequest((req, res) => {
        const tripsRef = admin.database().ref('triprequests');
	var trips = []
	var timestamps = []
	var users = []
        tripsRef.orderByChild("requestedTime").once('value',(snapshots)=>{
        snapshots.forEach(function(childSnapShot) {
		var trip = childSnapShot.val();
		if (trip.startLocation == "Ross") { 
		trips.push(childSnapShot.key);
		users.push(trip.userID);
		timestamps.push(trip.requestedTime);
		}
        })

	var requestedTime = timestamps.reduce((a,b) => a + b, 0) / timestamps.length;

	admin.database().ref('grouptrips').push({
		"confirmedTime" : requestedTime, "tripRequests" : trips
	});
        
	res.send(snapshots);
      })
	
	admin.database().ref('Users').once('value', (snapshots) => {
		snapshots.forEach(function(childSnapShot) {
			if(users.includes(childSnapShot.key)){
				console.log('Sending notification to '+childSnapShot.key);
				admin.messaging().sendToDevice(childSnapShot.val(), payload);
			}
		})
	});	

});

