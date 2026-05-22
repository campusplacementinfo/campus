# Menu Button Styling Quick Reference

## Button Classes & Colors At-a-Glance

### StudentDashboard
```
CLASS: .menu-btn
- Default: White (#fff) text + #2c3e50 text color
- Active: linear-gradient(135deg, #667eea, #764ba2) + white text
- Padding: 12px 24px
- Border: 2px solid transparent
- Border-radius: 10px
```

### AdminDashboard  
```
CLASS: .menu-btn
- Default: White (#fff) text + #2c3e50 text color
- Active: linear-gradient(135deg, #667eea, #764ba2) + white text
- Padding: 12px 24px
- Border: 2px solid transparent
- Border-radius: 10px

CLASS: .action-btn
- Default: White (#fff) background + #667eea text
- Hover: Slight white transparency (0.9)
- Padding: 12px 24px
- Border: none
- Border-radius: 8px
```

### CompanyDashboard
```
CLASS: .tab-btn
- Default: White (#fff) text + #2c3e50 text color
- Active: linear-gradient(135deg, #667eea, #764ba2) + white text
- Padding: 12px 24px
- Border: 2px solid transparent
- Border-radius: 10px
```

### Shared (DashboardStyles.css)
```
CLASS: .nav-item
- Default: White (#fff) + #ddd border + #333 text
- Active: linear-gradient(135deg, #667eea, #764ba2) + white text
- Padding: 12px 20px
- Border: 2px solid #ddd
- Border-radius: 10px

CLASS: .sidebar-toggle-btn / .menu-toggle-btn
- Background: linear-gradient(135deg, #1a202c, #2d3748, #4a5568)
- Icon: ☰ (Hamburger)
- Size: 58px × 58px
- Position: Fixed top-left
- Z-index: 9999
```

## Container Styling
```
CLASS: .section-menu / .tabs-container / .tab-navigation
- Background: rgba(255, 255, 255, 0.1) (semi-transparent white)
- Padding: 15px
- Border-radius: 12px
- Gap: 12px
- backdrop-filter: blur(10px)
```

## Hover & Active States

### All Menu Buttons (student, admin, company)
```
Hover:
- transform: translateY(-2px)
- box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15)

Active:
- background: linear-gradient(135deg, #667eea, #764ba2)
- color: white
- box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4)
```

### Toggle Buttons
```
Hover:
- transform: translateY(-4px) scale(1.05)
- box-shadow: 0 22px 45px rgba(99, 102, 241, 0.55), 0 10px 25px rgba(0, 0, 0, 0.2)

Active:
- transform: scale(0.95)
```

## CSS Variables
```
--primary-color: #667eea        (Purple)
--secondary-color: #764ba2      (Dark Purple)
--accent-color: #f093fb         (Pink)
--success-color: #11998e        (Teal)
--warning-color: #ff9f1c        (Orange)
--danger-color: #e74c3c         (Red)
--light-bg: #f8f9fa             (Light Gray)
--transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

## Core Colors Used
- **Primary Purple**: #667eea
- **Secondary Purple**: #764ba2
- **Default Text**: #2c3e50
- **Accent/Alternative Text**: #333
- **Success Green**: #11998e
- **Warning Orange**: #ff9f1c
- **Danger Red**: #e74c3c
- **Dark Gray**: #1a202c
- **Light Gray**: #f8f9fa

## Typography
- Font-weight: 600 (semi-bold)
- Font-size: 14px (buttons)
- Font-size: 18px (button icons)

## Spacing
- Button Gap: 8px
- Container Gap: 12px
- Button Padding: 12px 24px
- Container Padding: 15px
- Border Radius: 10px (buttons), 12px (containers)

## Transitions
- Default: all 0.3s ease
- Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)

## Shadow Effects
- Card Shadow: 0 8px 32px rgba(0, 0, 0, 0.1)
- Button Shadow (Default): 0 8px 20px rgba(0, 0, 0, 0.15)
- Button Shadow (Active): 0 10px 25px rgba(102, 126, 234, 0.4)
- Toggle Shadow: 0 15px 35px rgba(99, 102, 241, 0.45)
