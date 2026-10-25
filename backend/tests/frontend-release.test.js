const fs = require('fs');
const path = require('path');

const releaseScript = fs.readFileSync(
  path.join(__dirname, '..', '..', 'dist', 'findtheweb-release.js'),
  'utf8'
);
const publicDist = path.join(__dirname, '..', '..', 'dist');

function publicAssetText() {
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (/\.(html|js|map|xml|txt)$/.test(entry.name)) files.push(fs.readFileSync(fullPath, 'utf8'));
    }
  };
  visit(publicDist);
  return files.join('\n');
}

describe('frontend release contract', () => {
  test('removes the retired public products navigation', () => {
    expect(releaseScript).toContain('removeRetiredProductNavigation');
    expect(releaseScript).toContain('a[href="/products"]');
  });

  test('keeps production metadata on the public release surface', () => {
    expect(releaseScript).toContain("var siteUrl = 'https://findtheweb.zus3cu.tech'");
    expect(releaseScript).toContain("var apiBase = 'https://api.zus3cu.tech/findtheweb'");
  });

  test('does not publish stale canonical domains in generated assets', () => {
    expect(publicAssetText()).not.toMatch(/https?:\/\/findtheweb\.com/i);
  });
});
