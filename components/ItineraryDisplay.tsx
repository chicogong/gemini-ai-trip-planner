import React from 'react';
import { TripItinerary } from '../types';
import { Clock, MapPin, CheckCircle2, DollarSign, Download, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface ItineraryDisplayProps {
  data: TripItinerary;
  heroImage: string | null;
  onReset: () => void;
}

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ data, heroImage, onReset }) => {
  
  // Calculate total budget for chart display purposes (sum of breakdown)
  const totalBudget = data.budget_breakdown.reduce((acc, curr) => acc + curr.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full bg-slate-900 overflow-hidden">
        {heroImage ? (
          <img 
            src={heroImage} 
            alt={data.destination_name} 
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-900 to-slate-800 flex items-center justify-center">
            <span className="text-white opacity-20 text-xl">暂无图片</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={onReset}
            className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            重新规划
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <div className="max-w-5xl mx-auto">
            <span className="inline-block px-3 py-1 bg-brand-500/80 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              您的专属行程
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 shadow-sm">{data.trip_title}</h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed">
              {data.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8 md:-mt-16 relative z-10">
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">预估预算 (CNY)</h3>
              <div className="text-3xl font-bold text-slate-800 flex items-baseline">
                ¥{totalBudget.toLocaleString()} 
                <span className="text-sm font-normal text-slate-500 ml-2">约</span>
              </div>
            </div>
            <div className="mt-4 h-24">
               {/* Mini Budget Chart */}
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.budget_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {data.budget_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `¥${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 col-span-1 md:col-span-2">
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4">行前准备 / 必带物品</h3>
            <div className="flex flex-wrap gap-2">
              {data.packing_list.map((item, idx) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-sm border border-slate-200">
                  <CheckCircle2 className="w-3 h-3 mr-2 text-brand-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Itinerary */}
        <div className="space-y-12">
          {data.days.map((day, dayIdx) => (
            <div key={dayIdx} className="relative">
              {/* Day Marker */}
              <div className="sticky top-4 z-20 flex items-center mb-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
                  {day.day_number}
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-slate-800">第 {day.day_number} 天</h2>
                  <p className="text-brand-600 font-medium">{day.theme}</p>
                </div>
              </div>

              {/* Activities Timeline */}
              <div className="ml-6 md:ml-6 pl-8 md:pl-12 border-l-2 border-slate-200 space-y-10 pb-8">
                {day.activities.map((activity, actIdx) => (
                  <div key={actIdx} className="relative group">
                    <div className="absolute -left-[41px] md:-left-[57px] top-1 w-5 h-5 bg-white border-4 border-brand-500 rounded-full group-hover:scale-125 transition-transform" />
                    
                    <div className="bg-white rounded-2xl p-0 shadow-md border border-slate-100 hover:shadow-xl transition-shadow overflow-hidden flex flex-col md:flex-row">
                       {/* Activity Image - Generated Contextually via Pollinations.ai */}
                       <div className="w-full md:w-48 h-48 md:h-auto bg-slate-200 flex-shrink-0 relative overflow-hidden">
                          <img 
                            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(activity.activity + ' ' + data.destination_name + ' scenery photography')}?width=400&height=400&nologo=true&model=flux`}
                            alt={activity.activity}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                       </div>

                       <div className="p-6 flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                             <div className="flex items-center text-brand-600 font-bold mb-1 md:mb-0">
                                <Clock className="w-4 h-4 mr-2" />
                                {activity.time}
                             </div>
                             <div className="flex items-center text-slate-500 text-sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                {activity.location}
                             </div>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">{activity.activity}</h3>
                          <p className="text-slate-600 leading-relaxed">{activity.description}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="mt-16 mb-20 text-center">
            <button 
              onClick={handlePrint}
              className="inline-flex items-center px-8 py-4 bg-slate-800 text-white rounded-full font-bold shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              保存 / 打印行程
            </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDisplay;