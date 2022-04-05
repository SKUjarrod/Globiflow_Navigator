//
// All Physical element stuff in this file
//

let currentlyOpenedGroup;

// Make a new object. This is the base call that will call further functions to construct the final object
function MakeElement(currentObj) {
    let group = two.makeGroup();
    group.position.x = currentObj.groupPositionOffset.x;
    group.position.y = currentObj.groupPositionOffset.y;

    CreateElement(group, currentObj);
    CreateElementDetails(group, currentObj);

    // connections aren't part of element group
    CreateElementConnectionArrow(currentObj);
    return group;
}

// draw object box from object data
function CreateElement(group, currentObj) {
    let rect = two.makeRectangle(0, 0, 50, 50);
    two.update();
    group._renderer.elem.addEventListener('click', (e) => {two.update(); selectElement(group);}, false);
    group.add(rect);

    // stage.add(rect);
}

// create all the details inside the object box
function CreateElementDetails(group, currentObj) {
    let detailArray = [];
    // caching details
    let nameText = currentObj.flowName;
    let IdText = currentObj.flowID;
    let TestText = "";


    let nameTextObject = new Two.Text(nameText, 0, - 10, 'normal');
    nameTextObject.size = 10;
    detailArray.push(nameTextObject);

    let IdTextObject = new Two.Text("ID: " + IdText, 0, 0, 'normal');
    IdTextObject.size = 10;
    detailArray.push(IdTextObject);

    let testTextObject = new Two.Text("test: " + TestText, 0, 10, 'normal');
    testTextObject.size = 10;
    detailArray.push(testTextObject);


    // loop through all detailArray items and add them to group
    for (let index = 0; index < detailArray.length; index++) {
        const detail = detailArray[index];
        group.add(detail);

        // two.scene.add(detail);
        // stage.add(detail);
    }
}

// create all the connections between objects
function CreateElementConnectionArrow(currentObj) {
    for (let j = 0; j < max; j++) {
        let obj = globalObjectsArray[j].data;
        let lineObj = two.makeLine(currentObj.groupPositionOffset.x, currentObj.groupPositionOffset.y, obj.groupPositionOffset.x, obj.groupPositionOffset.y);

        // stage.add(lineObj);
        connections.add(lineObj);
    }
}


// selects the element by scaling element group and performing other functions to make it look like its selected. All purely visual
function selectElement(selectedGroup) {
    let operationDone = false;
    let foundGroup = globalObjectsArray.find( ({ object }) => object === selectedGroup); // super inefficent, especially at larger search volumes    

    // close Elements
    if (currentlyOpenedGroup != undefined) { 
        if (currentlyOpenedGroup != selectedGroup) {
            CloseBox(currentlyOpenedGroup, foundGroup);
        }
        if (foundGroup.data.selected == true && operationDone != true) {
            CloseBox(selectedGroup, foundGroup);
            operationDone = true;
        }
    }

    // open Elements
    if (currentlyOpenedGroup == undefined) {
        if (foundGroup.data.selected != true && operationDone != true) {
            OpenBox(selectedGroup, foundGroup);
            operationDone = true;
        }
    }

    // opens boxes. params: selectedGroup, foundGroup
    function OpenBox(boxElem, dataGroup) {
        boxElem.children[0].matrix.manual = true;
        boxElem.children[0].matrix.scale(2, 4);
        dataGroup.data.selected = true;
        FocusElement(boxElem, dataGroup);

        currentlyOpenedGroup = boxElem;
    }
    
    // closes boxes. params: selectedGroup, foundGroup
    function CloseBox(boxElem, dataGroup) {
        boxElem.children[0].matrix.scale(0.5, 0.25);
        two.update();
        boxElem.children[0].matrix.manual = false;
        dataGroup.data.selected = false;
        deFocusElement(boxElem, dataGroup);

        currentlyOpenedGroup = undefined;
    }

}

// shows all extra details from flow 
function FocusElement(boxElem, data) {
    
    //adjust the 3 quick display text to focused extended view
    boxElem.children[1].position.set(0, -50);
    boxElem.children[2].position.set(0, 0);
    boxElem.children[3].position.set(0, 20);


    // i = 4, this is because the quick display text is always visible. Only the flows hidden extra details should be shown
    for (let i = 4; i < boxElem.children.length; i++) {
        const element = boxElem.children[i];
        element.visible = false;
    }
    two.update();
}


// hides all extra details from flow
function deFocusElement(boxElem, data) {
    
    //adjust the 3 quick display text back to original quick display locations
    boxElem.children[1].position.set(0, -10);
    boxElem.children[2].position.set(0, 0);
    boxElem.children[3].position.set(0, 10);


    // i = 4, this is because the quick display text is always visible. Only the flows hidden extra details should be shown
    for (let i = 4; i < boxElem.children.length; i++) {
        const element = boxElem.children[i];
        element.visible = true;
    }
    two.update();
}



function MakeAppElement(currentObjData) {
    let groupExist = CheckAppExists(currentObjData.appID); // this is here because want to check for apps that already exist in globalObjectsArray. If it was after it would always find the app when it doesn't exist
    let group;// = GetAppGroup(currentObj.appID)
    if (groupExist) {
        group = GetAppGroup(currentObjData).object;
    } else {
        group = two.makeGroup();
        
        group.position.x = currentObjData.groupPositionOffset.x;
        group.position.y = currentObjData.groupPositionOffset.y;

        CreateAppElement(group, currentObjData);
        CreateAppDetails();
        appObjectArray.push(group);
    }



    return group;
}

function CreateAppElement(group, currentObjData) {
    let rect = two.makeRectangle(0, 0, 200, 200);
    // rect.verticies
    two.update();
    group._renderer.elem.addEventListener('click', (e) => {two.update(); SelectApp(group);}, false);
    group.add(rect);
}

function GetAppGroup(currentObjData) {
    return globalObjectsArray.find((element) => {return element.data.appID === currentObjData.appID});
    // globalObjectsArray.forEach(element => {
    //     console.log(element.data.appID === currentObjData.appID);
    //     if (element.data.appID === currentObjData.appID) {
    //         return element;
    //     }
    // });
}

function CreateAppDetails(params) {
    
}

function SelectApp(currentAppGroup) {
    

    function OpenApp(params) {

    }

    function CloseApp(params) {
        
    }
}





// ZUI is all the zoom and pan functionality
function addZUI() {
    var zuiStage = new Two.ZUI(stage); // forground elements
    var zuiConnections = new Two.ZUI(connections); // background line connection elements
    var mouse = new Two.Vector();
  
    zuiStage.addLimits(0.06, 8);
    zuiConnections.addLimits(0.06, 8);
  
    domElement.addEventListener('mousedown', mousedown, false);
    domElement.addEventListener('mousewheel', mousewheel, false);
    domElement.addEventListener('wheel', mousewheel, false);
  
    function mousedown(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      window.addEventListener('mousemove', mousemove, false);
      window.addEventListener('mouseup', mouseup, false);
    }
    
    function mousemove(e) {
      var dx = e.clientX - mouse.x;
      var dy = e.clientY - mouse.y;
      zuiStage.translateSurface(dx, dy);
      zuiConnections.translateSurface(dx, dy);
      mouse.set(e.clientX, e.clientY);
    }
    
    function mouseup(e) {
      window.removeEventListener('mousemove', mousemove, false);
      window.removeEventListener('mouseup', mouseup, false);
      // two.update();
    }
  
    function mousewheel(e) {
      var dy = (e.wheelDeltaY || - e.deltaY) / 1000;
      zuiStage.zoomBy(dy, e.clientX, e.clientY);
      zuiConnections.zoomBy(dy, e.clientX, e.clientY);
    }
  }