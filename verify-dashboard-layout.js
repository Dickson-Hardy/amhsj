console.log('🔍 Checking dashboard layout configuration...')

const fs = require('fs')
const path = require('path')

// Check if conditional layout exists
const conditionalLayoutPath = path.join(__dirname, 'components', 'conditional-layout.tsx')
if (fs.existsSync(conditionalLayoutPath)) {
  console.log('✅ ConditionalLayout component exists')
} else {
  console.log('❌ ConditionalLayout component missing')
}

// Check if dashboard layout exists
const dashboardLayoutPath = path.join(__dirname, 'app', 'dashboard', 'layout.tsx')
if (fs.existsSync(dashboardLayoutPath)) {
  console.log('✅ Dashboard layout exists')
  const content = fs.readFileSync(dashboardLayoutPath, 'utf8')
  if (content.includes('h-screen overflow-hidden')) {
    console.log('✅ Dashboard layout has correct classes')
  } else {
    console.log('❌ Dashboard layout missing expected classes')
  }
} else {
  console.log('❌ Dashboard layout missing')
}

// Check root layout
const rootLayoutPath = path.join(__dirname, 'app', 'layout.tsx')
if (fs.existsSync(rootLayoutPath)) {
  console.log('✅ Root layout exists')
  const content = fs.readFileSync(rootLayoutPath, 'utf8')
  if (content.includes('ConditionalLayout')) {
    console.log('✅ Root layout uses ConditionalLayout')
  } else {
    console.log('❌ Root layout not using ConditionalLayout')
  }
  if (!content.includes('<Header />')) {
    console.log('✅ Root layout does not directly include Header')
  } else {
    console.log('❌ Root layout still includes Header directly')
  }
} else {
  console.log('❌ Root layout missing')
}

console.log('\n🎯 Dashboard should now be header/footer free!')
