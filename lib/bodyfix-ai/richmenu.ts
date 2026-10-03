import type { LineMessage } from "@/lib/bodyfix-ai/line";

const NAVY = "#0B1D34";
const GOLD = "#B8863B";
const IVORY = "#F8F3EA";
const MUTED = "#6E6A64";
const BORDER = "#D8C7AE";

function postbackButton(
  label: string,
  data: string,
  displayText: string,
  primary = false
) {
  return {
    type: "button",
    style: primary ? "primary" : "secondary",
    color: primary ? NAVY : undefined,
    height: "sm",
    action: {
      type: "postback",
      label,
      data,
      displayText
    }
  };
}

function infoRow(label: string, value: string, note?: string) {
  const contents: Record<string, unknown>[] = [
    {
      type: "box",
      layout: "baseline",
      contents: [
        {
          type: "text",
          text: label,
          size: "sm",
          color: NAVY,
          flex: 3,
          wrap: true
        },
        {
          type: "text",
          text: value,
          size: "sm",
          color: GOLD,
          weight: "bold",
          align: "end",
          flex: 2,
          wrap: true
        }
      ]
    }
  ];

  if (note) {
    contents.push({
      type: "text",
      text: note,
      size: "xs",
      color: MUTED,
      wrap: true
    });
  }

  return {
    type: "box",
    layout: "vertical",
    spacing: "xs",
    contents
  };
}

function detailBubble(
  kicker: string,
  title: string,
  subtitle: string,
  rows: Record<string, unknown>[],
  footerButtons: Record<string, unknown>[]
): LineMessage {
  return {
    type: "flex",
    altText: "BodyFix｜" + title,
    contents: {
      type: "bubble",
      styles: {
        body: { backgroundColor: IVORY },
        footer: { backgroundColor: IVORY }
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "22px",
        contents: [
          {
            type: "text",
            text: kicker,
            size: "xs",
            color: GOLD,
            weight: "bold"
          },
          {
            type: "text",
            text: title,
            size: "xxl",
            color: NAVY,
            weight: "bold",
            wrap: true
          },
          {
            type: "text",
            text: subtitle,
            size: "sm",
            color: MUTED,
            wrap: true
          },
          {
            type: "separator",
            color: BORDER,
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            spacing: "md",
            margin: "md",
            contents: rows
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "18px",
        contents: footerButtons
      }
    }
  };
}

export function serviceDetailMessages(service: string): LineMessage[] {
  if (service === "body-reset") {
    return [
      {
        type: "text",
        text:
          "這裡是 BodyFix 最常使用的筋膜整理系列。可以依你想處理的範圍與時間，選 60 或 90 分鐘。"
      },
      detailBubble(
        "BODYFIX · BODY RESET",
        "筋膜整理系列",
        "教練視角 × 筋膜線判讀 × 徒手張力整理",
        [
          infoRow("筋膜鏈整理 60 分", "NT$2,200", "依整體張力分工安排"),
          infoRow("指定筋膜線 60 分", "NT$2,300", "針對指定筋膜線整理"),
          infoRow("多線整合 90 分", "NT$3,600", "適合想做較完整整合")
        ],
        [
          postbackButton(
            "我要預約",
            "action=booking&mode=immediate",
            "我想預約 BodyFix",
            true
          )
        ]
      )
    ];
  }

  if (service === "pelvic-core") {
    return [
      {
        type: "text",
        text:
          "骨盆核心整理會依狀況處理下腹、腹股溝、內收、髖與骨盆周邊張力。一般版與 VIP 深度版的時間和整合範圍不同。"
      },
      detailBubble(
        "BODYFIX · PELVIC CORE",
        "骨盆核心整理",
        "骨盆核心 · 髖部 · 下肢張力整合",
        [
          infoRow("骨盆核心整理 60 分", "NT$2,500"),
          infoRow("VIP 深度整理 120 分", "NT$6,800", "六大面向｜一天限一名")
        ],
        [
          postbackButton(
            "了解 VIP 120 分",
            "action=service&service=vip-pelvic",
            "我想了解 VIP 骨盆核心深層整理",
            true
          )
        ]
      )
    ];
  }

  if (service === "vip-pelvic") {
    return [
      {
        type: "text",
        text:
          "VIP 120 分是骨盆核心系列裡最完整的深度整理版本，會保留更完整的判讀、整理與整合時間。"
      },
      detailBubble(
        "BODYFIX · VIP DEEP SESSION",
        "VIP 骨盆核心深度整理",
        "六大面向整合｜一天限一名",
        [
          infoRow("時間", "120 分"),
          infoRow("價格", "NT$6,800"),
          infoRow("安排", "一天限一名", "保留較完整的操作與恢復空間")
        ],
        [
          postbackButton(
            "詢問 VIP 時段",
            "action=booking&mode=immediate",
            "我想詢問 VIP 120 分可約時段",
            true
          )
        ]
      )
    ];
  }

  if (service === "personal-training" || service === "training-plans") {
    return [
      {
        type: "text",
        text:
          "1 對 1 教練課會依你的目標、動作狀況與訓練經驗安排，不是固定套版課表。"
      },
      detailBubble(
        "BODYFIX · PERSONAL TRAINING",
        "1 對 1 私人教練",
        "重訓 · 動作品質 · 訓練安排",
        [
          infoRow("單堂", "NT$1,800 起"),
          infoRow("方案", "另有多堂方案", "可依訓練頻率與目標另外規劃")
        ],
        [
          postbackButton(
            "詢問教練課",
            "action=booking&mode=immediate",
            "我想詢問 1 對 1 教練課",
            true
          )
        ]
      )
    ];
  }

  if (service === "ziwei") {
    return [
      {
        type: "text",
        text: "紫微斗數解析會整理感情、工作、財運與流年方向，並提供完整書面報告。"
      },
      detailBubble(
        "GAVIN · ZI WEI",
        "紫微斗數解析",
        "感情 · 工作 · 財運 · 流年",
        [
          infoRow("完整解析", "NT$3,600"),
          infoRow("內容", "含書面報告")
        ],
        [
          postbackButton(
            "我要詢問",
            "action=booking&mode=immediate",
            "我想詢問紫微斗數解析",
            true
          )
        ]
      )
    ];
  }

  if (service === "tarot") {
    return [
      {
        type: "text",
        text: "塔羅適合針對明確問題做快速整理，也可以先說你目前最想問哪一類。"
      },
      detailBubble(
        "GAVIN · TAROT",
        "塔羅占卜",
        "感情 · 工作 · 選擇 · 近期方向",
        [infoRow("單題起", "NT$333 起")],
        [
          postbackButton(
            "我要詢問",
            "action=booking&mode=immediate",
            "我想詢問塔羅占卜",
            true
          )
        ]
      )
    ];
  }

  return [
    {
      type: "text",
      text: "收到，你可以直接告訴我想了解的服務，我會把對應資訊整理給你。"
    }
  ];
}

export function locationDetailMessages(location: string): LineMessage[] {
  if (location === "luzhangli") {
    return [
      {
        type: "text",
        text:
          "六張犁是目前 BodyFix 的主要工作室，捷運出站後步行約 1 分鐘。完整地址會在預約確認後提供。"
      },
      detailBubble(
        "BODYFIX · LOCATION",
        "六張犁工作室",
        "台北市信義區｜捷運六張犁站步行約 1 分鐘",
        [
          infoRow("型態", "預約制個人工作室"),
          infoRow("服務", "筋膜整理 · 骨盆核心 · 運動按摩"),
          infoRow("地址", "預約後提供", "確認時段後會傳完整位置資訊")
        ],
        [
          postbackButton(
            "我要預約六張犁",
            "action=booking&mode=immediate",
            "我想預約六張犁工作室",
            true
          )
        ]
      )
    ];
  }

  if (location === "ximen") {
    return [
      {
        type: "text",
        text:
          "西門可安排共享工作室，會依預約時段確認場地。若你方便西門，可以直接把想約的日期和時間傳給我。"
      },
      detailBubble(
        "BODYFIX · LOCATION",
        "西門共享工作室",
        "共享空間｜依預約安排",
        [
          infoRow("地點", "台北市萬華區"),
          infoRow("安排", "預約後確認", "場地與進場方式會另行提供")
        ],
        [
          postbackButton(
            "詢問西門時段",
            "action=booking&mode=specific-time",
            "我想約西門共享工作室",
            true
          )
        ]
      )
    ];
  }

  if (location === "sunyatsen") {
    return [
      {
        type: "text",
        text:
          "國父紀念館也可以安排共享工作室，適合比較方便東區的客人。場地會依預約時間確認。"
      },
      detailBubble(
        "BODYFIX · LOCATION",
        "國父紀念館共享工作室",
        "共享空間｜依預約安排",
        [
          infoRow("地點", "台北市信義區"),
          infoRow("安排", "預約後確認", "場地與進場方式會另行提供")
        ],
        [
          postbackButton(
            "詢問國父紀念館時段",
            "action=booking&mode=specific-time",
            "我想約國父紀念館共享工作室",
            true
          )
        ]
      )
    ];
  }

  if (location === "custom") {
    return [
      {
        type: "text",
        text:
          "指定地點可安排到府、飯店或健身房。先告訴我區域、日期和大概時間，我會一起確認交通與場地是否適合。"
      },
      detailBubble(
        "BODYFIX · MOBILE",
        "指定地點服務",
        "到府 · 飯店 · 健身房",
        [
          infoRow("範圍", "依地區確認"),
          infoRow("需求", "需先確認場地", "請提供區域、日期與希望時間")
        ],
        [
          postbackButton(
            "詢問指定地點",
            "action=booking&mode=custom-location",
            "我想詢問到府／飯店／健身房服務",
            true
          )
        ]
      )
    ];
  }

  return [
    {
      type: "text",
      text: "收到，你可以直接告訴我方便的地區與時間，我會幫你確認適合的據點。"
    }
  ];
}
