


// list of all notifications
class TeamsPage extends HTMLElement{
  constructor() { 
    super();
	//this._onNewTeamBtnClick = this._onNewTeamBtnClick.bind(this);
	this._showInviteCode = this._showInviteCode.bind(this);

  }
  
  // set up the element on connection
  connectedCallback() {
	  //super();
	  console.log("connected-teams");
	  const teamListTemplate = `				<h2 class="name-header">
													Teams
												</h2>												
												<div id="team-wrapper">
													<button id="invite-code-btn">invite code</button>
													<button id="new-team-btn">new team</button>
													<div hidden id="qr-code"></div>
												</div>
												<team-list></team-list>
											`;
				

	
	
	// dont do it like this maybe? potential dom lag
	this.innerHTML = teamListTemplate;
	// find the UL containing the nofications
	this.teamsList = document.getElementById("team-list");
	this.newTeamBtn = document.getElementById("new-team-btn").addEventListener("click", this._onNewTeamBtnClick);
	

	this.inviteCodeBtn = document.getElementById("invite-code-btn").addEventListener("click", this._showInviteCode);
	this.QRcode = document.getElementById("qr-code");  
	

	let QRCodeData = {"text": getUserId()};
	console.log(this.QRcode);
	new QRCode(this.QRcode, QRCodeData);


  }
  


  _showInviteCode(){
	  let isHidden = this.QRcode.hidden
	  this.QRcode.hidden = !isHidden
  }

  _onNewTeamBtnClick(){
  	const newDocumentForm = document.getElementById("new-document-form");
  	newDocumentForm.setAttribute("obj-type", "team");
	  newDocumentForm.hidden = false;
  }




  
}

class TeamsList extends ActiveQueryListElement{
	constructor(){
		super();
		this.collectionRef = "teams/"
	}
	getQueryReference(){
		// get all the teams the user is a member of
		const queryRef = firebase.firestore().collection("teams").where('members', 'array-contains', getUserId());
		//const queryRef = firebase.firestore().collection("teams").where(firebase.firestore.FieldPath.documentId(), '==', "7uVn6SNaK4gBJYz0VKk79wG1doh2");
		return queryRef;
	}

	createCardDOMElement(docData){
		return document.createElement("team-card");
	}



	// set/update any relevant attributes on the card
	setAttributesFromDoc(elem, docData){
		//let docRef = docData["team-reference"];
		let name = docData.name
		elem.setAttribute("name", name)

	}

}

class TeamCard extends HTMLElement{
	constructor() {
		super();

		// bind 'this' to the click handler for this component
		this._clickHandler = this._clickHandler.bind(this);
		this._sendInvite = this._sendInvite.bind(this);
		this._editTeam = this._editTeam.bind(this);
	}


	// setup elmenet when connected
	connectedCallback() {
		const userAccountTemplate = `<div class="notification-wrapper">
													<div class="name-header">
														<h3 class="name"></h3>
														
													</div>
													<button class="team-edit-button">edit</button>
													<form class="invite-form">
														<input name="code" type="text"></input>
														<input value="invite" type="submit" required  maxlength="28" minlength="28"></input>														
													</form>
												</div>
											`;

		// dont do it like this maybe? potential dom lag
		this.innerHTML = userAccountTemplate;

		this.name = this.querySelector(".name");
		// find the top wrapper and add the click listener to it
		this.querySelector(".notification-wrapper").addEventListener("click", this._clickHandler);
		this.inviteForm = this.querySelector(".invite-form")
		this.inviteForm.addEventListener("submit", this._sendInvite);
		this.querySelector(".team-edit-button").addEventListener("click", this._editTeam);



	}

	// observe the attribute changes so we can modify dispalyed data
	static get observedAttributes() {
		return ['name'];
	}

	// set the display for these values onto the txt of the displays
	attributeChangedCallback(name, oldValue, newValue) {
		//let isRead = this.getAttribute("is-read");
		//this.isRead.innerHTML = isRead;
		this.name.innerHTML = this.getAttribute("name");
		//	if(isRead) this.classList.add("read-notification")
		// do something when an attribute has changed
	}

	_clickHandler(ev){
	}


	_sendInvite(ev){
		ev.preventDefault();
		let code = this.inviteForm.code.value
		if(code.length != 28)
		{
			console.log("error, incorrect code entered");
		//	return;
		}

		let teamDocLocation = this.getAttribute("doc-location");

		//https://firebase.google.com/docs/reference/node/firebase.firestore.FieldValue
		let addToPendingInvites = firebase.firestore().doc(teamDocLocation).set({
			"pending-invites": firebase.firestore.FieldValue.arrayUnion(code)
		}, { merge: true })




		// test invite
		firebase.firestore().collection("notifications").add({
			"for": code,
			"type": "team-invite",
			"is-read":false,
			"team": teamDocLocation,
			"message": "you have been invited to: " + this.getAttribute("name")

		}).catch(function(error) {
				console.error("Error adding document: ", error);
			});


	}


	// todo move this functionality into a seperate element so we can just put edit buttons everywhere
	_editTeam(ev) {
		let docLocation = this.getAttribute("doc-location");
		const changeDocForm = document.getElementById("change-document-form");
		changeDocForm.setAttribute("type", "team");
		changeDocForm.setAttribute("document-target", docLocation);
		changeDocForm.hidden = false;
	}
}





window.customElements.define('team-list', TeamsList);
window.customElements.define('team-page', TeamsPage);
window.customElements.define('team-card', TeamCard);
