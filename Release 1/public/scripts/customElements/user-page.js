

// todo: base element that stores a document reference and has base control over dom updates

class UserPage extends HTMLElement{

  constructor() {
    super();

    this.experienceBars = {};
      this._showInviteCode = this._showInviteCode.bind(this);
  }
  
  connectedCallback() {

	    this.isLoading = true;
		// we want the currently logged in users reference in our accounts collection
		// this document will be used to populate the users account page
		const workaholicCurrentUser = getUserId();
		this.userAccount = firebase.firestore().collection('accounts').doc(workaholicCurrentUser);
        this.innerHTML = 	`<a class="invite-code-btn ui-btn" href="#">user code<div hidden class="qr-code"></div></a>`


         this.inviteCodeBtn = this.querySelector(".invite-code-btn").addEventListener("click", this._showInviteCode);

        this.QRcode = this.querySelector(".qr-code");
        let QRCodeData = {"text": getUserId()};
        new QRCode(this.QRcode, workaholicCurrentUser);

      this.userAccount.set({
          "last-logged": new Date()
      }, {merge: true});

		// use arrow function to preserve the value of this
		this.userAccount.get().then(doc => {

            this.userAccount.onSnapshot(doc => {

                let user = doc.data();

                let skillLevels = safeGetProperty(user,["skill-levels"]);

                 this.updateExperienceBars(skillLevels)

            })
            let skillLevels = safeGetProperty(doc.data(),["skill-levels"]);
            this.updateExperienceBars(skillLevels);

        }).then(()=>
        {
            this.isLoading = false;

        }).catch(function(error) {

        });

	}


	updateExperienceBars(skillLevels){
        for(let skillType in skillLevels){

            let skillXP = skillLevels[skillType];
            let experienceBar  = this.experienceBars[skillType];
            let skillLevel = experiencePointsAsLevel(skillXP);

            if(!experienceBar){
                experienceBar = document.createElement("experience-bar");

                if(!this.isLoading){
                    createFanFareNotification(`your ${skillType} leveled up to ${skillLevel}`);
                }

                this.experienceBars[skillType] = experienceBar;
            }

            experienceBar.skillType = skillType
            experienceBar.currentExperience = skillXP;
            this.appendChild(experienceBar);
        }
    }


    _showInviteCode(){
        let isHidden = this.QRcode.hidden
        this.QRcode.hidden = !isHidden
    }

	disconnectedCallback() {
	}

}

class ExperienceBar extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
	    let skillType = this.getAttribute("skill-type");
	    let skillTypeIconURI = LookupIconURI(skillType);
		this.innerHTML = `
			<style>
				.progress{
					background-color:#96ff96;
				}
				.bar-wrapper{
							background-color:#d7d7d7;
				}
			</style>
            
			<div class="skill-card">
			    <div class="bar-title"><img class="skill-icon" alt="${skillType}"src="${skillTypeIconURI}"><span class="skill-level"></span></div>
			    
			    <div class="bar-wrapper"><div class="progress"></div></div>
			</div>
		`;

		this.progressBar = this.querySelector(".progress");
        this.skillLevel =  this.querySelector(".skill-level");

        this.setTitleText(this.experience);
        this.setBarWidth(this.experience);
	}


	set currentExperience(val){
        let oldExperience = this.experience;
	    this.experience = val;
	    this.setAttribute("current-experience", val);

        this.checkForLevelUp(oldExperience, this.experience);
    }

    set skillType(val){
	    this.experienceType = val;
	    this.setAttribute("skill-type", val);
    }

    checkForLevelUp(oldExperience, newExperience){

        let level = experiencePointsAsLevel(oldExperience);
        let nextLevelXp = levelAsExperiencePoints(level + 1);
        let skillType = this.getAttribute("skill-type")
	    if(newExperience >= nextLevelXp){
	        let newLevel = experiencePointsAsLevel(newExperience);
            this.triggerFanFare(newLevel, skillType);
            this.setTitleText(newExperience);
        }
    }

    triggerFanFare(level, skillType){
	    let fanFareText = `your ${skillType} leveled up to ${level}`
        createFanFareNotification(fanFareText);
    }

	setBarWidth(value){
        let level = experiencePointsAsLevel(value);
        let currentLevelXp = levelAsExperiencePoints(level);
        let nextLevelXp = levelAsExperiencePoints(level + 1);
        let pointsIntoLevel = value - currentLevelXp;
        let pointsInLevel = nextLevelXp - currentLevelXp;

        let percentComplete = pointsIntoLevel / pointsInLevel
        percentComplete = percentComplete * 100;
        this.progressBar.innerHTML = currentLevelXp + "/" + nextLevelXp;
        this.progressBar.setAttribute("style", "width: " + percentComplete + "%;");
    }

    setTitleText(experience){
	    let level = experiencePointsAsLevel(experience);
	    this.skillLevel.innerHTML = ` ${level}`
    }
}




window.customElements.define('user-page', UserPage);
window.customElements.define('experience-bar', ExperienceBar);

