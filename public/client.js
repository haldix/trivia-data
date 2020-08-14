document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form').addEventListener('submit', handleForm);
});

async function handleForm(e) {
  confirm('Save this Question?');
  e.preventDefault();
  let myForm = e.target;
  let fd = new FormData(myForm);
  form.reset();
  //log form data contents
  // for (let key of fd.keys()) {
  //   console.log(key, fd.get(key));
  // }

  let jsonData = await convertFDtoJSON(fd);

  //send the request with the formdata
  let url = 'http://localhost:3000/trivia/';
  let h = new Headers();
  h.append('Content-type', 'application/json');

  let req = new Request(url, {
    headers: h,
    body: jsonData,
    method: 'POST',
  });

  try {
    const res = await fetch(req);
    const data = await res.json();
    console.log('Response from server');
    console.log(data);
  } catch (error) {
    console.warn(error);
  }
}

function convertFDtoJSON(formData) {
  let obj = {};
  for (let key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
}
