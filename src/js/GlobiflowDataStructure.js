const workspaces = {
    Business_Development: 'Business Development',
    Financial_Operations: 'Financial Operations',
    Financials: 'Financials',
    Forms: 'Forms',
    Jobs_and_Candidates: 'Jobs and Candidates',
    SKUcapture: 'SKUcapture',
    SKUvantage_Studio: 'SKUvantage Studio',
    Team: 'Team',
    Tech: 'Tech',
    Default: 'Error: Workplace'
};


/**
 * 
 * @param params this is the parameter object with all parameters in it for contructor
 * 
 *  
 *  workspace = workspaces.Default;
 *  let appID = ""
 *  let appName = "";
 * 
 *  let flowActions = []; // Array of Actions. Order matters
 * 
 *
// let flowName = "";
// // let flowID = "";
// // let childrenObjects = []; // this will hold actions the flow performs
// let groupPositionOffset = {x: 0, y: 0};
// let selected = false;

// not sure if i need this variables yet.
// possible cache of connections
// these are both unordered arrays
// connections should be treeNodes
// let forwardConnections = [];    // forward connections are actual cached connections that will be used to draw connection lines
// let backwardConnections = [];   // backwards connections are just back references to any flow that has a connection with this flow

 */
class FlowDataStructure {
    constructor(params) {
        // this.flowKey = params.flowKey;
        this.flowName = params.flowName;
        this.flowID = params.flowID;
        this.appName = params.appName;
        this.appID = params.appID;
        this.appDataStructure = params.appDataStructure;
        this.description = params.description;
        this.selected = false;
        this.groupPositionOffset = {x: params.offset.x, y: params.offset.y};
        this.workSpace = params.workSpace;
        this.flowActions = params.flowActions;
        
        this.flowNode = params.flowNode;
        this.workspaceNode = params.workspaceNode;
        this.appNode = params.appNode;

        this.forwardConnections = params.forwardConnections;
        this.backwardConnections = params.backwardConnections;
    }
}

class AppDataStructure {
    constructor(params) {
        // this.appKey = params.appKey;
        this.appName = params.appName;
        this.appID = params.appID;
        this.groupPositionOffset = {x: params.offset.x, y: params.offset.y};
    }
}

class ExternalEntityDataStructure {
    constructor(params) {
        this.entityKey = params.entityKey;
        this.entityName = params.entityName;
        this.groupPositionOffset = {x: params.offset.x, y: params.offset.y};
    }
}