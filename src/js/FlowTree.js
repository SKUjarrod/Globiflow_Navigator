// use this class to represent the flows in a tree structure. Should be used to calculate the connection lines and will be useful for search function.
//
// search function can use a tree search algorithm and then return the negative path to any specific depth giving more or less refined search results
//
// connection lines can use this tree to search flows for keywords and connect flows that match 

class TreeNode {
    constructor (key, value = key, parent = null) {
        this.key = key;
        this.value = value;
        this.parent = parent;
        this.children = [];
    }
}

var RootNode = new TreeNode(0, "Root Node");