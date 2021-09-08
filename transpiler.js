const fs = require('fs');
const path = require('path');
const HTMLParser = require('node-html-parser');

const Node = {
  TEXT_NODE: 3,
};

function DebugTree(node, numLevel) {
  const level = (numLevel) || 0;
  let identation = '';
  for (let i = 0; i < level; i += 1) {
    identation += '   ';
  }
  console.log(identation, node.t, ':', node.class, ':', node.id);

  node.childs.forEach((childNode) => {
    DebugTree(childNode, level + 1);
  });
}

const regexAttrsValue = /".+?"/g;
function convertNodeToJSNode(node) {
  const attrs = [];
  if (node.rawAttrs) {
    const attrsNames = node.rawAttrs.split(regexAttrsValue);
    const attrsValues = node.rawAttrs.match(regexAttrsValue);

    attrsNames.pop();

    attrsNames.forEach((name, i) => {
      let value = attrsValues[i];
      value = value.substring(1, value.length - 1);
      const name2 = name.substring(0, name.length - 1).trim();
      const attr = [name2, value];

      attrs.push(attr);
    });
  }

  const { rawTagName } = node;
  if (!rawTagName) {
    // console.log( node );
  }

  const jsNode = { t: rawTagName, childs: [] };

  if (node.childNodes.length > 0 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
    let text = node.childNodes[0].textContent;

    text = text.replace(/[\n\r\t]/g, '');

    if (text) {
      jsNode.text = text;
    }
  }

  attrs.forEach((attr) => {
    jsNode[attr[0]] = attr[1];
  });

  // console.log( node.nodeType );
  // console.log( jsNode );
  return jsNode;
}

function treeDescent(node, numLevel) {
  const level = (numLevel) || 0;

  const jsNode = convertNodeToJSNode(node);

  node.childNodes.forEach((childNode) => {
    if (childNode.nodeType === 3) {
      return;
    }

    const childJsNode = treeDescent(childNode, level + 1);
    jsNode.childs.push(childJsNode);
  });

  return jsNode;
}

function convertHtmlToJsonHtlm(filePath) {
  const content = fs.readFileSync(filePath);

  let root = HTMLParser.parse(String(content));
  const jsNode = treeDescent(root);
  jsNode.t = 'div';
  root = jsNode;
  /*
  root.childs.forEach((child) => {
     DebugTree( child );
  });
*/

  const jsonRoot = JSON.stringify(root);
  //  const filePathWrite = path.join(__dirname, 'out.txt');

  return jsonRoot;
}

if (require.main === module) {
  const myArgs = process.argv.slice(2);
  const argPath = myArgs[0];

  const filePath = path.join(__dirname, argPath);

  const jsonString = convertHtmlToJsonHtlm(filePath);
  console.log(jsonString);
} else {
//  console.log('required as a module');
}

exports.html2json = convertHtmlToJsonHtlm;
