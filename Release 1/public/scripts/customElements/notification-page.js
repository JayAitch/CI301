class NotificationCard extends HTMLElement{
	constructor() {  
		super();
		// bind this to the click handler for this component
		this._clickHandler = this._clickHandler.bind(this);
	}
	
	connectedCallback() {
				const userAccountTemplate = `
											<style>:host { ... }</style>
												<div class="task-wrapper">
													<div class="name-header">
														<h3 class="message"></h3>
													</div>
													<span class="is-read"></span><span class="message"></span>
												</div>
											`;
				
				// dont do it like this maybe? potential dom lag
				this.innerHTML = userAccountTemplate;
				
				// assign local values for the team displays
				this.isRead = this.querySelector('.is-read');
				console.log(this.isRead);
				this.message = this.querySelector('.message');
				this.docLoaction = this.getAttribute("doc-location");
				this.querySelector(".task-wrapper").addEventListener("click", this._clickHandler);
	}
	
	// observe the attribute changes so we can show the user tasks have been completed
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
		var setWithMerge =	notification.set({
							"is-read": true,
						}, { merge: true });
	}
}

// list for all the teams a person is part of
class NotificationPage extends HTMLElement{
  constructor() { 
    super();
	this.notifications = [];
  }
  
  connectedCallback() {
	  console.log("connected");
	  const teamListTemplate = `
											<style>:host { ... }</style>
												<h2 class="name-header">
													Notifications
												</h2>
												<div id="team-wrapper">
													<ul id="teams-list">
													</ul>
													<slot></slot>
												</div>
											`;
				
	let template = document.createElement('template');
	
	
	// dont do it like this maybe? potential dom lag
	this.innerHTML = teamListTemplate;
	
	template.innerHTML = teamListTemplate;
	//	var clone = document.importNode(template, true);
	
	// find the user from the auth configuration
	const workaholicCurrentUserID = firebase.auth().currentUser.uid;
	this.teamsList = document.getElementById("teams-list");
	console.log(workaholicCurrentUserID);
	// get all the teams an account has reference too
	const noficationsRef = firebase.firestore().collection("notifications").where("for","==", workaholicCurrentUserID)
		
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

	
  // create new list elements and assign listeners to the attributes that other people can modify
  createNewNotificationCard(doc){

	// create element and set any values specific to the user
    let newNotificationCard = document.createElement("notification-card");			
	let docData = doc.data();
	this.appendChild(newNotificationCard);	
	this.setAttributesFromDoc(newNotificationCard, docData);
	
	let queryString = "notifications/" + doc.id
	newNotificationCard.setAttribute("doc-location", queryString);

	//if(!docData["is-read"]) // new unread notification, let the user know somehow


	this.notifications.push(newNotificationCard);
	console.log(this.notifications);
	
  }
  
  removeNotificationCard(change){
	let docIndex = change.oldIndex

	let notificationCard = this.notifications[docIndex];

	notificationCard.parentNode.removeChild(notificationCard);
  }
  
  setAttributesFromDoc(elem, docData){
	let isRead = docData["is-read"];
	let message = docData["message"]
	elem.setAttribute("is-read", isRead);
	elem.setAttribute("message", message);
  }
  
  
  changeDocAttributes(change){
	let docIndex = change.newIndex
	let doc = change.doc;
	let notificationCard = this.notifications[docIndex];
		console.log(this.notifications);
	console.log(notificationCard);
	this.setAttributesFromDoc(notificationCard, doc.data());

  }
	
  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log("userpage attr change" + attrName + oldVal + newVal);
  }
  

  
}


window.customElements.define('notification-page', NotificationPage);
window.customElements.define('notification-card', NotificationCard);
