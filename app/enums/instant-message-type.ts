/**
 * 实时消息类型
 */
enum InstantMessageType {
  /**
   * 心跳PING
   */
  PING = 'PING',
  /**
   * 心跳PONG
   */
  PONG = 'PONG',
  /**
   * 推送消息
   */
  PUSH = 'PUSH',
  /**
   * 加入群组
   */
  JOIN_GROUP = 'JOIN_GROUP',
  /**
   * 单聊
   */
  SINGLE_CHAT = 'SINGLE_CHAT',
  /**
   * 群聊
   */
  GROUP_CHAT = 'GROUP_CHAT',
}

export default InstantMessageType;
