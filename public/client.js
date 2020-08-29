document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  const inputVals = document.querySelectorAll('input[type="text"]');
  const btnList = document.getElementById('btn-list');
  const btnRefresh = document.getElementById('btn-refresh');
  const select = document.getElementById('select');
  const sorting = document.getElementById('sorting');
  const firstInput = document.querySelector('input[name="question"]');
  firstInput.focus();
  const savedData = document.getElementById('saved-data');
  const countText = document.getElementById('count-text');
  const btnNext = document.getElementById('btn-next');
  const btnPrev = document.getElementById('btn-prev');
  const toggles = document.querySelectorAll('.toggle');

  // let url = 'http://localhost:3000/trivia/';
  const url = 'https://bible-trivia-data.herokuapp.com/trivia';

  // wake heroku back-end server on page load
  async function wakeHeroku() {
    const res = await fetch(`${url}/wake`);
    const json = await res.json();
    const dbText = document.getElementById('db-text');
    if (json.connected) {
      dbText.innerText = 'ON';
      dbText.classList.add('connected');
    }
  }
  wakeHeroku();

  function convertFDtoJSON(formData) {
    const obj = {};
    // eslint-disable-next-line
    for (let key of formData.keys()) {
      obj[key] = formData.get(key);
    }
    return JSON.stringify(obj);
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

  // Fetch sorted and paginated data
  const limit = 4;
  // eslint-disable-next-line
  let page = 1;
  let query = 'all';
  let prevPage;
  let nextPage;

  // fetch data from back-end
  // eslint-disable-next-line
  async function pageSort(page, query) {
    const sortUrl = `${url}/level?difficulty=${query}&page=${page}&limit=${limit}`;
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

  async function handleForm(e) {
    // eslint-disable-next-line
    confirm('Save this Question?');
    e.preventDefault();
    const myForm = e.target;
    const fd = new FormData(myForm);
    form.reset();
    // log form data contents
    // for (let key of fd.keys()) {
    //   console.log(key, fd.get(key));
    // }

    const jsonData = await convertFDtoJSON(fd);

    // send the request with the formdata
    const h = new Headers();
    h.append('Content-type', 'application/json');

    const req = new Request(url, {
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
    const val = e.target.value;
    if (val.trim().length > 75) {
      alert('Please limit input length to 75 characters maximum.');
    }
  }

  // Show list of saved questions
  let dataShow = false;
  async function showList() {
    if (dataShow) {
      btnList.innerText = 'Show Saved Questions';
      savedData.innerHTML = '';
      toggles.forEach((el) => el.classList.remove('show'));
      dataShow = false;
      return;
    }
    try {
      await pageSort(1, 'all');
      dataShow = true;
      btnList.innerText = 'Hide Saved Questions';
      toggles.forEach((el) => el.classList.add('show'));
    } catch (err) {
      console.error(err);
    }
  }

  // refresh list of saved data
  async function refreshData() {
    dataShow = false;
    await showList();
    sorting.value = 'all';
  }

  // handle select input for difficulty level
  async function sortLevel(e) {
    query = e.target.value;
    await pageSort(1, query);
  }

  // pagination
  btnPrev.addEventListener('click', async () => {
    await pageSort(prevPage, query);
  });

  btnNext.addEventListener('click', async () => {
    await pageSort(nextPage, query);
  });

  form.addEventListener('submit', handleForm);
  inputVals.forEach((el) => el.addEventListener('blur', valLength));
  btnList.addEventListener('click', showList);
  btnRefresh.addEventListener('click', refreshData);
  select.addEventListener('change', sortLevel);
});
