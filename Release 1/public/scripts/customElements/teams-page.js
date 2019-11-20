


// list of all teams
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
													<!--move qr code out of here when creating the show hide top level modls-->
													<div hidden id="qr-code"></div>
												</div>
												<team-list></team-list>
											`;
				

	
	
	// dont do it like this maybe? potential dom lag
	this.innerHTML = teamListTemplate;
	// find the UL containing the nofications
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

  // promote this to a seperate elemnt
  _onNewTeamBtnClick(){
  	const newDocumentForm = document.getElementById("new-document-form");
  	newDocumentForm.setAttribute("collection-target", "teams/");
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
		this._editTeam = this._editTeam.bind(this);
		this._viewTeam = this._viewTeam.bind(this);
		this._showInviteForm = this._showInviteForm.bind(this);
	}


	// setup elmenet when connected
	connectedCallback() {
		const userAccountTemplate = `<div class="team-wrapper">
													<div class="name-header">
														<h3 class="name"></h3>
														
													</div>
													<div class="control-group">
														<button class="team-view-button control">view</button>
														<button class="team-edit-button control">edit</button>
														<button class="team-invite-button control">invite</button>								
													</div>
													<!--this elemnent should have its on custom element-->
												</div>
											`;

		// dont do it like this maybe? potential dom lag
		this.innerHTML = userAccountTemplate;

		this.name = this.querySelector(".name");
		// find the top wrapper and add the click listener to it

		this.querySelector(".team-edit-button").addEventListener("click", this._editTeam);
		this.querySelector(".team-view-button").addEventListener("click", this._viewTeam);
		this.querySelector(".team-invite-button").addEventListener("click", this._showInviteForm);
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

	_viewTeam(ev){
			let teamDocLocation = this.getAttribute("doc-location");
		setCurrentViewedTeam(teamDocLocation);
		document.location = '#tasks-page';

	}




	// todo move this functionality into a seperate element so we can just put edit buttons everywhere
	_editTeam(ev) {
		let docLocation = this.getAttribute("doc-location");
		const changeDocForm = document.getElementById("change-document-form");
		changeDocForm.setAttribute("type", "team");
		changeDocForm.setAttribute("document-target", docLocation);
		changeDocForm.hidden = false;
	}

	_showInviteForm(ev){
		const inviteForm = document.getElementById("invite-form");
		let teamName = this.getAttribute("name");
		let teamLocation = this.getAttribute("doc-location");
		inviteForm.setAttribute('team-name', teamName);
		inviteForm.setAttribute('team-invited',teamLocation);
		inviteForm.hidden =! inviteForm.hidden;
	}
}





window.customElements.define('team-list', TeamsList);
window.customElements.define('team-page', TeamsPage);
window.customElements.define('team-card', TeamCard);
