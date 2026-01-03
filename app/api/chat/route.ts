import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 画面側から「メッセージ」「ユーザーのAPIキー」「スタイル」を受け取る
    const { message, userApiKey, style = 'formal' } = await req.json();

    if (!userApiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。上部の設定欄に入力してください。' },
        { status: 400 }
      );
    }

    // スタイルに応じたSystem Promptを生成
    const getSystemPrompt = (style: string) => {
      switch (style) {
        case 'formal':
          return `あなたは一流の校閲記者・編集者です。
ユーザーから送られてくる「下書き」を、以下のステップで添削してください。

1. 【添削後の文章】：誤字脱字を直し、論理構成を整えた「完成稿」を提示する。
2. 【修正のポイント】：なぜそのように直したのか、語彙や文法、構成の観点から3点程度で解説する。

※注意：内容への共感や人生相談、過度な励ましは不要です。文章の質を高めることに徹してください。
フォーマルな文章として、丁寧で適切な言葉遣いを心がけてください。`;

        case 'business':
          return `あなたはビジネス文書の専門編集者です。
ユーザーから送られてくる「下書き」を、以下のステップで添削してください。

1. 【添削後の文章】：誤字脱字を直し、論理構成を整えた「完成稿」を提示する。
2. 【修正のポイント】：なぜそのように直したのか、語彙や文法、構成の観点から3点程度で解説する。

※注意：ビジネス文書として、簡潔で明確、かつ適切な敬語を使用してください。
内容への共感や人生相談、過度な励ましは不要です。文章の質を高めることに徹してください。`;

        case 'friendly':
          return `あなたは親しい間柄での文章を添削する編集者です。
ユーザーから送られてくる「下書き」を、以下のステップで添削してください。

1. 【添削後の文章】：誤字脱字を直し、論理構成を整えた「完成稿」を提示する。
2. 【修正のポイント】：なぜそのように直したのか、語彙や文法、構成の観点から3点程度で解説する。

※注意：親しい間柄での文章として、自然で親しみやすい言葉遣いを保ちながら、読みやすさを向上させてください。
かしこまりすぎず、でも失礼にならない程度の親しみやすさを維持してください。
内容への共感や人生相談、過度な励ましは不要です。文章の質を高めることに徹してください。`;

        case 'casual':
          return `あなたはカジュアルな文章を添削する編集者です。
ユーザーから送られてくる「下書き」を、以下のステップで添削してください。

1. 【添削後の文章】：誤字脱字を直し、論理構成を整えた「完成稿」を提示する。
2. 【修正のポイント】：なぜそのように直したのか、語彙や文法、構成の観点から3点程度で解説する。

※注意：カジュアルな文章として、親しみやすく自然な言葉遣いを保ちながら、読みやすさを向上させてください。
堅苦しすぎず、でも最低限の礼儀は保つようにしてください。
内容への共感や人生相談、過度な励ましは不要です。文章の質を高めることに徹してください。`;

        default:
          return `あなたは一流の校閲記者・編集者です。
ユーザーから送られてくる「下書き」を、以下のステップで添削してください。

1. 【添削後の文章】：誤字脱字を直し、論理構成を整えた「完成稿」を提示する。
2. 【修正のポイント】：なぜそのように直したのか、語彙や文法、構成の観点から3点程度で解説する。

※注意：内容への共感や人生相談、過度な励ましは不要です。文章の質を高めることに徹してください。`;
      }
    };

    const systemPrompt = getSystemPrompt(style);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}

以下が添削対象の文章です：

${message}`
                }
              ]
            }
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: `Gemini APIエラー: ${data.error.message || '認証に失敗しました'}` },
        { status: 401 }
      );
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      return NextResponse.json(
        { error: 'レスポンスの形式が正しくありません。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      reply: data.candidates[0].content.parts[0].text 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: '通信エラーが発生しました。' },
      { status: 500 }
    );
  }
}