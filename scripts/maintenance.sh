#!/bin/bash

# Production Maintenance Control Script
# Usage: ./maintenance.sh [enable|disable|status]

set -e

MAINTENANCE_FLAG_FILE="/tmp/amhsj_maintenance"
ENV_FILE=".env.production"

case "${1:-status}" in
  enable)
    echo "🔧 Enabling maintenance mode..."
    
    # Update environment variable
    if grep -q "MAINTENANCE_MODE=" "$ENV_FILE" 2>/dev/null; then
      sed -i 's/MAINTENANCE_MODE=.*/MAINTENANCE_MODE=true/' "$ENV_FILE"
    else
      echo "MAINTENANCE_MODE=true" >> "$ENV_FILE"
    fi
    
    # Set maintenance start time
    if grep -q "MAINTENANCE_START_TIME=" "$ENV_FILE" 2>/dev/null; then
      sed -i "s/MAINTENANCE_START_TIME=.*/MAINTENANCE_START_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)/" "$ENV_FILE"
    else
      echo "MAINTENANCE_START_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$ENV_FILE"
    fi
    
    # Set estimated end time (4 hours from now)
    if grep -q "MAINTENANCE_END_TIME=" "$ENV_FILE" 2>/dev/null; then
      sed -i "s/MAINTENANCE_END_TIME=.*/MAINTENANCE_END_TIME=$(date -u -d '+4 hours' +%Y-%m-%dT%H:%M:%SZ)/" "$ENV_FILE"
    else
      echo "MAINTENANCE_END_TIME=$(date -u -d '+4 hours' +%Y-%m-%dT%H:%M:%SZ)" >> "$ENV_FILE"
    fi
    
    # Create flag file
    touch "$MAINTENANCE_FLAG_FILE"
    
    echo "✅ Maintenance mode enabled"
    echo "📧 Users will be redirected to maintenance page"
    echo "⏰ Scheduled end time: $(date -d '+4 hours')"
    
    # Restart the application (if using PM2)
    if command -v pm2 &> /dev/null; then
      echo "🔄 Restarting application..."
      pm2 restart amhsj || echo "⚠️  Could not restart PM2 process"
    fi
    ;;
    
  disable)
    echo "🟢 Disabling maintenance mode..."
    
    # Update environment variable
    if grep -q "MAINTENANCE_MODE=" "$ENV_FILE" 2>/dev/null; then
      sed -i 's/MAINTENANCE_MODE=.*/MAINTENANCE_MODE=false/' "$ENV_FILE"
    else
      echo "MAINTENANCE_MODE=false" >> "$ENV_FILE"
    fi
    
    # Remove flag file
    rm -f "$MAINTENANCE_FLAG_FILE"
    
    echo "✅ Maintenance mode disabled"
    echo "🚀 Site is now live and accessible"
    
    # Restart the application (if using PM2)
    if command -v pm2 &> /dev/null; then
      echo "🔄 Restarting application..."
      pm2 restart amhsj || echo "⚠️  Could not restart PM2 process"
    fi
    
    # Send notifications to subscribed users (if notification system exists)
    # curl -X POST http://localhost:3000/api/maintenance/notify || echo "Could not send notifications"
    ;;
    
  status)
    echo "📊 Maintenance Status Check"
    echo "=========================="
    
    if [ -f "$MAINTENANCE_FLAG_FILE" ]; then
      echo "🔧 Status: MAINTENANCE MODE ACTIVE"
    else
      echo "🟢 Status: SITE IS LIVE"
    fi
    
    if [ -f "$ENV_FILE" ]; then
      echo ""
      echo "Environment Configuration:"
      grep "MAINTENANCE_" "$ENV_FILE" 2>/dev/null || echo "No maintenance variables found"
    fi
    
    echo ""
    echo "Process Status:"
    if command -v pm2 &> /dev/null; then
      pm2 list | grep amhsj || echo "PM2 process not found"
    else
      echo "PM2 not available"
    fi
    ;;
    
  *)
    echo "Usage: $0 [enable|disable|status]"
    echo ""
    echo "Commands:"
    echo "  enable  - Put site into maintenance mode"
    echo "  disable - Bring site back online"
    echo "  status  - Check current maintenance status"
    exit 1
    ;;
esac
