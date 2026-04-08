import { defineStore } from 'pinia';
import { useUserInfoStore } from '@/stores/user-info-store';
import { useAuthenticationStore } from '@/stores/authentication-store';
import { emitter } from '@/utils/event-util';
import InstantMessageType from '@/enums/instant-message-type';

export interface InstantMessageState {
  retry: number
  manuallyClosed: boolean
}

const MAX_RETRY = 5;
const HEARTBEAT_INTERVAL = 30_000;

let messageClient: WebSocket | null = null;
let heartbeatTimer: number | null = null;

export const useInstantMessageStore = defineStore('app-instant-message', {
  state: (): InstantMessageState => ({
    retry: 0,
    manuallyClosed: false,
  }),

  actions: {
    /**
     * 创建 WebSocket 实例并绑定事件
     */
    createClient(token: string) {
      if (import.meta.server) {
        return;
      }

      const message = useMessage();
      const appConfig = useRuntimeConfig().public;
      const url = `${appConfig.instantMessageServerUrl}?token=${token}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        this.retry = 0;
        this.startHeartbeat();
        setTimeout(() => {
          message.success('欢迎来到星站');
        }, 3000);
      };

      ws.onmessage = event => {
        try {
          const message = JSON.parse(event.data) as InstantMessage;
          if (message.type !== InstantMessageType.PONG) {
            if (message.type === InstantMessageType.PUSH) {
              emitter.emit('global-im', message);
            } else {
              emitter.emit('user-im', message);
            }
          }
        } catch (e) {
          console.warn('消息解析失败', e);
        }
      };

      ws.onclose = () => {
        this.stopHeartbeat();
        messageClient = null;

        if (!this.manuallyClosed) {
          this.reconnect(() => this.createClient(token));
        }
      };

      ws.onerror = err => {
        console.error('WebSocket 错误', err);
        message.error('已与星站断开连接');
      };

      messageClient = ws;
    },

    /**
     * 连接即时消息服务
     */
    connectMessageServer() {
      if (import.meta.server || messageClient) {
        return;
      }

      const authenticationStore = useAuthenticationStore();
      const token = authenticationStore.isLoggedIn
        ? authenticationStore.accessToken
        : authenticationStore.anonymousToken;

      if (!token) {
        console.error('连接即时消息服务失败，未获取到 token');
        return;
      }

      this.manuallyClosed = false;
      this.createClient(token);

      // 页面关闭时主动断开
      useEventListener(window, 'beforeunload', () => {
        this.disconnectMessageServer();
      });
    },

    /**
     * 启动心跳
     */
    startHeartbeat() {
      if (import.meta.server) {
        return;
      }

      this.stopHeartbeat();
      heartbeatTimer = window.setInterval(() => {
        if (messageClient?.readyState === WebSocket.OPEN) {
          messageClient.send(JSON.stringify({ type: InstantMessageType.PING }));
        }
      }, HEARTBEAT_INTERVAL);
    },

    /**
     * 停止心跳
     */
    stopHeartbeat() {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    },

    /**
     * 重连
     */
    reconnect(connect: () => void) {
      if (this.retry >= MAX_RETRY) {
        console.warn('WebSocket 重连次数已达上限');
        return;
      }

      const delay = ++this.retry * 2000;
      setTimeout(connect, delay);
    },

    /**
     * 主动断开连接
     */
    disconnectMessageServer() {
      this.manuallyClosed = true;
      this.stopHeartbeat();

      if (messageClient) {
        messageClient.close();
        messageClient = null;
      }
    },

    /**
     * 发送消息
     */
    sendMessage(message: InstantMessage) {
      if (messageClient?.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket 未连接，消息发送失败');
        return;
      }

      const userInfoStore = useUserInfoStore();
      message.from = userInfoStore.id as string;

      messageClient.send(JSON.stringify(message));
    },
  },
});
