'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState<'formal' | 'casual' | 'business' | 'friendly'>('formal');
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // 起動時にブラウザから保存済みのキーとスタイルを読み込む
  useEffect(() => {
    const savedKey = localStorage.getItem('user_gemini_key');
    if (savedKey) setApiKey(savedKey);
    const savedStyle = localStorage.getItem('tensaku_style') as 'formal' | 'casual' | 'business' | 'friendly' | null;
    if (savedStyle) setStyle(savedStyle);
  }, []);

  // キーが変更されたらブラウザに保存する
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem('user_gemini_key', value);
  };

  // スタイルが変更されたらブラウザに保存する
  const handleStyleChange = (value: 'formal' | 'casual' | 'business' | 'friendly') => {
    setStyle(value);
    localStorage.setItem('tensaku_style', value);
  };

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (!apiKey) {
      alert('先にGoogle Gemini APIキーを入力してください。');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          userApiKey: apiKey, // ユーザーのキーをサーバーに送る
          style: style // 選択されたスタイルを送る
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'エラーが発生しました');

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: error instanceof Error ? error.message : 'エラーが発生しました' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm('会話をリセットしますか？')) {
      setMessages([]);
      setInput('');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <main className="flex flex-1 flex-col items-center p-4 sm:p-8">
        <div className="w-full max-w-4xl flex flex-col h-[90vh]">
          
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight">プロの添削くん</h1>
            <p className="text-zinc-500 mt-2 text-sm">あなたのAPIキーで動く、究極の添削ツール</p>
          </header>

          {/* APIキー入力セクション */}
          <div className="mb-4 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 shadow-sm">
            <label className="block text-xs font-bold text-amber-800 dark:text-amber-400 uppercase mb-2">
              Google Gemini API Key 設定
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="AIza..."
              className="w-full rounded-lg border border-amber-200 p-2 text-sm dark:bg-zinc-900 dark:border-zinc-700"
            />
            <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-500">
              ※キーはあなたのブラウザにのみ保存され、開発者のサーバーには保存されません。
            </p>
          </div>

          {/* スタイル選択セクション */}
          <div className="mb-4 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20 shadow-sm">
            <label className="block text-xs font-bold text-blue-800 dark:text-blue-400 uppercase mb-2">
              添削スタイル
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleStyleChange('formal')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  style === 'formal'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 dark:bg-zinc-900 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30'
                }`}
              >
                フォーマル
              </button>
              <button
                type="button"
                onClick={() => handleStyleChange('business')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  style === 'business'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 dark:bg-zinc-900 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30'
                }`}
              >
                ビジネス
              </button>
              <button
                type="button"
                onClick={() => handleStyleChange('friendly')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  style === 'friendly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 dark:bg-zinc-900 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30'
                }`}
              >
                親しい間柄
              </button>
              <button
                type="button"
                onClick={() => handleStyleChange('casual')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  style === 'casual'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 dark:bg-zinc-900 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30'
                }`}
              >
                カジュアル
              </button>
            </div>
            <p className="mt-2 text-[10px] text-blue-700 dark:text-blue-500">
              ※スタイルに応じて、適切な言葉遣いで添削します。
            </p>
          </div>

          {/* メッセージ表示エリア */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-zinc-400 space-y-2">
                <p className="text-lg font-medium text-zinc-500">Ready to Edit</p>
                <p className="text-sm">APIキーを入力して、添削したい文章を送信してください。</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-zinc-800 dark:bg-[#1e1e1e] dark:text-[#e0e0e0] border border-zinc-300 dark:border-zinc-700/50'
                    }`}>
                      <div className="whitespace-pre-wrap leading-7 text-sm sm:text-base [&>ol]:list-decimal [&>ul]:list-disc [&>ol]:ml-6 [&>ul]:ml-6 [&>li]:my-2 [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-2 [&>p]:my-2">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="rounded-2xl bg-zinc-100 px-5 py-3 dark:bg-zinc-800 text-zinc-400 text-sm">
                      AIが添削しています...
                    </div>
                  </div>
                )}
                <div ref={scrollEndRef} />
              </div>
            )}
          </div>

          {/* 入力エリア */}
          <form onSubmit={handleSubmit} className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="添削したい文章を入力 (Ctrl + Enter で送信)"
              disabled={isLoading}
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-white p-4 pr-32 text-zinc-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 resize-none transition-all outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex flex-col items-end gap-2">
              {(!apiKey || !input.trim()) && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {!apiKey && !input.trim() 
                    ? 'APIキーと文章を入力してください' 
                    : !apiKey 
                    ? 'APIキーを入力してください' 
                    : '文章を入力してください'}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  クリア
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || !apiKey}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? '送信中' : '添削する'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}