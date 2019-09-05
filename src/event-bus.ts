interface EventBusSubscriptions {
  [name: string]: {
    [id: number]: Function;
  };
}

export interface EventBusSubscription {
  unsubscribe: Function;
}

class EventBus {
  private subscriptions: EventBusSubscriptions = {};

  /**
   * Register a new callback
   * @param event
   * @param callback
   */
  on(event: string, callback: Function): EventBusSubscription {
    const id = Symbol('id');
    console.log(id);
    if (this.subscriptions[event] === undefined) {
      this.subscriptions[event] = {};
    }

    this.subscriptions[event][id] = callback;

    return {
      unsubscribe: () => {
        delete this.subscriptions[event][id];
      }
    }
  }

  /**
   * Emit a new event
   * @param event
   * @param payload
   */
  emit(event: string, payload?: any): void {
    console.log(event);
    if (this.subscriptions[event] === undefined) {
      return;
    }

    for (const id of Object.getOwnPropertySymbols(this.subscriptions[event])) {
      console.log('Found', id);
      this.subscriptions[event][id](payload);
    }
  }
}

export default new EventBus();