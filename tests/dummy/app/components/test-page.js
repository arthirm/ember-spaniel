import Component from '@ember/component';
import { inject as service} from '@ember/service';
import $ from 'jquery';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.cleanupTasks = [];
  },

  viewport: service(),
  clear() {
    for (let i = 0; i < this.cleanupTasks.length; i++) {
      this.cleanupTasks.pop()();
    }
  },

  didInsertElement() {
    let viewport = this.get('viewport');
    let first = document.getElementById("item-1");
    let second = document.getElementById('item-5');
    let third = document.getElementById('item-5');
    let fourth = document.getElementById('item-100');
    let childFirst = document.getElementById('child-item-3');
    let childSecond = document.getElementById('child-item-10');
    let childThird = document.getElementById('child-item-100');
    let childRoot = document.getElementById('childContainer');

    viewport.isInViewport(first).then(() => {
      $(first).addClass('isInViewport');
    });

    this.cleanupTasks.push(viewport.onInViewportOnce(second, () => {
      $(second).addClass('onInViewportOnce');
    }));

    this.cleanupTasks.push(viewport.onInViewportOnce(third, () => {
      Ember.$(third).addClass('onInViewportOnceCustom');
    }, {
      rootMargin: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }));

    this.cleanupTasks.push(viewport.onInViewportOnce(fourth, () => {
      Ember.$(fourth).addClass('unreachable-onInViewportOnce');
    }));

    // CHILD ROOT

    this.cleanupTasks.push(viewport.onInViewportOnce(childFirst, () => {
      Ember.$(childFirst).addClass('childOnInViewportOnce');
    }, {
      root: childRoot
    }));

    this.cleanupTasks.push(viewport.onInViewportOnce(childSecond, () => {
      Ember.$(childSecond).addClass('childOnInViewportOnce');
    }, {
      root: childRoot
    }));

    this.cleanupTasks.push(viewport.onInViewportOnce(childThird, () => {
      Ember.$(childThird).addClass('childOnInViewportOnce');
    }, {
      root: childRoot
    }));

    viewport.on('scroll', this.onIsDirty.bind(this), childRoot);
  },
  onIsDirty() {
    this.get('viewport').revalidate();
  },
  willDestroyElement() {
    this._super(...arguments);
    this.clear();
  }
});
