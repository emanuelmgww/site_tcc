// Inicialização do sistema no localStorage
if (!window.libraryData) {
    window.libraryData = {
        books: [],
        loans: [],
        currentUser: '',
        editingBookId: null,
        editingLoanId: null
    };
}

let books = window.libraryData.books;
let loans = window.libraryData.loans;
let currentUser = window.libraryData.currentUser;
let editingBookId = window.libraryData.editingBookId;
let editingLoanId = window.libraryData.editingLoanId;

const validCredentials = {
    'admin': 'admin123',
    'bibliotecario': 'biblio123',
    'usuario': 'user123'
};

function saveData() {
    try {
        window.libraryData.books = books;
        window.libraryData.loans = loans;
        window.libraryData.currentUser = currentUser;
        window.libraryData.editingBookId = editingBookId;
        window.libraryData.editingLoanId = editingLoanId;
        localStorage.setItem('libraryData', JSON.stringify(window.libraryData));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

function loadData() {
    try {
        const savedData = localStorage.getItem('libraryData');
        if (savedData) window.libraryData = JSON.parse(savedData);

        if (window.libraryData) {
            books = window.libraryData.books || [];
            loans = window.libraryData.loans || [];
            currentUser = window.libraryData.currentUser || '';
            editingBookId = window.libraryData.editingBookId || null;
            editingLoanId = window.libraryData.editingLoanId || null;
            if (currentUser) maintainSession();
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    setMinDate();

    const loginPage = document.getElementById('loginPage');
    const mainSystem = document.getElementById('mainSystem');

    if (loginPage && mainSystem) {
        if (currentUser) {
            loginPage.classList.add('hidden');
            mainSystem.classList.remove('hidden');
        } else {
            loginPage.classList.remove('hidden');
            mainSystem.classList.add('hidden');
        }
    }

    loadBooksDropdown();
    renderBooks();
    renderLoans();
});

function autoSave() {
    saveData();
}

function setupEventListeners() {
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('bookForm')?.addEventListener('submit', handleBookSubmit);
    document.getElementById('loanForm')?.addEventListener('submit', handleLoanSubmit);
    document.getElementById('bookISBN')?.addEventListener('input', formatISBN);
    document.getElementById('loanDate')?.addEventListener('change', calculateReturnDate);
}

function setMinDate() {
    const loanDateElement = document.getElementById('loanDate');
    if (loanDateElement) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${year}-${month}-${day}`;
        loanDateElement.value = todayFormatted;
        loanDateElement.min = todayFormatted;
        calculateReturnDate();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (validCredentials[username] && validCredentials[username] === password) {
        currentUser = username;
        window.libraryData.currentUser = currentUser;
        document.getElementById('loggedUser').textContent = username;
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainSystem').classList.remove('hidden');
        document.getElementById('loginError').classList.add('hidden');
        loadBooksDropdown();
        renderBooks();
        renderLoans();
        autoSave();
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

function logout() {
    currentUser = '';
    window.libraryData.currentUser = '';
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('mainSystem').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').classList.add('hidden');
    autoSave();
}

function showSection(section) {
    ['books', 'loans'].forEach(id => document.getElementById(id + 'Section').classList.add('hidden'));
    const target = document.getElementById(section + 'Section');
    if (target) target.classList.remove('hidden');
    hideBookForm();
    hideLoanForm();
}

function showSuccessMessage(message) {
    const messageDiv = document.getElementById('successMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.classList.remove('hidden');
        setTimeout(() => messageDiv.classList.add('hidden'), 3000);
    }
}

function formatISBN() {
    const input = document.getElementById('bookISBN');
    if (!input) return;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 3) value = value.slice(0, 3) + '-' + value.slice(3);
    if (value.length >= 5) value = value.slice(0, 5) + '-' + value.slice(5);
    if (value.length >= 8) value = value.slice(0, 8) + '-' + value.slice(8);
    if (value.length >= 15) value = value.slice(0, 15) + '-' + value.slice(15);
    input.value = value.slice(0, 17);
}

function calculateReturnDate() {
    const loanDateEl = document.getElementById('loanDate');
    const returnDateEl = document.getElementById('returnDate');
    if (!loanDateEl || !returnDateEl) return;

    const loanDate = loanDateEl.value;
    if (!loanDate) return;

    const startDate = new Date(loanDate + 'T00:00:00');
    let daysAdded = 0;
    let currentDate = new Date(startDate);

    while (daysAdded < 7) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) daysAdded++;
    }

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    returnDateEl.value = `${year}-${month}-${day}`;
    returnDateEl.min = loanDate;
}

function getNextBookId() {
    return books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
}

function getNextLoanId() {
    return loans.length > 0 ? Math.max(...loans.map(l => l.id)) + 1 : 1;
}

function reorganizeBookIds() {
    books.forEach((book, index) => {
        const oldId = book.id;
        const newId = index + 1;
        if (oldId !== newId) {
            book.id = newId;
            loans.forEach(loan => {
                if (loan.bookId === oldId) loan.bookId = newId;
            });
        }
    });
}

function reorganizeLoanIds() {
    loans.forEach((loan, index) => {
        loan.id = index + 1;
    });
}

function toggleBookForm() {
    const container = document.getElementById('bookFormContainer');
    const button = document.getElementById('toggleBookFormBtn');
    if (!container || !button) return;

    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        button.textContent = 'Cancelar';
        button.classList.replace('btn-success', 'btn-secondary');
        if (!editingBookId) {
            document.getElementById('bookFormTitle').textContent = 'Cadastrar Novo Livro';
            document.getElementById('bookSubmitBtn').textContent = 'Cadastrar Livro';
        }
    } else {
        hideBookForm();
    }
}

function hideBookForm() {
    const container = document.getElementById('bookFormContainer');
    const button = document.getElementById('toggleBookFormBtn');
    const form = document.getElementById('bookForm');
    if (container) container.classList.add('hidden');
    if (button) {
        button.textContent = 'Cadastrar Novo Livro';
        button.classList.replace('btn-secondary', 'btn-success');
    }
    if (form) form.reset();
    editingBookId = null;
    window.libraryData.editingBookId = null;
}

function handleBookSubmit(e) {
    e.preventDefault();
    const formData = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        isbn: document.getElementById('bookISBN').value,
        year: parseInt(document.getElementById('bookYear').value),
        genre: document.getElementById('bookGenre').value,
        copies: parseInt(document.getElementById('bookCopies').value)
    };

    const isbnNumbers = formData.isbn.replace(/\D/g, '');
    if (isbnNumbers.length !== 13) {
        alert('ISBN deve conter exatamente 13 dígitos!');
        return;
    }

    const existingBook = books.find(b => b.isbn.replace(/\D/g, '') === isbnNumbers);
    if (existingBook && (!editingBookId || existingBook.id !== editingBookId)) {
        alert('Já existe um livro cadastrado com este ISBN!');
        return;
    }

    if (editingBookId) {
        const bookIndex = books.findIndex(b => b.id === editingBookId);
        if (bookIndex !== -1) {
            books[bookIndex] = { ...books[bookIndex], ...formData };
            showSuccessMessage('Livro atualizado com sucesso!');
        }
    } else {
        const newBook = {
            id: getNextBookId(),
            ...formData
        };
        books.push(newBook);
        reorganizeBookIds();
        showSuccessMessage('Livro cadastrado com sucesso!');
    }

    hideBookForm();
    renderBooks();
    loadBooksDropdown();
    autoSave();
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    editingBookId = id;
    window.libraryData.editingBookId = id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookISBN').value = book.isbn;
    document.getElementById('bookYear').value = book.year;
    document.getElementById('bookGenre').value = book.genre;
    document.getElementById('bookCopies').value = book.copies;
    document.getElementById('bookFormContainer').classList.remove('hidden');
    document.getElementById('bookFormTitle').textContent = 'Editar Livro';
    document.getElementById('bookSubmitBtn').textContent = 'Atualizar Livro';
    document.getElementById('toggleBookFormBtn').textContent = 'Cancelar';
    document.getElementById('toggleBookFormBtn').classList.replace('btn-success', 'btn-secondary');
}

function deleteBook(id) {
    const pendingLoans = loans.filter(l => l.bookId === id && l.status !== 'devolvido');
    if (pendingLoans.length > 0) {
        alert('Não é possível excluir este livro! Existem empréstimos pendentes.');
        return;
    }

    if (confirm('Tem certeza que deseja excluir este livro?')) {
        books = books.filter(b => b.id !== id);
        reorganizeBookIds();
        showSuccessMessage('Livro excluído com sucesso!');
        renderBooks();
        loadBooksDropdown();
        autoSave();
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('bookSearch')?.value.toLowerCase() || '';
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genre.toLowerCase().includes(searchTerm) ||
        book.isbn.includes(searchTerm)
    );
    renderBooks(filteredBooks);
}

function renderBooks(booksToRender = books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    booksToRender.forEach(book => {
        const borrowedCopies = loans.filter(l => l.bookId === book.id && l.status !== 'devolvido').length;
        const availableCopies = book.copies - borrowedCopies - 1;

        let statusClass = '';
        let statusText = '';
        if (availableCopies <= 0) {
            statusClass = 'danger';
            statusText = 'Último exemplar reservado (não disponível)';
        } else {
            statusClass = 'available';
            statusText = `${availableCopies} exemplar(es) disponíveis`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.year}</td>
            <td>${book.genre}</td>
            <td><span class="copy-info ${statusClass}">${statusText}</span></td>
            <td class="actions">
                <button class="btn btn-warning btn-small" onclick="editBook(${book.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteBook(${book.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function formatDateToBR(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T12:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getCurrentDateISO() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function calculateBusinessDays(startDateStr, endDateStr) {
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');
    let businessDays = 0;
    let current = new Date(start);
    while (current < end) {
        current.setDate(current.getDate() + 1);
        const day = current.getDay();
        if (day !== 0 && day !== 6) businessDays++;
    }
    return businessDays;
}

function isLoanOverdue(loan) {
    if (loan.status === 'devolvido') return false;
    const today = getCurrentDateISO();
    return calculateBusinessDays(loan.loanDate, today) > 7;
}

function setupLoanBookSearch(editingLoanBookId = null) {
    const searchInput = document.getElementById('loanBookSearch');
    const resultsContainer = document.getElementById('loanBookResults');
    const hiddenInput = document.getElementById('loanBook');

    function filterBooks(searchTerm) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('hidden');
        books.forEach(book => {
            const borrowedCopies = loans.filter(l => l.bookId === book.id && l.status !== 'devolvido').length;
            const availableCopies = book.copies - borrowedCopies - 1;
            const displayText = `${book.title} - ${book.author}`;

            if (searchTerm.trim() === '' || displayText.toLowerCase().includes(searchTerm.toLowerCase())) {
                const li = document.createElement('li');
                li.className = 'search-result-item';
                li.dataset.id = book.id;
                let badgeClass = availableCopies > 0 ? 'bg-success' : 'bg-danger';
                let availableToShow = availableCopies >= 0 ? availableCopies : 0;

                li.innerHTML = `
                    <span>${displayText}</span>
                    <small class="${badgeClass}" style="color:white; padding: 2px 6px; border-radius: 12px;">
                        ${availableToShow} disp.
                    </small>
                `;

                if (availableCopies > 0) {
                    li.style.cursor = 'pointer';
                    li.addEventListener('click', () => {
                        searchInput.value = displayText;
                        hiddenInput.value = book.id;
                        resultsContainer.classList.add('hidden');
                    });
                } else {
                    li.classList.add('disabled');
                    li.style.opacity = '0.5';
                    li.style.cursor = 'not-allowed';
                    li.title = 'Este livro não está disponível para empréstimo';
                }

                resultsContainer.appendChild(li);
            }
        });
    }

    if (editingLoanBookId) {
        const book = books.find(b => b.id === editingLoanBookId);
        if (book) {
            document.getElementById('loanBookSearch').value = `${book.title} - ${book.author}`;
            document.getElementById('loanBook').value = book.id;
        }
    }

    document.addEventListener('click', (e) => {
        const container = document.querySelector('.searchable-select');
        if (container && !container.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });

    searchInput.addEventListener('input', () => filterBooks(searchInput.value));
}

function loadBooksDropdown(editingLoanBookId = null) {
    setupLoanBookSearch(editingLoanBookId);
}

function handleLoanSubmit(e) {
    e.preventDefault();
    const formData = {
        bookId: parseInt(document.getElementById('loanBook').value),
        userName: document.getElementById('loanUser').value,
        loanDate: document.getElementById('loanDate').value,
        returnDate: document.getElementById('returnDate').value,
        status: 'emprestado' // Sempre começa como emprestado
    };

    if (!editingLoanId) {
        const book = books.find(b => b.id === formData.bookId);
        if (!book) {
            alert('Livro não encontrado!');
            return;
        }
        const borrowedCopies = loans.filter(l => l.bookId === formData.bookId && l.status !== 'devolvido').length;
        const availableCopies = book.copies - borrowedCopies - 1;
        if (availableCopies <= 0) {
            alert('Não há exemplares disponíveis para empréstimo! Apenas o último permanece na biblioteca.');
            return;
        }
    }

    if (editingLoanId) {
        const loanIndex = loans.findIndex(l => l.id === editingLoanId);
        if (loanIndex !== -1) {
            loans[loanIndex] = { ...loans[loanIndex], ...formData };
            showSuccessMessage('Empréstimo atualizado com sucesso!');
        }
    } else {
        const newLoan = { id: getNextLoanId(), ...formData };
        loans.push(newLoan);
        reorganizeLoanIds();
        showSuccessMessage('Empréstimo registrado com sucesso!');
    }

    hideLoanForm();
    renderLoans();
    loadBooksDropdown();
    renderBooks();
    autoSave();
}

function editLoan(id) {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    editingLoanId = id;
    window.libraryData.editingLoanId = id;
    document.getElementById('loanUser').value = loan.userName;
    document.getElementById('loanDate').value = loan.loanDate;
    document.getElementById('returnDate').value = loan.returnDate;
    document.getElementById('loanStatus').value = 'emprestado'; // Sempre volta pra isso
    const container = document.getElementById('loanFormContainer');
    if (container) container.classList.remove('hidden');
    document.getElementById('loanFormTitle').textContent = 'Editar Empréstimo';
    document.getElementById('loanSubmitBtn').textContent = 'Atualizar Empréstimo';
    document.getElementById('toggleLoanFormBtn').textContent = 'Cancelar';
    document.getElementById('toggleLoanFormBtn').classList.replace('btn-success', 'btn-secondary');
    loadBooksDropdown(loan.bookId);
}

function returnBook(id) {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    if (confirm('Confirmar devolução do livro?')) {
        loan.status = 'devolvido';
        const todayBR = formatDateToBR(getCurrentDateISO());
        loan.actualReturnDate = getCurrentDateISO();
        loan.returnDate = getCurrentDateISO();
        showSuccessMessage(`Livro devolvido com sucesso! Data: ${todayBR}`);
        renderLoans();
        loadBooksDropdown();
        renderBooks();
        autoSave();
    }
}

function deleteLoan(id) {
    if (confirm('Tem certeza que deseja excluir este empréstimo?')) {
        loans = loans.filter(l => l.id !== id);
        reorganizeLoanIds();
        showSuccessMessage('Empréstimo excluído com sucesso!');
        renderLoans();
        loadBooksDropdown();
        renderBooks();
        autoSave();
    }
}

function searchLoans() {
    const searchTerm = document.getElementById('loanSearch')?.value.toLowerCase() || '';
    const filteredLoans = loans.filter(loan => {
        const book = books.find(b => b.id === loan.bookId);
        return (
            loan.userName.toLowerCase().includes(searchTerm) ||
            (book && book.title.toLowerCase().includes(searchTerm)) ||
            loan.status.toLowerCase().includes(searchTerm)
        );
    });
    renderLoans(filteredLoans);
}

function renderLoans(loansToRender = loans) {
    const tbody = document.getElementById('loansTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    loansToRender.forEach(loan => {
        const book = books.find(b => b.id === loan.bookId);
        const bookTitle = book ? book.title : 'Livro não encontrado';
        const loanDate = formatDateToBR(loan.loanDate);
        const returnDate = formatDateToBR(loan.returnDate);

        // Atualiza automaticamente para "atrasado" se necessário
        if (loan.status !== 'devolvido' && isLoanOverdue(loan)) {
            loan.status = 'atrasado';
        }

        let statusClass = '';
        let statusText = '';
        let actionButtons = '';

        if (loan.status === 'devolvido') {
            statusClass = 'returned';
            statusText = 'Devolvido';
            actionButtons = `
                <button class="btn btn-warning btn-small" onclick="editLoan(${loan.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteLoan(${loan.id})">Excluir</button>
            `;
        } else if (loan.status === 'atrasado') {
            statusClass = 'overdue';
            statusText = 'Atrasado';
            actionButtons = `
                <button class="btn btn-success btn-small" onclick="returnBook(${loan.id})">Devolver</button>
                <button class="btn btn-warning btn-small" onclick="editLoan(${loan.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteLoan(${loan.id})">Excluir</button>
            `;
        } else {
            statusClass = 'active';
            statusText = 'Emprestado';
            actionButtons = `
                <button class="btn btn-success btn-small" onclick="returnBook(${loan.id})">Devolver</button>
                <button class="btn btn-warning btn-small" onclick="editLoan(${loan.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteLoan(${loan.id})">Excluir</button>
            `;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${loan.id}</td>
            <td>${bookTitle}</td>
            <td>${loan.userName}</td>
            <td>${loanDate}</td>
            <td>${returnDate}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td class="actions">${actionButtons}</td>
        `;
        tbody.appendChild(row);
    });
}

function toggleLoanForm() {
    const container = document.getElementById('loanFormContainer');
    const button = document.getElementById('toggleLoanFormBtn');
    if (!container || !button) return;

    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        button.textContent = 'Cancelar';
        button.classList.replace('btn-success', 'btn-secondary');
        if (!editingLoanId) {
            document.getElementById('loanFormTitle').textContent = 'Novo Empréstimo';
            document.getElementById('loanSubmitBtn').textContent = 'Registrar Empréstimo';
        }
    } else {
        hideLoanForm();
    }
}

function hideLoanForm() {
    const container = document.getElementById('loanFormContainer');
    const button = document.getElementById('toggleLoanFormBtn');
    const form = document.getElementById('loanForm');
    if (container) container.classList.add('hidden');
    if (button) {
        button.textContent = 'Novo Empréstimo';
        button.classList.replace('btn-secondary', 'btn-success');
    }
    if (form) form.reset();
    editingLoanId = null;
    window.libraryData.editingLoanId = null;
    setMinDate();
}

function maintainSession() {
    const loggedUser = document.getElementById('loggedUser');
    const loginPage = document.getElementById('loginPage');
    const mainSystem = document.getElementById('mainSystem');

    if (loggedUser) loggedUser.textContent = currentUser;

    if (loginPage && mainSystem) {
        if (currentUser) {
            loginPage.classList.add('hidden');
            mainSystem.classList.remove('hidden');
        } else {
            loginPage.classList.remove('hidden');
            mainSystem.classList.add('hidden');
        }
    }

    loadBooksDropdown();
    renderBooks();
    renderLoans();
}