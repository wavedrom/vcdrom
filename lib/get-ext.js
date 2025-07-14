'use strict';

const getExt = value => {
  const parts = value.split('.');
  return parts[parts.length - 1];
};

module.exports = getExt;
