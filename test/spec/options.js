
describe('options', function() {
  'use strict';

  var window, document, PlainModal, insProps, pageDone;

  beforeAll(function(beforeDone) {
    loadPage('spec/common.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainModal = window.PlainModal;
      insProps = window.insProps;

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

  describe('closeButton', function() {
    var modal, button1, button2;

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      button1 = document.getElementById('button11');
      button2 = document.getElementById('button12');
      done();
    });

    it('default', function(done) {
      expect(typeof modal.closeButton).toBe('undefined');

      done();
    });

    it('Update - element', function(done) {
      modal.closeButton = button1;
      expect(modal.closeButton).toBe(button1);

      done();
    });

    it('Update - another element', function(done) {
      modal.closeButton = button2;
      expect(modal.closeButton).toBe(button2);

      done();
    });

    it('Update - default', function(done) {
      modal.closeButton = null;
      expect(typeof modal.closeButton).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.closeButton = button1;
      expect(modal.closeButton).toBe(button1);

      modal.closeButton = 5;
      expect(modal.closeButton).toBe(button1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.duration = 5;
      expect(modal.closeButton).toBe(button1);

      done();
    });
  });

  describe('duration', function() {
    var modal;

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      done();
    });

    it('default', function(done) {
      expect(modal.duration).toBe(200);
      expect(insProps[modal._id].plainOverlay.duration).toBe(200); // Passed value

      done();
    });

    it('Update - number', function(done) {
      modal.duration = 255;
      expect(modal.duration).toBe(255);
      expect(insProps[modal._id].plainOverlay.duration).toBe(255); // Passed value

      done();
    });

    it('Update - another number', function(done) {
      modal.duration = 64;
      expect(modal.duration).toBe(64);
      expect(insProps[modal._id].plainOverlay.duration).toBe(64); // Passed value

      done();
    });

    it('Update - default', function(done) {
      modal.duration = 200;
      expect(modal.duration).toBe(200);
      expect(insProps[modal._id].plainOverlay.duration).toBe(200); // Passed value

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.duration = 400;
      expect(modal.duration).toBe(400);
      expect(insProps[modal._id].plainOverlay.duration).toBe(400); // Passed value

      modal.duration = false;
      expect(modal.duration).toBe(400);
      expect(insProps[modal._id].plainOverlay.duration).toBe(400); // Passed value

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.overlayBlur = 5;
      expect(modal.duration).toBe(400);
      expect(insProps[modal._id].plainOverlay.duration).toBe(400); // Passed value

      done();
    });
  });

  describe('overlayBlur', function() {
    var modal;

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      done();
    });

    it('default', function(done) {
      expect(modal.overlayBlur).toBe(false);
      expect(insProps[modal._id].plainOverlay.blur).toBe(false); // Passed value

      done();
    });

    it('Update - number', function(done) {
      modal.overlayBlur = 2;
      expect(modal.overlayBlur).toBe(2);
      expect(insProps[modal._id].plainOverlay.blur).toBe(2); // Passed value

      done();
    });

    it('Update - another number', function(done) {
      modal.overlayBlur = 5;
      expect(modal.overlayBlur).toBe(5);
      expect(insProps[modal._id].plainOverlay.blur).toBe(5); // Passed value

      done();
    });

    it('Update - default', function(done) {
      modal.overlayBlur = false;
      expect(modal.overlayBlur).toBe(false);
      expect(insProps[modal._id].plainOverlay.blur).toBe(false); // Passed value

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.overlayBlur = 3;
      expect(modal.overlayBlur).toBe(3);
      expect(insProps[modal._id].plainOverlay.blur).toBe(3); // Passed value

      modal.overlayBlur = 'x';
      expect(modal.overlayBlur).toBe(3);
      expect(insProps[modal._id].plainOverlay.blur).toBe(3); // Passed value

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.duration = 5;
      expect(modal.overlayBlur).toBe(3);
      expect(insProps[modal._id].plainOverlay.blur).toBe(3); // Passed value

      done();
    });
  });

  describe('dragHandle', function() {
    var modal, handle1, handle2;

    if (self.top.LIMIT) { return; }

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      handle1 = document.getElementById('handle11');
      handle2 = document.getElementById('handle12');
      done();
    });

    it('default', function(done) {
      expect(typeof modal.dragHandle).toBe('undefined');

      done();
    });

    it('Update - element', function(done) {
      modal.dragHandle = handle1;
      expect(modal.dragHandle).toBe(handle1);

      done();
    });

    it('Update - another element', function(done) {
      modal.dragHandle = handle2;
      expect(modal.dragHandle).toBe(handle2);

      done();
    });

    it('Update - default', function(done) {
      modal.dragHandle = null;
      expect(typeof modal.dragHandle).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.dragHandle = handle1;
      expect(modal.dragHandle).toBe(handle1);

      modal.dragHandle = 5;
      expect(modal.dragHandle).toBe(handle1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.duration = 5;
      expect(modal.dragHandle).toBe(handle1);

      done();
    });
  });

  describe('openEffect', function() {
    var modal;
    function fnc1() {}
    function fnc2() {}

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      done();
    });

    it('default', function(done) {
      expect(typeof modal.openEffect).toBe('undefined');

      done();
    });

    it('Update - function', function(done) {
      modal.openEffect = fnc1;
      expect(modal.openEffect).toBe(fnc1);

      done();
    });

    it('Update - another function', function(done) {
      modal.openEffect = fnc2;
      expect(modal.openEffect).toBe(fnc2);

      done();
    });

    it('Update - default', function(done) {
      modal.openEffect = null;
      expect(typeof modal.openEffect).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.openEffect = fnc1;
      expect(modal.openEffect).toBe(fnc1);

      modal.openEffect = 5;
      expect(modal.openEffect).toBe(fnc1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.duration = 5;
      expect(modal.openEffect).toBe(fnc1);

      done();
    });
  });

  describe('closeEffect', function() {
    var modal;
    function fnc1() {}
    function fnc2() {}

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      done();
    });

    it('default', function(done) {
      expect(typeof modal.closeEffect).toBe('undefined');

      done();
    });

    it('Update - function', function(done) {
      modal.closeEffect = fnc1;
      expect(modal.closeEffect).toBe(fnc1);

      done();
    });

    it('Update - another function', function(done) {
      modal.closeEffect = fnc2;
      expect(modal.closeEffect).toBe(fnc2);

      done();
    });

    it('Update - default', function(done) {
      modal.closeEffect = null;
      expect(typeof modal.closeEffect).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.closeEffect = fnc1;
      expect(modal.closeEffect).toBe(fnc1);

      modal.closeEffect = 5;
      expect(modal.closeEffect).toBe(fnc1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.duration = 5;
      expect(modal.closeEffect).toBe(fnc1);

      done();
    });
  });

  describe('onOpen', function() {
    var modal;
    function fnc1() {}
    function fnc2() {}

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      done();
    });

    it('default', function(done) {
      expect(typeof modal.onOpen).toBe('undefined');

      done();
    });

    it('Update - function', function(done) {
      modal.onOpen = fnc1;
      expect(modal.onOpen).toBe(fnc1);

      done();
    });

    it('Update - another function', function(done) {
      modal.onOpen = fnc2;
      expect(modal.onOpen).toBe(fnc2);

      done();
    });

    it('Update - default', function(done) {
      modal.onOpen = null;
      expect(typeof modal.onOpen).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.onOpen = fnc1;
      expect(modal.onOpen).toBe(fnc1);

      modal.onOpen = 5;
      expect(modal.onOpen).toBe(fnc1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.duration = 5;
      expect(modal.onOpen).toBe(fnc1);

      done();
    });
  });

  describe('onClose', function() {
    var modal;
    function fnc1() {}
    function fnc2() {}

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      done();
    });

    it('default', function(done) {
      expect(typeof modal.onClose).toBe('undefined');

      done();
    });

    it('Update - function', function(done) {
      modal.onClose = fnc1;
      expect(modal.onClose).toBe(fnc1);

      done();
    });

    it('Update - another function', function(done) {
      modal.onClose = fnc2;
      expect(modal.onClose).toBe(fnc2);

      done();
    });

    it('Update - default', function(done) {
      modal.onClose = null;
      expect(typeof modal.onClose).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.onClose = fnc1;
      expect(modal.onClose).toBe(fnc1);

      modal.onClose = 5;
      expect(modal.onClose).toBe(fnc1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.duration = 5;
      expect(modal.onClose).toBe(fnc1);

      done();
    });
  });

  describe('onBeforeOpen', function() {
    var modal;
    function fnc1() {}
    function fnc2() {}

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      done();
    });

    it('default', function(done) {
      expect(typeof modal.onBeforeOpen).toBe('undefined');

      done();
    });

    it('Update - function', function(done) {
      modal.onBeforeOpen = fnc1;
      expect(modal.onBeforeOpen).toBe(fnc1);

      done();
    });

    it('Update - another function', function(done) {
      modal.onBeforeOpen = fnc2;
      expect(modal.onBeforeOpen).toBe(fnc2);

      done();
    });

    it('Update - default', function(done) {
      modal.onBeforeOpen = null;
      expect(typeof modal.onBeforeOpen).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.onBeforeOpen = fnc1;
      expect(modal.onBeforeOpen).toBe(fnc1);

      modal.onBeforeOpen = 5;
      expect(modal.onBeforeOpen).toBe(fnc1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.duration = 5;
      expect(modal.onBeforeOpen).toBe(fnc1);

      done();
    });
  });

  describe('onBeforeClose', function() {
    var modal;
    function fnc1() {}
    function fnc2() {}

    beforeAll(function(done) {
      modal = new PlainModal(document.getElementById('elm1'));
      done();
    });

    it('default', function(done) {
      expect(typeof modal.onBeforeClose).toBe('undefined');

      done();
    });

    it('Update - function', function(done) {
      modal.onBeforeClose = fnc1;
      expect(modal.onBeforeClose).toBe(fnc1);

      done();
    });

    it('Update - another function', function(done) {
      modal.onBeforeClose = fnc2;
      expect(modal.onBeforeClose).toBe(fnc2);

      done();
    });

    it('Update - default', function(done) {
      modal.onBeforeClose = null;
      expect(typeof modal.onBeforeClose).toBe('undefined');

      done();
    });

    it('Update - Invalid value -> ignored', function(done) {
      modal.onBeforeClose = fnc1;
      expect(modal.onBeforeClose).toBe(fnc1);

      modal.onBeforeClose = 5;
      expect(modal.onBeforeClose).toBe(fnc1);

      done();
    });

    it('Update another option -> ignored', function(done) {
      modal.duration = 5;
      expect(modal.onBeforeClose).toBe(fnc1);

      done();
    });
  });

});
