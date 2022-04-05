// Made by Jarrod Adair
//
// TODO LIST //
// create view for focused elements
// Should move/ split up this main file into a data file. So there will be a main file for hooking everything together, data for everything data and Object_Functions for everything physical Two.js elements
// work on Actions class
// create html banner elements
// develop workspace scene switching
// make temp app selection
// figure out how apps with nested flows will look like
// work on XML parsing



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
var connections = new Two.Group();

let max = 1;//globalObjectsArray.length;


// currently for testing purposes
// will make more dynamic in future
// make x data objects
//
// set this up so that when a XMLfile is parsed, it will generate the positions and all data required to display the boxes with twojs
// for (let index = 0; index < max; index++) {
//   let xGroupOffset = 75 + 75 * index;
//   let yGroupOffset = 75 + (75 * index % 300);
//   var data = new DataStructure({flowName: "object: " + index, flowID: "1234567", offset:{x: xGroupOffset, y: yGroupOffset} }); // test Data structure object
//   globalObjectsArray.push({object: undefined, data: data});
// }



// Create some buffer for this. When buffer updates, run this code to make new box and then remove it from buffer
function CreateVisualElement() {
// Creates the visual elements with twojs
  let batchCount = objectAddBuffer.length
  for (let i = 0; i < batchCount; i++) {
    let element = objectAddBuffer.pop();
    let data = element.data;
    // let data = globalObjectsArray[i].data;

    let appGroup = MakeAppElement(data);
    let group = MakeElement(data);

    element.object = group;
    appGroup.add(group);

    stage.add(appGroup);
    // objectGroupsArray.push(group) // dunno what this is??
  }
}


two.add(connections);
two.add(stage);
addZUI();
two.update();



// function ReadFile(file) {
//   console.log("file Changed");
  
//   if (file) {
//     freader.readAsText(file);
//   }

//   // close() releases file reader and all its resources.
//   // freader.close();
// }


