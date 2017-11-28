
describe('dragHandle', function() {
  'use strict';

  var window, document, PlainModal, insProps, traceLog, pageDone,
    modal, handle1, handle2;

  beforeAll(function(beforeDone) {
    loadPage('spec/common.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainModal = window.PlainModal;
      insProps = window.insProps;
      traceLog = PlainModal.traceLog;
      pageDone = done;

      modal = new PlainModal(document.getElementById('elm1'));
      handle1 = document.getElementById('handle11');
      handle2 = document.getElementById('handle12');

      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  it('By default, dragging is disabled', function(done) {
    expect(typeof modal.dragHandle).toBe('undefined');
    expect(insProps[modal._id].plainDraggable == null).toBe(true);

    done();
  });

  it('Remove the option, nothing is changed', function(done) {
    traceLog.length = 0;
    modal.dragHandle = null;
    expect(typeof modal.dragHandle).toBe('undefined');
    expect(traceLog).toEqual([]);
    expect(insProps[modal._id].plainDraggable == null).toBe(true);

    done();
  });

  it('dragHandle is element, PlainDraggable is added', function(done) {
    traceLog.length = 0;
    modal.dragHandle = handle1;
    expect(modal.dragHandle).toBe(handle1);
    expect(traceLog).toEqual([
      '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSED',
      'plainDraggable.disabled:true',
      '</switchDraggable>'
    ]);
    expect(insProps[modal._id].plainDraggable == null).toBe(false);
    expect(insProps[modal._id].plainDraggable.handle).toBe(handle1);

    done();
  });

  it('dragHandle is another element', function(done) {
    traceLog.length = 0;
    modal.dragHandle = handle2;
    expect(modal.dragHandle).toBe(handle2);
    expect(traceLog).toEqual([
      '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSED',
      'plainDraggable.disabled:true',
      '</switchDraggable>'
    ]);
    expect(insProps[modal._id].plainDraggable == null).toBe(false);
    expect(insProps[modal._id].plainDraggable.handle).toBe(handle2);

    done();
  });

  it('Remove the option', function(done) {
    traceLog.length = 0;
    modal.dragHandle = null;
    expect(typeof modal.dragHandle).toBe('undefined');
    expect(traceLog).toEqual([
      '<switchDraggable>', '_id:' + modal._id, 'state:STATE_CLOSED',
      'plainDraggable.disabled:true',
      '</switchDraggable>'
    ]);
    expect(insProps[modal._id].plainDraggable == null).toBe(false);
    expect(insProps[modal._id].plainDraggable.handle).toBe(handle2); // Not changed

    done();
  });

});
