const firebaseConfig = {
  apiKey: "AIzaSyC1LiymKHpZp6HRYwu-AYj9jw072Oqp0AU",
  authDomain: "testfire-60064.firebaseapp.com",
  databaseURL: "https://testfire-60064.firebaseio.com",
  projectId: "testfire-60064",
  storageBucket: "testfire-60064.appspot.com",
  messagingSenderId: "497572840612",
  appId: "1:497572840612:web:311417ad0a342883b7d231",
  measurementId: "G-D6D9ZR077L"
};

var currentViewedTeams;
var taskPage;
// Initialize Firebase

document.addEventListener("DOMContentLoaded", event =>{
	const app = firebase.initializeApp(firebaseConfig);
	//const database = firebase.firestore();
	
	
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.
			//console.log(user)//
			//loadHomePage();

			document.getElementById("notification-wrapper").appendChild(document.createElement("notification-page"));
			document.getElementById("account-wrapper").appendChild(document.createElement("user-page"));	
			document.getElementById("team-wrapper").appendChild(document.createElement("team-page"));
			taskPage = document.createElement("tasks-page");
			document.getElementById("tasks-wrapper").appendChild(taskPage);
			getLastViewedTeam();
		} else {
			const authenticator = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithRedirect(authenticator)
		}
	});
});

function logOut(){
	firebase.auth().signOut().then(function() {
			// Sign-out successful.
			
	}, function(error) {
			// An error happened.
	});
}

function getUserId(){
	 return firebase.auth().currentUser.uid;
}
function getCurrentUserDocRef(){
	const workaholicCurrentUserID = firebase.auth().currentUser.uid;
	// promote this variable u
	let currentUserDocRef = firebase.firestore().doc("accounts/" + workaholicCurrentUserID)
	
	return currentUserDocRef;
}







// POC cookie based task loading, allows refreshes, this will break when a  user hasnt clicked on a team
/* section */
function setCurrentViewedTeam(pViewedTeams){
	currentViewedTeams = pViewedTeams;
	taskPage.setAttribute("teams-watched", currentViewedTeams);
	createCurrentViewedTeamCookie(pViewedTeams);
}

function getLastViewedTeam(){
	let cookieName = "lastviewedTeam=";
	let cookies = document.cookie;
	let lastViewedTeam = cookies.substr(cookieName.length, cookies.length)
	setCurrentViewedTeam(lastViewedTeam);
}

function createCurrentViewedTeamCookie(pViewedTeams){
	let date = new Date()
	date.setTime(date.getTime() + (1000 * 24 * 60 * 60 * 1000))
	document.cookie = "lastviewedTeam=" + pViewedTeams + ";" + "expires=" + date.toUTCString();
}
/* section */