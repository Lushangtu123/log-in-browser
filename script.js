// ==============================
// Chatbot Functionality
// ==============================
function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // 滚动到底部
  }

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const message = userInput.value.trim();

    if (message !== '') {
        // Add user message to chat
        appendMessage('user', message);
        
        try {
            // Show loading indicator
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'message bot-message';
            loadingMessage.textContent = 'Thinking...';
            chatBox.appendChild(loadingMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
            
            // Send request to our server (updated port)
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Remove loading message
            chatBox.removeChild(loadingMessage);
            
            // Display bot response
            if (data.choices && data.choices.length > 0) {
                appendMessage('bot', data.choices[0].message.content);
            } else {
                appendMessage('bot', 'I received your message but couldn\'t generate a proper response.');
            }
        } catch (error) {
            console.error('Error:', error);
            
            // Find and remove the loading message if it exists
            const loadingMessages = chatBox.querySelectorAll('.message.bot-message');
            for (const msg of loadingMessages) {
                if (msg.textContent === 'Thinking...') {
                    chatBox.removeChild(msg);
                    break;
                }
            }
            
            appendMessage('bot', 'Sorry, there was an error connecting to the server. Please make sure the server is running at http://localhost:3001');
        }
        
        // Clear input
        userInput.value = '';
    }
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // 滚动到底部
}

// Add event listener for Enter key
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 切换聊天窗口的展开/收起状态
const chatContainer = document.getElementById('chat-container');
const chatToggle = document.getElementById('chat-toggle');

chatToggle.addEventListener('click', () => {
  chatContainer.classList.toggle('collapsed');
});

// ==============================
// Expense Tracking Functionality
// ==============================

// Initial Setup
let expenses = [];
let totalAmount = 0;
let spendingLimit = Number(localStorage.getItem('spendingLimit')) || 1000; // Default limit
let historyRecords = [];

// Sign Up and Login Elements
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const loginPage = document.getElementById('login-page');
const signupPage = document.getElementById('signup-page');
const appContent = document.getElementById('app-content');
const signupError = document.getElementById('signup-error');
const loginError = document.getElementById('login-error');
const goToLoginBtn = document.getElementById('go-to-login');
const goToSignupBtn = document.getElementById('go-to-signup');

// Event listener to navigate to the signup page
goToSignupBtn.addEventListener('click', function () {
    loginPage.style.display = 'none';
    signupPage.style.display = 'block';
});

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

        const newExpense = { id: Date.now(), category, amount, date };
        expenses.push(newExpense);

        // Update total amount
        totalAmount += amount;
        totalAmountCell.textContent = totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        // Add row to the table
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${category}</td>
            <td>${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td>${date}</td>
            <td></td>
        `;
        expensesTableBody.appendChild(newRow);

        // Add delete button to the row
        const deleteCell = newRow.querySelector('td:last-child');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');

        deleteBtn.addEventListener('click', function () {
            const index = expenses.findIndex(expense => expense.id === newExpense.id);
            if (index !== -1) {
                expenses.splice(index, 1);

                // Update the total amount
                totalAmount -= newExpense.amount;
                totalAmountCell.textContent = totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

                // Remove the row from the table
                expensesTableBody.removeChild(newRow);

                // Log the deletion in the history
                historyRecords.push({
                    action: 'delete',
                    details: `Deleted expense: ${newExpense.category} - ${newExpense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} on ${newExpense.date}`,
                    timestamp: new Date()
                });

                // Update the chart if visible
                if (expenseChart) {
                    updateChart(expenseChart.config.type);
                }
            }
        });

        deleteCell.appendChild(deleteBtn);

        // Update the chart if visible
        if (expenseChart) {
            updateChart(expenseChart.config.type);
        }

        // Check spending limit after adding a new expense
        checkSpendingLimit();

        // Log the addition in the history
        historyRecords.push({
            action: 'add',
            details: `Added expense: ${category} - ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} on ${date}`,
            timestamp: new Date()
        });
    });

    // Chart and Spending Report Event Listeners
    barChartBtn.addEventListener('click', () => toggleChart('bar'));
    lineChartBtn.addEventListener('click', () => toggleChart('line'));
    scatterChartBtn.addEventListener('click', () => toggleChart('scatter'));
    reportBtn.addEventListener('click', () => {
        if (spendingReport.style.display === 'none' || spendingReport.style.display === '') {
            generateSpendingReport();
            spendingReport.style.display = 'block';

            // Log the report generation in the history
            historyRecords.push({
                action: 'report',
                details: `Generated spending report. Total Amount: ${totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
                timestamp: new Date()
            });
        } else {
            spendingReport.style.display = 'none';
        }
    });

    // Function to generate the spending report
    function generateSpendingReport() {
        let reportHtml = `Total Amount Spent: ${totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;

        if (expenses.length > 0) {
            const spendingByCategory = {};
            expenses.forEach(expense => {
                if (!spendingByCategory[expense.category]) {
                    spendingByCategory[expense.category] = 0;
                }
                spendingByCategory[expense.category] += expense.amount;
            });

            reportHtml += '<br>Spending by Category:<br>';
            for (const [category, amount] of Object.entries(spendingByCategory)) {
                reportHtml += `${category}: ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}<br>`;
            }

            const highestExpense = Math.max(...expenses.map(e => e.amount));
            const lowestExpense = Math.min(...expenses.map(e => e.amount));
            const averageExpense = totalAmount / expenses.length;

            reportHtml += `Number of Expenses: ${expenses.length}<br>`;
            reportHtml += `Highest Expense: ${highestExpense.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}<br>`;
            reportHtml += `Lowest Expense: ${lowestExpense.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}<br>`;
            reportHtml += `Average Expense: ${averageExpense.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}<br>`;
        } else {
            reportHtml += 'No expenses recorded yet.';
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

    // Show/Hide History Section
    const showHistoryBtn = document.getElementById('show-history-btn');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');

    // Add these new variables
    const historySearchInput = document.getElementById('history-search-input');
    const historySearchBtn = document.getElementById('history-search-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    let filteredHistoryRecords = [];

    showHistoryBtn.addEventListener('click', function () {
        if (historySection.style.display === 'none' || historySection.style.display === '') {
            historySection.style.display = 'block';
            displayHistory();
        } else {
            historySection.style.display = 'none';
        }
    });

    // Search functionality
    historySearchBtn.addEventListener('click', function() {
        searchHistory();
    });

    // Clear search functionality
    clearSearchBtn.addEventListener('click', function() {
        historySearchInput.value = '';
        filteredHistoryRecords = [];
        displayHistory(); // Show all history items
    });

    // Allow pressing Enter to search
    historySearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchHistory();
        }
    });

    function searchHistory() {
        const searchTerm = historySearchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // If search term is empty, show all history
            filteredHistoryRecords = [];
            displayHistory();
            return;
        }
        
        // Filter history records based on search term
        filteredHistoryRecords = historyRecords.filter(record => 
            record.details.toLowerCase().includes(searchTerm) || 
            record.action.toLowerCase().includes(searchTerm)
        );
        
        displayHistory();
    }
    // Modified displayHistory function to handle search results
function displayHistory() {
    historyList.innerHTML = ''; // Clear previous history
    
    // Determine which array to display
    const recordsToDisplay = filteredHistoryRecords.length > 0 ? 
                            filteredHistoryRecords : 
                            historyRecords;
    
    if (recordsToDisplay.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = filteredHistoryRecords.length === 0 && historySearchInput.value !== '' ? 
                              'No matching records found.' : 
                              'No history records yet.';
        historyList.appendChild(listItem);
        return;
    }
    
    const searchTerm = historySearchInput.value.toLowerCase().trim();
    
    recordsToDisplay.forEach(record => {
        const listItem = document.createElement('li');
        const timestamp = `[${record.timestamp.toLocaleString()}]`;
        const action = `${record.action.toUpperCase()}:`;
        
        // Create the list item content
        let content = `${timestamp} ${action} ${record.details}`;
        
        // If we have a search term, highlight it
        if (searchTerm !== '') {
            const regex = new RegExp(searchTerm, 'gi');
            content = content.replace(regex, match => `<span class="highlight">${match}</span>`);
            listItem.innerHTML = content;
        } else {
            listItem.textContent = content;
        }
        
        historyList.appendChild(listItem);
    });
    } // End of displayHistory function
    checkSpendingLimit
} // End of initializeExpenseTracking function

