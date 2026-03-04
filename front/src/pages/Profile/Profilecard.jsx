import { User, Mail, Phone, Calendar, Clock, Shield, CheckCircle, Edit } from 'lucide-react';
import { formatDate } from '../lib/utils';

/**
 * ProfileAvatar
 * -------------
 * Shows the user's avatar circle with an optional "email-verified" badge.
 */
const ProfileAvatar = ({ isEmailVerified }) => (
  <div className="relative inline-block mb-6">
    <div className="w-32 h-32 bg-linear-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white shadow-2xl">
      <User size={64} />
    </div>
    {isEmailVerified && (
      <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
        <CheckCircle className="w-6 h-6 text-white" />
      </div>
    )}
  </div>
);

/**
 * EditProfileForm
 * ---------------
 * Inline form shown when the user clicks "تعديل البيانات".
 *
 * Props:
 *  - editData      {object}   – { name, phone }
 *  - setEditData   {function} – state setter
 *  - onSave        {function} – called when the user confirms
 *  - onCancel      {function} – called when the user cancels
 */
const EditProfileForm = ({ editData, setEditData, onSave, onCancel }) => (
  <div className="space-y-4 mb-4">
    <input
      type="text"
      value={editData.name}
      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      placeholder="الاسم"
    />
    <input
      type="tel"
      value={editData.phone}
      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      placeholder="رقم الهاتف"
    />
    <div className="flex gap-2">
      <button onClick={onSave}   className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">حفظ</button>
      <button onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
    </div>
  </div>
);

/**
 * ProfileInfo
 * -----------
 * Read-only view of the user's name, email, phone, and edit button.
 */
const ProfileInfo = ({ user, onEdit }) => (
  <>
    <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
    <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
      <Mail className="w-4 h-4" />
      <p className="text-sm">{user.email}</p>
    </div>
    {user.phone && (
      <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
        <Phone className="w-4 h-4" />
        <p className="text-sm">{user.phone}</p>
      </div>
    )}
    <button
      onClick={onEdit}
      className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
    >
      <Edit className="w-4 h-4" />تعديل البيانات
    </button>
  </>
);

/**
 * ProfileCard
 * -----------
 * Main card in the left column.  Composes the avatar, info / edit form,
 * role badge, and membership meta (joined date, last login).
 *
 * Props:
 *  - user          {object}
 *  - isEditing     {boolean}
 *  - editData      {object}
 *  - setEditData   {function}
 *  - setIsEditing  {function}
 *  - updateProfile {function}
 */
const ProfileCard = ({ user, isEditing, editData, setEditData, setIsEditing, updateProfile }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
    <ProfileAvatar isEmailVerified={user.isEmailVerified} />

    {isEditing ? (
      <EditProfileForm
        editData={editData}
        setEditData={setEditData}
        onSave={updateProfile}
        onCancel={() => setIsEditing(false)}
      />
    ) : (
      <ProfileInfo user={user} onEdit={() => setIsEditing(true)} />
    )}

    {/* Role Badge */}
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-cyan-500 to-cyan-600 text-white rounded-full text-sm font-semibold shadow-lg">
      <Shield className="w-4 h-4" />
      {user.role === 'admin' ? 'مدير' : 'عضو'}
    </div>

    {/* Membership Meta */}
    <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>عضو منذ {formatDate(user.createdAt)}</span>
      </div>
      {user.lastLogin && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>آخر دخول: {formatDate(user.lastLogin)}</span>
        </div>
      )}
    </div>
  </div>
);

export default ProfileCard;