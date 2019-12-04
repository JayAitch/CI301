

// todo: base element that stores a document reference and has base control over dom updates

class UserPage extends HTMLElement{
  constructor() {
    super();
	this._clickHandler = this._clickHandler.bind(this);
  }
  
  connectedCallback() {
	  
	  
		// we want the currently logged in users reference in our accounts collection
		// this document will be used to populate the users account page
		const workaholicCurrentUser = getUserId();
		this.userAccount = firebase.firestore().collection('accounts').doc(workaholicCurrentUser);
		var testText = ""
		this.userAccount.set({
			"logged-on": true,
            "last-logged": new Date(),
            "skill-level":{}
		}, { merge: true });
		// use arrow function to preserve the value of this
		this.userAccount.get().then(doc => {

			if (doc.exists) {

				let user = doc.data();
				let template = document.createElement('template');

				const userAccountTemplate = `
											<style>:host { ... }</style>
												<div class="name-header">
												<form method="post" id="username-form">
													<input type="text" name="username" value=${user.name}>
													<button id="submit-change-btn">X</button>
												</form>
												</div>
												<div id="account-stats">
													<div><span>points:</span><span>${user.points}</span></div>
												</div>
											`;
				
				
				template.innerHTML = userAccountTemplate;
		
				var clone = document.importNode(template, true);
				
				// dont do it like this maybe? potential dom lag
				this.innerHTML = userAccountTemplate;
				
				//let shadowRoot = this.attachShadow({mode: 'open'});
				this.accountSettingsFormBtn = document.getElementById('submit-change-btn');
				this.accountSettingsFormBtn.addEventListener('click', this._clickHandler);
				
			//	console.log(shadowRoot.getElementById('username-form'));
				
			//	shadowRoot.appendChild(template.content.cloneNode(true));

				return doc.data();
			}	
		}).catch(function(error) {
					
			console.log("could not get user data:", error);
		});
		

		
		
		
		
		//this.innerHTML = testText
		
		
		console.log("userpage connected");
	}
	
	
	// we can generalise this method and make a class to handle/validate document changes
	
	_clickHandler(ev){
		ev.preventDefault();
		
		let name = this.accountSettingsFormBtn.parentElement.elements['username'].value;

		// there is no username 
		var setWithMerge =	this.userAccount.set({
							name: name,
						}, { merge: true });
		
	}
	
	submitAccountChange(){
		
		
	}
	
	disconnectedCallback() {
		console.log("userpage disconnected");
	}
  
  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log("userpage attr change");
  }
	
}


window.customElements.define('user-page', UserPage);


