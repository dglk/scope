(function() {
  'use strict';

  var Scope = function() {
    this.$$watchers = [];
    this.$$asyncQueue = [];
    this.$$phase = null;
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

    this.$$setPhase('digest');

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

    this.$$resetPhase();

    if (ttl < 0) {
      throw new Error("10 digest iterations reached");
    }
  };

  Scope.prototype.$apply = function(expr, args) {
    try {
      this.$$setPhase('apply');
      return expr(this, args);
    } finally {
      this.$$resetPhase();
      this.$digest();
    };
  };

  Scope.prototype.$evalAsync = function(expr) {
    var scope = this;
    if (!this.$$phase && !this.$$asyncQueue.length) {
      setTimeout(function() {
        if (scope.$$asyncQueue.length > 0) {
          scope.$digest();
        }
      }, 0);
    }
    this.$$asyncQueue.push(expr);
  };

  Scope.prototype.$$setPhase = function (phase) {
    if (this.$$phase) {
      throw new Error(this.$$phase + " already in progress");
    }
    this.$$phase = phase;
  };

  Scope.prototype.$$resetPhase = function() {
    this.$$phase = null;
  };

  window.Scope = Scope;
})();
