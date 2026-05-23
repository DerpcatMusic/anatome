#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "../src");

function findSvelteFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && !entry.name.startsWith(".")) {
      findSvelteFiles(full, files);
    } else if (entry.isFile() && entry.name.endsWith(".svelte")) {
      files.push(full);
    }
  }
  return files;
}

function fixButtonInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  if (!content.includes("<Button.Root")) return;

  let original = content;

  // Fix self-closing: <Button.Root ... />
  content = content.replace(
    /<Button\.Root\s+([^\/>]*)\/>/g,
    (match, attrs) => {
      const tone = (attrs.match(/\btone="([^"]*)"/) || [])[1];
      const size = (attrs.match(/\bsize="([^"]*)"/) || [])[1];
      const existingClass = (attrs.match(/\bclass="([^"]*)"/) || [])[1];

      let classes = ["hb-button"];
      if (tone) classes.push(`hb-button--${tone}`);
      if (size) classes.push(`hb-button--${size}`);

      let cleanAttrs = attrs
        .replace(/\btone="[^"]*"\s*/g, "")
        .replace(/\bsize="[^"]*"\s*/g, "");

      if (existingClass) {
        cleanAttrs = cleanAttrs.replace(/\bclass="[^"]*"\s*/g, "");
        classes.push(existingClass);
      }

      return `<Button.Root class="${classes.join(" ")}"${cleanAttrs} />`;
    }
  );

  // Fix with children: <Button.Root ...>children</Button.Root>
  // Need to be careful about nested Button.Root tags
  // Use a non-greedy approach with depth counting
  let result = "";
  let i = 0;
  while (i < content.length) {
    const startIdx = content.indexOf("<Button.Root", i);
    if (startIdx === -1) {
      result += content.slice(i);
      break;
    }
    result += content.slice(i, startIdx);

    // Find the matching </Button.Root>
    let depth = 1;
    let j = startIdx + "<Button.Root".length;
    while (j < content.length && depth > 0) {
      const nextOpen = content.indexOf("<Button.Root", j);
      const nextClose = content.indexOf("</Button.Root>", j);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        j = nextOpen + "<Button.Root".length;
      } else {
        depth--;
        if (depth === 0) {
          const tagEnd = content.indexOf(">", startIdx);
          const attrs = content.slice(startIdx + "<Button.Root".length, tagEnd);
          const children = content.slice(tagEnd + 1, nextClose);

          const tone = (attrs.match(/\btone="([^"]*)"/) || [])[1];
          const size = (attrs.match(/\bsize="([^"]*)"/) || [])[1];
          const existingClass = (attrs.match(/\bclass="([^"]*)"/) || [])[1];

          let classes = ["hb-button"];
          if (tone) classes.push(`hb-button--${tone}`);
          if (size) classes.push(`hb-button--${size}`);

          let cleanAttrs = attrs
            .replace(/\btone="[^"]*"\s*/g, "")
            .replace(/\bsize="[^"]*"\s*/g, "");

          if (existingClass) {
            cleanAttrs = cleanAttrs.replace(/\bclass="[^"]*"\s*/g, "");
            classes.push(existingClass);
          }

          result += `<Button.Root class="${classes.join(" ")}"${cleanAttrs}>${children}</Button.Root>`;
          j = nextClose + "</Button.Root>".length;
        } else {
          j = nextClose + "</Button.Root>".length;
        }
      }
    }
    i = j;
  }
  content = result;

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("  →", path.relative(SRC, filePath));
  }
}

const files = findSvelteFiles(SRC);
console.log(`Fixing Button in ${files.length} files...`);
for (const file of files) {
  fixButtonInFile(file);
}
console.log("Done.");
