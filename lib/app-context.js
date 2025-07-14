'use strict';

const genSub = (obj) => (key, cb) => {
  if (!obj[key]) {
    obj[key] = [];
  }
  obj[key].push(cb);  
};

const genUnSub = (obj) => (key, cb) => {
  const index = obj[key].indexOf(cb);
  if (index > -1) {
    obj[key].splice(index, 1);
  }
};

const appContext = () => {
  const stateObj = {};

  const subGetBefore = {};
  const subGetAfter = {};
  const subSetBefore = {};
  const subSetAfter = {};

  const handler = {
    get: function(target, key) {
      (subGetBefore[key] || []).map((cb) => cb());
      const val = target[key];
      (subGetAfter[key] || []).map((cb) => cb(val));
      return val;
    },
    set: function(target, key, val) {
      (subSetBefore[key] || []).map((cb) => cb(val));
      target[key] = val;
      (subSetAfter[key] || []).map((cb) => cb(val));
      return true;
    }
  };

  const state = new Proxy(stateObj, handler);  

  return {state,
    sub: {
      get: {
        before: genSub(subGetBefore),
        after: genSub(subGetAfter)
      },
      set: {
        before: genSub(subSetBefore),
        after: genSub(subSetAfter)
      }
    },
    unsub: {
      get: {
        before: genUnSub(subGetBefore),
        after: genUnSub(subGetAfter)
      },
      set: {
        before: genUnSub(subSetBefore),
        after: genUnSub(subSetAfter)
      }
    }
  };
};

module.exports = appContext;
