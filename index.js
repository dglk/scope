(function() {
  'use strict';

  var Scope = function() {
    this.$$watchers = [];
  };

  Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {
    this.$$watchers.push({
      watchFn: watchFn,
      listenerFn: listenerFn || function() {},
      valueEq: (valueEq) ? true : false,
      last: undefined
    });
  };

  Scope.prototype.$digest = function() {
    var scope = this;
    _.forEach(this.$$watchers, function(watcher) {
      var current = watcher.watchFn(scope);
      if (!(watcher.valueEq ? _.isEqual : _.eq)(current, watcher.last)) {
        watcher.listenerFn(scope);
        watcher.last = (watcher.valueEq) ? _.cloneDeep(current) : current;
      }
    });
  };

  Scope.prototype.$apply = function(expr, args) {
    var result = expr(this, args);
    this.$digest();
    return result;
  };

  window.Scope = Scope;
})();
