// Made by Jarrod Adair
//

// All data oriented stuff in this file
//
// eventually All twojs visual stuff in this file
var domElement = document.getElementById("main");

var two = new Two({
    // fullscreen: true,
    fitted: true,
    autostart: true,
    type: Two.Types.svg,
}).appendTo(domElement);

////////////////////////////////
//// HTML TopBar Stuff Here ////
////////////////////////////////

var treeRoot = new Tree("Root", TreeNodeTypes.R, "TreeRoot");

//////////////////////////////
///// File Reader stuff //////
//////////////////////////////

//try read previous save file from saves folder
ReadAppState();

var fileInputElement = document.getElementById("fileInput");
fileInputElement.addEventListener("change", () => {
    MultiFileReader(fileInputElement.files);

    // all file reading complete

    // write the current app state to the saves file in the saves folder. Used so dont have to import everything every time you open the app
    WriteAppState();
}, false);


////////////////////////////////////////////////////////////
// End File Reader stuff //
////////////////////////////////////////////////////////////


document.getElementById('workplaceSelect').addEventListener("change", (e) => {
    alert('selected "' + e.currentTarget.value + '" Workspace');
});


////////////////////////////////////
//// End HTML TopBar Stuff Here ////
////////////////////////////////////
////////////////////////////////////



var appObjectArray = [];
var globalObjectsArray = []; // This is the Global Master copy of every object in the scene. Includes element and raw data. Array structure: Physical Element, Data Structure
var objectAddBuffer = []; // Used for adding new objects to scenes //Used as a stack strucutre because O(1). Looked into a Queue structure but they O(n)

var nextAvailableUID = 0;  // this is the next avaliable uID number. This should increment any time a new twojs object is created, from groups to actual text objects, etc.
var stage = new Two.Group();
stage.id = "Stage Group";
stage.uID = nextAvailableUID;
nextAvailableUID++;

var connections = new Two.Group();
connections.id = "Connections Group";
connections.uID = nextAvailableUID;
nextAvailableUID++;

// let max = 1;//globalObjectsArray.length + 1; //currently used for creating connection lines


// add data object as attribute to flow group object.

// Create some buffer for this. When buffer updates, run this code to make new box and then remove it from buffer
function CreateVisualElement() {
// Creates the visual elements with twojs
    let batchCount = objectAddBuffer.length
    let appGroup;
    for (let i = 0; i < batchCount; i++) {
        let element = objectAddBuffer.pop();
        let data = element.data;

        appGroup = MakeAppElement(data);

        let group = MakeFlow(data);

        element.object = group;
        group.dataStructure = data;
        appGroup.add(group);
        stage.add(appGroup);
        AddFlowGroupToBeCalculated(group);
    }
    CalculateFlowInAppOffset(appGroup);

    // connections aren't part of element group
    CreateFlowConnectionArrow();
}

// this order matters. determines draw layers
two.add(stage);
two.add(connections);
addZUI();
two.update();


// to test element positions
domElement.addEventListener('mousemove', event =>
{
    let bound = domElement.getBoundingClientRect();

    let x = event.clientX - bound.left - domElement.clientLeft;
    let y = event.clientY - bound.top - domElement.clientTop;

    console.warn("X: " + x);
    console.warn("Y: " + y);
    // context.fillRect(x, y, 16, 16);
});