const fs = require('node:fs');
const path = require('node:path');

const testsRoot = path.join(process.cwd(), '.test-dist', 'tests');

function collectTests(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTests(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

(async () => {
  if (!fs.existsSync(testsRoot)) {
    console.error('No compiled tests found in .test-dist/tests');
    process.exit(1);
  }

  const files = collectTests(testsRoot);
  if (files.length === 0) {
    console.error('No test files found.');
    process.exit(1);
  }

  let failed = 0;

  for (const file of files) {
    const relative = path.relative(process.cwd(), file);

    try {
      const mod = require(file);
      if (typeof mod.run !== 'function') {
        throw new Error('Test module must export a run() function');
      }

      await Promise.resolve(mod.run());
      console.log(`PASS ${relative}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${relative}`);
      console.error(error);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} test file(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll ${files.length} test file(s) passed.`);
})();
