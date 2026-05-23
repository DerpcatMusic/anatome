#!/usr/bin/env node
/**
 * Safe bulk transform: replace custom UI wrappers with direct bits-ui usage.
 * Phase 1: Imports + simple tag renames only.
 * Phase 2: Manual prop mapping for Button, Checkbox, etc.
 */

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

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, "utf-8");
  let changed = false;
  for (const { from, to } of replacements) {
    if (typeof from === "string") {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        changed = true;
      }
    } else {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("  →", path.relative(SRC, filePath));
  }
  return changed;
}

const files = findSvelteFiles(SRC);
console.log(`Found ${files.length} .svelte files`);

// ── AspectRatio ──
console.log("\n🔷 AspectRatio");
for (const file of files) {
  replaceInFile(file, [
    { from: 'import AspectRatio from "$components/ui/AspectRatio.svelte";', to: 'import { AspectRatio } from "bits-ui";' },
    { from: /<AspectRatio\b/g, to: '<AspectRatio.Root class="hb-aspect-ratio"' },
    { from: /<\/AspectRatio>/g, to: '</AspectRatio.Root>' },
  ]);
}

// ── ScrollArea ──
console.log("\n🔷 ScrollArea");
for (const file of files) {
  if (!fs.readFileSync(file, "utf-8").includes('import ScrollArea from "$components/ui/ScrollArea.svelte"')) continue;
  let txt = fs.readFileSync(file, "utf-8");
  txt = txt.replace('import ScrollArea from "$components/ui/ScrollArea.svelte";', 'import { ScrollArea } from "bits-ui";');
  // Match <ScrollArea> or <ScrollArea class="..."> with content
  txt = txt.replace(
    /<ScrollArea(?:\s+class="([^"]*)")?\s*>([\s\S]*?)<\/ScrollArea>/g,
    (match, cls, inner) => {
      const rootClass = cls ? `hb-scroll-area ${cls}` : "hb-scroll-area";
      return `<ScrollArea.Root class="${rootClass}">\n  <ScrollArea.Viewport class="hb-scroll-area__viewport">\n    ${inner.trim()}\n  </ScrollArea.Viewport>\n  <ScrollArea.Scrollbar class="hb-scroll-area__bar" orientation="vertical">\n    <ScrollArea.Thumb class="hb-scroll-area__thumb" />\n  </ScrollArea.Scrollbar>\n</ScrollArea.Root>`;
    }
  );
  fs.writeFileSync(file, txt, "utf-8");
  console.log("  →", path.relative(SRC, file));
}

// ── Progress ──
console.log("\n🔷 Progress");
for (const file of files) {
  if (!fs.readFileSync(file, "utf-8").includes('import Progress from "$components/ui/Progress.svelte"')) continue;
  let txt = fs.readFileSync(file, "utf-8");
  txt = txt.replace('import Progress from "$components/ui/Progress.svelte";', 'import { Progress } from "bits-ui";');
  txt = txt.replace(
    /<Progress\s+value=\{([^}]+)\}\s+max=\{([^}]+)\}\s+label=\{([^}]+)\}\s*\/>/g,
    (match, value, max, label) => {
      const v = value.trim();
      return `<Progress.Root class="hb-progress-track" value={${v}} max={${max.trim()}} aria-label={${label.trim()}}>\n  <div class="hb-progress-fill" style="transform: translateX(-{100 - ${v}}%)"></div>\n</Progress.Root>`;
    }
  );
  fs.writeFileSync(file, txt, "utf-8");
  console.log("  →", path.relative(SRC, file));
}

// ── Slider ──
console.log("\n🔷 Slider");
for (const file of files) {
  if (!fs.readFileSync(file, "utf-8").includes('import Slider from "$components/ui/Slider.svelte"')) continue;
  let txt = fs.readFileSync(file, "utf-8");
  txt = txt.replace('import Slider from "$components/ui/Slider.svelte";', 'import { Slider } from "bits-ui";');
  // <Slider label="..." bind:value={...} min={...} max={...} step={...} />
  txt = txt.replace(
    /<Slider\s+label="([^"]*)"\s+bind:value=\{([^}]+)\}\s+min=\{([^}]+)\}\s+max=\{([^}]+)\}\s+step=\{([^}]+)\}\s*\/>/g,
    (match, label, value, min, max, step) => {
      const v = value.trim();
      return `<div class="hb-slider">\n  <span class="hb-slider__label">${label}</span>\n  <span class="hb-slider__value">{${v}}</span>\n  <Slider.Root\n    class="hb-slider__root"\n    type="single"\n    min={${min.trim()}}\n    max={${max.trim()}}\n    step={${step.trim()}}\n    value={${v}}\n    onValueChange={(v) => ${v} = v}\n    aria-label="${label}"\n  >\n    <span class="hb-slider__track">\n      <Slider.Range class="hb-slider__range" />\n    </span>\n    <Slider.Thumb class="hb-slider__thumb" index={0} />\n  </Slider.Root>\n</div>`;
    }
  );
  fs.writeFileSync(file, txt, "utf-8");
  console.log("  →", path.relative(SRC, file));
}

// ── Switch ──
console.log("\n🔷 Switch");
for (const file of files) {
  if (!fs.readFileSync(file, "utf-8").includes('import Switch from "$components/ui/Switch.svelte"')) continue;
  let txt = fs.readFileSync(file, "utf-8");
  txt = txt.replace(/import Switch from "[^"]*Switch\.svelte";\n/g, 'import { Switch } from "bits-ui";\n');
  // Self-closing: <Switch label="..." bind:checked={...} onchange={...} />
  txt = txt.replace(
    /<Switch\s+label="([^"]*)"\s+bind:checked=\{([^}]+)\}(?:\s+onchange=\{([^}]+)\})?\s*\/>/g,
    (match, label, checked, onchange) => {
      const onChangeAttr = onchange ? ` onCheckedChange={${onchange.trim()}}` : '';
      return `<span class="hb-switch">\n  <Switch.Root\n    class="hb-switch__root"\n    aria-label="${label}"\n    bind:checked={${checked.trim()}}${onChangeAttr}\n  >\n    <Switch.Thumb class="hb-switch__thumb" />\n  </Switch.Root>\n  <span>${label}</span>\n</span>`;
    }
  );
  fs.writeFileSync(file, txt, "utf-8");
  console.log("  →", path.relative(SRC, file));
}

// ── Popover ──
console.log("\n🔷 Popover");
for (const file of files) {
  if (!fs.readFileSync(file, "utf-8").includes('import Popover from "$components/ui/Popover.svelte"')) continue;
  let txt = fs.readFileSync(file, "utf-8");
  txt = txt.replace('import Popover from "$components/ui/Popover.svelte";', 'import { Popover } from "bits-ui";');
  txt = txt.replace(
    /<Popover\s+bind:open=\{([^}]+)\}\s+trigger=\{([^}]+)\}(?:\s+side="([^"]*)")?(?:\s+align="([^"]*)")?(?:\s+sideOffset=\{([^}]+)\})?\s*>([\s\S]*?)<\/Popover>/g,
    (match, open, trigger, side, align, sideOffset, inner) => {
      const sideAttr = side ? ` side="${side}"` : '';
      const alignAttr = align ? ` align="${align}"` : '';
      const offsetAttr = sideOffset ? ` sideOffset={${sideOffset.trim()}}` : '';
      return `<Popover.Root bind:open={${open.trim()}}>\n  <Popover.Trigger>\n    {#snippet child({ props })}\n      <span {...props} class="hb-popover-trigger">\n        {@render ${trigger.trim()}}\n      </span>\n    {/snippet}\n  </Popover.Trigger>\n  <Popover.Portal>\n    <Popover.Content${sideAttr}${alignAttr}${offsetAttr}>\n      {#snippet child({ wrapperProps, props, open: isOpen })}\n        {#if isOpen}\n          <div {...wrapperProps}>\n            <div {...props} class="hb-popover-content">\n              ${inner.trim()}\n            </div>\n          </div>\n        {/if}\n      {/snippet}\n    </Popover.Content>\n  </Popover.Portal>\n</Popover.Root>`;
    }
  );
  fs.writeFileSync(file, txt, "utf-8");
  console.log("  →", path.relative(SRC, file));
}

// ── Tooltip ──
console.log("\n🔷 Tooltip");
for (const file of files) {
  if (!fs.readFileSync(file, "utf-8").includes('import Tooltip from "$components/ui/Tooltip.svelte"')) continue;
  let txt = fs.readFileSync(file, "utf-8");
  txt = txt.replace('import Tooltip from "$components/ui/Tooltip.svelte";', 'import { Tooltip } from "bits-ui";');
  txt = txt.replace(
    /<Tooltip\s+label="([^"]*)"(?:\s+side="([^"]*)")?(?:\s+align="([^"]*)")?(?:\s+sideOffset=\{([^}]+)\})?(?:\s+openDelay=\{([^}]+)\})?\s*>([\s\S]*?)<\/Tooltip>/g,
    (match, label, side, align, sideOffset, openDelay, inner) => {
      const sideAttr = side ? ` side="${side}"` : '';
      const alignAttr = align ? ` align="${align}"` : '';
      const offsetAttr = sideOffset ? ` sideOffset={${sideOffset.trim()}}` : '';
      const delayAttr = openDelay ? ` openDelay={${openDelay.trim()}}` : '';
      return `<Tooltip.Root${delayAttr}>\n  <Tooltip.Trigger>\n    {#snippet child({ props })}\n      <span {...props} class="hb-tooltip-trigger">\n        ${inner.trim()}\n      </span>\n    {/snippet}\n  </Tooltip.Trigger>\n  <Tooltip.Portal>\n    <Tooltip.Content${sideAttr}${alignAttr}${offsetAttr}>\n      {#snippet child({ wrapperProps, props, open })}\n        {#if open}\n          <div {...wrapperProps}>\n            <div {...props} class="hb-tooltip-content">\n              ${label}\n            </div>\n          </div>\n        {/if}\n      {/snippet}\n    </Tooltip.Content>\n  </Tooltip.Portal>\n</Tooltip.Root>`;
    }
  );
  fs.writeFileSync(file, txt, "utf-8");
  console.log("  →", path.relative(SRC, file));
}

// ── Button: import + tag rename ONLY (safe) ──
console.log("\n🔷 Button (import + tag rename only)");
for (const file of files) {
  replaceInFile(file, [
    { from: 'import Button from "$components/ui/Button.svelte";', to: 'import { Button } from "bits-ui";' },
    { from: /<Button\b/g, to: '<Button.Root' },
    { from: /<\/Button>/g, to: '</Button.Root>' },
  ]);
}

// ── Checkbox: import + tag rename ONLY (safe) ──
console.log("\n🔷 Checkbox (import + tag rename only)");
for (const file of files) {
  replaceInFile(file, [
    { from: 'import Checkbox from "$components/ui/Checkbox.svelte";', to: 'import { Checkbox } from "bits-ui";' },
    { from: "import Checkbox from '$components/ui/Checkbox.svelte';", to: 'import { Checkbox } from "bits-ui";' },
    { from: /<Checkbox\b/g, to: '<Checkbox.Root class="hb-choice"' },
    { from: /<\/Checkbox>/g, to: '</Checkbox.Root>' },
  ]);
}

// ── DropdownMenu: import only ──
console.log("\n🔷 DropdownMenu (import only)");
for (const file of files) {
  replaceInFile(file, [
    { from: 'import DropdownMenu from "$components/ui/DropdownMenu.svelte";', to: 'import { DropdownMenu } from "bits-ui";' },
  ]);
}

// ── Select: import only ──
console.log("\n🔷 Select (import only)");
for (const file of files) {
  replaceInFile(file, [
    { from: 'import Select from "$components/ui/Select.svelte";', to: 'import { Select } from "bits-ui";' },
  ]);
}

// ── RadioGroup: import only ──
console.log("\n🔷 RadioGroup (import only)");
for (const file of files) {
  replaceInFile(file, [
    { from: 'import RadioGroup from "$components/ui/RadioGroup.svelte";', to: 'import { RadioGroup } from "bits-ui";' },
  ]);
}

console.log("\n✅ Phase 1 done. Now manually fix Button tone/size, Select/RadioGroup structure, DropdownMenu structure.");
