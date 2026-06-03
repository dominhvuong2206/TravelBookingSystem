# Travel Booking System

Hệ thống đặt vé du lịch trực tuyến — project môn học.

## 🌐 Demo

| | URL |
|---|---|
| **Frontend (AWS S3)** | http://travel-booking-dmv.s3-website-ap-southeast-1.amazonaws.com/ |
| **Backend API (Railway)** | https://travelbookingsystem-production-e035.up.railway.app/TravelBookingSystem/api/ |

## Kiến trúc

```
TravelBookingSystem/
├── travel-booking-backend/   # Spring MVC + Hibernate + Tomcat (deploy Railway)
├── travel-booking-frontend/  # React (deploy AWS S3)
├── travelbookingdb.sql        # Schema database (utf8mb4)
└── seed-travel-sample-data.sql # Dữ liệu mẫu 100 dịch vụ
```

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Backend | Java 17, Spring MVC 6, Hibernate 6, Spring Security 6 |
| Frontend | React 19, React Router 6, Bootstrap 5, Chart.js, Axios |
| Database | MySQL 8 (utf8mb4) |
| Auth | JWT (nimbus-jose-jwt) + BCrypt |
| Upload ảnh | Cloudinary |
| Thanh toán | Stripe, PayPal, MoMo, ZaloPay |
| Deploy Backend | Railway (Docker + Tomcat 10) |
| Deploy Frontend | AWS S3 (Static Website Hosting) |

---

## Chức năng

### 👤 Customer
- Xem danh sách & tìm kiếm dịch vụ du lịch
- Xem chi tiết dịch vụ, đánh giá
- Đăng ký / Đăng nhập
- Đặt dịch vụ & thanh toán (Stripe, PayPal, MoMo, ZaloPay)
- Xem lịch sử booking
- So sánh dịch vụ
- Cập nhật hồ sơ cá nhân

### 🏢 Provider
- Quản lý dịch vụ (thêm / sửa / xóa)
- Xem booking của dịch vụ mình
- Xem thống kê doanh thu
- Quản lý đánh giá & phản hồi
- Xem lịch sử thanh toán

### 🔑 Admin
- Dashboard thống kê tổng quan
- Quản lý người dùng (kích hoạt / duyệt provider)
- Quản lý danh mục dịch vụ
- Xem lịch sử thanh toán toàn hệ thống

---

## Tài khoản demo

| Username | Password | Quyền |
|---|---|---|
| `admin` | `Admin@123` | Admin |
| `provider` | `Provider@123` | Provider |
| `customer` | `Customer@123` | Customer |

---

## Cài đặt & Chạy local

### Yêu cầu
- Java 17+
- Maven 3.9+
- MySQL 8+
- Node.js 18+
- Tomcat 10 (hoặc chạy qua Maven)

### 1. Tạo database local

```bash
mysql -u root -p < travelbookingdb.sql
mysql -u root -p travelbookingdb < seed-travel-sample-data.sql
```

### 2. Cấu hình backend

Chỉnh `travel-booking-backend/src/main/resources/databases.properties`:

```properties
hibernate.connection.url=jdbc:mysql://localhost:3306/travelbookingdb?useUnicode=true&characterEncoding=UTF-8&allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC
hibernate.connection.username=root
hibernate.connection.password=your_password
```

### 3. Chạy backend

```bash
cd travel-booking-backend
mvn clean package -DskipTests
# Deploy file target/travel-booking-backend-1.0-SNAPSHOT.war lên Tomcat local
# hoặc dùng Tomcat plugin
```

Backend chạy tại: `http://localhost:8080/TravelBookingSystem/`

### 4. Chạy frontend

```bash
cd travel-booking-frontend
npm install
npm start
```

Frontend chạy tại: `http://localhost:3000`

---

## 🚀 Deploy lên Production

### 🔧 Backend → Railway (mỗi lần sửa code Java)

Railway tự động rebuild khi nhận commit mới trên nhánh `main`.

```bash
# 1. Stage các file đã thay đổi
git add .

# 2. Commit với message mô tả thay đổi
git commit -m "feat: mô tả thay đổi"

# 3. Push lên GitHub → Railway tự rebuild
git push origin main
```

**Theo dõi tiến trình rebuild:**
> Railway Dashboard → click service **backend** → tab **Deployments**  
> Chờ trạng thái chuyển sang ✅ **Success** (khoảng 3–5 phút)

**Kiểm tra API sau khi deploy:**
> https://travelbookingsystem-production-e035.up.railway.app/TravelBookingSystem/api/categories/

---

### 🌐 Frontend → AWS S3 (mỗi lần sửa code React)

S3 **không** tự động rebuild — cần build và upload thủ công mỗi lần thay đổi.

**Bước 1 — Build production bundle:**

```bash
cd travel-booking-frontend
npm run build
```

> Output nằm trong thư mục `travel-booking-frontend/build/`

**Bước 2 — Upload lên S3:**

```bash
# Từ thư mục gốc TravelBookingSystem/
aws s3 sync travel-booking-frontend/build/ s3://travel-booking-dmv/ --delete
```

> Cờ `--delete` sẽ xóa các file cũ trên S3 không còn trong build mới.

**Kiểm tra sau khi upload:**
> http://travel-booking-dmv.s3-website-ap-southeast-1.amazonaws.com/

---

### 🔄 Sửa cả Backend lẫn Frontend cùng lúc

Thực hiện theo thứ tự:

```bash
# Bước 1: Push backend lên Railway trước
git add .
git commit -m "feat: mô tả thay đổi"
git push origin main

# Bước 2: Build và upload frontend lên S3
cd travel-booking-frontend
npm run build
cd ..
aws s3 sync travel-booking-frontend/build/ s3://travel-booking-dmv/ --delete
```

> **Lưu ý:** Nên đợi Railway rebuild xong rồi mới upload frontend,  
> tránh trường hợp frontend gọi API mới trong khi backend chưa cập nhật.

---

### 🗄️ Cập nhật Database Railway

Khi cần import lại hoặc cập nhật dữ liệu:

```bash
# Schema (DROP + CREATE lại bảng)
mysql -h acela.proxy.rlwy.net -u root -pMATKHAU --port 36684 --protocol=TCP railway < travelbookingdb.sql

# Dữ liệu mẫu
mysql -h acela.proxy.rlwy.net -u root -pMATKHAU --port 36684 --protocol=TCP railway < seed-travel-sample-data.sql
```

---

## Biến môi trường Railway (Backend)

| Biến | Mô tả |
|---|---|
| `MYSQLHOST` | Host MySQL nội bộ Railway (tự động) |
| `MYSQLPORT` | Port MySQL (tự động) |
| `MYSQLDATABASE` | Tên database (tự động) |
| `MYSQLUSER` | User MySQL (tự động) |
| `MYSQLPASSWORD` | Mật khẩu MySQL (tự động) |
| `FRONTEND_URL` | URL frontend S3 (cho CORS) |
| `CORS_ALLOWED_ORIGINS` | Danh sách origin được phép (có thể nhiều, cách nhau dấu phẩy) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config |
| `CLOUDINARY_API_KEY` | Cloudinary config |
| `CLOUDINARY_API_SECRET` | Cloudinary config |
| `STRIPE_SECRET_KEY` | Stripe payment |
| `PAYPAL_CLIENT_ID` | PayPal payment |
| `PAYPAL_CLIENT_SECRET` | PayPal payment |

---

## Cấu trúc API

```
/api/
├── auth/login              POST  - Đăng nhập, trả JWT
├── auth/register           POST  - Đăng ký customer/provider
├── services/               GET   - Danh sách dịch vụ (public)
├── services/{id}           GET   - Chi tiết dịch vụ (public)
├── categories/             GET   - Danh mục dịch vụ (public)
├── secure/
│   ├── admin/
│   │   ├── users/          GET/PUT - Quản lý user (ADMIN)
│   │   ├── categories/     GET/POST/PUT/DELETE - Quản lý danh mục (ADMIN)
│   │   ├── payments/       GET   - Lịch sử thanh toán (ADMIN)
│   │   └── stats/          GET   - Thống kê (ADMIN)
│   ├── provider/
│   │   ├── services/       GET/POST/PUT/DELETE - Quản lý dịch vụ (PROVIDER)
│   │   ├── bookings/       GET/PUT - Quản lý booking (PROVIDER)
│   │   ├── reviews/        GET/POST - Phản hồi đánh giá (PROVIDER)
│   │   ├── payments/       GET   - Lịch sử thanh toán (PROVIDER)
│   │   └── stats/          GET   - Thống kê doanh thu (PROVIDER)
│   ├── bookings/           GET/POST - Đặt dịch vụ (CUSTOMER)
│   └── payments/           GET   - Lịch sử thanh toán (CUSTOMER)
└── payments/
    ├── stripe/create       POST  - Tạo payment Stripe (CUSTOMER)
    ├── paypal/create       POST  - Tạo payment PayPal (CUSTOMER)
    ├── momo/create         POST  - Tạo payment MoMo (CUSTOMER)
    └── zalopay/create      POST  - Tạo payment ZaloPay (CUSTOMER)
```