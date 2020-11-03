document.addEventListener('DOMContentLoaded', () => {
  const dataForm = document.getElementById('form-data');
  const inputVals = dataForm.querySelectorAll('input[type="text"]');
  const searchForm = document.getElementById('form-search');
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');
  const btnClearSearch = document.getElementById('btn-clear');
  const hdgResults = document.getElementById('hdg-results');
  const searchList = document.getElementById('list-search');
  const btnList = document.getElementById('btn-list');
  const btnRefresh = document.getElementById('btn-refresh');
  const select = document.getElementById('select');
  const sorting = document.getElementById('sorting');
  const savedData = document.getElementById('saved-data');
  const countText = document.getElementById('count-text');
  const btnNext = document.getElementById('btn-next');
  const btnPrev = document.getElementById('btn-prev');
  const toggles = document.querySelectorAll('.toggle');

  // const url = 'http://localhost:3000/trivia';
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
    dataForm.reset();
    const jsonData = await convertFDtoJSON(fd);

    // send the request with the form data to server
    const reviewUrl = `${url}/review`;
    const h = new Headers();
    h.append('Content-type', 'application/json');

    const req = new Request(reviewUrl, {
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
            <p class='question' aria-label="question">${q.question}</p>
            <ul class="list" role="list" aria-label="possible answers">
              <li class='item-correct'>${q.correct_answer}</li>
              <li>${q.wrong_answers[0]}</li>
              <li>${q.wrong_answers[1]}</li>
              <liS>${q.wrong_answers[2]}</liS>
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

  // Search API.Bible
  async function fetchSearch(e) {
    e.preventDefault();
    const keywords = searchInput.value;
    if (!keywords) return;
    const bibleVersionID = 'de4e12af7f28f599-01';
    const offset = 0;
    const limit = 20;
    const searchUrl = `${url}/search?keywords=${keywords}&bibleVersionID=${bibleVersionID}&limit=${limit}&offset=${offset}`;
    try {
      const res = await fetch(searchUrl);
      const results = await res.json();
      console.log('results', results);
      if (results.success) {
        showSearch(keywords, results.data);
      } else {
        hdgResults.innerHTML = results.message;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // render API.Bible search results
  function showSearch(hdg, res) {
    btnClearSearch.classList.add('show');
    btnSearch.classList.add('hide');
    if (res.length !== 0) {
      hdgResults.innerHTML = `Search Results for "${hdg}"`;
    } else {
      hdgResults.innerHTML = `No Results found for "${hdg}"`;
    }
    const html = res
      .map(
        (v) =>
          `<li class='list-search__item'>
          <p class="search__reference">${v.reference}</p>
          <p>${v.text}</p>
        </li>`
      )
      .join('');
    searchList.innerHTML = html;
  }

  function clearSearch() {
    btnClearSearch.classList.remove('show');
    btnSearch.classList.remove('hide');
    searchForm.reset();
    searchList.innerHTML = '';
    hdgResults.innerHTML = '';
  }

  // Event Listeners
  btnPrev.addEventListener('click', async () => {
    await fetchData(prevPage);
  });

  btnNext.addEventListener('click', async () => {
    await fetchData(nextPage);
  });

  dataForm.addEventListener('submit', handleForm);
  inputVals.forEach((el) => el.addEventListener('blur', valLength));
  btnList.addEventListener('click', showList);
  // btnRefresh.addEventListener('click', refreshData);
  select.addEventListener('change', sortLevel);
  btnSearch.addEventListener('click', fetchSearch);
  btnClearSearch.addEventListener('click', clearSearch);
});
