let actionName = "";
let stepID = 0;
let actionType = "";
let actionDetails = [""];
let nextAction = undefined; //type: Action

class Action {
    constructor(params) {
        this.actionName = params.actionName;
        this.stepID = params.stepID
        this.actionType = params.actionType;
        this.actionDetails = params.actionDetails;
        this.nextAction = params.nextAction;
        this.actionNode = params.actionNode;
    }
}
