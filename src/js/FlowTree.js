// use this class to represent the flows in a tree structure. Should be used to calculate the connection lines and will be useful for search function.
//
// search function can use a tree search algorithm and then return the negative path to any specific depth giving more or less refined search results
//
// connection lines can use this tree to search flows for keywords and connect flows that match 


/**
 * Tree Node Class
 */
class TreeNode {
    /**
     * @param {*} key is UID for tree node
     * @param {*} type is type of tree node. Either (W)orkspace, (A)pp, (F)low
     * @param {*} value is datastructure object
     * @param {*} parent is parent tree node
     * @param {*} children is child tree nodes
     */
    constructor (key, type = null, value = key, parent = null) {
        this.key = key;
        this.type = type;
        this.value = value;
        this.parent = parent;
        this.children = [];
    }

    get isLeaf() {
        return this.children.length === 0;
    }

    get hasChildren() {
        return !this.isLeaf;
    }

    testValue(testValue) {
      if (testValue == this.value) {
        return true;
      }
      return false;
    }

    updateTreeNode(key, type = null, value = key, parent = null) {
      this.key = key;
      this.type = type;
      this.value = value;
      this.parent = parent;
  }
}


/**
 * Tree class
 */
class Tree {
  NodeCount = 0;
    /**
     * @param {*} key is UID for root of tree
     * @param {*} type is type of tree node. Either (W)orkspace, (A)pp, (F)low
     * @param {*} value is value for root of tree
     */
    constructor(key, type = null, value = key) {
        this.root = new TreeNode(key, type,value);
    }

    *preOrderTraversal(node = this.root) {
      yield node;
      if (node.children.length) {
        for (let child of node.children) {
          yield* this.preOrderTraversal(child);
        }
      }
    }
    
    *postOrderTraversal(node = this.root) {
      if (node.children.length) {
          for (let child of node.children) {
          yield* this.postOrderTraversal(child);
          }
      }
      yield node;
    }

    insert(parentNodeKey, key, type = null,  value = key) {
      for (let node of this.preOrderTraversal()) {
        if (node.key === parentNodeKey) {
          node.children.push(new TreeNode(key, type, value, node));
          this.NodeCount++;
          return node.children[node.children.length-1];
        }
      }
      return false;
    }
    
      remove(key) {
        for (let node of this.preOrderTraversal()) {
          const filtered = node.children.filter(c => c.key !== key);
          if (filtered.length !== node.children.length) {
            node.children = filtered;
            // only works if key is unique
            this.NodeCount--;
            return true;
          }
        }
        return false;
      }
    
      find(key, type = null) {
        for (let node of this.preOrderTraversal()) {
          if (node.key === key && node.type === type) return node;
        }
        return undefined;
      }

      /**
       * @param {*} key is what being searched for
       * @param {*} node is the node to start looking from
       * @param {*} type is the type of node searching for
       */
      findIn(key, node, type = null) {
        for (let fNode of this.preOrderTraversal(node)) {
          if (fNode.key === key && fNode.type === type) return fNode;
        }
        return undefined;
      }
}

const TreeNodeTypes = {
  R: "Root",
  W: "Workspace",
  A: "App",
  F: "Flow",
  U: "Uninitalised",
  Ac: "Action"
}