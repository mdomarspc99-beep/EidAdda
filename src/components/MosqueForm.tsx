import React, { useState, useEffect } from 'react';
import { Mosque, PrayerTime } from '../types';
import { X, Plus, Trash2, MapPin, Clock, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MosqueFormProps {
  mosque?: Mosque | null;
  onSave: (mosque: Partial<Mosque>) => Promise<void>;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

const MosqueForm: React.FC<MosqueFormProps> = ({ mosque, onSave, onClose, initialLat, initialLng }) => {
  const [name, setName] = useState(mosque?.name || '');
  const [address, setAddress] = useState(mosque?.address || '');
  const [lat, setLat] = useState(mosque?.lat || initialLat || 23.6850);
  const [lng, setLng] = useState(mosque?.lng || initialLng || 90.3563);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(
    mosque?.prayerTimes || [{ label: '1st Jamat', time: '7:30 AM' }]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPrayerTime = () => {
    if (prayerTimes.length < 10) {
      setPrayerTimes([...prayerTimes, { label: `Jamat ${prayerTimes.length + 1}`, time: '8:00 AM' }]);
    }
  };

  const handleRemovePrayerTime = (index: number) => {
    setPrayerTimes(prayerTimes.filter((_, i) => i !== index));
  };

  const handlePrayerTimeChange = (index: number, field: keyof PrayerTime, value: string) => {
    const newTimes = [...prayerTimes];
    newTimes[index][field] = value;
    setPrayerTimes(newTimes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || prayerTimes.some(pt => !pt.label || !pt.time)) {
      setError('অনুগ্রহ করে সব তথ্য পূরণ করুন।');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        name,
        address,
        lat,
        lng,
        prayerTimes,
      });
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      setError('তথ্য সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/90 sm:bg-black/60 sm:backdrop-blur-sm flex items-center justify-center p-4 z-[2000]"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold bengali-text">
              {mosque ? 'মসজিদ তথ্য পরিবর্তন' : 'নতুন মসজিদ যোগ করুন'}
            </h2>
            <p className="text-emerald-100 text-sm opacity-80">ঈদুল ফিতর ২০২৬ নামাজের সময়</p>
          </div>
          <button onClick={onClose} className="hover:bg-emerald-700 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                মসজিদের নাম (Mosque Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: বায়তুল মোকাররম জাতীয় মসজিদ"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                ঠিকানা (Address)
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="মসজিদের পূর্ণ ঠিকানা লিখুন..."
                rows={2}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                নামাজের সময় (Prayer Times)
              </label>
              <button
                type="button"
                onClick={handleAddPrayerTime}
                className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <Plus size={16} />
                আরও যোগ করুন
              </button>
            </div>

            <div className="space-y-3">
              {prayerTimes.map((pt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 items-center"
                >
                  <input
                    type="text"
                    value={pt.label}
                    onChange={(e) => handlePrayerTimeChange(index, 'label', e.target.value)}
                    placeholder="যেমন: ১ম জামাত"
                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <input
                    type="text"
                    value={pt.time}
                    onChange={(e) => handlePrayerTimeChange(index, 'time', e.target.value)}
                    placeholder="৭:৩০ AM"
                    className="w-24 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  {prayerTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePrayerTime(index)}
                      className="text-red-400 hover:text-red-600 p-2 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            {mosque ? 'তথ্য আপডেট করুন' : 'মসজিদ যোগ করুন'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MosqueForm;
