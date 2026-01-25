# 🛍️ لوحة تحكم الأدمن - E-Commerce

لوحة تحكم إدارية لمشروع E-Commerce مبني باستخدام React + Vite.

## ✨ المميزات

- 🎨 واجهة مستخدم عصرية وجميلة
- 🔐 نظام مصادقة آمن
- 📦 إدارة المنتجات (إضافة، حذف، عرض)
- 📋 إدارة الطلبات
- 👥 إدارة المستخدمين
- 📱 متجاوب مع جميع الأجهزة
- 🌐 دعم كامل للغة العربية و RTL

## 🚀 البدء السريع

### المتطلبات

- Node.js 18+ 
- npm أو yarn

### التثبيت

1. استنساخ المشروع:
```bash
git clone <repository-url>
cd admin
```

2. تثبيت المكتبات:
```bash
npm install
```

3. إنشاء ملف `.env`:
```bash
cp .env.example .env
```

4. تعديل ملف `.env`:
```env
VITE_API_URL=http://localhost:4000
```

5. تشغيل المشروع:
```bash
npm run dev
```

المشروع سيعمل على `http://localhost:5173`

## 📁 هيكل المشروع

```
src/
├── components/      # المكونات
│   ├── Add.jsx      # إضافة منتج
│   ├── List.jsx     # قائمة المنتجات
│   ├── Orders.jsx   # الطلبات
│   ├── Users.jsx    # المستخدمين
│   ├── AdminLogin.jsx
│   ├── Sidebar.jsx
│   └── ProtectedRoute.jsx
├── context/         # Context API
│   └── AuthContext.jsx
├── config/          # الإعدادات
│   └── axiosConfig.js
└── main.jsx         # نقطة الدخول
```

## 🛠️ الأوامر المتاحة

```bash
# التطوير
npm run dev

# البناء للإنتاج
npm run build

# معاينة البناء
npm run preview

# فحص الكود
npm run lint
```

## 📚 التوثيق

راجع ملف [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) للاطلاع على توثيق API الكامل.

## 🔧 التقنيات المستخدمة

- **React 19** - مكتبة UI
- **Vite** - أداة البناء
- **React Router** - التوجيه
- **Axios** - طلبات HTTP
- **Tailwind CSS** - التصميم
- **Lucide React** - الأيقونات
- **React Hot Toast** - الإشعارات

## 📝 ملاحظات

- تأكد من أن API يعمل على المنفذ المحدد في `.env`
- جميع الطلبات تتطلب Token في Header
- الخطوط العربية المستخدمة: Cairo و Tajawal

## 🤝 المساهمة

نرحب بجميع المساهمات! يرجى فتح Issue أو Pull Request.

## 📄 الترخيص

هذا المشروع مفتوح المصدر.
