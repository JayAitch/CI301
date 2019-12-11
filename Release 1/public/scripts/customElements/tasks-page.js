let currentlyViewTeamData;

// tile to display experience rewards to the user
class ExperienceRewardTile extends HTMLElement{
    constructor() {
        super();
    }

    connectedCallback() {
        const rewardTileTemplate = `<img class="skill-icon" src="skill icon"><span class="amount"></span>`;

        // dont do it like this maybe? potential dom lag
        this.innerHTML = rewardTileTemplate;
        this.amountElem = this.querySelector(".amount");
        this.skillIconElem = this.querySelector(".skill-icon");

    }
    static get observedAttributes() {
        return ['amount', 'skill-type']; // status and experience
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'amount'){
            this.amountElem.innerHTML = newValue;
        }
        else if(name === 'skill-type'){
            // we want to work out the type and get the icon<<<<<<,
        }
    }

}






class TaskCard extends HTMLElement{
    constructor() {
        super();
        this.currentRewardTiles = {};
        this._completeBtnClicked = this._completeBtnClicked.bind(this);
    }


    // setup elmenet when connected
    connectedCallback() {
        const userAccountTemplate = `
													<div class="name-header">
														<h3 class="name"></h3>
													</div>
													<div class="description-wrapper">
													    <p class="description"></p>
													</div>
													<div class="control-group">
														<button is="edit-button" class="team-edit-button control" obj-type="task">edit</button>				
														<button class="complete-task-button control">complete</button>					
													</div>
											`;

        // dont do it like this maybe? potential dom lag
        this.innerHTML = userAccountTemplate;
        this.nameEle = this.querySelector(".name");
        this.descrEle = this.querySelector(".description");
        this.querySelector(".complete-task-button").addEventListener("click", this._completeBtnClicked);

    }

    // observe the attribute changes so we can modify dispalyed data
    static get observedAttributes() {
        return ['name', 'description', 'rewards']; // status and experience
    }

    // set the display for these values onto the txt of the displays
    attributeChangedCallback(name, oldValue, newValue) {
        let taskName = this.getAttribute("name");
        let taskDescription = this.getAttribute("description");

        this.nameEle.textContent = taskName;
        this.descrEle.textContent = taskDescription;

        if(name === "rewards"){
            console.log(this.getAttribute("rewards"));
            this.createRewardTiles(newValue);
        }

    }

    _completeBtnClicked(){
        let documentLocation = this.getAttribute("doc-location");

        let taskToComplete = firebase.firestore().doc(documentLocation);


        taskToComplete.get().then((doc) => {

            let taskData = doc.data();
            let taskRewards = taskData['experience-rewards']
            console.log(taskRewards);



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
        this.appendChild(newRewardTile);

        // consider chaining to use data instead of attributes
        newRewardTile.setAttribute("amount", amount);
        newRewardTile.setAttribute("skill-type", type);
        this.currentRewardTiles[type] = newRewardTile;
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
												<button id="new-task-btn">new task</button>
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
        if(name == 'teams-watched' && oldValue != newValue){
            this.teamTarget = newValue;

            // assign the team we are viewing to a global variable, components of the app will use this for configuration
            firebase.firestore().doc(this.teamTarget).get().then((doc)=> {
                currentlyViewTeamData = doc.data(); this.header.innerHTML = currentlyViewTeamData.name || 'error';
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
        console.log(this.collectionRef);
        console.log("tasks");
        // find all notifications refering to the current user
        return firebase.firestore().collection(this.collectionRef).where("status", "==", taskStatus.Active)
    }

    createCardDOMElement(docData) {
        let teamTemplate = document.createElement("task-card");
        return teamTemplate;
    }

    setAttributesFromDoc(elem, docData) {
        let name = docData.name;
        let desc = docData.description;
        let rewards = docData["experience-rewards"];

        if(rewards){
            let rewardString = this.buildRewardString(rewards);
            elem.setAttribute("rewards", rewardString);
        }


        elem.setAttribute("name", name);
        elem.setAttribute("description", desc);


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

}

window.customElements.define('reward-tile', ExperienceRewardTile);
window.customElements.define('tasks-page', TasksPage);
window.customElements.define('tasks-list', TasksList);
window.customElements.define('task-card', TaskCard);
