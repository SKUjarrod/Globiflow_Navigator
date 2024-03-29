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
    return {x: 500, y: 500};
    // return {x: Math.random()*1000, y: Math.random()*1000};
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


////////////|/////////////
//                      //
//   |-----|  |-----|   //
//---|  +  |--|  +  |---//
//   |-----|  |-----|   //
//                      //
////////////|/////////////


/////////////|/////////////
//                       //
//|-----|                //
//|  +  |///////||/////////
//|-----|                //
//                       //
/////////////|/////////////


let appsToBeCalculated = [];

// flows get added to a buffer. At end of batch visual creation in main.js flow offsets are calculated. If at least one flow in an app group need calculating everything flow offset in app is to be recalculated
function CalculateFlowInAppOffset() {
    for (let app = 0; app < appsToBeCalculated.length; app++) {
        // need to change how appsToBeCalculated is added to array. // this may have already been done. Not sure??
        let flows = GetFlowGroupsInAppObject(appsToBeCalculated[app]);
        
        let slots = [];    // [X][Y]
        
        let numFitX = Math.floor((appSize - appInnerPadding * 2) / flowSize);
        numFitX > flows.length ? numFitX = flows.length : numFitX;
        let spaceBetween = ((appSize-(flowSize*numFitX))/numFitX) / 2 + appInnerPadding;
        let numFitY = (flows.length / numFitX >= 1) ? Math.ceil((flows.length / numFitX)) : Math.floor((flows.length / numFitX));

        let count = 0;
        for (let y = 1; y <= numFitY; y++) {
            for (let x = 1; x <= numFitX; x++) {
                slots[count] = { X: -(appSize/2) + appInnerPadding + (spaceBetween * x) + (flowSize*(x)), Y: -(appSize/2) + appTopOffset + (flowSize*(y)) };
                count++;
            }
        }

        for (let flow = 0; flow < flows.length; flow++) {
            let X = slots[flow].X - flowSize / 2;
            let Y = slots[flow].Y - flowSize / 2;
            SetFlowOffsets(flows[flow], X, Y);
        }
    }
    
    appsToBeCalculated = [];
    UpdateObjectGlobaltransform();
}

// adds a flows parent (App Group) to the array of apps that need to be recalculated
function AddFlowGroupToBeCalculated(flowGroup) {
    if (!appsToBeCalculated.includes(flowGroup.parent)) {
        appsToBeCalculated.push(flowGroup.parent);
    }
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

/**
 * 
 * @param {*} parentFlow is the flow that it is connected to or has a relation with
 * @returns a position that should be close to its parent flow
 */
function CalculateExternalEntityOffset(parentFlow) {
    // write the calculate position close to parentFlow position code

    return {x: parentFlow.groupPositionOffset.x + 350, y: parentFlow.groupPositionOffset.y};
}