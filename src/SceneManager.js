var centerNode = undefined;

///////////////////
///////////////////
// App Stuff

function CalculateAppOffsets(AppGroup) {
    if (centerNode == undefined) {
        centerNode = AppGroup;
    }
    
    // calculate offsets from centre point here
    // DisparseAlgorithm(1);
    return {x: 0, y: 0};
}


//set new centre node
function SetNewCentreNode(node) {
    centerNode = node;
}

// calculate rings around centre node radiating outwards
function DisparseAlgorithm(ringNum) {

}

function SetAppOffsets(appGroup, X, Y) {
    appGroup.position.x = X;
    appGroup.position.y = Y;
}



///////////////////
///////////////////
// Flow stuff


let appsToBeCalculated = [];

// flows get added to a buffer. At end of batch visual creation in main.js flow offsets are calculated. If at least one flow in an app group need calculating everything flow offset in app is to be recalculated
function CalculateFlowInAppOffset() {
    // need to change how appsToBeCalculated is added to array. 
    for (let app = 0; app < appsToBeCalculated.length; app++) {
        let flows = GetFlowGroupsInAppObject(appsToBeCalculated[app]);        
        
        let flowSize = 50;//ElementSizes.flowSize;
        let appSize = 300;//ElementSizes.appSize;
        // let spaceBetween = appSize.height-(flowSize.height*appGroupChildren.length);
        
        for (let flow = 0; flow < flows.length; flow++) {  
            let X = 0 + (75 * flow);
            let Y = 0 + (75 * flow);
            
            


            SetFlowOffsets(flows[flow], X, Y);
        }
    }
        
    appsToBeCalculated = [];
}

function AddAppGroupToBeCalculated(appGroup) {
    appsToBeCalculated.push(appGroup);
}

function SetFlowOffsets(flowGroup, X, Y) {
    flowGroup.position.x = X;
    flowGroup.position.y = Y;
}

function GetFlowGroupsInAppObject(appGroup) {
    let flowGroups = [];
    for (let i = 0; i < appGroup.children.length; i++) {
        const element = appGroup.children[i];
        if (element.id === "Flow Group") {
            flowGroups.push(element);
        }
    }
    return flowGroups; 
}