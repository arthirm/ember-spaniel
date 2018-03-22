import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { merge } from '@ember/polyfills';
import { Promise } from 'rsvp';
import spaniel from 'spaniel';

export default Service.extend({
  spaniel,

  // Private, don't touch this, use getWatcher()
  _globalWatcher: null,

  init() {
    this._super(...arguments);
    let config = getOwner(this).resolveRegistration('config:environment');
    let defaultRootMargin = config && config.defaultRootMargin;

    this.set('rootMargin', merge({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }, defaultRootMargin));

  },

  getWatcher() {
    return this._globalWatcher || (this._globalWatcher = new spaniel.Watcher({
      rootMargin: this.get('rootMargin')
    }));
  },

  isInViewport(el, { ratio, rootMargin } = {}) {
    rootMargin = rootMargin || this.get('rootMargin');
    return new Promise((resolve, reject) => {
      spaniel.elementSatisfiesRatio(el, ratio, (flag) => {
        if (flag) {
          resolve({
            el
          });
        } else {
          reject({
            el
          });
        }
      }, rootMargin);
    });
  },

  onInViewportOnce(el, callback, { context, rootMargin, ratio, root = window } = {}) {
    const canUseGlobalWatcher = !(rootMargin || ratio);
    let watcher = canUseGlobalWatcher ? this.getWatcher() : new spaniel.Watcher({ rootMargin, ratio, root });

    watcher.watch(el, function onInViewportOnceCallback() {
      callback.apply(context, arguments);
      watcher.unwatch(el);
    });
 
    return function clearOnInViewportOnce() {
      watcher.unwatch(el);
      if (!canUseGlobalWatcher) {
        watcher.destroy();
      }
    };
  },

  willDestroy() {
    if (this._globalWatcher) {
      this._globalWatcher.destroy();
    }
  },

  revalidate() {
    let watcher = this.getWatcher();    
    watcher.forceStateValidation();
  },

  on(eventName, callback, root = window) {
    root.addEventListener(eventName, callback, false);
  },

  off(eventName, callback, root = window) {
    root.removeEventListener(eventName, callback, false);
  },

  onDebounce(eventName, callback, interval, root = window) {
    this.on(eventName, _debounce(callback, interval), root);
  }
});

function _debounce(callback, interval = 5) {
  let _tmp = null;
  return () => {
    clearTimeout(_tmp);
    _tmp = setTimeout(callback, interval);
  }
}