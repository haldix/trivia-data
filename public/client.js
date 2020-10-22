document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  // const btnSubmit = document.getElementById('btn-submit');
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

  // const url = 'http://localhost:3000/trivia/';
  const url = 'https://trivia-data-api.herokuapp.com/trivia';

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

  // SAVE FORM DATA TO DB

  function convertFDtoJSON(formData) {
    const obj = {};
    // eslint-disable-next-line
    for (let key of formData.keys()) {
      obj[key] = formData.get(key);
    }
    return JSON.stringify(obj);
  }

  // check if input too long while being filled in
  function valLength({ target: { name, value } }) {
    let max = name === 'question' ? 100 : 75;
    if (value.trim().length > max) {
      alert(`Please limit ${name} input length to ${max} characters maximum.`);
    }
  }

  // submit form data
  async function handleForm(e) {
    // eslint-disable-next-line
    confirm('Save this Question?');
    e.preventDefault();
    const myForm = e.target;
    const fd = new FormData(myForm);
    form.reset();
    const jsonData = await convertFDtoJSON(fd);

    // send the request with the formdata to server
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
      console.log('Data sent', data);
      if (!data.success) {
        alert(`Not saved: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // FETCH & RENDER DATA FROM DB

  // Render fetched data
  function render(questions) {
    const html = questions
      .map(
        (q) =>
          `<div class='card'>
            <p class='question'>${q.question}</p>
            <ul class="list">
              <li class='item-correct'>${q.correct_answer}</li>
              <li>${q.wrong_answers[0]}</li>
              <li>${q.wrong_answers[1]}</li>
              <li>${q.wrong_answers[2]}</li>
            </ul>
            <p class='difficulty'>difficulty: ${q.difficulty}</p>
          </div>`
      )
      .join('');
    savedData.innerHTML = html;
  }

  // Fetch sorted and paginated data from server
  const limit = 4;
  let prevPage;
  let nextPage;

  async function fetchData(page = 1) {
    const query = sorting.value;
    const dataUrl = `${url}/level?difficulty=${query}&page=${page}&limit=${limit}`;
    try {
      const res = await fetch(dataUrl);
      const results = await res.json();
      const { data, prev, next, count } = results;
      prevPage = prev ? prev.page : null;
      nextPage = next ? next.page : null;
      btnPrev.disabled = !prev;
      btnNext.disabled = !next;
      countText.innerText = `${count} ${query.toUpperCase()} level questions`;
      render(data);
    } catch (err) {
      console.error(err);
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
      await fetchData(1, 'all');
      dataShow = true;
      btnList.innerText = 'Hide Saved Questions';
      toggles.forEach((el) => el.classList.add('show'));
    } catch (err) {
      console.error(err);
    }
  }

  // Refresh list of saved data
  async function refreshData() {
    dataShow = false;
    sorting.value = 'all';
    await showList();
  }

  // handle select input for difficulty level
  async function sortLevel() {
    await fetchData();
  }

  // Event Listeners
  btnPrev.addEventListener('click', async () => {
    await fetchData(prevPage);
  });

  btnNext.addEventListener('click', async () => {
    await fetchData(nextPage);
  });

  form.addEventListener('submit', handleForm);
  inputVals.forEach((el) => el.addEventListener('blur', valLength));
  btnList.addEventListener('click', showList);
  btnRefresh.addEventListener('click', refreshData);
  select.addEventListener('change', sortLevel);
});
