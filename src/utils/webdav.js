// WebDAV 客户端工具

/**
 * WebDAV 客户端
 */
export class WebDAVClient {
  constructor(url, username, password) {
    this.url = url.replace(/\/$/, '');
    this.auth = btoa(`${username}:${password}`);
  }

  /**
   * 上传文件
   */
  async upload(path, content) {
    const response = await fetch(`${this.url}${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/octet-stream'
      },
      body: content
    });

    if (!response.ok) {
      throw new Error(`WebDAV 上传失败: ${response.status} ${response.statusText}`);
    }

    return true;
  }

  /**
   * 下载文件
   */
  async download(path) {
    const response = await fetch(`${this.url}${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${this.auth}`
      }
    });

    if (!response.ok) {
      throw new Error(`WebDAV 下载失败: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * 列出目录
   */
  async list(path = '/') {
    const response = await fetch(`${this.url}${path}`, {
      method: 'PROPFIND',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Depth': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`WebDAV 列表失败: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    return this.parseListResponse(xml);
  }

  /**
   * 创建目录
   */
  async mkdir(path) {
    const response = await fetch(`${this.url}${path}`, {
      method: 'MKCOL',
      headers: {
        'Authorization': `Basic ${this.auth}`
      }
    });

    if (!response.ok && response.status !== 405) {
      throw new Error(`WebDAV 创建目录失败: ${response.status} ${response.statusText}`);
    }

    return true;
  }

  /**
   * 删除文件或目录
   */
  async delete(path) {
    const response = await fetch(`${this.url}${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${this.auth}`
      }
    });

    if (!response.ok) {
      throw new Error(`WebDAV 删除失败: ${response.status} ${response.statusText}`);
    }

    return true;
  }

  /**
   * 解析 PROPFIND 响应
   */
  parseListResponse(xml) {
    const files = [];
    const regex = /<d:href>([^<]+)<\/d:href>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      files.push(decodeURIComponent(match[1]));
    }

    return files;
  }
}

/**
 * 生成备份文件路径
 */
export function generateBackupPath(basePath = '/2fa-backup') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime();
  
  return `${basePath}/${year}/${month}/${day}/backup-${timestamp}.encrypted`;
}
