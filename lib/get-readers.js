'use strict';

// 'https://gitlab.com', CORS issue
const urlRaw = {
  github:     'https://raw.githubusercontent.com',
  gist:       'https://gist.githubusercontent.com',
  bitbucket:  'https://bitbucket.org',
  gitlab:     'https://gl.githack.com',
  local:      '.'
};
const urlZip = {
  zgithub:    'https://raw.githubusercontent.com',
  zgist:      'https://gist.githubusercontent.com',
  zbitbucket: 'https://bitbucket.org',
  zgitlab:    'https://gl.githack.com',
  zlocal:     '.'
};

module.exports = async (handler) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const res = [];
  for (const [key, value] of urlSearchParams) {
    let format, reader, url;
    if (urlRaw[key]) {
      format = 'raw';
      url = urlRaw[key] + '/' + value;
      const resp = await fetch(url);
      const body = await resp.body;
      reader = body.getReader();
    } else if (urlZip[key]) {
      format = 'zip';
      url = urlZip[key] + '/' + value;
      const resp = await fetch(url);
      const body = await resp.body;
      reader = body.getReader();
      // need to unpack stream
    }
    res.push({key, value, format, url, reader});
  }

  if (res.length > 0) {
    await handler(res);
  }

  const inputEl = document.getElementById('inputfile');
  const dropZoneEl = document.getElementById('drop-zone');

  const handleFiles = async () => {
    if (inputEl.files.length === 0) {
      return;
    }
    const file0 = inputEl.files[0];
    const s0 = file0.stream();
    const r0 = s0.getReader();

    await handler([{reader: r0}]);
  };
  inputEl.addEventListener('change', handleFiles, false);

  document.addEventListener('keydown', event => {
    if (event.ctrlKey && (event.key === 'o' || event.key === 'O')) {
      event.preventDefault();
      inputEl.click();
    }
  });

  dropZoneEl.addEventListener('click', () => {
    inputEl.click();
  }, false);

  window.addEventListener('drop', async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < 1 /* ev.dataTransfer.items.length */; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          const file = ev.dataTransfer.items[i].getAsFile();
          console.log('items[0]', file.name);
          const s0 = file.stream();
          const r0 = s0.getReader();
          await handler([{reader: r0}]);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < 1 /* ev.dataTransfer.files.length */; i++) {
        const file = ev.dataTransfer.files[i].getAsFile();
        console.log('files[0]', file.name);
        const s0 = file.stream();
        const r0 = s0.getReader();
        await handler([{reader: r0}]);
      }
    }
  }, false);

  window.addEventListener('dragover', ev => {
    ev.preventDefault();
    ev.stopPropagation();
  }, false);

  window.addEventListener('dragenter', ev => {
    ev.preventDefault();
    ev.stopPropagation();
  }, false);

};

/* eslint-env browser */
