// this file needs to be able to read XML files and serialise already read xml files such that it'll be able to reopen it when the webpage is reloaded

let filesParsed = 0;
let parser = new DOMParser();
let xmlDoc;

///////////////////////////
//   Podio API Parsing   //
///////////////////////////

// make this into a function that is called from some html button to use podio API instead of local file. Could possibly do this logic on the server when user authenitcates, giving them choice between podio api and file
var httpRequest = new XMLHttpRequest;
httpRequest.onreadystatechange = function(){
    if (httpRequest.readyState === 4) { // Request is done
        if (httpRequest.status === 200) { // successfully
            startPodioAPIParse(httpRequest.responseText); // We're calling our method
        }
    }
};
httpRequest.open('GET', "/src/php/GlobiflowAPIHandler.php?apiType=getSpace", true);
httpRequest.send();


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
        
        // CalculateConnections(/*param of flow to find connections to and from here*/ "test");
        GenerateDataStructure(data);

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
        // const stepData = 
        let stepType = GetNodeData(step, "stepType");
        let stepFunction = GetNodeData(step, "stepFunction");
        let stepDetails = ParseActionDetails( Base64Decode( GetNodeData(step, "stepDetails") ));
        switch (stepType) {
            case "F":   // Filter
                action = new Action({
                    actionName: "",
                    stepID: i,
                    actionType: stepFunction,
                    actionDetails: stepDetails,
                    nextAction: undefined,
                })
                break;
            
            case "A":   // Action
                action = new Action({
                    actionName: "",
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
    // let tokens = stepDetails.split(";");
    let tokens = [];
    let tempTokens = stepDetails.split(/(\w+)(?=";)/g);
    for (let i = 1; i < tempTokens.length; i+=2) {
        const element = tempTokens[i];
        tokens.push(element);    
    }
    // tokens[0] = tokens[0].split("{")[1];
    // tokens.pop();

    let i = 0;
    while (i < tokens.length) {

        if (tokens[i].includes("andOr")) {
            result.push(tokens[i+1]);
        }

        if (tokens[i].includes("stepFunction")) {
            result.push(tokens[i+1]);
        }

        if (tokens[i].includes("field")) {
            result.push(tokens[i+1]);
        }

        if (tokens[i].includes("operator")) {
            result.push(tokens[i+1]);
        }

        if (tokens[i].includes("value")) {
            result.push(tokens[i+1]);
        }

        if (tokens[i].includes("varName")) {
            result.push(tokens[i+1]);
        }

        // if (tokens[i].includes("eval")) {   // dont know if eval is needed
        //     result.push(tokens[i]);
        // }

        
        
        i+=2;
    }

    // "a:1:{s:12:"stepFunction";s:9:"waitDelay";}"
    // "a:3:{s:5:"andOr";s:3:"and";s:12:"stepFunction";s:12:"fieldChanged";s:5:"field";s:9:"194969106";}"
    // "a:5:{s:5:"andOr";s:3:"and";s:12:"stepFunction";s:15:"fieldValueMatch";s:5:"field";s:9:"194969106";s:8:"operator";s:2:"eq";s:5:"value";s:8:"Complete";}"
    

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