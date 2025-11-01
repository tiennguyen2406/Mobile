import * as SQLite from 'expo-sqlite';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu (giống Câu 2, thêm isDeleted cho Câu 5)
export interface ExpenseItem {
  id: number;
  title: string;
  amount: number;
  createdAt: string;
  type: 'thu' | 'chi';
  isDeleted: number; // 0 = false, 1 = true
}

// Mở database
const db = SQLite.openDatabaseSync('expenses.db');

// Hàm khởi tạo bảng
export const initDB = async () => {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      createdAt TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('thu', 'chi')),
      isDeleted INTEGER DEFAULT 0
    );`
  );
  // Thêm cột isDeleted nếu bảng đã tồn tại (an toàn để chạy)
  try {
    await db.execAsync('ALTER TABLE expenses ADD COLUMN isDeleted INTEGER DEFAULT 0');
  } catch (e) {
    // Bỏ qua lỗi nếu cột đã tồn tại
  }
};

// (Câu 3b) Hàm thêm khoản chi mới
export const addExpense = async (title: string, amount: number, type: 'thu' | 'chi') => {
  const date = new Date().toLocaleDateString('vi-VN');
  const result = await db.runAsync(
    `INSERT INTO expenses (title, amount, createdAt, type) VALUES (?, ?, ?, ?);`,
    [title, amount, date, type]
  );
  return result;
};

// Hàm lấy tất cả khoản chi (chưa xóa)
export const getExpenses = async () => {
  const allRows: ExpenseItem[] = await db.getAllAsync<ExpenseItem>(
    `SELECT * FROM expenses WHERE isDeleted = 0 ORDER BY id DESC;`
  );
  return allRows;
};

// Hàm lấy khoản chi theo ID
export const getExpenseById = async (id: number) => {
  const row: ExpenseItem | null = await db.getFirstAsync<ExpenseItem>(
    `SELECT * FROM expenses WHERE id = ?;`,
    [id]
  );
  return row;
};

// (Câu 5a) Hàm cập nhật khoản chi
export const updateExpense = async (id: number, title: string, amount: number, type: 'thu' | 'chi') => {
  const result = await db.runAsync(
    `UPDATE expenses SET title = ?, amount = ?, type = ? WHERE id = ?;`,
    [title, amount, type, id]
  );
  return result;
};

// (Câu 5b) Hàm xóa mềm khoản chi
export const softDeleteExpense = async (id: number) => {
  // Dùng UPDATE để đánh dấu là đã xóa (isDeleted = 1)
  const result = await db.runAsync(
    `UPDATE expenses SET isDeleted = 1 WHERE id = ?;`,
    [id]
  );
  return result;
};

// (Câu 5c) Hàm lấy các khoản đã xóa
export const getDeletedExpenses = async () => {
  const allRows: ExpenseItem[] = await db.getAllAsync<ExpenseItem>(
    `SELECT * FROM expenses WHERE isDeleted = 1 ORDER BY id DESC;`
  );
  return allRows;
};

// (Câu 6a) Hàm tìm kiếm các khoản CHƯA xóa
export const searchExpenses = async (query: string) => {
  const likeQuery = `%${query}%`;
  const allRows: ExpenseItem[] = await db.getAllAsync<ExpenseItem>(
    `SELECT * FROM expenses 
     WHERE title LIKE ?
     AND isDeleted = 0 
     ORDER BY id DESC;`,
    [likeQuery]
  );
  return allRows;
};

// (Câu 6b) Hàm tìm kiếm các khoản ĐÃ xóa
export const searchDeletedExpenses = async (query: string) => {
  const likeQuery = `%${query}%`;
  const allRows: ExpenseItem[] = await db.getAllAsync<ExpenseItem>(
    `SELECT * FROM expenses 
     WHERE title LIKE ?
     AND isDeleted = 1 
     ORDER BY id DESC;`,
    [likeQuery]
  );
  return allRows;
};

// (Câu 8) Hàm khôi phục khoản chi
export const restoreExpense = async (id: number) => {
  const result = await db.runAsync(
    `UPDATE expenses SET isDeleted = 0 WHERE id = ?;`,
    [id]
  );
  return result;
};

// (Câu 9) Hàm đồng bộ lên MockAPI
export const syncToAPI = async (apiUrl: string) => {
  if (!apiUrl.includes('mockapi.io') || !apiUrl.endsWith('/expenses')) {
    return { success: false, message: 'Link API không hợp lệ. Phải là link .../expenses' };
  }

  try {
    // Bước 1: Lấy tất cả data đang có trên API
    const { data: existingData } = await axios.get(apiUrl);

    // Bước 2: Xóa tất cả data cũ trên API (theo yêu cầu) 
    // Chúng ta dùng Promise.all để xóa song song cho nhanh
    const deletePromises = existingData.map((item: { id: string }) => 
      axios.delete(`${apiUrl}/${item.id}`)
    );
    await Promise.all(deletePromises);

    // Bước 3: Lấy tất cả khoản thu/chi (chưa xóa) từ CSDL local
    const localExpenses = await getExpenses();
    if (localExpenses.length === 0) {
      return { success: true, message: 'Không có dữ liệu local để đồng bộ.' };
    }

    // Bước 4: Tải (POST) từng khoản chi local lên API 
    const postPromises = localExpenses.map(expense => {
      const payload = {
        title: expense.title,
        amount: expense.amount,
        createdAt: expense.createdAt,
        type: expense.type,
        localId: expense.id // Gửi ID của local lên
      };
      return axios.post(apiUrl, payload);
    });
    await Promise.all(postPromises);

    return { success: true, message: `Đồng bộ ${localExpenses.length} khoản thu/chi thành công!` };

  } catch (error) {
    console.error(error);
    let errorMessage = 'Lỗi không xác định';
    if (axios.isAxiosError(error)) {
      errorMessage = error.message;
    }
    return { success: false, message: `Đồng bộ thất bại: ${errorMessage}` };
  }
};