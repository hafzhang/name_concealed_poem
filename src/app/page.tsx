'use client';

import { useState } from 'react';
import { useGuestId } from '@/lib/hooks/useGuestId';
import { usePoemGenerator } from '@/hooks/usePoemGenerator';
import { Loader2, Send, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'input' | 'generating_poem' | 'review' | 'generating_image' | 'result';

interface PoemData {
  poem: string[];
  explanation: string;
  originalName?: string;
  processedName?: string;
  lineCount?: number;
}

export default function Home() {
  const guestId = useGuestId();
  const [step, setStep] = useState<Step>('input');
  const [name, setName] = useState('');
  const [style, setStyle] = useState('kaishu');
  const [frame, setFrame] = useState('none');
  const [poemData, setPoemData] = useState<PoemData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // 使用 Hook 管理风格选择、行数选择、分类展开状态
  const {
    lineCount,
    styleKeyword,
    expandedCategories,
    STYLE_CATEGORIES,
    setLineCount,
    setStyleKeyword,
    toggleCategory,
    generateRequestParams
  } = usePoemGenerator();

  const handleGeneratePoem = async () => {
    if (!name || name.length < 2) return;
    setStep('generating_poem');

    // 使用 Hook 生成请求参数（包含名字处理逻辑）
    const params = generateRequestParams(name, style);

    console.log(`生成藏头诗 - 原始名字: ${name}, 处理后名字: ${params.name}, 行数: ${params.lineCount}`);

    try {
      const res = await fetch('/api/generate-poem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
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

            {/* 几行诗选择 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="font-medium text-stone-800">几行诗</h3>
              </div>
              <div className="flex gap-3">
                {[2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLineCount(num)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm transition-all flex-1",
                      lineCount === num
                        ? "bg-stone-800 text-white border-stone-800"
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                    )}
                  >
                    {num}行
                  </button>
                ))}
              </div>
              {lineCount === 2 && name.length >= 3 && (
                <p className="text-xs text-stone-500">提示：2行诗将使用名字的后两个字</p>
              )}
            </div>

            {/* 风格选择 - 分类展示 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="font-medium text-stone-800">风格</h3>
              </div>

              {/* 按分类渲染风格选项 */}
              {Object.entries(STYLE_CATEGORIES).map(([category, styles]) => (
                <div key={category} className="space-y-2">
                  {/* 分类标题（可点击展开/收起） */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex items-center justify-between w-full text-left px-2 py-1 hover:bg-stone-50 rounded"
                  >
                    <span className="text-sm font-medium text-stone-700">{category}</span>
                    <span className={cn(
                      "text-stone-400 transition-transform text-xs",
                      expandedCategories[category] ? "rotate-180" : ""
                    )}>
                      ▼
                    </span>
                  </button>

                  {/* 风格按钮网格 */}
                  {expandedCategories[category] !== false && (
                    <div className="grid grid-cols-4 gap-2">
                      {styles.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStyleKeyword(s)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer select-none",
                            styleKeyword === s
                              ? "bg-stone-800 text-white border-stone-800"
                              : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* 自由输入框 */}
              <input
                type="text"
                value={styleKeyword}
                onChange={(e) => setStyleKeyword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-500 outline-none transition"
                placeholder={styleKeyword ? "" : "或输入自定义风格..."}
                maxLength={10}
              />
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