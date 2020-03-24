

// todo: base element that stores a document reference and has base control over dom updates

class UserPage extends HTMLElement{

  constructor() {
    super();

    this.experienceBars = {};
    this._toggleInviteCode = this._toggleInviteCode.bind(this);
  }
  
  connectedCallback() {

	  this.isLoading = true;
	  // we want the currently logged in users reference in our accounts collection
	  // this document will be used to populate the users account page
	  const workaholicCurrentUser = getUserId();


      const template = document.getElementById('user-page-template');
      let content = document.importNode(template.content, true);
      this.appendChild(content);

      let qrCodeText = this.querySelector(".code-text");
      let inviteCodeBtn = this.querySelector(".invite-code-btn");
      this.qrCodeWrapper = this.querySelector(".qr-wrapper");

      inviteCodeBtn.addEventListener("click", this._toggleInviteCode);
      qrCodeText.textContent = workaholicCurrentUser;


      this.userAccount = firebase.firestore().collection('accounts').doc(workaholicCurrentUser);
      this.createQRCode();
      this.setUserLogin();
      this.setupSnapshot();

	}

    setupSnapshot(){
        // use arrow function to preserve the value of this
        this.userAccount.get().then(doc => {

            this.snapshotListener = this.userAccount.onSnapshot(doc => {

                let user = doc.data();

                let skillLevels = safeGetProperty(user,["skill-levels"]);
                this.updateExperienceBars(skillLevels)

            });
            let skillLevels = safeGetProperty(doc.data(),["skill-levels"]);
            this.updateExperienceBars(skillLevels);

        }).then(()=>
        {
            this.isLoading = false;

        }).catch(function(error) {

        });
    }

	setUserLogin(){
        this.userAccount.set({
            "last-logged": new Date()
        }, {merge: true});
    }
    createQRCode(){
        let currentUser = getUserId();
        let QRcode = this.querySelector(".qr-code");
        let QRCodeData = {"text": currentUser};
        new QRCode(QRcode, currentUser);
    }

	updateExperienceBars(skillLevels){
        for(let skillType in skillLevels){

            let skillXP = skillLevels[skillType];
            let experienceBar  = this.experienceBars[skillType];
            let skillLevel = experiencePointsAsLevel(skillXP);

            if(!experienceBar){
                experienceBar = document.createElement("experience-bar");

                if(!this.isLoading){
                    experienceBar.triggerFanFare();
                }

                this.experienceBars[skillType] = experienceBar;
            }

            experienceBar.skillType = skillType;
            experienceBar.currentExperience = skillXP;
            this.appendChild(experienceBar);
        }
    }


    _toggleInviteCode(){
        let isHidden = this.qrCodeWrapper.hidden;
        this.qrCodeWrapper.hidden = !isHidden;
    }

	disconnectedCallback() {
        this.snapshotListener();
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
			    <div class="bar-title">
			        <img class="skill-icon" alt="${skillType}"src="${skillTypeIconURI}">
			        <span class="skill-level"></span>
			    </div>
			    <div class="bar-wrapper">
			        <div class="progress"></div>
			    </div>
			</div>
		`;

		this.progressBar = this.querySelector(".progress");
        this.skillLevelText =  this.querySelector(".skill-level");

        this.setTitleText();
        this.setBarWidth();
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
            this.triggerFanFare();
            this.setTitleText(newExperience);
        }
    }

    triggerFanFare(){
        let level = experiencePointsAsLevel(this.experience);
	    let fanFareText = `your ${this.experienceType} leveled up to ${level}`;
        createFanFareNotification(fanFareText);
    }

	setBarWidth(){
	    let experience = this.experience;
        let level = experiencePointsAsLevel(experience);
        let currentLevelXp = levelAsExperiencePoints(level);
        let nextLevelXp = levelAsExperiencePoints(level + 1);
        let pointsIntoLevel = experience - currentLevelXp;
        let pointsInLevel = nextLevelXp - currentLevelXp;

        let percentComplete = pointsIntoLevel / pointsInLevel
        percentComplete = percentComplete * 100;
        this.progressBar.innerHTML = currentLevelXp + "/" + nextLevelXp;
        this.progressBar.setAttribute("style", "width: " + percentComplete + "%;");
    }

    setTitleText(){
        let experience = this.experience;
	    let level = experiencePointsAsLevel(experience);
	    this.skillLevelText.innerHTML = ` ${level}`
    }
}




window.customElements.define('user-page', UserPage);
window.customElements.define('experience-bar', ExperienceBar);

