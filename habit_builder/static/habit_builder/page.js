function showpage(page) {
    // Hide all divs
    document.querySelectorAll('div[id^="page"]').forEach(div => {
        div.style.display = 'none';
    });
    // Show the selected div
    document.querySelector(`#${page}`).style.display = 'block';
}
function checkAndResetHabits() {
    console.log("checkAndResetHabits is running");
    const habitRows = document.querySelectorAll('.habit-row');
    document.querySelectorAll('.bad_habit-row').forEach(row => {
        const habitId = row.getAttribute('data-habit-id');
        initializeBadHabitRow(row, habitId);
    });
    habitRows.forEach(row => {
        const habitId = row.getAttribute('data-habit-id');
        const startDate = new Date(row.getAttribute('data-habit-start_date'));
        // const startDate = new Date();
        const repeat = row.getAttribute('data-habit-repeat');
        const today = new Date();
        console.log(`today is ${today} and start date is ${startDate}`);
        let shouldReset = false;

        if (repeat === 'daily') {
            shouldReset = (today > startDate);
        } else if (repeat === 'weekly') {
            const daysDifference = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            shouldReset = (daysDifference >= 7);
        } else if (repeat === 'monthly') {
            const monthDifference = today.getMonth() - startDate.getMonth() + 
                (12 * (today.getFullYear() - startDate.getFullYear()));
            shouldReset = (monthDifference >= 1);
        }

        if (shouldReset) {
            // Send AJAX request to reset the habit
            fetch(`/reset_habit/${habitId}/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Handle success: Remove the habit from success div and add it back to the table
                    const successDiv = document.getElementById('success-div'); // Assuming a success div exists
                    const habitRow = document.querySelector(`.habit-row[data-habit-id="${habitId}"]`); // Use the data-habit-id to find the row

                    // Remove habit from success div
                    const habitNameDiv = successDiv.querySelector(`.habit-name[data-habit-id="${habitId}"]`);
                    if (habitNameDiv) {
                        habitNameDiv.remove();
                    }

                    // Re-add the habit row to the table if not already there
                    const habitsTable = document.getElementById('habits-table'); // Assuming your table has id="habits-table"
                    if (habitsTable && habitRow) {
                        habitsTable.appendChild(habitRow);
                    }

                    console.log(`Habit ${habitId} reset and moved back to the table!`);
                } else if (data.status === 'no_reset') {
                    console.log(`Habit ${habitId} does not need resetting yet.`);
                } else {
                    console.error('Error:', data.message);
                }
            })
            .catch(error => console.error('Error resetting habit:', error));
        }
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


document.addEventListener('DOMContentLoaded', function() {

    const pageId = "{{ id }}"; // Ensure this is correctly rendered
    console.log('Page ID:', pageId); // For debugging

    document.getElementById('addTodoButton').addEventListener('click', function() {
        const task = document.getElementById('todoInput').value.trim(); // Trim whitespace

        if (!task) {
            alert('Please enter a task.'); // Validate input
            return;
        }

        fetch('/add-todo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: `task=${encodeURIComponent(task)}&page_id=${pageId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Task added successfully!');
                window.location.reload(); // Reload to see the new task
            } else {
                alert('Error adding task: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const todoId = this.getAttribute('data-todo-id');
            const completed = this.checked;
    
            fetch('/update-todo/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: `todo_id=${todoId}&completed=${completed}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'success') {
                    alert('Error updating task: ' + data.message);
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });

    // Function to update the timer for a given habitId
    function updateTimer(habitId, startDate) {
        const now = new Date();  // Current date and time
        const timeDiff = now - new Date(startDate);  // Time difference in milliseconds

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        // Update the timer in the HTML
        const timerElement = document.getElementById(`timer-${habitId}`);
        if (timerElement) {
            timerElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    }

    // Function to initialize timers for all bad habits
    function initializeTimers() {
        document.querySelectorAll('.bad_habit-row').forEach(row => {
            const habitId = row.getAttribute('data-habit-id');
            const startDate = row.getAttribute('data-start-date');
            updateTimer(habitId, startDate);
            // Update timer every second
            setInterval(() => updateTimer(habitId, startDate), 1000);
        });
    }

    // Initialize timers on page load
    initializeTimers();
    const today = new Date();
    console.log(`today is ${today}`);
    document.querySelectorAll('button[data-page]').forEach(button => {
        button.onclick = function() {
            showpage(this.dataset.page);
        };
    });

    

    // Call the checkAndResetHabits function periodically, e.g., every minute
    setInterval(checkAndResetHabits, 60000); // Check every 60 seconds
    
    const editButtons = document.querySelectorAll('.edit');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function () {
            const habitId = this.dataset.habitId;
            fetch(`/get_habit/${habitId}/`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('habit_name').value = data.habit_name;
                    document.getElementById('time_of_day_to_perform').value = data.time_of_day_to_perform;
                    document.getElementById('start_date_of_habit').value = data.start_date_of_habit;
                    document.getElementById('repeat').value = data.repeat;
                    document.getElementById('countdown').value = data.countdown;
                    document.getElementById('goal_value').value = data.goal_value;
                    document.getElementById('goal_units').value = data.goal_units;
                    document.getElementById('custom_goal_unit').value = data.custom_goal_unit;
                    document.getElementById('goal_frequency').value = data.goal_frequency;
                    document.getElementById('habitForm').action = `{% url 'add_page' title id %}?edit=${habitId}`;
                    document.getElementById('habitModal').style.display = 'block';
                });
        });
    });

    const failButtons = document.querySelectorAll('.habit_fail');
    failButtons.forEach(button => {
        button.addEventListener('click', function() {
            const habitId = this.getAttribute('data-habit-id');
            const habitType = this.getAttribute('data-habit-type');
            //change
            if (habitType === 'good_habit') {
                const habitRow = document.querySelector(`.habit-row[data-habit-id="${habitId}"]`);
                moveToFail(habitRow);
                localStorage.setItem(`habit_failed_${habitId}`, 'true');
            } else if (habitType === 'bad_habit') {
                const habitRow = document.querySelector(`.bad_habit-row[data-habit-id="${habitId}"]`);
                moveToFail(habitRow);
                localStorage.setItem(`habit_failed_${habitId}`, 'true');
            }else {
                console.error(`Habit with id ${habitId} not found.`);
            }
        });
    });



    // Close modals
    document.querySelectorAll('.close').forEach(closeButton => {
        closeButton.addEventListener('click', () => {
            document.getElementById('habitModal').style.display = 'none';
            document.getElementById('badhabitModal').style.display = 'none';
        });
    });
    const successDiv = document.getElementById('success_div');

    if (successDiv.childElementCount === 0) {
        let successContainer = document.querySelector("#success_container");
        if (successContainer.style.display === 'block') {
            successContainer.style.display = 'none';
        }
    }

    const failDiv = document.getElementById('fail_div');
    if (failDiv.childElementCount === 0) {
        let failContainer = document.querySelector("#fail_container");
        if (failContainer.style.display === 'block') {
            failContainer.style.display = 'none';
        }
    }
    
    // Initialize values from localStorage or default to 0 for habits with 'times' as their unit- check after refresh
    document.querySelectorAll('.habit-row').forEach(row => {
        const habitId = row.getAttribute('data-habit-id');
        const timesCheckElement = document.getElementById(`times_check_${habitId}`);
        const data_type = row.getAttribute('data-type');
        // Check if this habit is completed
        if (localStorage.getItem(`habit_completed_${habitId}`) === 'true') {
            moveToSuccess(row);
            return;
        }
        else if(data_type==='bad_habit'){
        
            initializeBadHabitRow(row, habitId);
        }
        // Check if this habit has failed
        else if (localStorage.getItem(`habit_failed_${habitId}`) === 'true') {
            moveToFail(row);
            return;
        }
        if (timesCheckElement) {
            let storedValue = localStorage.getItem(`times_value_${habitId}`) || '0';
            updateValue(habitId, storedValue);
        }
    });

    // Initialize bad habits on page load
    document.querySelectorAll('.bad_habit-row').forEach(row => {
        const habitId = row.getAttribute('data-habit-id');
        console.log(`${localStorage.getItem(`bad_habit_completed_${habitId}`)}`);
        // Check if this habit was marked as completed
        if (localStorage.getItem(`bad_habit_completed_${habitId}`) === 'true') {
            moveToSuccess(row);
        }   
        // Check if this habit was marked as failed
        else if (localStorage.getItem(`habit_failed_${habitId}`) === 'true') {
            moveToFail(row);
        }
    });




    document.querySelectorAll('.add').forEach(button => {
        button.onclick = function() {
            const habitId = this.getAttribute('data-habit-id');
            const timesCheckElement = document.getElementById(`times_check_${habitId}`);
            if (timesCheckElement) {
                let value = parseInt(timesCheckElement.innerHTML, 10);
                value += 1;
                updateValue(habitId, value);
            }
        };
    });

    document.querySelectorAll('.reduce').forEach(button => {
        button.onclick = function() {
            const habitId = this.getAttribute('data-habit-id');
            const timesCheckElement = document.getElementById(`times_check_${habitId}`);
            if (timesCheckElement) {
                let value = parseInt(timesCheckElement.innerHTML, 10);
                if (value > 0) {
                    value -= 1;
                }
                updateValue(habitId, value);
            }
        };
    });

    const logButtons = document.querySelectorAll('.log-mins');
    logButtons.forEach(button => {
        button.addEventListener('click', function () {
            const habitId = this.getAttribute('data-habit-id');
            const habitRow = document.querySelector(`.habit-row[data-habit-id="${habitId}"]`);
            const goalValue = parseInt(habitRow.getAttribute('data-goal-value'));
            const minsInput = document.getElementById(`mins_input_${habitId}`);
            const minsEntered = parseInt(minsInput.value);

            if (!isNaN(minsEntered) && minsEntered > 0) {
                const newGoalValue = goalValue - minsEntered;

                if (newGoalValue <= 0) {
                    habitRow.setAttribute('data-goal-value', newGoalValue);
                    moveToSuccess(habitRow);
                } else {
                    habitRow.setAttribute('data-goal-value', newGoalValue);
                    alert(`Remaining mins to complete the goal: ${newGoalValue}`);
                }

                minsInput.value = '';
            } else {
                alert('Please enter a valid number of minutes.');
            }
        });
    });

    const log_for_other_units = document.querySelectorAll('.log-text');
    log_for_other_units.forEach(button => {
        button.addEventListener('click', function() {
            const habitId = this.getAttribute('data-habit-id');
            const habitRow = document.querySelector(`.habit-row[data-habit-id="${habitId}"]`);
            const goalValue = parseInt(habitRow.getAttribute('data-goal-value'));
            const logInput = document.getElementById(`log_input_${habitId}`);
            const logEntered = parseInt(logInput.value);

            if (!isNaN(logEntered) && logEntered > 0) {
                const newGoalValue = goalValue - logEntered;

                if (newGoalValue <= 0) {
                    habitRow.setAttribute('data-goal-value', newGoalValue);
                    moveToSuccess(habitRow);
                } else {
                    habitRow.setAttribute('data-goal-value', newGoalValue);
                    alert(`Remaining value to complete the goal: ${newGoalValue}`);
                }

                logInput.value = '';
            } else {
                alert('Please enter a valid number.');
            }
        });
    });


    // Function to get current date
    function getCurrentDate() {
        return new Date();
    }

    // Function to parse date string in 'YYYY-MM-DD' format
    function parseDate(dateString) {
        return new Date(dateString);
    }

    // Function to calculate next reset date based on repeat choice
    function getNextResetDate(startDate, repeatChoice) {
        const start = parseDate(startDate);
        const today = getCurrentDate();
        
        if (repeatChoice === 'daily') {
            return new Date(start.setDate(start.getDate() + Math.floor((today - start) / (1000 * 60 * 60 * 24))));
        } else if (repeatChoice === 'weekly') {
            return new Date(start.setDate(start.getDate() + Math.floor((today - start) / (1000 * 60 * 60 * 24 * 7))));
        } else if (repeatChoice === 'monthly') {
            return new Date(start.setMonth(start.getMonth() + Math.floor((today - start) / (1000 * 60 * 60 * 24 * 30))));
        }
    }  
    //function for bad habit success
    document.querySelectorAll('.bad_habit_success').forEach(button => {
        button.onclick = function(){
            const habitId = this.getAttribute('data-habit-id');
            const habitRow = document.querySelector(`.bad_habit-row[data-habit-id="${habitId}"]`);
            moveToSuccess(habitRow);
        }

    });


    document.getElementById('saveButton').addEventListener('click', function() {
        const noteContent = document.getElementById('noteArea').innerHTML;

        // Send an AJAX POST request to the server
        fetch('/save-note/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken'), // Add CSRF token for security
            },
            body: `content=${encodeURIComponent(noteContent)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Note saved successfully!');
                // Optionally reload the page to show the new note
                window.location.reload();
            } else {
                alert('Error saving note: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    // Save note for Note2 model
    document.getElementById('saveButton2').addEventListener('click', function() {
        const noteContent = document.getElementById('noteArea2').innerHTML;

        // Send an AJAX POST request to save note in the Note2 model
        fetch('/save-note2/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken'), // Add CSRF token for security
            },
            body: `content=${encodeURIComponent(noteContent)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Note saved successfully in Note2!');
                // Optionally reload the page to show the new note
                window.location.reload();
            } else {
                alert('Error saving note: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });


    // Function to get the CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }


});


//Dom content load ends above. 


function updateValue(habitId, newValue) {
    const timesCheckElement = document.getElementById(`times_check_${habitId}`);
    if (timesCheckElement) {
        timesCheckElement.innerHTML = newValue;
        localStorage.setItem(`times_value_${habitId}`, newValue);
        check_success(habitId);
    }
}

function check_success(habitId) {
    const timesCheckElement = document.getElementById(`times_check_${habitId}`);
    if (timesCheckElement) {
        const goalValue = parseInt(timesCheckElement.getAttribute('data-goal-value'), 10);
        const currentValue = parseInt(timesCheckElement.innerHTML, 10);

        if (currentValue >= goalValue) {
            const habitRow = document.querySelector(`tr[data-habit-id="${habitId}"]`);
            moveToSuccess(habitRow);
        }
    }
}


function moveToSuccess(habitRow) {
    let successContainer = document.querySelector("#success_container");
    if (successContainer.style.display === 'none') {
        successContainer.style.display = 'block';
    }

    const successDiv = document.getElementById('success_div');
    const habitId = habitRow.getAttribute('data-habit-id');
    const habitName = habitRow.querySelector('td').innerText;

    const habitNameElement = document.createElement('p');
    habitNameElement.id = `habitNameElement${habitId}`;
    const strikethroughElement = document.createElement('s');
    strikethroughElement.textContent = habitName;
    strikethroughElement.className = `strike${habitId}`;
    const undo_button = document.createElement('button');
    undo_button.textContent = 'undo';
    undo_button.id = `undo_button_${habitId}`;
    undo_button.setAttribute('habitId', habitId);
    habitNameElement.appendChild(strikethroughElement);
    habitNameElement.appendChild(undo_button);

    successDiv.appendChild(habitNameElement);
    habitRow.remove();

    const habitType = habitRow.getAttribute('data-type');
    if (habitType === 'good_habit') {
        undo_button.addEventListener('click', () => {
            performUndoAction(habitRow, habitNameElement);
        });
        localStorage.setItem(`habit_completed_${habitId}`, 'true');
    } else if (habitType === 'bad_habit') {
        undo_button.addEventListener('click', () => {
            performUndoActionForBadHabit(habitRow, habitNameElement);
        });
        localStorage.setItem(`bad_habit_completed_${habitId}`, 'true');
    }
}


function performUndoActionForBadHabit(habitRow, habitNameElement) {
    habitNameElement.remove();
    const habitId = habitRow.getAttribute('data-habit-id');

    // Reset the habit state in localStorage
    localStorage.setItem(`bad_habit_completed_${habitId}`, 'false');

    const badHabitsTable = document.querySelector('#bad_habits tbody');
    badHabitsTable.appendChild(habitRow);

    // Reinitialize the habit row
    initializeBadHabitRow(habitRow, habitId);
}



function performUndoAction(habitRow,habitNameElement) {
    habitNameElement.remove();
    const habitId = habitRow.getAttribute('data-habit-id');

    // Reset the habit state in localStorage
    localStorage.setItem(`habit_completed_${habitId}`, 'false');

    // Re-add habit row to the table
    const goodHabitsTable = document.querySelector('#good_habits tbody');
    goodHabitsTable.appendChild(habitRow);

    // Reset habit row values and inputs
    const timesCheckElement = document.getElementById(`times_check_${habitId}`);
    if (timesCheckElement) {
        timesCheckElement.innerHTML = 0;
        localStorage.setItem(`times_value_${habitId}`, 0);
    }

    const minsInput = document.getElementById(`mins_input_${habitId}`);
    if (minsInput) {
        minsInput.value = '0';
    }

    const logInput = document.getElementById(`log_input_${habitId}`);
    if (logInput) {
        logInput.value = '0';
    }

    // Reinitialize the habit row with correct state
    initializeHabitRow(habitId);
}


// Function to initialize a new bad habit row
function initializeBadHabitRow(row, habitId) {
    const goalValue = parseInt(row.getAttribute('data-goal-value'), 10);
    const startDate = row.getAttribute('data-start-date');
    const repeatChoice = row.getAttribute('data-repeat');
    const nextResetDate = getNextResetDate(startDate, repeatChoice);
    const today = getCurrentDate();
    const timerElement = document.getElementById(`timer_${habitId}`);
    if (nextResetDate <= today) {
        // Reset goal value and update display
        row.setAttribute('data-goal-value', goalValue);
        updateValue(habitId, goalValue);
        timerElement.innerText = `Timer: 00:00:00`;
    } else {
        // Display remaining time
        const timeDiff = nextResetDate - today;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        timerElement.innerText = `Timer: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}


function initializeHabitRow(habitId) {
    const habitRow = document.querySelector(`.habit-row[data-habit-id="${habitId}"]`);
    if (habitRow) {
        // Reattach event listeners to the newly re-added buttons
        const addButton = habitRow.querySelector('.add');
        const reduceButton = habitRow.querySelector('.reduce');
        const logMinsButton = habitRow.querySelector('.log-mins');
        const logTextButton = habitRow.querySelector('.log-text');

        if (addButton) {
            addButton.onclick = function() {
                const timesCheckElement = document.getElementById(`times_check_${habitId}`);
                if (timesCheckElement) {
                    let value = parseInt(timesCheckElement.innerHTML, 10);
                    value += 1;
                    updateValue(habitId, value);
                }
            };
        }

        if (reduceButton) {
            reduceButton.onclick = function() {
                const timesCheckElement = document.getElementById(`times_check_${habitId}`);
                if (timesCheckElement) {
                    let value = parseInt(timesCheckElement.innerHTML, 10);
                    if (value > 0) {
                        value -= 1;
                    }
                    updateValue(habitId, value);
                }
            };
        }

        if (logMinsButton) {
            logMinsButton.addEventListener('click', function() {
                const habitRow = document.querySelector(`.habit-row[data-habit-id="${habitId}"]`);
                const goalValue = parseInt(habitRow.getAttribute('data-goal-value'));
                const minsInput = document.getElementById(`mins_input_${habitId}`);
                const minsEntered = parseInt(minsInput.value);

                if (!isNaN(minsEntered) && minsEntered > 0) {
                    const newGoalValue = goalValue - minsEntered;

                    if (newGoalValue <= 0) {
                        habitRow.setAttribute('data-goal-value', newGoalValue);
                        moveToSuccess(habitRow);
                    } else {
                        habitRow.setAttribute('data-goal-value', newGoalValue);
                        alert(`Remaining mins to complete the goal: ${newGoalValue}`);
                    }

                    minsInput.value = '';
                } else {
                    alert('Please enter a valid number of minutes.');
                }
            });
        }

        if (logTextButton) {
            logTextButton.addEventListener('click', function() {
                const habitRow = document.querySelector(`.habit-row[data-habit-id="${habitId}"]`);
                const goalValue = parseInt(habitRow.getAttribute('data-goal-value'));
                const logInput = document.getElementById(`log_input_${habitId}`);
                const logEntered = parseInt(logInput.value);

                if (!isNaN(logEntered) && logEntered > 0) {
                    const newGoalValue = goalValue - logEntered;

                    if (newGoalValue <= 0) {
                        habitRow.setAttribute('data-goal-value', newGoalValue);
                        moveToSuccess(habitRow);
                    } else {
                        habitRow.setAttribute('data-goal-value', newGoalValue);
                        alert(`Remaining value to complete the goal: ${newGoalValue}`);
                    }

                    logInput.value = '';
                } else {
                    alert('Please enter a valid number.');
                }
            });
        }
    }
}

function performUndoActionforFail(habitRow,habitNameElement) {
    habitNameElement.remove();
    const habitId = habitRow.getAttribute('data-habit-id');

    // Reset the habit state in localStorage
    localStorage.setItem(`habit_failed_${habitId}`, 'false');

    // Re-add habit row to the table
    const goodHabitsTable = document.querySelector('#good_habits tbody');
    goodHabitsTable.appendChild(habitRow);

    // Reset habit row values and inputs
    const timesCheckElement = document.getElementById(`times_check_${habitId}`);
    if (timesCheckElement) {
        timesCheckElement.innerHTML = 0;
        localStorage.setItem(`times_value_${habitId}`, 0);
    }

    const minsInput = document.getElementById(`mins_input_${habitId}`);
    if (minsInput) {
        minsInput.value = '0';
    }

    const logInput = document.getElementById(`log_input_${habitId}`);
    if (logInput) {
        logInput.value = '0';
    }

    // Reinitialize the habit row with correct state
    initializeHabitRow(habitId);
}

function performUndoActionForBadHabitforFail(habitRow, habitNameElement) {
    habitNameElement.remove();
    const habitId = habitRow.getAttribute('data-habit-id');

    // Reset the habit state in localStorage
    localStorage.setItem(`habit_failed_${habitId}`, 'false');

    const badHabitsTable = document.querySelector('#bad_habits tbody');
    badHabitsTable.appendChild(habitRow);

    // Reinitialize the habit row
    initializeBadHabitRow(habitRow, habitId);
}
function moveToFail(habitRow) {
    let failContainer = document.querySelector("#fail_container");
    if (failContainer.style.display === 'none') {
        failContainer.style.display = 'block';
    }

    const failDiv = document.getElementById('fail_div');
    const habitId = habitRow.getAttribute('data-habit-id');
    const habitName = habitRow.querySelector('td').innerText;

    const habitNameElement = document.createElement('p');
    //add strikethrough to the habit name
    
    habitNameElement.id = `failHabitNameElement${habitId}`;
    const habitTextElement = document.createElement('span');
    // habitTextElement.textContent = habitName;
    const strikethroughElement = document.createElement('s');
    strikethroughElement.textContent = habitName;
    strikethroughElement.className = `strike${habitId}`;
    // Optional: Create an undo button for moving it back
    const undoButton = document.createElement('button');
    undoButton.textContent = 'Undo';
    undoButton.id = `fail_undo_button_${habitId}`;
    undoButton.setAttribute('habitId', habitId);
    habitNameElement.appendChild(strikethroughElement);
    habitNameElement.appendChild(undoButton);

    failDiv.appendChild(habitNameElement);
    habitRow.remove();

    const habitType = habitRow.getAttribute('data-type');
    if (habitType === 'good_habit') {
        undoButton.addEventListener('click', () => {
            performUndoActionforFail(habitRow, habitNameElement); // Reuse the undo function from success
        });
        // localStorage.setItem(`habit_failed_${habitId}`, 'true');
        localStorage.setItem(`habit_failed_${habitId}`, 'true');
    } else if (habitType === 'bad_habit') {
        undoButton.addEventListener('click', () => {
            performUndoActionForBadHabitforFail(habitRow, habitNameElement);
        });
        localStorage.setItem(`habit_failed_${habitId}`, 'true');
    }
}



function toggleDropdown() {
    var dropdown = document.getElementById('dropdownMenu');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function showModal(habitType) {
    var modal = document.getElementById('habitModal');
    modal.style.display = 'block';
}

function hideModal() {
    var modal = document.getElementById('habitModal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    var modal = document.getElementById('habitModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
