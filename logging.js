

export function logToDiv() {
    var logsDiv = document.getElementById('logs');
    var logEntry = document.createElement('div');
    
    for (var i = 0; i < arguments.length; i++) {
        var message = arguments[i];
        logEntry.textContent += message + ' ';
        logEntry.textContent += '-';
    }
    logsDiv.appendChild(logEntry);

    // Optionally, scroll to the bottom to always show the latest logs
    logsDiv.scrollTop = logsDiv.scrollHeight;
};

export function logErrorToDiv(message, source, lineno, colno, error) {
    var logsDiv = document.getElementById('logs');
    var logEntry = document.createElement('div');
    logEntry.textContent = 'Error: ' + message + ' at line ' + lineno + ' column ' + colno;
    logsDiv.appendChild(logEntry);

    // Optionally, scroll to the bottom to always show the latest logs
    logsDiv.scrollTop = logsDiv.scrollHeight;

    // Prevent the default browser error handling
    return true;
};

console.log = logToDiv;

window.onerror = logErrorToDiv;