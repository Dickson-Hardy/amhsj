# 🎯 AMJHS Dashboard Structures - Complete Overview

## 🏗️ **Dashboard Architecture Overview**

The AMJHS system implements a **role-based dashboard architecture** with separate layouts and components for each user role. Each dashboard provides a specialized interface tailored to the specific responsibilities and workflows of that role.

---

## 📊 **1. MAIN DASHBOARD (Entry Point)**

**File**: `/app/dashboard/page.tsx`
**Purpose**: Role-based routing hub that redirects users to their appropriate dashboard

### **Features**:
- **Route Guard**: Protects access to dashboard areas
- **Role Detection**: Automatically identifies user role from session
- **Smart Redirects**: Routes users to role-specific dashboards
- **Loading States**: Shows loading spinner during role detection

### **Role Routing Logic**:
```typescript
if (role === "author") → /author/dashboard
if (role === "editor" || "section-editor" || "managing-editor" || "editor-in-chief" → /editor/dashboard
if (role === "reviewer") → /reviewer/dashboard
if (role === "admin") → /admin/dashboard
```

---

## 👑 **2. ADMIN DASHBOARD**

**File**: `/app/admin/dashboard/page.tsx`
**Layout**: `/components/layouts/admin-layout.tsx`
**Access**: Admin users only

### **Dashboard Structure**:
```
📊 Overview Dashboard
├── System Statistics Cards
│   ├── Total Users
│   ├── Total Articles
│   ├── Pending Reviews
│   ├── Published This Month
│   ├── System Health
│   ├── Active Reviewers
│   ├── Pending Applications
│   └── Monthly Growth
├── Quick Actions
├── System Health Monitoring
└── Recent Activity Timeline
```

### **Navigation Menu**:
- **Dashboard** - System overview
- **User Management** - Manage users & roles
- **Submissions** - Review & manage articles
- **Reviewer Applications** - Approve reviewers
- **Reviewers** - Manage reviewer pool
- **News Management** - Manage announcements
- **Current Issue Management** - Set homepage current issue
- **DOI Management** - Manage DOI assignments
- **Archive Management** - Manage publication archive
- **SEO Settings** - Configure SEO

### **Key Features**:
- **Live System Stats** - Real-time system monitoring
- **Backup Management** - Database backup controls
- **User Analytics** - User growth and activity metrics
- **System Health** - Performance and uptime monitoring

---

## ✍️ **3. EDITOR DASHBOARD**

**File**: `/app/editor/dashboard/page.tsx`
**Layout**: `/components/layouts/editor-layout.tsx`
**Access**: Editor-in-Chief, Managing Editor, Section Editor, Production Editor, Guest Editor, Associate Editor

### **Dashboard Structure**:
```
📋 Editorial Dashboard
├── Section Selector (for multi-section editors)
├── Statistics Overview
│   ├── Total Submissions
│   ├── Pending Review
│   ├── Under Review
│   ├── Technical Check
│   ├── Pending Decision
│   ├── Published
│   └── Average Review Time
├── Recent Submissions Table
│   ├── Title & Author
│   ├── Submission Date
│   ├── Status & Priority
│   ├── Reviewers Assigned
│   ├── Days in Review
│   └── Action Buttons
└── Quick Actions
    ├── Assign Reviewers
    ├── Make Decisions
    ├── Send Notifications
    └── View Reports
```

### **Navigation Menu**:
- **Overview** - Editorial statistics
- **Submissions** - Manuscript management
- **Reviewers** - Reviewer assignment
- **Decisions** - Editorial decisions
- **Analytics** - Performance metrics

### **Key Features**:
- **Section Management** - Multi-section editing capabilities
- **Reviewer Assignment** - Automated and manual reviewer selection
- **Decision Workflow** - Structured editorial decision process
- **Performance Tracking** - Review time and quality metrics

---

## 👁️ **4. REVIEWER DASHBOARD**

**File**: `/app/reviewer/dashboard/page.tsx`
**Layout**: `/components/layouts/reviewer-layout.tsx`
**Access**: Peer reviewers

### **Dashboard Structure**:
```
🔍 Reviewer Dashboard
├── Statistics Overview
│   ├── Total Assigned
│   ├── Pending Reviews
│   ├── Completed Reviews
│   └── Overdue Reviews
├── Review Assignments Table
│   ├── Article Title
│   ├── Manuscript Number
│   ├── Status & Priority
│   ├── Due Date
│   ├── Days Remaining
│   └── Action Buttons
├── Review Guidelines
├── Performance Metrics
└── Quick Actions
    ├── Start Review
    ├── Submit Review
    ├── Request Extension
    └── View History
```

### **Navigation Menu**:
- **Dashboard** - Review overview
- **Assignments** - Active review assignments
- **Reviews** - Review management
- **Guidelines** - Review standards
- **Profile** - Reviewer profile

### **Key Features**:
- **Assignment Tracking** - Review deadline management
- **Status Monitoring** - Review progress tracking
- **Guideline Access** - Review standards and criteria
- **Performance Analytics** - Review quality metrics

---

## ✍️ **5. AUTHOR DASHBOARD**

**File**: `/app/author/dashboard/page.tsx`
**Layout**: `/components/layouts/author-layout.tsx`
**Access**: Research authors

### **Dashboard Structure**:
```
📚 Author Dashboard
├── Profile Completion Alert
├── Statistics Overview
│   ├── Total Submissions
│   ├── Under Review
│   ├── Published
│   ├── Total Downloads
│   ├── Average Citations
│   └── H-Index
├── Recent Submissions
│   ├── Title & Category
│   ├── Submission Date
│   ├── Status & Progress
│   ├── Action Required
│   └── Progress Bars
├── Research Analytics
├── Quick Actions
└── Help & Resources
    ├── Submission Guidelines
    ├── Help Documentation
    └── Contact Support
```

### **Navigation Menu**:
- **Overview** - Research summary
- **My Research** - Submission management
- **Analytics** - Impact metrics
- **Messages** - Communication center
- **Profile** - Author profile
- **Help** - Guidelines and support

### **Key Features**:
- **Submission Tracking** - Manuscript status monitoring
- **Progress Visualization** - Submission workflow progress
- **Impact Metrics** - Download and citation tracking
- **Profile Management** - Author profile completion

---

## 🎨 **6. DASHBOARD DESIGN SYSTEM**

### **Layout Components**:
- **Fixed Sidebar**: Collapsible navigation with role-specific menu items
- **Header Bar**: Dynamic titles, search, and quick actions
- **Content Area**: Tabbed interface with role-specific content
- **Responsive Design**: Mobile-optimized layouts

### **Color Scheme**:
- **Primary**: Indigo to Purple gradients
- **Status Colors**: 
  - Blue (info), Green (success), Amber (warning), Red (urgent)
- **Neutral**: Slate tones for backgrounds and text

### **Interactive Elements**:
- **Hover Effects**: Enhanced user experience
- **Smooth Transitions**: State change animations
- **Active States**: Navigation highlighting
- **Loading States**: Data fetching indicators

---

## 🔧 **7. TECHNICAL IMPLEMENTATION**

### **Component Architecture**:
```
Dashboard System
├── Route Guards (Authentication & Authorization)
├── Layout Components (Role-specific layouts)
├── Dashboard Pages (Main content)
├── UI Components (Cards, Tables, Charts)
├── Data Fetching (API integration)
└── State Management (React hooks)
```

### **Key Technologies**:
- **Next.js 15+** - App Router architecture
- **React Hooks** - State and effect management
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library
- **NextAuth.js** - Authentication system
- **Drizzle ORM** - Database operations

### **Data Flow**:
1. **Session Check** - Verify user authentication
2. **Role Validation** - Check user permissions
3. **Data Fetching** - Load role-specific data
4. **State Management** - Update dashboard state
5. **UI Rendering** - Display dashboard content

---

## 📱 **8. RESPONSIVE DESIGN**

### **Breakpoint Strategy**:
- **Desktop**: Full sidebar with expanded navigation
- **Tablet**: Collapsible sidebar with icon labels
- **Mobile**: Overlay sidebar with hamburger menu

### **Mobile Optimizations**:
- **Touch-friendly** button sizing
- **Swipe gestures** for navigation
- **Optimized layouts** for small screens
- **Progressive disclosure** of information

---

## 🚀 **9. FUTURE ENHANCEMENTS**

### **Planned Features**:
- **Real-time Updates** - WebSocket integration
- **Advanced Analytics** - Interactive charts and graphs
- **AI-powered Insights** - Automated recommendations
- **Mobile App** - Native mobile experience
- **Offline Support** - Progressive web app features

### **Performance Optimizations**:
- **Lazy Loading** - Component and data lazy loading
- **Caching Strategy** - Intelligent data caching
- **Bundle Optimization** - Code splitting and tree shaking
- **Image Optimization** - Next.js image optimization

---

## 📋 **10. DASHBOARD COMPARISON MATRIX**

| Feature | Admin | Editor | Reviewer | Author |
|---------|-------|--------|----------|--------|
| **User Management** | ✅ Full | ❌ None | ❌ None | ❌ None |
| **System Monitoring** | ✅ Full | ❌ None | ❌ None | ❌ None |
| **Submission Management** | ✅ Full | ✅ Full | ❌ None | ✅ Own Only |
| **Review Assignment** | ✅ Full | ✅ Full | ❌ None | ❌ None |
| **Review Management** | ✅ Full | ✅ Full | ✅ Own Only | ❌ None |
| **Analytics** | ✅ System | ✅ Editorial | ✅ Personal | ✅ Personal |
| **Settings** | ✅ Full | ✅ Limited | ✅ Limited | ✅ Limited |

---

## 🎯 **SUMMARY**

The AMJHS dashboard system provides a **comprehensive, role-based interface** that:

✅ **Adapts to user roles** with specialized layouts and features  
✅ **Maintains consistency** through shared design patterns  
✅ **Optimizes workflows** for each user type  
✅ **Ensures security** through role-based access control  
✅ **Provides scalability** for future enhancements  
✅ **Delivers performance** through optimized rendering  

Each dashboard is designed to **maximize productivity** while maintaining **intuitive usability** for researchers, editors, reviewers, and administrators in the academic journal ecosystem.
