import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 画面側から「メッセージ」と「ユーザーのAPIキー」を受け取る
    const { message, userApiKey } = await req.json();

    if (!userApiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。上部の設定欄に入力してください。' },
        { status: 400 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userApiKey}`, // ユーザーが入力したキーを使用
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `あなたは一流の校閲記者・編集者です。
ユーザーから送られてくる「下書き」を、以下のステップで添削してください。

1. 【添削後の文章】：誤字脱字を直し、論理構成を整えた「完成稿」を提示する。
2. 【修正のポイント】：なぜそのように直したのか、語彙や文法、構成の観点から3点程度で解説する。

※注意：内容への共感や人生相談、過度な励ましは不要です。文章の質を高めることに徹してください。`
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: `OpenRouterエラー: ${data.error.message || '認証に失敗しました'}` },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      reply: data.choices[0].message.content 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: '通信エラーが発生しました。' },
      { status: 500 }
    );
  }
}