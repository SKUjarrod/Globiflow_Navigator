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
        
        let flowData = GenerateDataStructure(data);
        CalculateConnections(flowData.data);

        // CreateVisualElement(); // maybe move this to FileIO.js in the multi file reader function so it only runs once when all files have been read. Currently its not batching and running every file which isnt really batching
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

// get 
function GetActionData(actionDetails, actionName) {
    //(stepFunction) => {return stepDetails.find( (stepFunction,i) => {stepDetails[i+1]} )} // use step function in enum to determine what name type is. Then find name type e.g. VarName. When found name type then i+1 to get name type value
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
        workspace: readData._workSpace,
        flowActions: actions
    });

    let object = {object: undefined, data: dataStructure};
    globalObjectsArray.push(object);
    objectAddBuffer.push(object);



    // check if workspace exists or not here
    // if it doesn't exists then create a new root tree
    // if it does exists then add a new app onto it

    // tree.insert()
    // create tree node of datastructure here
    // tree.insert(0, 1, "test");


    
    return object;
    // Once flowDataStructure has been added to global arrays, create its app
}

// calculate the connections to and from a given flow for the GlobiflowDataStructure class for the flow object.
// this is to calculate where to draw lines 

// this function is going to be very complicated !!!!
// will have to search for key actions that use other flows e.g. triggerFlow action. go through every flow already created and find the flow that the action triggers, if it exists link it to the current
//  flow's connections through dataStructure class.
//  If it doesn't exists then create a placeholder dataStructure as it may not have been imported yet.
//  placeholder dataStructure must be created in a way that when it is imported, it must be able to link to that and just import data into dataStructure and not create a new object!
function CalculateConnections(Flow) {
    for (let i = 0; i < Flow.flowActions.length; i++) {
        const element = Flow.flowActions[i];
        
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
    for (let i = 0; i < tokens.length; i+=2) {
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

        if (element.includes("value")) {
            result.push([element, tokens[i+1]]);
        }

        if (element.includes("varName")) {
            result.push([element, tokens[i+1]]);
        }

        if (element.includes("eval")) {
            result.push([element, tokens.slice(i+1)]);
            i = tokens.length;
        }
    }

    return result;
}




///// this is all data oriented app stuff //////// dont know if all this is entirely nessessary. Maybe just the checkAppExists function should exist and modified to be less expensive, maybe search appArray instead of every objectArray

// Checks if a workspace has been created already
function CheckAppExists(currentAppID) {
    for (let i = 0; i < globalObjectsArray.length; i++) {
        const currentElementData = globalObjectsArray[i].object;
        if (currentElementData != undefined) {
            if (currentElementData.dataStructure.appID == currentAppID) {
                return true;
            }
        }
    }
    return false;
}

// Adds a new Workspace from a DataStructure into the HTML content
function AddNewApp(object) {
    let appExists = CheckAppExists(object.appID);
    let selectElement = document.getElementById('appSelect');
    
    // equals false, create new app html elements
    if (appExists == false) {
        var option = document.createElement("option");
        option.value = object.appName;
        option.text = object.appName;

        selectElement.appendChild(option);
    }
}

///////////////////////////////////////////////////