


// list of all teams
class TeamsPage extends HTMLElement{
  constructor() { 
    super();
	this._showInviteCode = this._showInviteCode.bind(this);

  }
  
  // set up the element on connection
  connectedCallback() {
  	const template = document.getElementById('team-page-template');
  	let content = document.importNode(template.content, true);
  	this.appendChild(content);

	this.newTeamBtn = document.getElementById("new-team-btn").addEventListener("click", this._onNewTeamBtnClick);

	//  this should probably move from here
	this.inviteCodeBtn = document.getElementById("invite-code-btn").addEventListener("click", this._showInviteCode);

	this.QRcode = document.getElementById("qr-code");
	let QRCodeData = {"text": getUserId()};
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
		return queryRef;
	}

	createCardDOMElement(docData){
		let newTeamCard = document.createElement("team-card");
		return newTeamCard;
	}

	shouldShowEditButton(docData){
		let allowEditTeam = safeGetProperty(docData, "allow-edit-team");

		let teamOwnerID = docData.owner;
		let currentUserID = getUserId();
		// is the team type verticle? is the current user not the owner of the team
		if(allowEditTeam || teamOwnerID == currentUserID) {
				// dont show edit button
				return true;
		}
		return false
	}
}



class TeamCard extends EditableDocCard{
	constructor() {
		super();
		this._viewTeam = this._viewTeam.bind(this);
		this._showInviteForm = this._showInviteForm.bind(this);
	}

	connectedCallback() {

		const template = document.getElementById('team-card-template');
		let content = document.importNode(template.content, true);
		this.appendChild(content);


		this.controlGroup = this.querySelector(".control-group");
		this.headerEle = this.querySelector(".name");

		this.querySelector(".team-view-button").addEventListener("click", this._viewTeam);
		this.querySelector(".team-invite-button").addEventListener("click", this._showInviteForm);
		this.showHideEditButton();
	}


	displayDocumentValues(docData) {
		this.name = safeGetProperty(docData, "name");
	}

	set name(val){
		this.headerEle.textContent = val;
		this.setAttribute("name", val);
		this.teamName = val;
	}

	createEditButton(){
		let editButton = document.createElement("edit-button");
		editButton.documentLocation = this.documentLocation;
		editButton.documentType = "team";
		this.controlGroup.insertBefore(editButton, this.controlGroup.firstChild);
		return editButton;
	}

	_viewTeam(){
		setCurrentViewedTeam(this.documentLocation);
		document.location = '#tasks-page';
	}

	_showInviteForm(){
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
