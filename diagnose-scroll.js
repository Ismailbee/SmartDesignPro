#!/usr/bin/env node

/**
 * Scroll Issue Diagnostic Script
 * Scans the codebase for common scrolling issues in Ionic + Vue + Tailwind apps
 * Generates a JSON report and optionally applies fixes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ISSUES = {
  OVERFLOW_HIDDEN: 'overflow_hidden',
  POSITION_FIXED: 'position_fixed',
  PREVENT_DEFAULT: 'prevent_default',
  BODY_OVERFLOW_HIDDEN: 'body_overflow_hidden',
  ION_CONTENT_MISSING: 'ion_content_missing',
  TOUCH_ACTION: 'touch_action',
  WEBKIT_OVERFLOW: 'webkit_overflow',
  POINTER_EVENTS_NONE: 'pointer_events_none',
};

const report = {
  timestamp: new Date().toISOString(),
  issues: [],
  files_scanned: 0,
  total_issues: 0,
  recommendations: [],
};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const fileIssues = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for overflow: hidden
      if (/overflow\s*:\s*hidden/i.test(line)) {
        fileIssues.push({
          type: ISSUES.OVERFLOW_HIDDEN,
          line: lineNum,
          content: line.trim(),
          severity: 'high',
          fix: 'Remove or change to overflow: auto',
        });
      }

      // Check for position: fixed on full-screen elements
      if (/position\s*:\s*fixed/i.test(line)) {
        fileIssues.push({
          type: ISSUES.POSITION_FIXED,
          line: lineNum,
          content: line.trim(),
          severity: 'medium',
          fix: 'Ensure element has pointer-events: none or is not blocking content',
        });
      }

      // Check for preventDefault on scroll/touch events
      if (/preventDefault\(\)/.test(line) && /scroll|touch|wheel|pointer/i.test(lines[Math.max(0, index - 2)].concat(line).concat(lines[Math.min(lines.length - 1, index + 2)]))) {
        fileIssues.push({
          type: ISSUES.PREVENT_DEFAULT,
          line: lineNum,
          content: line.trim(),
          severity: 'high',
          fix: 'Review if preventDefault is necessary; may block scrolling',
        });
      }

      // Check for document.body.style.overflow = 'hidden'
      if (/document\.body\.style\.overflow\s*=\s*['"]hidden['"]/.test(line)) {
        fileIssues.push({
          type: ISSUES.BODY_OVERFLOW_HIDDEN,
          line: lineNum,
          content: line.trim(),
          severity: 'medium',
          fix: 'Ensure overflow is restored after modal closes',
        });
      }

      // Check for touch-action
      if (/touch-action\s*:\s*none/i.test(line)) {
        fileIssues.push({
          type: ISSUES.TOUCH_ACTION,
          line: lineNum,
          content: line.trim(),
          severity: 'medium',
          fix: 'Review if touch-action: none is necessary',
        });
      }

      // Check for -webkit-overflow-scrolling
      if (/-webkit-overflow-scrolling/i.test(line)) {
        fileIssues.push({
          type: ISSUES.WEBKIT_OVERFLOW,
          line: lineNum,
          content: line.trim(),
          severity: 'low',
          fix: 'Ensure -webkit-overflow-scrolling: touch is set for iOS momentum scrolling',
        });
      }

      // Check for pointer-events: none
      if (/pointer-events\s*:\s*none/i.test(line)) {
        fileIssues.push({
          type: ISSUES.POINTER_EVENTS_NONE,
          line: lineNum,
          content: line.trim(),
          severity: 'low',
          fix: 'Verify this is intentional and not blocking scroll',
        });
      }
    });

    return fileIssues;
  } catch (err) {
    console.error(`Error scanning ${filePath}:`, err.message);
    return [];
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach((file) => {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      if (!file.name.startsWith('.') && file.name !== 'node_modules') {
        scanDirectory(fullPath);
      }
    } else if (/\.(vue|css|ts|tsx|js|jsx)$/.test(file.name)) {
      report.files_scanned++;
      const issues = scanFile(fullPath);

      if (issues.length > 0) {
        report.issues.push({
          file: fullPath.replace(process.cwd(), '.'),
          issues,
        });
        report.total_issues += issues.length;
      }
    }
  });
}

function generateRecommendations() {
  const severityCount = {
    high: 0,
    medium: 0,
    low: 0,
  };

  report.issues.forEach((fileIssue) => {
    fileIssue.issues.forEach((issue) => {
      severityCount[issue.severity]++;
    });
  });

  if (severityCount.high > 0) {
    report.recommendations.push({
      priority: 1,
      message: `Found ${severityCount.high} HIGH severity issues. Review overflow and preventDefault calls immediately.`,
    });
  }

  if (severityCount.medium > 0) {
    report.recommendations.push({
      priority: 2,
      message: `Found ${severityCount.medium} MEDIUM severity issues. Check position: fixed elements and body overflow management.`,
    });
  }

  if (report.total_issues === 0) {
    report.recommendations.push({
      priority: 0,
      message: 'No obvious scrolling issues detected. If scrolling still fails, check runtime behavior in DevTools.',
    });
  }

  report.recommendations.push({
    priority: 3,
    message: 'Verify ion-content is used on all pages and scroll-y is not disabled.',
  });

  report.recommendations.push({
    priority: 4,
    message: 'Test on real mobile device or emulator to verify touch scrolling works.',
  });
}

// Main execution
console.log('🔍 Scanning codebase for scroll issues...\n');

const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  scanDirectory(srcDir);
} else {
  console.error('❌ src directory not found');
  process.exit(1);
}

generateRecommendations();

// Output report
console.log('\n📊 DIAGNOSTIC REPORT\n');
console.log(`Files scanned: ${report.files_scanned}`);
console.log(`Total issues found: ${report.total_issues}\n`);

if (report.issues.length > 0) {
  console.log('⚠️  ISSUES FOUND:\n');
  report.issues.forEach((fileIssue) => {
    console.log(`📄 ${fileIssue.file}`);
    fileIssue.issues.forEach((issue) => {
      console.log(`   Line ${issue.line} [${issue.severity.toUpperCase()}]: ${issue.type}`);
      console.log(`   > ${issue.content}`);
      console.log(`   ✓ Fix: ${issue.fix}\n`);
    });
  });
} else {
  console.log('✅ No obvious scrolling issues detected!\n');
}

console.log('📋 RECOMMENDATIONS:\n');
report.recommendations.forEach((rec) => {
  console.log(`${rec.priority}. ${rec.message}`);
});

// Save JSON report
const reportPath = path.join(process.cwd(), 'scroll-diagnostic-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n✅ Report saved to: ${reportPath}`);

// Exit with appropriate code
process.exit(report.total_issues > 0 ? 1 : 0);

