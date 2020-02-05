


// list of all teams
class TeamsPage extends HTMLElement{
  constructor() { 
    super();
	this._showInviteCode = this._showInviteCode.bind(this);

  }
  
  // set up the element on connection
  connectedCallback() {
	  const teamListTemplate = `				<h2 class="name-header">
													Teams
												</h2>												
												<div id="team-wrapper">
													<a id="invite-code-btn" class="ui-btn" href="#">invite code</a>
													<a id="new-team-btn" class="ui-btn" href="#">new team</a>
													<!--move qr code out of here when creating the show hide top level modls-->
													<div hidden id="qr-code"></div>
												</div>
												<team-list></team-list>
											`;



	
	// dont do it like this maybe? potential dom lag
	this.innerHTML = teamListTemplate;
	this.newTeamBtn = document.getElementById("new-team-btn").addEventListener("click", this._onNewTeamBtnClick);

	//  this should probably move from here
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
		let newTeamCard = document.createElement("team-card");
		this.addCardCreationAttributes(newTeamCard, docData);
		return newTeamCard;
	}


	addCardCreationAttributes(newTeamCard, docData){
		let shouldShowEditButton = this.shouldShowEditButton(docData)
		newTeamCard.setAttribute("show-edit", shouldShowEditButton);
	}

	shouldShowEditButton(docData){
		let teamType = docData["team-type"];
		let teamOwnerID = docData.owner;
		let currentUserID = getUserId();
		// is the team type verticle? is the current user not the owner of the team
		if(teamType == 1 && teamOwnerID != currentUserID) {
				// dont show edit button
				return false;
		}
		return true
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
		//this._editTeam = this._editTeam.bind(this);
		this._viewTeam = this._viewTeam.bind(this);
		this._showInviteForm = this._showInviteForm.bind(this);
	}


	// setup elmenet when connected
	connectedCallback() {
		const userAccountTemplate = `			<div class="card-wrapper">
													<div class="name-header">
														<h3 class="name"></h3>
														
													</div>
													<div class="control-group">
														<a class="team-view-button control ui-btn" href="#">view</a>
														<a class="team-invite-button control ui-btn" href="#">invite</a>								
													</div>
												</div>
											`;

		// dont do it like this maybe? potential dom lag
		this.innerHTML = userAccountTemplate;
		this.controlGroup = this.querySelector(".control-group");
		this.headerEle = this.querySelector(".name");
		// find the top wrapper and add the click listener to it
		this.createEditButton();
		this.querySelector(".team-view-button").addEventListener("click", this._viewTeam);
		this.querySelector(".team-invite-button").addEventListener("click", this._showInviteForm);
	}



	createEditButton(){
		if(this.getAttribute("show-edit") == "true"){
			
			let editButton = document.createElement("edit-button");
			editButton.setAttribute("doc-location", this.getAttribute("doc-location"));
			editButton.setAttribute("obj-type","team");
			this.controlGroup.insertBefore(editButton, this.controlGroup.firstChild);
		}
	}



	// observe the attribute changes so we can modify dispalyed data
	static get observedAttributes() {
		return ['name'];
	}

	// set the display for these values onto the txt of the displays
	attributeChangedCallback(name, oldValue, newValue) {
		//let isRead = this.getAttribute("is-read");
		//this.isRead.innerHTML = isRead;
		this.headerEle.innerHTML = this.getAttribute("name");
		//	if(isRead) this.classList.add("read-notification")
		// do something when an attribute has changed
	}

	_viewTeam(){
			let teamDocLocation = this.getAttribute("doc-location");
		setCurrentViewedTeam(teamDocLocation);
		document.location = '#tasks-page';

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
