# 🔐 Role Management System Guide

## 📋 Overview

This guide explains the role management system implemented for the editorial assistant workflow, including role constraints and switching capabilities.

## 🎯 Key Requirements

1. **Admin can create users with any role** ✅
2. **Only ONE editorial assistant allowed** ✅
3. **Editorial assistant can switch to associate editor role** ✅
4. **Role switching is seamless and secure** ✅

## 🏗️ System Architecture

### **Role Hierarchy**
```
Admin (Super User)
├── Editor-in-Chief
├── Managing Editor
├── Section Editor
├── Guest Editor
├── Production Editor
├── Associate Editor (can be switched to by editorial assistant)
├── Editorial Assistant (only one allowed)
├── Reviewer
└── Author/User
```

### **Role Switching Flow**
```
Editorial Assistant → Associate Editor → Back to Editorial Assistant
     ↓                    ↓                    ↓
  Screening          Assignment &         Return to
  & Review           Review Mgmt          Screening
```

## 🔒 Single Editorial Assistant Constraint

### **Database Level Enforcement**

The system enforces the single editorial assistant rule at multiple levels:

#### **1. Trigger Function**
```sql
CREATE OR REPLACE FUNCTION enforce_single_editorial_assistant()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'editorial-assistant' THEN
    IF EXISTS (
      SELECT 1 FROM users 
      WHERE role = 'editorial-assistant' 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    ) THEN
      RAISE EXCEPTION 'Only one editorial assistant is allowed in the system';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### **2. Database Trigger**
```sql
CREATE TRIGGER enforce_single_editorial_assistant_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_editorial_assistant();
```

#### **3. Check Constraint**
```sql
ALTER TABLE users 
ADD CONSTRAINT chk_single_editorial_assistant 
CHECK (
  (role = 'editorial-assistant' AND 
   (SELECT COUNT(*) FROM users u2 WHERE u2.role = 'editorial-assistant') <= 1) OR
  role != 'editorial-assistant'
);
```

## 🔄 Role Switching System

### **Frontend Component: RoleSwitcher**

The `RoleSwitcher` component provides a user-friendly interface for editorial assistants to switch roles:

#### **Features:**
- **Current Role Display**: Shows current role with badge
- **Toggle Switch**: Simple on/off for role switching
- **Confirmation Dialog**: Prevents accidental role changes
- **Visual Feedback**: Clear indication of target role
- **Benefits List**: Shows what the new role provides

#### **Usage:**
```tsx
<RoleSwitcher 
  onRoleChange={(newRole) => {
    // Handle role change
    window.location.reload()
  }} 
/>
```

### **API Endpoint: `/api/user/switch-role`**

#### **Security Features:**
- **Role Validation**: Only editorial assistants can switch
- **Target Role Validation**: Only allows switching to `associate-editor`
- **Conflict Prevention**: Checks for existing associate editors
- **Audit Logging**: Logs all role changes

#### **Request Format:**
```json
{
  "targetRole": "associate-editor",
  "reason": "Editorial workflow requirement"
}
```

#### **Response Format:**
```json
{
  "success": true,
  "message": "Role successfully switched to associate-editor",
  "newRole": "associate-editor"
}
```

## 🛠️ Implementation Steps

### **1. Run Constraint Enforcement**
```bash
npm run enforce:single-assistant
```

### **2. Verify Constraint**
```bash
npm run role:setup
```

### **3. Test Role Switching**
1. Login as editorial assistant
2. Navigate to dashboard
3. Use role switcher component
4. Confirm role change
5. Verify new permissions

## 🔍 Dashboard Integration

### **Editorial Assistant Dashboard**

The dashboard now includes the role switcher prominently displayed:

```
┌─────────────────────────────────────────────────────────┐
│ Editorial Assistant Dashboard                          │
├─────────────────────────────────────────────────────────┤
│ [Role Switcher Component]                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Current Role: editorial-assistant                  │ │
│ │ [Switch to Associate Editor]                       │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Statistics Cards                                       │
│ Manuscript Management                                  │
└─────────────────────────────────────────────────────────┘
```

### **Role-Based Content**

When the user switches to associate editor:
- **Dashboard changes** to associate editor view
- **New permissions** become available
- **Workflow options** expand
- **Can switch back** anytime

## 🚨 Error Handling

### **Constraint Violations**
- **Multiple Editorial Assistants**: System prevents creation
- **Unauthorized Role Switching**: Only editorial assistants can switch
- **Invalid Target Roles**: Only `associate-editor` allowed
- **Existing Conflicts**: Prevents duplicate associate editors

### **User Feedback**
- **Success Messages**: Clear confirmation of role changes
- **Error Messages**: Specific error descriptions
- **Toast Notifications**: Immediate visual feedback
- **Loading States**: Shows progress during operations

## 🔐 Security Considerations

### **Role Validation**
- **Server-side checks** for all role operations
- **Session validation** before allowing changes
- **Permission verification** at API level
- **Audit logging** for all role modifications

### **Access Control**
- **Route protection** based on current role
- **Component rendering** based on permissions
- **API endpoint** security
- **Database constraint** enforcement

## 📊 Monitoring & Logging

### **Role Change Tracking**
```typescript
logError(new Error(`Role change logged`), {
  service: 'RoleSwitcher',
  action: 'switchRole',
  userId: session.user.id,
  fromRole: session.user.role,
  toRole: targetRole,
  reason: reason || 'No reason provided'
})
```

### **Audit Trail**
- **Who** changed roles
- **When** the change occurred
- **What** role was changed to
- **Why** the change was made

## 🎯 Best Practices

### **For Administrators**
1. **Create only one editorial assistant**
2. **Monitor role changes** through logs
3. **Review role assignments** regularly
4. **Use role switching** for workflow flexibility

### **For Editorial Assistants**
1. **Use role switching** when needed
2. **Understand permissions** of each role
3. **Switch back** when screening is complete
4. **Contact admin** for role issues

### **For Developers**
1. **Always validate** roles server-side
2. **Use the constraint** system
3. **Log all role changes**
4. **Test role switching** thoroughly

## 🚀 Future Enhancements

### **Planned Features**
- **Role history** tracking
- **Automatic role switching** based on workflow
- **Role-based dashboard** customization
- **Advanced permission** management

### **Scalability Considerations**
- **Multiple editorial assistants** support (if needed)
- **Role inheritance** system
- **Dynamic permission** assignment
- **Workflow-based** role management

## 📝 Summary

The role management system provides:

✅ **Single editorial assistant constraint** enforced at database level
✅ **Seamless role switching** between editorial-assistant and associate-editor
✅ **Secure API endpoints** with proper validation
✅ **User-friendly interface** for role management
✅ **Comprehensive logging** and monitoring
✅ **Flexible workflow** support

This system ensures that the editorial workflow can be handled by one person who can seamlessly switch between roles as needed, while maintaining security and preventing unauthorized access.
