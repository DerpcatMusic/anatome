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

function fixSelectInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  if (!content.includes("<Select")) return;

  let original = content;
  // Match <Select label="..." bind:value={...} options={...} [compact] [onchange={...}] />
  content = content.replace(
    /<Select\s+label=\{([^}]+)\}\s+bind:value=\{([^}]+)\}\s+options=\{([^}]+)\}(?:\s+compact)?(?:\s+onchange=\{([^}]+)\})?\s*\/>/g,
    (match, label, value, options, onchange) => {
      const v = value.trim();
      const o = options.trim();
      const l = label.trim();
      const onChange = onchange ? ` onValueChange={(selected) => { ${v} = selected; ${onchange.trim()}(); }}` : ` onValueChange={(selected) => ${v} = selected}`;
      return `<div class="hb-field">\n  <span class="hb-field__label">{${l}}</span>\n  <Select.Root\n    type="single"\n    value={String(${v})}\n    ${onChange}\n    items={${o}.map((o) => ({ value: String(o.value), label: o.label, disabled: o.disabled }))}\n  >\n    <Select.Trigger class="hb-select__trigger" aria-label={${l}}>\n      <span class="hb-select__value">{${o}.find((o) => String(o.value) === String(${v}))?.label ?? ""}</span>\n      <span class="hb-select__chevron" aria-hidden="true"></span>\n    </Select.Trigger>\n    <Select.Portal>\n      <Select.Content class="hb-select__content" sideOffset={6}>\n        <Select.Viewport class="hb-select__viewport">\n          {#each ${o} as option}\n            <Select.Item class="hb-select__item" value={String(option.value)} label={option.label} disabled={option.disabled}>\n              {#snippet children({ selected })}\n                <span>{option.label}</span>\n                {#if selected}\n                  <span class="hb-select__check" aria-hidden="true"></span>\n                {/if}\n              {/snippet}\n            </Select.Item>\n          {/each}\n        </Select.Viewport>\n      </Select.Content>\n    </Select.Portal>\n  </Select.Root>\n</div>`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("  Select →", path.relative(SRC, filePath));
  }
}

function fixSwitchInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  if (!content.includes("<Switch")) return;

  let original = content;
  // <Switch bind:checked={...} label={...} [onchange={...}] />
  content = content.replace(
    /<Switch\s+bind:checked=\{([^}]+)\}\s+label=\{([^}]+)\}(?:\s+onchange=\{([^}]+)\})?\s*\/>/g,
    (match, checked, label, onchange) => {
      const c = checked.trim();
      const l = label.trim();
      const onChange = onchange ? ` onCheckedChange={${onchange.trim()}}` : '';
      return `<span class="hb-switch">\n  <Switch.Root\n    class="hb-switch__root"\n    aria-label={${l}}\n    bind:checked={${c}}${onChange}\n  >\n    <Switch.Thumb class="hb-switch__thumb" />\n  </Switch.Root>\n  <span>{${l}}</span>\n</span>`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("  Switch →", path.relative(SRC, filePath));
  }
}

const files = findSvelteFiles(SRC);
for (const file of files) {
  fixSelectInFile(file);
  fixSwitchInFile(file);
}
console.log("Done.");
