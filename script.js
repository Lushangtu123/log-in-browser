// Initial Setup
let expenses = [];
let totalAmount = 0;
let spendingLimit = Number(localStorage.getItem('spendingLimit')) || 1000; // Default limit

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
    const addBtn = document.getElementById('add-btn');
    const expensesTableBody = document.getElementById('expense-table-body');
    const totalAmountCell = document.getElementById('total-amount');
    const reportBtn = document.getElementById('report-btn');
    const spendingReport = document.getElementById('spending-report');
    const barChartBtn = document.getElementById('bar-chart-btn');
    const lineChartBtn = document.getElementById('line-chart-btn');
    const scatterChartBtn = document.getElementById('scatter-chart-btn');
    const updateLimitBtn = document.getElementById('update-limit-btn');
    const spendingLimitInput = document.getElementById('spending-limit-input');
    const ctx = document.getElementById('expenseChart')?.getContext('2d');

    let expenseChart = null;

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

    // Function to check spending limit
    function checkSpendingLimit() {
        const userSpending = totalAmount; // Use the totalAmount as the user's current spending

        if (userSpending >= spendingLimit) {
            alert('You have exceeded your spending limit!');
        } else if (userSpending >= spendingLimit * 0.9) {
            alert('You are close to your spending limit.');
        }
    }

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

        // Create a new expense object with a unique ID
        const expense = { id: Date.now(), category, amount, date };
        expenses.push(expense);

        // Update the total amount
        totalAmount += amount;
        totalAmountCell.textContent = totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        // Add a new row to the expenses table
        const newRow = expensesTableBody.insertRow();

        const categoryCell = newRow.insertCell();
        const amountCell = newRow.insertCell();
        const dateCell = newRow.insertCell();
        const deleteCell = newRow.insertCell();

        categoryCell.textContent = expense.category;
        amountCell.textContent = expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        dateCell.textContent = expense.date;

        // Create and append the delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function () {
            // Remove the expense from the array using the unique ID
            expenses = expenses.filter(e => e.id !== expense.id);

            // Update the total amount
            totalAmount -= expense.amount;
            totalAmountCell.textContent = totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

            // Remove the row from the table
            expensesTableBody.removeChild(newRow);

            // Update the chart if visible
            if (expenseChart) {
                updateChart(expenseChart.config.type);
            }
        });

        deleteCell.appendChild(deleteBtn);

        // Update the chart if visible
        if (expenseChart) {
            updateChart(expenseChart.config.type);
        }

        // Check spending limit after adding a new expense
        checkSpendingLimit();
    });

    // Chart and Spending Report Event Listeners
    barChartBtn.addEventListener('click', () => toggleChart('bar'));
    lineChartBtn.addEventListener('click', () => toggleChart('line'));
    scatterChartBtn.addEventListener('click', () => toggleChart('scatter'));
    reportBtn.addEventListener('click', () => {
        if (spendingReport.style.display === 'none' || spendingReport.style.display === '') {
            generateSpendingReport();
            spendingReport.style.display = 'block';
        } else {
            spendingReport.style.display = 'none';
        }
    });

    // Function to generate the spending report
    function generateSpendingReport() {
        let reportHtml = `<h3>Total Amount Spent: ${totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h3>`;

        if (expenses.length > 0) {
            const spendingByCategory = {};
            expenses.forEach(expense => {
                if (!spendingByCategory[expense.category]) {
                    spendingByCategory[expense.category] = 0;
                }
                spendingByCategory[expense.category] += expense.amount;
            });

            reportHtml += '<h4>Spending by Category:</h4><ul>';
            for (const [category, amount] of Object.entries(spendingByCategory)) {
                reportHtml += `<li>${category}: ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</li>`;
            }
            reportHtml += '</ul>';

            const highestExpense = Math.max(...expenses.map(e => e.amount));
            const lowestExpense = Math.min(...expenses.map(e => e.amount));
            const averageExpense = totalAmount / expenses.length;

            reportHtml += `<h4>Number of Expenses: ${expenses.length}</h4>`;
            reportHtml += `<h4>Highest Expense: ${highestExpense.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h4>`;
            reportHtml += `<h4>Lowest Expense: ${lowestExpense.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h4>`;
            reportHtml += `<h4>Average Expense: ${averageExpense.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h4>`;
        } else {
            reportHtml += '<p>No expenses recorded yet.</p>';
        }

        spendingReport.innerHTML = reportHtml;
    }

    // Function to toggle chart display
    function toggleChart(chartType) {
        if (expenseChart && expenseChart.config.type === chartType) {
            expenseChart.destroy();
            expenseChart = null;
            document.getElementById('expenseChart').style.display = 'none';
        } else {
            updateChart(chartType);
        }
    }

    // Function to update the chart
    function updateChart(chartType) {
        if (expenseChart) {
            expenseChart.destroy();
        }

        if (chartType === 'scatter') {
            // For scatter plot, create data points with x as index and y as amount
            const data = expenses.map((expense, index) => {
                return { x: index + 1, y: expense.amount };
            });

            expenseChart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Expense Amounts',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Index'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                        }
                    }
                }
            });
        } else {
            // For bar and line charts, aggregate expenses by month
            const monthlyExpenses = {};
            expenses.forEach(expense => {
                const month = new Date(expense.date).toLocaleString('en-US', { month: 'long', year: 'numeric' });
                if (!monthlyExpenses[month]) {
                    monthlyExpenses[month] = 0;
                }
                monthlyExpenses[month] += expense.amount;
            });

            const labels = Object.keys(monthlyExpenses);
            const data = Object.values(monthlyExpenses);

            expenseChart = new Chart(ctx, {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Monthly Expenses',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                        showLine: chartType === 'scatter' ? false : true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Month'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                        }
                    }
                }
            });
        }

        document.getElementById('expenseChart').style.display = 'block';
    }

    // Initial check of spending limit after login
    checkSpendingLimit();
}
