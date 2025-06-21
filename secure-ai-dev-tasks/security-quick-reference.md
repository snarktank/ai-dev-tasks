# 🔒 Security Quick Reference Guide

## 🎯 Essential Security Checklist for Every Task

### Before Starting Any Development Task:
- [ ] Review threat model and security requirements
- [ ] Understand data classification and sensitivity
- [ ] Identify applicable compliance requirements
- [ ] Confirm security tools and environment are ready

### During Implementation:
- [ ] Apply input validation and sanitization
- [ ] Implement proper authentication/authorization
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Apply output encoding (prevent XSS)
- [ ] Implement secure error handling
- [ ] Add security logging for audit trails

### Before Marking Task Complete:
- [ ] Run security tests (unit, integration, SAST)
- [ ] Validate security controls are working
- [ ] Update security documentation
- [ ] Verify compliance requirements are met
- [ ] Get security review approval

---

## 🛡️ Critical Security Controls by Category

### **Authentication & Authorization**
```
✅ Multi-factor authentication for privileged operations
✅ Role-based access control (RBAC)
✅ Principle of least privilege
✅ Secure session management
✅ Account lockout mechanisms
```

### **Input Validation**
```
✅ Server-side validation (never trust client-side only)
✅ Parameterized queries for database operations
✅ File upload validation (type, size, content)
✅ API rate limiting and throttling
✅ CSRF protection for state-changing operations
```

### **Data Protection**
```
✅ Encryption at rest (AES-256 or equivalent)
✅ Encryption in transit (TLS 1.3)
✅ Proper key management with rotation
✅ Data masking in non-production environments
✅ Secure deletion capabilities
```

### **Communication Security**
```
✅ HTTPS enforcement with HSTS headers
✅ Certificate pinning for critical communications
✅ OAuth 2.1 / JWT with proper validation
✅ CORS policy properly configured
✅ Content Security Policy (CSP) headers
```

---

## ⚠️ Common Security Vulnerabilities to Avoid

### **OWASP Top 10 Quick Check**
1. **Broken Access Control** → Implement proper authorization checks
2. **Cryptographic Failures** → Use strong encryption and key management
3. **Injection** → Use parameterized queries and input validation
4. **Insecure Design** → Follow secure design principles and threat modeling
5. **Security Misconfiguration** → Apply security hardening and secure defaults
6. **Vulnerable Components** → Keep dependencies updated and scan for vulnerabilities
7. **Authentication Failures** → Implement strong authentication and session management
8. **Software/Data Integrity Failures** → Verify integrity of code and data
9. **Logging/Monitoring Failures** → Implement comprehensive security logging
10. **SSRF** → Validate and sanitize URLs and network requests

---

## 🔍 Security Testing Quick Commands

### **Static Analysis (SAST)**
```bash
# Example commands - adapt to your tools
npm run security:scan
npm audit
semgrep --config=auto .
```

### **Dependency Scanning (SCA)**
```bash
npm audit
snyk test
safety check  # for Python
```

### **Security Tests**
```bash
npm run test:security
npm run test:auth
npm run test:validation
```

---

## 📋 Privacy & Compliance Quick Check

### **GDPR Compliance**
- [ ] Lawful basis for data processing identified
- [ ] Data subject consent mechanisms implemented
- [ ] Right to access functionality provided
- [ ] Right to erasure ("right to be forgotten") implemented
- [ ] Data portability features available
- [ ] Privacy policy updated

### **HIPAA Compliance (Healthcare)**
- [ ] PHI encryption at rest and in transit
- [ ] Access controls for PHI access
- [ ] Audit logging for PHI access
- [ ] Business Associate Agreements in place
- [ ] Risk assessment completed

### **PCI DSS Compliance (Payments)**
- [ ] Cardholder data encryption
- [ ] Network segmentation implemented
- [ ] Strong access control measures
- [ ] Regular security monitoring
- [ ] Vulnerability management program

---

## 🚨 Security Incident Response Quick Actions

### **If You Discover a Security Issue:**

**🛑 Critical/High Risk:**
1. Stop work immediately
2. Document the issue
3. Escalate to security team
4. Do not deploy affected code

**⚠️ Medium Risk:**
1. Document the issue in detail
2. Implement compensating controls
3. Create remediation plan
4. Continue with caution

**📝 Low Risk:**
1. Document in issue tracker
2. Plan remediation in next sprint
3. Monitor for escalation
4. Continue development

---

## 🔧 Security Tools Integration

### **IDE/Editor Extensions**
- SonarLint (security code analysis)
- ESLint security rules
- Security-focused linters for your language

### **CI/CD Pipeline Security**
- SAST scanning (e.g., CodeQL, SonarQube)
- Dependency scanning (e.g., Snyk, npm audit)
- Container scanning (e.g., Trivy, Clair)
- Secret scanning (e.g., GitLeaks, TruffleHog)

### **Runtime Security**
- Application security monitoring
- Runtime application self-protection (RASP)
- Security information and event management (SIEM)

---

## 📊 Security Metrics to Track

### **Development Metrics**
- Security test coverage: aim for >80%
- SAST scan pass rate: aim for >95%
- Vulnerability remediation time: <7 days for high/critical
- Security review completion: 100% before deployment

### **Operational Metrics**
- Mean time to detection (MTTD): <1 hour for critical events
- Mean time to response (MTTR): <4 hours for critical incidents
- Security training completion: 100% annually
- Compliance audit readiness: continuous

---

## 🎓 Security Learning Resources

### **Quick Learning Paths**
1. **OWASP Top 10** - Learn the most critical web security risks
2. **Secure Coding Practices** - Language-specific security guidelines  
3. **Threat Modeling** - Learn to think like an attacker
4. **Privacy by Design** - Understand privacy principles
5. **Incident Response** - Know how to respond to security events

### **Hands-On Practice**
- OWASP WebGoat (web application security)
- DVWA (Damn Vulnerable Web Application)
- Security CTF challenges
- Bug bounty programs (for advanced practitioners)

---

## 🔄 Security Maintenance Schedule

### **Daily**
- [ ] Review security alerts and notifications
- [ ] Check dependency vulnerability reports
- [ ] Monitor security test results

### **Weekly**
- [ ] Review security scan results
- [ ] Update security documentation
- [ ] Conduct security code reviews

### **Monthly**
- [ ] Review and update threat models
- [ ] Analyze security metrics and trends
- [ ] Update security training materials

### **Quarterly**
- [ ] Conduct security architecture reviews
- [ ] Update compliance documentation
- [ ] Review and test incident response procedures

---

## ⚡ Security Emergency Contacts

**Keep these handy for security incidents:**

```
🚨 Security Team: [security@company.com]
🔒 Privacy Officer: [privacy@company.com]  
⚖️ Compliance Team: [compliance@company.com]
🆘 Emergency Escalation: [emergency@company.com]
```

---

## 🎯 Remember: Security is Everyone's Responsibility

- **Think Security First:** Consider security implications before coding
- **Validate Everything:** Never trust user input or external data
- **Document Decisions:** Record security choices and trade-offs
- **Stay Updated:** Keep security knowledge and tools current
- **Ask for Help:** When in doubt, consult security experts

**"Security is not a product, but a process."** - Bruce Schneier 