const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Очистка кэша проекта...');

const cacheFiles = [
  '.cache',
  '.next',
  'build',
  'dist',
  'coverage',
  'node_modules/.cache',
  'tsconfig.tsbuildinfo'
];

cacheFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Удаляем: ${file}`);
    try {
      fs.rmSync(file, { recursive: true, force: true });
    } catch (err) {
      console.log(`Не удалось удалить ${file}: ${err.message}`);
    }
  }
});

console.log('Очищаем npm кэш...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (err) {
  console.log('Не удалось очистить npm кэш');
}

console.log('✅ Очистка завершена!');
console.log('Запустите: npm install && npm start');