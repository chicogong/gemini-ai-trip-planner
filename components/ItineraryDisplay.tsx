import React, { useState, useEffect } from 'react';
import { TripItinerary } from '../types';
import { Clock, MapPin, CheckCircle2, Printer, FileText, ArrowLeft, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface ItineraryDisplayProps {
  data: TripItinerary;
  heroImage: string | null;
  onReset: () => void;
}

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ data, heroImage, onReset }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Calculate total budget for chart display purposes (sum of breakdown)
  const totalBudget = data.budget_breakdown.reduce((acc, curr) => acc + curr.amount, 0);

  // Fix for Recharts "width(-1)" warning: ensure chart only renders after component is mounted and has dimensions
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePDF = async () => {
    if (typeof window === 'undefined') return;
    const worker = (window as any).html2pdf;
    if (!worker) {
      alert("PDF 生成组件尚未加载完成，请稍后再试或刷新页面。");
      return;
    }

    setIsGeneratingPdf(true);
    
    // Scroll to top to ensure html2canvas captures the start of the document correctly
    window.scrollTo(0, 0);
    
    // Small delay to ensure any lazy loaded images or layout shifts are settled after scroll
    await new Promise(resolve => setTimeout(resolve, 500));

    const element = document.getElementById('itinerary-content');
    
    // Options for html2pdf
    const opt = {
      margin:       0,
      filename:     `${data.trip_title.replace(/\s+/g, '_')}_攻略.pdf`,
      image:        { type: 'jpeg', quality: 0.95 },
      html2canvas:  { 
        scale: 1.5, // Reduced from 2 to avoid huge memory usage/crashes on long pages
        useCORS: true, // Vital for external images
        allowTaint: true,
        logging: false,
        scrollY: 0
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await worker().set(opt).from(element).save();
    } catch (err: any) {
      console.error("PDF Generation failed", err);
      alert("PDF生成失败 (可能是因为跨域图片限制)。\n建议您使用右侧的【普通打印】按钮，并在打印选项中选择 '另存为 PDF'。");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadText = () => {
    // Generate Markdown content
    const { trip_title, destination_name, summary, packing_list, budget_breakdown, days } = data;
    
    let content = `# ${trip_title}\n\n`;
    content += `目的地: ${destination_name}\n`;
    content += `简介: ${summary}\n\n`;
    
    content += `## 📦 行前准备\n`;
    packing_list.forEach(item => content += `- [ ] ${item}\n`);
    content += `\n`;
    
    content += `## 💰 预算预估 (CNY)\n`;
    budget_breakdown.forEach(b => content += `- ${b.category}: ¥${b.amount}\n`);
    content += `**总计: ¥${totalBudget}** (约)\n\n`;
    
    content += `## 🗓️ 每日行程\n\n`;
    days.forEach(day => {
      content += `### 第 ${day.day_number} 天: ${day.theme}\n`;
      day.activities.forEach(act => {
        content += `#### ${act.time} - ${act.activity}\n`;
        content += `📍 ${act.location}\n`;
        content += `${act.description}\n\n`;
      });
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip_title.replace(/\s+/g, '_')}_攻略.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full animate-fade-in pb-12 print:pb-0">
      
      {/* Wrapper ID for PDF Generation - Excludes buttons */}
      <div id="itinerary-content" className="bg-slate-50">
        
        {/* Hero Section */}
        <div className="relative h-[400px] w-full bg-slate-900 overflow-hidden print:h-[300px]">
          {heroImage ? (
            <img 
              src={heroImage} 
              alt={data.destination_name} 
              className="w-full h-full object-cover opacity-80 print:opacity-100"
              crossOrigin="anonymous" // Important for html2canvas
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-900 to-slate-800 flex items-center justify-center">
              <span className="text-white opacity-20 text-xl">暂无图片</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent print:hidden" />
          
          {/* Back button - hidden in print/pdf */}
          <div className="absolute top-6 left-6 z-10 no-print" data-html2canvas-ignore="true">
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
              <span className="inline-block px-3 py-1 bg-brand-500/80 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-4 no-print" data-html2canvas-ignore="true">
                您的专属行程
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 shadow-sm hero-text-print">{data.trip_title}</h1>
              <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed hero-text-print">
                {data.summary}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8 md:-mt-16 relative z-10 print:mt-8 print:px-0">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:grid-cols-3">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 flex flex-col justify-between print:break-inside-avoid">
              <div>
                <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">预估预算 (CNY)</h3>
                <div className="text-3xl font-bold text-slate-800 flex items-baseline">
                  ¥{totalBudget.toLocaleString()} 
                  <span className="text-sm font-normal text-slate-500 ml-2">约</span>
                </div>
              </div>
              
              {/* Chart Container - Fixed height with min-w-0 for Recharts responsiveness */}
              <div className="mt-4 h-24 w-full min-w-0">
                {isMounted ? (
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
                        isAnimationActive={false} // Disable animation for print/pdf compatibility
                      >
                        {data.budget_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => `¥${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">Loading chart...</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 col-span-1 md:col-span-2 print:col-span-2 print:break-inside-avoid">
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4">行前准备 / 必带物品</h3>
              <div className="flex flex-wrap gap-2">
                {data.packing_list.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-sm border border-slate-200 print:bg-white print:border-slate-300">
                    <CheckCircle2 className="w-3 h-3 mr-2 text-brand-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Itinerary */}
          <div className="space-y-12 print:space-y-8 pb-8">
            {data.days.map((day, dayIdx) => (
              <div key={dayIdx} className="relative print-break-inside-avoid">
                {/* Day Marker */}
                <div className="sticky top-4 z-20 flex items-center mb-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-100 print:static print:shadow-none print:border-none print:p-0 print:mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20 print:shadow-none print:border print:border-brand-500 print:text-brand-500 print:bg-white">
                    {day.day_number}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-slate-800">第 {day.day_number} 天</h2>
                    <p className="text-brand-600 font-medium">{day.theme}</p>
                  </div>
                </div>

                {/* Activities Timeline */}
                <div className="ml-6 md:ml-6 pl-8 md:pl-12 border-l-2 border-slate-200 space-y-10 pb-8 print:pb-4 print:space-y-6">
                  {day.activities.map((activity, actIdx) => (
                    <div key={actIdx} className="relative group print-break-inside-avoid">
                      <div className="absolute -left-[41px] md:-left-[57px] top-1 w-5 h-5 bg-white border-4 border-brand-500 rounded-full group-hover:scale-125 transition-transform print:hidden" />
                      
                      <div className="bg-white rounded-2xl p-0 shadow-md border border-slate-100 hover:shadow-xl transition-shadow overflow-hidden flex flex-col md:flex-row print:shadow-none print:border-slate-200">
                        {/* Activity Image - Generated Contextually via Pollinations.ai */}
                        <div className="w-full md:w-48 h-48 md:h-auto bg-slate-200 flex-shrink-0 relative overflow-hidden print:w-32 print:h-32">
                            <img 
                              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(activity.activity + ' ' + data.destination_name + ' scenery photography')}?width=400&height=400&nologo=true&model=flux`}
                              alt={activity.activity}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 print:transform-none"
                              loading="eager"
                              crossOrigin="anonymous" // Important for html2canvas
                            />
                        </div>

                        <div className="p-6 flex-1 print:p-4">
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
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer - Outside the printable area ID */}
      <div className="mt-8 mb-20 flex flex-col sm:flex-row justify-center items-center gap-4 no-print relative z-50 px-4">
          <button 
            onClick={handleDownloadText}
            className="inline-flex items-center w-full sm:w-auto justify-center px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-full font-bold shadow-md hover:bg-slate-50 hover:shadow-lg hover:border-brand-300 transition-all cursor-pointer"
          >
            <FileText className="w-5 h-5 mr-2 text-brand-500" />
            文本攻略
          </button>
          
          <button 
            onClick={handleGeneratePDF}
            disabled={isGeneratingPdf}
            className={`inline-flex items-center w-full sm:w-auto justify-center px-8 py-3 bg-brand-600 text-white rounded-full font-bold shadow-lg shadow-brand-500/30 transition-all cursor-pointer ${isGeneratingPdf ? 'opacity-80 cursor-wait' : 'hover:bg-brand-500 hover:shadow-xl hover:-translate-y-0.5'}`}
          >
            {isGeneratingPdf ? (
               <>
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在生成 PDF...
               </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                下载 PDF 攻略
              </>
            )}
          </button>

          <button 
            onClick={handlePrint}
            className="inline-flex items-center justify-center p-3 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 hover:shadow-lg transition-all cursor-pointer"
            title="普通打印 (省墨模式)"
          >
            <Printer className="w-5 h-5" />
          </button>
      </div>
    </div>
  );
};

export default ItineraryDisplay;