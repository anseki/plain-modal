/* exported utils */
/* eslint-env browser */

var utils = (function() {
  'use strict';

  function makeState(modals, states, cbChange, cbReady) {
    var timer, waitCount = 0, modalsLen, methodCalled = [], listeners = [],
      MAX_WAIT_COUNT = 500,
      EVENT_PROP_NAMES = ['onOpen', 'onClose', 'onBeforeOpen', 'onBeforeClose'];

    function doFnc() {
      clearTimeout(timer);

      var readyCount = 0;
      modals.forEach(function(modal, i) {
        if (modal.state === states[i]) {
          if (methodCalled[i]) {
            // Restore listeners
            EVENT_PROP_NAMES.forEach(function(propName) {
              modal[propName] = listeners[i][propName];
            });
          }
          readyCount++;

        } else if (!methodCalled[i]) {
          // Save listeners
          listeners[i] = {};
          EVENT_PROP_NAMES.forEach(function(propName) {
            listeners[i][propName] = modal[propName];
            modal[propName] = null;
          });

          methodCalled[i] = true;
          setTimeout(function() { cbChange(modal); }, 0); // setTimeout for separation
        }
      });

      if (readyCount >= modalsLen) {
        cbReady();
      } else {
        waitCount++;
        if (waitCount > MAX_WAIT_COUNT) { throw new Error('`state` can not become ' + states + '.'); }
        timer = setTimeout(doFnc, 10);
      }
    }

    if (!Array.isArray(modals)) { modals = [modals]; }
    modalsLen = modals.length;

    if (!Array.isArray(states)) { states = [states]; }
    var statesLen = states.length;
    if (statesLen < modalsLen) { // Repeat last value
      var lastValue = states[statesLen - 1];
      for (var i = statesLen; i < modalsLen; i++) {
        states[i] = lastValue;
      }
    }

    doFnc();
  }

  return {
    makeState: makeState
  };
})();
