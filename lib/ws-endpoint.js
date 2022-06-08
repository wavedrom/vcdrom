// eslint-disable-next-line no-unused-vars
var ws = (function () {

  const websocket = new WebSocket("ws://" + location.host);

  var pointerX = -1;
  var pointerY = -1;

  var publicApi = {};

  document.onmousemove = (event) => {
    pointerX = event.pageX;
    pointerY = event.pageY;
  };

  websocket.onopen = () => {
    console.log("websocket endpoint connected");
    console.log(websocket.url);
  };

  websocket.onmessage = (e) => {
    //document.body.innerHTML = document.body.innerHTML + "<br>" + e.data;
    console.log("recieved: " + e.data);
  };

  window.addEventListener("beforeunload", () => {
    websocket.send("closingtab");
  });

  publicApi.reportCursorPos = (time) => {
    websocket.send("cursorat " + pointerX + " " + pointerY + " " + time + "\n");
  };

  publicApi.sendmsg = (cmd) => {
    if (websocket !== null) {
      websocket.send(cmd + "\n");
    }
  };

  return publicApi;
})();
