


// list of all teams
class TeamsPage extends HTMLElement{
  constructor() { 
    super();


  }
  
  // set up the element on connection
  connectedCallback() {
  	const template = document.getElementById('team-page-template');
  	let content = document.importNode(template.content, true);
  	this.appendChild(content);

	let newTeamBtn = document.getElementById("new-team-btn")
	  newTeamBtn.addEventListener("click", this._onNewTeamBtnClick);
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

		let teamOwnerID = safeGetProperty(docData, "owner");
		let currentUserID = getUserId();

		// has team enabled team edit.
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
		this.descriptionEle = this.querySelector(".description");
		this.querySelector(".team-view-button").addEventListener("click", this._viewTeam);
		this.toggleEditButton();
	}


	displayDocumentValues(docData) {
		this.name = safeGetProperty(docData, "name");
		this.description = safeGetProperty(docData, "description");
	}

	set name(val){
		this.headerEle.textContent = val;
		this.setAttribute("name", val);
		this.teamName = val;
	}

	set description(val){
		this.descriptionEle.textContent = val;
		this.setAttribute("description", val);
		this.teamDescription = val;
	}

	set document(val){
		super.document = val;
		this.toggleInviteButton()
	}

	createEditButton(){
		let editButton = document.createElement("edit-button");
		editButton.documentLocation = this.documentLocation;
		editButton.documentType = "team";
		this.controlGroup.insertBefore(editButton, this.controlGroup.firstChild);
		return editButton;
	}

	toggleInviteButton(){
		let inviteBtn = this.inviteBtn;
		let docData = this.doc.data();
		let showInvite = safeGetProperty(docData,'allow-others-invite');
		let teamOwner = safeGetProperty(docData,'owner');
		if(showInvite || teamOwner === getUserId()){
			if(inviteBtn){

			}
			else{
				this.inviteBtn = this.createInviteButton();
			}
		}
		else{
			if(inviteBtn){
				inviteBtn.parentNode.removeChild(inviteBtn)
			}
			else{
			}
		}
	}

	createInviteButton(){
		let inviteBtn = document.createElement("a");
		inviteBtn.classList = "ui-btn control";
		inviteBtn.innerText = "invite";
		inviteBtn.addEventListener("click", this._showInviteForm);
		this.controlGroup.insertBefore(inviteBtn, this.controlGroup.firstChild);
		return inviteBtn;
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
