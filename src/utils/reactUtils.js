import React from 'react';

/**
 * Basic version of react-hyperscript. Acts like an overloaded version of React.createElement()
 * Allows you to optionally omit the second `props` argument and put children there instead.
 * @example
 *   h('div') // HTML element
 *   h(MyElement) // Custom element
 *   h('div', {className: 'main'}) // With props
 *   h('div', {className: 'main'}, h('h1', 'Hello')) // With props and children
 *   h('div', h('h1', 'Hello')) // With just children (props omitted)
 *   h('div', h('h1', 'Hello'), h('p', 'Lorem ipsum')) // Multiple children (props omitted)
 */
export function h(...args) {
  // If there isn't a valid props object in the arguments then insert a null one there instead
  const p = args[1];
  if (typeof p === 'string' || typeof p === 'number' || Array.isArray(p) || React.isValidElement(p)) {
    args.splice(1, 0, null);
  }
  return React.createElement(...args);
}
