import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, RefreshCw, AlertCircle, CheckCircle2, Sliders, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { refreshGeminiClient } from '../services/gemini';
import { getProvider, setProvider as saveProviderToMemory } from '../services/aiService';
import { AIProvider } from '../types';

export const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('sakura_custom_gemini_key') || '');
  const [kimiKey, setKimiKey] = useState(localStorage.getItem('sakura_custom_kimi_key') || '');
  const [provider, setProvider] = useState<AIProvider>(getProvider());
  const [saved, setSaved] = useState(false);
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('sakura_gemini_model') || 'gemini-3-flash-preview');

  const handleSave = () => {
    localStorage.setItem('sakura_custom_gemini_key', apiKey.trim());
    localStorage.setItem('sakura_custom_kimi_key', kimiKey.trim());
    localStorage.setItem('sakura_gemini_model', geminiModel);
    saveProviderToMemory(provider);
    refreshGeminiClient();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearKey = () => {
    localStorage.removeItem('sakura_custom_gemini_key');
    setApiKey('');
    refreshGeminiClient();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="settings-page">
      <div className="p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-sakura-pink/10 rounded-xl">
            <SettingsIcon size={24} className="text-sakura-rose" />
          </div>
          <div>
            <h2 className="text-2xl font-serif italic text-sakura-deep">应用设置</h2>
            <p className="text-sm text-sakura-rose/60">配置您的 AI 服务和偏好设置（仅保存在您的浏览器中）</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Provider Selection */}
          <section className="p-6 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-sakura-rose" />
              <h3 className="font-bold text-sakura-deep">AI 服务商选择</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setProvider('gemini')}
                className={`text-left p-4 rounded-xl border transition-all ${provider === 'gemini' ? 'bg-sakura-rose text-white border-sakura-rose shadow-md' : 'bg-white border-sakura-pink/10 text-sakura-deep hover:border-sakura-pink/30'}`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <Zap size={14} />
                  Google Gemini
                </div>
                <div className={`text-xs ${provider === 'gemini' ? 'text-white/70' : 'text-sakura-rose/40'}`}>
                  全球最强模型之一，支持生成式语音输出。需自备 API Key。
                </div>
              </button>

              <button
                onClick={() => setProvider('kimi')}
                className={`text-left p-4 rounded-xl border transition-all ${provider === 'kimi' ? 'bg-sakura-rose text-white border-sakura-rose shadow-md' : 'bg-white border-sakura-pink/10 text-sakura-deep hover:border-sakura-pink/30'}`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <Globe size={14} />
                  Kimi (Moonshot)
                </div>
                <div className={`text-xs ${provider === 'kimi' ? 'text-white/70' : 'text-sakura-rose/40'}`}>
                  国内领先大模型，中文理解力极强，无需 VPN 即可在后端代理下流畅使用。
                </div>
              </button>
            </div>
          </section>

          {/* API Key Section (Conditional) */}
          {provider === 'gemini' ? (
            <section className="p-6 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
              <div className="flex items-center gap-2 mb-4">
                <Key size={18} className="text-sakura-rose" />
                <h3 className="font-bold text-sakura-deep">Gemini API 配置</h3>
              </div>
              
              <p className="text-sm text-sakura-deep/70 mb-4 leading-relaxed">
                AI 功能需要调用后端代理接口进行处理。您可以提供自己的 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sakura-rose underline underline-offset-4">Gemini API Key</a> 以获得最佳体验。Key 会安全地存储在您的本地浏览器中。
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-sakura-rose/60 uppercase tracking-widest mb-2 ml-1">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="输入您的 Gemini API KEY"
                    className="w-full px-4 py-3 bg-white border border-sakura-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura-rose/20 transition-all font-mono text-sm"
                  />
                </div>
              </div>
            </section>
          ) : (
            <section className="p-6 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
              <div className="flex items-center gap-2 mb-4">
                <Key size={18} className="text-sakura-rose" />
                <h3 className="font-bold text-sakura-deep">Kimi API 配置</h3>
              </div>
              
              <p className="text-sm text-sakura-deep/70 mb-4 leading-relaxed">
                Kimi API 目前通过后端服务器代理进行连接。您可以提供自己的 <a href="https://platform.moonshot.cn/console/api-keys" target="_blank" rel="noopener noreferrer" className="text-sakura-rose underline underline-offset-4">Moonshot API Key</a>，否则系统将尝试使用服务器预置的公共 Key。
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-sakura-rose/60 uppercase tracking-widest mb-2 ml-1">API Key</label>
                  <input
                    type="password"
                    value={kimiKey}
                    onChange={(e) => setKimiKey(e.target.value)}
                    placeholder="输入您的 Moonshot API KEY (可选)"
                    className="w-full px-4 py-3 bg-white border border-sakura-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura-rose/20 transition-all font-mono text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3 text-xs text-emerald-700">
                <CheckCircle2 size={16} className="shrink-0" />
                Kimi 擅长处理长文本，非常适合阅读理解文章的生成与解析。
              </div>
            </section>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-sakura-rose text-white rounded-full hover:bg-sakura-deep transition-all shadow-lg shadow-sakura-rose/20 font-bold"
            >
              <Save size={18} />
              应用并保存
            </button>
          </div>

          {saved && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-emerald-600 text-sm font-medium"
            >
              <CheckCircle2 size={16} />
              设置已成功保存并立即生效！
            </motion.div>
          )}

          {/* Model Selection Section (Conditional for Gemini) */}
          {provider === 'gemini' && (
            <section className="p-6 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
              <div className="flex items-center gap-2 mb-4">
                <Sliders size={18} className="text-sakura-rose" />
                <h3 className="font-bold text-sakura-deep">Gemini 模型选择</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (推荐)', desc: '速度最快，适合日常解析' },
                  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', desc: '新代模型，实验性质' },
                  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: '逻辑更强，但可能更慢' }
                ].map(model => (
                  <button
                    key={model.id}
                    onClick={() => setGeminiModel(model.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${geminiModel === model.id ? 'bg-sakura-rose text-white border-sakura-rose shadow-md' : 'bg-white border-sakura-pink/10 hover:border-sakura-pink/30 text-sakura-deep'}`}
                  >
                    <div className="font-bold text-sm mb-1">{model.name}</div>
                    <div className={`text-xs ${geminiModel === model.id ? 'text-white/70' : 'text-sakura-rose/40'}`}>{model.desc}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Tips Section */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 italic">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 leading-relaxed">
              <p className="mb-1"><strong>关于连接性能：</strong></p>
              <p>本项目已启用全栈代理模式。Kimi API 由于是在国内服务器中转（或后端直连），通常在大陆环境下访问更流畅。如果您使用 Gemini，建议配合 VPN 以保证 API 调用的稳定性。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
