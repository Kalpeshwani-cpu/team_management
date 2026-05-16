class RealtimeManager {
  private channels: Map<string, any> = new Map()

  subscribeToTable(
    tableName: string,
    callback: (event: any) => void,
    filter?: string
  ) {
    console.warn('Realtime is disabled: Migrated to Neon')
    return null
  }

  subscribeToProjects(userId: string, callback: (event: any) => void) {
    console.warn('Realtime is disabled: Migrated to Neon')
    return null
  }

  subscribeToTasks(projectId: string, callback: (event: any) => void) {
    console.warn('Realtime is disabled: Migrated to Neon')
    return null
  }

  subscribeToDepartments(callback: (event: any) => void) {
    console.warn('Realtime is disabled: Migrated to Neon')
    return null
  }

  unsubscribe(channelName: string) {
    // Do nothing
  }

  unsubscribeAll() {
    // Do nothing
  }

  getChannel(channelName: string) {
    return null
  }
}

export const realtimeManager = new RealtimeManager()
