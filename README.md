# PlainModal

The simple library for fully customizable modal window in a web page.

**<a href="https://anseki.github.io/plain-modal/">Document and Examples https://anseki.github.io/plain-modal/</a>**

PlainModal has basic functions only, and it does nothing about visual style of the modal window. It means that you can free style it to perfect match for your web site or your app. It has no image files and no CSS files, it is just one small file only.

**Features:**

- Make a specified element become a modal window, and control the opening and closing it.
- Cover a web page with an overlay, and block scrolling, focusing and accessing anything under the overlay by a mouse or keys.
- No dependency.
- Single file.
- Modern browsers are supported. (If you want to support legacy browsers such as IE 9-, see [jQuery-plainModal](https://anseki.github.io/jquery-plainmodal/).)

## Usage

Load PlainModal into your web page.

```html
<script src="plain-modal.min.js"></script>
```

This is simplest case:

```html
<div id="modal-content" style="background-color: white;">
  Hello, world!
</div>
```

```js
var modal = new PlainModal(document.getElementById('modal-content'));
modal.open();
```

Now, new modal window is opened.  
You will see that the modal window has no style except for `background-color` to improve the visibility of this example. Therefore you can free style it. In other words, you have to do that for the visual design you want.

For options and more details, refer to the following.

## Constructor

```js
modal = new PlainModal(content[, options])
```

The `content` argument is an element that is shown as a modal window.

The `options` argument is an Object that can have properties as [options](#options). You can also change the options by [`setOptions`](#setoptions) or [`open`](#open) methods or [properties](#properties) of the PlainModal instance.

For example:

```js
// Construct new modal window, with `duration` option.
var modal = new PlainModal(document.getElementById('modal-content'), {duration: 400});
```

## Methods

### `open`

```js
self = modal.open([force][, options])
```

Open the modal window.  
If `true` is specified for `force` argument, open it immediately without an effect. (As to the effect, see [`duration`](#options-duration) option.)  
If `options` argument is specified, call [`setOptions`](#setoptions) method and open the modal window. It works the same as:

```js
modal.setOptions(options).open();
```

### `close`

```js
self = modal.close([force])
```

Close the modal window.  
If `true` is specified for `force` argument, close it immediately without an effect. (As to the effect, see [`duration`](#options-duration) option.)

### `setOptions`

```js
self = modal.setOptions(options)
```

Set one or more options.  
The `options` argument is an Object that can have properties as [options](#options).

## Options

### <a name="options-closebutton"></a>`closeButton`

*Type:* Element or `undefined`  
*Default:* `undefined`

Bind [`close`](#close) method to specified element, and the modal window is closed when the user clicks the element.

### <a name="options-duration"></a>`duration`

*Type:* number  
*Default:* `200`

A number determining how long (milliseconds) the effect (fade-in/out) animation for opening and closing the modal window will run.

### <a name="options-overlayblur"></a>`overlayBlur`

*Type:* number or boolean  
*Default:* `false`

Applies a Gaussian blur to the web page while the overlay is shown. Note that the current browser might not support it.  
It is not applied if `false` is specified.

For example:

```js
modal.overlayBlur = 3;
```

### <a name="options-draghandle"></a>`dragHandle`

*Type:* Element or `undefined`  
*Default:* `undefined`

To make the modal window be draggable, specify a part element of the `content` element (or the `content` element itself) that receives mouse operations. A user seizes and drags this element to move the modal window.  
The `content` element itself can be specified, and all of the modal window can be seized and dragged.

For example:

```js
modal.dragHandle = document.getElementById('title-bar');
```

### <a name="options-openeffect-closeeffect"></a>`openEffect`, `closeEffect`

*Type:* function or `undefined`  
*Default:* `undefined`

By default, the modal window is opened and closed with the fade-in effect and fade-out effect animation. You can specify additional effect for `openEffect` and `closeEffect` option. The default fade-in/out effect also still runs, specify `0` for [`duration`](#options-duration) option if you want to disable the default effect.

Each effect is a function that is called when the modal window is opened and closed. The function do something to open/close the modal window. It usually starts an animation that the modal window appears or it vanishes. For example, it adds or removes a CSS class that specifies CSS Animation.

The function may be passed `done` callback function. When the `done` is passed, the current opening or closing runs asynchronously, and the function must call the `done` when the effect finished. When the `done` is not passed, the current opening or closing runs synchronously, and the function must make the modal window appear or vanish immediately without effect. The opening or closing runs synchronously when [`open`](#open) method or [`close`](#close) method is called with `force` argument, or a child modal window is closed by closing parent modal window.

In the functions, `this` refers to the current PlainModal instance.

For example:

```js
var content = document.getElementById('modal-content'),
  modal = new PlainModal(content, {
    openEffect: function(done) {
      if (done) { // It is running asynchronously.
        startOpenAnim(); // Show animation 3 sec.
        setTimeout(function() {
          stopOpenAnim();
          content.style.display = 'block';
          done(); // Tell the finished to PlainModal.
        }, 3000);

      } else { // It is running synchronously.
        stopOpenAnim(); // It might be called when it is already running.
        content.style.display = 'block'; // Finish it immediately.
      }
    },

    closeEffect: function(done) {
      if (done) { // It is running asynchronously.
        startCloseAnim(); // Show animation 1 sec.
        setTimeout(function() {
          stopCloseAnim();
          content.style.display = 'none';
          done(); // Tell the finished to PlainModal.
        }, 1000);

      } else { // It is running synchronously.
        stopCloseAnim(); // It might be called when it is already running.
        content.style.display = 'none'; // Finish it immediately.
      }
    }
  });
```

You might want to use CSS animation such as [CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions) for the effect, and you might want to use DOM events such as [`transitionend`](https://developer.mozilla.org/en-US/docs/Web/Events/transitionend) event to get the finishing the effect.  
Note that you should add an event listener only once because the DOM events allow adding multiple listeners for an event.

For example:

```css
#modal {
  margin-top: -600px; /* Default position: outside of view */
  transition: margin-top 1s;
}

.opened {
  margin-top: 0; /* Move to the center position */
}

.force {
  transition-property: none; /* Disable the animation */
}
```

```js
var added,
  content = document.getElementById('modal-content'),
  modal = new PlainModal(content, {
    openEffect: function(done) {
      if (!added) { // A flag to avoid multiple adding.
        content.addEventListener('transitionend', done, false); // Only once
        added = true;
      }

      mClassList(content).toggle('force', !done); // Switch by async/sync.
      mClassList(content).add('opened');
    },

    closeEffect: function(done) {
      // addEventListener must have executed already.
      mClassList(content).toggle('force', !done); // Switch by async/sync.
      mClassList(content).remove('opened');
    }
    // You will probably collect openEffect and closeEffect into single function.
  });
```

For cross-browser compatibility, the example above uses [mClassList](https://github.com/anseki/m-class-list) shim instead of `classList`.

### <a name="options-onopen-onclose-onbeforeopen-onbeforeclose"></a>`onOpen`, `onClose`, `onBeforeOpen`, `onBeforeClose`

*Type:* function or `undefined`  
*Default:* `undefined`

Event listeners:

- `onBeforeOpen` is called when the modal window is about to be opened. If `false` is returned, the opening is canceled.
- `onOpen` is called when an opening effect of the modal window is finished.
- `onBeforeClose` is called when the modal window is about to be closed. If `false` is returned, the closing is canceled.
- `onClose` is called when a closing effect of the modal window is finished.

In the functions, `this` refers to the current PlainModal instance.

For example:

```js
var modal = new PlainModal({
  onOpen: function() {
    this.closeButton.style.display = 'block';
    name.focus(); // Activate the first input box.
  },
  onBeforeClose: function() {
    if (!name.value) {
      alert('Please input your name');
      return false; // Cancel the closing the modal window.
    }
  }
});
```

## Properties

### `state`

*Type:* number  
*Read-only*

A number to indicate current state of the modal window.  
It is one of the following static constant values:

- `PlainModal.STATE_CLOSED` (`0`): The modal window is being closing fully.
- `PlainModal.STATE_OPENING` (`1`): An opening effect of the modal window is running.
- `PlainModal.STATE_OPENED` (`2`): The modal window is being opening fully.
- `PlainModal.STATE_CLOSING` (`3`): A closing effect of the modal window is running.
- `PlainModal.STATE_INACTIVATING` (`4`): An inactivating effect of the modal window is running.
- `PlainModal.STATE_INACTIVATED` (`5`): The modal window is being inactivating fully.
- `PlainModal.STATE_ACTIVATING` (`6`): An activating effect of the modal window is running.

A modal window is inactivated and activated by a child modal window. For details, see "[Child and Descendants](#child-and-descendants)".

For example:

```js
openButton.addEventListener('click', function() {
  if (modal.state === PlainModal.STATE_CLOSED ||
      modal.state === PlainModal.STATE_CLOSING) {
    modal.open();
  }
}, false);
```

### `closeButton`

Get or set [`closeButton`](#options-closebutton) option.

### `duration`

Get or set [`duration`](#options-duration) option.

### `overlayBlur`

Get or set [`overlayBlur`](#options-overlayblur) option.

### `dragHandle`

Get or set [`dragHandle`](#options-draghandle) option.

### `openEffect`, `closeEffect`

Get or set [`openEffect`, `closeEffect`](#options-openeffect-closeeffect) options.

### `onOpen`, `onClose`, `onBeforeOpen`, `onBeforeClose`

Get or set [`onOpen`, `onClose`, `onBeforeOpen`, `onBeforeClose`](#options-onopen-onclose-onbeforeopen-onbeforeclose) options.

## Child and Descendants

When a modal window was already opened and another modal window is opened, now, the new one is the first one's "child modal window" and the first one is the new one's "parent modal window". Also, more modal windows can be opened, and those are descendants modal windows.

When a child modal window is opened, its parent modal window is moved to under the overlay that the user can't touch, then that is inactivated. And the child modal window is put on the foreground, then that is activated.  
When the child modal window is closed, its parent modal window is activated again.  
Descendants modal windows also work in the same way. That is, only one modal window can be active one that the user can touch. The active modal window is one that was last opened or a parent modal window that was last activated by closing its child modal window.

When a parent modal window is closed, its child modal window is closed before. The child modal window is closed with `force`.  
Descendants modal windows also work in the same way. That is, when a modal window is closed, all its descendants modal windows are closed.

## `PlainModal.closeByEscKey`

By default, when the user presses Escape key, the current active modal window is closed.  
If you want, set `PlainModal.closeByEscKey = false` to disable this behavior.

## `PlainModal.closeByOverlay`

By default, when the user clicks an overlay, the current active modal window is closed.  
If you want, set `PlainModal.closeByOverlay = false` to disable this behavior.

## Style of overlay

If you want to change style of the overlay, you can define style rules with `.plainmodal .plainmodal-overlay` selector in your style-sheet.  
Note that some properties that affect the layout (e.g. `width`, `border`, etc.) might not work or those might break the overlay.

For example, CSS rule-definition for whity overlay:

```css
.plainmodal .plainmodal-overlay {
  background-color: rgba(255, 255, 255, 0.6);
}
```

For example, for background image:

```css
.plainmodal .plainmodal-overlay {
  background-image : url(bg.png);
}
```

## See Also

These are used by PlainModal inside.

- [PlainOverlay](https://anseki.github.io/plain-overlay/) : The simple library for customizable overlay which covers all or part of a web page.
- [PlainDraggable](https://anseki.github.io/plain-draggable/) : The simple and high performance library to allow HTML/SVG element to be dragged.

---

Thanks for images: [The Pattern Library](http://thepatternlibrary.com/)
