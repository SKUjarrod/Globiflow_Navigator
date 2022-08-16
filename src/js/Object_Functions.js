//
// All Physical element stuff in this file
//



let currentlyOpenedGroup;
let currentlyOpenedAppGroup;


// Make a new object. This is the base call that will call further functions to construct the final object
function MakeFlow(currentObj) {
    let group = two.makeGroup();
    group.id = "Flow Group";
    group.uID = nextAvailableUID;
    nextAvailableUID++;
    group.visible = false;

    // group.position.x = currentObj.groupPositionOffset.x;
    // group.position.y = currentObj.groupPositionOffset.y;

    CreateFlow(group, currentObj);
    CreateFlowDetails(group, currentObj);

    // moved this to main. keep this just in case to revert back to original call pos
    // // connections aren't part of element group
    // CreateFlowConnectionArrow(currentObj);
    return group;
}

// draw object box from object data
function CreateFlow(group, currentObj) {
    let rect = two.makeRectangle(0, 0, flowSize, flowSize);
    rect.id = "Flow rect";
    rect.uID = nextAvailableUID;
    nextAvailableUID++;
    two.update();
    group._renderer.elem.addEventListener('click', (e) => {two.update(); selectFlow(group, e);}, false);
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

    let nameTextObject = new Two.Text(nameText, 0, - 10, 'normal');
    nameTextObject.id = "nameTextObject";
    nameTextObject.uID = nextAvailableUID;
    nextAvailableUID++
    nameTextObject.size = 10;
    detailArray.push(nameTextObject);

    let IdTextObject = new Two.Text("ID: " + IDText, 0, 10, 'normal');
    IdTextObject.id = "IdTextObject";
    IdTextObject.uID = nextAvailableUID;
    nextAvailableUID++;
    IdTextObject.size = 10;
    detailArray.push(IdTextObject);

    let actionsTitleObject = new Two.Text("Actions: ", 0, 0, 'normal');
    actionsTitleObject.id = "actionsTitleObject";
    actionsTitleObject.uID = nextAvailableUID;
    nextAvailableUID++;
    actionsTitleObject.size = 10;
    actionsTitleObject.visible = false;
    detailArray.push(actionsTitleObject);

    for (let i = 0; i < detailsArray.length; i++) {
        let actionsObject = new Two.Text("* " + detailsArray[i].actionType, 0, 10 + (10*i), 'normal');
        actionsObject.id = "actionsObject";
        actionsObject.uID = nextAvailableUID;
        nextAvailableUID++;
        actionsObject.size = 10;
        actionsObject.visible = false;
        detailArray.push(actionsObject);
    }

    // loop through all detailArray items and add them to group
    for (let index = 0; index < detailArray.length; index++) {
        const detail = detailArray[index];
        group.add(detail);
    }
}

// create all the connections between objects
function CreateFlowConnectionArrow() {
    connections.children.splice(0, connections.length);
    
    two.update();
    let nodes = [...treeRoot.preOrderTraversal()];
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].type == TreeNodeTypes.F && nodes[i].value.data != undefined && nodes[i].value.data.forwardConnections.length > 0) {
            
            for (let j = 0; j < nodes[i].value.data.forwardConnections.length; j++) {
                const connection = nodes[i].value.data.forwardConnections[j];
                if (connection.type != TreeNodeTypes.U) { /* dont know if need to check that the connection ref isn't itself */   

                    let connectionOffsetX;
                    let connectionOffsetY;

                    if (connection.value.data == undefined) {
                        connectionOffsetX = connection.value.groupPositionOffset.x;
                        connectionOffsetY = connection.value.groupPositionOffset.y;
                    } else {
                        connectionOffsetX = connection.value.data.groupPositionOffset.x;
                        connectionOffsetY = connection.value.data.groupPositionOffset.y;
                    }

                    let lineObj = two.makeLine(connectionOffsetX, connectionOffsetY, nodes[i].value.data.groupPositionOffset.x, nodes[i].value.data.groupPositionOffset.y);
                    lineObj.id = "Connection Line";
                    lineObj.uID = nextAvailableUID;
                    nextAvailableUID++;
                    connections.add(lineObj);
                }
            }
        }
    }
    two.update();
}

// selects the element by scaling element group and performing other functions to make it look like its selected. All purely visual
function selectFlow(selectedGroup, e) {

    if (!e.altKey) {
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

let originalFlowOrderIndex = 0;

// shows all extra details from flow 
function FocusFlow(boxElem) {
    let orderArrayRef = boxElem.parent.children;
    let temp = orderArrayRef.find(function(Elem, index) {
        originalFlowOrderIndex = index;
        return Elem.uID === boxElem.uID;
    });

    orderArrayRef.splice(originalFlowOrderIndex, 1);
    orderArrayRef.unshift(temp);

    // use getBoundingClientRect() function to find bounding box of flow. Do some magic and make it size perfectly

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
    
    let orderArrayRef = boxElem.parent.children;
    let elem = orderArrayRef.shift();
    orderArrayRef.splice(originalFlowOrderIndex, 0, elem);

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
        group.uID = nextAvailableUID;
        nextAvailableUID++;

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
    rect.uID = nextAvailableUID;
    nextAvailableUID++;
    
    // rect.verticies
    two.update();
    rect._renderer.elem.addEventListener('click', (e) => {two.update(); SelectApp(group, e);}, false);
    group.add(rect);
}

function CreateAppDetails(group, currentObjData) {
    let nameTextObject = new Two.Text(currentObjData.appName, 0, (-(appSize/2)+17), 'normal');
    nameTextObject.id = "nameTextObject";
    nameTextObject.uID = nextAvailableUID;
    nextAvailableUID++;
    nameTextObject.size = 15;

    group.add(nameTextObject);
    // detailArray.push(nameTextObject);
}

// App Nodes will be square and when clicked on will morph into a big circle
function SelectApp(currentAppGroup, e) {

    if (!e.altKey) {
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

            // for (let i = 0; i < currentAppGroup.children.length; i++) {
            //     const element = currentAppGroup.children[i];
            //     if (element.id == "Flow Group") {

            //     }
                
            // }
            UpdateObjectGlobaltransform();

            currentlyOpenedAppGroup = currentAppGroup;
        }

        function CloseApp(currentAppGroup) {
            currentAppGroup.matrix.scale(0.5, 0.5);
            two.update();
            currentAppGroup.matrix.manual = false;
            deFocusApp(currentAppGroup);

            currentlyOpenedAppGroup = undefined;
            UpdateObjectGlobaltransform();
        }

        CreateFlowConnectionArrow();
    }
}

let originalAppOrderIndex = 0;

// shows all extra details from app 
function FocusApp(appElem) {
    let orderArrayRef = appElem.parent.children;
    let temp = orderArrayRef.find(function(Elem, index) {
        originalAppOrderIndex = index;
        return Elem.uID === appElem.uID;
    });

    orderArrayRef.splice(originalAppOrderIndex, 1);
    orderArrayRef.unshift(temp);

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

    let orderArrayRef = appElem.parent.children;
    let elem = orderArrayRef.shift();
    orderArrayRef.splice(originalAppOrderIndex, 0, elem);

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

/////////////// External Entity stuff ///////////

// write this function to create an generic external entity for things such as people that emails send too and comments to specific people
function MakeExternalEntity(Data) {
    let groupExist = CheckExternalEntityExists(Data.entityKey);
    let group;
    if (groupExist) {
        group = GetAppGroupInGlobalObjects(Data);
    } else {
        group = two.makeGroup();
        group.id = "External Entity Group";
        group.uID = nextAvailableUID;
        nextAvailableUID++;

        SetAppOffsets(group, Data.value.groupPositionOffset.x, Data.value.groupPositionOffset.y)


        CreateExternalEntityElement(group, Data);
        CreateExternalEntityDetails(group, Data);
        // appObjectArray.push(group);
    }

    return group;

    function CreateExternalEntityElement(group, currentObjData) {
        let rect = two.makeRectangle(0, 0, externalEntitySize, externalEntitySize);
        rect.id = "entity rect";
        rect.uID = nextAvailableUID;
        nextAvailableUID++;
        
        // rect.verticies
        two.update();
        // rect._renderer.elem.addEventListener('click', (e) => {two.update(); SelectApp(group, e);}, false);
        group.add(rect);
    }

    function CreateExternalEntityDetails(params) {
        // add details into entity here
    }

}

/////////////// End visual creation stuff ///////////



// (todo) fix issue with scaling. Might have to do some matrix calculations
// set the data partion of the flow object to be the global transform of the object
function UpdateObjectGlobaltransform() {
    two.update();
    let nodes = [...treeRoot.preOrderTraversal()];
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].type == TreeNodeTypes.F && nodes[i].value.data != undefined) {
            let element = nodes[i].value.object;
            let DOMRect = element.getBoundingClientRect();

            // new Matrix();
            let matrixStage = zuiStage.surfaceMatrix;

            let matrixTranslate = new Matrix();
            // Matrix(1, 0, 0, 0, (DOMRect.left + (DOMRect.width / 2)), (DOMRect.top + (DOMRect.height / 2)), 0, 0, 1);
            let matrixScale = new Matrix((1-matrixStage.elements[0] * 1), 0, 0, 0, (1), 0, 0, 0, 1);

            let newMatrix = Matrix.Multiply(matrixStage, matrixTranslate, matrixScale)

            nodes[i].value.data.groupPositionOffset.x = newMatrix.elements[5];
            nodes[i].value.data.groupPositionOffset.y = newMatrix.elements[6];


            // nodes[i].value.data.groupPositionOffset.x = ((DOMRect.left + (DOMRect.width / 2)) - zuiStage.surfaceMatrix.elements[2]) * zuiStage.surfaceMatrix.elements[0];
            // nodes[i].value.data.groupPositionOffset.y = ((DOMRect.top + (DOMRect.height / 2)) - zuiStage.surfaceMatrix.elements[5]) * zuiStage.surfaceMatrix.elements[4] ;
        }
    }  
}


// to update for scale, forumla is:
//

/* 

stage group m0 | m3 (should be the same value is scaled uniformly) 
(for minimising scale)
x' = 1-(Stage group) m0 * (child object) m4 - (stage group) m4
y' = 1-(stage group) m0

*/



// dont know if ZUI needs a uID, not sure if it creates a physical element in the DOM
// ZUI is all the zoom and pan functionality
function addZUI() {
    // var zuiStage = new Two.ZUI(stage); // forground elements
    // var zuiConnections = new Two.ZUI(connections); // background line connection elements
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