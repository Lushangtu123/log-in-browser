const users = {}; // To store users temporarily

// Toggle to Signup Form
document.getElementById('go-to-signup').addEventListener('click', () => {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('signup-section').style.display = 'block';
});

// Toggle to Login Form
document.getElementById('go-to-login').addEventListener('click', () => {
  document.getElementById('signup-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
});

// Signup Form Submission
document.getElementById('signup-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;

  if (username in users) {
    alert('Username already exists!');
  } else if (username && password) {
    users[username] = { password, budget: 0 };
    alert('Account created successfully! Please log in.');
    document.getElementById('signup-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
  } else {
    alert('Please fill in all fields.');
  }
});

// Login Form Submission
document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (username in users && users[username].password === password) {
    alert(`Welcome, ${username}!`);
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('budget-section').style.display = 'block';
    document.getElementById('current-budget').textContent = users[username].budget.toFixed(2);
    document.getElementById('logged-in-username').textContent = username;
  } else {
    alert('Invalid username or password!');
  }
});

// Budget Form Submission
document.getElementById('budget-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('logged-in-username').textContent;
  const amount = parseFloat(document.getElementById('budget-amount').value);

  if (!isNaN(amount)) {
    users[username].budget += amount;
    document.getElementById('current-budget').textContent = users[username].budget.toFixed(2);
    alert('Budget updated successfully!');
  } else {
    alert('Please enter a valid number.');
  }
});

// Logout
document.getElementById('logout').addEventListener('click', () => {
  document.getElementById('budget-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('login-form').reset();
  document.getElementById('budget-form').reset();
});
