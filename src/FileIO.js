
// reads multiple files recursevely, one by one
function MultiFileReader(files) {
    let freader = new FileReader();  
    function readFile(index) {
      if( index >= files.length ) return;
      var file = files[index];
      freader.onload = function(e) {  
        // get file content  
        var content = e.target.result;
        startXMLParse(file.name, content);
        two.update();
  
        // recurse next file in files array
        readFile(index+1)
      }
      freader.readAsText(file);
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