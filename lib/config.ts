export type NoticeItem = { title: string; content: string };

/**
 * Reusable project defaults.
 * Change these values before the first deployment to adapt the project to
 * another college, company, or shared-space team.
 */
export const APP_CONFIG = {
  title: "学院会议室预约",
  subtitle: "共享空间 · 有序使用",
  timezone: "Asia/Shanghai",
  timezoneOffsetHours: 8,
  openingHour: 9,
  closingHour: 22,
  advanceBookingDays: 30,
  rooms: [
    { id: "606", name: "606会议室", label: "MEETING ROOM" },
    { id: "brainstorm", name: "头脑风暴室", label: "BRAINSTORM ROOM" },
  ],
  pickupNotice:
    "使用前请前往院楼438领取钥匙并登记，若438无人，请拨打438门口对应时间的值班人员电话，使用结束后请及时归还。",
} as const;

export const DEFAULT_NOTICE_ITEMS: NoticeItem[] = [
  {
    title: "开放时间",
    content: "每日09:00–22:00，每小时为一个时段。可提前30天预约，时间均为北京时间。",
  },
  {
    title: "预约规则",
    content:
      "同一会议室、同一时段仅能由一人预约。提交成功即生效，无需审核。同一天可以勾选多个连续或不连续的时段，一次填写并统一提交。",
  },
  {
    title: "使用与钥匙",
    content:
      "会议室用于学习、研讨等相关活动。使用前请前往院楼438领取钥匙并登记，若438无人，请拨打438门口对应时间的值班人员电话，使用结束后请及时归还。请关闭设备并清理场地。",
  },
  {
    title: "变更与取消",
    content:
      "如无法使用，请在预约开始前到“我的预约”取消，释放给其他同学。已经开始的预约请联系管理员处理。",
  },
  {
    title: "信息与隐私",
    content:
      "公开页面仅展示时段是否可预约。姓名、学号、班级、电话与借用理由仅供预约人本人及管理团队查看，用于联系、空间管理与钥匙交接。请勿填写与预约无关的敏感信息。",
  },
  {
    title: "保存预约凭证",
    content:
      "预约无需注册。请使用同一微信或浏览器查看“我的预约”，并保存预约凭证，换设备后可找回。持有凭证的人可以管理该预约，请妥善保管。",
  },
];
