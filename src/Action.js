let actionName = "";
let stepID = 0;
let actionType = "";
let actionDetails = [""];
let nextAction = Action;

class Action {
    constructor(params) {
        actionName = params.actionName;
        stepID = params.stepID
        actionType = params.actionType;
        actionDetails = params.actionDetails;
        nextAction = params.nextAction;
    }
}
