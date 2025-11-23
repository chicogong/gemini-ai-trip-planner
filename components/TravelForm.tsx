import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { MapPin, Calendar, Wallet, Users, Heart } from 'lucide-react';

interface TravelFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isSubmitting: boolean;
}

const INTERESTS_OPTIONS = [
  "历史文化", "美食探店", "自然徒步", 
  "冒险运动", "休闲疗养", "购物买买买", 
  "夜生活", "摄影打卡", "艺术展览", "小众秘境"
];

const TravelForm: React.FC<TravelFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<UserPreferences>({
    destination: '',
    duration: 3,
    budgetLevel: 'Moderate', // Keep internal value English for API logic if needed, but display Chinese
    interests: [],
    travelers: 'Couple'
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      }
      if (prev.interests.length >= 5) return prev; // Max 5
      return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination) return;
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-brand-600 p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">开启您的下一次冒险</h2>
        <p className="text-brand-100 opacity-90">告诉我们要去哪里，剩下的交给我们。</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Destination */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-slate-700">
            <MapPin className="w-4 h-4 mr-2 text-brand-500" />
            想去哪里？
          </label>
          <input
            type="text"
            required
            placeholder="例如：京都、巴黎、三亚..."
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Calendar className="w-4 h-4 mr-2 text-brand-500" />
              天数
            </label>
            <input
              type="number"
              min="1"
              max="14"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
              disabled={isSubmitting}
            />
          </div>

          {/* Travelers */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Users className="w-4 h-4 mr-2 text-brand-500" />
              出行人数/类型
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none bg-white"
              value={formData.travelers}
              onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="Solo Traveler">独自一人</option>
              <option value="Couple">情侣/夫妻</option>
              <option value="Family with Kids">亲子游</option>
              <option value="Group of Friends">朋友结伴</option>
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-slate-700">
            <Wallet className="w-4 h-4 mr-2 text-brand-500" />
            预算等级
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'Budget', label: '经济型' },
              { val: 'Moderate', label: '舒适型' },
              { val: 'Luxury', label: '豪华型' }
            ].map((level) => (
              <button
                key={level.val}
                type="button"
                onClick={() => setFormData({ ...formData, budgetLevel: level.val as any })}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                  formData.budgetLevel === level.val
                    ? 'bg-brand-50 border-brand-500 text-brand-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                }`}
                disabled={isSubmitting}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
            <Heart className="w-4 h-4 mr-2 text-brand-500" />
            兴趣偏好 (最多选5项)
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                disabled={isSubmitting}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  formData.interests.includes(interest)
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
            isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在规划行程...
            </span>
          ) : (
            '生成旅行攻略'
          )}
        </button>
      </form>
    </div>
  );
};

export default TravelForm;