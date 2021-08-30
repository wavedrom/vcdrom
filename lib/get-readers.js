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

};

/* eslint-env browser */
