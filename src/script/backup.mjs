import { exec } from 'child_process';

async function backupDB() {
  return new Promise((resolve, reject) => {
    const backupPath = `./backup/backup_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const cmd = `mongodump --uri="mongodb://localhost:27017/backend-hieutran02" --out="${backupPath}"`;

    console.log('💾 Backup DB trước khi chạy migration...');
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Backup thất bại:', err);
        return reject(err);
      }
      console.log('✅ Backup xong tại:', backupPath);
      resolve();
    });
  });
}
backupDB();
