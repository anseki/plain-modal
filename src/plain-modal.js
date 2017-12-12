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
   * @property {{plainOverlay: boolean, option: boolean}} effectFinished - The effect finished.
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
  closeByEscKey = true, closeByOverlay = true;

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
  // [DEBUG]
  traceLog.push('<switchDraggable>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  // [/DEBUG]
  if (props.plainDraggable) {
    // [DEBUG]
    traceLog.push(
      `plainDraggable.disabled:${!(props.options.dragHandle && props.state === STATE_OPENED)}`);
    // [/DEBUG]
    const disabled = !(props.options.dragHandle && props.state === STATE_OPENED);
    props.plainDraggable.disabled = disabled;
    if (!disabled) { props.plainDraggable.position(); }
    // [DEBUG]
  } else {
    traceLog.push('plainDraggable:NONE');
    // [/DEBUG]
  }
  traceLog.push('</switchDraggable>'); // [DEBUG/]
}
// [/DRAG]

function finishOpening(props) {
  // [DEBUG]
  traceLog.push('<finishOpening>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  // [/DEBUG]
  openCloseEffectProps = null;
  props.state = STATE_OPENED;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  switchDraggable(props); // [DRAG/]
  if (props.parentProps) {
    // [DEBUG]
    traceLog.push(`parentProps._id:${props.parentProps._id}`,
      `parentProps.state:${STATE_TEXT[props.parentProps.state]}`);
    // [/DEBUG]
    props.parentProps.state = STATE_INACTIVATED;
    traceLog.push(`parentProps.state:${STATE_TEXT[props.parentProps.state]}`); // [DEBUG/]
  }
  if (props.options.onOpen) { props.options.onOpen.call(props.ins); }
  traceLog.push('</finishOpening>'); // [DEBUG/]
}

function finishClosing(props) {
  // [DEBUG]
  traceLog.push('<finishClosing>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  if (shownProps[shownProps.length - 1] !== props) { throw new Error('`shownProps` is broken.'); }
  // [/DEBUG]
  shownProps.pop();
  // [DEBUG]
  traceLog.push(
    `shownProps:${shownProps.length ? shownProps.map(props => props._id).join(',') : 'NONE'}`);
  // [/DEBUG]
  openCloseEffectProps = null;
  props.state = STATE_CLOSED;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (props.parentProps) {
    // [DEBUG]
    traceLog.push(`parentProps._id:${props.parentProps._id}`,
      `parentProps.state:${STATE_TEXT[props.parentProps.state]}`);
    // [/DEBUG]
    props.parentProps.state = STATE_OPENED;
    traceLog.push(`parentProps.state:${STATE_TEXT[props.parentProps.state]}`); // [DEBUG/]
    switchDraggable(props.parentProps); // [DRAG/]
    traceLog.push(`parentProps(UNLINK):${props.parentProps._id}`); // [DEBUG/]
    props.parentProps = null;
  }
  if (props.options.onClose) { props.options.onClose.call(props.ins); }
  traceLog.push('</finishClosing>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {string} effectKey - `plainOverlay' or 'option`
 * @returns {void}
 */
function finishOpenEffect(props, effectKey) {
  // [DEBUG]
  traceLog.push('<finishOpenEffect>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`effectKey:${effectKey}`);
  // [/DEBUG]
  if (props.state !== STATE_OPENING) { return; }
  props.effectFinished[effectKey] = true;
  // [DEBUG]
  traceLog.push(`effectFinished.plainOverlay:${props.effectFinished.plainOverlay}`);
  traceLog.push(`effectFinished.option:${props.effectFinished.option}`);
  traceLog.push(`openEffect:${props.options.openEffect ? 'YES' : 'NO'}`);
  // [/DEBUG]
  if (props.effectFinished.plainOverlay &&
      (!props.options.openEffect || props.effectFinished.option)) {
    finishOpening(props);
  }
  traceLog.push(`_id:${props._id}`, '</finishOpenEffect>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {string} effectKey - `plainOverlay' or 'option`
 * @returns {void}
 */
function finishCloseEffect(props, effectKey) {
  // [DEBUG]
  traceLog.push('<finishCloseEffect>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`effectKey:${effectKey}`);
  // [/DEBUG]
  if (props.state !== STATE_CLOSING) { return; }
  props.effectFinished[effectKey] = true;
  // [DEBUG]
  traceLog.push(`effectFinished.plainOverlay:${props.effectFinished.plainOverlay}`);
  traceLog.push(`effectFinished.option:${props.effectFinished.option}`);
  traceLog.push(`closeEffect:${props.options.closeEffect ? 'YES' : 'NO'}`);
  // [/DEBUG]
  if (props.effectFinished.plainOverlay &&
      (!props.options.closeEffect || props.effectFinished.option)) {
    finishClosing(props);
  }
  traceLog.push(`_id:${props._id}`, '</finishCloseEffect>'); // [DEBUG/]
}

/**
 * Process after preparing data and adjusting style.
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function execOpening(props, force) {
  // [DEBUG]
  traceLog.push('<execOpening>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`force:${!!force}`);
  // [/DEBUG]
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
      // [DEBUG]
      traceLog.push('elmOverlay.duration:' +
        (props.options.duration === DURATION ? '' : `${props.options.duration}ms`));
      // [/DEBUG]
    }
    const elmOverlayClassList = mClassList(elmOverlay);
    elmOverlayClassList.toggle(STYLE_CLASS_OVERLAY_FORCE, !!force);
    elmOverlayClassList.add(STYLE_CLASS_OVERLAY_HIDE);
    // [DEBUG]
    traceLog.push(
      `elmOverlay.CLASS_FORCE:${elmOverlayClassList.contains(STYLE_CLASS_OVERLAY_FORCE)}`);
    traceLog.push(
      `elmOverlay.CLASS_HIDE:${elmOverlayClassList.contains(STYLE_CLASS_OVERLAY_HIDE)}`);
    // [/DEBUG]
    // Update `state` regardless of force, for switchDraggable.
    parentProps.state = STATE_INACTIVATING;
    traceLog.push(`parentProps.state:${STATE_TEXT[props.parentProps.state]}`); // [DEBUG/]
    switchDraggable(parentProps); // [DRAG/]
  }

  props.state = STATE_OPENING;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  props.effectFinished.plainOverlay = props.effectFinished.option = false;
  props.plainOverlay.show(force);
  if (props.options.openEffect) {
    if (force) {
      props.options.openEffect.call(props.ins);
      props.openEffectDone();
    } else {
      props.options.openEffect.call(props.ins, props.openEffectDone);
    }
  }
  traceLog.push(`_id:${props._id}`, '</execOpening>'); // [DEBUG/]
}

/**
 * Process after preparing data and adjusting style.
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @param {boolean} [sync] - `force` with sync-mode. (Skip restoring active element)
 * @returns {void}
 */
function execClosing(props, force, sync) {
  // [DEBUG]
  traceLog.push('<execClosing>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  traceLog.push(`force:${!!force}`, `sync:${!!sync}`);
  // [/DEBUG]
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
      // [DEBUG]
      traceLog.push('elmOverlay.duration:' +
        (props.options.duration === DURATION ? '' : `${props.options.duration}ms`));
      // [/DEBUG]
    }
    const elmOverlayClassList = mClassList(elmOverlay);
    elmOverlayClassList.toggle(STYLE_CLASS_OVERLAY_FORCE, !!force);
    elmOverlayClassList.remove(STYLE_CLASS_OVERLAY_HIDE);
    // [DEBUG]
    traceLog.push(
      `elmOverlay.CLASS_FORCE:${elmOverlayClassList.contains(STYLE_CLASS_OVERLAY_FORCE)}`);
    traceLog.push(
      `elmOverlay.CLASS_HIDE:${elmOverlayClassList.contains(STYLE_CLASS_OVERLAY_HIDE)}`);
    // [/DEBUG]
    // same condition as props
    parentProps.state = STATE_ACTIVATING;
    traceLog.push(`parentProps.state:${STATE_TEXT[props.parentProps.state]}`); // [DEBUG/]
  }

  props.state = STATE_CLOSING;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  switchDraggable(props); // [DRAG/]
  props.effectFinished.plainOverlay = props.effectFinished.option = false;
  props.plainOverlay.hide(force, sync);
  if (props.options.closeEffect) {
    if (force) {
      props.options.closeEffect.call(props.ins);
      props.closeEffectDone();
    } else {
      props.options.closeEffect.call(props.ins, props.closeEffectDone);
    }
  }
  traceLog.push(`_id:${props._id}`, '</execClosing>'); // [DEBUG/]
}

/**
 * Finish the "open/close" effect immediately with sync-mode.
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function fixOpenClose(props) {
  // [DEBUG]
  traceLog.push('<fixOpenClose>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`);
  // [/DEBUG]
  if (props.state === STATE_OPENING) {
    execOpening(props, true);
  } else if (props.state === STATE_CLOSING) {
    execClosing(props, true, true);
  }
  traceLog.push(`_id:${props._id}`, '</fixOpenClose>'); // [DEBUG/]
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
    traceLog.push('CANCEL', '</open>'); // [DEBUG/]
    return false;
  }
  /*
    Cases:
      - STATE_CLOSED or STATE_CLOSING, regardless of `force`
      - STATE_OPENING and `force`
  */

  // [DEBUG]
  traceLog.push(`openCloseEffectProps:${openCloseEffectProps ? openCloseEffectProps._id : 'NONE'}`);
  // [/DEBUG]
  if (props.state === STATE_CLOSED) {
    if (openCloseEffectProps) { fixOpenClose(openCloseEffectProps); }
    openCloseEffectProps = props;

    if (shownProps.length) {
      // [DEBUG]
      if (shownProps.indexOf(props) !== -1) { throw new Error('`shownProps` is broken.'); }
      // [/DEBUG]
      props.parentProps = shownProps[shownProps.length - 1];
      traceLog.push(`parentProps(LINK):${props.parentProps._id}`); // [DEBUG/]
    }
    shownProps.push(props);
    // [DEBUG]
    traceLog.push(
      `shownProps:${shownProps.length ? shownProps.map(props => props._id).join(',') : 'NONE'}`);
    // [/DEBUG]

    mClassList(props.elmOverlay).add(STYLE_CLASS_OVERLAY_FORCE).remove(STYLE_CLASS_OVERLAY_HIDE);
    // [DEBUG]
    traceLog.push(
      `elmOverlay.CLASS_FORCE:${mClassList(props.elmOverlay).contains(STYLE_CLASS_OVERLAY_FORCE)}`);
    traceLog.push(
      `elmOverlay.CLASS_HIDE:${mClassList(props.elmOverlay).contains(STYLE_CLASS_OVERLAY_HIDE)}`);
    // [/DEBUG]
  }

  execOpening(props, force);
  traceLog.push(`_id:${props._id}`, '</open>'); // [DEBUG/]
  return true;
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
    traceLog.push('CANCEL', '</close>'); // [DEBUG/]
    return false;
  }
  /*
    Cases:
      - Other than STATE_CLOSED and STATE_CLOSING, regardless of `force`
      - STATE_CLOSING and `force`
  */

  // [DEBUG]
  traceLog.push(`openCloseEffectProps:${openCloseEffectProps ? openCloseEffectProps._id : 'NONE'}`);
  // [/DEBUG]
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
    traceLog.push(
      `shownProps:${shownProps.length ? shownProps.map(props => props._id).join(',') : 'NONE'}`);
    // [/DEBUG]
    let topProps;
    while ((topProps = shownProps[shownProps.length - 1]) !== props) {
      // [DEBUG]
      if (topProps.state !== STATE_OPENED) { throw new Error('`shownProps` is broken.'); }
      traceLog.push(`topProps._id:${topProps._id}`, `topProps.state:${STATE_TEXT[topProps.state]}`);
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
  traceLog.push(`_id:${props._id}`, '</close>'); // [DEBUG/]
  return true;
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

  // effect functions and event listeners
  ['openEffect', 'closeEffect', 'onOpen', 'onClose', 'onBeforeOpen', 'onBeforeClose']
    .forEach(option => {
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
      state: STATE_CLOSED,
      effectFinished: {plainOverlay: false, option: false}
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

      // for closeByEscKey
      window.addEventListener('keydown', event => {
        let key, topProps;
        if (closeByEscKey &&
            ((key = event.key.toLowerCase()) === 'escape' || key === 'esc') &&
            (topProps = shownProps.length && shownProps[shownProps.length - 1]) &&
            (traceLog.push('<keydown/>', 'CLOSE', `_id:${topProps._id}`), true) && // [DEBUG/]
            close(topProps)) {
          event.preventDefault();
          event.stopImmediatePropagation(); // preventDefault stops other listeners, maybe.
          event.stopPropagation();
        }
      }, true);
    }

    mClassList(content).add(STYLE_CLASS_CONTENT);
    // Overlay
    props.plainOverlay = new PlainOverlay({
      face: content,
      onShow: () => { finishOpenEffect(props, 'plainOverlay'); },
      onHide: () => { finishCloseEffect(props, 'plainOverlay'); }
    });
    const elmPlainOverlayBody = content.parentElement; // elmOverlayBody of PlainOverlay
    mClassList(elmPlainOverlayBody.parentElement).add(STYLE_CLASS); // elmOverlay of PlainOverlay

    // elmOverlay (own overlay)
    const elmOverlay =
      props.elmOverlay = elmPlainOverlayBody.appendChild(document.createElement('div'));
    elmOverlay.className = STYLE_CLASS_OVERLAY;
    // for closeByOverlay
    elmOverlay.addEventListener('click', event => {
      if (event.target === elmOverlay && closeByOverlay) {
        traceLog.push('<overlayClick/>', 'CLOSE', `_id:${props._id}`); // [DEBUG/]
        close(props);
      }
    }, true);

    // Prepare removable event listeners for each instance.
    props.handleClose = () => { close(props); };
    // Callback functions for additional effects
    props.openEffectDone = () => { finishOpenEffect(props, 'option'); };
    props.closeEffectDone = () => { finishCloseEffect(props, 'option'); };

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

  get openEffect() { return insProps[this._id].options.openEffect; }
  set openEffect(value) { setOptions(insProps[this._id], {openEffect: value}); }

  get closeEffect() { return insProps[this._id].options.closeEffect; }
  set closeEffect(value) { setOptions(insProps[this._id], {closeEffect: value}); }

  get onOpen() { return insProps[this._id].options.onOpen; }
  set onOpen(value) { setOptions(insProps[this._id], {onOpen: value}); }

  get onClose() { return insProps[this._id].options.onClose; }
  set onClose(value) { setOptions(insProps[this._id], {onClose: value}); }

  get onBeforeOpen() { return insProps[this._id].options.onBeforeOpen; }
  set onBeforeOpen(value) { setOptions(insProps[this._id], {onBeforeOpen: value}); }

  get onBeforeClose() { return insProps[this._id].options.onBeforeClose; }
  set onBeforeClose(value) { setOptions(insProps[this._id], {onBeforeClose: value}); }

  static get closeByEscKey() { return closeByEscKey; }
  static set closeByEscKey(value) { if (typeof value === 'boolean') { closeByEscKey = value; } }

  static get closeByOverlay() { return closeByOverlay; }
  static set closeByOverlay(value) { if (typeof value === 'boolean') { closeByOverlay = value; } }

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
PlainModal.PlainOverlay = PlainOverlay; // to access to PlainOverlay.forceEvent
// [/DEBUG]

export default PlainModal;
