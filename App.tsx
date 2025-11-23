import React, { useState } from 'react';
import { TripItinerary, UserPreferences, AppState } from './types';
import * as geminiService from './services/geminiService';
import TravelForm from './components/TravelForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import { Plane } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [tripData, setTripData] = useState<TripItinerary | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFormSubmit = async (prefs: UserPreferences) => {
    setAppState(AppState.GENERATING);
    setErrorMsg('');
    
    try {
      // 1. Generate the Text Content (Itinerary)
      const itinerary = await geminiService.generateItinerary(
        prefs.destination,
        prefs.duration,
        prefs.budgetLevel,
        prefs.interests,
        prefs.travelers
      );
      setTripData(itinerary);

      // 2. Generate the Hero Image based on the destination and generated title
      // We start this parallel but wait for it to render
      // Using destination_name which should be in Chinese, but image models work fine with it.
      const generatedImage = await geminiService.generateHeroImage(
        itinerary.destination_name,
        itinerary.trip_title + " travel vibes"
      );
      setHeroImage(generatedImage);

      setAppState(AppState.DISPLAY);
    } catch (error: any) {
      console.error("Error generating trip:", error);
      setErrorMsg(error.message || "出错了，请检查网络或稍后重试。");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setTripData(null);
    setHeroImage(null);
    setAppState(AppState.IDLE);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Header - Only show on IDLE or LOADING or ERROR states. Display handles its own header logic. */}
      {appState !== AppState.DISPLAY && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-brand-500 p-1.5 rounded-lg text-white">
                <Plane className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
                WanderAI 漫游
              </h1>
            </div>
          </div>
        </header>
      )}

      <main className="">
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            <div className="relative z-10 w-full flex flex-col items-center">
               <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
                 定制您的梦想之旅
               </h1>
               <p className="text-lg text-slate-100 mb-10 text-center max-w-xl drop-shadow-md">
                 AI 智能生成，为您量身打造预算、兴趣完美匹配的旅行攻略。
               </p>
               <TravelForm onSubmit={handleFormSubmit} isSubmitting={false} />
            </div>
          </div>
        )}

        {appState === AppState.GENERATING && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-t-4 border-brand-500 border-solid rounded-full animate-spin"></div>
              <div className="absolute inset-3 border-t-4 border-brand-300 border-solid rounded-full animate-spin-reverse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Plane className="w-8 h-8 text-brand-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">正在精心制作攻略...</h2>
            <p className="text-slate-500 max-w-md animate-pulse">
              正在分析当地热门景点、核算预算并安排最佳路线。
            </p>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-red-500 max-w-md text-center">
              <div className="text-red-500 mb-4 flex justify-center">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">哎呀！出错了</h3>
              <p className="text-slate-600 mb-6">{errorMsg}</p>
              <button 
                onClick={handleReset}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        )}

        {appState === AppState.DISPLAY && tripData && (
          <ItineraryDisplay 
            data={tripData} 
            heroImage={heroImage} 
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  );
}

export default App;