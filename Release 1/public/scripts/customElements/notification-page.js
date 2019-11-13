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
		let isRead = this.getAttribute("is-read");
		this.isRead.innerHTML = isRead;
		this.message.innerHTML = this.getAttribute("message");
		if(isRead) this.classList.add("read-notification")
		// do something when an attribute has changed
//		console.log(this);
	}
	
  	_clickHandler(ev){
//		console.log("clicked");
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
		return ['is-read', 'message'];
	}

	// set the display for these values onto the txt of the displays
	attributeChangedCallback(name, oldValue, newValue) {
		this.message.innerHTML = this.getAttribute("message");
	}
	
	// the user has accepeted the invite so lets add the team to their collection
	_clickAccept(ev){
		// get the document location from the dom object
		let teamDocLocation = this.getAttribute("team-doc-location");
		
		// add a new team under the users account
		// we should be able to secure this by adding the users id to a collection under the team on inviting
		let addToPendingInvites = firebase.firestore().doc(teamDocLocation).set({
			"members": firebase.firestore.FieldValue.arrayUnion(getUserId())
		}, { merge: true })
	}
	
	// delete the notification???
	_clickDecline(ev){
		
		alert('declined');
	}
}


// list of all notifications
class NotificationList extends ActiveQueryListElement{
  constructor() { 
    super();
  }


  getQueryReference(){
	// find all notifications refering to the current user
	return firebase.firestore().collection("notifications").where("for","==", this.currentUserID)	
  }
  

  createCardDOMElement(docData){
	  if(!docData["is-read"]) $(".notification-btn").notify("unread messages");
	  if(docData.type === "team-invite"){
	  	console.log("making teaminvites");
		  // yes - create the team notification card from the custom element registry
		  let newNotificationCard = document.createElement("invite-notification-card");
		  return newNotificationCard;
	  }
	  else{
		  // no - create the normal notification card from the custom element registry
		  let newNotificationCard = document.createElement("notification-card");
		  return newNotificationCard;
	  }

  }


  // set/update any relevant attributes on the card
  setAttributesFromDoc(elem, docData){
	let isRead = docData["is-read"];
	let message = docData["message"];
	elem.setAttribute("is-read", isRead);
	elem.setAttribute("message", message);
	elem.setAttribute("team-doc-location", docData.team);
  }
  


  
}

// list of all notifications
class NotificationPage extends HTMLElement {
	constructor() {
		super();
	}

	// set up the element on connection
	connectedCallback() {
		const teamListTemplate = `				<h2 class="name-header">
													Notifications
												</h2>
												<notification-list></notification-list>
											`;

		// dont do it like this maybe? potential dom lag
		this.innerHTML = teamListTemplate;

	}
}




























// add elements to the custom element registry
window.customElements.define('notification-page', NotificationPage);
window.customElements.define('notification-list', NotificationList);
window.customElements.define('notification-card', NotificationCard);
window.customElements.define('invite-notification-card', InviteNotificationCard);
