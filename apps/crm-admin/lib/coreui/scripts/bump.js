const fs = require('fs');
const path = require('path');

const type = process.argv[2] || 'patch';
const packages = ['ui', 'ui-react', 'theme', 'layout'];

// Read current version from packages/ui
const uiPkgPath = path.join(__dirname, '..', 'packages', 'ui', 'package.json');
const uiPkg = JSON.parse(fs.readFileSync(uiPkgPath, 'utf8'));
const [major, minor, patch] = uiPkg.version.split('.').map(Number);

let newVersion;
if (type === 'major') newVersion = `${major + 1}.0.0`;
else if (type === 'minor') newVersion = `${major}.${minor + 1}.0`;
else newVersion = `${major}.${minor}.${patch + 1}`;

// Update all packages
packages.forEach(pkg => {
  const pkgPath = path.join(__dirname, '..', 'packages', pkg, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    data.version = newVersion;

    // Update @coreui/* dependency versions (workspace:^ handles this during publish,
    // but we also update any non-workspace refs)
    ['dependencies', 'peerDependencies'].forEach(depType => {
      if (data[depType]) {
        Object.keys(data[depType]).forEach(dep => {
          if (dep.startsWith('@coreui/') && !data[depType][dep].startsWith('workspace:')) {
            data[depType][dep] = `^${newVersion}`;
          }
        });
      }
    });

    fs.writeFileSync(pkgPath, JSON.stringify(data, null, 2) + '\n');
    console.log(`  ${pkg.padEnd(12)} → v${newVersion}`);
  }
});

console.log(`\nAll packages bumped to v${newVersion}`);
