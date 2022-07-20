// use this class to represent the flows in a tree structure. Should be used to calculate the connection lines and will be useful for search function.
//
// search function can use a tree search algorithm and then return the negative path to any specific depth giving more or less refined search results
//
// connection lines can use this tree to search flows for keywords and connect flows that match 

/*

                    ROOT NODE
                        |



*/


/**
 * Tree Node Class
 */
class TreeNode {
    /**
     * 
     * @param {*} key is UID for tree node
     * @param {*} value is datastructure object
     * @param {*} parent is parent tree node
     * @param {*} children is child tree nodes
     */
    constructor (key, value = key, parent = null) {
        this.key = key;
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
}

/**
 * Tree Action Node Class
 */
class TreeActionNode {
    /**
     * 
     * @param {*} key is UID for tree node
     * @param {*} value is datastructure object
     * @param {*} parent is parent tree node
     * @param {*} actionChildren is child actions of a node. Are in another dimension, should not have children that are other tree nodes
     */

    constructor (key, value = key, parent = null) {
        this.key = key;
        this.value = value;
        this.parent = parent;
        this.actionChildren = [];
    }

    get isLeaf() {
        return this.actionChildren.length === 0;
    }

    get hasChildren() {
        return !this.isLeaf;
    }
}

/**
 * Tree class
 */
class Tree {
    /**
     * 
     * @param {*} key is UID for root of tree
     * @param {*} value is value for root of tree
     */
    constructor(key, value = key) {
        this.root = new TreeNode(key, value);
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

    insert(parentNodeKey, key, value = key) {
        for (let node of this.preOrderTraversal()) {
          if (node.key === parentNodeKey) {
            node.children.push(new TreeNode(key, value, node));
            return true;
          }
        }
        return false;
      }
    
      remove(key) {
        for (let node of this.preOrderTraversal()) {
          const filtered = node.children.filter(c => c.key !== key);
          if (filtered.length !== node.children.length) {
            node.children = filtered;
            return true;
          }
        }
        return false;
      }
    
      find(key) {
        for (let node of this.preOrderTraversal()) {
          if (node.key === key) return node;
        }
        return undefined;
      }
}