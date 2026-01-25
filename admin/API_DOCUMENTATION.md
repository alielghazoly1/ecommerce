
# 📚 توثيق API - مشروع E-Commerce

## 📋 جدول المحتويات

1. [مقدمة](#مقدمة)
2. [المتطلبات الأساسية](#المتطلبات-الأساسية)
3. [الإعداد الأولي](#الإعداد-الأولي)
4. [المصادقة (Authentication)](#المصادقة-authentication)
5. [Endpoints المستخدمين](#endpoints-المستخدمين)
6. [Endpoints المنتجات](#endpoints-المنتجات)
7. [Endpoints السلة](#endpoints-السلة)
8. [Endpoints الطلبات](#endpoints-الطلبات)
9. [Endpoints الأدمن](#endpoints-الأدمن)
10. [كودات الأخطاء](#كودات-الأخطاء)
11. [أمثلة الاستخدام](#أمثلة-الاستخدام)

---

## 🎯 مقدمة

هذا التوثيق يشرح كيفية التعامل مع API الخاص بمشروع E-Commerce. الـ API مبني باستخدام Node.js و Express.js و MongoDB.

### Base URL
```
http://localhost:4000/api
```

### تنسيق الاستجابة
جميع الاستجابات تأتي بتنسيق JSON:
```json
{
  "success": true/false,
  "message": "رسالة توضيحية",
  "data": { ... }
}
```

---

## 📦 المتطلبات الأساسية

### المتغيرات البيئية المطلوبة (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Secret
JWT_SECRET=your-secret-key-here

# Cloudinary (لرفع الصور)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=4000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## ⚙️ الإعداد الأولي

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. تشغيل السيرفر
```bash
# Development
npm run dev

# Production
npm start
```

### 3. التحقق من عمل السيرفر
```bash
GET http://localhost:4000/health
```

---

## 🔐 المصادقة (Authentication)

جميع الـ endpoints المحمية تتطلب إرسال Token في Header:

```
Authorization: Bearer <your-token>
```

### الحصول على Token
يتم الحصول على Token من خلال:
- تسجيل الدخول (`POST /api/users/login`)
- التسجيل (`POST /api/users/register`)

---

## 👤 Endpoints المستخدمين

### 1. تسجيل الدخول
```http
POST /api/users/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `404`: المستخدم غير موجود
- `401`: كلمة المرور خاطئة

---

### 2. التسجيل
```http
POST /api/users/register
```

**Body:**
```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `409`: المستخدم موجود بالفعل
- `400`: بيانات غير صحيحة

---

### 3. الحصول على الملف الشخصي
```http
GET /api/users/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "role": "user"
  }
}
```

---

### 4. الحصول على جميع المستخدمين (Admin Only)
```http
GET /api/users/list
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "role": "user"
    }
  ]
}
```

---

### 5. حذف مستخدم (Admin Only)
```http
DELETE /api/users/delete/:id
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 6. ترقية مستخدم إلى Admin (Admin Only)
```http
PUT /api/users/make-admin/:id
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User promoted to admin",
  "data": { ... }
}
```

---

### 7. إلغاء صلاحيات Admin (Admin Only)
```http
PUT /api/users/demote/:id
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Admin demoted to user",
  "data": { ... }
}
```

---

## 🛍️ Endpoints المنتجات

### 1. الحصول على جميع المنتجات
```http
GET /api/product/list
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "منتج 1",
      "description": "وصف المنتج",
      "price": 100,
      "image": "https://...",
      "category": "electronics",
      "stock": 50
    }
  ],
  "count": 10
}
```

---

### 2. إضافة منتج (Admin Only)
```http
POST /api/product/add
```

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `name`: اسم المنتج
- `description`: وصف المنتج
- `price`: السعر
- `category`: الفئة
- `image`: ملف الصورة

**Response (200):**
```json
{
  "success": true,
  "message": "Product Added Successfully",
  "product": {
    "id": "...",
    "name": "منتج جديد",
    "price": 100,
    "image": "https://..."
  }
}
```

---

### 3. حذف منتج (Admin Only)
```http
POST /api/product/remove
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "id": "product-id-here"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product Removed Successfully"
}
```

---

### 4. البحث عن منتجات
```http
GET /api/product/search?q=search-term
```

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 5
}
```

---

### 5. المنتجات المميزة
```http
GET /api/product/featured
```

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 10
}
```

---

### 6. الأكثر مبيعاً
```http
GET /api/product/best-sellers
```

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 10
}
```

---

### 7. إضافة تقييم لمنتج
```http
POST /api/product/review
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "productId": "product-id",
  "rating": 5,
  "comment": "منتج رائع!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review added successfully",
  "ratings": {
    "average": 4.5,
    "count": 10
  }
}
```

---

## 🛒 Endpoints السلة

جميع endpoints السلة تحتاج إلى Token.

### 1. إضافة منتج للسلة
```http
POST /api/cart/add
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id": "product-id",
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Added to cart",
  "cartData": {
    "product-id": 2
  }
}
```

---

### 2. تقليل الكمية من السلة
```http
POST /api/cart/remove-one
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id": "product-id"
}
```

**Response (200):**
```json
{
  "success": true,
  "cartData": { ... }
}
```

---

### 3. حذف منتج من السلة
```http
POST /api/cart/remove-all
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id": "product-id"
}
```

**Response (200):**
```json
{
  "success": true,
  "cartData": { ... }
}
```

---

### 4. الحصول على السلة
```http
POST /api/cart/get
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "cartData": {
    "product-id-1": 2,
    "product-id-2": 1
  }
}
```

---

### 5. تفريغ السلة
```http
POST /api/cart/clear
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared",
  "cartData": { ... }
}
```

---

## 📦 Endpoints الطلبات

### 1. إنشاء طلب
```http
POST /api/order/place
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "items": [
    {
      "id": "product-id",
      "quantity": 2
    }
  ],
  "address": {
    "street": "شارع النيل",
    "city": "القاهرة",
    "state": "القاهرة",
    "zipCode": "12345",
    "country": "Egypt",
    "phone": "01234567890"
  },
  "amount": 200,
  "paymentMethod": "cash",
  "notes": "ملاحظات إضافية"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "id": "...",
    "orderNumber": "ORD-20241225-1234",
    "totalAmount": 200,
    "status": "pending",
    "itemsCount": 2
  }
}
```

---

### 2. الحصول على طلبات المستخدم
```http
POST /api/order/userorders
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "orderNumber": "ORD-20241225-1234",
      "items": [ ... ],
      "totalAmount": 200,
      "status": "pending",
      "createdAt": "2024-12-25T10:00:00.000Z"
    }
  ],
  "count": 5
}
```

---

### 3. الحصول على جميع الطلبات (Admin Only)
```http
GET /api/order/list?status=pending&limit=50
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `status`: حالة الطلب (pending, processing, shipped, delivered, cancelled)
- `limit`: عدد النتائج (افتراضي: 100)

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 10
}
```

---

### 4. تحديث حالة الطلب (Admin Only)
```http
POST /api/order/status
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "orderId": "order-id",
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "order": {
    "id": "...",
    "orderNumber": "ORD-20241225-1234",
    "status": "shipped",
    "trackingNumber": "TRACK123456"
  }
}
```

**حالات الطلب المتاحة:**
- `pending`: قيد الانتظار
- `processing`: قيد المعالجة
- `shipped`: تم الشحن
- `delivered`: تم التسليم
- `cancelled`: ملغي

---

## 👨‍💼 Endpoints الأدمن

### 1. تسجيل دخول الأدمن
```http
POST /api/admin/login
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Admin",
    "email": "admin@example.com"
  }
}
```

---

### 2. التحقق من صلاحيات الأدمن
```http
GET /api/admin/verify
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Valid admin token",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**ملاحظة:** الاستجابة تحتوي على `user` وليس `admin` في الكود الفعلي.

---

## ❌ كودات الأخطاء

### كودات HTTP الشائعة

| الكود | المعنى | الوصف |
|------|--------|-------|
| 200 | OK | الطلب نجح |
| 201 | Created | تم الإنشاء بنجاح |
| 400 | Bad Request | بيانات غير صحيحة |
| 401 | Unauthorized | غير مصرح - تحتاج تسجيل دخول |
| 403 | Forbidden | ممنوع - تحتاج صلاحيات أعلى |
| 404 | Not Found | غير موجود |
| 409 | Conflict | تعارض (مثل: مستخدم موجود) |
| 413 | Payload Too Large | حجم الملف كبير جداً |
| 429 | Too Many Requests | طلبات كثيرة جداً |
| 500 | Internal Server Error | خطأ في السيرفر |
| 503 | Service Unavailable | الخدمة غير متاحة |

### تنسيق رسالة الخطأ
```json
{
  "success": false,
  "message": "رسالة الخطأ",
  "errors": ["تفاصيل إضافية"] // اختياري
}
```

---

## 💡 أمثلة الاستخدام

### مثال 1: تسجيل الدخول والحصول على Token
```javascript
// باستخدام Axios
const response = await axios.post('http://localhost:4000/api/users/login', {
  email: 'user@example.com',
  password: 'password123'
});

const token = response.data.token;
localStorage.setItem('token', token);
```

### مثال 2: إضافة منتج للسلة
```javascript
const token = localStorage.getItem('token');

await axios.post(
  'http://localhost:4000/api/cart/add',
  { id: 'product-id', quantity: 2 },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

### مثال 3: إنشاء طلب
```javascript
const token = localStorage.getItem('token');

const order = await axios.post(
  'http://localhost:4000/api/order/place',
  {
    items: [
      { id: 'product-id-1', quantity: 2 },
      { id: 'product-id-2', quantity: 1 }
    ],
    address: {
      street: 'شارع النيل',
      city: 'القاهرة',
      phone: '01234567890'
    },
    amount: 500,
    paymentMethod: 'cash'
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
```

### مثال 4: رفع صورة منتج (Admin)
```javascript
const token = localStorage.getItem('token');
const formData = new FormData();

formData.append('name', 'منتج جديد');
formData.append('description', 'وصف المنتج');
formData.append('price', '100');
formData.append('category', 'electronics');
formData.append('image', fileInput.files[0]);

await axios.post(
  'http://localhost:4000/api/product/add',
  formData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }
);
```

---

## 🔒 الأمان

### Rate Limiting
- **Login/Register**: 5 محاولات كل 15 دقيقة
- **API العامة**: 100 طلب كل 15 دقيقة
- **Admin Operations**: 20 طلب كل 15 دقيقة

### Security Headers
السيرفر يرسل تلقائياً:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`

### Input Sanitization
جميع المدخلات يتم تنظيفها تلقائياً من:
- HTML tags
- SQL injection attempts
- NoSQL injection attempts
- XSS attacks

---

## 📝 ملاحظات مهمة

1. **Token Expiry**: الـ Token صالح لمدة 24 ساعة
2. **File Size**: الحد الأقصى لحجم الصورة 5MB
3. **Image Format**: الصور المدعومة: JPG, PNG, GIF, WebP
4. **Pagination**: بعض الـ endpoints تدعم `limit` في query parameters
5. **Error Handling**: جميع الأخطاء تعود بتنسيق موحد

---

## 🆘 الدعم

في حالة وجود مشاكل:
1. تحقق من الـ Token
2. تحقق من صحة البيانات المرسلة
3. راجع كودات الأخطاء أعلاه
4. تحقق من logs السيرفر

---

**آخر تحديث**: ديسمبر 2024
**الإصدار**: 1.0.0
