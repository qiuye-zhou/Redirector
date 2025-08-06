// 请求拦截服务
export class RequestInterceptor {
  constructor() {
    this.requests = [];
    this.listeners = new Set();
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  handleNewResponse(response) {
    this.requests.push(response);
    this.notifyListeners();
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.requests));
  }
} 