'use client';

import { useState } from 'react';
import { useGuestId } from '@/lib/hooks/useGuestId';
import { usePoemGenerator } from '@/hooks/usePoemGenerator';
import { Loader2, Send, Download, RefreshCw, ArrowLeft, ChevronDown, ChevronUp, PenLine } from 'lucide-react';
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
    const params = generateRequestParams(name, style);

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
    // Request image generation
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
          name
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
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* 装饰背景 */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-800 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-800 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-700 to-red-900 rounded-full mb-4 shadow-lg">
            <PenLine className="w-8 h-8 text-amber-100" />
          </div>
          <h1 className="text-5xl font-bold text-red-900 mb-3 tracking-wider" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            姓名藏诗
          </h1>
          <p className="text-lg text-red-700 font-medium tracking-wide">国风书法 · 专属定制</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-400"></div>
            <div className="text-red-400 text-xs">✦ 传世经典 ✦</div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-400"></div>
          </div>
        </div>

        {step === 'input' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200/50 p-6 space-y-6">
            {/* 姓名输入 */}
            <div>
              <label className="block text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                请输入姓名 (2-4字)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-amber-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition text-lg bg-amber-50/50"
                placeholder="例如：李清照"
                maxLength={4}
              />
            </div>

            {/* 几行诗选择 */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-red-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                几行诗
              </label>
              <div className="flex gap-3">
                {[2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLineCount(num)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border-2 text-base font-medium transition-all relative overflow-hidden",
                      lineCount === num
                        ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-600 shadow-lg"
                        : "bg-white text-red-700 border-amber-200 hover:border-red-300 hover:bg-red-50"
                    )}
                  >
                    {num}行
                  </button>
                ))}
              </div>
            </div>

            {/* 风格选择 - 分类展示 */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-red-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                风格
              </label>

              {Object.entries(STYLE_CATEGORIES).map(([category, styles]) => (
                <div key={category} className="rounded-xl border border-amber-100 overflow-hidden">
                  {/* 分类标题（可点击展开/收起） */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
                  >
                    <span className="font-medium text-red-900">{category}</span>
                    {expandedCategories[category] !== false ? (
                      <ChevronUp className="w-5 h-5 text-red-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-red-600" />
                    )}
                  </button>

                  {/* 风格按钮网格 */}
                  {expandedCategories[category] !== false && (
                    <div className="p-3 bg-white grid grid-cols-3 gap-2">
                      {styles.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStyleKeyword(s)}
                          className={cn(
                            "px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                            styleKeyword === s
                              ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md"
                              : "text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200"
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
                className="w-full px-5 py-3 rounded-xl border-2 border-amber-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition bg-amber-50/50"
                placeholder={styleKeyword ? "" : "或输入自定义风格..."}
                maxLength={10}
              />
            </div>

            {/* 立即生成按钮 */}
            <button
              onClick={handleGeneratePoem}
              disabled={!name || name.length < 2}
              className={cn(
                "w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg",
                !name || name.length < 2
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-red-200 hover:shadow-xl hover:shadow-red-300"
              )}
            >
              <Send className="w-5 h-5" />
              立即生成
            </button>
          </div>
        )}

        {step === 'generating_poem' && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-red-600 mb-4" />
            <p className="text-lg text-red-700 animate-pulse">正在以此名作诗...</p>
          </div>
        )}

        {step === 'review' && poemData && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200/50 p-8 space-y-6">
            <div className="text-center pb-6 border-b border-amber-200">
              {poemData.poem.map((line, i) => (
                <p key={i} className="text-2xl font-serif text-red-900 tracking-widest my-2" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                  {line}
                </p>
              ))}
            </div>
            <p className="text-sm text-red-600 text-center bg-red-50 py-3 rounded-lg">
              {poemData.explanation}
            </p>

            <div>
              <label className="block text-sm font-semibold text-red-900 mb-3">选择书法风格</label>
              <div className="grid grid-cols-2 gap-3">
                {['kaishu', 'xingshu', 'caoshu', 'lishu', 'shoujin', 'mianhua'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      style === s
                        ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md"
                        : "bg-white text-red-700 border border-amber-200 hover:border-red-300"
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
              <label className="block text-sm font-semibold text-red-900 mb-3">选择装裱</label>
              <select
                value={frame}
                onChange={(e) => setFrame(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition bg-amber-50/50"
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
                className="flex-1 px-4 py-3 border-2 border-amber-200 rounded-lg text-red-700 font-medium hover:bg-amber-50 transition-colors"
              >
                返回修改
              </button>
              <button
                onClick={handleRenderImage}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-medium hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all"
              >
                生成书法图
              </button>
            </div>
          </div>
        )}

        {step === 'generating_image' && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-red-600 mb-4" />
            <p className="text-lg text-red-700 animate-pulse">正在挥毫泼墨...</p>
          </div>
        )}

        {step === 'result' && imageUrl && (
          <div className="space-y-6">
            <div className="relative aspect-[2/3] w-full bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-200">
              <img src={imageUrl} alt="Generated Poem" className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-amber-200 rounded-lg text-red-700 bg-white hover:bg-amber-50 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回调整
                </button>
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-amber-200 rounded-lg text-red-700 bg-white hover:bg-amber-50 font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  再来一首
                </button>
              </div>
              <a
                href={imageUrl}
                download={`name_poem_${new Date().getTime()}.svg`}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-4 rounded-xl font-medium hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all text-lg"
              >
                <Download className="w-5 h-5" />
                保存图片
              </a>
            </div>
          </div>
        )}

        {/* 底部装饰 */}
        <div className="text-center mt-8 text-red-400 text-sm">
          <p>✦ 每一首诗都是独一无二的艺术品 ✦</p>
        </div>
      </div>
    </main>
  );
}
