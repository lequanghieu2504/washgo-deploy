# API Documentation

## Login - Client_Login
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Request Body (JSON):**
```json
{
  "username": "userName",
  "password": "password123"
}
```

---

## Login - Admin_login
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Request Body (JSON):**
```json
{
  "username": "adminUser",
  "password": "password123"
}
```

---

## Login - Carwash_login_DungCSV
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Request Body (JSON):**
```json
{
      "username": "{{username}}",
        "password": "{{password}}"
}
```

---

## Login - Carwash_login Copy
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Request Body (JSON):**
```json
{
      "username": "CarwashDN",
        "password": "password123"
}
```

---

## Register - Admin
- **Method:** `POST`
- **Endpoint:** `/register`
- **Request Body (JSON):**
```json
{
  "username": "adminUser",
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN"
}
```

---

## Register - Carwash Copy
- **Method:** `POST`
- **Endpoint:** `/register`
- **Request Body (JSON):**
```json
{
  "username": "CarwashDN",
  "email": "carwashDaNang@gmail.com",
  "password": "password123",
  "role": "CARWASH",
  "carwashName": "CarWash Da Nang",
  "location": "Da Nang",
  "description": "tan tam tan tuy"
}
```


---

## Register - Client
- **Method:** `POST`
- **Endpoint:** `/register`
- **Request Body (JSON):**
```json
{
  "username": "Khang",
  "email": "nguyenmkhang1712@gmail.com",
  "password": "password123",
  "role": "CLIENT",
  "phonenumber": "0123456789",
  "full Name": "Nguyen Minh Khang"
}
```

---

## Product_Master - create_productMaster
- **Method:** `POST`
- **Endpoint:** `/api/product-master`
- **Request Body (JSON):**
```json
{
  "name": "Wash",
  "description": "High-end car wash package",
  "category": "Standard Wash"
}
```

---

## Product_Master - getAllProductMaster
- **Method:** `GET`
- **Endpoint:** `/api/product-master/getAll`

---

## Product - Product_Create
- **Method:** `POST`
- **Endpoint:** `/api/products/master`
- **Request Body (JSON):**
```json
{
  "name": "Deluxe Wash  ",
  "description": "Full service including wax 2",
  "effectiveFrom": "2025-06-01",
  "effectiveTo": "2025-12-31",
  "active": true,
  "timing": "01:00:00",
  "productMasterId": 1,
  "price" : 100,
  "currency": "VND"
  }
```

---

## Product - Pricing_Create
- **Method:** `POST`
- **Endpoint:** `/api/pricing/product/1`
- **Request Body (JSON):**
```json
{
    "price": 130000,
    "currency": "VND",
    "description": "Giá cho dịch vụ cao cấp buổi sáng"
}
```

---

## Product - subProduct_create
- **Method:** `POST`
- **Endpoint:** `/api/products/create/subProduct`
- **Request Body (JSON):**
```json
{
    "name": "Express Wash Sub-Product 2",
    "description": "A quick wash service with basic cleaning and drying",
    "effectiveFrom": "2025-06-10",
    "effectiveTo": "2025-12-31",
    "active": true,
    "timing": "00:30:00",
    "parentId": 1,
    "productMasterid":1
}
```

---

## Product - getSubProductByProductMasterId
- **Method:** `GET`
- **Endpoint:** `/api/products/carwash/subproduct/1`

---

## USER - GetUserInfo
- **Method:** `GET`
- **Endpoint:** `/api/user/ClientInformation`

---

## USER - UpdateUserName
- **Method:** `POST`
- **Endpoint:** `/api/user/updateClientInformation`
- **Request Body (JSON):**
```json
{
  "userId": 6,
  "gender": "MALE",
  "birthDay": "1995-12-25"
}
```

---

# Forgot password flow

## USER - send Mail to reset password
- **Method:** `POST`
- **Endpoint:** `/mail/forgotPassword`
- **Request Body (JSON):**
```json
**200**
{
    "email": "nguyenmkhang1712@gmail.com"
}
**
```

---

## USER - VERIFY OTP
- **Method:** `GET`
- **Endpoint:** `/mail/verify-forgot-password?OTP=example`
```json
200
  {OTP is valid. You can now reset your password.}
400
  {Invalid or expired OTP.}
```
## USER - Reset password 
- **Method:** `POST`
- **Endpoint:** `/api/user/reset-password`
- **Request Body (JSON):**
```json
{
    "email":"nguyenmkhang1712@gmail.com",
    "newPassword":"khangne123"
}
**200**
{Password updated successfully.}
**400**
{OTP has not been verified or still exists.}
```
#End forgot password flow
---

## Carwash - AddScheduleForCarwash
- **Method:** `POST`
- **Endpoint:** `/api/schedules/carwash`
- **Request Body (JSON):**
```json
{
  "availableFrom": "{{availableFrom}}",
  "availableTo": "{{availableTo}}",
  "capacity": 10,
  "isActive": true
}
```

---

## Carwash - AddScheduleForCarwash Copy
- **Method:** `POST`
- **Endpoint:** `/api/schedules/carwash`
- **Request Body (JSON):**
```json
{
  "availableFrom": "08:00:00",
  "availableTo": "12:00:00",
  "capacity": 10,
  "isActive": true
}
```

---

## Carwash - New Request
- **Method:** `GET`
- **Endpoint:** `/api/carwashes`

---

## Carwash - New Request
- **Method:** `POST`
- **Endpoint:** `/api/bookings/carwash-bookings`
- **Request Body (JSON):**
```json
{
  "notes": "Khách yêu cầu làm sạch trần xe và nội thất",
  "startTime": "2025-06-15T14:00:00",
  "endTime": "2025-06-15T15:30:00",
  "productsId": [1, 2],
  "userId": 3,
  "carwashId": 2
}
```

---

## Client - CreateBooking
- **Method:** `POST`
- **Endpoint:** `/api/bookings/create`
- **Request Body (JSON):**
```json
{
  "notes": "lam sach tran nha va not that",
  "startTime": "2025-06-15T14:00:00",
  "endTime": "2025-06-15T15:30:00",
  "productsId": [1,2],
  "userId": 3,
  "carwashId": 2
}
```

---

## Client - CreateBookingByPhoneNumber
- **Method:** `POST`
- **Endpoint:** `/api/bookings/bookingByPhoneNumber`
- **Request Body (JSON):**
```json
{
  "notes": "Khách đặt lịch rửa xe gói cao cấp",
  "startTime": "2025-06-12T10:00:00",
  "endTime": "2025-06-12T11:00:00",
  "productsId": [1],
  "carwashId": 2,
  "phoneNumber": "0912345678"
}
```

---

## Client - New Request
- **Method:** `GET`
- **Endpoint:** `/`

---

## Login_email - client
- **Method:** `POST`
- **Endpoint:** `/mail/send-verification`
- **Request Body (JSON):**
```json
{
  "email": "yourmail",
  "password": "12345678910",
  "role": "CLIENT",
  "phonenumber": "yourPhone"
}
```

---

## filter - filter
- **Method:** `GET`
- **Endpoint:** `/api/filter`

---

## Manager - GetAllBookingForCarwash
- **Method:** `GET`
- **Endpoint:** `/api/bookings/carwash-bookings`

---

## Manager - New Request
- **Method:** `PUT`
- **Endpoint:** `/api/bookings/manager/update/1`
- **Request Body (JSON):**
```json
{
        "status":"DONE",
        "newEndTime":"2025-06-20T08:30:00",
        "newStartTime":"2025-06-20T08:30:00"
}
```

---

## feedback - createFeedback
- **Method:** `POST`
- **Endpoint:** `/api/feedback/addFeedback`
- **Request Body (JSON):**
```json
{
    "bookingId": 1,
    "carwashID": 2,
    "rating": 4,
    "comment": "Great service!",
    "imageUrls": []
}
```

---

## feedback - GetFeedBackById
- **Method:** `GET`
- **Endpoint:** `/api/feedback/1`

---

## feedback - GetFeedbackByCarwashId
- **Method:** `GET`
- **Endpoint:** `/api/feedback/carwash/2`

---

## feedback - GetFeedBackByClientId
- **Method:** `GET`
- **Endpoint:** `/api/feedback/client/3`

---
