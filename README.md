# �️ PyxMAFIA - Product Authentication & Anti-Counterfeiting Platform

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-MERN%20Stack-61DAFB?style=for-the-badge&logo=react" alt="MERN Stack"/>
  <img src="https://img.shields.io/badge/Security-QR%20Based-4CAF50?style=for-the-badge&logo=shield" alt="Security"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  <strong>A decentralized solution for combating counterfeit products through blockchain-inspired QR verification</strong>
</p>

---

## 📖 Project Overview

**PyxMAFIA** (Product Authentication via Smart Integrated Anti-Fraud System) is a comprehensive web-based platform designed to combat the growing menace of counterfeit products in the market. Using secure QR code technology, real-time fraud detection algorithms, and comprehensive audit logging, PyxMAFIA empowers vendors to protect their products and enables consumers to verify authenticity instantly.

### 🎯 The Problem We Solve

Counterfeit products cost the global economy billions annually and pose serious risks to consumers:
- ❌ Fake medicines endangering lives
- ❌ Counterfeit electronics causing safety hazards
- ❌ Fraudulent luxury goods damaging brand reputation
- ❌ Loss of revenue for legitimate businesses

### ✨ Our Solution

PyxMAFIA provides a tamper-proof, easy-to-verify system where:
- ✅ Vendors generate unique, cryptographically-secure QR codes for each product batch
- ✅ Consumers scan QR codes to instantly verify product authenticity
- ✅ AI-powered fraud detection identifies suspicious scanning patterns
- ✅ Complete audit trail tracks every verification attempt
- ✅ Admin dashboard provides comprehensive oversight

---

## 👥 Who Can Use PyxMAFIA?

### 🏭 **Vendors & Manufacturers**
- Small to medium businesses producing physical goods
- Pharmaceutical companies ensuring drug authenticity
- Luxury brands protecting against counterfeits
- Electronics manufacturers preventing gray market sales
- Food & beverage companies ensuring supply chain integrity

### 🛒 **Consumers & End-Users**
- Anyone purchasing products wanting to verify authenticity
- Retailers checking supplier legitimacy
- Distributors ensuring genuine products in their inventory

### 👨‍💼 **Platform Administrators**
- System moderators managing vendor accounts
- Compliance officers monitoring suspicious activities
- Analytics teams tracking verification patterns

---

## 🚀 Key Features & Advantages

### For Vendors
- 🔐 **Secure QR Generation** - Cryptographically unique codes using 256-bit encryption
- 📊 **Product Management Dashboard** - Track all products, batches, and verification stats
- 🎯 **Activation Control** - Products only become verifiable when you activate them
- 🔔 **Real-time Alerts** - Get notified of suspicious scanning patterns
- 📈 **Analytics** - View verification counts, locations, and trends

### For Consumers
- ⚡ **Instant Verification** - Scan and verify in under 3 seconds
- 📱 **Mobile-Friendly** - Works on any smartphone browser
- 🌐 **No App Required** - Web-based QR scanner
- 📍 **Geo-tracking** - See where products are being verified
- ✅ **Clear Status** - Valid, Used, Blocked, or Invalid indicators

### For Admins
- 👥 **User Management** - Manage vendor and user accounts
- 🔍 **Audit Logs** - Complete trail of all scans with IP and location data
- 🚨 **Fraud Detection** - Automatic blocking of suspicious QR codes
- 📊 **System-wide Analytics** - Monitor platform health and usage

### Security & Fraud Prevention
- 🛡️ **Multi-layer Detection** - Identifies rapid repeat scans, multi-IP access, and geographic anomalies
- 🔒 **Token-based Authentication** - JWT with httpOnly cookies
- 🌍 **IP & Geo-tracking** - Monitor scanning location patterns
- 🚫 **Automatic Blocking** - Suspicious QR codes blocked automatically
- 📝 **Immutable Audit Trail** - Every scan logged with timestamp, IP, and user agent

---

## 🏗️ Tech Stack

### Frontend
- ⚛️ **React 19** - Modern UI framework
- 🎨 **Tailwind CSS 4** - Utility-first styling
- 🛣️ **React Router** - Client-side routing
- 📱 **HTML5-QRCode** - Native QR scanning
- 🔥 **React Hot Toast** - Beautiful notifications

### Backend
- 🟢 **Node.js & Express** - RESTful API server
- 🍃 **MongoDB & Mongoose** - NoSQL database
- 🔐 **JWT & bcrypt** - Authentication & encryption
- 📦 **Cloudinary** - QR code image storage
- 🌍 **GeoIP-lite** - IP-based location tracking

### DevOps & Tools
- 📦 **Vite** - Lightning-fast build tool
- 🔧 **ESLint** - Code quality
- 🚀 **Nodemon** - Development auto-reload

---

## 🔄 How It Works

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   1. Vendor     │───▶│   2. Generate   │───▶│   3. Attach QR  │
│   Creates       │    │   Unique QR     │    │   to Product    │
│   Product       │    │   Code          │    │   Packaging     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   6. System     │◀───│   5. Verify     │◀───│   4. Consumer   │
│   Logs Scan &   │    │   Against       │    │   Scans QR      │
│   Detects Fraud │    │   Database      │    │   Code          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎓 CivoraX Internship Program 2025-26

<p align="center">
  <img src="https://internship.civoranexus.com/CivoraX.png" alt="CivoraX Logo" width="150"/>
</p>

This project is developed as part of the CivoraX Internship Program, where interns gain hands-on experience building production-ready applications.

<p align="center">
  <img src="https://img.shields.io/badge/Duration-5%20Weeks-blue" alt="Duration"/>
  <img src="https://img.shields.io/badge/Start%20Date-Jan%205%2C%202026-green" alt="Start Date"/>
  <img src="https://img.shields.io/badge/End%20Date-Feb%208%2C%202026-orange" alt="End Date"/>
  <img src="https://img.shields.io/badge/Mode-Remote--First-purple" alt="Mode"/>
</p>

---

---

## 📊 Program Statistics

| Metric | Value |
|--------|-------|
| 🎓 Interns Trained | 300+ |
| 💼 Live Projects | 20 |
| ⏱️ Program Duration | 5 Weeks |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB instance (local or cloud)
- Cloudinary account for image storage

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/civorax/FSD117-PYxMAFIA.git
cd FSD117-PYxMAFIA
```

2. **Setup Backend**
```bash
cd src/backend
npm install

# Create .env file with:
# PORT=3000
# MONGODB_URI=your_mongodb_connection_string
# jwt_secret=your_jwt_secret_key
# NODE_ENV=development
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
# CORS_ORIGIN=http://localhost:5173

npm run dev
```

3. **Setup Frontend**
```bash
cd src/frontend
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:3000/api

npm run dev
```

4. **Create Admin User**
```bash
cd src/backend
node src/scripts/createAdmin.js
```

### Usage

1. **Vendor Registration**: Sign up as a vendor to start creating products
2. **Create Products**: Add product details including batch info and expiry dates
3. **Generate QR Codes**: System automatically generates secure QR codes
4. **Activate Products**: Activate QR codes when products are ready for market
5. **Consumer Verification**: Share QR codes for customers to scan and verify

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


## 📅 Program Details

| Detail | Information |
|--------|-------------|
| **Duration** | 5-week intensive program |
| **Dates** | January 5 - February 8, 2026 |
| **Format** | Remote-first with live sessions and workshops |
| **Structure** | Real-time project work with weekly milestones |

---

## ✅ Eligibility Criteria

- ✔️ Students from **any year or degree program**
- ✔️ Recent graduates and **career switchers** welcome
- ✔️ **Basic programming knowledge** required
- ✔️ Strong **passion for technology** and learning

---

## 🛠️ Technologies You'll Master

| Category | Technologies |
|----------|-------------|
| **Frontend** | React, Next.js |
| **Backend** | Node.js, Python |
| **Advanced** | AI & Machine Learning |
| **Infrastructure** | Cloud & DevOps |
| **Mobile** | Cross-platform Development |
| **Database** | SQL & NoSQL Systems |
| **APIs** | RESTful & GraphQL |
| **Workflow** | Agile & Git |

---

## 📋 Application Process

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   01. Register  │───▶│  02. Team       │───▶│  03. Receive    │
│   Online        │    │  Review         │    │  Confirmation   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **📝 Register Online** - Complete your application form with details and preferences
2. **🔍 CivoraX Team Review** - Our team reviews your application and qualifications
3. **✉️ Eligibility Email** - Receive confirmation email if selected




## 📞 Contact Information

| Channel | Details |
|---------|---------|
| 📧 **Email** | [contact@civoranexus.com](mailto:contact@civoranexus.com) |
| 📱 **Phone** | [+91 7350675192](tel:+917350675192) |
| 📍 **Location** | 422605, Sangamner, Maharashtra, India |

### 🔗 Social Links

[![LinkedIn](https://img.shields.io/badge/LinkedIn-CivoraX-blue?style=flat&logo=linkedin)](https://www.linkedin.com/company/civoranexus)
[![Instagram](https://img.shields.io/badge/Instagram-CivoraX-E4405F?style=flat&logo=instagram)](https://www.instagram.com/civoranexus)
[![Twitter](https://img.shields.io/badge/Twitter-CivoraX-1DA1F2?style=flat&logo=twitter)](https://twitter.com/civoranexus)
[![YouTube](https://img.shields.io/badge/YouTube-CivoraX-FF0000?style=flat&logo=youtube)](https://www.youtube.com/@civoranexus)

---

## 🏢 About Civora Nexus

**Civora Nexus Pvt. Ltd.** is a technology company empowering communities through innovative civic and healthcare technology solutions.

### Company Services:
- 🔄 Digital Transformation for Businesses
- 🏘️ Smart Community & Enterprise Solutions
- 💡 Affordable Tech Solutions
- 📊 Data Analytics & Business Insights
- 🎓 Innovation & Skill Development
- 🤖 AI & Automation Solutions

---

## 📚 Quick Links

- 🌐 [Official Website](https://civoranexus.com/)
- 📋 [Internship Portal](https://civoranexus.com/internships)
- 🔐 [Certificate Verification](https://internship.civoranexus.com)
- 📄 [Privacy Policy](https://civoranexus.com/privacy-policy)
- 📜 [Terms of Service](https://civoranexus.com/terms-and-conditions)



<p align="center">
  <strong>© 2025 Civora Nexus Pvt. Ltd. All rights reserved.</strong>
</p>

<p align="center">
  Made with ❤️ by CivoraX Team
</p>


