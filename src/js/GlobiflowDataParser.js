// this file needs to be able to read XML files and serialise already read xml files such that it'll be able to reopen it when the webpage is reloaded

let filesParsed = 0;
let parser = new DOMParser();
let xmlDoc;

///////////////////////////
//   Podio API Parsing   //
///////////////////////////

// make this into a function that is called from some html button to use podio API instead of local file. Could possibly do this logic on the server when user authenitcates, giving them choice between podio api and file
// $('#AuthLink').click(getPodioData());
// if ($('#AuthMsg').filter(( elem ) => { return elem == "You were already authenticated and no authentication is needed." })) {getPodioData()};

var httpRequest = new XMLHttpRequest;
function getPodioData() {
    httpRequest.onreadystatechange = function(){
        if (httpRequest.readyState === 4) { // Request is done
            if (httpRequest.status === 200) { // successfully
            startPodioAPIParse(httpRequest.responseText); // We're calling our method
            }
        }
    };
    httpRequest.open('GET', "/src/php/GlobiflowAPIHandler.php?apiType=getSpace", true);
    httpRequest.send();
}
getPodioFlowData();

function getPodioFlowData() {
    httpRequest.onreadystatechange = function(){
        if (httpRequest.readyState === 4) { // Request is done
            if (httpRequest.status === 200) { // successfully
            startPodioAPIParse(httpRequest.responseText); // We're calling our method
        }
    }
};
httpRequest.open('GET', "/src/php/GlobiflowAPIHandler.php?apiType=getFlow", true);
httpRequest.send();
}


function startPodioAPIParse(data) {
    var apiData = JSON.parse(data);

    for (let i = 0; i < apiData.length; i++) {
        const space = apiData[i];
        for (let j = 0; j < space.spaceApps.length; j++) {
            const app = space.spaceApps[j];

            let data = {
                _flowName: '',
                _flowID: '',
                _description: '',
                _appID: app.appID,
                _appName: app.appName,
                _workSpace: space.spaceName,
                _actions: '',
            };
            
            GenerateDataStructure(data);
        }
    }
    // console.log(data);
}

////////////////////////
//    File Parsing    //
////////////////////////

// this is the base XMLParsing function. Call this to start a XML parse on a xml file that has been read into a string
function startXMLParse(fileName, XMLResult) {
    xmlDoc = parser.parseFromString(XMLResult, "text/xml");
    console.log(xmlDoc);
    
    let data = {};
    if (CheckFileCompatability(fileName, xmlDoc)) {
        data = ExtractDatafromXMLDOM(xmlDoc);
        
        // check if workspace exists here. Create new root tree here if doesn't exist

        if (!CheckWorkspaceExists(data._workSpace)) {
            treeRoot.insert("Root", data._workSpace, TreeNodeTypes.W, data._workSpace);
        }

        let flowDataObject = GenerateDataStructure(data);
        CalculateConnections(flowDataObject.data);

        // (maybe done?) maybe move this to FileIO.js in the multi file reader function so it only runs once when all files have been read. Currently its not batching and running every file which isnt really batching
        // CreateVisualElement(); 
        filesParsed++;
    }
}

// Extract Data from read XML Dom element to be used to generate data structure
function ExtractDatafromXMLDOM(XMLDOM) {
    let data = {
        _flowName: '',
        _flowID: '',
        _description: '',
        _appID: '',
        _appName: '',
        _workSpace: '',
        _actions: '',
    };

    let root = GetNodeData(XMLDOM, "root");
    let flow = GetNodeData(root, "flow");
    let steps = GetNodeData(root, "steps");

    data._flowName = GetNodeData(flow, "flowName");
    data._description = GetNodeData(flow, "description");
    data._appID = GetNodeData(flow, "podioAppId");
    data._appName = GetNodeData(flow, "appName");
    data._workSpace = workspaces.Tech;
    data._actions = steps;
    
    return data;
}

// checks if the file is compatible. Checks for certain nodes existing in XML doc
function CheckFileCompatability(fileName, doc) {
    try {
        if (GetNodeData(doc, "root")) {
            return true;
        } else {
            throw null;
        }
    } catch (error) {
            alert(fileName + " is Incompatible!");
            return false;
    }    
}

// gets a node from xml
function GetNodeData(parent, elementName) {
    try {
        if (elementName == "root" || elementName == "flow" || elementName == "steps") {
            return parent.getElementsByTagName(elementName)[0];
        }
        return parent.getElementsByTagName(elementName)[0].childNodes[0].nodeValue;
    } catch (error) {
        if (elementName == "root" || elementName == "flow" || elementName == "steps") {
            console.warn("Error! " + elementName + " Node must be empty");
        }
        if (parent.getElementsByTagName(elementName)[0].childNodes.length == 0) {
            console.warn("Error! the " + elementName + " Node is empty.");
        }
        console.warn(error);
        return null;
    }
}

// make enum of all actions names and a function that maps stepFunctions from flow json into action names
const actionNames = {
    customPrep: "varName",

}

// flatten action details array and search for a string
function GetActionData(actionDetails, actionName) {
    let enumResult = actionNames[actionName];
    let flatArray = actionDetails.flat(2);
    return flatArray[flatArray.indexOf(enumResult)+1];
}

// generate the GlobiflowDataStructure class for an object based on the parsed xml from a file
function GenerateDataStructure(readData) {

    let actions = ParseActions(readData);

    let appOffset = CalculateAppOffsets(readData);

    var dataStructure = new DataStructure({
        flowName: readData._flowName,
        // flowID: readData._flowID,
        offset:{x: appOffset.x, y: appOffset.y},
        description: readData._description,
        appID: readData._appID,
        appName: readData._appName,
        workSpace: readData._workSpace,
        flowActions: actions
    });

    let object = {object: undefined, data: dataStructure};

    // check if a flow for an app has been imported yet
    if (!CheckAppExists(readData._appID)) {
        // app doesn't exist, create app and then flow under it
        let node = treeRoot.find(readData._workSpace, TreeNodeTypes.W);
        treeRoot.insert(node.key, readData._appID, TreeNodeTypes.A, readData._appName); // create app node
    }

    let node = treeRoot.find(readData._appID, TreeNodeTypes.A)
    treeRoot.insert(node.key, readData._flowName, TreeNodeTypes.F, object); // create flow node

    for (let i = 0; i < actions.length; i++) {
        const element = actions[i];
        treeRoot.insert(readData._flowName, i, TreeNodeTypes.Ac, element); // create action node
    }

    globalObjectsArray.push(object);
    objectAddBuffer.push(object);

    return object;
    // Once flowDataStructure has been added to global arrays, create its app
}

// calculate the connections to and from a given flow for the GlobiflowDataStructure class for the flow object.
// this is to calculate where to draw lines

// will have to search for key actions that use other flows e.g. triggerFlow action. go through every flow already created and find the flow that the action triggers, if it exists link it to the current
//  flow's connections through dataStructure class.
//  If it doesn't exists then create a placeholder dataStructure as it may not have been imported yet.
//  placeholder dataStructure must be created in a way that when it is imported, it must be able to link to that and just import data into dataStructure and not create a new object!
function CalculateConnections(flow) {
    for (let i = 0; i < flow.flowActions.length; i++) {
        const element = flow.flowActions[i];
        switch (element.actionType) {
            case "value":
                
                break;

            case "createMessage":
            
                break;

            case "triggerSelf":
                let actionKey = element.actionDetails[1][1][1];
                let treeSearchResult = treeRoot.findIn(actionKey, treeRoot.root, TreeNodeTypes.A);
                if (treeSearchResult !== undefined) {
                    // search result found


                } else {
                    // flow hasn't been imported yet or errored

                    // (todo) fix up the node id
                    let node = treeRoot.find(flow.appID, TreeNodeTypes.A)
                    treeRoot.insert(node.key, flow.flowName, TreeNodeTypes.F, undefined); // create empty flow node to import later

                    // // maybe dont need this as tree was just searched above
                    // // check if a flow for an app has been imported yet
                    // if (!CheckAppExists(flow.appID)) {
                    //     // app doesn't exist, create app node for data to be imported later
                    //     let node = treeRoot.find(flow.workSpace, TreeNodeTypes.W);
                    //     treeRoot.insert(node.key, actionKey, TreeNodeTypes.A, flow.appName); // create app node
                    // } else {
                    //     // search result error
                    //     console.error("Calculating Connection Tree Search Failed\n Trace: "+console.trace(treeSearchResult));

                    // }
                }

                break
        
            default:
                break;
        }
    }
}

// decode a base64 encoded string
function Base64Decode(base64Encoded) {
    let result = atob(base64Encoded);

    return result;
}

function ParseActions(ActionsXML) {
    let actions = [];

    // loop over every step.
    // used base64Decode to decode the step details
    // return each step in actions array
    // create new Action classes for every action here and put in actions array
    // this function should be called from GenerateDataStructure so the actions are in an array

    let prevAction;
    for (let i = 0; i < ActionsXML._actions.childNodes.length; i++) {
        let action;

        const step = ActionsXML._actions.childNodes[i];
        let stepType = GetNodeData(step, "stepType");
        let stepFunction = GetNodeData(step, "stepFunction");
        let stepDetails = ParseActionDetails( Base64Decode( GetNodeData(step, "stepDetails") ));
        let stepName = GetActionData(stepDetails, stepFunction); 
        switch (stepType) {
            case "F":   // Filter
                action = new Action({
                    actionName: stepName,
                    stepID: i,
                    actionType: stepFunction,
                    actionDetails: stepDetails,
                    nextAction: undefined,
                })
                break;
            
            case "A":   // Action
                action = new Action({
                    actionName: stepName,  
                    stepID: i,
                    actionType: stepFunction,
                    actionDetails: stepDetails,
                    nextAction: undefined,
                })
                break;
        
            default:
                console.error("Error! Parsing Actions Failed on Function switcher!");
                break;
        }

        if (prevAction !== undefined) {
            prevAction.nextAction = action;
        }
        prevAction = action;
        actions.push(action);
    }

    return actions;
}

// this function parses Action details into something readable
// takes in decoded base64 and returns array of details about step (Maybe, not sure of return format yet)
function ParseActionDetails(stepDetails) {
    let result = [];    
    let tokens = stepDetails.match( new RegExp(/\w+(?=";){2}|(?<=\*)[\w_-]+(?=\*)/, 'g') );
    for (let i = 0; i < tokens.length; i++) {
        const element = tokens[i];

        if (element.includes("andOr")) {
            result.push([element, tokens[i+1]]);
        }

        if (element.includes("stepFunction")) {
            result.push([element, tokens[i+1]]);
        }

        if (element.includes("field")) {
            result.push([element, tokens[i+1]]);
        }

        if (element.includes("operator")) {
            result.push([element, tokens[i+1]]);
        }

        if (element == ("value")) {
            result.push([element, tokens[i+1]]);
        }

        if (element.includes("varName")) {
            result.push([element, tokens[i+1]]);
        }

        if (element.includes("eval")) {
            result.push([element, tokens.slice(i+1)]);
            i = tokens.length;
        }

        if (element == ("values")) {
            result.push([element, [tokens[i+1], tokens[i+2]]]);
        }
    }

    return result;
}

//// Check funtions ////

// Checks if a App has been created already
function CheckAppExists(currentAppID) {
    for (let i = 0; i < globalObjectsArray.length; i++) {
        const currentAppData = globalObjectsArray[i].data;
        const currentAppObject = globalObjectsArray[i].object;
        if (currentAppData != undefined && currentAppObject != undefined) {
            if (currentAppData.appID == currentAppID) {
                return true;
            }
        }
    }
    return false;
}

// Checks if a Workspace has already been created
// This uses data to check. This is pre object creation
function CheckWorkspaceExists(workspace) {
    for (let i = 0; i < globalObjectsArray.length; i++) {
        const currentWorkspaceData = globalObjectsArray[i].data;
        if (currentWorkspaceData != undefined) {
            if (currentWorkspaceData.workspace == workspace) {
                return true;
            }
        }
    }
    return false;
}

//////////////////////
//////////////////////



///// this is all data oriented app stuff //////// dont know if all this is entirely nessessary. Maybe just the checkAppExists function should exist and modified to be less expensive, maybe search appArray instead of every objectArray


// these are old versions of the function. Not 100% sure new one works for every case so keeping these here until 100% sure
// // Checks if a App has been created already
// function CheckAppDataExists(currentAppID) {
//     for (let i = 0; i < globalObjectsArray.length; i++) {
//         const currentAppData = globalObjectsArray[i].data;
//         if (currentAppData != undefined) {
//             if (currentAppData.appID == currentAppID) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }

// // Checks if a App has been created already
// function CheckAppObjectExists(currentAppID) {
//     for (let i = 0; i < globalObjectsArray.length; i++) {
//         const currentAppObject = globalObjectsArray[i].object;
//         if (currentAppObject != undefined) {
//             if (currentAppObject.dataStructure.appID == currentAppID) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }

// // Adds a new Workspace from a DataStructure into the HTML content
// function AddNewApp(object) {
//     let appExists = CheckAppExists(object.appID);
//     let selectElement = document.getElementById('appSelect');
    
//     // equals false, create new app html elements
//     if (appExists == false) {
//         var option = document.createElement("option");
//         option.value = object.appName;
//         option.text = object.appName;

//         selectElement.appendChild(option);
//     }
// }



///////////////////////////////////////////////////