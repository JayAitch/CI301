let currentlyViewTeamData;





// tile to display experience rewards to the user
class ExperienceRewardTile extends HTMLElement{
    constructor() {
        super();
    }

    connectedCallback() {

        let skillType = this.getAttribute("skill-type");
        let iconURI = LookupIconURI(skillType);
        const rewardTileTemplate = `<div class="reward-tile"><img class="skill-icon" src="${iconURI}"><span class="skill-text" src="skill icon"></span><span class="amount"></span></div>`;

        // dont do it like this maybe? potential dom lag
        this.innerHTML = rewardTileTemplate;
        this.amountElem = this.querySelector(".amount");
        this.skillIconElem = this.querySelector(".skill-icon");
        this.skillTextElem = this.querySelector(".skill-text");
    }
    static get observedAttributes() {
        return ['amount', 'skill-type']; // status and experience
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'amount'){
            this.amountElem.innerHTML = newValue;
        }

    }

}




class TaskCard extends HTMLElement{
    constructor() {
        super();
        this.currentRewardTiles = {};
        this.currentRequirementTiles = {};
        this._completeBtnClicked = this._completeBtnClicked.bind(this);
    }


    // setup elmenet when connected
    connectedCallback() {
        const userAccountTemplate = `			<div class="card-wrapper">
													<div class="name-header">
														 <div class="deadline-date-display"></div><h3 class="name"></h3>
													</div>
													<div class="description-wrapper">
													    <p class="description"></p>
													</div>
													<div class="control-group">
																
														<a class="complete-task-button control ui-btn" href="#">complete</a>					
													</div>
													<div class="skill-requirements tile-group"><span class="tile-group-label">Required:</span></div>
													<div class="skill-rewards tile-group"><span class="tile-group-label">Rewards:</span></div>

												</div>
											`;
        // dont do it like this maybe? potential dom lag

        this.innerHTML = userAccountTemplate;
        this.controlGroup = this.querySelector(".control-group");
        this.nameEle = this.querySelector(".name");
        this.descrEle = this.querySelector(".description");
        this.skillRequirementsWrapper = this.querySelector(".skill-requirements");
        this.skillRewardsWraper =  this.querySelector(".skill-rewards");
        this.deadlineDateDiv = this.querySelector(".deadline-date-display");
        this.querySelector(".complete-task-button").addEventListener("click", this._completeBtnClicked);
        this.createEditButton();
    }


    createEditButton(){
        if(this.getAttribute("show-edit") == "true"){
            let editButton = document.createElement("edit-button");
            editButton.setAttribute("doc-location", this.getAttribute("doc-location"));
            editButton.setAttribute("obj-type","task");
            this.controlGroup.appendChild(editButton);
        }
    }


    // observe the attribute changes so we can modify dispalyed data
    static get observedAttributes() {
        return ['name', 'description', 'rewards', 'requirements', 'deadline']; // status and experience
    }

    // set the display for these values onto the txt of the displays
    attributeChangedCallback(name, oldValue, newValue) {
        let taskName = this.getAttribute("name");
        let taskDescription = this.getAttribute("description");
        let deadline = this.getAttribute("deadline");

        this.nameEle.textContent = taskName;
        this.descrEle.textContent = taskDescription;
        this.deadlineDateDiv.textContent = deadline;
        if(name === "rewards"){
            this.createRewardTiles(newValue);
        }
        if(name === "requirements" && newValue.length > 0){
            console.log();
            this.createRequirementTiles(newValue);
        }

    }

    _completeBtnClicked(){
        let documentLocation = this.getAttribute("doc-location");

        let taskToComplete = firebase.firestore().doc(documentLocation);


        // move this logic to a function
        taskToComplete.get().then((doc) => {

            let taskData = doc.data();
            let taskRewards = taskData['experience-rewards']

                // TODO: add check to requirements
                //       add levelup check and fanfare
                let userAccountRef = getCurrentUserDocRef();
                userAccountRef.get().then((doc) => {

                    let userAccountData = doc.data();

                    // this will error for new users
                    let userAccountSkillLevels = userAccountData['skill-levels']

                    for (let key in taskRewards) {

                        let userLevel = experiencePointsAsLevel(userAccountSkillLevels[key]);
                        let requiredLevel = taskData["requirements"][key]

                        if(!requiredLevel || requiredLevel <= userLevel){
                            let rewardXPValue = taskRewards[key] || 0;
                            let currentXPValue = userAccountSkillLevels[key] || 0;
                            userAccountSkillLevels[key] = rewardXPValue + currentXPValue;
                        }
                        else{
                            console.log(" failed at level check:" + key);
                            $(this).notify(`requires ${key} level ${requiredLevel}`);
                            //show something to the users!
                            return;
                        }
                    }

                    userAccountRef.set({
                        "skill-levels": userAccountSkillLevels,
                    }, {merge: true});

                    taskToComplete.set({
                        "status": taskStatus.Complete,
                    }, {merge: true});

                }).catch(function (error) {
                    console.error("Could not complete task: ", error);
                });



        }).catch(function(error) {
            console.error("Could not complete task: ", error);
        });

    }

    createRequirementTiles(requirement){
        let requirementsArray = requirement.split(",");
        for(let rewardPos = 0; requirementsArray.length > rewardPos; rewardPos++){

            let currentReward = requirementsArray[rewardPos];
            let currentRewardArr = currentReward.split(':');
            let currentRewardType = currentRewardArr[0];
            let currentRewardAmount = currentRewardArr[1];

            let currentRewardTile = this.currentRequirementTiles[currentRewardType];


            if(currentRewardTile){
                this.setRewardAttributes(currentRewardTile, currentRewardAmount);
            }
            else{
                this.createRequirmentTile(currentRewardType, currentRewardAmount);

            }

        }
    }


    createRewardTiles(reward){


        let rewardsArr = reward.split(",");
        for(let rewardPos = 0; rewardsArr.length > rewardPos; rewardPos++){

            let currentReward = rewardsArr[rewardPos];
            let currentRewardArr = currentReward.split(':');
            let currentRewardType = currentRewardArr[0];
            let currentRewardAmount = currentRewardArr[1];

            let currentRewardTile = this.currentRewardTiles[currentRewardType];


            if(currentRewardTile){
                this.setRewardAttributes(currentRewardTile, currentRewardAmount);
            }
            else{
                this.createRewardTile(currentRewardType, currentRewardAmount);

            }

        }
    }


    setRewardAttributes(tile, amount){
        // consider chaining to use data instead of attributes
        tile.setAttribute("amount", amount);
    }

    createRewardTile(type, amount){
        let newRewardTile = document.createElement("reward-tile");
        newRewardTile.setAttribute("skill-type", type);
        this.skillRewardsWraper.appendChild(newRewardTile);

        // consider chaining to use data instead of attributes

        newRewardTile.setAttribute("amount", amount);
        this.currentRewardTiles[type] = newRewardTile;


    }

    createRequirmentTile(type, amount){
        let newRewardTile = document.createElement("reward-tile");
        newRewardTile.setAttribute("skill-type", type);
        this.skillRequirementsWrapper.appendChild(newRewardTile);

        // consider chaining to use data instead of attributes

        newRewardTile.setAttribute("amount", amount);
        this.currentRequirementTiles[type] = newRewardTile;


    }
}



class TasksPage extends HTMLElement{
    constructor() {
        super();
        this._onNewTaskBtnClick = this._onNewTaskBtnClick.bind(this);
    }

    // set up the element on connection
    connectedCallback() {
        const teamTemplate = `				<h2 class="name-header">
													please select a team to view tasks
												</h2>
												<a class="ui-btn" id="new-task-btn" href="#">new task</a>
											`;

        // dont do it like this maybe? potential dom lag
        this.innerHTML = teamTemplate;
        this.taskListElem = document.createElement("tasks-list");
        this.header = this.querySelector(".name-header");
        this.appendChild(this.taskListElem);
         document.getElementById("new-task-btn").addEventListener("click", this._onNewTaskBtnClick);


    }
    static get observedAttributes(){
        return['teams-watched']
    }

    attributeChangedCallback(name, oldValue, newValue) {


        // we may want to change this to a filter so that a user can query multiple teams at once
        // todo: flow and wireframe to deside
        if(name == 'teams-watched' ){
            this.teamTarget = newValue;

            // assign the team we are viewing to a global variable, components of the app will use this for configuration
            firebase.firestore().doc(this.teamTarget).get().then((doc)=> {
                currentlyViewTeamData = doc.data();
                this.header.innerHTML = currentlyViewTeamData.name || 'error';
            });

            this.taskListElem.setAttribute("collection-target", this.teamTarget);
        }
    }

    _onNewTaskBtnClick(){
        const newDocumentForm = document.getElementById("new-document-form");
        let collectionTargetString = this.teamTarget + "/tasks/"
        newDocumentForm.setAttribute("obj-type", "task");
        newDocumentForm.setAttribute("collection-target", collectionTargetString);
        newDocumentForm.hidden = false;
    }


}


class TasksList extends ChangeableActiveQueryList{
    constructor() {
        super();
        this.collectionRef = ""
    }

    getQueryReference(){
        // todo: check that this value is a document reference, we are going to want a global expr for this
        let targetDocument = this.getAttribute('collection-target');

        this.collectionRef =  targetDocument + "/tasks/"
        // find all tasks underneith refering to the current team
        return firebase.firestore().collection(this.collectionRef).where("status", "==", taskStatus.Active)
    }

    createCardDOMElement(docData) {
        let teamTemplate = document.createElement("task-card");
        this.setTaskCardCreationAttributes(teamTemplate, docData);
        return teamTemplate;
    }

    setTaskCardCreationAttributes(teamTemplate, docData){
        let showEdit = this.shouldShowEditButton(docData);
        teamTemplate.setAttribute("show-edit", showEdit);
    }


    setAttributesFromDoc(elem, docData) {
        let name = docData.name;
        let desc = docData.description;

        let rewards = docData["experience-rewards"];
        let requirements = docData["requirements"];
        let deadline = convertToHTMLDate(docData["deadline"].toDate());

        if(rewards){
            let rewardString = this.buildRewardString(rewards);
            elem.setAttribute("rewards", rewardString);

            let requirementsString = this.buildRequirementString(requirements);
            elem.setAttribute("requirements", requirementsString);
        }

        elem.setAttribute("deadline", deadline);
        elem.setAttribute("name", name);
        elem.setAttribute("description", desc);


    }

    shouldShowEditButton(docData){
        let teamType = currentlyViewTeamData["team-type"];
        let taskOwnerID = docData.owner;
        let teamOwnerID = currentlyViewTeamData.owner;
        let currentUserID = getUserId();

        // is the team type verticle? is the current user not the owner of the team
        if(teamType == 1 && teamOwnerID != currentUserID) {
            // is the current user not the owner of the task
            if (taskOwnerID != currentUserID) {
                // dont show edit button
                return false;
            }
        }
        return true
    }

    buildRewardString(rewards) {
        let rewardString = "";

        for (let key in rewards) {
            if (rewards.hasOwnProperty(key)) {
                rewardString += key + ":" + rewards[key] + ",";
            }
        }
        rewardString = rewardString.substr(0, rewardString.length - 1)
        return rewardString;
    }
    buildRequirementString(requirements) {
        let requirementString = "";

        for (let key in requirements) {
            if (requirements.hasOwnProperty(key)) {
                if(requirements[key] && requirements[key] != 0){
                    requirementString += key + ":" + requirements[key] + ",";
                }

            }
        }
        requirementString = requirementString.substr(0, requirementString.length - 1)
        return requirementString;
    }
}

window.customElements.define('reward-tile', ExperienceRewardTile);
window.customElements.define('tasks-page', TasksPage);
window.customElements.define('tasks-list', TasksList);
window.customElements.define('task-card', TaskCard);
