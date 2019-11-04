class NotificationCard extends HTMLElement{
	constructor() {  
		super();
		
		// bind 'this' to the click handler for this component
		this._clickHandler = this._clickHandler.bind(this);
	}
	
	
	// setup elmenet when connected
	connectedCallback() {
				const userAccountTemplate = `<div class="notification-wrapper">
													<div class="name-header">
														<h3 class="message"></h3>
													</div>
													<span class="is-read"></span><span class="message"></span>
												</div>
											`;
				
				// dont do it like this maybe? potential dom lag
				this.innerHTML = userAccountTemplate;
				this.isRead = this.querySelector(".is-read");
				this.message = this.querySelector(".message");
				// find the top wrapper and add the click listener to it
				this.querySelector(".notification-wrapper").addEventListener("click", this._clickHandler);
	}
	
	// observe the attribute changes so we can modify dispalyed data
	static get observedAttributes() {
		return ['is-read', 'message'];
	}

	// set the display for these values onto the txt of the displays
	attributeChangedCallback(name, oldValue, newValue) {
		this.isRead.innerHTML = this.getAttribute("is-read");
		this.message.innerHTML = this.getAttribute("message");
		// do something when an attribute has changed
		console.log(this);
	}
	
  	_clickHandler(ev){
		console.log("clicked");
		const docLocation = this.getAttribute("doc-location")
		let notification = firebase.firestore().doc(docLocation);
		notification.set({
				"is-read": true,
			}, { merge: true });
	}
}


class InviteNotificationCard extends HTMLElement{
	constructor() {  
		super();
		
		// bind 'this' to the click handlers for this component
		this._clickDecline = this._clickDecline.bind(this);
		this._clickAccept = this._clickAccept.bind(this);
	}
	
	
	// setup elmenet when connected
	connectedCallback() {
				const userAccountTemplate = `<div class="notification-wrapper">
													<div class="name-header">
														<h3 class="message"></h3>
													</div>
													<span class="is-read"></span><span class="message"></span>
													<button class="accept-btn">accept</button><button class="decline-btn">decline</button>
												</div>
											`;
				
				// dont do it like this maybe? potential dom lag
				this.innerHTML = userAccountTemplate;
				
				this.message = this.querySelector(".message");
				// find the top wrapper and add the click listener to it
				this.querySelector(".accept-btn").addEventListener("click", this._clickAccept);
				this.querySelector(".decline-btn").addEventListener("click", this._clickDecline);
	}
	
	// observe the attribute changes so we can modify dispalyed data
	static get observedAttributes() {
		return ['is-read', 'team-name'];
	}

	// set the display for these values onto the txt of the displays
	attributeChangedCallback(name, oldValue, newValue) {
		this.message.innerHTML = "you have been invited to:  " + this.getAttribute("team-name");

	}
	
	// the user has accepeted the invite so lets add the team to their collection
	_clickAccept(ev){
		// get the document location from the dom object
		let teamDocLocation = this.getAttribute("team-doc-location");
		
		// add a new team under the users account
		// we should be able to secure this by adding the users id to a collection under the team on inviting
		let currentUsersTeams = getCurrentUserDocRef().collection("users-teams").add({
		"team-reference": firebase.firestore().doc(teamDocLocation),
		name: "name"
		}).then(function(docRef) {
				alert("added to team");
		}).catch(function(error) {
				console.error("Error adding document: ", error);
		});
	}
	
	// delete the notification???
	_clickDecline(ev){
		
		alert('declined');
	}
}









// list of all notifications
class NotificationPage extends HTMLElement{
  constructor() { 
    super();
	
	// local variable of dom elements order is difined when documents are added as part of the query
	this.notifications = [];
  }
  
  // set up the element on connection
  connectedCallback() {
	  console.log("connected");
	  const teamListTemplate = `				<h2 class="name-header">
													Notifications
												</h2>
												<div id="team-wrapper">
													<ul id="notification-list">
													</ul>
												</div>
											`;
				

	
	
	// dont do it like this maybe? potential dom lag
	this.innerHTML = teamListTemplate;
	
	// find the user from the auth configuration
	const workaholicCurrentUserID = firebase.auth().currentUser.uid;
	
	// find the UL containing the nofications
	this.teamsList = document.getElementById("notification-list");

	// find all notifications refering to the current user
	const noficationsRef = firebase.firestore().collection("notifications").where("for","==", workaholicCurrentUserID)
		
	// attach listeners to the reference to apply com updates
	noficationsRef.onSnapshot((snapshot) => {
		snapshot.docChanges().forEach((change) =>{
			if (change.type === "added") {
				this.createNewNotificationCard(change.doc);
			}
			else if(change.type === "modified"){
				this.changeDocAttributes(change);
			}
			else if(change.type ==="removed"){
				this.removeNotificationCard(change);
			}
		});
	});
  }

	
  // create new list elements and assign attributes to let cards modify there displayed data
  createNewNotificationCard(doc){
	var newNotificationCard;
	let docData = doc.data();
	// is the notification a team invite
	if(docData.type === "team-invite"){
		// yes - create the team notification card from the custom element registry
		newNotificationCard = document.createElement("invite-notification-card");	
	}
	else{
		// no - create the normal notification card from the custom element registry
		newNotificationCard = document.createElement("notification-card");	
	}

     

	// get the data from the document and apply to card attributes

	this.appendChild(newNotificationCard);	
	this.setAttributesFromDoc(newNotificationCard, docData);
	
	// setup a document reference on the card for debuging
	let queryString = "notifications/" + doc.id
	newNotificationCard.setAttribute("doc-location", queryString);

	//if(!docData["is-read"]) // new unread notification, let the user know somehow

	// add new element to local notifications
	this.notifications.push(newNotificationCard);
	
  }
  
  // this scenario should only rarely happen, remove deleted document from the DOM
  removeNotificationCard(change){
	
	// find it via the query index
	let docIndex = change.oldIndex
	let notificationCard = this.notifications[docIndex];

	// remove from the parent node
	notificationCard.parentNode.removeChild(notificationCard);
  }
  
  // set/update any relevant attributes on the card
  setAttributesFromDoc(elem, docData){
	let isRead = docData["is-read"];
	let message = docData["message"];
	elem.setAttribute("is-read", isRead);
	elem.setAttribute("message", message);
	
	if(docData["team"]){
		this.setTeamData(elem, docData["team"]);
	}
	
	
	
  }
  
  // set team data of team invite cards
  setTeamData(elem, teamRef){
	teamRef.get().then( (team) =>{
		let teamName = team.data().name;
		elem.setAttribute("team-name", teamName);
		elem.setAttribute("team-doc-location", teamRef.path);
	});
  }
  
  
  // update an existing dom element with modified data
  changeDocAttributes(change){
	let docIndex = change.newIndex
	let doc = change.doc;
	
	// find the notification card from the query index
	let notificationCard = this.notifications[docIndex];

	// update the data to allow display
	this.setAttributesFromDoc(notificationCard, doc.data());

  }
	
	// currently un-used consider implementing adding/removing listeners
  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log("userpage attr change" + attrName + oldVal + newVal);
  }
  

  
}

// add elements to the custom element registry
window.customElements.define('notification-page', NotificationPage);
window.customElements.define('notification-card', NotificationCard);
window.customElements.define('invite-notification-card', InviteNotificationCard);
