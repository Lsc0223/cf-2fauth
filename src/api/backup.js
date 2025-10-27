// 备份管理 API

import { encrypt, decrypt } from '../utils/crypto.js';
import { WebDAVClient, generateBackupPath } from '../utils/webdav.js';
import { checkRateLimit } from '../utils/rateLimit.js';

/**
 * 获取 WebDAV 配置
 */
export async function getWebDAVConfigs(request, env, user) {
  try {
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ configs: [] }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const configs = (userData.webdavConfigs || []).map(config => ({
      id: config.id,
      name: config.name,
      url: config.url,
      username: config.username,
      createdAt: config.createdAt
    }));
    
    return new Response(JSON.stringify({ configs }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取配置失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 添加 WebDAV 配置
 */
export async function addWebDAVConfig(request, env, user) {
  try {
    const data = await request.json();
    const { name, url, username, password } = data;
    
    if (!name || !url || !username || !password) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const client = new WebDAVClient(url, username, password);
    await client.list('/');
    
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const encryptedPassword = await encrypt({ password }, env.ENCRYPTION_KEY);
    
    const config = {
      id: crypto.randomUUID(),
      name,
      url,
      username,
      password: encryptedPassword,
      createdAt: Date.now()
    };
    
    userData.webdavConfigs = userData.webdavConfigs || [];
    userData.webdavConfigs.push(config);
    
    await env.USERS_KV.put(`user:${user.userId}`, JSON.stringify(userData));
    
    return new Response(JSON.stringify({
      config: {
        id: config.id,
        name: config.name,
        url: config.url,
        username: config.username,
        createdAt: config.createdAt
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '添加配置失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 删除 WebDAV 配置
 */
export async function deleteWebDAVConfig(request, env, user, configId) {
  try {
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const initialLength = (userData.webdavConfigs || []).length;
    userData.webdavConfigs = (userData.webdavConfigs || []).filter(cfg => cfg.id !== configId);
    
    if (userData.webdavConfigs.length === initialLength) {
      return new Response(JSON.stringify({ error: '配置不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    await env.USERS_KV.put(`user:${user.userId}`, JSON.stringify(userData));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '删除配置失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 创建备份
 */
export async function createBackup(request, env, user) {
  const rateLimitKey = `backup:${user.userId}`;
  const rateLimit = await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey, 10, 3600);
  
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: '备份过于频繁，请稍后再试' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
  
  try {
    const data = await request.json();
    const { configId, password } = data;
    
    if (!configId || !password) {
      return new Response(JSON.stringify({ error: '配置 ID 和备份密码不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const config = (userData.webdavConfigs || []).find(cfg => cfg.id === configId);
    
    if (!config) {
      return new Response(JSON.stringify({ error: 'WebDAV 配置不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const decryptedPassword = await decrypt(config.password, env.ENCRYPTION_KEY);
    const client = new WebDAVClient(config.url, config.username, decryptedPassword.password);
    
    const backupData = {
      version: '1.0',
      exportTime: Date.now(),
      accounts: userData.accounts || []
    };
    
    const encryptedBackup = await encrypt(backupData, password);
    
    const backupPath = generateBackupPath();
    const pathParts = backupPath.split('/').slice(0, -1);
    
    for (let i = 1; i <= pathParts.length; i++) {
      const dirPath = pathParts.slice(0, i).join('/');
      try {
        await client.mkdir(dirPath);
      } catch (error) {
      }
    }
    
    await client.upload(backupPath, encryptedBackup);
    
    return new Response(JSON.stringify({
      success: true,
      path: backupPath,
      timestamp: Date.now()
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '创建备份失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 恢复备份
 */
export async function restoreBackup(request, env, user) {
  try {
    const data = await request.json();
    const { configId, path, password } = data;
    
    if (!configId || !path || !password) {
      return new Response(JSON.stringify({ error: '所有字段都是必填的' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const config = (userData.webdavConfigs || []).find(cfg => cfg.id === configId);
    
    if (!config) {
      return new Response(JSON.stringify({ error: 'WebDAV 配置不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const decryptedPassword = await decrypt(config.password, env.ENCRYPTION_KEY);
    const client = new WebDAVClient(config.url, config.username, decryptedPassword.password);
    
    const encryptedBackup = await client.download(path);
    const backupData = await decrypt(encryptedBackup, password);
    
    if (!backupData.accounts || !Array.isArray(backupData.accounts)) {
      return new Response(JSON.stringify({ error: '备份文件格式无效' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    userData.accounts = backupData.accounts;
    await env.USERS_KV.put(`user:${user.userId}`, JSON.stringify(userData));
    
    return new Response(JSON.stringify({
      success: true,
      count: backupData.accounts.length
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '恢复备份失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 列出备份文件
 */
export async function listBackups(request, env, user) {
  try {
    const url = new URL(request.url);
    const configId = url.searchParams.get('configId');
    
    if (!configId) {
      return new Response(JSON.stringify({ error: '配置 ID 不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const config = (userData.webdavConfigs || []).find(cfg => cfg.id === configId);
    
    if (!config) {
      return new Response(JSON.stringify({ error: 'WebDAV 配置不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const decryptedPassword = await decrypt(config.password, env.ENCRYPTION_KEY);
    const client = new WebDAVClient(config.url, config.username, decryptedPassword.password);
    
    const files = await client.list('/2fa-backup');
    const backupFiles = files
      .filter(file => file.endsWith('.encrypted'))
      .map(file => ({
        path: file,
        name: file.split('/').pop()
      }));
    
    return new Response(JSON.stringify({ backups: backupFiles }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取备份列表失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
