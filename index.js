(function() {
  'use strict';

  var Scope = function() {
    this.$$watchers = [];
  };

  Scope.prototype.$watch = function(watchFn, listenerFn) {
    this.$$watchers.push({
      watchFn: watchFn,
      listenerFn: listenerFn || function() {},
      last: undefined
    });
  };

  Scope.prototype.$digest = function() {
    var scope = this;
    _.forEach(this.$$watchers, function(watcher) {
      var current = watcher.watchFn(scope);
      if (current !== watcher.last) {
        watcher.listenerFn(scope);
        watcher.last = current;
      }
    });
  };

  window.Scope = Scope;
})();
