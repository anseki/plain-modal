describe('flow', function() {
  'use strict';

  var cbChangeFncs = {},
    window, document, utils, PlainModal, traceLog, pageDone,
    modal, modalCh, timer;

  beforeAll(function(beforeDone) {
    loadPage('spec/common.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      PlainModal = window.PlainModal;
      traceLog = PlainModal.traceLog;

      modal = new PlainModal(document.getElementById('elm1'), {
        dragHandle: document.getElementById('handle11'),
        duration: 100
      });
      modalCh = new PlainModal(document.getElementById('elm2'), {
        dragHandle: document.getElementById('handle21'),
        duration: 150
      });

      // Init cbChange of utils.makeState (1st, close(true) to reset)
      cbChangeFncs[PlainModal.STATE_CLOSED] = function(modal) {
        modal.close(true);
        modalCh.close(true);
      };
      cbChangeFncs[PlainModal.STATE_OPENING] = function(modal) {
        modal.close(true);
        modalCh.close(true);
        timer = setTimeout(function() {
          modal.open();
        }, 10);
      };
      cbChangeFncs[PlainModal.STATE_OPENED] = function(modal) {
        modal.close(true);
        modalCh.close(true);
        timer = setTimeout(function() {
          modal.open(true);
        }, 10);
      };
      cbChangeFncs[PlainModal.STATE_CLOSING] = function(modal) {
        // Already closed
        modal.open(true);
        timer = setTimeout(function() {
          modal.close();
        }, 10);
      };
      cbChangeFncs[PlainModal.STATE_INACTIVATING] = function(modal) {
        modal.close(true);
        modalCh.close(true);
        timer = setTimeout(function() {
          modal.open(true);
          timer = setTimeout(function() {
            modalCh.open();
          }, 10);
        }, 10);
      };
      cbChangeFncs[PlainModal.STATE_INACTIVATED] = function(modal) {
        modal.close(true);
        modalCh.close(true);
        timer = setTimeout(function() {
          modal.open(true);
          timer = setTimeout(function() {
            modalCh.open(true);
          }, 10);
        }, 10);
      };
      cbChangeFncs[PlainModal.STATE_ACTIVATING] = function(modal) {
        modal.close(true);
        modalCh.close(true);
        timer = setTimeout(function() {
          modal.open(true);
          timer = setTimeout(function() {
            modalCh.open(true);
            timer = setTimeout(function() {
              modalCh.close();
            }, 10);
          }, 10);
        }, 10);
      };

      pageDone = done;
      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainModal.limit).toBe(!!self.top.LIMIT);
  });

  it('Normal flow - open() -> close()', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_CLOSED,
      cbChangeFncs[PlainModal.STATE_CLOSED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_CLOSED);

        modal.onOpen = function() { setTimeout(function() { modal.close(); }, 0); };
        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: open
              '<open>', '_id:' + modal._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:NONE',
              'shownProps:' + modal._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal._id, 'state:STATE_CLOSED',
              'force:false',
              'state:STATE_OPENING',
              // PlainOverlay.show()
              '_id:' + modal._id, '</execOpening>',

              '_id:' + modal._id, '</open>',
              // DONE: open

              '<finishOpenEffect>', '_id:' + modal._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              '</finishOpening>',

              '_id:' + modal._id, '</finishOpenEffect>',

              // onOpen -> close()

              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_OPENED',
              'openCloseEffectProps:NONE',

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.open();
      }
    );
  });

  // 'STATE_CLOSED -> open()' in 'Normal flow'

  it('STATE_OPENING -> open()', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_OPENING,
      cbChangeFncs[PlainModal.STATE_OPENING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_OPENING);

        traceLog.length = 0;
        modal.open();

        expect(traceLog).toEqual([
          '<open>', '_id:' + modal._id, 'state:STATE_OPENING', 'CANCEL', '</open>'
        ]);

        done();
      }
    );
  });

  it('STATE_OPENED -> open()', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_OPENED,
      cbChangeFncs[PlainModal.STATE_OPENED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_OPENED);

        traceLog.length = 0;
        modal.open();

        expect(traceLog).toEqual([
          '<open>', '_id:' + modal._id, 'state:STATE_OPENED', 'CANCEL', '</open>'
        ]);

        done();
      }
    );
  });

  it('STATE_CLOSING -> open()', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    // First, close it without catching STATE_CLOSING
    utils.makeState([modal, modalCh], PlainModal.STATE_CLOSED,
      cbChangeFncs[PlainModal.STATE_CLOSED],
      function() {

        utils.makeState(modal, PlainModal.STATE_CLOSING,
          cbChangeFncs[PlainModal.STATE_CLOSING],
          function() {
            clearTimeout(timer);

            expect(modal.state).toBe(PlainModal.STATE_CLOSING);

            modal.onOpen = function() {
              setTimeout(function() {
                expect(traceLog).toEqual([
                  // START: open
                  '<open>', '_id:' + modal._id, 'state:STATE_CLOSING',
                  'openCloseEffectProps:' + modal._id,

                  '<execOpening>', '_id:' + modal._id, 'state:STATE_CLOSING',
                  'force:false',
                  'state:STATE_OPENING',
                  // PlainOverlay.show()
                  '_id:' + modal._id, '</execOpening>',

                  '_id:' + modal._id, '</open>',
                  // DONE: open

                  '<finishOpenEffect>', '_id:' + modal._id, 'state:STATE_OPENING',
                  'effectKey:plainOverlay',
                  'effectFinished.plainOverlay:true',
                  'effectFinished.option:false', 'openEffect:NO',

                  '<finishOpening>', '_id:' + modal._id, 'state:STATE_OPENING',
                  'state:STATE_OPENED',

                  '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
                  'plainDraggable.disabled:false',
                  '</switchDraggable>',

                  '</finishOpening>',

                  '_id:' + modal._id, '</finishOpenEffect>'
                ]);

                done();
              }, 0);
            };

            traceLog.length = 0;
            modal.open();
          }
        );

      }
    );
  });

  it('STATE_INACTIVATING -> open()', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_INACTIVATING,
      cbChangeFncs[PlainModal.STATE_INACTIVATING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_INACTIVATING);

        traceLog.length = 0;
        modal.open();

        expect(traceLog).toEqual([
          '<open>', '_id:' + modal._id, 'state:STATE_INACTIVATING', 'CANCEL', '</open>'
        ]);

        done();
      }
    );
  });

  it('STATE_INACTIVATED -> open()', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_INACTIVATED,
      cbChangeFncs[PlainModal.STATE_INACTIVATED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_INACTIVATED);

        traceLog.length = 0;
        modal.open();

        expect(traceLog).toEqual([
          '<open>', '_id:' + modal._id, 'state:STATE_INACTIVATED', 'CANCEL', '</open>'
        ]);

        done();
      }
    );
  });

  it('STATE_ACTIVATING -> open()', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_ACTIVATING,
      cbChangeFncs[PlainModal.STATE_ACTIVATING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_ACTIVATING);

        traceLog.length = 0;
        modal.open();

        expect(traceLog).toEqual([
          '<open>', '_id:' + modal._id, 'state:STATE_ACTIVATING', 'CANCEL', '</open>'
        ]);

        done();
      }
    );
  });

  it('STATE_CLOSED -> open(force)', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_CLOSED,
      cbChangeFncs[PlainModal.STATE_CLOSED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_CLOSED);

        modal.onOpen = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: open
              '<open>', '_id:' + modal._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:NONE',
              'shownProps:' + modal._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal._id, 'state:STATE_CLOSED',
              'force:true',
              'state:STATE_OPENING',
              // PlainOverlay.show()

              '<finishOpenEffect>', '_id:' + modal._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              '</finishOpening>',

              '_id:' + modal._id, '</finishOpenEffect>',

              '_id:' + modal._id, '</execOpening>',

              '_id:' + modal._id, '</open>'
              // DONE: open
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.open(true);
      }
    );
  });

  it('STATE_OPENING -> open(force)', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_OPENING,
      cbChangeFncs[PlainModal.STATE_OPENING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_OPENING);

        modal.onOpen = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: open
              '<open>', '_id:' + modal._id, 'state:STATE_OPENING',
              'openCloseEffectProps:' + modal._id,

              '<execOpening>', '_id:' + modal._id, 'state:STATE_OPENING',
              'force:true',
              'state:STATE_OPENING',
              // PlainOverlay.show()

              '<finishOpenEffect>', '_id:' + modal._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              '</finishOpening>',

              '_id:' + modal._id, '</finishOpenEffect>',

              '_id:' + modal._id, '</execOpening>',

              '_id:' + modal._id, '</open>'
              // DONE: open
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.open(true);
      }
    );
  });

  it('STATE_OPENED -> open(force)', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_OPENED,
      cbChangeFncs[PlainModal.STATE_OPENED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_OPENED);

        traceLog.length = 0;
        modal.open(true);

        expect(traceLog).toEqual([
          '<open>', '_id:' + modal._id, 'state:STATE_OPENED', 'CANCEL', '</open>'
        ]);

        done();
      }
    );
  });

  it('STATE_CLOSING -> open(force)', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    // First, close it without catching STATE_CLOSING
    utils.makeState([modal, modalCh], PlainModal.STATE_CLOSED,
      cbChangeFncs[PlainModal.STATE_CLOSED],
      function() {

        utils.makeState(modal, PlainModal.STATE_CLOSING,
          cbChangeFncs[PlainModal.STATE_CLOSING],
          function() {
            clearTimeout(timer);

            expect(modal.state).toBe(PlainModal.STATE_CLOSING);

            modal.onOpen = function() {
              setTimeout(function() {
                expect(traceLog).toEqual([
                  // START: open
                  '<open>', '_id:' + modal._id, 'state:STATE_CLOSING',
                  'openCloseEffectProps:' + modal._id,

                  '<execOpening>', '_id:' + modal._id, 'state:STATE_CLOSING',
                  'force:true',
                  'state:STATE_OPENING',
                  // PlainOverlay.show()

                  '<finishOpenEffect>', '_id:' + modal._id, 'state:STATE_OPENING',
                  'effectKey:plainOverlay',
                  'effectFinished.plainOverlay:true',
                  'effectFinished.option:false', 'openEffect:NO',

                  '<finishOpening>', '_id:' + modal._id, 'state:STATE_OPENING',
                  'state:STATE_OPENED',

                  '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
                  'plainDraggable.disabled:false',
                  '</switchDraggable>',

                  '</finishOpening>',

                  '_id:' + modal._id, '</finishOpenEffect>',

                  '_id:' + modal._id, '</execOpening>',

                  '_id:' + modal._id, '</open>'
                  // DONE: open
                ]);

                done();
              }, 0);
            };

            traceLog.length = 0;
            modal.open(true);
          }
        );

      }
    );
  });

  it('STATE_INACTIVATING -> open(force)', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_INACTIVATING,
      cbChangeFncs[PlainModal.STATE_INACTIVATING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_INACTIVATING);

        traceLog.length = 0;
        modal.open(true);

        expect(traceLog).toEqual([
          '<open>', '_id:' + modal._id, 'state:STATE_INACTIVATING', 'CANCEL', '</open>'
        ]);

        done();
      }
    );
  });

  it('STATE_INACTIVATED -> open(force)', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_INACTIVATED,
      cbChangeFncs[PlainModal.STATE_INACTIVATED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_INACTIVATED);

        traceLog.length = 0;
        modal.open(true);

        expect(traceLog).toEqual([
          '<open>', '_id:' + modal._id, 'state:STATE_INACTIVATED', 'CANCEL', '</open>'
        ]);

        done();
      }
    );
  });

  it('STATE_ACTIVATING -> open(force)', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_ACTIVATING,
      cbChangeFncs[PlainModal.STATE_ACTIVATING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_ACTIVATING);

        traceLog.length = 0;
        modal.open(true);

        expect(traceLog).toEqual([
          '<open>', '_id:' + modal._id, 'state:STATE_ACTIVATING', 'CANCEL', '</open>'
        ]);

        done();
      }
    );
  });

  it('STATE_CLOSED -> close()', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_CLOSED,
      cbChangeFncs[PlainModal.STATE_CLOSED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_CLOSED);

        traceLog.length = 0;
        modal.close();

        expect(traceLog).toEqual([
          '<close>', '_id:' + modal._id, 'state:STATE_CLOSED', 'CANCEL', '</close>'
        ]);

        done();
      }
    );
  });

  it('STATE_OPENING -> close()', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_OPENING,
      cbChangeFncs[PlainModal.STATE_OPENING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_OPENING);

        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_OPENING',
              'openCloseEffectProps:' + modal._id,

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENING',
              'force:false', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.close();
      }
    );
  });

  // 'STATE_OPENED -> close()' in 'Normal flow'

  it('STATE_CLOSING -> close()', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    // First, close it without catching STATE_CLOSING
    utils.makeState([modal, modalCh], PlainModal.STATE_CLOSED,
      cbChangeFncs[PlainModal.STATE_CLOSED],
      function() {

        utils.makeState(modal, PlainModal.STATE_CLOSING,
          cbChangeFncs[PlainModal.STATE_CLOSING],
          function() {
            clearTimeout(timer);

            expect(modal.state).toBe(PlainModal.STATE_CLOSING);

            traceLog.length = 0;
            modal.close();

            expect(traceLog).toEqual([
              '<close>', '_id:' + modal._id, 'state:STATE_CLOSING', 'CANCEL', '</close>'
            ]);

            done();
          }
        );

      }
    );
  });

  it('STATE_INACTIVATING -> close()', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_INACTIVATING,
      cbChangeFncs[PlainModal.STATE_INACTIVATING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_INACTIVATING);

        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_INACTIVATING',
              'openCloseEffectProps:' + modalCh._id,

              // START: fixOpenClose
              '<fixOpenClose>', '_id:' + modalCh._id, 'state:STATE_OPENING',

              '<execOpening>', '_id:' + modalCh._id, 'state:STATE_OPENING',
              'force:true',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_INACTIVATING',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_INACTIVATING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '<finishOpenEffect>', '_id:' + modalCh._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modalCh._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modalCh._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_INACTIVATING',
              'parentProps.state:STATE_INACTIVATED',

              '</finishOpening>',

              '_id:' + modalCh._id, '</finishOpenEffect>',

              '_id:' + modalCh._id, '</execOpening>',

              '_id:' + modalCh._id, '</fixOpenClose>',
              // DONE: fixOpenClose

              'shownProps:' + modal._id + ',' + modalCh._id,

              // START: Close others - loop
              'topProps._id:' + modalCh._id, 'topProps.state:STATE_OPENED',

              '<execClosing>', '_id:' + modalCh._id, 'state:STATE_OPENED',
              'force:true', 'sync:true',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:150ms',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()

              '<finishCloseEffect>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'shownProps:' + modal._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal._id,

              '</finishClosing>',

              '_id:' + modalCh._id, '</finishCloseEffect>',

              '_id:' + modalCh._id, '</execClosing>',
              // DONE: Close others - loop

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 400);
        };

        traceLog.length = 0;
        modal.close();
      }
    );
  });

  it('STATE_INACTIVATED -> close()', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_INACTIVATED,
      cbChangeFncs[PlainModal.STATE_INACTIVATED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_INACTIVATED);

        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_INACTIVATED',
              'openCloseEffectProps:NONE',

              'shownProps:' + modal._id + ',' + modalCh._id,

              // START: Close others - loop
              'topProps._id:' + modalCh._id, 'topProps.state:STATE_OPENED',

              '<execClosing>', '_id:' + modalCh._id, 'state:STATE_OPENED',
              'force:true', 'sync:true',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:150ms',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()

              '<finishCloseEffect>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'shownProps:' + modal._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal._id,

              '</finishClosing>',

              '_id:' + modalCh._id, '</finishCloseEffect>',

              '_id:' + modalCh._id, '</execClosing>',
              // DONE: Close others - loop

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.close();
      }
    );
  });

  it('STATE_ACTIVATING -> close()', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_ACTIVATING,
      cbChangeFncs[PlainModal.STATE_ACTIVATING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_ACTIVATING);

        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_ACTIVATING',
              'openCloseEffectProps:' + modalCh._id,

              // START: fixOpenClose
              '<fixOpenClose>', '_id:' + modalCh._id, 'state:STATE_CLOSING',

              '<execClosing>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'force:true', 'sync:true',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_ACTIVATING',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()

              '<finishCloseEffect>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'shownProps:' + modal._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal._id,

              '</finishClosing>',

              '_id:' + modalCh._id, '</finishCloseEffect>',

              '_id:' + modalCh._id, '</execClosing>',

              '_id:' + modalCh._id, '</fixOpenClose>',
              // DONE: fixOpenClose

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.close();
      }
    );
  });

  it('STATE_CLOSED -> close(force)', function(done) { // -> CANCEL
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_CLOSED,
      cbChangeFncs[PlainModal.STATE_CLOSED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_CLOSED);

        traceLog.length = 0;
        modal.close(true);

        expect(traceLog).toEqual([
          '<close>', '_id:' + modal._id, 'state:STATE_CLOSED', 'CANCEL', '</close>'
        ]);

        done();
      }
    );
  });

  it('STATE_OPENING -> close(force)', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_OPENING,
      cbChangeFncs[PlainModal.STATE_OPENING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_OPENING);

        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_OPENING',
              'openCloseEffectProps:' + modal._id,

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENING',
              'force:true', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.close(true);
      }
    );
  });

  it('STATE_OPENED -> close(force)', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_OPENED,
      cbChangeFncs[PlainModal.STATE_OPENED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_OPENED);

        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_OPENED',
              'openCloseEffectProps:NONE',

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
              'force:true', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.close(true);
      }
    );
  });

  it('STATE_CLOSING -> close(force)', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    // First, close it without catching STATE_CLOSING
    utils.makeState([modal, modalCh], PlainModal.STATE_CLOSED,
      cbChangeFncs[PlainModal.STATE_CLOSED],
      function() {

        utils.makeState(modal, PlainModal.STATE_CLOSING,
          cbChangeFncs[PlainModal.STATE_CLOSING],
          function() {
            clearTimeout(timer);

            expect(modal.state).toBe(PlainModal.STATE_CLOSING);

            modal.onClose = function() {
              setTimeout(function() {
                expect(traceLog).toEqual([
                  // START: close
                  '<close>', '_id:' + modal._id, 'state:STATE_CLOSING',
                  'openCloseEffectProps:' + modal._id,

                  '<execClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
                  'force:true', 'sync:false',
                  'state:STATE_CLOSING',

                  '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
                  'plainDraggable.disabled:true',
                  '</switchDraggable>',

                  // PlainOverlay.hide()
                  '_id:' + modal._id, '</execClosing>',

                  '_id:' + modal._id, '</close>',
                  // DONE: close

                  '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
                  'effectKey:plainOverlay',
                  'effectFinished.plainOverlay:true',
                  'effectFinished.option:false', 'closeEffect:NO',

                  '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
                  'shownProps:NONE',
                  'state:STATE_CLOSED',
                  '</finishClosing>',

                  '_id:' + modal._id, '</finishCloseEffect>'
                ]);

                done();
              }, 0);
            };

            traceLog.length = 0;
            modal.close(true);
          }
        );

      }
    );
  });

  it('STATE_INACTIVATING -> close(force)', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_INACTIVATING,
      cbChangeFncs[PlainModal.STATE_INACTIVATING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_INACTIVATING);

        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_INACTIVATING',
              'openCloseEffectProps:' + modalCh._id,

              // START: fixOpenClose
              '<fixOpenClose>', '_id:' + modalCh._id, 'state:STATE_OPENING',

              '<execOpening>', '_id:' + modalCh._id, 'state:STATE_OPENING',
              'force:true',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_INACTIVATING',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_INACTIVATING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '<finishOpenEffect>', '_id:' + modalCh._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modalCh._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modalCh._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_INACTIVATING',
              'parentProps.state:STATE_INACTIVATED',

              '</finishOpening>',

              '_id:' + modalCh._id, '</finishOpenEffect>',

              '_id:' + modalCh._id, '</execOpening>',

              '_id:' + modalCh._id, '</fixOpenClose>',
              // DONE: fixOpenClose

              'shownProps:' + modal._id + ',' + modalCh._id,

              // START: Close others - loop
              'topProps._id:' + modalCh._id, 'topProps.state:STATE_OPENED',

              '<execClosing>', '_id:' + modalCh._id, 'state:STATE_OPENED',
              'force:true', 'sync:true',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:150ms',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()

              '<finishCloseEffect>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'shownProps:' + modal._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal._id,

              '</finishClosing>',

              '_id:' + modalCh._id, '</finishCloseEffect>',

              '_id:' + modalCh._id, '</execClosing>',
              // DONE: Close others - loop

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
              'force:true', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.close(true);
      }
    );
  });

  it('STATE_INACTIVATED -> close(force)', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_INACTIVATED,
      cbChangeFncs[PlainModal.STATE_INACTIVATED],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_INACTIVATED);

        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_INACTIVATED',
              'openCloseEffectProps:NONE',

              'shownProps:' + modal._id + ',' + modalCh._id,

              // START: Close others - loop
              'topProps._id:' + modalCh._id, 'topProps.state:STATE_OPENED',

              '<execClosing>', '_id:' + modalCh._id, 'state:STATE_OPENED',
              'force:true', 'sync:true',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:150ms',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()

              '<finishCloseEffect>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'shownProps:' + modal._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal._id,

              '</finishClosing>',

              '_id:' + modalCh._id, '</finishCloseEffect>',

              '_id:' + modalCh._id, '</execClosing>',
              // DONE: Close others - loop

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
              'force:true', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.close(true);
      }
    );
  });

  it('STATE_ACTIVATING -> close(force)', function(done) {
    modal.onOpen = modal.onClose = modal.onBeforeOpen = modal.onBeforeClose = null;

    utils.makeState(modal, PlainModal.STATE_ACTIVATING,
      cbChangeFncs[PlainModal.STATE_ACTIVATING],
      function() {
        clearTimeout(timer);

        expect(modal.state).toBe(PlainModal.STATE_ACTIVATING);

        modal.onClose = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal._id, 'state:STATE_ACTIVATING',
              'openCloseEffectProps:' + modalCh._id,

              // START: fixOpenClose
              '<fixOpenClose>', '_id:' + modalCh._id, 'state:STATE_CLOSING',

              '<execClosing>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'force:true', 'sync:true',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_ACTIVATING',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()

              '<finishCloseEffect>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modalCh._id, 'state:STATE_CLOSING',
              'shownProps:' + modal._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal._id,

              '</finishClosing>',

              '_id:' + modalCh._id, '</finishCloseEffect>',

              '_id:' + modalCh._id, '</execClosing>',

              '_id:' + modalCh._id, '</fixOpenClose>',
              // DONE: fixOpenClose

              '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
              'force:true', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal._id, '</execClosing>',

              '_id:' + modal._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal.close(true);
      }
    );
  });

});
