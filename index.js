(function() {
  'use strict';

  var Scope = function() {
    this.$$watchers = [];
    this.$$asyncQueue = [];
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
    var scope = this,
        ttl = 10,
        dirty = false;
    do {
      ttl -= 1;
      dirty = false;

      while (this.$$asyncQueue.length > 0) {
        this.$apply(this.$$asyncQueue.shift());
      };

      _.forEach(this.$$watchers, function(watcher) {
        var current = watcher.watchFn(scope);
        if (!(watcher.valueEq ? _.isEqual : _.eq)(current, watcher.last)) {
          dirty = true;
          watcher.listenerFn(scope);
          watcher.last = (watcher.valueEq) ? _.cloneDeep(current) : current;
        }
      });
    } while (dirty || this.$$asyncQueue.length > 0 && ttl >= 0);

    if (ttl < 0) {
      throw new Error("10 digest iterations reached");
    }
  };

  Scope.prototype.$apply = function(expr, args) {
    var result = expr(this, args);
    this.$digest();
    return result;
  };

  Scope.prototype.$evalAsync = function(expr) {
    this.$$asyncQueue.push(expr);
  };

  window.Scope = Scope;
})();
