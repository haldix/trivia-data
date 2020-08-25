document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form').addEventListener('submit', handleForm);
  const inputVals = document.querySelectorAll('input[type="text"]');
  inputVals.forEach((el) => el.addEventListener('blur', valLength));
  const btnList = document.getElementById('btn-list');
  btnList.addEventListener('click', showList);
  const btnRefresh = document.getElementById('btn-refresh');
  btnRefresh.addEventListener('click', refreshData);
  const select = document.getElementById('select');
  select.addEventListener('change', sortLevel);
  const sorting = document.getElementById('sorting');
  const firstInput = document.querySelector('input[name="question"]');
  firstInput.focus();
  const savedData = document.getElementById('saved-data');
  const countText = document.getElementById('count-text');
  const btnNext = document.getElementById('btn-next');
  const btnPrev = document.getElementById('btn-prev');

  let url = 'http://localhost:3000/trivia/';
  //let url = 'https://bible-trivia-data.herokuapp.com/trivia';
  wakeHeroku();

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
      console.error(error);
    }
  }

  // alert if input too long
  function valLength(e) {
    let val = e.target.value;
    if (val.trim().length > 75) {
      alert('Please limit input length to 75 characters maximum.');
    }
    return;
  }

  function convertFDtoJSON(formData) {
    let obj = {};
    for (let key of formData.keys()) {
      obj[key] = formData.get(key);
    }
    return JSON.stringify(obj);
  }

  // Show list of saved questions
  let dataShow = false;
  async function showList() {
    if (dataShow) {
      btnList.innerText = 'Show Saved Questions';
      savedData.innerHTML = '';
      btnRefresh.classList.remove('show');
      select.classList.remove('show');
      countText.classList.remove('show');
      btnNext.classList.remove('show');
      btnPrev.classList.remove('show');
      dataShow = false;
      return;
    }
    try {
      await pageSort(1, 'all');
      dataShow = true;
      btnList.innerText = 'Hide Saved Questions';
      btnRefresh.classList.add('show');
      select.classList.add('show');
      countText.classList.add('show');
      btnNext.classList.add('show');
      btnPrev.classList.add('show');
    } catch (err) {
      console.error(err);
    }
  }

  function render(questions) {
    const html = questions
      .map(
        (q) =>
          `<div class='card'>
            <p class='question'>${q.question}</p>
            <ul class="list">
              <li class='item-correct'>${q.correct}</li>
              <li>${q.wrong1}</li>
              <li>${q.wrong2}</li>
              <li>${q.wrong3}</li>
            </ul>
            <p class='difficulty'>difficulty: ${q.difficulty}</p>
          </div>`
      )
      .join('');
    savedData.innerHTML = html;
  }

  // refresh list of saved data
  async function refreshData() {
    dataShow = false;
    await showList();
    sorting.value = 'all';
  }

  // wake heroku back-end server on page load
  async function wakeHeroku() {
    const res = await fetch(`${url}/wake`);
    const json = await res.json();
    const dbText = document.getElementById('db-text');
    console.log('jsonC', json);
    if (json.connected) {
      dbText.innerText = 'ON';
      dbText.classList.add('connected');
    }
  }

  // Fetch sorted and paginated data
  limit = 4;
  let page = 1;
  let prevPage;
  let nextPage;
  query = 'all';

  async function sortLevel(e) {
    query = e.target.value;
    await pageSort(1, query);
  }

  btnPrev.addEventListener('click', async () => {
    await pageSort(prevPage, query);
  });

  btnNext.addEventListener('click', async () => {
    await pageSort(nextPage, query);
  });

  async function pageSort(page, query) {
    let sortUrl = `${url}/level?difficulty=${query}&page=${page}&limit=${limit}`;
    try {
      const res = await fetch(sortUrl);
      const results = await res.json();
      const { questions, prev, next, count } = results;
      prevPage = prev ? prev.page : null;
      nextPage = next ? next.page : null;
      btnPrev.disabled = !prev;
      btnNext.disabled = !next;
      countText.innerText = `${count} ${query.toUpperCase()} level questions`;
      render(questions);
    } catch (err) {
      console.error(err);
    }
  }
});
