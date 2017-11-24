/*
 * PlainModal
 * https://anseki.github.io/plain-modal/
 *
 * Copyright (c) 2017 anseki
 * Licensed under the MIT license.
 */

import CSSPrefix from 'cssprefix';
import mClassList from 'm-class-list';
import PlainOverlay from 'plain-overlay';
import CSS_TEXT from './default.scss';
// [DRAG]
import PlainDraggable from 'plain-draggable';
// [/DRAG]
mClassList.ignoreNative = true;

const
  APP_ID = 'plainmodal',
  STYLE_ELEMENT_ID = `${APP_ID}-style`,
  STYLE_CLASS = APP_ID,
  STYLE_CLASS_CONTENT = `${APP_ID}-content`,
  STYLE_CLASS_OVERLAY = `${APP_ID}-overlay`,
  STYLE_CLASS_OVERLAY_HIDE = `${STYLE_CLASS_OVERLAY}-hide`,
  STYLE_CLASS_OVERLAY_FORCE = `${STYLE_CLASS_OVERLAY}-force`,

  STATE_CLOSED = 0, STATE_OPENING = 1, STATE_OPENED = 2, STATE_CLOSING = 3,
  STATE_INACTIVATING = 4, STATE_INACTIVATED = 5, STATE_ACTIVATING = 6,
  DURATION = 200, // COPY from PlainOverlay

  IS_TRIDENT = !!document.uniqueID,
  IS_EDGE = '-ms-scroll-limit' in document.documentElement.style &&
    '-ms-ime-align' in document.documentElement.style && !window.navigator.msPointerEnabled,

  isObject = (() => {
    const toString = {}.toString, fnToString = {}.hasOwnProperty.toString,
      objFnString = fnToString.call(Object);
    return obj => {
      let proto, constr;
      return obj && toString.call(obj) === '[object Object]' &&
        (!(proto = Object.getPrototypeOf(obj)) ||
          (constr = proto.hasOwnProperty('constructor') && proto.constructor) &&
          typeof constr === 'function' && fnToString.call(constr) === objFnString);
    };
  })(),

  /**
   * An object that has properties of instance.
   * @typedef {Object} props
   * @property {Element} elmContent - Content element.
   * @property {Element} elmOverlay - Overlay element. (Not PlainOverlay)
   * @property {PlainOverlay} plainOverlay - PlainOverlay instance.
   * @property {PlainDraggable} plainDraggable - PlainDraggable instance.
   * @property {number} state - Current state.
   * @property {Object} options - Options.
   * @property {props} parentProps - props that is effected with current props.
   */

  /** @type {Object.<_id: number, props>} */
  insProps = {},

  /**
   * A `props` list, it have a `state` other than `STATE_CLOSED`.
   * A `props` is pushed to the end of this array, `shownProps[shownProps.length - 1]` can be active.
   * @type {Array.<props>}
   */
  shownProps = [];

let insId = 0,
  openCloseEffectProps, // A `props` that is running the "open/close" effect now.
  escKey = true;

// [DEBUG]
window.insProps = insProps;
window.shownProps = shownProps;
// [/DEBUG]

// [DEBUG]
const traceLog = [];
const STATE_TEXT = {};
STATE_TEXT[STATE_CLOSED] = 'STATE_CLOSED';
STATE_TEXT[STATE_OPENING] = 'STATE_OPENING';
STATE_TEXT[STATE_OPENED] = 'STATE_OPENED';
STATE_TEXT[STATE_CLOSING] = 'STATE_CLOSING';
STATE_TEXT[STATE_INACTIVATING] = 'STATE_INACTIVATING';
STATE_TEXT[STATE_INACTIVATED] = 'STATE_INACTIVATED';
STATE_TEXT[STATE_ACTIVATING] = 'STATE_ACTIVATING';
// [/DEBUG]

function forceReflow(target) {
  // Trident and Blink bug (reflow like `offsetWidth` can't update)
  setTimeout(() => {
    const parent = target.parentNode, next = target.nextSibling;
    // It has to be removed first for Blink.
    parent.insertBefore(parent.removeChild(target), next);
  }, 0);
}

/**
 * @param {Element} element - A target element.
 * @returns {boolean} `true` if connected element.
 */
function isElement(element) {
  return !!(element &&
    element.nodeType === Node.ELEMENT_NODE &&
    // element instanceof HTMLElement &&
    typeof element.getBoundingClientRect === 'function' &&
    !(element.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED));
}

// [DRAG]
function switchDraggable(props) {
  traceLog.push('<switchDraggable>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (props.plainDraggable) {
    traceLog.push(`plainDraggable.disabled: ${!(props.options.dragHandle && props.state === STATE_OPENED)}`); // [DEBUG/]
    props.plainDraggable.disabled = !(props.options.dragHandle && props.state === STATE_OPENED);
    // [DEBUG]
  } else {
    traceLog.push('plainDraggable: NONE');
    // [/DEBUG]
  }
  traceLog.push(`_id:${props._id}`, `state:${STATE_TEXT[props.state]}`, '</switchDraggable>'); // [DEBUG/]
}
// [/DRAG]

function finishOpening(props) {
  traceLog.push('<finishOpening>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  openCloseEffectProps = null;
  props.state = STATE_OPENED;
  switchDraggable(props); // [DRAG/]
  if (props.parentProps) {
    // [DEBUG]
    traceLog.push(`parentProps._id:${props.parentProps._id}`,
      `parentProps.state:${STATE_TEXT[props.parentProps.state]}`);
    // [/DEBUG]
    props.parentProps.state = STATE_INACTIVATED;
  }
  if (props.options.onOpen) { props.options.onOpen.call(props.ins); }
  traceLog.push(`_id:${props._id}`, `state:${STATE_TEXT[props.state]}`, '</finishOpening>'); // [DEBUG/]
}

function finishClosing(props) {
  traceLog.push('<finishClosing>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (shownProps[shownProps.length - 1] !== props) { throw new Error('`shownProps` is broken.'); } // [DEBUG/]
  shownProps.pop();
  openCloseEffectProps = null;
  props.state = STATE_CLOSED;
  if (props.parentProps) {
    // [DEBUG]
    traceLog.push(`parentProps._id:${props.parentProps._id}`,
      `parentProps.state:${STATE_TEXT[props.parentProps.state]}`);
    // [/DEBUG]
    props.parentProps.state = STATE_OPENED;
    switchDraggable(props.parentProps); // [DRAG/]
    props.parentProps = null;
  }
  if (props.options.onClose) { props.options.onClose.call(props.ins); }
  traceLog.push(`_id:${props._id}`, `state:${STATE_TEXT[props.state]}`, '</finishClosing>'); // [DEBUG/]
}

/**
 * Process after preparing data and adjusting style.
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function execOpening(props, force) {
  traceLog.push('<execOpening>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  traceLog.push(`force:${!!force}`); // [DEBUG/]
  if (props.parentProps) { // inactivate parentProps
    // [DEBUG]
    traceLog.push(`parentProps._id:${props.parentProps._id}`,
      `parentProps.state:${STATE_TEXT[props.parentProps.state]}`);
    // [/DEBUG]
    /*
      Cases:
        - STATE_OPENED or STATE_ACTIVATING, regardless of force
        - STATE_INACTIVATING and force
    */
    const parentProps = props.parentProps, elmOverlay = parentProps.elmOverlay;
    if (parentProps.state === STATE_OPENED) {
      elmOverlay.style[CSSPrefix.getName('transitionDuration')] =
        props.options.duration === DURATION ? '' : `${props.options.duration}ms`;
    }
    mClassList(elmOverlay).add(STYLE_CLASS_OVERLAY_HIDE).toggle(STYLE_CLASS_OVERLAY_FORCE, !!force);
    // Update `state` regardless of force, for switchDraggable.
    parentProps.state = STATE_INACTIVATING;
    switchDraggable(parentProps); // [DRAG/]
  }

  // When `force`, `props.state` is updated immediately in
  //    plainOverlay.onShow -> finishOpening -> STATE_OPENED
  if (!force) { props.state = STATE_OPENING; }
  props.plainOverlay.show(force);
  traceLog.push(`_id:${props._id}`, `state:${STATE_TEXT[props.state]}`, '</execOpening>'); // [DEBUG/]
}

/**
 * Process after preparing data and adjusting style.
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @param {boolean} [sync] - `force` with sync-mode. (Skip restoring active element)
 * @returns {void}
 */
function execClosing(props, force, sync) {
  traceLog.push('<execClosing>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  traceLog.push(`force:${!!force}`, `sync:${!!sync}`); // [DEBUG/]
  if (props.parentProps) { // activate parentProps
    // [DEBUG]
    traceLog.push(`parentProps._id:${props.parentProps._id}`,
      `parentProps.state:${STATE_TEXT[props.parentProps.state]}`);
    // [/DEBUG]
    /*
      Cases:
        - STATE_INACTIVATED or STATE_INACTIVATING, regardless of `force`
        - STATE_ACTIVATING and `force`
    */
    const parentProps = props.parentProps, elmOverlay = parentProps.elmOverlay;
    if (parentProps.state === STATE_INACTIVATED) {
      elmOverlay.style[CSSPrefix.getName('transitionDuration')] =
        props.options.duration === DURATION ? '' : `${props.options.duration}ms`;
    }
    mClassList(elmOverlay).remove(STYLE_CLASS_OVERLAY_HIDE).toggle(STYLE_CLASS_OVERLAY_FORCE, !!force);
    // same condition as props
    parentProps.state = STATE_ACTIVATING;
  }

  // Even when `force`, `props.state` is updated with "async" (if !sync),
  // something might run before `props.state` is updated in
  //    (setTimeout ->) plainOverlay.onHide -> finishClosing -> STATE_CLOSED
  props.state = STATE_CLOSING;
  switchDraggable(props); // [DRAG/]
  props.plainOverlay.hide(force, sync);
  traceLog.push(`_id:${props._id}`, `state:${STATE_TEXT[props.state]}`, '</execClosing>'); // [DEBUG/]
}

/**
 * Finish the "open/close" effect immediately with sync-mode.
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function fixOpenClose(props) {
  traceLog.push('<fixOpenClose>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (props.state === STATE_OPENING) {
    execOpening(props, true);
  } else if (props.state === STATE_CLOSING) {
    execClosing(props, true, true);
  }
  traceLog.push(`_id:${props._id}`, `state:${STATE_TEXT[props.state]}`, '</fixOpenClose>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function open(props, force) {
  traceLog.push('<open>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (props.state !== STATE_CLOSED &&
        props.state !== STATE_CLOSING && props.state !== STATE_OPENING ||
      props.state === STATE_OPENING && !force ||
      props.state !== STATE_OPENING &&
        props.options.onBeforeOpen && props.options.onBeforeOpen.call(props.ins) === false) {
    traceLog.push('cancel', '</open>'); // [DEBUG/]
    return;
  }
  /*
    Cases:
      - STATE_CLOSED or STATE_CLOSING, regardless of `force`
      - STATE_OPENING and `force`
  */

  if (props.state === STATE_CLOSED) {
    traceLog.push(`openCloseEffectProps:${openCloseEffectProps ? openCloseEffectProps._id : 'NONE'}`); // [DEBUG/]
    if (openCloseEffectProps) { fixOpenClose(openCloseEffectProps); }
    openCloseEffectProps = props;

    if (shownProps.length) {
      if (shownProps.indexOf(props) !== -1) { throw new Error('`shownProps` is broken.'); } // [DEBUG/]
      props.parentProps = shownProps[shownProps.length - 1];
      traceLog.push(`parentProps:${props.parentProps._id}`); // [DEBUG/]
    }
    shownProps.push(props);

    mClassList(props.elmOverlay).add(STYLE_CLASS_OVERLAY_FORCE).remove(STYLE_CLASS_OVERLAY_HIDE);
  }

  execOpening(props, force);
  traceLog.push(`_id:${props._id}`, `state:${STATE_TEXT[props.state]}`, '</open>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function close(props, force) {
  traceLog.push('<close>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (props.state === STATE_CLOSED ||
      props.state === STATE_CLOSING && !force ||
      props.state !== STATE_CLOSING &&
        props.options.onBeforeClose && props.options.onBeforeClose.call(props.ins) === false) {
    traceLog.push('cancel', '</close>'); // [DEBUG/]
    return;
  }
  /*
    Cases:
      - Other than STATE_CLOSED and STATE_CLOSING, regardless of `force`
      - STATE_CLOSING and `force`
  */

  traceLog.push(`openCloseEffectProps:${openCloseEffectProps ? openCloseEffectProps._id : 'NONE'}`); // [DEBUG/]
  if (openCloseEffectProps && openCloseEffectProps !== props) {
    fixOpenClose(openCloseEffectProps);
    openCloseEffectProps = null;
  }
  /*
    Cases:
      - STATE_OPENED, STATE_OPENING or STATE_INACTIVATED, regardless of `force`
      - STATE_CLOSING and `force`
  */
  if (props.state === STATE_INACTIVATED) { // -> STATE_OPENED
    // [DEBUG]
    const i = shownProps.indexOf(props);
    if (i === -1 || i === shownProps.length - 1) { throw new Error('`shownProps` is broken.'); }
    // [/DEBUG]
    let topProps;
    while ((topProps = shownProps[shownProps.length - 1]) !== props) {
      if (topProps.state !== STATE_OPENED) { throw new Error('`shownProps` is broken.'); } // [DEBUG/]
      // [DEBUG]
      traceLog.push(`topProps._id:${topProps._id}`,
        `topProps.state:${STATE_TEXT[topProps.state]}`);
      // [/DEBUG]
      execClosing(topProps, true, true);
    }
  }
  /*
    Cases:
      - STATE_OPENED or STATE_OPENING, regardless of `force`
      - STATE_CLOSING and `force`
  */

  if (props.state === STATE_OPENED) {
    if (openCloseEffectProps) { throw new Error('`openCloseEffectProps` is broken.'); } // [DEBUG/]
    openCloseEffectProps = props;
  }

  execClosing(props, force);
  traceLog.push(`_id:${props._id}`, `state:${STATE_TEXT[props.state]}`, '</close>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {Object} newOptions - New options.
 * @returns {void}
 */
function setOptions(props, newOptions) {
  const options = props.options, plainOverlay = props.plainOverlay;

  // closeButton
  if (newOptions.hasOwnProperty('closeButton') &&
      (newOptions.closeButton = isElement(newOptions.closeButton) ? newOptions.closeButton :
        newOptions.closeButton == null ? void 0 : false) !== false &&
      newOptions.closeButton !== options.closeButton) {
    if (options.closeButton) { // Remove
      options.closeButton.removeEventListener('click', props.handleClose, false);
    }
    options.closeButton = newOptions.closeButton;
    if (options.closeButton) { // Add
      options.closeButton.addEventListener('click', props.handleClose, false);
    }
  }

  // duration
  // Check by PlainOverlay
  plainOverlay.duration = newOptions.duration;
  options.duration = plainOverlay.duration;

  // overlayBlur
  // Check by PlainOverlay
  plainOverlay.blur = newOptions.overlayBlur;
  options.overlayBlur = plainOverlay.blur;

  // [DRAG]
  // dragHandle
  if (newOptions.hasOwnProperty('dragHandle') &&
      (newOptions.dragHandle = isElement(newOptions.dragHandle) ? newOptions.dragHandle :
        newOptions.dragHandle == null ? void 0 : false) !== false &&
      newOptions.dragHandle !== options.dragHandle) {
    options.dragHandle = newOptions.dragHandle;
    if (options.dragHandle) {
      if (!props.plainDraggable) { props.plainDraggable = new PlainDraggable(props.elmContent); }
      props.plainDraggable.handle = options.dragHandle;
    }
    switchDraggable(props);
  }
  // [/DRAG]

  // Event listeners
  ['onOpen', 'onClose', 'onBeforeOpen', 'onBeforeClose'].forEach(option => {
    if (typeof newOptions[option] === 'function') {
      options[option] = newOptions[option];
    } else if (newOptions.hasOwnProperty(option) && newOptions[option] == null) {
      options[option] = void 0;
    }
  });
}

class PlainModal {
  /**
   * Create a `PlainModal` instance.
   * @param {Element} content - An element that is shown as the content of the modal window.
   * @param {Object} [options] - Options.
   */
  constructor(content, options) {
    const props = {
      ins: this,
      options: { // Initial options (not default)
        closeButton: void 0,
        duration: DURATION,
        dragHandle: void 0, // [DRAG/]
        overlayBlur: false
      },
      state: STATE_CLOSED
    };

    Object.defineProperty(this, '_id', {value: ++insId});
    props._id = this._id;
    insProps[this._id] = props;

    if (!content.nodeType || content.nodeType !== Node.ELEMENT_NODE ||
        content.ownerDocument.defaultView !== window) {
      throw new Error('This `content` is not accepted.');
    }
    props.elmContent = content;
    if (!options) {
      options = {};
    } else if (!isObject(options)) {
      throw new Error('Invalid options.');
    }

    // Setup window
    if (!document.getElementById(STYLE_ELEMENT_ID)) {
      const head = document.getElementsByTagName('head')[0] || document.documentElement,
        sheet = head.insertBefore(document.createElement('style'), head.firstChild);
      sheet.type = 'text/css';
      sheet.id = STYLE_ELEMENT_ID;
      sheet.textContent = CSS_TEXT;
      if (IS_TRIDENT || IS_EDGE) { forceReflow(sheet); } // Trident bug
    }

    mClassList(content).add(STYLE_CLASS_CONTENT);
    // Overlay
    props.plainOverlay = new PlainOverlay({
      face: content,
      onShow: function() { finishOpening(props); },
      onHide: function() { finishClosing(props); }
    });
    const elmPlainOverlayBody = content.parentElement; // elmOverlayBody of PlainOverlay
    mClassList(elmPlainOverlayBody.parentElement).add(STYLE_CLASS); // elmOverlay of PlainOverlay

    // elmOverlay (own overlay)
    (props.elmOverlay = elmPlainOverlayBody.appendChild(document.createElement('div')))
      .className = STYLE_CLASS_OVERLAY;

    // Prepare removable event listeners for each instance.
    props.handleClose = () => { close(props); };

    setOptions(props, options);
  }

  /**
   * @param {Object} options - New options.
   * @returns {PlainModal} Current instance itself.
   */
  setOptions(options) {
    if (isObject(options)) {
      setOptions(insProps[this._id], options);
    }
    return this;
  }

  /**
   * Open the modal window.
   * @param {boolean} [force] - Show it immediately without effect.
   * @param {Object} [options] - New options.
   * @returns {PlainModal} Current instance itself.
   */
  open(force, options) {
    if (arguments.length < 2 && typeof force !== 'boolean') {
      options = force;
      force = false;
    }

    this.setOptions(options);
    open(insProps[this._id], force);
    return this;
  }

  /**
   * Close the modal window.
   * @param {boolean} [force] - Close it immediately without effect.
   * @returns {PlainModal} Current instance itself.
   */
  close(force) {
    close(insProps[this._id], force);
    return this;
  }

  get state() {
    return insProps[this._id].state;
  }

  get closeButton() { return insProps[this._id].options.closeButton; }
  set closeButton(value) { setOptions(insProps[this._id], {closeButton: value}); }

  get duration() { return insProps[this._id].options.duration; }
  set duration(value) { setOptions(insProps[this._id], {duration: value}); }

  get overlayBlur() { return insProps[this._id].options.overlayBlur; }
  set overlayBlur(value) { setOptions(insProps[this._id], {overlayBlur: value}); }

  // [DRAG]
  get dragHandle() { return insProps[this._id].options.dragHandle; }
  set dragHandle(value) { setOptions(insProps[this._id], {dragHandle: value}); }
  // [/DRAG]

  get onOpen() { return insProps[this._id].options.onOpen; }
  set onOpen(value) { setOptions(insProps[this._id], {onOpen: value}); }

  get onClose() { return insProps[this._id].options.onClose; }
  set onClose(value) { setOptions(insProps[this._id], {onClose: value}); }

  get onBeforeOpen() { return insProps[this._id].options.onBeforeOpen; }
  set onBeforeOpen(value) { setOptions(insProps[this._id], {onBeforeOpen: value}); }

  get onBeforeClose() { return insProps[this._id].options.onBeforeClose; }
  set onBeforeClose(value) { setOptions(insProps[this._id], {onBeforeClose: value}); }

  static get escKey() { return escKey; }
  static set escKey(value) { if (typeof value === 'boolean') { escKey = value; } }

  static get STATE_CLOSED() { return STATE_CLOSED; }
  static get STATE_OPENING() { return STATE_OPENING; }
  static get STATE_OPENED() { return STATE_OPENED; }
  static get STATE_CLOSING() { return STATE_CLOSING; }
  static get STATE_INACTIVATING() { return STATE_INACTIVATING; }
  static get STATE_INACTIVATED() { return STATE_INACTIVATED; }
  static get STATE_ACTIVATING() { return STATE_ACTIVATING; }
}

/* [DRAG/]
PlainModal.limit = true;
[DRAG/] */

// [DEBUG]
PlainModal.traceLog = traceLog;
PlainModal.STATE_TEXT = STATE_TEXT;
// [/DEBUG]

export default PlainModal;
