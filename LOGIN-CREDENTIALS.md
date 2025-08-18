# 🔑 AMJHS Login Credentials - Quick Reference

## Default Password for ALL accounts: Set in environment variables

⚠️ **Important**: Change these passwords in production!

---

## 🏛️ ADMIN ACCOUNTS

| Role | Email | Name | Access Level |
|------|-------|------|-------------|
| **System Admin** | `admin@amhsj.org` | System Administrator | Full system control |

---

## 📝 EDITORIAL TEAM

| Position | Email | Name | Affiliation | Expertise |
|----------|-------|------|-------------|-----------|
| **Editor-in-Chief** | `eic@amhsj.org` | Dr. Sarah Johnson | Harvard Medical School | Cardiovascular Medicine |
| **Managing Editor** | `managing@amhsj.org` | Dr. Michael Chen | Johns Hopkins University | Editorial Management |
| **Section Editor** | `cardiology.editor@amhsj.org` | Dr. Elizabeth Williams | Mayo Clinic | Cardiology |
| **Production Editor** | `production@amhsj.org` | Dr. Lisa Thompson | Stanford University | Quality Assurance |
| **Guest Editor** | `guest.ai@amhsj.org` | Dr. Ahmed Hassan | UCSF | AI in Healthcare |
| **Associate Editor** | `associate1@amhsj.org` | Dr. James Wilson | Cleveland Clinic | Internal Medicine |

---

## 👥 REVIEWERS

| Role | Email | Name | Affiliation | Expertise |
|------|-------|------|-------------|-----------|
| **Senior Reviewer** | `reviewer1@amhsj.org` | Dr. David Kim | University of Chicago | Oncology Research |

---

## ✍️ AUTHORS

| Role | Email | Name | Affiliation | Research Focus |
|------|-------|------|-------------|----------------|
| **Research Author** | `author1@example.org` | Dr. Rachel Martinez | UT MD Anderson | Pediatric Medicine |

---

## 🚪 Quick Access URLs

- **Main Site**: `http://localhost:3000`
- **Login**: `http://localhost:3000/auth/login`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Editor Dashboard**: `http://localhost:3000/dashboard`
- **Reviewer Dashboard**: `http://localhost:3000/reviewer`
- **Author Dashboard**: `http://localhost:3000/dashboard`

---

## 🔄 Role Hierarchy Flow

```
ADMIN (System Control)
    ↓
EDITOR (Editorial Control)
    ├── Editor-in-Chief (Final Authority)
    ├── Managing Editor (Operations)
    ├── Section Editor (Subject Expertise)
    ├── Production Editor (Quality)
    ├── Guest Editor (Special Issues)
    └── Associate Editor (Support)
    ↓
REVIEWER (Manuscript Evaluation)
    ↓
AUTHOR (Content Creation)
```

---

## 📊 Database Stats

- **Total Users**: 11
- **Admins**: 2
- **Editors**: 6  
- **Reviewers**: 1
- **Authors**: 2

---

## 🛠️ Testing Commands

```bash
# Verify all users
node scripts/verify-users.cjs

# Setup additional roles (if needed)
npm run setup-roles

# Start development server
pnpm dev
```

---

**Last Updated**: August 10, 2025  
**Status**: ✅ All accounts active and verified
