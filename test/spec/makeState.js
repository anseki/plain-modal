
describe('makeState', function() {
  'use strict';

  var window, utils, pageDone,
    ins1, ins2, ins3;

  function initIns() {
    ins1 = {
      id: 1, state: 0,
      onOpen: 'ins1-onOpen', onClose: 'ins1-onClose',
      onBeforeOpen: 'ins1-onBeforeOpen', onBeforeClose: 'ins1-onBeforeClose'
    };
    ins2 = {
      id: 2, state: 0,
      onOpen: 'ins2-onOpen', onClose: 'ins2-onClose',
      onBeforeOpen: 'ins2-onBeforeOpen', onBeforeClose: 'ins2-onBeforeClose'
    };
    ins3 = {
      id: 3, state: 0,
      onOpen: 'ins3-onOpen', onClose: 'ins3-onClose',
      onBeforeOpen: 'ins3-onBeforeOpen', onBeforeClose: 'ins3-onBeforeClose'
    };
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/common.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      utils = window.utils;

      pageDone = done;
      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  it('Normal flow', function(done) {
    var log = [];
    initIns();

    utils.makeState(
      [ins1, ins2, ins3],
      [1, 2, 4],
      function(ins) {
        expect(ins.onOpen == null).toBe(true);
        expect(ins.onClose == null).toBe(true);
        expect(ins.onBeforeOpen == null).toBe(true);
        expect(ins.onBeforeClose == null).toBe(true);

        log.push('cbChange:' + ins.id);
        ins.state =
          ins.id === 1 ? 1 :
          ins.id === 2 ? 2 :
          ins.id === 3 ? 4 : null;
      },
      function() {

        expect(ins1.onOpen).toBe('ins1-onOpen');
        expect(ins1.onClose).toBe('ins1-onClose');
        expect(ins1.onBeforeOpen).toBe('ins1-onBeforeOpen');
        expect(ins1.onBeforeClose).toBe('ins1-onBeforeClose');
        expect(ins2.onOpen).toBe('ins2-onOpen');
        expect(ins2.onClose).toBe('ins2-onClose');
        expect(ins2.onBeforeOpen).toBe('ins2-onBeforeOpen');
        expect(ins2.onBeforeClose).toBe('ins2-onBeforeClose');
        expect(ins3.onOpen).toBe('ins3-onOpen');
        expect(ins3.onClose).toBe('ins3-onClose');
        expect(ins3.onBeforeOpen).toBe('ins3-onBeforeOpen');
        expect(ins3.onBeforeClose).toBe('ins3-onBeforeClose');

        expect(ins1.state).toBe(1);
        expect(ins2.state).toBe(2);
        expect(ins3.state).toBe(4);
        expect(log).toEqual([
          'cbChange:1',
          'cbChange:2',
          'cbChange:3'
        ]);

        done();
      }
    );
  });

  it('should throw an error when it can not change state', function(done) {
    var log = [];
    initIns();

    // To catch an error that is thrown asynchronously (`toThrowError` can't it).
    window.Error = function(message) {
      expect(ins1.state).toBe(0);
      expect(ins2.state).toBe(0);
      expect(ins3.state).toBe(0);
      expect(log).toEqual([
        'cbChange:1',
        'cbChange:2',
        'cbChange:3'
      ]);
      expect(message).toBe('`state` can not become 1,2,4.');

      done();
    };

    utils.makeState.MAX_WAIT_COUNT = 50;

    utils.makeState(
      [ins1, ins2, ins3],
      [1, 2, 4],
      function(ins) {
        expect(ins.onOpen == null).toBe(true);
        expect(ins.onClose == null).toBe(true);
        expect(ins.onBeforeOpen == null).toBe(true);
        expect(ins.onBeforeClose == null).toBe(true);

        log.push('cbChange:' + ins.id);
      },
      function() {
        log.push('cbReady'); // This is not executed
      }
    );

  });

  it('should copy last state', function(done) {
    var log = [];
    initIns();

    utils.makeState(
      [ins1, ins2, ins3],
      5, // means [5, 5, 5]
      function(ins) {
        expect(ins.onOpen == null).toBe(true);
        expect(ins.onClose == null).toBe(true);
        expect(ins.onBeforeOpen == null).toBe(true);
        expect(ins.onBeforeClose == null).toBe(true);

        log.push('cbChange:' + ins.id);
        ins.state = 5;
      },
      function() {

        expect(ins1.onOpen).toBe('ins1-onOpen');
        expect(ins1.onClose).toBe('ins1-onClose');
        expect(ins1.onBeforeOpen).toBe('ins1-onBeforeOpen');
        expect(ins1.onBeforeClose).toBe('ins1-onBeforeClose');
        expect(ins2.onOpen).toBe('ins2-onOpen');
        expect(ins2.onClose).toBe('ins2-onClose');
        expect(ins2.onBeforeOpen).toBe('ins2-onBeforeOpen');
        expect(ins2.onBeforeClose).toBe('ins2-onBeforeClose');
        expect(ins3.onOpen).toBe('ins3-onOpen');
        expect(ins3.onClose).toBe('ins3-onClose');
        expect(ins3.onBeforeOpen).toBe('ins3-onBeforeOpen');
        expect(ins3.onBeforeClose).toBe('ins3-onBeforeClose');

        expect(ins1.state).toBe(5);
        expect(ins2.state).toBe(5);
        expect(ins3.state).toBe(5);
        expect(log).toEqual([
          'cbChange:1',
          'cbChange:2',
          'cbChange:3'
        ]);

        done();
      }
    );
  });

  it('should call cbChange only once at each instance', function(done) {
    var log = [];
    initIns();

    utils.makeState(
      [ins1, ins2, ins3],
      [1, 2, 4],
      function(ins) {
        expect(ins.onOpen == null).toBe(true);
        expect(ins.onClose == null).toBe(true);
        expect(ins.onBeforeOpen == null).toBe(true);
        expect(ins.onBeforeClose == null).toBe(true);

        log.push('cbChange:' + ins.id);

        setTimeout(function() {
          ins.state =
            ins.id === 1 ? 1 :
            ins.id === 2 ? 2 :
            ins.id === 3 ? 4 : null;
        }, 100);
      },
      function() {

        expect(ins1.onOpen).toBe('ins1-onOpen');
        expect(ins1.onClose).toBe('ins1-onClose');
        expect(ins1.onBeforeOpen).toBe('ins1-onBeforeOpen');
        expect(ins1.onBeforeClose).toBe('ins1-onBeforeClose');
        expect(ins2.onOpen).toBe('ins2-onOpen');
        expect(ins2.onClose).toBe('ins2-onClose');
        expect(ins2.onBeforeOpen).toBe('ins2-onBeforeOpen');
        expect(ins2.onBeforeClose).toBe('ins2-onBeforeClose');
        expect(ins3.onOpen).toBe('ins3-onOpen');
        expect(ins3.onClose).toBe('ins3-onClose');
        expect(ins3.onBeforeOpen).toBe('ins3-onBeforeOpen');
        expect(ins3.onBeforeClose).toBe('ins3-onBeforeClose');

        expect(ins1.state).toBe(1);
        expect(ins2.state).toBe(2);
        expect(ins3.state).toBe(4);
        expect(log).toEqual([
          'cbChange:1',
          'cbChange:2',
          'cbChange:3'
        ]);

        done();
      }
    );
  });

  it('should call cbChange only once if that returned true', function(done) {
    var log = [];
    initIns();

    utils.makeState(
      [ins1, ins2, ins3],
      [1, 2, 4],
      function(ins) {
        expect(ins.onOpen == null).toBe(true);
        expect(ins.onClose == null).toBe(true);
        expect(ins.onBeforeOpen == null).toBe(true);
        expect(ins.onBeforeClose == null).toBe(true);

        log.push('cbChange:' + ins.id);

        setTimeout(function() {
          ins1.state = 1;
          ins2.state = 2;
          ins3.state = 4;
        }, 200);

        return true;
      },
      function() {

        expect(ins1.onOpen).toBe('ins1-onOpen');
        expect(ins1.onClose).toBe('ins1-onClose');
        expect(ins1.onBeforeOpen).toBe('ins1-onBeforeOpen');
        expect(ins1.onBeforeClose).toBe('ins1-onBeforeClose');
        expect(ins2.onOpen).toBe('ins2-onOpen');
        expect(ins2.onClose).toBe('ins2-onClose');
        expect(ins2.onBeforeOpen).toBe('ins2-onBeforeOpen');
        expect(ins2.onBeforeClose).toBe('ins2-onBeforeClose');
        expect(ins3.onOpen).toBe('ins3-onOpen');
        expect(ins3.onClose).toBe('ins3-onClose');
        expect(ins3.onBeforeOpen).toBe('ins3-onBeforeOpen');
        expect(ins3.onBeforeClose).toBe('ins3-onBeforeClose');

        expect(ins1.state).toBe(1);
        expect(ins2.state).toBe(2);
        expect(ins3.state).toBe(4);
        expect(log).toEqual([
          'cbChange:1'
        ]);

        done();
      }
    );
  });

});
