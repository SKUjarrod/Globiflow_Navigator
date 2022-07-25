let flowName = "";
// let flowID = "";
let position = {x: 0, y: 0};
// let childrenObjects = []; // this will hold actions the flow performs
let groupPositionOffset = {x: 0, y: 0};
let selected = false;

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

let workspace = workspaces.Default;
let appID = ""
let appName = "";

let flowActions = []; // Array of Actions. Order matters

// not sure if i need this variables yet.
// possible cache of connections
// these are both unordered arrays
let forwardConnections = [];
let backwardConnections = [];

class DataStructure {
    constructor(params) {
        this.flowName = params.flowName;
        // this.flowID = params.flowID;
        this.appName = params.appName;
        this.appID = params.appID;
        this.selected = false;
        // this.position = {x: params.pos.x, y: params.pos.y};
        this.groupPositionOffset = {x: params.offset.x, y: params.offset.y};
        this.workSpace = params.workSpace;
        this.flowActions = params.flowActions
    }
}