'use client';

import { useState } from 'react';
import { useGuestId } from '@/lib/hooks/useGuestId';
import { Loader2, Send, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'input' | 'generating_poem' | 'review' | 'generating_image' | 'result';

interface PoemData {
  poem: string[];
  explanation: string;
}

export default function Home() {
  const guestId = useGuestId();
  const [step, setStep] = useState<Step>('input');
  const [name, setName] = useState('');
  const [styleKeyword, setStyleKeyword] = useState('');
  const [style, setStyle] = useState('kaishu');
  const [frame, setFrame] = useState('none');
  const [poemData, setPoemData] = useState<PoemData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGeneratePoem = async () => {
    if (!name || name.length < 2) return;
    setStep('generating_poem');
    
    try {
      const res = await fetch('/api/generate-poem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, style, styleKeyword })
      });
      const data = await res.json();
      
      if (data.success) {
        setPoemData(data.data);
        setStep('review');
      } else {
        alert(data.error);
        setStep('input');
      }
    } catch (e) {
      console.error(e);
      alert('生成失败，请重试');
      setStep('input');
    }
  };

  const handleRenderImage = async () => {
    if (!poemData) return;
    setStep('generating_image');

    try {
      const res = await fetch('/api/render-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Guest-ID': guestId || ''
        },
        body: JSON.stringify({ 
          poem: poemData.poem, 
          style, 
          bg: 'rice_paper',
          frame,
          name // Pass name for the seal
        })
      });
      const data = await res.json();

      if (data.success) {
        setImageUrl(data.data.imageUrl);
        setStep('result');
      } else {
        alert(data.error);
        setStep('review');
      }
    } catch (e) {
      console.error(e);
      alert('生成图片失败');
      setStep('review');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-stone-50 text-stone-800">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-2 font-serif">姓名藏诗</h1>
          <p className="text-stone-600">国风书法 · 专属定制</p>
        </div>

        {step === 'input' && (
          <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">请输入姓名 (2-4字)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-500 outline-none transition"
                placeholder="例如：李清照"
                maxLength={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">风格关键词 (可选)</label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {['清新婉约', '豪放旷达', '空灵禅意', '边塞苍凉', '田园闲适'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setStyleKeyword(s);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer relative z-10 select-none",
                        styleKeyword === s
                          ? "bg-stone-800 text-white border-stone-800"
                          : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={styleKeyword}
                  onChange={(e) => setStyleKeyword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-500 outline-none transition mt-2"
                  placeholder="或输入自定义风格..."
                  maxLength={10}
                />
              </div>
            </div>
            
            <button
              onClick={handleGeneratePoem}
              disabled={!name || name.length < 2}
              className="w-full bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              立即生成
            </button>
          </div>
        )}

        {step === 'generating_poem' && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-stone-400 mb-4" />
            <p className="text-stone-500 animate-pulse">正在以此名作诗...</p>
          </div>
        )}

        {step === 'review' && poemData && (
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-stone-200">
             <div className="space-y-2 text-center">
               {poemData.poem.map((line, i) => (
                 <p key={i} className="text-xl font-serif text-stone-800 tracking-widest">{line}</p>
               ))}
             </div>
             <p className="text-xs text-stone-500 text-center border-t border-stone-100 pt-4">
               {poemData.explanation}
             </p>

             <div>
               <label className="block text-sm font-medium text-stone-700 mb-2">选择风格</label>
               <div className="grid grid-cols-2 gap-3">
                 {['kaishu', 'xingshu', 'caoshu', 'lishu', 'shoujin', 'mianhua'].map((s) => (
                   <button
                     key={s}
                     onClick={() => setStyle(s)}
                     className={cn(
                       "px-4 py-2 rounded-lg border text-sm transition-all",
                       style === s 
                         ? "bg-stone-800 text-white border-stone-800" 
                         : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                     )}
                   >
                     {s === 'kaishu' && '楷书 · 端正'}
                     {s === 'xingshu' && '行书 · 飘逸'}
                     {s === 'caoshu' && '草书 · 狂野'}
                     {s === 'lishu' && '隶书 · 古朴'}
                     {s === 'shoujin' && '瘦金体 · 清冷'}
                    {s === 'mianhua' && '棉花糖 · 俏皮'}
                   </button>
                 ))}
               </div>
             </div>
             
             <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">选择装裱</label>
              <select 
                value={frame} 
                onChange={(e) => setFrame(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="none">无框 (宣纸原浆)</option>
                <option value="silk_scroll">绫罗卷轴</option>
                <option value="redwood">红木画框</option>
                <option value="golden_wood">金丝楠木</option>
                <option value="cloud_brocade">云纹锦缎</option>
                <option value="modern_black">极简黑框</option>
                <option value="sakura_pink">樱花漫舞 (粉)</option>
                <option value="mint_green">清风竹影 (绿)</option>
                <option value="lavender_mist">紫气东来 (紫)</option>
                <option value="champagne_gold">流金岁月 (金)</option>
              </select>
             </div>

             <div className="flex gap-3">
               <button
                 onClick={() => setStep('input')}
                 className="flex-1 px-4 py-2 border border-stone-200 rounded-lg text-stone-600 text-sm hover:bg-stone-50"
               >
                 返回修改
               </button>
               <button
                 onClick={handleRenderImage}
                 className="flex-1 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800"
               >
                 生成书法图
               </button>
             </div>
          </div>
        )}

        {step === 'generating_image' && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-stone-400 mb-4" />
            <p className="text-stone-500 animate-pulse">正在挥毫泼墨...</p>
          </div>
        )}

        {step === 'result' && imageUrl && (
          <div className="space-y-6">
            <div className="relative aspect-[2/3] w-full bg-stone-200 rounded-lg overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Generated Poem" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-stone-200 rounded-lg text-stone-600 bg-white hover:bg-stone-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回调整
                </button>
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-stone-200 rounded-lg text-stone-600 bg-white hover:bg-stone-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  再来一首
                </button>
              </div>
              <a
                href={imageUrl}
                download={`name_poem_${new Date().getTime()}.png`}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white px-4 py-3 rounded-lg hover:bg-stone-800"
              >
                <Download className="w-4 h-4" />
                保存图片
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}