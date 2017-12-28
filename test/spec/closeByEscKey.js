
describe('closeByEscKey', function() {
  'use strict';

  var window, document, utils, PlainModal, traceLog, shownProps, pageDone,
    modal1, modal2, modal3, allModals;

  function escKeyDown() {
    var event;
    try {
      event = new window.KeyboardEvent('keydown', {key: 'Escape'});
    } catch (error) {
      event = document.createEvent('KeyboardEvent');
      if (event.initKeyboardEvent) {
        event.initKeyboardEvent('keydown', true, true, document.defaultView,
          // (... charArg, keyArg ...) or (... keyArg, locationArg ...) (IE)
          'Escape', 'Escape', 0, '', false);
      } else if (event.initKeyEvent) {
        event.initKeyEvent('keydown', true, true, document.defaultView,
          false, false, false, false, 27, 0);
      } else {
        throw new Error('Can\'t init event');
      }
    }
    window.dispatchEvent(event);
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/common.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      PlainModal = window.PlainModal;
      traceLog = PlainModal.traceLog;
      shownProps = PlainModal.shownProps;

      modal1 = new PlainModal(document.getElementById('elm1'), {duration: 50});
      modal2 = new PlainModal(document.getElementById('elm2'), {duration: 50});
      modal3 = new PlainModal(document.getElementById('elm3'), {duration: 50});
      allModals = [modal1, modal2, modal3];

      window.addEventListener('keydown', function(event) {
        var key;
        if ((key = event.key.toLowerCase()) === 'escape' || key === 'esc') {
          window.cntEscKey++;
        }
      }, true);

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

  it('Normal flow - keydown -> close()', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose = null;

    var timer1;
    utils.makeState(allModals,
      [PlainModal.STATE_OPENED, PlainModal.STATE_CLOSED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        timer1 = setTimeout(function() {
          modal1.open(true);
        }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);

        expect(modal1.state).toBe(PlainModal.STATE_OPENED);
        expect(shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal1]);

        modal1.onClose = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps).toEqual([]);
            expect(window.cntEscKey).toBe(0); // window get no event

            expect(traceLog).toEqual([
              '<keydown/>', 'CLOSE', '_id:' + modal1._id,

              // START: close
              '<close>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'openCloseEffectProps:NONE',

              '<execClosing>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal1._id, '</execClosing>',

              '_id:' + modal1._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal1._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        window.cntEscKey = 0;
        PlainModal.closeByEscKey = true;
        escKeyDown();
      }
    );
  });

  it('PlainModal.closeByEscKey = false, keydown -> ignored', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose = null;

    var timer1;
    utils.makeState(allModals,
      [PlainModal.STATE_OPENED, PlainModal.STATE_CLOSED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        timer1 = setTimeout(function() {
          modal1.open(true);
        }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);

        expect(modal1.state).toBe(PlainModal.STATE_OPENED);
        expect(shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal1]);

        setTimeout(function() {
          expect(modal1.state).toBe(PlainModal.STATE_OPENED);
          expect(shownProps.map(function(props) { return props.ins; }))
            .toEqual([modal1]);
          expect(window.cntEscKey).toBe(1); // window get the event

          expect(traceLog).toEqual([]);

          done();
        }, 100);

        traceLog.length = 0;
        window.cntEscKey = 0;
        PlainModal.closeByEscKey = false;
        escKeyDown();
      }
    );
  });

  it('STATE_CLOSED, keydown -> ignored', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose = null;

    utils.makeState(allModals,
      PlainModal.STATE_CLOSED,
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        return true;
      },
      function() {

        expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
        expect(shownProps).toEqual([]);

        setTimeout(function() {
          expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
          expect(shownProps).toEqual([]);
          expect(window.cntEscKey).toBe(1); // window get the event

          expect(traceLog).toEqual([]);

          done();
        }, 100);

        traceLog.length = 0;
        window.cntEscKey = 0;
        PlainModal.closeByEscKey = true;
        escKeyDown();
      }
    );
  });

  it('STATE_OPENING, keydown -> close()', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose = null;

    var timer1;
    utils.makeState(allModals,
      [PlainModal.STATE_OPENING, PlainModal.STATE_CLOSED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        timer1 = setTimeout(function() {
          modal1.open();
        }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);

        expect(modal1.state).toBe(PlainModal.STATE_OPENING);
        expect(shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal1]);

        modal1.onClose = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps).toEqual([]);
            expect(window.cntEscKey).toBe(0); // window get no event

            expect(traceLog).toEqual([
              '<keydown/>', 'CLOSE', '_id:' + modal1._id,

              // START: close
              '<close>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'openCloseEffectProps:' + modal1._id,

              '<execClosing>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'force:false', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal1._id, '</execClosing>',

              '_id:' + modal1._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',
              '</finishClosing>',

              '_id:' + modal1._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        window.cntEscKey = 0;
        PlainModal.closeByEscKey = true;
        escKeyDown();
      }
    );
  });

  it('STATE_CLOSING, keydown -> close() -> CANCEL', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose = null;

    var timer1;
    utils.makeState(allModals,
      [PlainModal.STATE_CLOSING, PlainModal.STATE_CLOSED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        timer1 = setTimeout(function() {
          modal1.open(true);
          timer1 = setTimeout(function() {
            modal1.close();
          }, 10);
        }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);

        expect(modal1.state).toBe(PlainModal.STATE_CLOSING);
        expect(shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal1]);

        setTimeout(function() {
          expect(modal1.state).toBe(PlainModal.STATE_CLOSING);
          expect(shownProps.map(function(props) { return props.ins; }))
            .toEqual([modal1]);
          expect(window.cntEscKey).toBe(1); // window get the event

          expect(traceLog).toEqual([
            '<keydown/>', 'CLOSE', '_id:' + modal1._id,

            '<close>', '_id:' + modal1._id, 'state:STATE_CLOSING', 'CANCEL', '</close>'
          ]);

          done();
        }, 0);

        traceLog.length = 0;
        window.cntEscKey = 0;
        PlainModal.closeByEscKey = true;
        escKeyDown();
      }
    );
  });

  it('STATE_OPENED * 3, keydown * 2 -> close() * 2', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose = null;

    var timer1, timer2, timer3;
    utils.makeState(allModals,
      [PlainModal.STATE_INACTIVATED, PlainModal.STATE_INACTIVATED, PlainModal.STATE_OPENED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        timer1 = setTimeout(function() { modal1.open(true); }, 10);
        timer2 = setTimeout(function() { modal2.open(true); }, 10);
        timer3 = setTimeout(function() { modal3.open(true); }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);

        expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal2.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal3.state).toBe(PlainModal.STATE_OPENED);
        expect(shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal1, modal2, modal3]);

        modal2.onClose = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_OPENED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1]);
            expect(window.cntEscKey).toBe(0); // window get no event

            expect(traceLog).toEqual([
              '<keydown/>', 'CLOSE', '_id:' + modal3._id,

              // 3 START: close
              '<close>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'openCloseEffectProps:NONE',

              '<execClosing>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:50ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal3._id, '</execClosing>',

              '_id:' + modal3._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal3._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal3._id, 'state:STATE_CLOSING',
              'shownProps:' + modal1._id + ',' + modal2._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal2._id,

              '</finishClosing>',

              '_id:' + modal3._id, '</finishCloseEffect>',

              '<keydown/>', 'CLOSE', '_id:' + modal2._id,

              // 2 START: close
              '<close>', '_id:' + modal2._id, 'state:STATE_OPENED',
              'openCloseEffectProps:NONE',

              '<execClosing>', '_id:' + modal2._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:50ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal2._id, '</execClosing>',

              '_id:' + modal2._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'shownProps:' + modal1._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal1._id,

              '</finishClosing>',

              '_id:' + modal2._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        window.cntEscKey = 0;
        PlainModal.closeByEscKey = true;
        escKeyDown();
        setTimeout(function() {
          escKeyDown();
        }, 100);
      }
    );
  });

  it('STATE_OPENED * 2, keydown * 4 -> close() * 2', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose = null;

    var timer1, timer2;
    utils.makeState(allModals,
      [PlainModal.STATE_OPENED, PlainModal.STATE_CLOSED, PlainModal.STATE_INACTIVATED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        // 3, 1
        timer1 = setTimeout(function() { modal3.open(true); }, 10);
        timer2 = setTimeout(function() { modal1.open(true); }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);
        clearTimeout(timer2);

        expect(modal3.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal1.state).toBe(PlainModal.STATE_OPENED);
        expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
        expect(shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal3, modal1]);

        traceLog.length = 0;
        window.cntEscKey = 0;
        PlainModal.closeByEscKey = true;

        escKeyDown(); // 1

        setTimeout(function() {

          expect(modal3.state).toBe(PlainModal.STATE_OPENED);
          expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
          expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
          expect(shownProps.map(function(props) { return props.ins; }))
            .toEqual([modal3]);
          expect(window.cntEscKey).toBe(0); // window get no event

          escKeyDown(); // 3

          setTimeout(function() {

            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps).toEqual([]);
            expect(window.cntEscKey).toBe(0); // window get no event

            escKeyDown(); // No modal

            setTimeout(function() {

              expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
              expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
              expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
              expect(shownProps).toEqual([]);
              expect(window.cntEscKey).toBe(1); // window get the event

              escKeyDown(); // No modal

              setTimeout(function() {

                expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
                expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
                expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
                expect(shownProps).toEqual([]);
                expect(window.cntEscKey).toBe(2); // window get the event

                expect(traceLog).toEqual([
                  '<keydown/>', 'CLOSE', '_id:' + modal1._id,

                  // 1 START: close
                  '<close>', '_id:' + modal1._id, 'state:STATE_OPENED',
                  'openCloseEffectProps:NONE',

                  '<execClosing>', '_id:' + modal1._id, 'state:STATE_OPENED',
                  'force:false', 'sync:false',

                  'parentProps._id:' + modal3._id, 'parentProps.state:STATE_INACTIVATED',
                  'elmOverlay.duration:50ms',
                  'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:false',
                  'parentProps.state:STATE_ACTIVATING',
                  'state:STATE_CLOSING',

                  '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_CLOSING',
                  'plainDraggable:NONE',
                  '</switchDraggable>',

                  // PlainOverlay.hide()
                  '_id:' + modal1._id, '</execClosing>',

                  '_id:' + modal1._id, '</close>',
                  // DONE: close

                  '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
                  'effectKey:plainOverlay',
                  'effectFinished.plainOverlay:true',
                  'effectFinished.option:false', 'closeEffect:NO',

                  '<finishClosing>', '_id:' + modal1._id, 'state:STATE_CLOSING',
                  'shownProps:' + modal3._id,
                  'state:STATE_CLOSED',

                  'parentProps._id:' + modal3._id, 'parentProps.state:STATE_ACTIVATING',
                  'parentProps.state:STATE_OPENED',

                  '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_OPENED',
                  'plainDraggable:NONE',
                  '</switchDraggable>',

                  'parentProps(UNLINK):' + modal3._id,

                  '</finishClosing>',

                  '_id:' + modal1._id, '</finishCloseEffect>',

                  '<keydown/>', 'CLOSE', '_id:' + modal3._id,

                  // 3 START: close
                  '<close>', '_id:' + modal3._id, 'state:STATE_OPENED',
                  'openCloseEffectProps:NONE',

                  '<execClosing>', '_id:' + modal3._id, 'state:STATE_OPENED',
                  'force:false', 'sync:false',
                  'state:STATE_CLOSING',

                  '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_CLOSING',
                  'plainDraggable:NONE',
                  '</switchDraggable>',

                  // PlainOverlay.hide()
                  '_id:' + modal3._id, '</execClosing>',

                  '_id:' + modal3._id, '</close>',
                  // DONE: close

                  '<finishCloseEffect>', '_id:' + modal3._id, 'state:STATE_CLOSING',
                  'effectKey:plainOverlay',
                  'effectFinished.plainOverlay:true',
                  'effectFinished.option:false', 'closeEffect:NO',

                  '<finishClosing>', '_id:' + modal3._id, 'state:STATE_CLOSING',
                  'shownProps:NONE',
                  'state:STATE_CLOSED',
                  '</finishClosing>',

                  '_id:' + modal3._id, '</finishCloseEffect>'
                ]);

                done();

              }, 50);
            }, 50);
          }, 100);
        }, 100);
      }
    );
  });

});
