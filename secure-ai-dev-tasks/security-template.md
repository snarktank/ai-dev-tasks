# 🔐 Security Template for AI Dev Tasks

## Overview

This template provides comprehensive security considerations, requirements, and controls that should be integrated into every development task, PRD, and implementation phase. Use this as a checklist and reference guide to ensure security is built-in from the start.

---

## 🛡️ Security Considerations

### 1. **Threat Modeling**
- [ ] Identify potential threat actors (internal, external, privileged users)
- [ ] Map attack vectors specific to the feature/component
- [ ] Analyze data flow and identify sensitive touch points
- [ ] Consider STRIDE threats (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
- [ ] Document assumptions about the security environment

### 2. **Data Classification & Handling**
- [ ] Classify data sensitivity levels (Public, Internal, Confidential, Restricted)
- [ ] Define data retention and disposal requirements
- [ ] Identify PII, PHI, financial, or other regulated data
- [ ] Document data lineage and transformation requirements
- [ ] Consider data residency and sovereignty requirements

### 3. **Attack Surface Analysis**
- [ ] Map all entry/exit points (APIs, UI inputs, file uploads, etc.)
- [ ] Identify trust boundaries and privilege levels
- [ ] Analyze dependencies and third-party integrations
- [ ] Consider supply chain security risks
- [ ] Document network exposure and communication paths

---

## 📋 Security Requirements

### 1. **Authentication & Authorization**
- [ ] **Multi-Factor Authentication (MFA)** required for privileged operations
- [ ] **Role-Based Access Control (RBAC)** or Attribute-Based Access Control (ABAC)
- [ ] **Principle of Least Privilege** enforcement
- [ ] **Session management** with secure timeouts and renewal
- [ ] **Account lockout** mechanisms for failed authentication attempts
- [ ] **Password policy** enforcement (complexity, history, rotation)

### 2. **Input Validation & Sanitization**
- [ ] **Server-side validation** for all inputs (never trust client-side only)
- [ ] **Parameterized queries** to prevent SQL injection
- [ ] **Output encoding** to prevent XSS attacks
- [ ] **File upload validation** (type, size, content scanning)
- [ ] **API rate limiting** and throttling
- [ ] **CSRF protection** for state-changing operations

### 3. **Data Protection**
- [ ] **Encryption at rest** for sensitive data (AES-256 or equivalent)
- [ ] **Encryption in transit** (TLS 1.3, perfect forward secrecy)
- [ ] **Key management** with proper rotation and escrow
- [ ] **Data masking/tokenization** for non-production environments
- [ ] **Secure deletion** capabilities
- [ ] **Database security** (encrypted connections, least privilege access)

### 4. **Communication Security**
- [ ] **HTTPS enforcement** with HSTS headers
- [ ] **Certificate pinning** for critical communications
- [ ] **API security** (OAuth 2.1, JWT with proper validation)
- [ ] **CORS policy** properly configured
- [ ] **Content Security Policy (CSP)** headers
- [ ] **Secure headers** (X-Frame-Options, X-Content-Type-Options, etc.)

---

## 🏗️ Security Architecture

### 1. **Defense in Depth**
- [ ] **Perimeter security** (firewalls, WAF, DDoS protection)
- [ ] **Network segmentation** and micro-segmentation
- [ ] **Host-based security** (EDR, hardening, patch management)
- [ ] **Application-level security** controls
- [ ] **Data-level security** (encryption, access controls)

### 2. **Zero Trust Architecture**
- [ ] **Identity verification** for every access request
- [ ] **Device trust assessment** and compliance checking
- [ ] **Micro-segmentation** with least privilege network access
- [ ] **Continuous monitoring** and adaptive security posture
- [ ] **Encrypted communications** for all traffic

### 3. **Secure Development Architecture**
- [ ] **Security by design** principles embedded
- [ ] **Fail-secure** defaults and error handling
- [ ] **Separation of duties** in critical processes
- [ ] **Secure configuration management**
- [ ] **Infrastructure as Code** with security scanning

---

## ⚠️ Security Risk Assessment

### 1. **Risk Identification Matrix**

| Risk Category | Likelihood | Impact | Risk Level | Mitigation Priority |
|---------------|------------|---------|------------|-------------------|
| Data Breach | High/Med/Low | High/Med/Low | Critical/High/Med/Low | P0/P1/P2/P3 |
| Unauthorized Access | | | | |
| Data Loss | | | | |
| Service Disruption | | | | |
| Compliance Violation | | | | |
| Supply Chain Attack | | | | |

### 2. **Business Impact Assessment**
- [ ] **Financial impact** (revenue loss, fines, remediation costs)
- [ ] **Reputational damage** and customer trust impact
- [ ] **Operational disruption** and recovery time objectives
- [ ] **Legal and regulatory consequences**
- [ ] **Customer data exposure** and notification requirements

### 3. **Technical Risk Factors**
- [ ] **Complexity of implementation** vs security trade-offs
- [ ] **Third-party dependencies** and their security posture
- [ ] **Legacy system integration** risks
- [ ] **Scalability impact** on security controls
- [ ] **Performance vs security** balance considerations

---

## 👤 Security-Conscious User Experience

### 1. **Usable Security Design**
- [ ] **Clear security messaging** without technical jargon
- [ ] **Progressive security** (don't overwhelm with all controls at once)
- [ ] **Security transparency** (explain why security measures exist)
- [ ] **Frictionless secure workflows** (SSO, biometrics, smart defaults)
- [ ] **Clear error messages** that don't reveal sensitive information

### 2. **Privacy by Design**
- [ ] **Minimal data collection** (collect only what's necessary)
- [ ] **Clear consent mechanisms** with granular choices
- [ ] **Data portability** and user control features
- [ ] **Privacy dashboard** for user data management
- [ ] **Opt-out capabilities** clearly accessible

### 3. **Accessibility & Security**
- [ ] **Screen reader compatibility** for security controls
- [ ] **Alternative authentication methods** for users with disabilities
- [ ] **Clear visual indicators** for security status
- [ ] **Keyboard navigation** for security features
- [ ] **Plain language** security communications

---

## 🔧 Security Operations

### 1. **Monitoring & Detection**
- [ ] **Security Information and Event Management (SIEM)** integration
- [ ] **Real-time threat detection** and alerting
- [ ] **User behavior analytics** for anomaly detection
- [ ] **Application performance monitoring** with security metrics
- [ ] **Log aggregation** and secure log storage

### 2. **Incident Response**
- [ ] **Incident response plan** specific to the feature/component
- [ ] **Automated containment** capabilities
- [ ] **Forensic data preservation** mechanisms
- [ ] **Communication templates** for security incidents
- [ ] **Recovery procedures** and rollback capabilities

### 3. **Vulnerability Management**
- [ ] **Regular security scanning** (SAST, DAST, SCA)
- [ ] **Penetration testing** schedule and scope
- [ ] **Bug bounty program** integration
- [ ] **Patch management** process and timelines
- [ ] **Zero-day response** procedures

### 4. **Security Metrics & KPIs**
- [ ] **Mean Time to Detection (MTTD)** for security events
- [ ] **Mean Time to Response (MTTR)** for incidents
- [ ] **Vulnerability remediation SLAs**
- [ ] **Security training completion rates**
- [ ] **Phishing simulation results**

---

## 🔒 Privacy Requirements

### 1. **Data Privacy Principles**
- [ ] **Lawfulness, fairness, and transparency** in data processing
- [ ] **Purpose limitation** (data used only for stated purposes)
- [ ] **Data minimization** (collect and process only necessary data)
- [ ] **Accuracy** and data quality maintenance
- [ ] **Storage limitation** (retain only as long as necessary)
- [ ] **Integrity and confidentiality** protection

### 2. **Privacy Rights Implementation**
- [ ] **Right to access** (data subject access requests)
- [ ] **Right to rectification** (data correction capabilities)
- [ ] **Right to erasure** ("right to be forgotten")
- [ ] **Right to restrict processing**
- [ ] **Right to data portability**
- [ ] **Right to object** to certain processing

### 3. **Privacy Impact Assessment (PIA)**
- [ ] **Data flow mapping** and processing activities
- [ ] **Legal basis** for each type of processing
- [ ] **Privacy risk assessment** and mitigation measures
- [ ] **Data Protection Officer (DPO)** consultation
- [ ] **Cross-border transfer** safeguards

---

## ⚖️ Governance, Risk & Compliance (GRC)

### 1. **Regulatory Compliance**
- [ ] **GDPR** (General Data Protection Regulation) - EU
- [ ] **CCPA/CPRA** (California Consumer Privacy Act) - US
- [ ] **HIPAA** (Health Insurance Portability and Accountability Act) - Healthcare
- [ ] **PCI DSS** (Payment Card Industry Data Security Standard) - Payments
- [ ] **SOX** (Sarbanes-Oxley Act) - Financial reporting
- [ ] **ISO 27001** - Information Security Management
- [ ] **SOC 2** - Security, Availability, and Confidentiality

### 2. **Policy & Procedure Alignment**
- [ ] **Information Security Policy** compliance
- [ ] **Data Classification Policy** adherence
- [ ] **Access Control Policy** implementation
- [ ] **Incident Response Policy** integration
- [ ] **Change Management** security controls
- [ ] **Vendor Risk Management** requirements

### 3. **Audit & Documentation Requirements**
- [ ] **Security control documentation** and evidence
- [ ] **Risk assessment** documentation
- [ ] **Security testing** results and remediation
- [ ] **Training and awareness** records
- [ ] **Configuration baselines** and change logs
- [ ] **Compliance reporting** capabilities

---

## 🛠️ Security Controls Design

### 1. **Preventive Controls**
- [ ] **Access controls** (authentication, authorization)
- [ ] **Input validation** and sanitization
- [ ] **Encryption** and key management
- [ ] **Network security** (firewalls, segmentation)
- [ ] **Secure coding** practices and standards

### 2. **Detective Controls**
- [ ] **Logging and monitoring** systems
- [ ] **Intrusion detection** systems (IDS/IPS)
- [ ] **Security scanning** and vulnerability assessment
- [ ] **Audit trails** and forensic capabilities
- [ ] **Anomaly detection** and behavioral analysis

### 3. **Corrective Controls**
- [ ] **Incident response** procedures
- [ ] **Patch management** processes
- [ ] **Backup and recovery** systems
- [ ] **Business continuity** planning
- [ ] **Disaster recovery** capabilities

### 4. **Compensating Controls**
- [ ] **Additional monitoring** when primary controls are limited
- [ ] **Manual verification** processes
- [ ] **Alternative authentication** methods
- [ ] **Enhanced logging** and review procedures
- [ ] **Temporary security measures** during maintenance

---

## 🔄 Security Integration Checklist

### For PRD Creation:
- [ ] Include threat model in PRD requirements
- [ ] Define security acceptance criteria
- [ ] Specify compliance requirements
- [ ] Document privacy considerations
- [ ] Include security testing requirements

### For Task Generation:
- [ ] Add security review tasks for each feature
- [ ] Include security testing sub-tasks
- [ ] Add compliance verification steps
- [ ] Include threat modeling activities
- [ ] Add security documentation tasks

### For Task Implementation:
- [ ] Security code review before marking complete
- [ ] Security testing execution and results
- [ ] Compliance validation checkpoint
- [ ] Privacy impact assessment review
- [ ] Security documentation update

---

## 📚 Security Resources & References

### Security Frameworks
- **NIST Cybersecurity Framework**: [https://www.nist.gov/cyberframework](https://www.nist.gov/cyberframework)
- **OWASP Top 10**: [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
- **SANS Top 25**: [https://www.sans.org/top25-software-errors/](https://www.sans.org/top25-software-errors/)
- **ISO 27001/27002**: Information Security Management Standards
- **NIST SP 800-53**: Security and Privacy Controls for Federal Information Systems

### Development Security
- **OWASP SAMM**: Software Assurance Maturity Model
- **BSIMM**: Building Security In Maturity Model
- **Microsoft SDL**: Security Development Lifecycle
- **Google Security by Design**: [https://cloud.google.com/security/security-design-principles](https://cloud.google.com/security/security-design-principles)

### Privacy Resources
- **GDPR Guidelines**: [https://gdpr.eu/](https://gdpr.eu/)
- **NIST Privacy Framework**: [https://www.nist.gov/privacy-framework](https://www.nist.gov/privacy-framework)
- **Privacy by Design**: [https://www.ipc.on.ca/wp-content/uploads/resources/7foundationalprinciples.pdf](https://www.ipc.on.ca/wp-content/uploads/resources/7foundationalprinciples.pdf)

---

## 🎯 Implementation Notes

1. **Customize for your context**: Adapt this template based on your specific technology stack, regulatory environment, and risk profile.

2. **Progressive implementation**: Don't try to implement all controls at once. Prioritize based on risk assessment and business requirements.

3. **Regular updates**: Security requirements evolve. Review and update this template regularly based on new threats, regulations, and best practices.

4. **Team training**: Ensure all team members understand these security requirements and their role in implementation.

5. **Security champions**: Designate security champions within development teams to promote security best practices.

6. **Continuous improvement**: Use security incidents and findings to improve this template and associated processes.

---

**Remember**: Security is not a checkbox exercise. It requires ongoing attention, continuous improvement, and a culture that values security as a fundamental requirement, not an afterthought. 