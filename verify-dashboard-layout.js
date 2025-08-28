logger.info('🔍 Checking dashboard layout configuration...')

const fs = require('fs')
const path = require('path')

// Check if conditional layout exists
const conditionalLayoutPath = path.join(__dirname, 'components', 'conditional-layout.tsx')
if (fs.existsSync(conditionalLayoutPath)) {
  logger.info('✅ ConditionalLayout component exists')
} else {
  logger.info('❌ ConditionalLayout component missing')
}

// Check if dashboard layout exists
const dashboardLayoutPath = path.join(__dirname, 'app', 'dashboard', 'layout.tsx')
if (fs.existsSync(dashboardLayoutPath)) {
  logger.info('✅ Dashboard layout exists')
  const content = fs.readFileSync(dashboardLayoutPath, 'utf8')
  if (content.includes('h-screen overflow-hidden')) {
    logger.info('✅ Dashboard layout has correct classes')
  } else {
    logger.info('❌ Dashboard layout missing expected classes')
  }
} else {
  logger.info('❌ Dashboard layout missing')
}

// Check root layout
const rootLayoutPath = path.join(__dirname, 'app', 'layout.tsx')
if (fs.existsSync(rootLayoutPath)) {
  logger.info('✅ Root layout exists')
  const content = fs.readFileSync(rootLayoutPath, 'utf8')
  if (content.includes('ConditionalLayout')) {
    logger.info('✅ Root layout uses ConditionalLayout')
  } else {
    logger.info('❌ Root layout not using ConditionalLayout')
  }
  if (!content.includes('<Header />')) {
    logger.info('✅ Root layout does not directly include Header')
  } else {
    logger.info('❌ Root layout still includes Header directly')
  }
} else {
  logger.info('❌ Root layout missing')
}

logger.info('\n🎯 Dashboard should now be header/footer free!')
