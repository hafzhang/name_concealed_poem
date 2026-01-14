import React from 'react';
import { autoMounting } from '@/hoc/autoMounting';

// 1. 定义几个基础组件，不需要写任何样式，只关注内容
const PoemA = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <h2 className="text-2xl font-bold mb-4 text-slate-800">静夜思</h2>
    <p className="text-slate-600">床前明月光</p>
    <p className="text-slate-600">疑是地上霜</p>
    <p className="text-slate-600">举头望明月</p>
    <p className="text-slate-600">低头思故乡</p>
  </div>
);

const PoemB = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <h2 className="text-2xl font-bold mb-4 text-slate-800">春晓</h2>
    <p className="text-slate-600">春眠不觉晓</p>
    <p className="text-slate-600">处处闻啼鸟</p>
    <p className="text-slate-600">夜来风雨声</p>
    <p className="text-slate-600">花落知多少</p>
  </div>
);

const PoemC = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <h2 className="text-2xl font-bold mb-4 text-slate-800">登鹳雀楼</h2>
    <p className="text-slate-600">白日依山尽</p>
    <p className="text-slate-600">黄河入海流</p>
    <p className="text-slate-600">欲穷千里目</p>
    <p className="text-slate-600">更上一层楼</p>
  </div>
);

// Ensure stable names for hydration
PoemA.displayName = 'PoemA';
PoemB.displayName = 'PoemB';
PoemC.displayName = 'PoemC';

// 2. 使用高阶组件包装
// 创建一组不同名称的组件来展示各种纹理和配色
const DemoVariants = [
  'CloudMist', 'DragonScale', 'AncientRune', 'StarDust', 'BambooWeave',
  'SpringFlower', 'PaperTexture', 'DiamondGrid', 'JadePlate', 'RoyalSilk',
  'InkSplash', 'GoldenAge', 'MysticRiver', 'SilentMountain', 'RedPhoenix'
].map(name => {
  // 动态创建一个带名字的组件
  const Wrapped = () => {
    // 随机选一首诗显示
    const poems = [<PoemA />, <PoemB />, <PoemC />];
    const idx = Math.floor(Math.random() * poems.length); // 这里随机仅影响内容，不影响装裱
    // 为了让内容稳定，我们还是基于名字选吧
    const stableIdx = name.length % 3;
    return poems[stableIdx];
  };
  Object.defineProperty(Wrapped, 'name', { value: name });
  Wrapped.displayName = name;
  return { name, Component: autoMounting(Wrapped) };
});

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-4">自动装裱系统演示 (Auto Mounting System)</h1>
      <p className="text-center text-slate-500 mb-12">
        不仅零手工，现在还拥有了：增强纹理、中国传统色、边角装饰、Base64 稳定渲染。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1600px] mx-auto">
        {DemoVariants.map(({ name, Component }) => (
          <div key={name} className="flex flex-col items-center">
             <div className="aspect-[3/4] w-full flex items-center justify-center mb-2">
                <Component />
             </div>
             <span className="text-xs text-slate-400 font-mono">{name}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-slate-500">
        <p>每种风格完全由组件名称（Seed）确定。刷新页面风格不会变。</p>
      </div>
    </div>
  );
}
