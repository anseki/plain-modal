describe('closeButton', function() {
  'use strict';

  var window, document, PlainModal, traceLog, pageDone,
    modal, button1, button2;

  function clickElement(element) {
    var event;
    try {
      event = new window.MouseEvent('click');
    } catch (error) {
      event = document.createEvent('MouseEvent');
      event.initMouseEvent('click', true, true, document.defaultView, 1,
        0, 0, 0, 0, false, false, false, false, 0, null);
    }
    element.dispatchEvent(event);
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/common.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainModal = window.PlainModal;
      traceLog = PlainModal.traceLog;

      modal = new PlainModal(document.getElementById('elm1'));
      button1 = document.getElementById('button11');
      button2 = document.getElementById('button12');

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

  it('By default, nothing is called', function(done) {
    expect(typeof modal.closeButton).toBe('undefined');

    traceLog.length = 0;
    clickElement(button1);
    expect(traceLog).toEqual([]);

    traceLog.length = 0;
    clickElement(button2);
    expect(traceLog).toEqual([]);

    done();
  });

  it('Remove the option, nothing is changed', function(done) {
    modal.closeButton = null;
    expect(typeof modal.closeButton).toBe('undefined');

    traceLog.length = 0;
    clickElement(button1);
    expect(traceLog).toEqual([]);

    traceLog.length = 0;
    clickElement(button2);
    expect(traceLog).toEqual([]);

    done();
  });

  it('`close` is attached to element', function(done) {
    modal.closeButton = button1;
    expect(modal.closeButton).toBe(button1);

    traceLog.length = 0;
    clickElement(button1);
    expect(traceLog).toEqual([
      '<close>', '_id:' + modal._id, 'state:STATE_CLOSED', 'CANCEL', '</close>'
    ]);

    traceLog.length = 0;
    clickElement(button2);
    expect(traceLog).toEqual([]);

    done();
  });

  it('`close` is attached to another element', function(done) {
    modal.closeButton = button2;
    expect(modal.closeButton).toBe(button2);

    traceLog.length = 0;
    clickElement(button1);
    expect(traceLog).toEqual([]);

    traceLog.length = 0;
    clickElement(button2);
    expect(traceLog).toEqual([
      '<close>', '_id:' + modal._id, 'state:STATE_CLOSED', 'CANCEL', '</close>'
    ]);

    done();
  });

  it('Remove the option', function(done) {
    modal.closeButton = null;
    expect(typeof modal.closeButton).toBe('undefined');

    traceLog.length = 0;
    clickElement(button1);
    expect(traceLog).toEqual([]);

    traceLog.length = 0;
    clickElement(button2);
    expect(traceLog).toEqual([]);

    done();
  });

});
