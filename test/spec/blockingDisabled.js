describe('blockingDisabled', function() {
  'use strict';

  var window, document, utils,
    PlainModal, PlainOverlay, pageDone,
    divInDoc, textInDoc, pInDoc,
    divInFace1, textInFace1, pInFace1,
    divInFace2, textInFace2, pInFace2,
    divInFace3, textInFace3, pInFace3,
    modal1, modal2, modal3, allModals,

    SCROLL_DOC = 2,
    SCROLL_FACE1 = 4,
    SCROLL_FACE2 = 8,
    SCROLL_FACE3 = 16;

  function blurElement(element) {
    if (element.blur) {
      element.blur();
    } else {
      element.ownerDocument.body.focus();
    }
  }

  function reset() {
    var selection = ('getSelection' in window ? window : document).getSelection();
    if (selection.rangeCount > 0) {
      try {
        selection.removeAllRanges(); // Trident bug?, `Error:800a025e` comes sometime
      } catch (error) { /* ignore */ }
    }
    if (document.activeElement) { blurElement(document.activeElement); }
    document.body.focus();
    // Trident bug? It seems that `focus()` makes selection again.
    if (selection.rangeCount > 0) {
      try {
        selection.removeAllRanges(); // Trident bug?, `Error:800a025e` comes sometime
      } catch (error) { /* ignore */ }
    }

    divInDoc.scrollTop = 0;

    // scrollLeft/Top need shown display
    var
      elmOverlay1 = PlainOverlay.insProps[
        PlainModal.insProps[modal1._id].plainOverlay._id].elmOverlay,
      elmOverlay2 = PlainOverlay.insProps[
        PlainModal.insProps[modal2._id].plainOverlay._id].elmOverlay,
      elmOverlay3 = PlainOverlay.insProps[
        PlainModal.insProps[modal3._id].plainOverlay._id].elmOverlay,
      display1 = elmOverlay1.style.display,
      display2 = elmOverlay2.style.display,
      display3 = elmOverlay3.style.display;
    elmOverlay1.style.display = elmOverlay2.style.display = elmOverlay3.style.display = 'block';
    divInFace1.scrollTop = 0;
    divInFace2.scrollTop = 0;
    divInFace3.scrollTop = 0;
    elmOverlay1.style.display = display1;
    elmOverlay2.style.display = display2;
    elmOverlay3.style.display = display3;
  }

  function setSelection(startElement, startIndex, endElement, endIndex) {
    var selection = ('getSelection' in window ? window : document).getSelection(),
      range;

    function parseNode(node, nodes, index) {
      if (!nodes) {
        nodes = [];
        index = 0;
      }
      var children = node.childNodes;
      for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType === Node.ELEMENT_NODE) {
          parseNode(children[i], nodes, index);
        } else if (children[i].nodeType === Node.TEXT_NODE) {
          var len = children[i].textContent.length;
          nodes.push({node: children[i], start: index, end: index + len - 1});
          index += len;
        }
      }
      return nodes;
    }

    function getPos(index, nodes) {
      var iList = 0;
      while (true) {
        if (index <= nodes[iList].end) {
          return {node: nodes[iList].node, offset: index - nodes[iList].start};
        }
        if (iList >= nodes.length - 1) { throw new Error('setSelection'); }
        iList++;
      }
    }

    if (selection.extend) { // Non-IE
      var posStart = getPos(startIndex, parseNode(startElement)),
        posEnd = getPos(endIndex, parseNode(endElement));
      posEnd.offset++;
      range = document.createRange();
      range.setStart(posStart.node, posStart.offset);
      range.setEnd(posEnd.node, posEnd.offset);
      selection.removeAllRanges();
      selection.addRange(range);

    } else { // IE
      range = document.body.createTextRange();
      range.moveToElementText(startElement);
      range.moveStart('character', startIndex);
      var range2 = document.body.createTextRange(); // moveEnd() can't move to another node
      range2.moveToElementText(endElement);
      range2.moveStart('character', endIndex + 1);
      range.setEndPoint('EndToStart', range2);
      try {
        selection.removeAllRanges(); // Trident bug?, `Error:800a025e` comes sometime
      } catch (error) { /* ignore */ }
      range.select();
      selection = ('getSelection' in window ? window : document).getSelection(); // Get again
    }
    return selection;
  }

  function fireKeyup() {
    var evt;
    try {
      evt = new KeyboardEvent('keyup', {shiftKey: true}); // shiftKey is dummy
    } catch (error) {
      evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent('keyup', true, false, window, 'Shift', 0x01, 'Shift', false, null);
    }
    window.dispatchEvent(evt);
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/blockingDisabled.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      PlainModal = window.PlainModal;
      PlainOverlay = window.PlainOverlay;

      divInDoc = document.getElementById('divInDoc');
      textInDoc = document.getElementById('textInDoc');
      pInDoc = document.getElementById('pInDoc');
      divInFace1 = document.getElementById('divInFace1');
      textInFace1 = document.getElementById('textInFace1');
      pInFace1 = document.getElementById('pInFace1');
      divInFace2 = document.getElementById('divInFace2');
      textInFace2 = document.getElementById('textInFace2');
      pInFace2 = document.getElementById('pInFace2');
      divInFace3 = document.getElementById('divInFace3');
      textInFace3 = document.getElementById('textInFace3');
      pInFace3 = document.getElementById('pInFace3');
      modal1 = new PlainModal(document.getElementById('face1'));
      modal2 = new PlainModal(document.getElementById('face2'));
      modal3 = new PlainModal(document.getElementById('face3'));
      allModals = [modal1, modal2, modal3];

      pageDone = done;
      beforeDone();
    }, 'blockingDisabled');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainModal.limit).toBe(!!self.top.LIMIT);
  });

  it('No modal', function(done) {
    utils.makeState(allModals,
      PlainModal.STATE_CLOSED,
      function(modal) { modal.close(true); },
      function() {
        reset();
        setTimeout(function() {

          // scroll
          expect(divInDoc.scrollTop).toBe(0);
          divInDoc.scrollTop = SCROLL_DOC;
          setTimeout(function() {
            expect(divInDoc.scrollTop).toBe(SCROLL_DOC);

            // focus
            expect(document.activeElement).not.toBe(textInDoc);
            textInDoc.focus();
            setTimeout(function() {
              expect(document.activeElement).toBe(textInDoc);

              // select
              var selection;
              setSelection(pInDoc, 1, pInDoc, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');
              setTimeout(function() {
                fireKeyup();
                setTimeout(function() {
                  selection = ('getSelection' in window ? window : document).getSelection();
                  expect(selection.rangeCount).toBe(1);
                  expect(selection.toString()).toBe('0rem ipsum');

                  done();
                }, 0);
              }, 0);
            }, 10);
          }, 20);

        }, 20);
      }
    );
  });

  it('Parent modal', function(done) {
    var timer1;
    utils.makeState(allModals,
      [PlainModal.STATE_OPENED, PlainModal.STATE_CLOSED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        timer1 = setTimeout(function() {
          reset();
          modal1.open(true);
        }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);
        setTimeout(function() {

          expect(PlainModal.insProps[modal1._id].plainOverlay.blockingDisabled).toBe(false);

          // scroll
          expect(divInDoc.scrollTop).toBe(0);
          expect(divInFace1.scrollTop).toBe(0);
          divInDoc.scrollTop = SCROLL_DOC;
          divInFace1.scrollTop = SCROLL_FACE1;
          setTimeout(function() {
            expect(divInDoc.scrollTop).toBe(0); // Avoided
            expect(divInFace1.scrollTop).toBe(SCROLL_FACE1);

            // focus
            expect(document.activeElement).not.toBe(textInDoc);
            textInDoc.focus();
            setTimeout(function() {
              expect(document.activeElement).not.toBe(textInDoc); // Avoided
              textInFace1.focus();
              setTimeout(function() {
                expect(document.activeElement).toBe(textInFace1);

                // select
                var selection;
                setSelection(pInDoc, 1, pInDoc, 10);
                selection = ('getSelection' in window ? window : document).getSelection();
                expect(selection.rangeCount).toBe(1);
                expect(selection.toString()).toBe('0rem ipsum');
                setTimeout(function() {
                  fireKeyup();
                  setTimeout(function() {
                    selection = ('getSelection' in window ? window : document).getSelection();
                    expect(selection.rangeCount).toBe(0); // Avoided
                    expect(selection.toString()).toBe('');

                    setSelection(pInFace1, 1, pInFace1, 10);
                    selection = ('getSelection' in window ? window : document).getSelection();
                    expect(selection.rangeCount).toBe(1);
                    expect(selection.toString()).toBe('1rem ipsum');
                    setTimeout(function() {
                      fireKeyup();
                      setTimeout(function() {
                        selection = ('getSelection' in window ? window : document).getSelection();
                        expect(selection.rangeCount).toBe(1);
                        expect(selection.toString()).toBe('1rem ipsum');

                        done();
                      }, 0);
                    }, 0);
                  }, 0);
                }, 0);
              }, 10);
            }, 10);
          }, 20);

        }, 20);
      }
    );
  });

  it('Parent modal, Child modal', function(done) {
    var timer1;
    utils.makeState(allModals,
      [PlainModal.STATE_INACTIVATED, PlainModal.STATE_OPENED, PlainModal.STATE_CLOSED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        timer1 = setTimeout(function() {
          reset();
          modal1.open(true);
          timer1 = setTimeout(function() {
            modal2.open(true);
          }, 10);
        }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);
        setTimeout(function() {

          expect(PlainModal.insProps[modal1._id].plainOverlay.blockingDisabled).toBe(true);
          expect(PlainModal.insProps[modal2._id].plainOverlay.blockingDisabled).toBe(false);

          // scroll
          expect(divInDoc.scrollTop).toBe(0);
          expect(divInFace1.scrollTop).toBe(0);
          expect(divInFace2.scrollTop).toBe(0);
          divInDoc.scrollTop = SCROLL_DOC;
          divInFace1.scrollTop = SCROLL_FACE1;
          divInFace2.scrollTop = SCROLL_FACE2;
          setTimeout(function() {
            expect(divInDoc.scrollTop).toBe(0); // Avoided
            // blockingDisabled but scrolling in `face` is not avoided. It's ok because user can't that.
            expect(divInFace1.scrollTop).toBe(SCROLL_FACE1);
            expect(divInFace2.scrollTop).toBe(SCROLL_FACE2);

            // focus
            expect(document.activeElement).not.toBe(textInDoc);
            textInDoc.focus();
            setTimeout(function() {
              expect(document.activeElement).not.toBe(textInDoc); // Avoided
              textInFace1.focus();
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInFace1); // Avoided
                textInFace2.focus();
                setTimeout(function() {
                  expect(document.activeElement).toBe(textInFace2);

                  // select
                  var selection;
                  setSelection(pInDoc, 1, pInDoc, 10);
                  selection = ('getSelection' in window ? window : document).getSelection();
                  expect(selection.rangeCount).toBe(1);
                  expect(selection.toString()).toBe('0rem ipsum');
                  setTimeout(function() {
                    fireKeyup();
                    setTimeout(function() {
                      selection = ('getSelection' in window ? window : document).getSelection();
                      expect(selection.rangeCount).toBe(0); // Avoided
                      expect(selection.toString()).toBe('');

                      setSelection(pInFace1, 1, pInFace1, 10);
                      selection = ('getSelection' in window ? window : document).getSelection();
                      expect(selection.rangeCount).toBe(1);
                      expect(selection.toString()).toBe('1rem ipsum');
                      setTimeout(function() {
                        fireKeyup();
                        setTimeout(function() {
                          selection = ('getSelection' in window ? window : document).getSelection();
                          expect(selection.rangeCount).toBe(0); // Avoided
                          expect(selection.toString()).toBe('');

                          setSelection(pInFace2, 1, pInFace2, 10);
                          selection = ('getSelection' in window ? window : document).getSelection();
                          expect(selection.rangeCount).toBe(1);
                          expect(selection.toString()).toBe('2rem ipsum');
                          setTimeout(function() {
                            fireKeyup();
                            setTimeout(function() {
                              selection = ('getSelection' in window ? window : document).getSelection();
                              expect(selection.rangeCount).toBe(1);
                              expect(selection.toString()).toBe('2rem ipsum');

                              done();
                            }, 0);
                          }, 0);
                        }, 0);
                      }, 0);
                    }, 0);
                  }, 0);
                }, 10);
              }, 10);
            }, 10);
          }, 20);

        }, 20);
      }
    );
  });

  it('Parent modal, Child modal, Grandchild modal', function(done) {
    var timer1;
    utils.makeState(allModals,
      [PlainModal.STATE_INACTIVATED, PlainModal.STATE_INACTIVATED, PlainModal.STATE_OPENED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        timer1 = setTimeout(function() {
          reset();
          modal1.open(true);
          timer1 = setTimeout(function() {
            modal2.open(true);
            timer1 = setTimeout(function() {
              modal3.open(true);
            }, 10);
          }, 10);
        }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);
        setTimeout(function() {

          expect(PlainModal.insProps[modal1._id].plainOverlay.blockingDisabled).toBe(true);
          expect(PlainModal.insProps[modal2._id].plainOverlay.blockingDisabled).toBe(true);
          expect(PlainModal.insProps[modal3._id].plainOverlay.blockingDisabled).toBe(false);

          // scroll
          expect(divInDoc.scrollTop).toBe(0);
          expect(divInFace1.scrollTop).toBe(0);
          expect(divInFace2.scrollTop).toBe(0);
          expect(divInFace3.scrollTop).toBe(0);
          divInDoc.scrollTop = SCROLL_DOC;
          divInFace1.scrollTop = SCROLL_FACE1;
          divInFace2.scrollTop = SCROLL_FACE2;
          divInFace3.scrollTop = SCROLL_FACE3;
          setTimeout(function() {
            expect(divInDoc.scrollTop).toBe(0); // Avoided
            // blockingDisabled but scrolling in `face` is not avoided. It's ok because user can't that.
            expect(divInFace1.scrollTop).toBe(SCROLL_FACE1);
            expect(divInFace2.scrollTop).toBe(SCROLL_FACE2);
            expect(divInFace3.scrollTop).toBe(SCROLL_FACE3);

            // focus
            expect(document.activeElement).not.toBe(textInDoc);
            textInDoc.focus();
            setTimeout(function() {
              expect(document.activeElement).not.toBe(textInDoc); // Avoided
              textInFace1.focus();
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInFace1); // Avoided
                textInFace2.focus();
                setTimeout(function() {
                  expect(document.activeElement).not.toBe(textInFace2); // Avoided
                  textInFace3.focus();
                  setTimeout(function() {
                    expect(document.activeElement).toBe(textInFace3);

                    // select
                    var selection;
                    setSelection(pInDoc, 1, pInDoc, 10);
                    selection = ('getSelection' in window ? window : document).getSelection();
                    expect(selection.rangeCount).toBe(1);
                    expect(selection.toString()).toBe('0rem ipsum');
                    setTimeout(function() {
                      fireKeyup();
                      setTimeout(function() {
                        selection = ('getSelection' in window ? window : document).getSelection();
                        expect(selection.rangeCount).toBe(0); // Avoided
                        expect(selection.toString()).toBe('');

                        setSelection(pInFace1, 1, pInFace1, 10);
                        selection = ('getSelection' in window ? window : document).getSelection();
                        expect(selection.rangeCount).toBe(1);
                        expect(selection.toString()).toBe('1rem ipsum');
                        setTimeout(function() {
                          fireKeyup();
                          setTimeout(function() {
                            selection = ('getSelection' in window ? window : document).getSelection();
                            expect(selection.rangeCount).toBe(0); // Avoided
                            expect(selection.toString()).toBe('');

                            setSelection(pInFace2, 1, pInFace2, 10);
                            selection = ('getSelection' in window ? window : document).getSelection();
                            expect(selection.rangeCount).toBe(1);
                            expect(selection.toString()).toBe('2rem ipsum');
                            setTimeout(function() {
                              fireKeyup();
                              setTimeout(function() {
                                selection = ('getSelection' in window ? window : document).getSelection();
                                expect(selection.rangeCount).toBe(0); // Avoided
                                expect(selection.toString()).toBe('');

                                setSelection(pInFace3, 1, pInFace3, 10);
                                selection = ('getSelection' in window ? window : document).getSelection();
                                expect(selection.rangeCount).toBe(1);
                                expect(selection.toString()).toBe('3rem ipsum');
                                setTimeout(function() {
                                  fireKeyup();
                                  setTimeout(function() {
                                    selection = ('getSelection' in window ? window : document).getSelection();
                                    expect(selection.rangeCount).toBe(1);
                                    expect(selection.toString()).toBe('3rem ipsum');

                                    done();
                                  }, 0);
                                }, 0);
                              }, 0);
                            }, 0);
                          }, 0);
                        }, 0);
                      }, 0);
                    }, 0);
                  }, 10);
                }, 10);
              }, 10);
            }, 10);
          }, 20);

        }, 20);
      }
    );
  });

  it('Parent modal, Child modal (Grandchild modal was closed)', function(done) {
    var timer1;
    utils.makeState(allModals,
      [PlainModal.STATE_INACTIVATED, PlainModal.STATE_INACTIVATED, PlainModal.STATE_OPENED],
      function() {
        modal1.close(true);
        modal2.close(true);
        modal3.close(true);
        timer1 = setTimeout(function() {

          expect(modal1.state).toBe(PlainModal.STATE_CLOSED);
          expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
          expect(modal3.state).toBe(PlainModal.STATE_CLOSED);

          modal1.open(true);
          timer1 = setTimeout(function() {

            expect(modal1.state).toBe(PlainModal.STATE_OPENED);
            expect(modal2.state).toBe(PlainModal.STATE_CLOSED);
            expect(modal3.state).toBe(PlainModal.STATE_CLOSED);

            modal2.open(true);
            timer1 = setTimeout(function() {

              expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
              expect(modal2.state).toBe(PlainModal.STATE_OPENED);
              expect(modal3.state).toBe(PlainModal.STATE_CLOSED);

              modal3.open(true);
            }, 10);
          }, 10);
        }, 10);
        return true;
      },
      function() {
        clearTimeout(timer1);
        reset();
        modal3.close(true);
        setTimeout(function() {

          expect(modal1.state).toBe(PlainModal.STATE_INACTIVATED);
          expect(modal2.state).toBe(PlainModal.STATE_OPENED);
          expect(modal3.state).toBe(PlainModal.STATE_CLOSED);

          expect(PlainModal.insProps[modal1._id].plainOverlay.blockingDisabled).toBe(true);
          expect(PlainModal.insProps[modal2._id].plainOverlay.blockingDisabled).toBe(false);

          // scroll
          expect(divInDoc.scrollTop).toBe(0);
          expect(divInFace1.scrollTop).toBe(0);
          expect(divInFace2.scrollTop).toBe(0);
          divInDoc.scrollTop = SCROLL_DOC;
          divInFace1.scrollTop = SCROLL_FACE1;
          divInFace2.scrollTop = SCROLL_FACE2;
          setTimeout(function() {
            expect(divInDoc.scrollTop).toBe(0); // Avoided
            // blockingDisabled but scrolling in `face` is not avoided. It's ok because user can't that.
            expect(divInFace1.scrollTop).toBe(SCROLL_FACE1);
            expect(divInFace2.scrollTop).toBe(SCROLL_FACE2);

            // focus
            expect(document.activeElement).not.toBe(textInDoc);
            textInDoc.focus();
            setTimeout(function() {
              expect(document.activeElement).not.toBe(textInDoc); // Avoided
              textInFace1.focus();
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInFace1); // Avoided
                textInFace2.focus();
                setTimeout(function() {
                  expect(document.activeElement).toBe(textInFace2);

                  // select
                  var selection;
                  setSelection(pInDoc, 1, pInDoc, 10);
                  selection = ('getSelection' in window ? window : document).getSelection();
                  expect(selection.rangeCount).toBe(1);
                  expect(selection.toString()).toBe('0rem ipsum');
                  setTimeout(function() {
                    fireKeyup();
                    setTimeout(function() {
                      selection = ('getSelection' in window ? window : document).getSelection();
                      expect(selection.rangeCount).toBe(0); // Avoided
                      expect(selection.toString()).toBe('');

                      setSelection(pInFace1, 1, pInFace1, 10);
                      selection = ('getSelection' in window ? window : document).getSelection();
                      expect(selection.rangeCount).toBe(1);
                      expect(selection.toString()).toBe('1rem ipsum');
                      setTimeout(function() {
                        fireKeyup();
                        setTimeout(function() {
                          selection = ('getSelection' in window ? window : document).getSelection();
                          expect(selection.rangeCount).toBe(0); // Avoided
                          expect(selection.toString()).toBe('');

                          setSelection(pInFace2, 1, pInFace2, 10);
                          selection = ('getSelection' in window ? window : document).getSelection();
                          expect(selection.rangeCount).toBe(1);
                          expect(selection.toString()).toBe('2rem ipsum');
                          setTimeout(function() {
                            fireKeyup();
                            setTimeout(function() {
                              selection = ('getSelection' in window ? window : document).getSelection();
                              expect(selection.rangeCount).toBe(1);
                              expect(selection.toString()).toBe('2rem ipsum');

                              done();
                            }, 0);
                          }, 0);
                        }, 0);
                      }, 0);
                    }, 0);
                  }, 0);
                }, 10);
              }, 10);
            }, 10);
          }, 20);

        }, 20);
      }
    );
  });

});
