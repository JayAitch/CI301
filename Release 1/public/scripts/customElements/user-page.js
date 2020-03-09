

// todo: base element that stores a document reference and has base control over dom updates

class UserPage extends HTMLElement{

  constructor() {
    super();

    this.experienceBars = {};

  }
  
  connectedCallback() {

	    this.isLoading = true;
		// we want the currently logged in users reference in our accounts collection
		// this document will be used to populate the users account page
		const workaholicCurrentUser = getUserId();
		this.userAccount = firebase.firestore().collection('accounts').doc(workaholicCurrentUser);

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




            this.userAccount.onSnapshot(doc => {

                let user = doc.data();

                let skillLevels =  user["skill-levels"];
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

                
            })

            // we want to do this with JQM loading trigger to so a loading thing

            setTimeout(function () {
                this.isLoading = false;
            },100)


        }).catch(function(error) {
            console.log("Error getting document:", error);
        });

	}


	disconnectedCallback() {
		console.log("userpage disconnected");
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

