  var receiveReq = getXmlHttpRequestObject();
  var mTimer;
  //Function for initializating the page.
  function startChat() {
    //Set the focus to the Message Box.
    document.getElementById('txt_message').focus();
    //Start Recieving Messages.
    getChatText();
  }
  //Gets the browser specific XmlHttpRequest Object
  function getXmlHttpRequestObject() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else if(window.ActiveXObject) {
      return new ActiveXObject("Microsoft.XMLHTTP");
    } else {
      document.getElementById('p_status').innerHTML = 'Status: Cound not create XmlHttpRequest Object.  Consider upgrading your browser.';
    }
  }
  //Gets the current messages from the server
  function getChatText() {
    if (receiveReq.readyState == 4 || receiveReq.readyState == 0) {
      receiveReq.open("POST", 'information');
      receiveReq.onreadystatechange = handleReceiveChat;
      receiveReq.send(null);
    }
  }
  //This function handles the response after the page has been refreshed.
  function handleResetChat() {
    document.getElementById('div_chat').innerHTML = '';
    getChatText();
  }
  function handleReceiveChat() {
    if (receiveReq.readyState == 4) {
      //Get a reference to our chat container div for easy access
      var chat_div = document.getElementById('div_chat');
      //Get the AJAX response and run the JavaScript evaluation function
      chat_div.innerHTML += (receiveReq.responseText + '<br>');
      chat_div.scrollTop = chat_div.scrollHeight;

      mTimer = setTimeout('getChatText();',2000); //Refresh our chat in 2 seconds
    }
  }
