const fs = require('fs')
const path = require('path')

// Find all route files with dynamic parameters
const routeFiles = [
  'app/api/reviewers/[id]/assignments/route.ts',
  'app/api/submissions/[id]/comments/route.ts', 
  'app/api/submissions/[id]/versions/route.ts',
  'app/api/reviews/[id]/decline/route.ts',
  'app/api/reviews/[id]/submit/route.ts',
  'app/api/reviews/[id]/accept/route.ts'
]

function fixDynamicRoutes() {
  console.log('🔧 Fixing dynamic route params...')
  
  routeFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath)
    
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8')
      
      // Fix the function signature
      content = content.replace(
        /{ params }: { params: { id: string } }/g,
        '{ params }: { params: Promise<{ id: string }> | { id: string } }'
      )
      
      // Fix the params access
      content = content.replace(
        /const (\w+) = params\.id/g,
        'const resolvedParams = await Promise.resolve(params)\n    const $1 = resolvedParams.id'
      )
      
      // Fix error logging
      content = content.replace(
        /endpoint: `\/api\/\w+\/\$\{params\.id\}/g,
        'endpoint: `' + filePath.replace('.ts', '').replace('app/', '/') + '`'
      )
      
      fs.writeFileSync(fullPath, content)
      console.log(`✅ Fixed: ${filePath}`)
    } else {
      console.log(`⚠️  File not found: ${filePath}`)
    }
  })
  
  console.log('🎉 All dynamic routes fixed!')
}

fixDynamicRoutes()
