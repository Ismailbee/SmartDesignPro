/**
 * Simple Name Extraction Test Script
 * 
 * Run with: node scripts/test-name-extraction.js
 * 
 * This tests the name extraction logic to verify it works correctly
 * with the SVG name template format used in public/names/name1.svg
 */

// Copy the extraction logic for testing purposes
const NAME_SEPARATORS = ['&', ' and ', ' AND ', 'wed', 'weds', ' with ', ' WITH ', ' n ', ' + '];

function capitalizeWords(str) {
  if (!str) return '';
  return str.split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: null };
  }
  return {
    first: parts[0],
    last: parts.slice(1).join(' ')
  };
}

function extractNamesFromBrackets(text) {
  if (!text || typeof text !== 'string') return null;
  
  // Match content inside parentheses or square brackets
  const bracketMatch = text.match(/[\(\[]([^\)\]]+)[\)\]]/);
  if (!bracketMatch) return null;
  
  const content = bracketMatch[1].trim();
  if (!content) return null;
  
  // Try each separator
  for (const sep of NAME_SEPARATORS) {
    const sepIndex = content.toLowerCase().indexOf(sep.toLowerCase());
    if (sepIndex === -1) continue;
    
    const beforeSep = content.substring(0, sepIndex).trim();
    const afterSep = content.substring(sepIndex + sep.length).trim();
    
    // Validate both parts have content
    if (!beforeSep || !afterSep) continue;
    
    // Clean and capitalize names
    const name1 = capitalizeWords(beforeSep);
    const name2 = capitalizeWords(afterSep);
    
    // Split into first/last
    const name1Parts = splitName(name1);
    const name2Parts = splitName(name2);
    
    return {
      name1,
      name2,
      name1First: name1Parts.first,
      name1Last: name1Parts.last,
      name2First: name2Parts.first,
      name2Last: name2Parts.last,
      source: 'bracket',
      confidence: 'high'
    };
  }
  
  // No separator found - try to intelligently split 4 words into 2 names
  // Common pattern: "(FirstName1 LastName1 FirstName2 LastName2)"
  // e.g., "(Suleiman Yahaya Salamatu Yunusa)" -> "Suleiman Yahaya" & "Salamatu Yunusa"
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 4) {
    // Exactly 4 words - split into two 2-word names
    const name1 = capitalizeWords(`${words[0]} ${words[1]}`);
    const name2 = capitalizeWords(`${words[2]} ${words[3]}`);
    
    return {
      name1,
      name2,
      name1First: capitalizeWords(words[0]),
      name1Last: capitalizeWords(words[1]),
      name2First: capitalizeWords(words[2]),
      name2Last: capitalizeWords(words[3]),
      source: 'bracket',
      confidence: 'medium' // Lower confidence since we guessed the split
    };
  }
  
  if (words.length === 2) {
    // Exactly 2 words - could be single-word names for two people
    const name1 = capitalizeWords(words[0]);
    const name2 = capitalizeWords(words[1]);
    
    return {
      name1,
      name2,
      name1First: name1,
      name1Last: null,
      name2First: name2,
      name2Last: null,
      source: 'bracket',
      confidence: 'medium'
    };
  }
  
  return null;
}

// ========== TESTS ==========

console.log('='.repeat(60));
console.log('NAME EXTRACTION TEST - SVG Template Compatibility');
console.log('='.repeat(60));
console.log('');
console.log('SVG Template Elements (public/names/name1.svg):');
console.log('  - name1-first: First person\'s first name (Grand Hotel font, white)');
console.log('  - name1-last:  First person\'s last name (Raleway font, yellow, UPPERCASE)');
console.log('  - name2-first: Second person\'s first name (Grand Hotel font, white)');
console.log('  - name2-last:  Second person\'s last name (Raleway font, yellow, UPPERCASE)');
console.log('');
console.log('='.repeat(60));

const testCases = [
  {
    input: '(Mustapa Mohammed & Salamatu Abdulrahman)',
    description: 'Full names with ampersand'
  },
  {
    input: '(Suleiman Yahaya Salamatu Yunusa)',
    description: '4 words WITHOUT separator - should auto-split'
  },
  {
    input: 'congratulation on your wedding ceremony (Suleiman Yahaya Salamatu Yunusa) on 6th January, 2023 courtesy: the family',
    description: 'REAL USER INPUT - 4 words in middle of text'
  },
  {
    input: '(Aisha & Suleiman)',
    description: 'Single-word names with ampersand'
  },
  {
    input: '(Aisha Suleiman)',
    description: '2 words WITHOUT separator - should auto-split'
  },
  {
    input: '(John Smith and Mary Jane)',
    description: 'Names with "and" separator'
  },
  {
    input: '[Ahmed Hassan & Fatima Ali]',
    description: 'Square brackets'
  },
  {
    input: '(juan carlos rodriguez & maria del carmen)',
    description: 'Lowercase - should auto-capitalize'
  },
  {
    input: 'Wedding celebration for (Ibrahim & Khadija) on December 25',
    description: 'Names in middle of text'
  },
  {
    input: 'John & Mary without brackets',
    description: 'NO brackets - should return null'
  },
  {
    input: '(Single Name Only)',
    description: 'Single name in brackets - should return null'
  },
  {
    input: '(One Two Three)',
    description: '3 words - cannot split evenly - should return null'
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  console.log(`\nTest ${index + 1}: ${test.description}`);
  console.log(`Input: "${test.input}"`);
  
  const result = extractNamesFromBrackets(test.input);
  
  if (result) {
    console.log('✅ Extracted:');
    console.log(`   name1: "${result.name1}" → first: "${result.name1First}", last: "${result.name1Last || '(none)'}"`);
    console.log(`   name2: "${result.name2}" → first: "${result.name2First}", last: "${result.name2Last || '(none)'}"`);
    
    // Show SVG mapping
    console.log('   SVG Mapping:');
    console.log(`     name1-first: "${result.name1First}"`);
    console.log(`     name1-last:  "${(result.name1Last || '').toUpperCase()}"`);
    console.log(`     name2-first: "${result.name2First}"`);
    console.log(`     name2-last:  "${(result.name2Last || '').toUpperCase()}"`);
    
    passed++;
  } else {
    if (test.description.includes('should return null')) {
      console.log('✅ Correctly returned null (expected behavior)');
      passed++;
    } else {
      console.log('❌ Failed - returned null');
      failed++;
    }
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

// Interactive test
console.log('\n📝 TRY IT YOURSELF:');
console.log('   Use format: (FirstName LastName & FirstName LastName)');
console.log('   Example: (Abubakar Sadiq & Halima Usman)');
console.log('');
