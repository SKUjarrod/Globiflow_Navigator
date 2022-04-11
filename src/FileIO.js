
// reads multiple files recursevely, one by one
function MultiFileReader(files) {
  let count = 0;
  let freader = new FileReader();  
    function readFile(index) {
      if( index >= files.length ) return;
      var file = files[index];
      freader.onload = function(e) {  
        // get file content  
        var content = e.target.result;
        startXMLParse(file.name, content);
        if (count == files.length) {
          CreateVisualElement(); // maybe move this to FileIO.js in the multi file reader function so it only runs once when all files have been read. Currently its not batching and running every file which isnt really batching
        }
        two.update();
  
        // recurse next file in files array
        readFile(index+1)
      }
      freader.readAsText(file);
      count++;
    }
    readFile(0);

    // freader.close();
}

// look at local storage to store app state.
function WriteAppState(FileContent) {
    // let blob = new Blob([FileContent], {type: "text/plain;charset=utf-8"});
    // saveAs(blob);

    // fs = require('fs');
    // localStorage.setItem
    return 0;
}

function ReadAppState() {
    // if file doesn't exists return error message
    // if () {

    // }
}