export enum StatusCode {
  // 2xx - Thành công
  OK = 200, // GET, PUT, PATCH thành công
  CREATED = 201, // POST tạo mới thành công
  NO_CONTENT = 204, // DELETE thành công, không trả nội dung

  // 3xx - Chuyển hướng (ít dùng)
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,

  // 4xx - Lỗi Client
  BAD_REQUEST = 400, // Dữ liệu gửi lên sai
  UNAUTHORIZED = 401, // Chưa đăng nhập / token sai
  FORBIDDEN = 403, // Không có quyền
  NOT_FOUND = 404, // Không tìm thấy tài nguyên
  METHOD_NOT_ALLOWED = 405, // Method không được hỗ trợ
  CONFLICT = 409, // Trùng email, xung đột dữ liệu
  UNPROCESSABLE_ENTITY = 422, // Validation error (rất hay dùng)
  TOO_MANY_REQUESTS = 429, // Rate limit

  // 5xx - Lỗi Server
  INTERNAL_SERVER_ERROR = 500, // Lỗi server chung
  NOT_IMPLEMENTED = 501, // Chưa hỗ trợ
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503, // Bảo trì
  GATEWAY_TIMEOUT = 504,
}
