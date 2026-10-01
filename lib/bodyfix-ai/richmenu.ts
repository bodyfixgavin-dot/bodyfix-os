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

export function immediateBookingMessages(): LineMessage[] {
  return [
    {
      type: "text",
      text:
        "可以，直接從這裡開始 👌\n你可以先看本週空檔，也可以直接告訴我你想約的日期、地點或目前狀況。"
    },
    {
      type: "flex",
      altText: "BodyFix｜立即預約",
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
              text: "BODYFIX",
              size: "xs",
              color: GOLD,
              weight: "bold"
            },
            {
              type: "text",
              text: "立即預約",
              size: "xxl",
              color: NAVY,
              weight: "bold"
            },
            {
              type: "text",
              text: "選一個最接近你現在需求的入口",
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
              spacing: "sm",
              margin: "md",
              contents: [
                postbackButton(
                  "本週可約時段",
                  "action=booking&mode=this-week",
                  "查看本週可約時段",
                  true
                ),
                postbackButton(
                  "我有指定日期",
                  "action=booking&mode=specific-time",
                  "我有指定日期想預約"
                ),
                postbackButton(
                  "指定地點服務",
                  "action=booking&mode=custom-location",
                  "我想詢問到府／飯店／健身房服務"
                ),
                postbackButton(
                  "不知道選哪個服務",
                  "action=booking&mode=help-me-choose",
                  "我不確定適合哪個服務"
                )
              ]
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          paddingAll: "18px",
          contents: [
            {
              type: "text",
              text: "預約需由 Gavin 最後確認才成立",
              size: "xs",
              color: MUTED,
              align: "center",
              wrap: true
            }
          ]
        }
      }
    }
  ];
}

export function availabilitySetupMessages(): LineMessage[] {
  return [
    {
      type: "text",
      text:
        "這個入口就是接下來要做成即時空檔看板的地方 👀\n之後會直接讀 Google Calendar，只顯示真正可以接客的時間。"
    },
    {
      type: "flex",
      altText: "BodyFix｜本週可約時段",
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
              text: "BODYFIX",
              size: "xs",
              color: GOLD,
              weight: "bold"
            },
            {
              type: "text",
              text: "本週可約時段",
              size: "xxl",
              color: NAVY,
              weight: "bold"
            },
            {
              type: "text",
              text: "Google Calendar 串接準備中",
              size: "sm",
              color: GOLD,
              weight: "bold"
            },
            {
              type: "text",
              text:
                "完成後，這裡會即時顯示今天與未來 7 天可約時間，已被占用的時段會自動消失。",
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
              type: "text",
              text: "目前可先直接告訴 Gavin：\n日期＋大概時間＋想安排的服務",
              size: "sm",
              color: NAVY,
              wrap: true,
              margin: "md"
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          paddingAll: "18px",
          contents: [
            postbackButton(
              "我有指定日期",
              "action=booking&mode=specific-time",
              "我有指定日期想預約",
              true
            ),
            postbackButton(
              "回到立即預約",
              "action=booking&mode=immediate",
              "我想預約 BodyFix"
            )
          ]
        }
      }
    }
  ];
}

export function bookingPromptMessages(mode: string): LineMessage[] {
  if (mode === "specific-time") {
    return [
      {
        type: "text",
        text:
          "可以，直接傳給我「日期＋大概時間＋想安排的服務」就好。\n例如：10/3 晚上 8 點，六張犁，骨盆核心。"
      }
    ];
  }

  if (mode === "custom-location") {
    return [
      {
        type: "text",
        text:
          "指定地點可以安排到府、飯店或健身房。\n請直接傳「地點／區域＋希望日期時間＋想安排的服務」，Gavin 會確認交通與可行時段。"
      }
    ];
  }

  if (mode === "help-me-choose") {
    return [
      {
        type: "text",
        text:
          "沒問題，不用先知道服務名稱。\n直接告訴我最近最想改善的狀況、哪裡緊或卡，以及平常有沒有運動，我會先幫你分流。"
      }
    ];
  }

  return immediateBookingMessages();
}
