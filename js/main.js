const SOURCE = `fn pane
  rect 0 0 5 1
  rect 0 0 1 5
  rect 0 4 5 1
  rect 4 0 1 5

fn window
  save
  pane
  translate 0 5
  pane
  translate 5 0
  pane
  translate 0 -5
  pane
  restore

fn floor
  save
  window 
  translate 11 0
  window
  translate 11 0
  window
  translate 11 0
  window
  restore

fn building
  save
  floor
  translate 0 13
  floor
  translate 0 13
  floor
  translate 0 13
  floor
  translate 0 13
  floor
  translate 0 13
  floor
  restore

translate 5 5
building

translate 20 10
building
`;

commandMap = {};

function resetCommandMap() {
  commandMap = {
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
    reset: () => {
      ctx.resetTransform();
    },
  };
}

const LINE_RE = /^(\s*)([a-z][a-z0-9]+)\s*(.*)\s*$/;

function parseCode(source) {
  const lines = source.split("\n");
  const statements = [];
  let currentIndentLevel = 0;
  let currentFunction = null;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trimEnd();
    if (line.trim().length === 0) continue;
    if (line.trim().startsWith("#")) continue;
    const result = LINE_RE.exec(line);
    if (!result) {
      throw new Error(`[Line ${lineIndex + 1}]: I don't understand "${line}".`);
    }
    let [_, indent, command, args] = result;
    args = args.split(/\s+/);
    const indentLevel = indent.length / 2;
    if (Math.floor(indentLevel) !== indentLevel) {
      throw new Error(
        `[Line ${lineIndex + 1}]: Invalid indent (not multiple of 2).`
      );
    }
    if (currentIndentLevel !== indentLevel) {
      if (!currentFunction) {
        throw new Error(
          `[Line ${lineIndex + 1}]: Indent changed, but not in function.`
        );
      }
      currentFunction = null;
      currentIndentLevel = 0;
    }
    if (command === "fn") {
      const name = args[0];
      currentFunction = {
        args: args.slice(1),
        statements: [],
      };
      commandMap[name] = currentFunction;
      currentIndentLevel = 1;
    } else {
      const statement = { command, args, line: lineIndex + 1 };
      if (currentFunction) {
        currentFunction.statements.push(statement);
      } else {
        statements.push(statement);
      }
    }
  }
  return statements;
}

function executeStatements(statements) {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const fn = commandMap[statement.command];
    if (typeof fn === "function") {
      fn(...statement.args);
    } else if (typeof fn === "object") {
      // FIXME do something with scope args here
      executeStatements(fn.statements);
    } else {
      throw new Error(
        `[Line ${statement.line}]: Command "${statement.command}" not found.`
      );
    }
  }
}

function runCode() {
  resetCommandMap();
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const source = document.querySelector("#code").value;
  document.querySelector("#error").textContent = "";
  try {
    const statements = parseCode(source);
    // console.log(statements);
    executeStatements(statements);
  } catch (e) {
    document.querySelector("#error").textContent = e.message;
  }
}

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

document.querySelector("#code").value = SOURCE;

document.querySelector("#code").addEventListener("input", () => {
  runCode();
});

runCode();
