
describe('openEffect, closeEffect', function() {
  'use strict';

  var window, document, utils, PlainModal, traceLog, pageDone,
    modal1, modal2, modal3, allModals, lastDone = {};

  function cbChangeClose(modal) { modal.close(true); }

  function clearCb() {
    modal1.openEffect = modal1.closeEffect =
      modal2.openEffect = modal2.closeEffect =
      modal3.openEffect = modal3.closeEffect =
      modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose = null;
  }

  function getEffectCb(id, type, duration) {
    var label = '<' + type + 'Effect/>';
    return function(done) {
      traceLog.push(label, '_id:' + id, 'force:' + !done);
      if (done) {
        lastDone[type] = done;
        setTimeout(function() {
          traceLog.push(label, '_id:' + id, 'DONE');
          done();
          traceLog.push(label, '_id:' + id, 'DONE(AGAIN)');
          done();
        }, duration);
      }
    };
  }

  function getEffectCbWithProp(modal, type, duration) {
    var label = '<' + type + 'Effect/>';
    return function(done) {
      traceLog.push(label, '_id:' + modal._id, 'force:' + !done);
      if (done) {
        setTimeout(function() {
          traceLog.push(label, '_id:' + modal._id, 'DONE');
          modal.effectDone();
          traceLog.push(label, '_id:' + modal._id, 'DONE(AGAIN)');
          var fnc = modal.effectDone; // Check that it is not method
          fnc();
        }, duration);
      }
    };
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/common.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      PlainModal = window.PlainModal;
      traceLog = PlainModal.traceLog;

      modal1 = new PlainModal(document.getElementById('elm1'), {duration: 80});
      modal2 = new PlainModal(document.getElementById('elm2'), {duration: 80});
      modal3 = new PlainModal(document.getElementById('elm3'), {duration: 80});
      allModals = [modal1, modal2, modal3];

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

  it('Normal flow', function(done) {
    clearCb();
    utils.makeState(allModals, PlainModal.STATE_CLOSED,
      cbChangeClose,
      function() {

        modal1.openEffect = getEffectCb(modal1._id, 'open', 120); // Finish after overlay effect
        modal1.closeEffect = getEffectCb(modal1._id, 'close', 40); // Finish before overlay effect

        modal1.onOpen = function() {
          traceLog.push('DONE.open(onOpen)');
          lastDone.open(); // In event

          setTimeout(function() {
            traceLog.push('DONE.open(OPENED)');
            lastDone.open(); // After event

            modal1.close();
          }, 0);
        };
        modal1.onClose = function() {
          traceLog.push('DONE.close(onClose)');
          lastDone.close(); // In event
          traceLog.push('DONE.open(onClose)');
          lastDone.open(); // In event (`open` again)

          setTimeout(function() {
            traceLog.push('DONE.open(CLOSED)');
            lastDone.open(); // Out of process
            traceLog.push('DONE.close(CLOSED)');
            lastDone.close(); // Out of process

            expect(traceLog).toEqual([
              // START: open
              '<open>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:NONE',
              'shownProps:' + modal1._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'force:false',
              'state:STATE_OPENING',
              // PlainOverlay.show()
              '<openEffect/>', '_id:' + modal1._id, 'force:false', // openEffect
              '_id:' + modal1._id, '</execOpening>',

              '_id:' + modal1._id, '</open>',
              // DONE: open

              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:YES',
              '_id:' + modal1._id, '</finishOpenEffect>',

              '<openEffect/>', '_id:' + modal1._id, 'DONE', // openEffect

              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'effectKey:option',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'openEffect:YES',

              '<finishOpening>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'DONE.open(onOpen)',
              // Canceled
              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'effectKey:option',
              'CANCEL', '</finishOpenEffect>',

              '</finishOpening>',

              '_id:' + modal1._id, '</finishOpenEffect>',

              '<openEffect/>', '_id:' + modal1._id, 'DONE(AGAIN)', // openEffect (AGAIN)
              // Canceled
              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'effectKey:option',
              'CANCEL', '</finishOpenEffect>',

              'DONE.open(OPENED)',
              // Canceled
              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'effectKey:option',
              'CANCEL', '</finishOpenEffect>',

              // onOpen -> close()

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
              '<closeEffect/>', '_id:' + modal1._id, 'force:false', // closeEffect
              '_id:' + modal1._id, '</execClosing>',

              '_id:' + modal1._id, '</close>',
              // DONE: close

              '<closeEffect/>', '_id:' + modal1._id, 'DONE', // closeEffect

              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:option',
              'effectFinished.plainOverlay:false',
              'effectFinished.option:true', 'closeEffect:YES',
              '_id:' + modal1._id, '</finishCloseEffect>',

              '<closeEffect/>', '_id:' + modal1._id, 'DONE(AGAIN)', // closeEffect (AGAIN)
              // Not canceled, repeat it
              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:option',
              'effectFinished.plainOverlay:false',
              'effectFinished.option:true', 'closeEffect:YES',
              '_id:' + modal1._id, '</finishCloseEffect>',

              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'closeEffect:YES',

              '<finishClosing>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',

              'DONE.close(onClose)',
              // Canceled
              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'effectKey:option',
              'CANCEL', '</finishCloseEffect>',

              'DONE.open(onClose)',
              // Canceled
              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'effectKey:option',
              'CANCEL', '</finishOpenEffect>',

              '</finishClosing>',

              '_id:' + modal1._id, '</finishCloseEffect>',

              'DONE.open(CLOSED)',
              // Canceled
              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'effectKey:option',
              'CANCEL', '</finishOpenEffect>',

              'DONE.close(CLOSED)',
              // Canceled
              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'effectKey:option',
              'CANCEL', '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal1.open();
      }
    );
  });

  it('force:true', function(done) {
    clearCb();
    utils.makeState(allModals, PlainModal.STATE_CLOSED,
      cbChangeClose,
      function() {

        modal1.openEffect = getEffectCb(modal1._id, 'open', 120);
        modal1.closeEffect = getEffectCb(modal1._id, 'close', 40);

        modal1.onOpen = function() { setTimeout(function() { modal1.close(true); }, 0); };
        modal1.onClose = function() {
          setTimeout(function() {

            expect(traceLog).toEqual([
              // START: open
              '<open>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:NONE',
              'shownProps:' + modal1._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'force:true',
              'state:STATE_OPENING',

              // PlainOverlay.show()
              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:YES',
              '_id:' + modal1._id, '</finishOpenEffect>',

              '<openEffect/>', '_id:' + modal1._id, 'force:true', // openEffect

              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'effectKey:option',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'openEffect:YES',

              '<finishOpening>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              '</finishOpening>',

              '_id:' + modal1._id, '</finishOpenEffect>',

              '_id:' + modal1._id, '</execOpening>',

              '_id:' + modal1._id, '</open>',
              // DONE: open

              // onOpen -> close()

              // START: close
              '<close>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'openCloseEffectProps:NONE',

              '<execClosing>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'force:true', 'sync:false',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()

              '<closeEffect/>', '_id:' + modal1._id, 'force:true', // closeEffect

              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:option',
              'effectFinished.plainOverlay:false',
              'effectFinished.option:true', 'closeEffect:YES',
              '_id:' + modal1._id, '</finishCloseEffect>',

              '_id:' + modal1._id, '</execClosing>',

              '_id:' + modal1._id, '</close>',
              // DONE: close

              // close() -> plainOverlay.hide() runs asynchronously even if `force` is `true`
              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'closeEffect:YES',

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
        modal1.open(true);
      }
    );
  });

  it('force:true, sync:true', function(done) {
    clearCb();
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
        expect(PlainModal.shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal1, modal2, modal3]);

        modal1.openEffect = getEffectCb(modal1._id, 'open', 120);
        modal1.closeEffect = getEffectCb(modal1._id, 'close', 120);
        modal2.openEffect = getEffectCb(modal2._id, 'open', 120);
        modal2.closeEffect = getEffectCb(modal2._id, 'close', 120);
        modal3.openEffect = getEffectCb(modal3._id, 'open', 120);
        modal3.closeEffect = getEffectCb(modal3._id, 'close', 120);

        modal2.onClose = function() {
          traceLog.push('DONE.close(onClose)');
          lastDone.close(); // In event

          setTimeout(function() {
            traceLog.push('DONE.close(CLOSED)');
            lastDone.close(); // Out of process

            expect(modal1.state).toBe(PlainModal.STATE_OPENED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(PlainModal.shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1]);

            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal2._id, 'state:STATE_INACTIVATED',
              'openCloseEffectProps:NONE',

              'shownProps:' + modal1._id + ',' + modal2._id + ',' + modal3._id,

              // START: Close others - loop
              'topProps._id:' + modal3._id, 'topProps.state:STATE_OPENED',

              '<execClosing>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'force:true', 'sync:true',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:80ms',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '<finishCloseEffect>', '_id:' + modal3._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:YES',
              '_id:' + modal3._id, '</finishCloseEffect>',

              '<closeEffect/>', '_id:' + modal3._id, 'force:true', // closeEffect

              '<finishCloseEffect>', '_id:' + modal3._id, 'state:STATE_CLOSING',
              'effectKey:option',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'closeEffect:YES',

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

              '_id:' + modal3._id, '</execClosing>',
              // DONE: Close others - loop

              '<execClosing>', '_id:' + modal2._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',
              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:80ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '<closeEffect/>', '_id:' + modal2._id, 'force:false', // closeEffect
              '_id:' + modal2._id, '</execClosing>',

              '_id:' + modal2._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:YES',
              '_id:' + modal2._id, '</finishCloseEffect>',

              '<closeEffect/>', '_id:' + modal2._id, 'DONE', // closeEffect

              '<finishCloseEffect>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'effectKey:option',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'closeEffect:YES',

              '<finishClosing>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'shownProps:' + modal1._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal1._id,

              'DONE.close(onClose)',
              // Canceled
              '<finishCloseEffect>', '_id:' + modal2._id, 'state:STATE_CLOSED',
              'effectKey:option',
              'CANCEL', '</finishCloseEffect>',

              '</finishClosing>',

              '_id:' + modal2._id, '</finishCloseEffect>',

              '<closeEffect/>', '_id:' + modal2._id, 'DONE(AGAIN)', // closeEffect (AGAIN)
              // Canceled
              '<finishCloseEffect>', '_id:' + modal2._id, 'state:STATE_CLOSED',
              'effectKey:option',
              'CANCEL', '</finishCloseEffect>',

              'DONE.close(CLOSED)',
              // Canceled
              '<finishCloseEffect>', '_id:' + modal2._id, 'state:STATE_CLOSED',
              'effectKey:option',
              'CANCEL', '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal2.close();
      }
    );
  });

  it('Normal flow (with effectDone)', function(done) {
    clearCb();
    utils.makeState(allModals, PlainModal.STATE_CLOSED,
      cbChangeClose,
      function() {

        modal1.openEffect = getEffectCbWithProp(modal1, 'open', 120); // Finish after overlay effect
        modal1.closeEffect = getEffectCbWithProp(modal1, 'close', 40); // Finish before overlay effect

        modal1.onOpen = function() {
          traceLog.push('DONE.effectDone(onOpen)');
          modal1.effectDone(); // In event

          setTimeout(function() {
            traceLog.push('DONE.effectDone(OPENED)');
            modal1.effectDone(); // After event

            modal1.close();
          }, 0);
        };
        modal1.onClose = function() {
          traceLog.push('DONE.effectDone(onClose)');
          modal1.effectDone(); // In event

          setTimeout(function() {
            traceLog.push('DONE.effectDone(CLOSED)');
            modal1.effectDone(); // Out of process

            expect(traceLog).toEqual([
              // START: open
              '<open>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:NONE',
              'shownProps:' + modal1._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal1._id, 'state:STATE_CLOSED',
              'force:false',
              'state:STATE_OPENING',
              // PlainOverlay.show()
              '<openEffect/>', '_id:' + modal1._id, 'force:false', // openEffect
              '_id:' + modal1._id, '</execOpening>',

              '_id:' + modal1._id, '</open>',
              // DONE: open

              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:YES',
              '_id:' + modal1._id, '</finishOpenEffect>',

              '<openEffect/>', '_id:' + modal1._id, 'DONE', // openEffect
              '<effectDone/>', '_id:' + modal1._id, 'state:STATE_OPENING',

              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'effectKey:option',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'openEffect:YES',

              '<finishOpening>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'DONE.effectDone(onOpen)',
              '<effectDone/>', '_id:' + modal1._id, 'state:STATE_OPENED',

              '</finishOpening>',

              '_id:' + modal1._id, '</finishOpenEffect>',

              '<openEffect/>', '_id:' + modal1._id, 'DONE(AGAIN)', // openEffect (AGAIN)
              '<effectDone/>', '_id:' + modal1._id, 'state:STATE_OPENED',

              'DONE.effectDone(OPENED)',
              '<effectDone/>', '_id:' + modal1._id, 'state:STATE_OPENED',

              // onOpen -> close()

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
              '<closeEffect/>', '_id:' + modal1._id, 'force:false', // closeEffect
              '_id:' + modal1._id, '</execClosing>',

              '_id:' + modal1._id, '</close>',
              // DONE: close

              '<closeEffect/>', '_id:' + modal1._id, 'DONE', // closeEffect
              '<effectDone/>', '_id:' + modal1._id, 'state:STATE_CLOSING',

              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:option',
              'effectFinished.plainOverlay:false',
              'effectFinished.option:true', 'closeEffect:YES',
              '_id:' + modal1._id, '</finishCloseEffect>',

              '<closeEffect/>', '_id:' + modal1._id, 'DONE(AGAIN)', // closeEffect (AGAIN)
              '<effectDone/>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              // Not canceled, repeat it
              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:option',
              'effectFinished.plainOverlay:false',
              'effectFinished.option:true', 'closeEffect:YES',
              '_id:' + modal1._id, '</finishCloseEffect>',

              '<finishCloseEffect>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'closeEffect:YES',

              '<finishClosing>', '_id:' + modal1._id, 'state:STATE_CLOSING',
              'shownProps:NONE',
              'state:STATE_CLOSED',

              'DONE.effectDone(onClose)',
              '<effectDone/>', '_id:' + modal1._id, 'state:STATE_CLOSED',

              '</finishClosing>',

              '_id:' + modal1._id, '</finishCloseEffect>',

              'DONE.effectDone(CLOSED)',
              '<effectDone/>', '_id:' + modal1._id, 'state:STATE_CLOSED'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal1.open();
      }
    );
  });

  it('force:true, sync:true (with effectDone)', function(done) {
    clearCb();
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
        expect(PlainModal.shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal1, modal2, modal3]);

        modal1.openEffect = getEffectCbWithProp(modal1, 'open', 120);
        modal1.closeEffect = getEffectCbWithProp(modal1, 'close', 120);
        modal2.openEffect = getEffectCbWithProp(modal2, 'open', 120);
        modal2.closeEffect = getEffectCbWithProp(modal2, 'close', 120);
        modal3.openEffect = getEffectCbWithProp(modal3, 'open', 120);
        modal3.closeEffect = getEffectCbWithProp(modal3, 'close', 120);

        modal2.onClose = function() {
          traceLog.push('DONE.effectDone(onClose)');
          modal2.effectDone(); // In event

          setTimeout(function() {
            traceLog.push('DONE.effectDone(CLOSED)');
            modal2.effectDone(); // Out of process

            expect(modal1.state).toBe(PlainModal.STATE_OPENED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(PlainModal.shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1]);

            expect(traceLog).toEqual([
              // START: close
              '<close>', '_id:' + modal2._id, 'state:STATE_INACTIVATED',
              'openCloseEffectProps:NONE',

              'shownProps:' + modal1._id + ',' + modal2._id + ',' + modal3._id,

              // START: Close others - loop
              'topProps._id:' + modal3._id, 'topProps.state:STATE_OPENED',

              '<execClosing>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'force:true', 'sync:true',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:80ms',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '<finishCloseEffect>', '_id:' + modal3._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:YES',
              '_id:' + modal3._id, '</finishCloseEffect>',

              '<closeEffect/>', '_id:' + modal3._id, 'force:true', // closeEffect

              '<finishCloseEffect>', '_id:' + modal3._id, 'state:STATE_CLOSING',
              'effectKey:option',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'closeEffect:YES',

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

              '_id:' + modal3._id, '</execClosing>',
              // DONE: Close others - loop

              '<execClosing>', '_id:' + modal2._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',
              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:80ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '<closeEffect/>', '_id:' + modal2._id, 'force:false', // closeEffect
              '_id:' + modal2._id, '</execClosing>',

              '_id:' + modal2._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:YES',
              '_id:' + modal2._id, '</finishCloseEffect>',

              '<closeEffect/>', '_id:' + modal2._id, 'DONE', // closeEffect
              '<effectDone/>', '_id:' + modal2._id, 'state:STATE_CLOSING',

              '<finishCloseEffect>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'effectKey:option',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:true', 'closeEffect:YES',

              '<finishClosing>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'shownProps:' + modal1._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal1._id,

              'DONE.effectDone(onClose)',
              '<effectDone/>', '_id:' + modal2._id, 'state:STATE_CLOSED',

              '</finishClosing>',

              '_id:' + modal2._id, '</finishCloseEffect>',

              '<closeEffect/>', '_id:' + modal2._id, 'DONE(AGAIN)', // closeEffect (AGAIN)
              '<effectDone/>', '_id:' + modal2._id, 'state:STATE_CLOSED',

              'DONE.effectDone(CLOSED)',
              '<effectDone/>', '_id:' + modal2._id, 'state:STATE_CLOSED'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal2.close();
      }
    );
  });

});
