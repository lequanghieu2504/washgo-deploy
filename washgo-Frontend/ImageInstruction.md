Washgo — API Media & Feedback Docs

# Washgo — API Media & Feedback Docs

\*Generated: 2025-09-13 08:57:32\*

## Tổng quan

- \*\*Base URL (local)\*\*: \`<http://localhost:8080\`>
- Tất cả endpoint bên dưới giả định có \*\*Spring Security\*\*.
- \*\*Upload\*\* dùng \`multipart/form-data\` với \*\*key = \`file\`\*\*.
- Media \*\*PRIVATE\*\* sẽ trả URL dạng \`/api/media/serve/{mediaId}\`; khi tải cần \*\*Authorization: Bearer &lt;token&gt;\*\* (nếu route được bảo vệ).

————————————————————————————————————————

## Phân quyền nhanh

- \*\*CLIENT\*\*: khách đặt lịch; tạo feedback; upload media cho feedback của mình.
- \*\*OWNER\*\*: chủ carwash; upload/xoá media cho \*\*carwash mình sở hữu\*\*.
- \*\*ADMIN\*\*: toàn quyền.
- \*\*isAuthenticated()\*\*: chỉ cần đăng nhập.

Trong từng endpoint mình có ghi chú: \*\*Yêu cầu Bearer token của role …\*\*

————————————————————————————————————————

## MEDIA CHUNG

### Serve media (PRIVATE hoặc cần qua API)

\*\*GET\*\* /api/media/serve/{mediaId}

\*\*Quyền:\*\* tuỳ cấu hình (thường isAuthenticated()), và/hoặc kiểm tra quyền xem nếu media PRIVATE.

\*\*Headers\*\*

- (nếu cần) \`Authorization: Bearer &lt;token&gt;\`

\*\*Response\*\*

- \`200 OK\` + binary đúng \`Content-Type\` (image/\*, video/\*, …)
- \`404\` nếu không tồn tại

————————————————————————————————————————

## CARWASH MEDIA

### 1) Upload media cho Carwash (ảnh/video)

\*\*POST\*\* /api/media/carwash/{carwashId}?cover={bool}&sortOrder={int}&visibility={PUBLIC|PRIVATE}

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token của role OWNER (sở hữu carwash) hoặc ADMIN\*\*.

\*\*Body (multipart/form-data)\*\*

- \`file\`: (File) ảnh/video

\*\*Params\*\*

- \`cover\`: \`true|false\` (mặc định \`false\`) — đánh dấu \*\*ảnh bìa của Carwash\*\* (ví dụ ảnh cover trong gallery)
- \`sortOrder\`: số thứ tự (mặc định \`0\`)
- \`visibility\`: \`PUBLIC|PRIVATE\` (mặc định \`PRIVATE\`)

\*\*Response 200\*\*

{  
"id": "f471e880-061b-43d3-88fa-f79f43d8c76a",  
"url": "/api/media/serve/f471e880-061b-43d3-88fa-f79f43d8c76a",  
"mediaType": "IMAGE",  
"mime": "image/png",  
"sizeBytes": 58054,  
"width": 500,  
"height": 500,  
"sortOrder": 0,  
"cover": false  
}

\> Nếu visibility=PUBLIC, url có thể là đường dẫn public (VD /uploads/...).

### 2) Danh sách media của Carwash

\*\*GET\*\* /api/media/carwash/{carwashId}

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token (isAuthenticated())\*\* (hoặc để public nếu muốn).

\*\*Response 200\*\*

\[  
{  
"id": "uuid-1",  
"url": "/api/media/serve/uuid-1",  
"mediaType": "IMAGE",  
"mime": "image/jpeg",  
"sizeBytes": 123456,  
"width": 1024,  
"height": 768,  
"sortOrder": 0,  
"cover": true  
},  
{  
"id": "uuid-2",  
"url": "/api/media/serve/uuid-2",  
"mediaType": "VIDEO",  
"mime": "video/mp4",  
"sizeBytes": 987654,  
"width": 1920,  
"height": 1080,  
"sortOrder": 1,  
"cover": false  
}  
\]

### 3) Xoá 1 media khỏi Carwash

\*\*DELETE\*\* /api/media/carwash/{carwashId}/{mediaId}

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token của role OWNER (sở hữu carwash) hoặc ADMIN\*\*.

\*\*Response\*\*

- \`204 No Content\` nếu xoá OK
- \`404\` nếu không tồn tại/không thuộc carwash
- File vật lý sẽ được xoá \*\*nếu media không còn tham chiếu\*\* ở nơi khác (feedback/avatar)

————————————————————————————————————————

## USER AVATAR

### 1) Upload/replace avatar user (tự xoá avatar cũ nếu mồ côi)

\*\*POST\*\* /api/media/users/{userId}/avatar

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token của chính user đó\*\* (CLIENT/OWNER) \*\*hoặc ADMIN\*\*.

\*\*Body (multipart/form-data)\*\*

- \`file\`: ảnh avatar

\*\*Response 200\*\*

{  
"id": "uuid-new",  
"url": "/api/media/serve/uuid-new",  
"mediaType": "IMAGE",  
"mime": "image/png",  
"sizeBytes": 58054,  
"width": 500,  
"height": 500,  
"sortOrder": null,  
"cover": false  
}

\> Hệ thống gán avatar mới, gỡ liên kết avatar cũ & \*\*GC\*\* (xoá file + record) nếu không còn ai tham chiếu.

### 2) Xoá avatar user

\*\*DELETE\*\* /api/media/users/{userId}/avatar

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token của chính user đó\*\* hoặc \*\*ADMIN\*\*.

\*\*Response\*\*

- \`204 No Content\` nếu xoá OK (và GC nếu mồ côi)
- \`404\` nếu user không có avatar

————————————————————————————————————————

## FEEDBACK

### 1) Tạo feedback

\*\*POST\*\* /api/feedback

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token của role CLIENT\*\*.

\*\*Body (raw JSON)\*\*

{  
"bookingId": 1,  
"carwashId": 3,  
"rating": 5,  
"comment": "Dịch vụ tốt, nhân viên thân thiện."  
}

\*\*Ràng buộc\*\* (service đã kiểm tra):

- Booking phải \*\*DONE\*\*
- Người gửi là \*\*client\*\* của booking
- Booking thuộc đúng carwash
- 1 booking chỉ có \*\*1 feedback\*\*
- \`rating\` ∈ \[1..5\]

\*\*Response 201\*\*

{  
"id": 10,  
"rating": 5,  
"comment": "Dịch vụ tốt, nhân viên thân thiện.",  
"createdAt": "2025-09-13T12:34:56",  
"bookingId": 1,  
"carwashId": 3,  
"carwashName": "WashGo District 1",  
"clientId": 8,  
"clientUsername": "clientA",  
"media": \[\]  
}

### 2) Lấy feedback theo ID

\*\*GET\*\* /api/feedback/{id}

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token\*\* (ADMIN; hoặc chính CLIENT đã viết; hoặc OWNER carwash).

### 3) Lấy feedback của Carwash

\*\*GET\*\* /api/feedback/carwash/{carwashId}

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token (isAuthenticated())\*\* (tuỳ bạn mở public).

### 4) Lấy feedback của Client

\*\*GET\*\* /api/feedback/client/{clientId}

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token của chính client đó\*\* hoặc \*\*ADMIN\*\*.

### 5) Lấy tất cả feedback

\*\*GET\*\* /api/feedback/all

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token của role ADMIN\*\*.

————————————————————————————————————————

## FEEDBACK MEDIA

### 1) Upload media cho Feedback (ảnh/video)

\*\*POST\*\* /api/feedback/{feedbackId}/media?cover={bool}&sortOrder={int}&visibility={PUBLIC|PRIVATE}

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token của role CLIENT\*\* (chính chủ feedback) \*\*hoặc ADMIN\*\*.

\*\*Body (multipart/form-data)\*\*

- \`file\`: ảnh/video

\*\*Response 200\*\*

{  
"id": "uuid-fb-1",  
"url": "/api/media/serve/uuid-fb-1",  
"mediaType": "IMAGE",  
"mime": "image/jpeg",  
"sizeBytes": 123456,  
"width": 1024,  
"height": 768,  
"sortOrder": 0,  
"cover": false  
}

### 2) Danh sách media của Feedback

\*\*GET\*\* /api/feedback/{feedbackId}/media

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token (isAuthenticated())\*\*.

### 3) Xoá 1 media khỏi Feedback

\*\*DELETE\*\* /api/feedback/{feedbackId}/media/{mediaId}

\*\*Quyền:\*\* \*\*Yêu cầu Bearer token của role CLIENT\*\* (chủ feedback) \*\*hoặc ADMIN\*\*.

\*\*Response\*\*

- \`204 No Content\` nếu xoá OK
- \`404\` nếu media không thuộc feedback
- File vật lý sẽ được xoá \*\*nếu không còn tham chiếu\*\* (carwash/avatar)

————————————————————————————————————————

## Ví dụ nhanh (Postman)

### Upload avatar user

- \*\*POST\*\* \`/api/media/users/8/avatar\`
- \*\*Auth:\*\* Bearer token của \*\*user id = 8\*\* hoặc \*\*ADMIN\*\*
- \*\*Body:\*\* \`form-data\` → \`file\` (type File)

### Tạo feedback (CLIENT)

- \*\*POST\*\* \`/api/feedback\`
- \*\*Auth:\*\* Bearer token của \*\*CLIENT\*\*
- \*\*Body (raw JSON):\*\*

{  
"bookingId": 1,  
"carwashId": 3,  
"rating": 5,  
"comment": "Ấn tượng, sẽ quay lại!"  
}

### Upload media cho carwash

- \*\*POST\*\* \`/api/media/carwash/3?cover=false&sortOrder=0&visibility=PUBLIC\`
- \*\*Auth:\*\* Bearer token \*\*OWNER\*\* carwash \`3\` hoặc \*\*ADMIN\`
- \*\*Body:\*\* \`form-data\` → \`file\` (type File)

### Danh sách media carwash

- \*\*GET\*\* \`/api/media/carwash/3\`
- \*\*Auth:\*\* Bearer token (isAuthenticated())

### Upload media cho feedback

- \*\*POST\*\* \`/api/feedback/10/media?cover=false&sortOrder=0&visibility=PRIVATE\`
- \*\*Auth:\*\* Bearer token \*\*CLIENT\*\* (chủ feedback) hoặc \*\*ADMIN\*\*
- \*\*Body:\*\* \`form-data\` → \`file\` (type File)

### Danh sách media feedback

- \*\*GET\*\* \`/api/feedback/10/media\`
- \*\*Auth:\*\* Bearer token (isAuthenticated())

### Xoá media carwash

- \*\*DELETE\*\* \`/api/media/carwash/3/uuid-media\`
- \*\*Auth:\*\* Bearer token \*\*OWNER\*\* carwash \`3\` hoặc \*\*ADMIN\*\*

### Xoá media feedback

- \*\*DELETE\*\* \`/api/feedback/10/media/uuid-media\`
- \*\*Auth:\*\* Bearer token \*\*CLIENT\*\* (chủ feedback) hoặc \*\*ADMIN\*\*

### Xoá avatar user

- \*\*DELETE\*\* \`/api/media/users/8/avatar\`
- \*\*Auth:\*\* Bearer token \*\*user id = 8\*\* hoặc \*\*ADMIN\*\*

————————————————————————————————————————

## Lỗi thường gặp

- \*\*403 Forbidden\*\*: thiếu/sai Bearer token, hoặc không đúng role/ownership.
- \*\*400 Bad Request\*\*: thiếu \`file\`, booking chưa \`DONE\`, client không trùng booking, booking không thuộc carwash, đã có feedback cho booking, \`rating\` ngoài \[1..5\].
- \*\*404 Not Found\*\*: sai \`{carwashId}/{feedbackId}/{mediaId}\`.
- \*\*500 Internal Server Error: Access Denied\*\*: do filter security/permission check; kiểm tra lại \`@PreAuthorize\` và token.
