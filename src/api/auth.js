// 认证 API

import { generateJWT, verifyJWT } from '../utils/crypto.js';
import { checkRateLimit, getClientIP } from '../utils/rateLimit.js';

/**
 * OAuth 登录
 */
export async function handleOAuthLogin(request, env) {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;
  
  const authUrl = new URL('https://connect.linux.do/oauth2/authorize');
  authUrl.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'read');
  
  return Response.redirect(authUrl.toString(), 302);
}

/**
 * OAuth 回调
 */
export async function handleOAuthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('授权失败', { status: 400 });
  }
  
  try {
    const tokenResponse = await fetch('https://connect.linux.do/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: env.OAUTH_CLIENT_ID,
        client_secret: env.OAUTH_CLIENT_SECRET,
        redirect_uri: `${url.origin}/api/auth/callback`
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`获取访问令牌失败: ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    const userInfoResponse = await fetch('https://connect.linux.do/api/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      throw new Error(`获取用户信息失败: ${errorText}`);
    }
    
    const userInfo = await userInfoResponse.json();
    
    const userId = String(userInfo.id);
    
    // 检查用户是否已存在
    let userData = await env.USERS_KV.get(`user:${userId}`, 'json');
    let isNewUser = false;
    
    if (!userData) {
      // 自动注册新用户
      console.log(`自动注册新用户: ${userInfo.username} (ID: ${userId})`);
      isNewUser = true;
      userData = {
        id: userId,
        username: userInfo.username,
        name: userInfo.name,
        avatar_template: userInfo.avatar_template,
        active: userInfo.active,
        trust_level: userInfo.trust_level,
        silenced: userInfo.silenced,
        external_ids: userInfo.external_ids,
        accounts: [],
        webdavConfigs: [],
        createdAt: Date.now()
      };
      await env.USERS_KV.put(`user:${userId}`, JSON.stringify(userData));
    } else {
      // 更新已存在用户的信息
      console.log(`用户登录: ${userInfo.username} (ID: ${userId})`);
      userData.username = userInfo.username;
      userData.name = userInfo.name;
      userData.avatar_template = userInfo.avatar_template;
      userData.active = userInfo.active;
      userData.trust_level = userInfo.trust_level;
      userData.silenced = userInfo.silenced;
      userData.external_ids = userInfo.external_ids;
      userData.lastLogin = Date.now();
      await env.USERS_KV.put(`user:${userId}`, JSON.stringify(userData));
    }
    
    // 直接使用从 linux.do 获取的 access_token 作为认证令牌
    // 同时存储必要的用户信息以供后续验证
    const authToken = tokenData.access_token;
    
    // 存储token与用户信息的映射关系，用于后续验证
    const tokenInfo = {
      userId,
      username: userInfo.username,
      name: userInfo.name,
      isNewUser,
      expiresAt: Date.now() + (tokenData.expires_in * 1000), // 转换为毫秒时间戳
      scope: tokenData.scope
    };
    await env.USERS_KV.put(`token:${authToken}`, JSON.stringify(tokenInfo), {
      expirationTtl: tokenData.expires_in // 设置与token相同的过期时间
    });
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>登录成功</title>
      </head>
      <body>
        <script>
          localStorage.setItem('auth_token', '${authToken}');
          ${isNewUser ? "localStorage.setItem('is_new_user', 'true');" : ''}
          window.location.href = '/';
        </script>
      </body>
      </html>
    `;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(`登录失败: ${error.message}`, { status: 500 });
  }
}

/**
 * 简单登录已禁用，仅支持 OAuth 登录
 */
export async function handleSimpleLogin(request, env) {
  return new Response(JSON.stringify({ 
    error: '此登录方式已禁用',
    message: '请使用 OAuth 登录',
    oauthUrl: '/api/auth/oauth/login'
  }), {
    status: 403,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

/**
 * 验证认证中间件
 */
export async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`认证失败: 缺少Authorization头或格式错误 - ${request.url}`);
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    // 首先尝试从token映射中获取用户信息（来自linux.do的access_token）
    let tokenInfo = await env.USERS_KV.get(`token:${token}`, 'json');
    
    if (tokenInfo) {
      // 验证token是否过期
      if (tokenInfo.expiresAt && tokenInfo.expiresAt < Date.now()) {
        console.log(`认证失败: token已过期 - ${request.url}`);
        return null;
      }
      
      // 额外检查：确保用户在数据库中存在
      const userData = await env.USERS_KV.get(`user:${tokenInfo.userId}`, 'json');
      if (!userData) {
        console.log(`认证失败: 用户不存在 ${tokenInfo.userId} - ${request.url}`);
        return null;
      }
      
      return {
        userId: tokenInfo.userId,
        username: tokenInfo.username,
        name: tokenInfo.name,
        isNewUser: tokenInfo.isNewUser
      };
    }
    
    // 如果没有找到token映射，尝试验证自生成的JWT token（向后兼容）
    const payload = await verifyJWT(token, env.JWT_SECRET);
    
    if (!payload) {
      console.log(`认证失败: token验证失败 - ${request.url}`);
      return null;
    }
    
    // 额外检查：确保用户在数据库中存在
    const userData = await env.USERS_KV.get(`user:${payload.userId}`, 'json');
    if (!userData) {
      console.log(`认证失败: 用户不存在 ${payload.userId} - ${request.url}`);
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error(`认证异常: ${error.message} - ${request.url}`);
    return null;
  }
}

/**
 * 获取当前用户信息
 */
export async function handleGetCurrentUser(request, env, user) {
  try {
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const { accounts, webdavConfigs, ...userInfo } = userData;
    
    return new Response(JSON.stringify({
      user: {
        ...userInfo,
        accountCount: accounts?.length || 0,
        webdavConfigCount: webdavConfigs?.length || 0
      }
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '获取用户信息失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 删除用户账户
 */
export async function handleDeleteUser(request, env, user) {
  try {
    const userData = await env.USERS_KV.get(`user:${user.userId}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    await env.USERS_KV.delete(`user:${user.userId}`);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: '用户账户已删除，包括所有 2FA 账户和 WebDAV 配置'
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: '删除用户失败',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 登出
 */
export async function handleLogout(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // 尝试删除token映射（如果是linux.do的access_token）
    try {
      await env.USERS_KV.delete(`token:${token}`);
    } catch (error) {
      // 忽略删除错误，可能是JWT token或者token已不存在
      console.log(`登出时删除token映射失败: ${error.message}`);
    }
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
