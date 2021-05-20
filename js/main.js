const SOURCE = `
# This function draws a window.
fn window x y w h:
  rect x y w 1
  rect x y 1 h
  
  rect x y 
  restore
`;

const commands = {
  rect: (x, y, w, h) => {
    ctx.fillRect(x, y, w, h);
  },
  translate: (x, y) => {
    ctx.translate(x, y);
  },
  save: () => {
    ctx.save();
  },
  restore: () => {
    ctx.restore();
  },
};

const COMMENT_RE = /^(\s*)#(.*)$/;
const LINE_RE = /^(\s*)(\w+)\s*(.*)\s*$/;
function parseCode(source) {
  const lines = source.split("\n");
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    if (line.trim().length === 0) continue;
    if (line.trim().startsWith("#")) continue;
    const result = LINE_RE.exec(line);
    if (!result) {
      throw new Error(`[Line ${lineIndex + 1}]: I don't understand "${line}".`);
    }
    const [_, indent, command, args] = result;
  }
}

function executeCommands(commands) {
  console.log(commands);
}

function runCode() {
  const source = document.querySelector("#code").value;
  const commands = parseCode(source);
  executeCommands(commands);
}

document.querySelector("#code").value = SOURCE;

document.querySelector("#code").addEventListener("input", () => {
  runCode();
});

runCode();
