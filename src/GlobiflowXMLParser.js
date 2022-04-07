// this file needs to be able to read XML files and serialise already read xml files such that it'll be able to reopen it when the webpage is reloaded

let filesParsed = 0;    // // starts on 1 because
let parser = new DOMParser();
let xmlDoc;

// this is the base XMLParsing function. Call this to start a XML parse on a xml file that has been read into a string
function startXMLParse(fileName, XMLResult) {
    xmlDoc = parser.parseFromString(XMLResult, "text/xml");
    console.log(xmlDoc);
    
    let data = {};
    if (CheckFileCompatability(fileName, xmlDoc)) {
        data = ExtractDatafromXMLDOM(xmlDoc);
        
        
        // for loop here to loop through multiple XML files if needed. Not sure if this is needed yet
        // for (let index = 0; index < array.length; index++) {
            //     const element = array[index];
            
            // CalculateConnections(/*param of flow to find connections to and from here*/ "test");
            GenerateDataStructure(data);
            // }
            
        CreateVisualElement(); // maybe move this to FileIO.js in the multi file reader function so it only runs once when all files have been read. Currently its not batching and running every file which isnt really batching
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
    };
    


    let root = GetNodeData(XMLDOM, "root");
    let flow = GetNodeData(root, "flow");
    let steps = GetNodeData(root, "steps");

    data._flowName = GetNodeData(flow, "flowName");
    data._description = GetNodeData(flow, "description");
    data._appID = GetNodeData(flow, "podioAppId");
    data._appName = GetNodeData(flow, "appName");
    data._workSpace = workspaces.Tech;
    
    // xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    return data;
}


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

function GetNodeData(parent, elementName) {
    try {
        if (elementName == "root" || elementName == "flow" || elementName == "steps") {
            return parent.getElementsByTagName(elementName)[0];
        }
        return parent.getElementsByTagName(elementName)[0].childNodes[0].nodeValue;
    } catch (error) {
        if (elementName == "root" || elementName == "flow" || elementName == "steps") {
            console.log("Error! " + elementName + " Node must be empty");
        }
        if (parent.getElementsByTagName(elementName)[0].childNodes.length == 0) {
            console.log("Error! the " + elementName + " Node is empty.");
        }
        console.log(error);
        return null;
    }
}

// generate the GlobiflowDataStructure class for an object based on the parsed xml from a file
function GenerateDataStructure(readData) {
    ////// for testing purposes, calculate the x and y offsets here but they should be in main
    let xGroupOffset = -75 + 75 * filesParsed;
    let yGroupOffset = -75 + (75 * filesParsed % 300);
    //////////////
    var dataStructure = new DataStructure({
        flowName: readData._flowName,
        // flowID: readData._flowID,
        offset:{x: xGroupOffset, y: yGroupOffset},
        description: readData._description,
        appID: readData._appID,
        appName: readData._appName,
        workspace: readData._workSpace,
    });

    let object = {object: undefined, data: dataStructure};
    // AddNewApp(object); // this is here because want to check for apps that already exist in globalObjectsArray. If it was after it would always find the app when it doesn't exist
    globalObjectsArray.push(object);
    objectAddBuffer.push(object);
    // objectAddBuffer.push(dataStructure);


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
    let result;

    return result;
}

///// this is all data oriented app stuff //////// dont know if all this is entirely nessessary. Maybe just the checkAppExists function should exist and modified to be less expensive, maybe search appArray instead of every objectArray

// Checks if a workspace has been created already
function CheckAppExists(currentAppID) {
    for (let i = 0; i < globalObjectsArray.length; i++) {
        const currentElementData = globalObjectsArray[i].data;
        if ((currentElementData.appID == currentAppID) && (globalObjectsArray[i].object != undefined)) {
            return true;
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