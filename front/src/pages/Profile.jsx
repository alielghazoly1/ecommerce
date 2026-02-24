import {
  Loader2, ShoppingCart, User, Mail, Phone, MapPin, Calendar,
  Package, Heart, TrendingUp, Shield, Edit, CheckCircle, Clock, Award,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/ui/Toast';
import LazyImage from '../components/LazyImage';
import { useProfile } from '../hooks/useProfile';
import { useAllProducts } from '../store/selectors';
import { formatEGP, formatDate } from '../lib/utils';

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, bgColor, iconColor, valueColor }) => (
  <div className={`flex items-center justify-between p-3 ${bgColor} rounded-lg`}>
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <span className="font-medium text-gray-700">{label}</span>
    </div>
    <span className={`text-xl font-bold ${valueColor}`}>{value}</span>
  </div>
);

const ProfileCard = ({ user, isEditing, editData, setEditData, setIsEditing, updateProfile }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
    <div className="relative inline-block mb-6">
      <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white shadow-2xl">
        <User size={64} />
      </div>
      {user.isEmailVerified && (
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
      )}
    </div>

    {isEditing ? (
      <div className="space-y-4 mb-4">
        <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" placeholder="الاسم" />
        <input type="tel" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" placeholder="رقم الهاتف" />
        <div className="flex gap-2">
          <button onClick={updateProfile} className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">حفظ</button>
          <button onClick={() => setIsEditing(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
        </div>
      </div>
    ) : (
      <>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4"><Mail className="w-4 h-4" /><p className="text-sm">{user.email}</p></div>
        {user.phone && <div className="flex items-center justify-center gap-2 text-gray-600 mb-4"><Phone className="w-4 h-4" /><p className="text-sm">{user.phone}</p></div>}
        <button onClick={() => setIsEditing(true)} className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
          <Edit className="w-4 h-4" />تعديل البيانات
        </button>
      </>
    )}

    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full text-sm font-semibold shadow-lg">
      <Shield className="w-4 h-4" />{user.role === 'admin' ? 'مدير' : 'عضو'}
    </div>

    <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500"><Calendar className="w-4 h-4" /><span>عضو منذ {formatDate(user.createdAt)}</span></div>
      {user.lastLogin && <div className="flex items-center justify-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4" /><span>آخر دخول: {formatDate(user.lastLogin)}</span></div>}
    </div>
  </div>
);

const CartSection = ({ cartProducts, cartTotal }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><ShoppingCart className="w-7 h-7 text-cyan-600" />السلة الحالية</h2>
        {cartProducts.length > 0 && <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-bold">{cartProducts.length} منتج</span>}
      </div>

      {cartProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">السلة فارغة</h3>
          <p className="text-gray-600 mb-6">ابدأ التسوق الآن واستمتع بعروضنا المميزة</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg">
            تصفح المنتجات
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {cartProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                  <LazyImage src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">الكمية: {product.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-cyan-600">{formatEGP(product.price * product.quantity)}</p>
                  <p className="text-xs text-gray-500">{formatEGP(product.price)} للواحدة</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-gray-900">الإجمالي</span>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">{formatEGP(cartTotal)}</span>
            </div>
            <button onClick={() => navigate('/order')} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-bold text-lg hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg">
              إتمام الطلب
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    user, loading, toast, isEditing, editData,
    setEditData, setIsEditing, closeToast, updateProfile, authLoading,
  } = useProfile();

  const products = useAllProducts();

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin w-20 h-20 text-cyan-600" />
          <h2 className="text-2xl font-bold text-gray-800 mt-6">
            {authLoading ? 'جاري التحقق...' : 'جاري تحميل البروفايل...'}
          </h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">فشل تحميل بيانات المستخدم</p>
        </div>
      </div>
    );
  }

  const cartItems    = user.cartData || {};
  const cartProducts = Object.entries(cartItems)
    .map(([id, qty]) => {
      const product = products?.find((p) => p._id === id);
      return product ? { ...product, quantity: qty } : null;
    })
    .filter(Boolean);
  const cartTotal = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4">
      <Toast toast={toast} onClose={closeToast} />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard
              user={user}
              isEditing={isEditing}
              editData={editData}
              setEditData={setEditData}
              setIsEditing={setIsEditing}
              updateProfile={updateProfile}
            />

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-600" />إحصائيات الحساب
              </h3>
              <div className="space-y-4">
                <StatCard icon={Package}  label="إجمالي الطلبات" value={user.metadata?.totalOrders || 0}          bgColor="bg-cyan-50"   iconColor="text-cyan-600"   valueColor="text-cyan-600" />
                <StatCard icon={Award}    label="إجمالي الإنفاق"  value={formatEGP(user.metadata?.totalSpent || 0)} bgColor="bg-green-50"  iconColor="text-green-600"  valueColor="text-green-600" />
                <StatCard icon={Heart}    label="المفضلة"         value={user.wishlist?.length || 0}                bgColor="bg-purple-50" iconColor="text-purple-600" valueColor="text-purple-600" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
              <div className="space-y-3">
                <button onClick={() => navigate('/myorders')} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition shadow-lg">
                  <span className="flex items-center gap-3"><Package className="w-5 h-5" /><span className="font-semibold">عرض طلباتي</span></span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{user.metadata?.totalOrders || 0}</span>
                </button>
                <button onClick={() => navigate('/cart')} className="w-full flex items-center justify-between p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                  <span className="flex items-center gap-3"><ShoppingCart className="w-5 h-5" /><span className="font-semibold">السلة الحالية</span></span>
                  <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-bold">{user.cartStats?.totalItems || 0}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <CartSection cartProducts={cartProducts} cartTotal={cartTotal} />

            {user.addresses?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-cyan-600" />عناوين الشحن المحفوظة
                </h3>
                <div className="space-y-3">
                  {user.addresses.map((addr, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border-2 ${addr.isDefault ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-gray-900">{addr.label === 'home' ? 'المنزل' : addr.label === 'work' ? 'العمل' : 'آخر'}</span>
                        {addr.isDefault && <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full">افتراضي</span>}
                      </div>
                      <p className="text-sm text-gray-600">{addr.street}, {addr.city}{addr.state && `, ${addr.state}`}</p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{addr.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
