


class TeamCard extends HTMLElement{
	constructor() {  
		super();
		
		// bind 'this' to the click handler for this component
		this._clickHandler = this._clickHandler.bind(this);
		this._sendInvite = this._sendInvite.bind(this);
	}
	
	
	// setup elmenet when connected
	connectedCallback() {
				const userAccountTemplate = `<div class="notification-wrapper">
													<div class="name-header">
														<h3 class="name"></h3>
														
													</div>
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
		console.log(this);
	}
	
  	_clickHandler(ev){
	}
	
	
	_sendInvite(ev){
		ev.preventDefault();
		let code = this.inviteForm.code.value
		if(code.length != 28) return;
		let teamDocLocation = this.getAttribute("doc-location");
		
			// test invite
		firebase.firestore().collection("notifications").add({
			"for": code,
			"type": "team-invite",
			"is-read":false,
			"team": firebase.firestore().doc(teamDocLocation)
			
		})	
		.then((docRef)=> {

		})
		.catch(function(error) {
			console.error("Error adding document: ", error);
		});

		
	}
}




// list of all notifications
class TeamList extends QueryListElement{
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
												<!--button id="new-team-btn">new team</button-->												
												<div id="team-wrapper">
													<ul id="team-list">
													</ul>
												<button id="invite-code-btn">invite code</button>
												<div hidden id="qr-code"></div>
												</div>
											`;
				

	
	
	// dont do it like this maybe? potential dom lag
	this.innerHTML = teamListTemplate;
	// find the UL containing the nofications
	this.teamsList = document.getElementById("team-list");
//	this.newTeamBtn = document.getElementById("new-team-btn").addEventListener("click", this._onNewTeamBtnClick);
	

	this.inviteCodeBtn = document.getElementById("invite-code-btn").addEventListener("click", this._showInviteCode);
	this.QRcode = document.getElementById("qr-code");  
	
	
	let QRCodeData = {"text": this.currentUserID};
	new QRCode(this.QRcode, QRCodeData);
	
	
	
	// not like this
	let newMaker = this.appendChild(document.createElement("document-form"));
	newMaker.setAttribute("obj-type", "team");
	
  }
  
  
  getQueryReferenece(){
	// find all notifications refering to the current user
	return firebase.firestore().collection("accounts/" + this.currentUserID + "/users-teams");	
  }
  
  
  _onDocumentAdded(change){
	this.createNewTeamCard(change.doc);
  }
    
  _onDocumentChanged(change){
	this.changeDocAttributes(change);
  }
     
  _onDocumentRemoved(change){
	this.removeTeamCard(change);
  } 
  
  _showInviteCode(){
	  let isHidden = this.QRcode.hidden
	  this.QRcode.hidden = !isHidden
  }
  /**
  _onNewTeamBtnClick(){
//	console.log("newteams");
	  
	// create test team
	firebase.firestore().collection("teams").add({
		name: "RuntimeTeam",
		owner: this.currentUserID
	})	
	.then((docRef)=> {
		// also create a reference to the team under the player
		firebase.firestore().collection("accounts/" + this.currentUserID + "/users-teams").add({
		nickname: "Personal team runtime",
		"team-reference": docRef
		})
	})
	.catch(function(error) {
		console.error("Error adding document: ", error);
	});
	  
	  
  }**/
  
  
  // create new list elements and assign attributes to let cards modify there displayed data
  createNewTeamCard(doc){

	let docData = doc.data();
	let newTeamCard = document.createElement("team-card");	

  

	// get the data from the document and apply to card attributes
	this.appendChild(newTeamCard);	
	this.setAttributesFromDoc(newTeamCard, docData);
	
	// setup a document reference on the card for debuging
	//console.log(doc);
	let queryString = docData["team-reference"].path;
	newTeamCard.setAttribute("doc-location", queryString);


	// add new element to local active cards
	this.activeCards.push(newTeamCard);
	
  }
  
  // update an existing dom element with modified data
  changeDocAttributes(change){
	let docIndex = change.newIndex
	let doc = change.doc;
	
	// find the card card from the query index
	let teamCard = this.activeCards[docIndex];

	// update the data to allow display
	this.setAttributesFromDoc(teamCard, doc.data());

  }
  
  // this scenario should only rarely happen, remove deleted document from the DOM
  removeTeamCard(change){
	
	// find it via the query index
	let docIndex = change.oldIndex
	let teamCard = this.activeCards[docIndex];

	// remove from the parent node
	teamCard.parentNode.removeChild(teamCard);
  }
  
  
  
    // update an existing dom element with modified data
  changeDocAttributes(change){
	let docIndex = change.newIndex
	let doc = change.doc;
	
	// find the notification card from the query index
	let teamCard = this.activeCards[docIndex];

	// update the data to allow display
	this.setAttributesFromDoc(teamCard, doc.data());

  }
  

  // set/update any relevant attributes on the card
  setAttributesFromDoc(elem, docData){

	let name = docData["name"];

	elem.setAttribute("name", name);

	
  }
  

  
}






























// add elements to the custom element registry
window.customElements.define('team-list', TeamList);
window.customElements.define('team-card', TeamCard);
