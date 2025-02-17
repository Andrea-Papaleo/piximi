import { isff } from "./hotkeyUtils";

// Special Keys
const _keyMap: Record<string, number> = {
  backspace: 8,
  "⌫": 8,
  tab: 9,
  clear: 12,
  enter: 13,
  "↩": 13,
  return: 13,

  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  ins: 45,
  insert: 45,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  capslock: 20,
  num_0: 96,
  num_1: 97,
  num_2: 98,
  num_3: 99,
  num_4: 100,
  num_5: 101,
  num_6: 102,
  num_7: 103,
  num_8: 104,
  num_9: 105,
  num_multiply: 106,
  num_add: 107,
  num_enter: 108,
  num_subtract: 109,
  num_decimal: 110,
  num_divide: 111,
  "⇪": 20,
  ",": 188,
  ".": 190,
  "/": 191,
  "`": 192,
  "-": isff ? 173 : 189,
  "=": isff ? 61 : 187,
  ";": isff ? 59 : 186,
  "'": 222,
  "[": 219,
  "]": 221,
  "\\": 220,
};

// Modifier Keys
const _modifier: Record<string, number> = {
  "⇧": 16,
  shift: 16,
  // altKey
  "⌥": 18,
  alt: 18,
  option: 18,
  // ctrlKey
  "⌃": 17,
  ctrl: 17,
  control: 17,
  // metaKey
  "⌘": 91,
  cmd: 91,
  command: 91,
};
const modifierMap: Record<string | number, string | number> = {
  16: "shiftKey",
  18: "altKey",
  17: "ctrlKey",
  91: "metaKey",

  shiftKey: 16,
  ctrlKey: 17,
  altKey: 18,
  metaKey: 91,
};
const _mods: Record<number, boolean> = {
  18: false,
  17: false,
  91: false,
};

type HandlerItem = {
  keyup: boolean;
  keydown: boolean;
  scope: string;
  mods: number[];
  shortcut: string;
  method: Function;
  key: string;
  splitKey: string;
  element: Document;
};
const _handlers: Record<string | number, HandlerItem[]> = {};

// F1~F12 special key
for (let k = 1; k < 20; k++) {
  _keyMap[`f${k}`] = 111 + k;
}

export { _keyMap, _modifier, modifierMap, _mods, _handlers };
