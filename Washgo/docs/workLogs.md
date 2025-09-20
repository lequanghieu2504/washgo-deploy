# Worklog Documentation

## 19/08/2025
- **Task**: `Forgot password`
- **Description**:  
  Chỉnh sửa để phù hợp với môi trường test.

### SecurityConfig
- **Mở quyền truy cập**: Mở quyền truy cập cho API có endpoint `/api/user/reset-password`.

### forgotPasswordByEmail - UserRegistrationService
- **Chỉnh sửa response**: Trả về OTP lên controller, giảm request call tới API `sendMailToUser`.  
- **Thay đổi return type**: Sửa lại return của phương thức `forgotPasswordByEmail` thành `String`. Sau này có thể chỉnh sửa lại để gọi API `sendMailToUser` đã viết trước đó.

### OTP Service
- **Thêm OTP service**:  
  - Thêm phương thức `deleteByEmail` để tránh trùng lặp OTP khi gửi lại nhiều lần.  
  - Chỉnh sửa form để đẹp hơn.
