//
// All Physical element stuff in this file
//

let currentlyOpenedGroup;
let currentlyOpenedAppGroup;

// Make a new object. This is the base call that will call further functions to construct the final object
function MakeFlow(currentObj) {
    let group = two.makeGroup();
    group.id = "Flow Group";
    group.visible = false;

    // group.position.x = currentObj.groupPositionOffset.x;
    // group.position.y = currentObj.groupPositionOffset.y;

    CreateFlow(group, currentObj);
    CreateFlowDetails(group, currentObj);

    // connections aren't part of element group
    CreateFlowConnectionArrow(currentObj);
    return group;
}

// draw object box from object data
function CreateFlow(group, currentObj) {
    let rect = two.makeRectangle(0, 0, flowSize, flowSize);
    rect.id = "Flow rect";
    two.update();
    group._renderer.elem.addEventListener('click', (e) => {two.update(); selectFlow(group);}, false);
    group.add(rect);

    // stage.add(rect);
}

// create all the details inside the object box
function CreateFlowDetails(group, currentObj) {
    let detailArray = [];
    // caching details
    let nameText = currentObj.flowName;
    let IDText = currentObj.flowID;
    let detailsArray = currentObj.flowActions;
    let testText = "";


    let nameTextObject = new Two.Text(nameText, 0, - 10, 'normal');
    nameTextObject.id = "nameTextObject";
    nameTextObject.size = 10;
    detailArray.push(nameTextObject);

    let IdTextObject = new Two.Text("ID: " + IDText, 0, 10, 'normal');
    IdTextObject.id = "IdTextObject";
    IdTextObject.size = 10;
    detailArray.push(IdTextObject);

    let actionsTitleObject = new Two.Text("Actions: ", 0, 0, 'normal');
    actionsTitleObject.id = "actionsTitleObject";
    actionsTitleObject.size = 10;
    actionsTitleObject.visible = false;
    detailArray.push(actionsTitleObject);

    for (let i = 0; i < detailsArray.length; i++) {
        let actionsObject = new Two.Text("* " + detailsArray[i].actionType, 0, 10 + (10*i), 'normal');
        actionsObject.id = "actionsObject";
        actionsObject.size = 10;
        actionsObject.visible = false;
        detailArray.push(actionsObject);
    }

    // let testTextObject = new Two.Text("test: " + testText, 0, 10, 'normal');
    // testTextObject.id = "testTextObject";
    // testTextObject.size = 10;
    // detailArray.push(testTextObject);


    // loop through all detailArray items and add them to group
    for (let index = 0; index < detailArray.length; index++) {
        const detail = detailArray[index];
        group.add(detail);

        // two.scene.add(detail);
        // stage.add(detail);
    }
}

// create all the connections between objects
function CreateFlowConnectionArrow(currentObj) {
    for (let j = 0; j < max; j++) {
        let obj = globalObjectsArray[j].data;
        let lineObj = two.makeLine(currentObj.groupPositionOffset.x, currentObj.groupPositionOffset.y, obj.groupPositionOffset.x, obj.groupPositionOffset.y);
        lineObj.id = "Connection Line";
        // stage.add(lineObj);
        connections.add(lineObj);
    }
}

// selects the element by scaling element group and performing other functions to make it look like its selected. All purely visual
function selectFlow(selectedGroup) {
    let operationDone = false;
    // let foundGroup = globalObjectsArray.find( ({ object }) => object === selectedGroup); // super inefficent, especially at larger search volumes. change this by reading groups dataStructure property   

    // close Elements
    if (currentlyOpenedGroup != undefined) { 
        if (currentlyOpenedGroup != selectedGroup) {
            CloseFlow(currentlyOpenedGroup, selectedGroup.dataStructure);
        }
        // maybe put below condition in an else from above condition
        if (selectedGroup.dataStructure.selected == true && operationDone != true) {
            CloseFlow(selectedGroup, selectedGroup.dataStructure);
            operationDone = true;
        }
    }

    // open Elements
    if (currentlyOpenedGroup == undefined) {
        if (selectedGroup.dataStructure.selected != true && operationDone != true) {
            Openflow(selectedGroup, selectedGroup.dataStructure);
            operationDone = true;
        }
    }

    // opens boxes. params: selectedGroup, foundGroup
    function Openflow(boxElem) {
        boxElem.children[0].matrix.manual = true;
        boxElem.children[0].matrix.scale(2, 4);
        boxElem.dataStructure.selected = true;
        FocusFlow(boxElem);
    
        currentlyOpenedGroup = boxElem;
    }

}

// has to be outside scope of selectElement function because closing apps uses this function
// closes boxes. params: selectedGroup, foundGroup
function CloseFlow(boxElem) {
    boxElem.children[0].matrix.scale(0.5, 0.25);
    two.update();
    boxElem.children[0].matrix.manual = false;
    boxElem.dataStructure.selected = false;
    deFocusFlow(boxElem);

    currentlyOpenedGroup = undefined;
}

// shows all extra details from flow 
function FocusFlow(boxElem) {
    // let focusElement = boxElem.children[1];
    // boxElem.parent.children.shift(boxElem.parent.children.unshift());

    //adjust the 3 quick display text to focused extended view
    boxElem.children[1].position.set(0, -70);
    boxElem.children[2].position.set(0, -40);
    // boxElem.children[3].position.set(0, -20);

    
    // i = 4, this is because the quick display text is always visible. Only the flows hidden extra details should be shown
    for (let i = 3; i < boxElem.children.length; i++) {
        const element = boxElem.children[i];      
        element.visible = true;
    }
    two.update();
}


// hides all extra details from flow
function deFocusFlow(boxElem) {
    
    //adjust the 3 quick display text back to original quick display locations
    boxElem.children[1].position.set(0, -10);
    boxElem.children[2].position.set(0, 0);
    // boxElem.children[3].position.set(0, 10);


    // i = 4, this is because the quick display text is always visible. Only the flows hidden extra details should be shown
    for (let i = 3; i < boxElem.children.length; i++) {
        const element = boxElem.children[i];
        element.visible = false;
    }
    two.update();
}

/////////////// App element stuff ///////////

// Make a new app object. This is the base call that will call further functions to construct the final app object
function MakeAppElement(currentObjData) {
    // AddNewApp(currentObjData);// only adds html content right now. no vital functionality
    let groupExist = CheckAppExists(currentObjData.appID);
    let group;
    if (groupExist) {
        group = GetAppGroupInGlobalObjects(currentObjData);
    } else {
        group = two.makeGroup();
        group.id = "App Group";

        SetAppOffsets(group, currentObjData.groupPositionOffset.x, currentObjData.groupPositionOffset.y)


        CreateAppElement(group, currentObjData);
        CreateAppDetails(group, currentObjData);
        appObjectArray.push(group);
    }



    return group;
}

// function GetAppGroupInGlobalObjects(currentObjData) {
//     return globalObjectsArray.find( (app) => {app.data.appID === currentObjData.appID} );
// }

function GetAppGroupInGlobalObjects(currentObjData) {
    for (let i = 0; i < globalObjectsArray.length; i++) {
        const currentApp = globalObjectsArray[i].object;
        if (currentApp != undefined) {
            if (currentApp.dataStructure.appID == currentObjData.appID) {
                return currentApp.parent;
            }
        }
    }
}


function CreateAppElement(group, currentObjData) {
    let rect = two.makeRectangle(0, 0, appSize, appSize);
    rect.id = "App rect";
    // rect.verticies
    two.update();
    rect._renderer.elem.addEventListener('click', (e) => {two.update(); SelectApp(group);}, false);
    group.add(rect);
}

function CreateAppDetails(group, currentObjData) {
    let nameTextObject = new Two.Text(currentObjData.appName, 0, (-(appSize/2)+17), 'normal');
    nameTextObject.id = "nameTextObject";
    nameTextObject.size = 15;

    group.add(nameTextObject);
    // detailArray.push(nameTextObject);
}

// App Nodes will be square and when clicked on will morph into a big circle
function SelectApp(currentAppGroup) {
    // console.log("Group Selected!");

    let operationDone = false;
    // let foundGroup = globalObjectsArray.find( ({ object }) => object === selectedGroup); // super inefficent, especially at larger search volumes    

    // close Elements
    if (currentlyOpenedAppGroup != undefined) { 
        if (currentlyOpenedAppGroup != currentAppGroup) {
            // CloseBox(currentlyOpenedAppGroup, foundGroup);
            CloseApp(currentlyOpenedAppGroup);
        } else {
            if (operationDone != true) {
                // CloseBox(selectedGroup, foundGroup);
                CloseApp(currentAppGroup);
                operationDone = true;
            }
        }
    }

    // open Elements
    if (currentlyOpenedAppGroup == undefined) {
        if (operationDone != true) {
            // OpenBox(selectedGroup, foundGroup);
            OpenApp(currentAppGroup);
            operationDone = true;
        }
    }

    function OpenApp(currentAppGroup) {
        currentAppGroup.matrix.manual = true;
        currentAppGroup.matrix.scale(2, 2);
        FocusApp(currentAppGroup);

        currentlyOpenedAppGroup = currentAppGroup;
    }

    function CloseApp(currentAppGroup) {
        currentAppGroup.matrix.scale(0.5, 0.5);
        two.update();
        currentAppGroup.matrix.manual = false;
        deFocusApp(currentAppGroup);

        currentlyOpenedAppGroup = undefined;
    }
}

// shows all extra details from app 
function FocusApp(appElem) {
    for (let i = 0; i < appElem.children.length; i++) {
        const element = appElem.children[i];
        if (element.id == "Flow Group") {
            element.visible = true;
        }
    }
    two.update();
}

// hides all extra details from app
function deFocusApp(appElem) {
    for (let i = 0; i < appElem.children.length; i++) {
        const element = appElem.children[i];
        if (element.id == "Flow Group") {
            if (element.dataStructure.selected) {
                CloseFlow(element, element.dataStructure);
            }
            element.visible = false;
        }
    }
    two.update();
}




// ZUI is all the zoom and pan functionality
function addZUI() {
    var zuiStage = new Two.ZUI(stage); // forground elements
    var zuiConnections = new Two.ZUI(connections); // background line connection elements
    var mouse = new Two.Vector();
  
    zuiStage.addLimits(0.06, 8);
    zuiConnections.addLimits(0.06, 8);
  
    domElement.addEventListener('mousedown', mousedown, false);
    domElement.addEventListener('mousewheel', mousewheel, {passive: true});
    domElement.addEventListener('wheel', mousewheel, {passive: true});


    function mousedown(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        window.addEventListener('mousemove', mousemove, false);
        window.addEventListener('mouseup', mouseup, false);
    }
    
    function mousemove(e) {
        if (!e.altKey) {
            var dx = e.clientX - mouse.x;
            var dy = e.clientY - mouse.y;
            zuiStage.translateSurface(dx, dy);
            zuiConnections.translateSurface(dx, dy);
            mouse.set(e.clientX, e.clientY);
        }
    }
    
    function mouseup(e) {
        window.removeEventListener('mousemove', mousemove, false);
        window.removeEventListener('mouseup', mouseup, false);
    }
  
    function mousewheel(e) {
        if (!e.altKey) {
            var dy = (e.wheelDeltaY || - e.deltaY) / 1000;
            zuiStage.zoomBy(dy, e.clientX, e.clientY);
            zuiConnections.zoomBy(dy, e.clientX, e.clientY);
        }
    }
  }