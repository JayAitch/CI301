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
			setLastViewedTeam();
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
	const workaholicCurrentUserID = getUserId();
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

function setLastViewedTeam(){
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

// convert firebase date into a date format understood by html 5
function convertToHTMLDate(fireBaseDate){
	let date = new Date(fireBaseDate);
	let day = ("0" + date.getDate()).slice(-2);
	let month = ("0" + (date.getMonth() + 1)).slice(-2);

	let HTMLDateFormat = date.getFullYear()+"-"+(month)+"-"+(day);
	return HTMLDateFormat;
}
function calculateReward(requirements, importance, urgency, impact){
	let reward = {};
	for(let requirement in requirements){
		reward[requirement] = calculateExperiencePoints(requirements[requirement], importance, urgency, impact);
	}
	return reward;
}
function calculateExperiencePoints(levelRequirement, pImportance, pUrgency, pImpact){
	let importance = pImportance + 0.4 || 0;
	let urgency = pUrgency + 0.4 || 0;
	let impact = pImpact  + 0.4 || 0;
	let reward = (levelRequirement + 100) * importance * 5;

	reward = reward * Math.pow(urgency, 2);

	reward = reward * impact;
	reward = reward + 15;
	reward = Math.floor(reward);
	return reward;
}

function experiencePointsAsLevel(exp){
	let level = Math.pow(exp,0.5);
	level = level / 10;
	return Math.floor(level);
}


function levelAsExperiencePoints(level){
	let exp = level * 10;
	exp = Math.pow(exp, 2);
	return exp;
}


setTimeout(function () {
	createFanFareNotification("strength levels to 4")
},5)

function createFanFareNotification(text){


	$.notify.addStyle('level-up', {
		html:
			"<div class='notify-fanfare'>" +

			"<div class='notification-title' data-notify-html='title'/>" +
			"<div class='notification-body' data-notify-text='text'/>" +
			"<div class='buttons'>" +


			"</div>" +
			"</div>"
	});


	$('#notification-area').notify({
		title: 'Congratulations!',
		text: text,
		button: 'Ok',
	}, {
		style: 'level-up',
		autoHide: false,
		clickToHide: true,
		arrowShow: false,
		position:'bottom center'
	});
}




function LookupIconURI(skillType, notificationType){

	// change to a map?
	let baseURI = "/images/789_Lorc_RPG_icons/"
	console.log(skillType);
	let URI = "";
	switch(skillType) {
		case "Strength":
			URI = baseURI + "Icon.3_31.png"
			break;
		case "Agility":
			URI = baseURI + "Icons8_87.png"
			break;
		case "Intelligence":
			URI = baseURI + "Icon.2_94.png"
			break;
		case "Endurance":
			URI = baseURI + "Icon.1_09.png"
			break;
		default:
			URI = baseURI + "Icon.2_92.png"
	}

	return URI;
}
