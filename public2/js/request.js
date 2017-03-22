var httpRequest;

function makeRequest(typeCommand, command) {
  httpRequest = new XMLHttpRequest();
  console.log('send2');

  if (!httpRequest) {
    alert('Giving up, Cannot create an XMLHTTP instance');
    return false;
  }
  if (typeCommand.includes('move')){
    typeCommand = 'move';
    getPost= 'POST';
  }
  else {
    getPost= 'GET';
  }
  httpRequest.open(getPost, typeCommand);
  httpRequest.setRequestHeader('Content-Type', 'text/plain');
  httpRequest.onreadystatechange = alertContents();
  httpRequest.send(command)
}

function alertContents() {
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
      var response = JSON.parse(httpRequest.responseText);
      alert(response.computedString);
    } else {
      alert('There was a problem with the request.');
    }
  }
}
