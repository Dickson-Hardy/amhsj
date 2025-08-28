#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Function to recursively find all route files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList)
    } else if (file === 'route.ts' || file === 'route.js') {
      fileList.push(filePath)
    }
  })
  
  return fileList
}

// Function to check for mock implementations
function checkForMockImplementations(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    const mockPatterns = [
      /mock\s+implementation/i,
      /mock\s+data/i,
      /placeholder.*implementation/i,
      /todo.*implement/i,
      /fixme.*implement/i,
      /mock.*return/i,
      /const\s+mock\w+\s*=/i,
      /return.*mock/i,
    ]
    
    const issues = []
    mockPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern)
      if (matches) {
        issues.push({
          pattern: pattern.source,
          match: matches[0]
        })
      }
    })
    
    return {
      hasMockImplementation: issues.length > 0,
      issues,
      hasDbImport: content.includes('from "@/lib/db"') || content.includes('import { db }'),
      hasSchemaImport: content.includes('from "@/lib/db/schema"'),
      hasAuthCheck: content.includes('getServerSession'),
      hasErrorHandling: content.includes('try') && content.includes('catch'),
      lineCount: content.split('\n').length
    }
  } catch (error) {
    return {
      error: error.message,
      hasMockImplementation: false,
      issues: []
    }
  }
}

// Main function
function analyzeRoutes() {
  const appApiDir = path.join(process.cwd(), 'app', 'api')
  
  if (!fs.existsSync(appApiDir)) {
    logger.error('❌ app/api directory not found')
    return
  }
  
  const routeFiles = findRouteFiles(appApiDir)
  logger.info(`🔍 Found ${routeFiles.length} API route files\n`)
  
  const results = {
    total: routeFiles.length,
    withMockImplementations: 0,
    withoutDbIntegration: 0,
    incomplete: [],
    complete: [],
    issues: []
  }
  
  routeFiles.forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath)
    const analysis = checkForMockImplementations(filePath)
    
    if (analysis.error) {
      logger.info(`❌ ${relativePath} - Error: ${analysis.error}`)
      return
    }
    
    const status = {
      path: relativePath,
      hasMockImplementation: analysis.hasMockImplementation,
      hasDbImport: analysis.hasDbImport,
      hasSchemaImport: analysis.hasSchemaImport,
      hasAuthCheck: analysis.hasAuthCheck,
      hasErrorHandling: analysis.hasErrorHandling,
      lineCount: analysis.lineCount,
      issues: analysis.issues
    }
    
    // Determine completeness
    const isComplete = !analysis.hasMockImplementation && 
                      analysis.hasDbImport && 
                      analysis.hasAuthCheck && 
                      analysis.hasErrorHandling
    
    if (isComplete) {
      results.complete.push(status)
      logger.info(`✅ ${relativePath} - Complete implementation`)
    } else {
      results.incomplete.push(status)
      const issues = []
      if (analysis.hasMockImplementation) {
        issues.push('Mock implementation')
        results.withMockImplementations++
      }
      if (!analysis.hasDbImport) {
        issues.push('No DB integration')
        results.withoutDbIntegration++
      }
      if (!analysis.hasAuthCheck) issues.push('No auth check')
      if (!analysis.hasErrorHandling) issues.push('No error handling')
      
      logger.info(`🔸 ${relativePath} - Issues: ${issues.join(', ')}`)
      
      if (analysis.issues.length > 0) {
        analysis.issues.forEach(issue => {
          logger.info(`   └─ Mock found: "${issue.match}"`)
        })
      }
    }
  })
  
  // Summary
  logger.info('\n📊 SUMMARY:')
  logger.info(`Total routes: ${results.total}`)
  logger.info(`Complete: ${results.complete.length} (${Math.round(results.complete.length / results.total * 100)}%)`)
  logger.info(`Incomplete: ${results.incomplete.length} (${Math.round(results.incomplete.length / results.total * 100)}%)`)
  logger.info(`With mock implementations: ${results.withMockImplementations}`)
  logger.info(`Without DB integration: ${results.withoutDbIntegration}`)
  
  // Routes that need immediate attention
  if (results.incomplete.length > 0) {
    logger.info('\n🚨 ROUTES NEEDING ATTENTION:')
    results.incomplete
      .sort((a, b) => {
        // Prioritize routes with mock implementations
        if (a.hasMockImplementation && !b.hasMockImplementation) return -1
        if (!a.hasMockImplementation && b.hasMockImplementation) return 1
        return 0
      })
      .slice(0, 10) // Show top 10
      .forEach(route => {
        logger.info(`• ${route.path}`)
        if (route.hasMockImplementation) {
          route.issues.forEach(issue => {
            logger.info(`  - Mock: "${issue.match}"`)
          })
        }
      })
  }
  
  // Save detailed report
  fs.writeFileSync('route-analysis-report.json', JSON.stringify(results, null, 2))
  logger.info('\n📄 Detailed report saved to: route-analysis-report.json')
}

analyzeRoutes()
