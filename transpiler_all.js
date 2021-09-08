const fs = require('fs');
const path = require('path');
const transpiler = require('./transpiler');

function insertJsonHTML(jsFilePath) {
  const content = fs.readFileSync(jsFilePath);
  const strContent = String(content);
  const lines = strContent.split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].indexOf('#JSON_HTML') > -1) {
      const htmlFilePath = jsFilePath.replace('\.js', '.html');
      const htmlJsonString = transpiler.html2json(htmlFilePath);
      const htmlJsonLine = `var json_html = '${htmlJsonString}';`;

      if (lines[i + 1].indexOf('json_html') > -1) {
        lines[i + 1] = htmlJsonLine;
      } else {
        lines.splice(i + 1, 0, htmlJsonLine);
      }

      i = lines.length;
    }
  }

  const toWrite = lines.join('\n');
  fs.writeFile(jsFilePath, toWrite, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

function readDirectorySynchronously(paramDirectory) {
  let directory = paramDirectory;
  if (!directory) {
    directory = '';
  }
  const currentDirectorypath = path.join(__dirname + directory);

  const currentDirectory = fs.readdirSync(currentDirectorypath, 'utf8');

  currentDirectory.forEach((file) => {
    const isHtmlFile = file.indexOf('html') > -1;
    const pathOfCurrentItem = path.join(`${__dirname + directory}/${file}`);

    if (isHtmlFile && fs.statSync(pathOfCurrentItem).isFile()) {
      if (pathOfCurrentItem.indexOf('\.html') > -1) {
        const jsFilePath = pathOfCurrentItem.replace('\.html', '.js');
        if (fs.existsSync(jsFilePath)) {
          insertJsonHTML(jsFilePath);
        }
      }
    } else if (fs.statSync(pathOfCurrentItem).isDirectory()) {
      const directorypath = path.join(`${directory}\\${file}`);
      readDirectorySynchronously(directorypath);
    }
  });
}

readDirectorySynchronously();
