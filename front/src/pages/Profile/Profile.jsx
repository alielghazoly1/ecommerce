import { Loader2, User } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import { useProfile } from '../../hooks/useProfile';
import { useAllProducts } from '../../store/selectors';

import ProfileCard from './Profilecard';
import AccountStats from './Accountstats';
import QuickActions from './Quickactions';
import CartSection from './Cartsection';
import SavedAddresses from './Savedaddresses';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derives the list of cart products (with quantity) from the raw cartData map
 * and the global products list.
 */
const buildCartProducts = (cartData = {}, products = []) =>
  Object.entries(cartData)
    .map(([id, quantity]) => {
      const product = products.find((p) => p._id === id);
      return product ? { ...product, quantity } : null;
    })
    .filter(Boolean);

// ─── Loading / Error screens ───────────────────────────────────────────────────

const LoadingScreen = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
    <div className="flex flex-col items-center">
      <Loader2 className="animate-spin w-20 h-20 text-cyan-600" />
      <h2 className="text-2xl font-bold text-gray-800 mt-6">{message}</h2>
    </div>
  </div>
);

const ErrorScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
    <div className="text-center">
      <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
      <p className="text-xl text-gray-600 mb-4">فشل تحميل بيانات المستخدم</p>
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────

/**
 * ProfilePage
 * -----------
 * Top-level profile page.  Responsible only for:
 *  1. Reading state from hooks
 *  2. Deriving cart products
 *  3. Composing layout with purpose-built sub-components
 *
 * All rendering logic lives in the imported components above.
 */
const Profile = () => {
  const {
    user,
    loading,
    toast,
    isEditing,
    editData,
    setEditData,
    setIsEditing,
    closeToast,
    updateProfile,
    authLoading,
  } = useProfile();

  const products = useAllProducts();

  // ── Loading / error guards ──────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <LoadingScreen
        message={authLoading ? 'جاري التحقق...' : 'جاري تحميل البروفايل...'}
      />
    );
  }

  if (!user) return <ErrorScreen />;

  // ── Derived data ────────────────────────────────────────────────────────────
  const cartProducts = buildCartProducts(user.cartData, products);
  const cartTotal = cartProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );

  // ── Layout ──────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 py-12 px-4">
      <Toast toast={toast} onClose={closeToast} />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard
              user={user}
              isEditing={isEditing}
              editData={editData}
              setEditData={setEditData}
              setIsEditing={setIsEditing}
              updateProfile={updateProfile}
            />

            <AccountStats metadata={user.metadata} />

            <QuickActions
              totalOrders={user.metadata?.totalOrders}
              totalItems={user.cartStats?.totalItems}
            />
          </div>

          {/* ── Right column ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <CartSection cartProducts={cartProducts} cartTotal={cartTotal} />
            <SavedAddresses addresses={user.addresses} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
