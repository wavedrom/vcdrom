'use strict';

/**
 * This function creates a message handler from worker thread that validates
 * message format and routes commands to appropriate handler in the `handlers` object
 * 
 * @param {Object} handlo - Object of worker message handlers
 * @returns {Function} - Message handler function
 */
const onWorkerMessage = (handlo) =>
  async (e) => {
    const cmd = e?.data?.cmd;
    if (cmd === undefined) {
      console.log('UNKNOWN EVENT', e); // eslint-disable-line no-console
      return;
    }
    const handler = handlo[cmd];
    if (handler === undefined) {
      console.log('UNKNOWN CMD', cmd); // eslint-disable-line no-console
    } else {
      return await handler(e);
    }
  };

module.exports = onWorkerMessage;
