// src/app/notifications/notifications.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server

  private readonly logger = new Logger(NotificationsGateway.name)

  // Bộ nhớ đệm lưu trữ danh sách: Key là userId, Value là socketId của tab trình duyệt
  private onlineUsers = new Map<string, string>()

  /**
   * Xử lý khi có client (Frontend) kết nối vào Socket
   */
  handleConnection(client: Socket) {
    // FE sẽ truyền userId lên qua query string khi kết nối: io('url', { query: { userId: '...' } })
    const userId = client.handshake.query.userId as string

    if (userId) {
      this.onlineUsers.set(userId, client.id)
      this.logger.log(`🟢 User ${userId} kết nối Real-time. SocketID: ${client.id}`)
    }
  }

  /**
   * Xử lý khi client ngắt kết nối (Tắt tab, mất mạng)
   */
  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId)
        this.logger.log(`🔴 User ${userId} đã ngắt kết nối Real-time.`)
        break
      }
    }
  }

  /**
   * Hàm Core gửi thông báo thời gian thực tới 1 User cụ thể
   */
  sendNotificationToUser(userId: string, notificationData: any) {
    const socketId = this.onlineUsers.get(userId)

    if (socketId) {
      // Bắn sự kiện tên là 'new_notification' kèm theo dữ liệu thông báo xuống đúng socketId đó
      this.server.to(socketId).emit('new_notification', notificationData)
      this.logger.log(`⚡ Đã đẩy thông báo Real-time thành công tới User: ${userId}`)
    } else {
      this.logger.log(`ℹ️ User ${userId} hiện đang offline. Thông báo chỉ được lưu vào Database.`)
    }
  }
}
