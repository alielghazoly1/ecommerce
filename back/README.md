# 🛒 مشروع E-Commerce Backend

مشروع E-Commerce كامل مبني باستخدام Node.js و Express.js و MongoDB.

## 📋 المحتويات

- [المميزات](#المميزات)
- [المتطلبات](#المتطلبات)
- [التثبيت](#التثبيت)
- [الإعداد](#الإعداد)
- [التشغيل](#التشغيل)
- [البنية](#البنية)
- [API Documentation](#api-documentation)
- [التقنيات المستخدمة](#التقنيات-المستخدمة)

## ✨ المميزات

- ✅ نظام مصادقة كامل (JWT)
- ✅ إدارة المستخدمين والصلاحيات
- ✅ إدارة المنتجات مع رفع الصور (Cloudinary)
- ✅ نظام سلة تسوق كامل
- ✅ نظام طلبات متقدم
- ✅ نظام تقييمات للمنتجات
- ✅ أمان عالي (Rate Limiting, Input Sanitization)
- ✅ Logging متقدم
- ✅ Monitoring Dashboard
- ✅ دعم Docker
- ✅ جاهز للنشر على Vercel

## 📦 المتطلبات

- Node.js 24.x أو أحدث
- MongoDB 7.x أو أحدث
- npm أو yarn

## 🚀 التثبيت

```bash
# استنساخ المشروع
git clone <repository-url>

# الانتقال للمجلد
cd back

# تثبيت المكتبات
npm install
```

## ⚙️ الإعداد

### 1. إنشاء ملف `.env`

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your-super-secret-key-here-min-32-chars

# Cloudinary (لرفع الصور)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=4000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional
ENABLE_RATE_LIMITING=true
LOG_LEVEL=INFO
DB_LOGGING=false
```

### 2. إعداد Cloudinary (اختياري)

1. سجل في [Cloudinary](https://cloudinary.com)
2. احصل على `Cloud Name`, `API Key`, و `API Secret`
3. أضفهم في ملف `.env`

## ▶️ التشغيل

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

السيرفر سيعمل على: `http://localhost:4000`

## 📁 البنية

```
back/
├── config/           # إعدادات قاعدة البيانات
├── controllers/      # Controllers للـ API
├── middleware/       # Middleware (Auth, Validation, etc.)
├── models/          # Mongoose Models
├── routes/          # API Routes
├── utils/           # Utilities (Logger, etc.)
├── index.js         # نقطة البداية
├── package.json     # Dependencies
└── .env             # Environment Variables
```

## 📚 API Documentation

للحصول على توثيق كامل للـ API، راجع ملف [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Endpoints الرئيسية

- **Users**: `/api/users/*`
- **Products**: `/api/product/*`
- **Cart**: `/api/cart/*`
- **Orders**: `/api/order/*`
- **Admin**: `/api/admin/*`
- **Monitoring**: `/api/monitoring/*`

## 🛠️ التقنيات المستخدمة

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Validation**: Validator.js
- **Security**: bcrypt, CORS, Rate Limiting
- **Logging**: Custom Logger
- **Deployment**: Vercel (Serverless)

## 🐳 Docker

### استخدام Docker Compose

```bash
# تشغيل المشروع مع MongoDB
docker-compose up -d

# إيقاف المشروع
docker-compose down
```

## 📊 Monitoring

يمكنك الوصول إلى Monitoring Dashboard (Admin Only):

```
http://localhost:4000/api/monitoring/dashboard
```

## 🔒 الأمان

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Input Sanitization
- ✅ CORS Protection
- ✅ Security Headers
- ✅ NoSQL Injection Prevention
- ✅ XSS Protection

## 📝 Scripts

```bash
# Development
npm run dev          # تشغيل مع nodemon

# Production
npm start            # تشغيل عادي
```

## 🌐 النشر

### Vercel

المشروع جاهز للنشر على Vercel:

1. اربط المشروع مع Vercel
2. أضف Environment Variables
3. Deploy!

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ Branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ Branch (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## 📄 الرخصة

هذا المشروع مفتوح المصدر.

## 👨‍💻 المطور

تم التطوير بواسطة فريق التطوير

---

**ملاحظة**: تأكد من إعداد جميع المتغيرات البيئية قبل التشغيل!
