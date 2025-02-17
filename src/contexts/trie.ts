export class Node {
  key: string;
  children: Record<string, Node | Leaf> = {}
  parent: Node | undefined
  description: string | undefined

  constructor(key: string, parent: Node | undefined) {
    this.key = key
    this.parent = parent
  }

  removeChild(key: string) {
    // recursively remove all children of the child
    for (const child of Object.values(this.children[key].children)) {
      for (const childKey of Object.keys(child.children)) {
        child.removeChild(childKey)
      }
    }
    delete this.children[key]
  }

  isLeaf() {
    return this instanceof Leaf
  }
}

export class Leaf extends Node {
  callback: ((event?: KeyboardEvent) => void) | undefined;

  constructor(key: string, parent: Node, callback: (event?: KeyboardEvent) => void) {
    super(key, parent)
    this.callback = callback
  }

  getCallback() {
    return this.callback
  }
}

export class Trie {
  private _root = new Node('', undefined)
  private _currentNode: Node | Leaf;
  private _subscribers: (() => void)[] = []

  constructor() {
    this._currentNode = this._root;
  }

  getCurrentNode() {
    return this._currentNode;
  }

  setCurrentNode(node: Node | Leaf) {
    this._currentNode = node;
    this.emit()
  }

  add(path: string, callback: (event?: KeyboardEvent) => void) {
    let node: Node | Leaf = this._root
    const chars = path.split(' ');
    for (const [index, char] of chars.entries()) {
      if (!node.children[char]) {
        if (index === chars.length - 1) {
          node.children[char] = new Leaf(char, node, callback)
        } else {
          node.children[char] = new Node(char, node)
        }
      }
      node = node.children[char]
    }
  }

  remove(path: string) {
    const node = this.find(path)

    if (node) {
      node.parent!.removeChild(node.key)
    }
  }

  find(path: string): Node | Leaf | undefined {
    let node: Node | Leaf | undefined = this._root
    for (const char of path) {
      const nextNode: Node | Leaf | undefined = node?.children[char]
      if (!nextNode) {
        return undefined;
      }
      node = nextNode
    }
    return node
  }

  /**
   * Move to the next node in the trie
   * If the next node is not found, reset the current node to the root
   *
   * @param char - The character to move to
   * @returns The next node in the trie
   */
  next(char: string): Node | Leaf | undefined {
    const nextNode = this._currentNode.children[char]
    if (!nextNode) {
      this.reset();
      return undefined;
    }
    this.setCurrentNode(nextNode)
    return nextNode
  }

  reset() {
    this.setCurrentNode(this._root)
  }

  subscribe = (callback: () => void) => {
    this._subscribers.push(callback)

    return () => {
      this.unsubscribe(callback)
    }
  }

  unsubscribe = (callback: () => void) => {
    this._subscribers = this._subscribers.filter(cb => cb !== callback)
  }


  emit = () => {
    this._subscribers.forEach(cb => cb())
  }

  render() {
    const renderNode = (node: Node | Leaf, prefix: string = '', isLast: boolean = true) => {
      const connector = isLast ? '└── ' : '├── '
      const childPrefix = isLast ? '    ' : '│   '

      console.log(`${prefix}${connector}${node.key}${node.isLeaf() ? ' (Leaf)' : ''}`)

      const children = Object.entries(node.children)
      children.forEach(([_, child], index) => {
        renderNode(child, prefix + childPrefix, index === children.length - 1)
      })
    }

    console.log('Trie Structure:')
    renderNode(this._root)
  }
}
