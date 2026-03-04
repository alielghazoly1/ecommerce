import { MapPin, Phone } from 'lucide-react';

/** Maps address label keys to their Arabic display names. */
const LABEL_MAP = {
  home: 'المنزل',
  work: 'العمل',
};

const getAddressLabel = (label) => LABEL_MAP[label] ?? 'آخر';

/**
 * AddressCard
 * -----------
 * A single saved shipping address row.
 *
 * Props:
 *  - address {object} – { label, isDefault, street, city, state, phone }
 */
const AddressCard = ({ address }) => (
  <div
    className={`p-4 rounded-xl border-2 ${
      address.isDefault ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 bg-gray-50'
    }`}
  >
    <div className="flex items-start justify-between mb-2">
      <span className="font-semibold text-gray-900">{getAddressLabel(address.label)}</span>
      {address.isDefault && (
        <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full">افتراضي</span>
      )}
    </div>
    <p className="text-sm text-gray-600">
      {address.street}, {address.city}{address.state && `, ${address.state}`}
    </p>
    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
      <Phone className="w-3 h-3" />
      {address.phone}
    </p>
  </div>
);

/**
 * SavedAddresses
 * --------------
 * Shows the full list of the user's saved shipping addresses.
 * Renders nothing when the list is empty.
 *
 * Props:
 *  - addresses {Array} – user.addresses
 */
const SavedAddresses = ({ addresses = [] }) => {
  if (addresses.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-cyan-600" />
        عناوين الشحن المحفوظة
      </h3>
      <div className="space-y-3">
        {addresses.map((addr, idx) => (
          <AddressCard key={idx} address={addr} />
        ))}
      </div>
    </div>
  );
};

export default SavedAddresses;