import { GrammarPoint, JLPTLevel } from "../types";

export const GRAMMAR_STATIC_DATA: Record<JLPTLevel, Record<number, GrammarPoint[]>> = {
  N5: {
    1: [
      { id: "n5-1-1", title: "名词1 は 名词2 です", meaning: "……是……", usage: "判断句，表示肯定判断。“は”读作 wa，提示主题。", examples: [{ japanese: "私は学生です。", reading: "わたしはがくせいです。", chinese: "我是学生。" }], practice: [{ chinese: "他是老师。", japanese: "彼は先生です。" }] },
      { id: "n5-1-2", title: "名词1 は 名词2 じゃありません", meaning: "……不是……", usage: "否定判断句。书面语用“ではありません”。", examples: [{ japanese: "本じゃありません。", reading: "ほんじゃありません。", chinese: "不是书。" }], practice: [{ chinese: "我不是医生。", japanese: "私は医者じゃありません。" }] },
      { id: "n5-1-3", title: "指示代词（事物）", meaning: "これ/それ/あれ", usage: "これ（我这）、それ（你那）、あれ（他那）。", examples: [{ japanese: "これは何ですか。", reading: "これはなんですか。", chinese: "这是什么？" }], practice: [{ chinese: "那是我的书。", japanese: "それは私の本です。" }] },
      { id: "n5-1-4", title: "指示代词（属性）", meaning: "この/その/あの + 名词", usage: "用于提示特定的事物、人或场所。", examples: [{ japanese: "この本は私のです。", reading: "このほんはわたしのです。", chinese: "这本书是我的。" }], practice: [{ chinese: "那个人是谁？", japanese: "あの方（ひと）はだれですか。" }] },
      { id: "n5-1-5", title: "名词1 の 名词2", meaning: "……的……", usage: "表示所属、性质或状态。", examples: [{ japanese: "私の日本語の本です。", reading: "わたしのにほんごのほんです。", chinese: "我的日语书。" }], practice: [{ chinese: "大学老师。", japanese: "大学の先生。" }] },
      { id: "n5-1-6", title: "场所代词", meaning: "ここ/そこ/あそこ/どこ", usage: "这里、那里、那里（远）、哪里。", examples: [{ japanese: "トイレはあそこです。", reading: "といれはあそこです。", chinese: "洗手间在那边。" }], practice: [{ chinese: "食堂在哪里？", japanese: "食堂（しょくどう）はどこですか。" }] },
      { id: "n5-1-7", title: "礼貌方向", meaning: "こちら/そちら/あちら/どちら", usage: "比这里、那里更礼貌的表达。", examples: [{ japanese: "どちら様ですか。", reading: "どちらさまですか。", chinese: "是哪位（贵姓）？" }], practice: [{ chinese: "那是哪家银行？", japanese: "あちらはどこの銀行（ぎんこう）ですか。" }] }
    ],
    2: [
      { id: "n5-2-1", title: "时刻表达", meaning: "～時～分입니다", usage: "在数字后加时、分。注意4(よ)、7(しち)、9(く)时的特殊读音。", examples: [{ japanese: "今、四時半です。", reading: "いま、よじはんぷんです。", chinese: "现在是四点半。" }], practice: [{ chinese: "现在九点十分。", japanese: "今九時十分（くじじゅっぷん）です。" }] },
      { id: "n5-2-2", title: "动词 ます形", meaning: "现在/将来时", usage: "表示习惯、真理或将来的动作。肯定ます，否定ません。", examples: [{ japanese: "毎日働きます。", reading: "まいにちはたらきます。", chinese: "每天工作。" }], practice: [{ chinese: "我不休息。", japanese: "休みません。" }] },
      { id: "n5-2-3", title: "时间范围", meaning: "～から～まで", usage: "从……开始，到……结束。", examples: [{ japanese: "九時から五時までです。", reading: "くじからごじまでです。", chinese: "从九点到五点。" }], practice: [{ chinese: "从几点开始？", japanese: "何時（なんじ）からですか。" }] },
      { id: "n5-2-4", title: "移动方向 へ", meaning: "去/来/回", usage: "场所+へ+行きます/来ます/帰ります。", examples: [{ japanese: "日本へ来ました。", reading: "にほんへきました。", chinese: "来日本了。" }], practice: [{ chinese: "回家。", japanese: "家（うち）へ帰ります。" }] },
      { id: "n5-2-5", title: "交通手段 で", meaning: "搭乘/使用……", usage: "表示移动的方式或工具。", examples: [{ japanese: "地下鉄で行きます。", reading: "ちかてつでいきます。", chinese: "坐地铁去。" }], practice: [{ chinese: "走路去。", japanese: "歩（ある）いて行きます。" }] },
      { id: "n5-2-6", title: "伴随人 と", meaning: "和……一起", usage: "表示动作的共同参与者。", examples: [{ japanese: "家族と来ました。", reading: "かぞくときました。", chinese: "和家人一起来的。" }], practice: [{ chinese: "一个人来。", japanese: "一人（ひとり）で来ました。" }] }
    ],
    3: [
      { id: "n5-3-1", title: "直接宾语 を", meaning: "做某事", usage: "名词 + を + 动词（他动词）。", examples: [{ japanese: "お酒を飲みます。", reading: "おさけをのみます。", chinese: "喝酒。" }], practice: [{ chinese: "吃苹果。", japanese: "りんごを食べます。" }] },
      { id: "n5-3-2", title: "动作场所 で", meaning: "在（某地）做", usage: "表示动作发生的具体地点。", examples: [{ japanese: "食堂で昼ご飯を食べます。", reading: "しょくどうでひるごはんをたべます。", chinese: "在食堂吃午饭。" }], practice: [{ chinese: "在超市买书。", japanese: "スーパーで本を買（か）います。" }] },
      { id: "n5-3-3", title: "邀请 ～ませんか", meaning: "不一起……吗？", usage: "语气委婉的邀请。", examples: [{ japanese: "一緒に帰りませんか。", reading: "いっしょにかえりませんか。", chinese: "不一起回去吗？" }], practice: [{ chinese: "不喝酒吗？", japanese: "お酒を飲みませんか。" }] },
      { id: "n5-3-4", title: "提议 ～ましょう", meaning: "让我们……吧", usage: "用于提议或响应邀请。", examples: [{ japanese: "ちょっと休みましょう。", reading: "ちょっとやすみましょう。", chinese: "稍微休息一下吧。" }], practice: [{ chinese: "去学校吧。", japanese: "学校（がっこう）へ行きましょう。" }] },
      { id: "n5-3-5", title: "形容词 种类", meaning: "い形容词 / な形容词", usage: "い形容词保留い，な形容词去な加です。", examples: [{ japanese: "富士山は高いです。", reading: "ふじさんはたかいです。", chinese: "富士山很高。" }], practice: [{ chinese: "这里的樱花很漂亮。", japanese: "ここの桜（さくら）はきれいです。" }] }
    ],
    4: [
      { id: "n5-4-1", title: "存在句 が あります/います", meaning: "有……", usage: "あります用于无意志物，います用于人和动物。", examples: [{ japanese: "机の上に本があります。", reading: "つくえのうえにほんがあります。", chinese: "桌子上有书。" }], practice: [{ chinese: "那儿有一个男人。", japanese: "あそこに男（おとこ）の人がいます。" }] },
      { id: "n5-4-2", title: "数量词 用法", meaning: "多少", usage: "“いくつ”询问数量，“どのくらい”询问时间长度。", examples: [{ japanese: "卵を三個買いました。", reading: "たまごをさんこかいました。", chinese: "买了三个鸡蛋。" }], practice: [{ chinese: "大约学了多久？", japanese: "どのくらい勉強（べんきょう）しましたか。" }] },
      { id: "n5-4-3", title: "比较 句型", meaning: "～より / ～ほど", usage: "AはBより……（A比B）；AはBほど……ない（A不如B）。", examples: [{ japanese: "今日は昨日より寒いです。", reading: "きょうはきのうよりさむいです。", chinese: "今天比昨天冷。" }], practice: [{ chinese: "那儿不如这儿热闹。", japanese: "あちらはここほど賑（にぎ）やかじゃありません。" }] },
      { id: "n5-4-4", title: "愿望表达 欲しい / ～たい", meaning: "想要", usage: "名词が欲しい（想要物）；ます形+たい（想做）。", examples: [{ japanese: "水が欲しいです。", reading: "みずがほしいです。", chinese: "想要水。" }], practice: [{ chinese: "我想回国。", japanese: "国（くに）へ帰（かえ）りたいです。" }] },
      { id: "n5-4-5", title: "目的表达 ～に 行きます", meaning: "去干……", usage: "场所 + 动词ます形/名词 + に + 行きます。", examples: [{ japanese: "買い物に行きます。", reading: "かいものにいきます。", chinese: "去买东西。" }], practice: [{ chinese: "去日本学习。", japanese: "日本へ勉強（べんきょう）に行きます。" }] }
    ],
    5: [
      { id: "n5-5-1", title: "て形（一组动词）", meaning: "变动词て形", usage: "词尾变化：い/ち/り变为って；み/び/に变为んで；き变いて；ぎ变いで；し变して。", examples: [{ japanese: "買って、飲んで、急いで", reading: "かって、のんで、いそいで", chinese: "买、喝、赶快" }], practice: [{ chinese: "请喝这个。", japanese: "これを飲（の）んでください。" }] },
      { id: "n5-5-2", title: "～てください", meaning: "请……", usage: "委婉的请求或指令。", examples: [{ japanese: "ちょっと待ってください。", reading: "ちょっとまってください。", chinese: "请稍等。" }], practice: [{ chinese: "请看这张地图。", japanese: "この地図（ちず）を見てください。" }] },
      { id: "n5-5-3", title: "正在进行 ～ています", meaning: "正在 / 状态", usage: "动词て形 + います。表示正在进行的动作或某种状态。", examples: [{ japanese: "今、雨が降っています。", reading: "いま、あめがふっています。", chinese: "现在正在下雨。" }], practice: [{ chinese: "知先生在看报。道吗？", japanese: "新聞（しんぶん）を読んでいます。" }] },
      { id: "n5-5-4", title: "～てもいいです", meaning: "可以……", usage: "表示允许或许可。", examples: [{ japanese: "ここで写真を撮ってもいいですか。", reading: "ここでしゃしんをとってもいいですか。", chinese: "可以在这里拍照吗？" }], practice: [{ chinese: "可以进去吗？", japanese: "入（はい）ってもいいですか。" }] },
      { id: "n5-5-5", title: "～てはいけません", meaning: "不可以……", usage: "表示禁止。", examples: [{ japanese: "ここでタバコを吸ってはいけません。", reading: "ここですぱこをすってはいけません。", chinese: "这里不准吸烟。" }], practice: [{ chinese: "不能碰。", japanese: "触（さわ）ってはいけません。" }] }
    ]
  },
  N4: {
    1: [
      { id: "n4-1-1", title: "强调解释 ～んです", meaning: "强调/解释", usage: "用于说明原因或探询理由。口语型。", examples: [{ japanese: "どうしたんですか。", reading: "どうしたんですか。", chinese: "你怎么了？" }], practice: [{ chinese: "因为我不舒服。", japanese: "気分（きぶん）が良（よ）くないんです。" }] },
      { id: "n4-1-2", title: "可能动词", meaning: "能 / 会", usage: "表示能力。五段变え段+る，一段去る+られる。", examples: [{ japanese: "日本語が少し話せます。", reading: "にほんごがすこしはなせます。", chinese: "会说点日语。" }], practice: [{ chinese: "不会游泳。", japanese: "泳（およ）げません。" }] },
      { id: "n4-1-3", title: "意志动词 ～よう", meaning: "意向形", usage: "用于向对方表明自己的意志。五段变お段+う。", examples: [{ japanese: "一緒に飲もう。", reading: "いっしょにのもう。", chinese: "一喝起吧。" }], practice: [{ chinese: "休息吧。", japanese: "休（やす）もう。" }] },
      { id: "n4-1-4", title: "计划 ～つもりです", meaning: "打算……", usage: "动词字典形 + つもり。表示坚定的意志。", examples: [{ japanese: "来年、日本へ行くつもりです。", reading: "らいねん、にほんへいくつもりです。", chinese: "打算明年去日本。" }], practice: [{ chinese: "打算买车。", japanese: "車（くるま）を買（か）うつもりです。" }] },
      { id: "n4-1-5", title: "建议 ～ほうがいいです", meaning: "还是……为好", usage: "提供建议。肯定用た形，否定用ない形。", examples: [{ japanese: "毎日、運動したほうがいいです。", reading: "まいにち、うんどうしたほうがいいです。", chinese: "每天还是运动一下比较好。" }], practice: [{ chinese: "不要出比较好。去。", japanese: "出（で）かけないほうがいいです。" }] }
    ],
    2: [
      { id: "n4-2-1", title: "假定形 ば", meaning: "如果……的话", usage: "动词变え段+ば，形容词去い+ければ。", examples: [{ japanese: "春になれば、桜が咲きます。", reading: "はるになれば、さくらがさきます。", chinese: "到了春天，樱花就会开。" }], practice: [{ chinese: "如果没有钱就不买。", japanese: "お金がなければ、買いません。" }] },
      { id: "n4-2-2", title: "～ように しています", meaning: "尽量…… / 习惯", usage: "表示习惯性地、有意识地努力做某事。", examples: [{ japanese: "毎日、日記を書くようにしています。", reading: "まいにち、にっきをかくようにしています。", chinese: "我每天尽量坚持写日记。" }], practice: [{ chinese: "尽量不喝甜饮。料", japanese: "甘（あま）い飲物（のみもの）を飲（の）まないようにしています。" }] },
      { id: "n4-2-3", title: "受害者 被动语态", meaning: "被……", usage: "名词1 は 名词2 に 动词（受身形）。", examples: [{ japanese: "母に叱られました。", reading: "ははにしかられました。", chinese: "被妈妈骂了。" }], practice: [{ chinese: "包被偷了。", japanese: "鞄（かばん）を盗（ぬす）まれました。" }] },
      { id: "n4-2-4", title: "使役动词", meaning: "让……做", usage: "五段变あ段+せる，一段去る+させる。", examples: [{ japanese: "息子をイギリスへ留学させます。", reading: "むすこをいぎりすへりゅうがくさせます。", chinese: "送儿子去英国留学。" }], practice: [{ chinese: "让孩子弹钢琴。琴", japanese: "子供（こども）にピアノを習（なら）わせます。" }] },
      { id: "n4-2-5", title: "敬语 自谦形", meaning: "我为您做……", usage: "お+动词1或2连用形+します。", examples: [{ japanese: "お荷物はお持ちします。", reading: "おにもつはおもちします。", chinese: "行李我来帮您拿。" }], practice: [{ chinese: "我为您带路。", japanese: "ご案内（あんない）します。" }] }
    ]
  },
  N3: { 1: [] },
  N2: { 1: [] },
  N1: { 1: [] }
};
