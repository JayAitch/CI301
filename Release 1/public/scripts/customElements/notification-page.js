class NotificationCard extends DocCard{
	constructor() {  
		super();
		
		// bind 'this' to the click handler for this component
		this._clickHandler = this._clickHandler.bind(this);
	}
	
	
	// setup elmenet when connected
	connectedCallback() {
		const template = document.getElementById('notification-card-template');
		let content = document.importNode(template.content, true);
		this.appendChild(content);

		this.messageElement = this.querySelector(".message");
		// find the top wrapper and add the click listener to it
		this.querySelector(".card-wrapper").addEventListener("click", this._clickHandler);
	}
	
	// observe the attribute changes so we can modify dispalyed data
	static get observedAttributes() {
		return ['is-read', 'message'];
	}


	displayDocumentValues(docData){
		this.message = safeGetProperty(docData, "message");
		this.isRead = safeGetProperty(docData, "isRead");
	}

	set message(val){
		this.messageElement.textContent = val;
	}

	set isRead(val){
		if(val){
			this.classList.add("read-notification")
		}
		this.hasRead = val;
	}

  	_clickHandler(ev){
		this.markAsRead();
	}

	markAsRead(){
		const docLocation = this.documentLocation;
		let notification = firebase.firestore().doc(docLocation);
		notification.set({
				"is-read": true,
		}, { merge: true });
	}
}


class InviteNotificationCard extends NotificationCard{
	constructor() {  
		super();
		
		// bind 'this' to the click handlers for this component
		this._clickDecline = this._clickDecline.bind(this);
		this._clickAccept = this._clickAccept.bind(this);
	}
	
	
	// setup elmenet when connected
	connectedCallback() {
		const template = document.getElementById('invite-notification-card-template');
		let content = document.importNode(template.content, true);
		this.appendChild(content);
				
		this.messageElement = this.querySelector(".message");
		// find the top wrapper and add the click listener to it
		this.querySelector(".accept-btn").addEventListener("click", this._clickAccept);
		this.querySelector(".decline-btn").addEventListener("click", this._clickDecline);
	}


	displayDocumentValues(docData){
		super.displayDocumentValues(docData);
		this.teamDocumentLocation = safeGetProperty(docData, "team")
	}

	set teamDocumentLocation(val){
		this.teamDocLocation = val;
		this.setAttribute("team-doc-location", val);
	}

	// the user has accepeted the invite so lets add the team to their collection
	_clickAccept(ev){
		// get the document location from the dom object
		let teamDocLocation = this.teamDocLocation;
		let addToPendingInvites = firebase.firestore().doc(teamDocLocation).set({
			"members": firebase.firestore.FieldValue.arrayUnion(getUserId())
		}, { merge: true });
		this.markAsRead();
	}
	
	// delete the notification???
	_clickDecline(ev){

		this.markAsRead();
	}
}


// list of all notifications
class NotificationList extends ActiveQueryListElement{
  constructor() { 
  	  super();
	  this.collectionRef = "notifications/"
  }


  getQueryReference(){
	// find all notifications refering to the current user
	return firebase.firestore().collection("notifications").where("for","==", this.currentUserID);
  }
  

  createCardDOMElement(docData){
	  let newNotificationCard = null;
	  if(docData["is-read"] !== "true" ) $(".notification-btn").notify("unread messages");
	  if(docData.type === "team-invite"){
		  // yes - create the team notification card from the custom element registry
		  newNotificationCard = document.createElement("invite-notification-card");

	  }
	  else {
		  // no - create the normal notification card from the custom element registry
		  newNotificationCard = document.createElement("notification-card");
	  }

	  return newNotificationCard;
  }
}

// list of all notifications
class NotificationPage extends HTMLElement {

	// set up the element on connection
	connectedCallback() {
		const template = document.getElementById('notification-page-template');
		let content = document.importNode(template.content, true);
		this.appendChild(content);
	}
}





// add elements to the custom element registry
window.customElements.define('notification-page', NotificationPage);
window.customElements.define('notification-list', NotificationList);
window.customElements.define('notification-card', NotificationCard);
window.customElements.define('invite-notification-card', InviteNotificationCard);
