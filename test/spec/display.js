
describe('display', function() {
  'use strict';

  var window, document, PlainModal, pageDone;

  beforeAll(function(beforeDone) {
    loadPage('spec/display.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainModal = window.PlainModal;
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

  it('No display', function() {
    var div = document.getElementById('div'),
      span = document.getElementById('span');

    expect(div.style.display).toBe('');
    expect(span.style.display).toBe('');
    expect(window.getComputedStyle(div, '').display).toBe('block');
    expect(window.getComputedStyle(span, '').display).toBe('inline');

    new PlainModal(div); // eslint-disable-line no-new
    new PlainModal(span); // eslint-disable-line no-new

    expect(div.style.display).toBe('');
    expect(span.style.display).toBe('');
    expect(window.getComputedStyle(div, '').display).toBe('block');
    // This should be `block` because it's flex-item. Trident bug
    expect(window.getComputedStyle(span, '').display).toBe(window.IS_TRIDENT ? 'inline' : 'block');
  });

  it('display by stylesheet', function() {
    var div = document.getElementById('div-stylesheet'),
      span = document.getElementById('span-stylesheet');

    expect(div.style.display).toBe('');
    expect(span.style.display).toBe('');
    expect(window.getComputedStyle(div, '').display).toBe('none');
    expect(window.getComputedStyle(span, '').display).toBe('none');

    new PlainModal(div); // eslint-disable-line no-new
    new PlainModal(span); // eslint-disable-line no-new

    expect(div.style.display).toBe('block');
    expect(span.style.display).toBe('block');
    expect(window.getComputedStyle(div, '').display).toBe('block');
    expect(window.getComputedStyle(span, '').display).toBe('block');
  });

  it('display by style', function() {
    var div = document.getElementById('div-style'),
      span = document.getElementById('span-style');

    expect(div.style.display).toBe('none');
    expect(span.style.display).toBe('none');
    expect(window.getComputedStyle(div, '').display).toBe('none');
    expect(window.getComputedStyle(span, '').display).toBe('none');

    new PlainModal(div); // eslint-disable-line no-new
    new PlainModal(span); // eslint-disable-line no-new

    expect(div.style.display).toBe('block');
    expect(span.style.display).toBe('block');
    expect(window.getComputedStyle(div, '').display).toBe('block');
    expect(window.getComputedStyle(span, '').display).toBe('block');
  });

});
