// 导入导出 API

import { encrypt, decrypt } from '../utils/crypto.js';

/**
 * 导出账户数据
 */
export async function exportAccounts(request, env, user) {
  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData || !userData.accounts) {
      return new Response(JSON.stringify({ error: '没有可导出的数据' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const exportData = {
      version: '1.0',
      exportTime: Date.now(),
      accounts: userData.accounts
    };
    
    if (password) {
      const encrypted = await encrypt(exportData, password);
      return new Response(encrypted, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="2fa-backup-${Date.now()}.encrypted"`
        }
      });
    } else {
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="2fa-backup-${Date.now()}.json"`
        }
      });
    }
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '导出失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 导入账户数据
 */
export async function importAccounts(request, env, user) {
  try {
    const contentType = request.headers.get('Content-Type') || '';
    let importData;
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const password = formData.get('password');
      const merge = formData.get('merge') === 'true';
      
      if (!file) {
        return new Response(JSON.stringify({ error: '没有上传文件' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
      
      const content = await file.text();
      
      if (file.name.endsWith('.encrypted')) {
        if (!password) {
          return new Response(JSON.stringify({ error: '加密文件需要提供密码' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          });
        }
        importData = await decrypt(content, password);
      } else if (file.name.endsWith('.json')) {
        importData = JSON.parse(content);
      } else if (file.name.endsWith('.txt')) {
        importData = parsePlainTextImport(content);
      } else {
        return new Response(JSON.stringify({ error: '不支持的文件格式' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
      
      return await performImport(env, user, importData, merge);
      
    } else {
      const data = await request.json();
      const { accounts, merge = false, format = 'standard' } = data;
      
      if (format === '2fas') {
        importData = convert2FASFormat(accounts);
      } else {
        importData = { accounts };
      }
      
      return await performImport(env, user, importData, merge);
    }
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '导入失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 执行导入
 */
async function performImport(env, user, importData, merge) {
  if (!importData.accounts || !Array.isArray(importData.accounts)) {
    return new Response(JSON.stringify({ error: '导入数据格式无效' }), {
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
  
  const processedAccounts = [];
  
  for (const account of importData.accounts) {
    if (!account.name || !account.secret) continue;
    
    let secret = account.secret;
    if (typeof secret === 'string' && !secret.startsWith('encrypted:')) {
      secret = await encrypt({ secret }, env.ENCRYPTION_KEY);
    }
    
    processedAccounts.push({
      id: account.id || crypto.randomUUID(),
      name: account.name,
      issuer: account.issuer || '',
      secret: secret,
      digits: account.digits || 6,
      period: account.period || 30,
      category: account.category || '未分类',
      createdAt: account.createdAt || Date.now(),
      updatedAt: Date.now()
    });
  }
  
  if (merge) {
    const existingIds = new Set((userData.accounts || []).map(acc => acc.id));
    const newAccounts = processedAccounts.filter(acc => !existingIds.has(acc.id));
    userData.accounts = [...(userData.accounts || []), ...newAccounts];
  } else {
    userData.accounts = processedAccounts;
  }
  
  await env.USERS_KV.put(`user:${user.userId}`, JSON.stringify(userData));
  
  return new Response(JSON.stringify({
    success: true,
    count: processedAccounts.length,
    total: userData.accounts.length
  }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

/**
 * 解析纯文本格式（每行一个，格式：名称,密钥）
 */
function parsePlainTextImport(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const accounts = [];
  
  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      accounts.push({
        name: parts[0],
        secret: parts[1],
        issuer: parts[2] || '',
        digits: parseInt(parts[3]) || 6,
        period: parseInt(parts[4]) || 30
      });
    }
  }
  
  return { accounts };
}

/**
 * 转换 2FAS 格式
 */
function convert2FASFormat(data) {
  if (!data.services || !Array.isArray(data.services)) {
    return { accounts: [] };
  }
  
  const accounts = data.services.map(service => ({
    name: service.name,
    issuer: service.otp?.issuer || '',
    secret: service.secret,
    digits: service.otp?.digits || 6,
    period: service.otp?.period || 30,
    category: service.group?.name || '未分类'
  }));
  
  return { accounts };
}
