
describe('descendant', function() {
  'use strict';

  var window, document, utils, PlainModal, traceLog, shownProps, pageDone,
    modal1, modal2, modal3, modal4, modal5, allModals;

  function cbChangeClose(modal) { modal.close(true); }

  beforeAll(function(beforeDone) {
    loadPage('spec/common.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      PlainModal = window.PlainModal;
      traceLog = PlainModal.traceLog;
      shownProps = window.shownProps;

      modal1 = new PlainModal(document.getElementById('elm1'), {
        dragHandle: document.getElementById('handle11'),
        duration: 101
      });
      modal2 = new PlainModal(document.getElementById('elm2'), {
        dragHandle: document.getElementById('handle21'),
        duration: 102
      });
      modal3 = new PlainModal(document.getElementById('elm3'), {duration: 103});
      modal4 = new PlainModal(document.getElementById('elm4'), {duration: 104});
      modal5 = new PlainModal(document.getElementById('elm5'), {duration: 105});
      allModals = [modal1, modal2, modal3, modal4, modal5];

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

  it('Multiple modals work independently', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose =
      modal4.onOpen = modal4.onClose = modal4.onBeforeOpen = modal4.onBeforeClose =
      modal5.onOpen = modal5.onClose = modal5.onBeforeOpen = modal5.onBeforeClose = null;

    utils.makeState(allModals, PlainModal.STATE_CLOSED,
      cbChangeClose,
      function() {

        expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal4.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
        expect(shownProps).toEqual([]);

        modal1.onOpen = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_OPENED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1]);
            modal1.close();
          }, 0);
        };
        modal1.onClose = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps).toEqual([]);
            modal2.open();
          }, 0);
        };

        modal2.onOpen = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal2.state).toBe(PlainModal.STATE_OPENED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal2]);
            modal2.close();
          }, 0);
        };
        modal2.onClose = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps).toEqual([]);
            modal3.open();
          }, 0);
        };

        modal3.onOpen = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_OPENED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal3]);
            modal3.close();
          }, 0);
        };
        modal3.onClose = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps).toEqual([]);

            expect(traceLog).toEqual([modal1, modal2, modal3].reduce(function(log, modal) {
              log.push(
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
                modal === modal3 ? 'plainDraggable:NONE' : 'plainDraggable.disabled:false',
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
                modal === modal3 ? 'plainDraggable:NONE' : 'plainDraggable.disabled:true',
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
              );
              return log;
            }, []));

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal1.open();
      }
    );
  });

  it('A-STATE_OPENED -> B-open()', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose =
      modal4.onOpen = modal4.onClose = modal4.onBeforeOpen = modal4.onBeforeClose =
      modal5.onOpen = modal5.onClose = modal5.onBeforeOpen = modal5.onBeforeClose = null;

    utils.makeState(allModals, PlainModal.STATE_CLOSED,
      cbChangeClose,
      function() {

        expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal4.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
        expect(shownProps).toEqual([]);

        modal1.onOpen = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_OPENED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1]);
            traceLog.length = 0;
            modal2.open();
          }, 0);
        };

        modal2.onOpen = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal2.state).toBe(PlainModal.STATE_OPENED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1, modal2]);
            modal3.open();
          }, 0);
        };

        modal3.onOpen = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal2.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal3.state).toBe(PlainModal.STATE_OPENED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1, modal2, modal3]);

            expect(traceLog).toEqual([
              // 2 START: open
              '<open>', '_id:' + modal2._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:NONE',
              'parentProps(LINK):' + modal1._id,
              'shownProps:' + modal1._id + ',' + modal2._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal2._id, 'state:STATE_CLOSED',
              'force:false',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_OPENED',
              'elmOverlay.duration:102ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_INACTIVATING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '_id:' + modal2._id, '</execOpening>',

              '_id:' + modal2._id, '</open>',
              // DONE: open

              '<finishOpenEffect>', '_id:' + modal2._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal2._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_INACTIVATING',
              'parentProps.state:STATE_INACTIVATED',

              '</finishOpening>',

              '_id:' + modal2._id, '</finishOpenEffect>',

              // 3 START: open
              '<open>', '_id:' + modal3._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:NONE',
              'parentProps(LINK):' + modal2._id,
              'shownProps:' + modal1._id + ',' + modal2._id + ',' + modal3._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal3._id, 'state:STATE_CLOSED',
              'force:false',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_OPENED',
              'elmOverlay.duration:103ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_INACTIVATING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '_id:' + modal3._id, '</execOpening>',

              '_id:' + modal3._id, '</open>',
              // DONE: open

              '<finishOpenEffect>', '_id:' + modal3._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal3._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_INACTIVATING',
              'parentProps.state:STATE_INACTIVATED',

              '</finishOpening>',

              '_id:' + modal3._id, '</finishOpenEffect>'
            ]);

            done();
          }, 0);
        };

        modal1.open();
      }
    );
  });

  it('A-STATE_OPENED -> B-open() Change order', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose =
      modal4.onOpen = modal4.onClose = modal4.onBeforeOpen = modal4.onBeforeClose =
      modal5.onOpen = modal5.onClose = modal5.onBeforeOpen = modal5.onBeforeClose = null;

    utils.makeState(allModals, PlainModal.STATE_CLOSED,
      cbChangeClose,
      function() {

        expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal4.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
        expect(shownProps).toEqual([]);

        modal3.onOpen = function() {
          setTimeout(function() {
            expect(modal3.state).toBe(PlainModal.STATE_OPENED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal3]);
            traceLog.length = 0;
            modal2.open();
          }, 0);
        };

        modal2.onOpen = function() {
          setTimeout(function() {
            expect(modal3.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal2.state).toBe(PlainModal.STATE_OPENED);
            expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal3, modal2]);
            modal5.open();
          }, 0);
        };

        modal5.onOpen = function() {
          setTimeout(function() {
            expect(modal3.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal2.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal5.state).toBe(PlainModal.STATE_OPENED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal3, modal2, modal5]);

            expect(traceLog).toEqual([
              // 2 START: open
              '<open>', '_id:' + modal2._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:NONE',
              'parentProps(LINK):' + modal3._id,
              'shownProps:' + modal3._id + ',' + modal2._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal2._id, 'state:STATE_CLOSED',
              'force:false',

              'parentProps._id:' + modal3._id, 'parentProps.state:STATE_OPENED',
              'elmOverlay.duration:102ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_INACTIVATING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '_id:' + modal2._id, '</execOpening>',

              '_id:' + modal2._id, '</open>',
              // DONE: open

              '<finishOpenEffect>', '_id:' + modal2._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal2._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps._id:' + modal3._id, 'parentProps.state:STATE_INACTIVATING',
              'parentProps.state:STATE_INACTIVATED',

              '</finishOpening>',

              '_id:' + modal2._id, '</finishOpenEffect>',

              // 5 START: open
              '<open>', '_id:' + modal5._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:NONE',
              'parentProps(LINK):' + modal2._id,
              'shownProps:' + modal3._id + ',' + modal2._id + ',' + modal5._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal5._id, 'state:STATE_CLOSED',
              'force:false',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_OPENED',
              'elmOverlay.duration:105ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_INACTIVATING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '_id:' + modal5._id, '</execOpening>',

              '_id:' + modal5._id, '</open>',
              // DONE: open

              '<finishOpenEffect>', '_id:' + modal5._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal5._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal5._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_INACTIVATING',
              'parentProps.state:STATE_INACTIVATED',

              '</finishOpening>',

              '_id:' + modal5._id, '</finishOpenEffect>'
            ]);

            done();
          }, 0);
        };

        modal3.open();
      }
    );
  });

  it('A-STATE_OPENING -> B-open()', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose =
      modal4.onOpen = modal4.onClose = modal4.onBeforeOpen = modal4.onBeforeClose =
      modal5.onOpen = modal5.onClose = modal5.onBeforeOpen = modal5.onBeforeClose = null;

    utils.makeState(allModals, PlainModal.STATE_CLOSED,
      cbChangeClose,
      function() {
        var doneTimeout;

        expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal4.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
        expect(shownProps).toEqual([]);

        setTimeout(function() {
          expect(modal1.state).toBe(PlainModal.STATE_OPENING);
          expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
          expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
          expect(shownProps.map(function(props) { return props.ins; }))
            .toEqual([modal1]);
          traceLog.length = 0;
          modal2.open();

          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_INACTIVATING);
            expect(modal2.state).toBe(PlainModal.STATE_OPENING);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1, modal2]);
            modal3.open();

            setTimeout(function() {
              expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
              expect(modal2.state).toBe(PlainModal.STATE_INACTIVATING);
              expect(modal3.state).toBe(PlainModal.STATE_OPENING);
              expect(shownProps.map(function(props) { return props.ins; }))
                .toEqual([modal1, modal2, modal3]);
              doneTimeout = true; // To check that these tests were done.
            }, 50);
          }, 50);
        }, 50);

        modal3.onOpen = function() {
          setTimeout(function() {
            expect(doneTimeout).toBe(true);

            expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal2.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal3.state).toBe(PlainModal.STATE_OPENED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1, modal2, modal3]);

            expect(traceLog).toEqual([
              // 2 START: open
              '<open>', '_id:' + modal2._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:' + modal1._id,

              // START: fixOpenClose
              '<fixOpenClose>', '_id:' + modal1._id, 'state:STATE_OPENING',

              '<execOpening>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'force:true',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '<finishOpenEffect>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal1._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              '</finishOpening>',

              '_id:' + modal1._id, '</finishOpenEffect>',

              '_id:' + modal1._id, '</execOpening>',

              '_id:' + modal1._id, '</fixOpenClose>',
              // DONE: fixOpenClose

              'parentProps(LINK):' + modal1._id,
              'shownProps:' + modal1._id + ',' + modal2._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal2._id, 'state:STATE_CLOSED',
              'force:false',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_OPENED',
              'elmOverlay.duration:102ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_INACTIVATING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '_id:' + modal2._id, '</execOpening>',

              '_id:' + modal2._id, '</open>',
              // DONE: open

              // 3 START: open
              '<open>', '_id:' + modal3._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:' + modal2._id,

              // START: fixOpenClose
              '<fixOpenClose>', '_id:' + modal2._id, 'state:STATE_OPENING',

              '<execOpening>', '_id:' + modal2._id, 'state:STATE_OPENING',
              'force:true',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_INACTIVATING',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_INACTIVATING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '<finishOpenEffect>', '_id:' + modal2._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal2._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_OPENED',
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_INACTIVATING',
              'parentProps.state:STATE_INACTIVATED',

              '</finishOpening>',

              '_id:' + modal2._id, '</finishOpenEffect>',

              '_id:' + modal2._id, '</execOpening>',

              '_id:' + modal2._id, '</fixOpenClose>',
              // DONE: fixOpenClose

              'parentProps(LINK):' + modal2._id,
              'shownProps:' + modal1._id + ',' + modal2._id + ',' + modal3._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal3._id, 'state:STATE_CLOSED',
              'force:false',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_OPENED',
              'elmOverlay.duration:103ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_INACTIVATING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '_id:' + modal3._id, '</execOpening>',

              '_id:' + modal3._id, '</open>',
              // DONE: open

              '<finishOpenEffect>', '_id:' + modal3._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal3._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_INACTIVATING',
              'parentProps.state:STATE_INACTIVATED',

              '</finishOpening>',

              '_id:' + modal3._id, '</finishOpenEffect>'
            ]);

            done();
          }, 0);
        };

        modal1.open();
      }
    );
  });

  it('A-STATE_CLOSING -> B-open()', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose =
      modal4.onOpen = modal4.onClose = modal4.onBeforeOpen = modal4.onBeforeClose =
      modal5.onOpen = modal5.onClose = modal5.onBeforeOpen = modal5.onBeforeClose = null;

    utils.makeState(allModals, PlainModal.STATE_CLOSED,
      cbChangeClose,
      function() {

        expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal4.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
        expect(shownProps).toEqual([]);

        modal1.onOpen = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_OPENED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1]);
            modal2.open();
          }, 0);
        };

        modal2.onOpen = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal2.state).toBe(PlainModal.STATE_OPENED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1, modal2]);
            modal2.close();

            setTimeout(function() {
              expect(modal1.state).toBe(PlainModal.STATE_ACTIVATING);
              expect(modal2.state).toBe(PlainModal.STATE_CLOSING);
              expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
              expect(shownProps.map(function(props) { return props.ins; }))
                .toEqual([modal1, modal2]);
              traceLog.length = 0;
              modal3.open();
              expect(shownProps.map(function(props) { return props.ins; }))
                .toEqual([modal1, modal3]); // modal2 was closed in open()
            }, 50);
          }, 0);
        };

        modal3.onOpen = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_OPENED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1, modal3]);

            expect(traceLog).toEqual([
              // 3 START: open
              '<open>', '_id:' + modal3._id, 'state:STATE_CLOSED',
              'openCloseEffectProps:' + modal2._id,

              // START: fixOpenClose
              '<fixOpenClose>', '_id:' + modal2._id, 'state:STATE_CLOSING',

              '<execClosing>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'force:true', 'sync:true',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_ACTIVATING',
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal2._id, 'state:STATE_CLOSING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              // PlainOverlay.hide()

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
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal1._id,

              '</finishClosing>',

              '_id:' + modal2._id, '</finishCloseEffect>',

              '_id:' + modal2._id, '</execClosing>',

              '_id:' + modal2._id, '</fixOpenClose>',
              // DONE: fixOpenClose

              'parentProps(LINK):' + modal1._id,
              'shownProps:' + modal1._id + ',' + modal3._id,
              'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',

              '<execOpening>', '_id:' + modal3._id, 'state:STATE_CLOSED',
              'force:false',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_OPENED',
              'elmOverlay.duration:103ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:true',
              'parentProps.state:STATE_INACTIVATING',

              '<switchDraggable>', '_id:' + modal1._id, 'state:STATE_INACTIVATING',
              'plainDraggable.disabled:true',
              '</switchDraggable>',

              'state:STATE_OPENING',
              // PlainOverlay.show()

              '_id:' + modal3._id, '</execOpening>',

              '_id:' + modal3._id, '</open>',
              // DONE: open

              '<finishOpenEffect>', '_id:' + modal3._id, 'state:STATE_OPENING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'openEffect:NO',

              '<finishOpening>', '_id:' + modal3._id, 'state:STATE_OPENING',
              'state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'parentProps._id:' + modal1._id, 'parentProps.state:STATE_INACTIVATING',
              'parentProps.state:STATE_INACTIVATED',

              '</finishOpening>',

              '_id:' + modal3._id, '</finishOpenEffect>'
            ]);

            done();
          }, 0);
        };

        modal1.open();
      }
    );
  });

  it('STATE_OPENED -> close()', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose =
      modal4.onOpen = modal4.onClose = modal4.onBeforeOpen = modal4.onBeforeClose =
      modal5.onOpen = modal5.onClose = modal5.onBeforeOpen = modal5.onBeforeClose = null;

    var timer1, timer2, timer3;
    utils.makeState(allModals,
      [PlainModal.STATE_INACTIVATED, PlainModal.STATE_INACTIVATED, PlainModal.STATE_OPENED,
        PlainModal.STATE_CLOSED, PlainModal.STATE_CLOSED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        modal4.close(true);
        modal5.close(true);
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
        expect(modal4.state).toBe(PlainModal.STATE_CLOSED);
        expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
        expect(shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal1, modal2, modal3]);

        modal3.onClose = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal2.state).toBe(PlainModal.STATE_OPENED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal4.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1, modal2]);

            expect(traceLog).toEqual([
              // 3 START: close
              '<close>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'openCloseEffectProps:NONE',

              '<execClosing>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:103ms',
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
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal2._id,

              '</finishClosing>',

              '_id:' + modal3._id, '</finishCloseEffect>'
            ]);

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal3.close();
      }
    );
  });

  it('STATE_INACTIVATED -> close()', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose =
      modal4.onOpen = modal4.onClose = modal4.onBeforeOpen = modal4.onBeforeClose =
      modal5.onOpen = modal5.onClose = modal5.onBeforeOpen = modal5.onBeforeClose = null;

    var timer1, timer2, timer3, timer4, timer5;
    utils.makeState(allModals,
      [PlainModal.STATE_INACTIVATED, PlainModal.STATE_INACTIVATED, PlainModal.STATE_INACTIVATED,
        PlainModal.STATE_INACTIVATED, PlainModal.STATE_OPENED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        modal4.close(true);
        modal5.close(true);
        timer1 = setTimeout(function() { modal1.open(true); }, 10);
        timer2 = setTimeout(function() { modal2.open(true); }, 10);
        timer3 = setTimeout(function() { modal3.open(true); }, 10);
        timer4 = setTimeout(function() { modal4.open(true); }, 10);
        timer5 = setTimeout(function() { modal5.open(true); }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);

        expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal2.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal3.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal4.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal5.state).toBe(PlainModal.STATE_OPENED);
        expect(shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal1, modal2, modal3, modal4, modal5]);

        modal3.onClose = function() {
          setTimeout(function() {
            expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal2.state).toBe(PlainModal.STATE_OPENED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal4.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal1, modal2]);

            expect(traceLog).toEqual([
              // 3 START: close
              '<close>', '_id:' + modal3._id, 'state:STATE_INACTIVATED',
              'openCloseEffectProps:NONE',

              'shownProps:' + modal1._id + ',' + modal2._id + ',' + modal3._id + ',' +
                modal4._id + ',' + modal5._id
            ].concat([modal5, modal4].reduce(function(log, modal, i) {
              var parentProps = [modal4, modal3][i],
                duration = ['105', '104'][i], // modal5, modal4
                shownPropsId = [
                  modal1._id + ',' + modal2._id + ',' + modal3._id + ',' + modal4._id,
                  modal1._id + ',' + modal2._id + ',' + modal3._id
                ][i];
              log.push(
                // START: Close others - loop
                'topProps._id:' + modal._id, 'topProps.state:STATE_OPENED',

                '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
                'force:true', 'sync:true',

                'parentProps._id:' + parentProps._id, 'parentProps.state:STATE_INACTIVATED',
                'elmOverlay.duration:' + duration + 'ms',
                'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
                'parentProps.state:STATE_ACTIVATING',
                'state:STATE_CLOSING',

                '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
                'plainDraggable:NONE',
                '</switchDraggable>',

                // PlainOverlay.hide()

                '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
                'effectKey:plainOverlay',
                'effectFinished.plainOverlay:true',
                'effectFinished.option:false', 'closeEffect:NO',

                '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
                'shownProps:' + shownPropsId,
                'state:STATE_CLOSED',

                'parentProps._id:' + parentProps._id, 'parentProps.state:STATE_ACTIVATING',
                'parentProps.state:STATE_OPENED',

                '<switchDraggable>', '_id:' + parentProps._id, 'state:STATE_OPENED',
                'plainDraggable:NONE',
                '</switchDraggable>',

                'parentProps(UNLINK):' + parentProps._id,

                '</finishClosing>',

                '_id:' + modal._id, '</finishCloseEffect>',

                '_id:' + modal._id, '</execClosing>'
                // DONE: Close others - loop
              );
              return log;
            }, [])
            ).concat(
              '<execClosing>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',

              'parentProps._id:' + modal2._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:103ms',
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
              'plainDraggable.disabled:false',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal2._id,

              '</finishClosing>',

              '_id:' + modal3._id, '</finishCloseEffect>'
            ));

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal3.close();
      }
    );
  });

  it('STATE_INACTIVATED -> close() Change order', function(done) {
    modal1.onOpen = modal1.onClose = modal1.onBeforeOpen = modal1.onBeforeClose =
      modal2.onOpen = modal2.onClose = modal2.onBeforeOpen = modal2.onBeforeClose =
      modal3.onOpen = modal3.onClose = modal3.onBeforeOpen = modal3.onBeforeClose =
      modal4.onOpen = modal4.onClose = modal4.onBeforeOpen = modal4.onBeforeClose =
      modal5.onOpen = modal5.onClose = modal5.onBeforeOpen = modal5.onBeforeClose = null;

    var timer1, timer2, timer3, timer4, timer5;
    utils.makeState(allModals,
      [PlainModal.STATE_INACTIVATED, PlainModal.STATE_INACTIVATED, PlainModal.STATE_INACTIVATED,
        PlainModal.STATE_OPENED, PlainModal.STATE_INACTIVATED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        modal4.close(true);
        modal5.close(true);
        // 2, 3, 5, 1, 4
        timer1 = setTimeout(function() { modal2.open(true); }, 10);
        timer2 = setTimeout(function() { modal3.open(true); }, 10);
        timer3 = setTimeout(function() { modal5.open(true); }, 10);
        timer4 = setTimeout(function() { modal1.open(true); }, 10);
        timer5 = setTimeout(function() { modal4.open(true); }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);

        expect(modal2.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal3.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal5.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
        expect(modal4.state).toBe(PlainModal.STATE_OPENED);
        expect(shownProps.map(function(props) { return props.ins; }))
          .toEqual([modal2, modal3, modal5, modal1, modal4]);

        modal5.onClose = function() {
          setTimeout(function() {
            expect(modal2.state).toBe(PlainModal.STATE_INACTIVATED);
            expect(modal3.state).toBe(PlainModal.STATE_OPENED);
            expect(modal5.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal4.state).toBe(PlainModal.STATE_CLOSED);
            expect(shownProps.map(function(props) { return props.ins; }))
              .toEqual([modal2, modal3]);

            expect(traceLog).toEqual([
              // 5 START: close
              '<close>', '_id:' + modal5._id, 'state:STATE_INACTIVATED',
              'openCloseEffectProps:NONE',

              'shownProps:' + modal2._id + ',' + modal3._id + ',' + modal5._id + ',' +
                modal1._id + ',' + modal4._id
            ].concat([modal4, modal1].reduce(function(log, modal, i) {
              var parentProps = [modal1, modal5][i],
                duration = ['104', '101'][i], // modal4, modal1
                shownPropsId = [
                  modal2._id + ',' + modal3._id + ',' + modal5._id + ',' + modal1._id,
                  modal2._id + ',' + modal3._id + ',' + modal5._id
                ][i],
                plainDraggable1 = [':NONE', '.disabled:true'][i], // modal4, modal1 (props)
                plainDraggable2 = ['.disabled:false', ':NONE'][i]; // modal1, modal5 (parentProps)
              log.push(
                // START: Close others - loop
                'topProps._id:' + modal._id, 'topProps.state:STATE_OPENED',

                '<execClosing>', '_id:' + modal._id, 'state:STATE_OPENED',
                'force:true', 'sync:true',

                'parentProps._id:' + parentProps._id, 'parentProps.state:STATE_INACTIVATED',
                'elmOverlay.duration:' + duration + 'ms',
                'elmOverlay.CLASS_FORCE:true', 'elmOverlay.CLASS_HIDE:false',
                'parentProps.state:STATE_ACTIVATING',
                'state:STATE_CLOSING',

                '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSING',
                'plainDraggable' + plainDraggable1,
                '</switchDraggable>',

                // PlainOverlay.hide()

                '<finishCloseEffect>', '_id:' + modal._id, 'state:STATE_CLOSING',
                'effectKey:plainOverlay',
                'effectFinished.plainOverlay:true',
                'effectFinished.option:false', 'closeEffect:NO',

                '<finishClosing>', '_id:' + modal._id, 'state:STATE_CLOSING',
                'shownProps:' + shownPropsId,
                'state:STATE_CLOSED',

                'parentProps._id:' + parentProps._id, 'parentProps.state:STATE_ACTIVATING',
                'parentProps.state:STATE_OPENED',

                '<switchDraggable>', '_id:' + parentProps._id, 'state:STATE_OPENED',
                'plainDraggable' + plainDraggable2,
                '</switchDraggable>',

                'parentProps(UNLINK):' + parentProps._id,

                '</finishClosing>',

                '_id:' + modal._id, '</finishCloseEffect>',

                '_id:' + modal._id, '</execClosing>'
                // DONE: Close others - loop
              );
              return log;
            }, [])
            ).concat(
              '<execClosing>', '_id:' + modal5._id, 'state:STATE_OPENED',
              'force:false', 'sync:false',

              'parentProps._id:' + modal3._id, 'parentProps.state:STATE_INACTIVATED',
              'elmOverlay.duration:105ms',
              'elmOverlay.CLASS_FORCE:false', 'elmOverlay.CLASS_HIDE:false',
              'parentProps.state:STATE_ACTIVATING',
              'state:STATE_CLOSING',

              '<switchDraggable>', '_id:' + modal5._id, 'state:STATE_CLOSING',
              'plainDraggable:NONE',
              '</switchDraggable>',

              // PlainOverlay.hide()
              '_id:' + modal5._id, '</execClosing>',

              '_id:' + modal5._id, '</close>',
              // DONE: close

              '<finishCloseEffect>', '_id:' + modal5._id, 'state:STATE_CLOSING',
              'effectKey:plainOverlay',
              'effectFinished.plainOverlay:true',
              'effectFinished.option:false', 'closeEffect:NO',

              '<finishClosing>', '_id:' + modal5._id, 'state:STATE_CLOSING',
              'shownProps:' + modal2._id + ',' + modal3._id,
              'state:STATE_CLOSED',

              'parentProps._id:' + modal3._id, 'parentProps.state:STATE_ACTIVATING',
              'parentProps.state:STATE_OPENED',

              '<switchDraggable>', '_id:' + modal3._id, 'state:STATE_OPENED',
              'plainDraggable:NONE',
              '</switchDraggable>',

              'parentProps(UNLINK):' + modal3._id,

              '</finishClosing>',

              '_id:' + modal5._id, '</finishCloseEffect>'
            ));

            done();
          }, 0);
        };

        traceLog.length = 0;
        modal5.close();
      }
    );
  });

});
