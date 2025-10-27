// 认证 API

import { generateJWT, verifyJWT } from '../utils/crypto.js';
import { checkRateLimit, getClientIP } from '../utils/rateLimit.js';

/**
 * OAuth 登录
 */
export async function handleOAuthLogin(request, env) {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;
  
  const authUrl = new URL('https://your-oauth-provider.com/oauth/authorize');
  authUrl.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  
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
    const tokenResponse = await fetch('https://your-oauth-provider.com/oauth/token', {
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
      throw new Error('获取访问令牌失败');
    }
    
    const tokenData = await tokenResponse.json();
    
    const userInfoResponse = await fetch('https://your-oauth-provider.com/oauth/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    if (!userInfoResponse.ok) {
      throw new Error('获取用户信息失败');
    }
    
    const userInfo = await userInfoResponse.json();
    
    const userId = userInfo.sub || userInfo.id;
    const token = await generateJWT(
      { userId, email: userInfo.email },
      env.JWT_SECRET,
      7200
    );
    
    let userData = await env.USERS_KV.get(`user:${userId}`, 'json');
    if (!userData) {
      userData = {
        id: userId,
        email: userInfo.email,
        name: userInfo.name,
        accounts: [],
        webdavConfigs: [],
        createdAt: Date.now()
      };
      await env.USERS_KV.put(`user:${userId}`, JSON.stringify(userData));
    }
    
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
 * 简单登录（用于开发/演示）
 */
export async function handleSimpleLogin(request, env) {
  const clientIP = getClientIP(request);
  const rateLimitKey = `login:${clientIP}`;
  const rateLimit = await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey, 5, 300);
  
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: '请求过于频繁',
      retryAfter: rateLimit.retryAfter
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
  
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return new Response(JSON.stringify({ error: '用户名和密码不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
    
    const userId = `demo_${username}`;
    const token = await generateJWT({ userId, username }, env.JWT_SECRET, 7200);
    
    let userData = await env.USERS_KV.get(`user:${userId}`, 'json');
    if (!userData) {
      userData = {
        id: userId,
        username: username,
        accounts: [],
        webdavConfigs: [],
        createdAt: Date.now()
      };
      await env.USERS_KV.put(`user:${userId}`, JSON.stringify(userData));
    }
    
    return new Response(JSON.stringify({ token, user: { id: userId, username } }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: '登录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
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
 * 登出
 */
export async function handleLogout(request, env) {
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
