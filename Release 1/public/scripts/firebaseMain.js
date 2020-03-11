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

let currentViewedTeams;
let taskPage;
// Initialize Firebase

document.addEventListener("DOMContentLoaded", event =>{


	const app = firebase.initializeApp(firebaseConfig);
;
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			if(!isCookieAccepted()) document.body.appendChild(document.createElement("cookie-policy"));

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
	const authenticator = new firebase.auth.GoogleAuthProvider();
	authenticator.setCustomParameters({prompt: 'select_account'});
	firebase.auth().signInWithRedirect(authenticator);
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




function safeGetProperty(docData, propertyName){
	let propertyValue = "";

	if(docData.hasOwnProperty(propertyName)){
		propertyValue = docData[propertyName];
	}
	return propertyValue;
}


// POC cookie based task loading, allows refreshes, this will break when a  user hasnt clicked on a team
/* section */
function setCurrentViewedTeam(pViewedTeams){
	currentViewedTeams = pViewedTeams;
	if(currentViewedTeams.length > 0) {
		taskPage.teamTarget = currentViewedTeams;
		createCurrentViewedTeamCookie(pViewedTeams);
	}
}

function setLastViewedTeam(){
	let cookieName = "last-viewed-team";
	let lastViewedTeam = getCookie(cookieName);
	setCurrentViewedTeam(lastViewedTeam);
}

function createCurrentViewedTeamCookie(pViewedTeams){
	let date = new Date()
	date.setTime(date.getTime() + (1000 * 24 * 60 * 60 * 1000))
	document.cookie = "last-viewed-team=" + pViewedTeams + ";" + "expires=" + date.toUTCString();
}

function setCookieAccepted(){
	let date = new Date()
	date.setTime(date.getTime() + (1000 * 24 * 60 * 60 * 1000))
	document.cookie = "cookie-policy-accepted=true;" + "expires=" + date.toUTCString();
}

function isCookieAccepted(){
	let cookieName = "cookie-policy-accepted"
	let state = getCookie(cookieName);
	if(state === "true") return true;
	return false;
}


function getCookie(cookieName){
	// build name found in cookie string
	let name = cookieName + "="
	let cookies = decodeURIComponent(document.cookie);
	let cookieArray = cookies.split(";")

	for(let cookieIterator = 0; cookieIterator < cookieArray.length; cookieIterator++){
		let cookie = cookieArray[cookieIterator];
		let cookieSearch = cookie.indexOf(name);
		if(cookieSearch !== -1){
			let value = cookie.substr(name.length, cookie.length);
			console.log(value);
			value = value.replace("=", "");
			return value;
		}
	}
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
	let baseURI = "/images/789_Lorc_RPG_icons/";
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


function CompleteTask(taskDocument, notificationTarget){

	let taskData =  taskDocument.data();
	let taskRewards = safeGetProperty(taskData, 'experience-rewards');

	let userAccountRef = getCurrentUserDocRef();

	userAccountRef.get().then((doc) => {

			let userAccountData = doc.data();

			// this will error for new users
			let userAccountSkillLevels = userAccountData['skill-levels'] || {};

			for (let key in taskRewards) {

				let accountExperience = userAccountSkillLevels[key] || 0
				let userLevel = experiencePointsAsLevel(accountExperience);
				let requiredLevel = taskData["requirements"][key]

				if(!requiredLevel || requiredLevel <= userLevel){
					let rewardXPValue = taskRewards[key] || 0;
					let currentXPValue = userAccountSkillLevels[key] || 0;
					userAccountSkillLevels[key] = rewardXPValue + currentXPValue;
				}
				else{
					console.log(notificationTarget);
					$(notificationTarget).notify(`requires ${key} level ${requiredLevel}`);
					//show something to the users!
					return;
				}
			}

			taskDocument.ref.set({
				"status": taskStatus.Complete,
			}, {merge: true});


			userAccountRef.set({
				"skill-levels": userAccountSkillLevels,
			}, {merge: true});
//completed by

			let teamDocumentRef =  firebase.firestore().doc(taskData.team);
			teamDocumentRef.get().then((doc) => {
				let teamData = doc.data();
				let members = teamData.members;
				console.log(members);
				let notificationsCollectionRef =  firebase.firestore().collection("notifications");
				for(var membersPos = 0;members.length > membersPos; membersPos++){
					let memberRef = members[membersPos];
					console.log(memberRef);

					let rewardText = "";
					for(let skillName in taskRewards){
						rewardText +=  taskRewards[skillName] + " points in " + skillName + " ";
					}

					let newNotificationDocument = {
						"for": memberRef,
						"is-read": false,
						"message": `The task ${taskData.name} has been completed by a team member earning them ${rewardText}!`
					}
					notificationsCollectionRef.add(newNotificationDocument);
				}
			});


		}).catch(function (error) {
			console.error("Could not complete task: ", error);
		});


}
