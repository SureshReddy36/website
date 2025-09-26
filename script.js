const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const tableBody = document.getElementById('book-table-body');
const messages = document.getElementById('messages');
const statusEl = document.getElementById('status');
const clearBtn = document.getElementById('clear-btn');
const sortSelect = document.getElementById('sort-select');
const addBookBtn = document.getElementById('add-book-btn');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');
const genreFilter = document.getElementById('genre-filter');
const resultsCount = document.getElementById('results-count');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const pageSizeSelect = document.getElementById('page-size');
const modeToggle = document.getElementById('mode-toggle');

// Modals
const bookModal = document.getElementById('book-modal');
const bookForm = document.getElementById('book-form');
const bookCancel = document.getElementById('book-cancel');
const bookIdInput = document.getElementById('book-id');
const bookTitleInput = document.getElementById('book-title');
const bookAuthorInput = document.getElementById('book-author');
const bookGenreInput = document.getElementById('book-genre');
const bookShelfInput = document.getElementById('book-shelf');

const borrowModal = document.getElementById('borrow-modal');
const borrowForm = document.getElementById('borrow-form');
const borrowCancel = document.getElementById('borrow-cancel');
const borrowIdInput = document.getElementById('borrow-id');
const borrowerNameInput = document.getElementById('borrower-name');
const dueDateInput = document.getElementById('due-date');

let allBooks = [];
let currentQuery = '';
let currentPage = 1;
let pageSize = 10;

// Built-in dataset used for file:// or as a fallback
const defaultBooks = [
  { id: 1, title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", genre: "Fantasy", shelfNumber: "A12" },
  { id: 2, title: "The Lord of the Rings", author: "J.R.R. Tolkien", genre: "Adventure", shelfNumber: "B05" },
  { id: 3, title: "A Game of Thrones", author: "George R.R. Martin", genre: "Science Fiction", shelfNumber: "B05" },
  { id: 4, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Classic", shelfNumber: "D02" },
  { id: 5, title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", shelfNumber: "E03" },
  { id: 6, title: "The Hunger Games", author: "Suzanne Collins", genre: "Dystopian", shelfNumber: "F09" },
  { id: 7, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", shelfNumber: "1A" },
  { id: 8, title: "1984", author: "George Orwell", genre: "Dystopian", shelfNumber: "2A" },
  { id: 9, title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", shelfNumber: "1C" },
  { id: 10, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", shelfNumber: "3A" },
  { id: 11, title: "Moby-Dick", author: "Herman Melville", genre: "Adventure", shelfNumber: "4A" },
  { id: 12, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", shelfNumber: "2C" },
  { id: 13, title: "The Da Vinci Code", author: "Dan Brown", genre: "Thriller", shelfNumber: "5A" },
  { id: 14, title: "Brave New World", author: "Aldous Huxley", genre: "Dystopian", shelfNumber: "3B" },
  { id: 15, title: "The Chronicles of Narnia", author: "C.S. Lewis", genre: "Fantasy", shelfNumber: "A07" },
  { id: 16, title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Mystery", shelfNumber: "M11" },
  { id: 17, title: "The Kite Runner", author: "Khaled Hosseini", genre: "Drama", shelfNumber: "D06" },
  { id: 18, title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction", shelfNumber: "NF01" },
  { id: 19, title: "The Martian", author: "Andy Weir", genre: "Science Fiction", shelfNumber: "SF10" },
  { id: 20, title: "Gone Girl", author: "Gillian Flynn", genre: "Thriller", shelfNumber: "T02" }
];

function setStatus(message) {
  statusEl.textContent = message || '';
}

function showMessage(kind, text) {
  messages.textContent = '';
  if (!text) return;
  const div = document.createElement('div');
  div.className = `msg ${kind}`;
  div.textContent = text;
  messages.appendChild(div);
}

function renderRows(rows) {
  tableBody.innerHTML = '';
  rows.forEach((book) => {
    const tr = document.createElement('tr');
    const status = book.isBorrowed ? `Borrowed by ${book.borrower || 'Unknown'} (due ${book.dueDate || '-'})` : 'Available';
    tr.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.genre || ''}</td>
      <td>${book.shelfNumber || ''}</td>
      <td>${status}</td>
      <td>
        <div class="actions">
          <button type="button" class="action edit" data-id="${book.id}">Edit</button>
          <button type="button" class="action delete" data-id="${book.id}">Delete</button>
          ${book.isBorrowed ? `<button type="button" class="action return" data-id="${book.id}">Return</button>` : `<button type="button" class="action borrow" data-id="${book.id}">Borrow</button>`}
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function sortBooks(books, sortValue) {
  const [field, dir] = sortValue.split('-');
  const factor = dir === 'desc' ? -1 : 1;
  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
  const key = field === 'author' ? 'author' : 'title';
  const sorted = [...books].sort((a, b) => factor * collator.compare(a[key] || '', b[key] || ''));
  return sorted;
}

function uniqueGenres(books) {
  const set = new Set();
  books.forEach(b => { if (b.genre) set.add(b.genre); });
  return Array.from(set).sort((a,b) => a.localeCompare(b));
}

function ensureGenreOptions() {
  const genres = uniqueGenres(allBooks);
  const current = new Set(Array.from(genreFilter.options).map(o => o.value));
  genres.forEach(g => {
    if (!current.has(g)) {
      const opt = document.createElement('option');
      opt.value = g; opt.textContent = g;
      genreFilter.appendChild(opt);
    }
  });
}

function filterBooks(query) {
  const q = query.trim().toLowerCase();
  if (!q) return allBooks;
  return allBooks.filter((book) => {
    return (
      (book.title || '').toLowerCase().includes(q) ||
      (book.author || '').toLowerCase().includes(q) ||
      (book.genre || '').toLowerCase().includes(q) ||
      (book.shelfNumber || '').toLowerCase().includes(q)
    );
  });
}

function updateView() {
  ensureGenreOptions();
  let filtered = filterBooks(currentQuery);
  if (genreFilter.value) {
    filtered = filtered.filter(b => (b.genre || '') === genreFilter.value);
  }
  const sorted = sortBooks(filtered, sortSelect.value);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);
  renderRows(pageRows);
  resultsCount.textContent = `${total} result${total !== 1 ? 's' : ''}`;
  pageInfo.textContent = `${currentPage} / ${totalPages}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
  if (total === 0) {
    showMessage('info', 'No results found.');
  } else {
    showMessage('', '');
  }
  setStatus(`${total} result${total !== 1 ? 's' : ''}`);
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), wait);
  };
}

const onQueryChange = debounce((value) => {
  currentQuery = value;
  updateView();
}, 200);

searchInput.addEventListener('input', (e) => onQueryChange(e.target.value));
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  currentPage = 1;
  updateView();
});
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  currentQuery = '';
  currentPage = 1;
  genreFilter.value = '';
  updateView();
  searchInput.focus();
});
sortSelect.addEventListener('change', updateView);
genreFilter.addEventListener('change', () => { currentPage = 1; updateView(); });
prevPageBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; updateView(); } });
nextPageBtn.addEventListener('click', () => { currentPage++; updateView(); });
pageSizeSelect.addEventListener('change', (e) => { pageSize = parseInt(e.target.value, 10) || 10; currentPage = 1; updateView(); });

// Storage helpers
const STORAGE_KEY = 'library_books_v1';
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return null;
}
function saveToStorage(books) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {}
}

async function loadBooks() {
  try {
    setStatus('Loading books...');
    showMessage('loading', 'Loading books...');
    const res = await fetch('books.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Invalid data format');
    allBooks = data;
    saveToStorage(allBooks);
    showMessage('', '');
    setStatus('Books loaded');
    updateView();
  } catch (err) {
    console.error(err);
    // Use fallback so the page stays useful even if fetch fails
    allBooks = loadFromStorage() || defaultBooks;
    updateView();
    showMessage('error', 'Could not load books.json. Showing built-in sample data.');
    setStatus('Using sample data');
  }
}

// Avoid visible swap: for file:// use built-in data only; for http(s) fetch
if (location.protocol === 'file:') {
  allBooks = loadFromStorage() || defaultBooks;
  updateView();
  showMessage('info', 'Loaded sample data. To use books.json, run a local server.');
  setStatus('Loaded sample data');
} else {
  loadBooks();
}

// Table action handling
tableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = parseInt(btn.getAttribute('data-id'), 10);
  const book = allBooks.find(b => b.id === id);
  if (!book) return;

  if (btn.classList.contains('edit')) {
    openBookModal(book);
  } else if (btn.classList.contains('delete')) {
    if (confirm('Delete this book?')) {
      allBooks = allBooks.filter(b => b.id !== id);
      saveToStorage(allBooks);
      updateView();
    }
  } else if (btn.classList.contains('borrow')) {
    openBorrowModal(book);
  } else if (btn.classList.contains('return')) {
    book.isBorrowed = false;
    book.borrower = '';
    book.dueDate = '';
    saveToStorage(allBooks);
    updateView();
  }
});

// Add/Edit Book modal
function openBookModal(book) {
  bookIdInput.value = book ? book.id : '';
  bookTitleInput.value = book ? book.title : '';
  bookAuthorInput.value = book ? book.author : '';
  bookGenreInput.value = book ? (book.genre || '') : '';
  bookShelfInput.value = book ? (book.shelfNumber || '') : '';
  bookModal.classList.add('open');
  bookModal.setAttribute('aria-hidden', 'false');
}
function closeBookModal() {
  bookModal.classList.remove('open');
  bookModal.setAttribute('aria-hidden', 'true');
  bookForm.reset();
}
addBookBtn.addEventListener('click', () => openBookModal(null));
bookCancel.addEventListener('click', closeBookModal);
bookForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const idRaw = bookIdInput.value.trim();
  const payload = {
    title: bookTitleInput.value.trim(),
    author: bookAuthorInput.value.trim(),
    genre: bookGenreInput.value.trim(),
    shelfNumber: bookShelfInput.value.trim()
  };
  if (!payload.title || !payload.author) return;

  if (idRaw) {
    const id = parseInt(idRaw, 10);
    const idx = allBooks.findIndex(b => b.id === id);
    if (idx >= 0) {
      allBooks[idx] = { ...allBooks[idx], ...payload };
    }
  } else {
    const nextId = Math.max(0, ...allBooks.map(b => b.id || 0)) + 1;
    allBooks.push({ id: nextId, ...payload, isBorrowed: false });
  }
  saveToStorage(allBooks);
  closeBookModal();
  updateView();
});

// Borrow modal
function openBorrowModal(book) {
  borrowIdInput.value = book.id;
  borrowerNameInput.value = '';
  dueDateInput.valueAsDate = null;
  borrowModal.classList.add('open');
  borrowModal.setAttribute('aria-hidden', 'false');
}
function closeBorrowModal() {
  borrowModal.classList.remove('open');
  borrowModal.setAttribute('aria-hidden', 'true');
  borrowForm.reset();
}
borrowCancel.addEventListener('click', closeBorrowModal);
borrowForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = parseInt(borrowIdInput.value, 10);
  const borrower = borrowerNameInput.value.trim();
  const due = dueDateInput.value;
  const book = allBooks.find(b => b.id === id);
  if (!book || !borrower || !due) return;
  book.isBorrowed = true;
  book.borrower = borrower;
  book.dueDate = due;
  saveToStorage(allBooks);
  closeBorrowModal();
  updateView();
});

// Import / Export
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(allBooks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'library-export.json';
  a.click();
  URL.revokeObjectURL(url);
});
importInput.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('Invalid file format');
    allBooks = data;
    saveToStorage(allBooks);
    updateView();
    showMessage('info', 'Imported library data');
  } catch (err) {
    console.error(err);
    showMessage('error', 'Failed to import file');
  } finally {
    importInput.value = '';
  }
});

// Enable simple mode to mimic original source layout
document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('library_ui_mode') || 'simple';
  setUIMode(stored);
});

function setUIMode(mode) {
  if (mode === 'advanced') {
    document.body.classList.remove('simple');
    modeToggle.textContent = 'Simple Mode';
  } else {
    document.body.classList.add('simple');
    modeToggle.textContent = 'Advanced Mode';
  }
  localStorage.setItem('library_ui_mode', mode);
}
modeToggle.addEventListener('click', () => {
  const next = document.body.classList.contains('simple') ? 'advanced' : 'simple';
  setUIMode(next);
});
