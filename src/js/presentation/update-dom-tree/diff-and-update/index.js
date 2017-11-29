const createElement = require('../create-element')
const updateElement = require('../update-element')
const updateTextNode = require('./update-text-node')
const removeExtraChildren = require('./remove-extra-children')

module.exports = diffAndUpdate

function diffAndUpdate(ast, node, parentNode = node) {
  if (!node) {
    // Add a new node.
    appendNewNode(ast, node, parentNode)
  } else {
    // Update an exist node.
    updateExitingNode(ast, node, parentNode)
  }
}

function appendNewNode(ast, node, parentNode) {
  if (parentNode.nodeType === Node.TEXT_NODE) {
    console.warning('A TextNode can not be appended a child', parentNode, ast)
    return
  }

  if (ast.tagName) {
    node = createElement(ast)
    // Append children if exists
    if (ast.childNodes) {
      updateChildren(ast, node)
    }
    parentNode.appendChild(node)
  } else {
    parentNode.appendChild(document.createTextNode(ast.value))
  }
}

function updateExitingNode(ast, node, parentNode) {
  if (ast.tagName) {
    // Uptade an Element.
    // Creat a new Element if the tagName is changed.
    node = updateElement(ast, node, parentNode)
  } else {
    updateTextNode(ast, node)
  }

  if (ast.childNodes) {
    updateChildren(ast, node)
    removeExtraChildren(ast, node)
  }
}

function updateChildren(ast, node) {
  // Update children
  ast.childNodes.forEach((astChildNode, index) => diffAndUpdate(astChildNode, node.childNodes[index], node))
}