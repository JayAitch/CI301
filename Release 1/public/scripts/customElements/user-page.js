

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

		// use arrow function to preserve the value of this
		this.userAccount.get().then(doc => {

		    // make sure we arnt going to blat the users experience values.
            if (doc.exists) {
                this.userAccount.set({
                    "logged-on": true,
                    "last-logged": new Date()
                }, {merge: true});
            } else {
                this.userAccount.set({
                    "logged-on": true,
                    "last-logged": new Date(),
                    "skill-levels": {}
                }, {merge: true});
            }


            this.userAccount.get().then(doc => {
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
                let skillLevels =  user["skill-levels"];
                for(let skillType in skillLevels){

                    let skillXP = skillLevels[skillType];
                    let xpLevelTest = document.createElement("p");
                    let testText = skillType + ":  " ;
                    let level = experiencePointsAsLevel(skillXP);
                    testText += "    level: " + level
                    xpLevelTest.innerHTML = testText;
                    this.appendChild(xpLevelTest);



                    let experienceBar = document.createElement("experience-bar");

                    this.appendChild(experienceBar);
                    experienceBar.setAttribute("current-experience", skillXP);
                } ;

            }).catch(function(error) {

                console.log("could not get user data:", error);
            });




        })

		

		
		
		
		
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

class ExperienceBar extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.innerHTML = `
			<style>
				.progress{
					background-color:green;
				}
				.bar-wrapper{
							background-color:grey;
				}
			</style>
			<div class="bar-wrapper"><div class="progress"></div></div>
		`;
		this.progressBar = this.querySelector(".progress");

	}
	// observe the attribute changes so we can modify dispalyed data
	static get observedAttributes() {
		return ['current-experience'];
	}

	// intiate document grab when we change the location reference
	attributeChangedCallback(name, oldValue, newValue) {
		if(oldValue !== newValue){
			let level = experiencePointsAsLevel(newValue);
			let currentLevelXp = levelAsExperiencePoints(level);
			let nextLevelXp = levelAsExperiencePoints(level + 1);
			let pointsIntoLevel = newValue - currentLevelXp;
			let pointsInLevel = nextLevelXp - currentLevelXp;

			let percentComplete = pointsIntoLevel / pointsInLevel
			console.log(`complete ${percentComplete}, pointsIntoLevel = ${pointsIntoLevel}, expereince points ${newValue}`);
			percentComplete = percentComplete * 100;
			this.progressBar.innerHTML = currentLevelXp + "/" + nextLevelXp;
			this.progressBar.setAttribute("style", "width: " + percentComplete + "%;");
		}
	}
}

window.customElements.define('user-page', UserPage);
window.customElements.define('experience-bar', ExperienceBar);

