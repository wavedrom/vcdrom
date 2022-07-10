'use strict';

const getExt = value => {
  const parts = value.split('.');
  return parts[parts.length - 1];
};

const handleFiles = (el, handler) => async () => {
  const items = el.files;
  // console.log(items);
  if (items.length === 0) {
    return;
  }
  const readers = [];
  for (const item of items) {
    const file = item.getAsFile ? item.getAsFile() : item;
    const value = file.name;
    const ext = getExt(value);
    const s = file.stream();
    const reader = s.getReader();
    readers.push({ext, value, reader, file});
  }
  await handler(readers);
};

// 'https://gitlab.com', CORS issue
const urlRaw = {
  github:     'https://raw.githubusercontent.com',
  gist:       'https://gist.githubusercontent.com',
  bitbucket:  'https://bitbucket.org',
  gitlab:     'https://gl.githack.com',
  makerchip:  'https://makerchip.com',
  local:      '.'
};
const urlZip = {
  zgithub:    'https://raw.githubusercontent.com',
  zgist:      'https://gist.githubusercontent.com',
  zbitbucket: 'https://bitbucket.org',
  zgitlab:    'https://gl.githack.com',
  zmakerchip: 'https://makerchip.com',
  zlocal:     '.'
};

const getReaders = async (handler, vcdPath) => {
  const res = [];
  if (vcdPath) {
    const resp = await fetch(vcdPath);
    const body = await resp.body;
    const reader = body.getReader();
    res.push({
      key: 'local',
      value: vcdPath,
      format: 'raw',
      url: vcdPath,
      reader
    });
    // return;
  } else {
    const urlSearchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlSearchParams) {
      let format, ext, url, reader;
      if (urlRaw[key]) {
        format = 'raw';
        ext = getExt(value);
        url = urlRaw[key] + '/' + value;
        const resp = await fetch(url);
        const body = await resp.body;
        reader = body.getReader();
      } else if (urlZip[key]) {
        format = 'zip';
        ext = getExt(value);
        url = urlZip[key] + '/' + value;
        const resp = await fetch(url);
        const body = await resp.body;
        reader = body.getReader();
        // need to unpack stream
      } else {
        format = 'arg';
      }
      res.push({key, value, format, ext, url, reader});
    }
  }

  if (res.length > 0) {
    await handler(res);
    return;
  }

  const dropZoneEl = document.getElementById('drop-zone');
  const inputEl = document.getElementById('inputfile');

  if (inputEl && dropZoneEl) {
    await handleFiles(inputEl, handler)();
    inputEl.addEventListener('change', handleFiles(inputEl, handler), false);
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
        // console.log('Use DataTransferItemList interface to access the file(s)');
        await handleFiles({files: ev.dataTransfer.items}, handler)();
      } else {
        // console.log('Use DataTransfer interface to access the file(s)');
        await handleFiles(ev.dataTransfer, handler)();
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
  }

};

module.exports = getReaders;

/* eslint-env browser */
