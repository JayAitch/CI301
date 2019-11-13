

//TODO: this is  very big issue
//       we  need to watch for value changes on documents inside our teams collection
//       this requires modification of query-list-element as there are 2 seperate things here
//       queries need a way of manualy applying listeners to doucments as well as notifications not caring about the chanages
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


	// todo move this functionality into a seperate element so we can just put edit buttons everywhere
	_editTeam(ev) {
		let docLocation = this.getAttribute("doc-location");
		const changeDocForm = document.getElementById("change-document-form");
		changeDocForm.setAttribute("type", "team");
		changeDocForm.setAttribute("document-target", docLocation);
		changeDocForm.hidden = false;
	}
}




// list of all notifications
class TeamsList extends ActiveQueryListElement{
  constructor() { 
    super();
	//this._onNewTeamBtnClick = this._onNewTeamBtnClick.bind(this);
	this._showInviteCode = this._showInviteCode.bind(this);
	this.collectionRef = "teams/"
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
												<button id="new-team-btn">new team</button>
												<div hidden id="qr-code"></div>
												</div>
											`;
				

	
	
	// dont do it like this maybe? potential dom lag
	this.innerHTML = teamListTemplate;
	// find the UL containing the nofications
	this.teamsList = document.getElementById("team-list");
	this.newTeamBtn = document.getElementById("new-team-btn").addEventListener("click", this._onNewTeamBtnClick);
	

	this.inviteCodeBtn = document.getElementById("invite-code-btn").addEventListener("click", this._showInviteCode);
	this.QRcode = document.getElementById("qr-code");  
	
	
	let QRCodeData = {"text": this.currentUserID};
	new QRCode(this.QRcode, QRCodeData);



	  // not like this
	  let newChanger = this.appendChild(document.createElement("change-document-form"));
	  newChanger.setAttribute("obj-type", "team");
	  newChanger.setAttribute("document-target", this.collectionRef + "7hiyhpIckzGElOsG3ggF");
  }
  
  
  getQueryReference(){
	// find all notifications refering to the current user
	//return firebase.firestore().collection("accounts/" + this.currentUserID + "/users-teams");
	  const queryRef = firebase.firestore().collection("teams").where('members', 'array-contains', getUserId());
	  console.log(queryRef)
	  return queryRef;
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

class TeamList extends ActiveQueryListElement{

}





























window.customElements.define('team-list', TeamsList);
window.customElements.define('team-card', TeamCard);
