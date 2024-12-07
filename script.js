// Initial Setup
let expenses = [];
let recurringExpenses = [];
let totalAmount = 0;
let spendingLimit = 500; // Default spending limit

// Retrieve stored spending limit from localStorage if available
if (localStorage.getItem('spendingLimit')) {
    spendingLimit = Number(localStorage.getItem('spendingLimit'));
}

// Sign Up and Login Elements
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const loginPage = document.getElementById('login-page');
const signupPage = document.getElementById('signup-page');
const appContent = document.getElementById('app-content');
const signupError = document.getElementById('signup-error');
const loginError = document.getElementById('login-error');
const goToLoginBtn = document.getElementById('go-to-login');

// Event listener to navigate to the login page
goToLoginBtn.addEventListener('click', function () {
    signupPage.style.display = 'none';
    loginPage.style.display = 'block';
});

// Sign Up Functionality
signupBtn.addEventListener('click', function () {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Basic validation
    if (username === '' || password === '' || confirmPassword === '') {
        signupError.textContent = "All fields are required.";
        return;
    }

    if (password !== confirmPassword) {
        signupError.textContent = "Passwords do not match.";
        return;
    }

    // Store user credentials in localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.username === username)) {
        signupError.textContent = "Username already exists. Please choose a different username.";
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));

    // Navigate to login page
    signupPage.style.display = 'none';
    loginPage.style.display = 'block';
});

// Login Functionality
loginBtn.addEventListener('click', function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Fetch users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Validate credentials
    if (users.some(user => user.username === username && user.password === password)) {
        loginPage.style.display = "none";
        appContent.style.display = "block";
        initializeExpenseTracking(); // Initialize expense tracking functions after login
    } else {
        loginError.textContent = "Invalid username or password. Please try again.";
    }
});

// Initialize Expense Tracking Functionality
function initializeExpenseTracking() {
    const categorySelect = document.getElementById('category-select');
    const amountInput = document.getElementById('amount-input');
    const dateInput = document.getElementById('date-input');
    const intervalInput = document.getElementById('interval-input');
    const addRecurringBtn = document.getElementById('add-recurring-btn');
    const addBtn = document.getElementById('add-btn');
    const updateLimitBtn = document.getElementById('update-limit-btn');
    const spendingLimitInput = document.getElementById('spending-limit-input');
    const expensesTableBody = document.getElementById('expense-table-body');
    const totalAmountCell = document.getElementById('total-amount');

    // Add Expense Functionality
    addBtn.addEventListener('click', function () {
        const category = categorySelect.value;
        const amount = Number(amountInput.value);
        const date = dateInput.value;

        // Validate inputs
        if (category === '') {
            alert('Please select a category');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (date === '') {
            alert('Please select a date');
            return;
        }

        // Check if spending limit is exceeded
        if (totalAmount > spendingLimit) {
            alert('Warning: You have exceeded your spending limit!');
            return;
        }

        addExpense(category, amount, date);
    });

    // Add Recurring Expense Functionality
    addRecurringBtn.addEventListener('click', function () {
        const category = categorySelect.value;
        const amount = Number(amountInput.value);
        const startDate = dateInput.value;
        const interval = Number(intervalInput.value);

        

        // Validate inputs
        if (category === '') {
            alert('Please select a category');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (startDate === '') {
            alert('Please select a start date');
            return;
        }
        if (isNaN(interval) || interval <= 0) {
            alert('Please enter a valid interval');
            return;
        }

        addRecurringExpense(category, amount, startDate, interval);
        alert('Recurring expense added successfully!');
    });

    // Update Spending Limit Functionality
    updateLimitBtn.addEventListener('click', function () {
        const newLimit = Number(spendingLimitInput.value);
        if (!isNaN(newLimit) && newLimit > 0) {
            spendingLimit = newLimit;
            localStorage.setItem('spendingLimit', spendingLimit);
            alert('Spending limit updated successfully!');
        } else {
            alert('Please enter a valid limit.');
        }
    });
}

// Add Expense Function
function addExpense(category, amount, date) {
    const expense = { id: Date.now(), category, amount, date };
    expenses.push(expense);

    // Update the total amount
    totalAmount += amount;
    document.getElementById('total-amount').textContent = totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    // Update the UI with the new expense (e.g., adding rows to the table)
}

// Add Recurring Expense Functions
function addRecurringExpense(category, amount, startDate, interval) {
    const recurringExpense = { id: Date.now(), category, amount, startDate, interval };
    recurringExpenses.push(recurringExpense);
    scheduleNextExpense(recurringExpense);
}

function scheduleNextExpense(expense) {
    const nextDate = new Date(expense.startDate);
    nextDate.setMonth(nextDate.getMonth() + expense.interval);

    setTimeout(() => {
        addExpense(expense.category, expense.amount, nextDate.toISOString().split('T')[0]);
        scheduleNextExpense(expense);
    }, nextDate - new Date());
}
