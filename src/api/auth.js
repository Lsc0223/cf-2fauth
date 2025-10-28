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
    
    // 生成JWT token
    const token = await generateJWT(
      { 
        userId,
        username: userInfo.username,
        name: userInfo.name,
        isNewUser
      },
      env.JWT_SECRET,
      7200
    );
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>登录成功</title>
      </head>
      <body>
        <script>
          localStorage.setItem('auth_token', '${token}');
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
    return null;
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  
  return payload;
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
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
