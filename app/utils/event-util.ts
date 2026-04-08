import type { Emitter, EventType } from 'mitt';
import mitt from 'mitt';

interface GlobalEvents extends Record<EventType, unknown> {
  /**
   * 用户即时消息事件
   */
  'user-im': InstantMessage
  /**
   * 广播即时消息事件
   */
  'global-im': InstantMessage
  /**
   * 全局数据通信
   */
  'global-data': Recordable
}

export const emitter: Emitter<GlobalEvents> = mitt();
