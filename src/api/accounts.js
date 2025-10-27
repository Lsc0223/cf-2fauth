// 账户管理 API

import { encrypt, decrypt, generateTOTP } from '../utils/crypto.js';
import { checkRateLimit } from '../utils/rateLimit.js';

/**
 * 获取所有账户
 */
export async function getAccounts(request, env, user) {
  try {
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ accounts: [] }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const accounts = userData.accounts || [];
    const accountsWithoutSecrets = accounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      issuer: acc.issuer,
      category: acc.category,
      digits: acc.digits,
      period: acc.period,
      createdAt: acc.createdAt,
      updatedAt: acc.updatedAt
    }));
    
    return new Response(JSON.stringify({ accounts: accountsWithoutSecrets }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取账户失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 添加账户
 */
export async function addAccount(request, env, user) {
  const rateLimitKey = `add_account:${user.userId}`;
  const rateLimit = await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey, 20, 60);
  
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: '操作过于频繁' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
  
  try {
    const data = await request.json();
    const { name, issuer, secret, digits = 6, period = 30, category = '未分类' } = data;
    
    if (!name || !secret) {
      return new Response(JSON.stringify({ error: '名称和密钥不能为空' }), {
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
    
    const encryptedSecret = await encrypt({ secret }, env.ENCRYPTION_KEY);
    
    const account = {
      id: crypto.randomUUID(),
      name,
      issuer: issuer || '',
      secret: encryptedSecret,
      digits: parseInt(digits),
      period: parseInt(period),
      category,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    userData.accounts = userData.accounts || [];
    userData.accounts.push(account);
    
    await env.USERS_KV.put(`user:${user.userId}`, JSON.stringify(userData));
    
    const accountResponse = { ...account };
    delete accountResponse.secret;
    
    return new Response(JSON.stringify({ account: accountResponse }), {
      status: 201,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '添加账户失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 更新账户
 */
export async function updateAccount(request, env, user, accountId) {
  try {
    const data = await request.json();
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const accountIndex = userData.accounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex === -1) {
      return new Response(JSON.stringify({ error: '账户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const account = userData.accounts[accountIndex];
    
    if (data.name) account.name = data.name;
    if (data.issuer !== undefined) account.issuer = data.issuer;
    if (data.category) account.category = data.category;
    if (data.digits) account.digits = parseInt(data.digits);
    if (data.period) account.period = parseInt(data.period);
    
    if (data.secret) {
      account.secret = await encrypt({ secret: data.secret }, env.ENCRYPTION_KEY);
    }
    
    account.updatedAt = Date.now();
    userData.accounts[accountIndex] = account;
    
    await env.USERS_KV.put(`user:${user.userId}`, JSON.stringify(userData));
    
    const accountResponse = { ...account };
    delete accountResponse.secret;
    
    return new Response(JSON.stringify({ account: accountResponse }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '更新账户失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 删除账户
 */
export async function deleteAccount(request, env, user, accountId) {
  try {
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const initialLength = userData.accounts.length;
    userData.accounts = userData.accounts.filter(acc => acc.id !== accountId);
    
    if (userData.accounts.length === initialLength) {
      return new Response(JSON.stringify({ error: '账户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    await env.USERS_KV.put(`user:${user.userId}`, JSON.stringify(userData));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '删除账户失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 生成 TOTP 代码
 */
export async function generateCode(request, env, user, accountId) {
  const rateLimitKey = `generate:${user.userId}:${accountId}`;
  const rateLimit = await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey, 30, 30);
  
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: '请求过于频繁' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
  
  try {
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const account = userData.accounts.find(acc => acc.id === accountId);
    
    if (!account) {
      return new Response(JSON.stringify({ error: '账户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const decryptedData = await decrypt(account.secret, env.ENCRYPTION_KEY);
    const code = await generateTOTP(
      decryptedData.secret,
      Date.now(),
      account.digits,
      account.period
    );
    
    const now = Date.now();
    const period = account.period * 1000;
    const remaining = period - (now % period);
    
    return new Response(JSON.stringify({
      code,
      remaining: Math.floor(remaining / 1000),
      period: account.period
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '生成验证码失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 批量生成 TOTP 代码
 */
export async function generateAllCodes(request, env, user) {
  const rateLimitKey = `generate_all:${user.userId}`;
  const rateLimit = await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey, 60, 60);
  
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: '请求过于频繁' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
  
  try {
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData || !userData.accounts) {
      return new Response(JSON.stringify({ codes: [] }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const codes = [];
    const now = Date.now();
    
    for (const account of userData.accounts) {
      try {
        const decryptedData = await decrypt(account.secret, env.ENCRYPTION_KEY);
        const code = await generateTOTP(
          decryptedData.secret,
          now,
          account.digits,
          account.period
        );
        
        const period = account.period * 1000;
        const remaining = period - (now % period);
        
        codes.push({
          accountId: account.id,
          code,
          remaining: Math.floor(remaining / 1000),
          period: account.period
        });
      } catch (error) {
        console.error(`生成账户 ${account.id} 的验证码失败:`, error);
      }
    }
    
    return new Response(JSON.stringify({ codes }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '生成验证码失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
