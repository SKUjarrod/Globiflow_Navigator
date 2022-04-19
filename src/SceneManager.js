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
    return {x: Math.random()*1000, y: Math.random()*1000};
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


/////////////|/////////////
//                      //
//   |-----|  |-----|   //
//   |  +  |  |  +  |   //
//   |-----|  |-----|   //
//                      //
/////////////|/////////////


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
    // need to change how appsToBeCalculated is added to array. 
    for (let app = 0; app < appsToBeCalculated.length; app++) {
        let flows = GetFlowGroupsInAppObject(appsToBeCalculated[app]);

        let spaceBetween = ((appSize-(flowSize*flows.length))/flows.length) / 2;// Space evently on each side of flow element - (appInnerPadding * 2);
        console.log(spaceBetween);

        for (let flow = 1; flow <= flows.length; flow++) {  
            let X = (-appSize/2) + ( (spaceBetween * flow) + ((flows.length == 1 ? flowSize/2 : flowSize) * flow ) % 200);
            let Y = (-appSize/2 + 20) + ( (spaceBetween * flow) + ((flows.length == 1 ? flowSize/2 : flowSize) * flow ) ); // 20px is the top text for a app
            
            // this is so close
            // let X = (-appSize/2 + flowSize + spaceBetween/2 + (spaceBetween * flow + flowSize * flow)); // -125 is exacly on the left inner wall
            // let Y = 20;//(-appSize/2 + flowSize + spaceBetween/2 + (spaceBetween * flow + flowSize * flow));// + (flowSize/2 - (appSize/2 - flowSize)) + ((flowSize * 0)% 150); // 20px is the top text for a app
            


            SetFlowOffsets(flows[flow-1], X, Y);
        }
    }
        
    appsToBeCalculated = [];
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