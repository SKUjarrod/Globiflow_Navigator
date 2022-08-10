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
        data = ExtractDatafromXMLDOM(xmlDoc, fileName);
        
        // check if workspace exists here. Create new root tree here if doesn't exist

        let workspaceNode;
        if (!CheckWorkspaceExists(data._workSpace)) {
            workspaceNode = treeRoot.insert("Root", data._workSpace, TreeNodeTypes.W, data._workSpace);
        }

        let flowDataObject = GenerateDataStructure(data, workspaceNode);
        CalculateConnections(flowDataObject.data);

        // (maybe done?) maybe move this to FileIO.js in the multi file reader function so it only runs once when all files have been read. Currently its not batching and running every file which isnt really batching
        // CreateVisualElement(); 
        filesParsed++;
    }
}

// Extract Data from read XML Dom element to be used to generate data structure
function ExtractDatafromXMLDOM(XMLDOM, fileName) {
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
    data._flowID = fileName.match(/\d+/)[0];
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
function GenerateDataStructure(readData, workspaceNode) {
// generate app data structures in here too

    let actions = ParseActions(readData);

    let appOffset = CalculateAppOffsets(readData);

    var appDataStructure;

    var dataStructure = new FlowDataStructure({
        flowName: readData._flowName,
        flowID: readData._flowID,
        offset:{x: appOffset.x, y: appOffset.y},
        appID: readData._appID,
        appDataStructure: appDataStructure,
        description: readData._description,
        appName: readData._appName,
        workSpace: readData._workSpace,
        flowActions: actions,
        workspaceNode: workspaceNode,
        forwardConnections: [],
        backwardConnections: []
    });

    let object = {object: undefined, data: dataStructure};

    // check if a flow for an app has been imported yet
    if (!CheckAppExists(readData._appID)) {
        // app doesn't exist, create app and then flow under it

        appDataStructure = new AppDataStructure({
            appName: readData._appName,
            appID: readData._appID,
            offset:{x: appOffset.x, y: appOffset.y}
        })

        let node = treeRoot.find(readData._workSpace, TreeNodeTypes.W);
        object.data.appNode = treeRoot.insert(node.key, readData._appID, TreeNodeTypes.A, appDataStructure); // create app node
    }

    // (todo) update this so it starts search in workSpace. Can get workspace from readData
    // Check if flow is undiscovered or is uninitalised and needs to be populated
    let flowNode = treeRoot.findIn(readData._flowID, object.data.workspaceNode, TreeNodeTypes.U);
    if (flowNode !== undefined) {
        // node already exists but is uninitalised
        flowNode.updateTreeNode(readData._flowID, TreeNodeTypes.F, object, flowNode.parent);
    } else {
        // node doesn't exist
        let node = treeRoot.find(readData._appID, TreeNodeTypes.A)
        object.data.flowNode = treeRoot.insert(node.key, readData._flowID, TreeNodeTypes.F, object); // create flow node

    }

    for (let i = 0; i < actions.length; i++) {
        const element = actions[i];
        element.actionNode = treeRoot.insert(readData._flowID, i, TreeNodeTypes.Ac, element); // create action node
    }

    globalObjectsArray.push(object);
    objectAddBuffer.push(object);

    return object;
    // Once flowDataStructure has been added to global arrays, create its app
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
        let stepDetails = ParseActionDetails( Base64Decode( GetNodeData(step, "stepDetails") ).match(/(?<={)(.|\n| |\r)+(?=})/gm)[0]);
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

// this function parses Action details into something readable and in a format for the connection calculator to do something with
// takes in decoded base64 and returns array of details about step (Maybe, not sure of return format yet)
function ParseActionDetails(stepDetails) {
    let result = []; 

    let c = 0, bIndex = 0;
    let tokens = [];
    let stepBuffer = [];
    let active = false; // active means in progress of parsing a step. i.e. in between ""'s
    while (stepDetails[c] != undefined) {
        const char = stepDetails[c];
        if (!active) {
            // checks for " which is the beginning of a step
            if (char == '"') {
                active = true;
            }

            // checks for "{ }" pairs and push's them as tokens. used to indicate recursion on groups later
            if (char == '{' || char == '}') {
                tokens.push(char);
            }
        
        } else {
            // checks for a new line character. Used to parse rich text steps
            if (char == "\n") {
                tokens.push(stepBuffer.join(""));
                stepBuffer = [];
                bIndex = 0;
            }

            // checks for end of step
            if (char == '"') {
                active = false;
                tokens.push(stepBuffer.join(""));
                stepBuffer = [];
                bIndex = 0;
            } else {
                stepBuffer[bIndex] = char;
                bIndex++;    
            }
        }
        c++;
    }

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
            // recurse into substring of values indicated by pair of "{" & "}", add recursion into result
            // once finished recursion, remove the whole substring from tokens so it doesn't loop over recursed values

            let j = i+2;
            let bracketGroup = "{";
            while (tokens[j] !== "}") {
                bracketGroup += '"'+tokens[j]+'";';
                j++;
            }
            bracketGroup+="}";

            result.push([element, ParseActionDetails(bracketGroup)]);
            tokens.splice(i+1, j-i);
        }

        if (element == "flow") {
            result.push([element, tokens[i+1]]);
        }

        if (element.includes("app_")) {
            result.push([element, tokens[i+1]]);
        }

        if (element == "usePodioMail") {
        // add mail step stuff. Still yet to complete
            result.push([element, [ 
                [tokens[i+5], tokens[i+6]], 
                [tokens[i+7], tokens[i+8]], 
                [tokens[i+11], tokens[i+12]], 
                [tokens[i+13], tokens[i+14]], 
                [tokens[i+15], tokens[i+16]], 
                [tokens[i+17], tokens[i+18]] 
            ]]);
        }

        if (element == "message") {
            if (tokens[i+1].indexOf("\r") != -1) {
                result.push([element, tokens.filter( (token, i) => {return token.includes("\n")? token:undefined} )])
            } else {
                result.push([element, tokens[i+1]]);
            }
        }
    }

    return result;
}


// calculate the connections to and from a given flow for the GlobiflowDataStructure class for the flow object.
// this is to calculate where to draw lines
function CalculateConnections(flow) {
    for (let i = 0; i < flow.flowActions.length; i++) {
        const element = flow.flowActions[i];
        let actionKey, treeSearchResult, dataStructure;    
        switch (element.actionType) {
            case "value":
            
                break;
            
            // case "createMessage":
            
            //     break;

            case "sendEmail":
                // email key will be its subject. This is the most unique part of the email, i believe.
                actionKey = element.actionDetails[1][1][5][1];
                treeSearchResult = treeRoot.findIn(actionKey, flow.workspaceNode, TreeNodeTypes.EE);
                if (treeSearchResult !== undefined) {
                    // search result found

                    flow.forwardConnections.push(treeSearchResult);
                } else {
                    // flow hasn't been imported yet or errored
                    dataStructure = new ExternalEntityDataStructure({
                        entityKey: actionKey,
                        // entityName: readData.entityKey,
                        offset: CalculateExternalEntityOffset(flow)
                        // offset:{x: appOffset.x, y: appOffset.y},
                    });

                    let node = treeRoot.findIn(flow.workSpace, treeRoot.root, TreeNodeTypes.W)
                    // need to figure out what to put into tree node's value parameter.
                    flow.forwardConnections.push(treeRoot.insert(node.key, actionKey, TreeNodeTypes.EE, dataStructure)); // create empty External Entity node with actionKey key to connect too. Physical object will be created later                  
                }

                break;

            // this is for a flow updating a podio item in itself.
            // need to check if this is correct
            case "updateItem":
                // actionKey = flow.appNode.key;
                // update this connection to some sort of smooth loop connection arrow
                flow.forwardConnections.push(flow.appNode);
                break;
    
            // case "":
            
            //     break;

            case "getReferenced":
                // this is pulling data from an app. scope is app
                actionKey = element.actionDetails[1][1][1];
                treeSearchResult = treeRoot.findIn(actionKey, flow.workspaceNode, TreeNodeTypes.A);
                if (treeSearchResult !== undefined) {
                    // search result found

                    flow.forwardConnections.push(treeSearchResult);
                } else {
                    // flow hasn't been imported yet or errored

                    let node = treeRoot.findIn(flow.workSpace, treeRoot.root, TreeNodeTypes.W)
                    flow.forwardConnections.push(treeRoot.insert(node.key, actionKey, TreeNodeTypes.U, undefined)); // create empty flow node with temp actionKey key to import later
                }

                break;

            case "triggerSelf":
                actionKey = element.actionDetails[1][1][1];
                treeSearchResult = treeRoot.findIn(actionKey, flow.appNode, TreeNodeTypes.F);
                if (treeSearchResult !== undefined) {
                    // search result found

                    flow.forwardConnections.push(treeSearchResult);
                } else {
                    // flow hasn't been imported yet or errored

                    // maybe can move this to start search in app node
                    let node = treeRoot.findIn(flow.appID, flow.workspaceNode, TreeNodeTypes.A)
                    flow.forwardConnections.push(treeRoot.insert(node.key, actionKey, TreeNodeTypes.U, undefined)); // create empty flow node with temp actionKey key to import later
                }
                break;
        
            default:
                break;
        }
    }
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
            if (currentWorkspaceData.workSpace == workspace) {
                return true;
            }
        }
    }
    return false;
}

function CheckExternalEntityExists(entityKey) {
    let result = treeRoot.find(entityKey, TreeNodeTypes.EE);
    if (result != undefined)
        return true;

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