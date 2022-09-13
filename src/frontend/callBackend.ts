export function callBackend<T>(path: string, method: string = "GET", body: any = undefined, token: string | undefined = undefined): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        try {
          const contentType = this.getResponseHeader("content-type");
          if (contentType?.startsWith("application/json")) {
            const response = JSON.parse(this.responseText) as T
            resolve(response)
          } else {
            reject(Error(`Unsupported response type: ${contentType}`))
          }
        } catch (err) {
          reject(Error(this.responseText))
        }
      }
    }
    request.open(method, path, true);
    if (token) {
      request.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    if (body) {
      request.setRequestHeader("content-type", "application/json");
      request.send(JSON.stringify(body))
    } else {
      request.send();
    }
  })
}