// src/script/update-db.mjs
import { envConfig } from '@src/config/env';
import { UsersModel } from '@src/routes/users/users.model';
import mongoose from 'mongoose';

const MONGODB_URI = envConfig.DB_MONGO_URL;

/**
 * Hàm tổng quát – thêm field nếu chưa có (an toàn cho DB cực lớn)
 */
async function addFieldIfNotExists(Model: any, field: string, defaultValue: any, batchSize = 5000) {
  try {
    // Kiểm tra xem còn document nào thiếu field không
    const missingDoc = await Model.findOne({ [field]: { $exists: false } }).lean();
    if (!missingDoc) {
      console.log(`Field "${field}" đã tồn tại ở tất cả bản ghi. Bỏ qua.`);
      return;
    }

    console.log(`Bắt đầu thêm field "${field}" = ${JSON.stringify(defaultValue)} cho ${Model.modelName}...`);

    let updatedCount = 0;
    let lastId: any = null;

    while (true) {
      const query: any = { [field]: { $exists: false } };
      if (lastId) query._id = { $gt: lastId };

      const docs = await Model.find(query).sort({ _id: 1 }).limit(batchSize).select('_id').lean();

      if (docs.length === 0) break;

      const ids = docs.map((d: any) => d._id);
      const result = await Model.updateMany({ _id: { $in: ids } }, { $set: { [field]: defaultValue } });

      updatedCount += result.modifiedCount;
      lastId = docs[docs.length - 1]._id;

      console.log(`Đã cập nhật ${result.modifiedCount} bản ghi, tổng: ${updatedCount}, lastId: ${lastId}`);
    }

    console.log(`HOÀN TẤT! Đã thêm "${field}" cho ${updatedCount} bản ghi`);
  } catch (err: any) {
    console.error(`LỖI khi thêm field "${field}":`, err.message);
    throw err;
  }
}

/**
 * HÀM CHÍNH – SAU NÀY CHỈ CẦN THÊM 1 DÒNG VÀO ĐÂY!
 */
export const updateDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Kết nối MongoDB thành công – Bắt đầu migration');

    // SAU NÀY CHỈ CẦN THÊM DÒNG MỚI VÀO ĐÂY:
    // pharse 1
    await addFieldIfNotExists(UsersModel, 'isActive', true);
    await addFieldIfNotExists(UsersModel, 'otp', null);

    console.log('TẤT CẢ MIGRATION ĐÃ HOÀN TẤT!');
  } catch (err) {
    console.error('Migration thất bại:', err);
    process.exit(1);
  } finally {
    // await mongoose.disconnect();
    // console.log('Đã ngắt kết nối MongoDB');
  }
};
