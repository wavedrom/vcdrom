'use strict';

const formatTime = (t, expo) => {
  const prefixes = ['T', 'G', 'M', 'k', '', 'm', 'µ', 'n', 'p', 'f', 'a', 'z', 'y'];
  const ts1 = 14 - expo;
  const prefix = prefixes[(ts1 / 3) |0];
  const mult = ([100, 10, 1])[ts1 % 3];
  return (t * mult).toLocaleString() + ' ' + prefix + 's';
};

module.exports = formatTime;
