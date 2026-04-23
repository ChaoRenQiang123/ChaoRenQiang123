import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Key, RefreshCw, AlertCircle, CheckCircle2, Sliders } from 'lucide-react';
import { motion } from 'motion/react';
import { refreshGeminiClient } from '../services/gemini';

export const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('sakura_custom_gemini_key') || '');
  const [saved, setSaved] = useState(false);
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('sakura_gemini_model') || 'gemini-3-flash-preview');

  const handleSave = () => {
    localStorage.setItem('sakura_custom_gemini_key', apiKey.trim());
    localStorage.setItem('sakura_gemini_model', geminiModel);
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
          {/* API Key Section */}
          <section className="p-6 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
            <div className="flex items-center gap-2 mb-4">
              <Key size={18} className="text-sakura-rose" />
              <h3 className="font-bold text-sakura-deep">Gemini API 配置</h3>
            </div>
            
            <p className="text-sm text-sakura-deep/70 mb-4 leading-relaxed">
              由于本项目部署为静态网站，AI 功能需要您提供自己的 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sakura-rose underline underline-offset-4">Gemini API Key</a> 才能运行。Key 会安全地存储在您的本地浏览器（localStorage）中，不会上传到任何服务器。
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sakura-rose/60 uppercase tracking-widest mb-2 ml-1">API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="输入您的 AI KEY (AI_...) "
                    className="w-full px-4 py-3 bg-white border border-sakura-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura-rose/20 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-sakura-rose text-white rounded-full hover:bg-sakura-deep transition-all shadow-md shadow-sakura-rose/20 font-bold text-sm"
                >
                  <Save size={16} />
                  保存设置
                </button>
                {apiKey && (
                  <button
                    onClick={clearKey}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-sakura-rose border border-sakura-pink/20 rounded-full hover:bg-sakura-pink/5 transition-all text-sm"
                  >
                    清除 KEY
                  </button>
                )}
              </div>
            </div>

            {saved && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium"
              >
                <CheckCircle2 size={16} />
                设置已成功保存并立即生效！
              </motion.div>
            )}
          </section>

          {/* Model Selection Section */}
          <section className="p-6 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
            <div className="flex items-center gap-2 mb-4">
              <Sliders size={18} className="text-sakura-rose" />
              <h3 className="font-bold text-sakura-deep">模型选择</h3>
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

          {/* Tips Section */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 italic">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 leading-relaxed">
              <p className="mb-1"><strong>关于国内网络：</strong></p>
              <p>如果您在中国境内访问静态部署的应用，即便配置了正确的 Key，仍然可能受到网络环境限制。建议通过 VPN 环境访问，或在未来版本中部署支持中转的后端服务。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
