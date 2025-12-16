// Debug script to check localStorage and signature loading
console.log('🔍 SIGNATURE DEBUG ANALYSIS');
console.log('='.repeat(50));

// Check what's in localStorage
console.log('📋 LocalStorage Contents:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.includes('signature') || key.includes('authenticated') || key.includes('ican')) {
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value ? value.substring(0, 100) + '...' : 'null');
  }
}

// Check authenticated member
const authMember = localStorage.getItem('ican_authenticated_member');
console.log('\n👤 Authenticated Member:', authMember);

let branch = 'default';
if (authMember) {
  try {
    const member = JSON.parse(authMember);
    branch = member.branch || 'default';
    console.log('🏢 Branch found:', branch);
  } catch (e) {
    console.warn('❌ Failed to parse authenticated member');
  }
}

// Check signatures for this branch
const signatureKey = `signatures_${branch}`;
const signatures = localStorage.getItem(signatureKey);
console.log(`\n🖊️ Signatures for branch "${branch}":`, signatures);

if (signatures) {
  try {
    const parsed = JSON.parse(signatures);
    console.log(`   Count: ${parsed.length}`);
    parsed.forEach((sig, i) => {
      console.log(`   ${i + 1}. ${sig.name} (ID: ${sig.id})`);
    });
  } catch (e) {
    console.error('❌ Failed to parse signatures');
  }
} else {
  console.log('   No signatures found');
}

// Test loading function
console.log('\n🧪 Testing signature loading...');
import('@/firebase/database').then(async ({ getAllSignatures }) => {
  const result = await getAllSignatures(branch);
  console.log('✅ Load result:', result);
});