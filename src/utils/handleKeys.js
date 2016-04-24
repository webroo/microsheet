const KEY_CODES = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del',
  91: 'meta',
  93: 'meta',
  224: 'meta',
};

const ALIASES = {
  option: 'alt',
  command: 'meta',
  return: 'enter',
  escape: 'esc',
  delete: 'del',
  plus: '+',
  mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl',
};

// Splits a combo string, sorts it alphabetically, then recombines it.
// e.g. `ctrl+alt+a` --> `a+alt+ctrl`
function normalizeCombo(combo) {
  return combo
    .split('+')
    .map(key => (ALIASES[key] ? ALIASES[key] : key))
    .sort()
    .join('+');
}

// Modifies the handlers map so that the combo keys are alphabetically sorted. This means they can
// be quickly compared to incoming combos which have also been alphabetically sorted.
function normaliseHandlerKeys(handlers) {
  return Object.keys(handlers).reduce((acc, combo) => {
    acc[normalizeCombo(combo)] = handlers[combo];
    return acc;
  }, {});
}

/**
 * Returns a string that represents the key that was pressed that generated the event.
 * For alphanumeric and symbol keys this will simply be the character, e.g. `a`, `1`, `=`, etc.
 * For other keys a name will be given, e.g. `ctrl`, `shift`, `enter`, `up`, `right`, etc.
 * @param  {[type]} event [description]
 * @return {[type]}
 */
export function getKeyFromEvent(event) {
  const code = event.type === 'keypress' ? event.charCode : event.keyCode;
  if (KEY_CODES[code]) {
    return KEY_CODES[code];
  }
  return String.fromCharCode(code).toLowerCase();
}

/**
 * Returns true if the key press that generated the event is ONLY a modifier key, i.e. no other
 * key was pressed in combination with it. For example just ctrl was pressed.
 * @param  {Event}   event Keyboard event
 * @return {Boolean}
 */
export function isModifierKey(event) {
  const key = getKeyFromEvent(event);
  return key === 'shift' || key === 'ctrl' || key === 'alt' || key === 'meta';
}

/**
 * Returns a string that describes the combo of keys pressed that generated the event.
 * The string will be an alphabetically sorted collection of keys joined with `+` symbol.
 * e.g. `a+ctrl+shift`, or `alt+shift+z`
 * @param  {Event}  event Keyboard event
 * @return {String}
 */
export function getComboFromEvent(event) {
  let pressedCombo = [];

  if (!isModifierKey(event)) {
    if (event.shiftKey) {
      pressedCombo.push('shift');
    }
    if (event.altKey) {
      pressedCombo.push('alt');
    }
    if (event.ctrlKey) {
      pressedCombo.push('ctrl');
    }
    if (event.metaKey) {
      pressedCombo.push('meta');
    }
  }

  pressedCombo.push(getKeyFromEvent(event));
  pressedCombo = pressedCombo.sort().join('+');
  return pressedCombo;
}

/**
 * Returns a function that handles any keyboard event, calls the specified function for each key combo.
 * Note: For the best user experience and key support this should be used with `onKeyDown`.
 *
 * @example
 *   const handleKeyEvent = handleKeys({
 *      'ctrl+shift+z': undo,
 *      'ctrl+shift+z': {callback: undo, preventDefault: true, stopPropagation: true},
 *   });
 *   <button onKeyDown={handleKeyEvent}>
 *
 * @param  {Object}   handlers Map of key combos to callback functions
 * @return {Function}          Function that accepts a keyboard event.
 */
export default function handleKeys(handlers) {
  const handlerMap = normaliseHandlerKeys(handlers);

  return event => {
    const pressedCombo = getComboFromEvent(event);

    if (handlerMap[pressedCombo]) {
      const handler = handlerMap[pressedCombo];

      if (typeof handler === 'function') {
        handler();
        return true;
      } else if (typeof handler === 'object' && handler.callback) {
        if (handler.preventDefault) {
          event.preventDefault();
        }
        if (handler.stopPropagation) {
          event.stopPropagation();
        }
        handler.callback();
        return true;
      }

      throw new Error('No callback specified for key handler');
    }

    return false;
  };
}
