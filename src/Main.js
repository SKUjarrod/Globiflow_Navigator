// Made by Jarrod Adair
//
// TODO LIST //
// create view for focused elements
// work on Actions class
// create html banner elements
// develop workspace scene switching
// make temp app selection
// figure out how apps with nested flows will look like
// work on XML parsing

// Should move/ split up this main file into a data file. So there will be a main file for hooking everything together, data for everything data and Object_Functions for everything physical Two.js elements



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

//////////////////////////////
///// File Reader stuff //////
//////////////////////////////

//try read previous save file from saves folder
ReadAppState();

var fileInputElement = document.getElementById("fileInput");
fileInputElement.addEventListener("change", () => {
MultiFileReader(fileInputElement.files);

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
////////////////////////////////////////////////////////////



var globalObjectsArray = []; // This is the Global Master copy of every object in the scene. Includes element and raw data. Array structure: Physical Element, Data Structure
var objectAddBuffer = []; // Used as a stack strucutre because O(1). Looked into a Queue structure but they O(n)
var appObjectArray = [];
var stage = new Two.Group();
stage.id = "Stage Group";
var connections = new Two.Group();
connections.id = "Connections Group"

let max = 1;//globalObjectsArray.length + 1;



// Create some buffer for this. When buffer updates, run this code to make new box and then remove it from buffer
function CreateVisualElement() {
// Creates the visual elements with twojs
  let batchCount = objectAddBuffer.length
  for (let i = 0; i < batchCount; i++) {
    let element = objectAddBuffer.pop();
    let data = element.data;

    let appGroup = MakeAppElement(data);
    let group = MakeElement(data);

    element.object = group;
    appGroup.add(group);
  
    stage.add(appGroup);
  }
}


two.add(connections);
two.add(stage);
addZUI();
two.update();