'use strict';

let getVCDsize = () => {
  let URL = window.location.href;
  let SplitURL = URL.split('&');
  let URLsize = SplitURL[[SplitURL.length - 1]];
  let VCDsize = URLsize.split('=')[1];
  return VCDsize;
};
