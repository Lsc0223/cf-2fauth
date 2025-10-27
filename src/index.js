// Cloudflare Workers 入口文件

import { authenticate, handleOAuthLogin, handleOAuthCallback, handleSimpleLogin, handleLogout } from './api/auth.js';
import { getAccounts, addAccount, updateAccount, deleteAccount, generateCode, generateAllCodes } from './api/accounts.js';
import { getWebDAVConfigs, addWebDAVConfig, deleteWebDAVConfig, createBackup, restoreBackup, listBackups } from './api/backup.js';
import { exportAccounts, importAccounts } from './api/import.js';
import { HTML_CONTENT } from './ui/index.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/' || path === '/index.html') {
        return new Response(HTML_CONTENT, {
          headers: { 
            'Content-Type': 'text/html; charset=utf-8',
            ...corsHeaders
          }
        });
      }

      if (path === '/api/auth/login') {
        const response = await handleSimpleLogin(request, env);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      if (path === '/api/auth/oauth/login') {
        return await handleOAuthLogin(request, env);
      }

      if (path === '/api/auth/oauth/callback') {
        return await handleOAuthCallback(request, env);
      }

      if (path === '/api/auth/logout') {
        const response = await handleLogout(request, env);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      const user = await authenticate(request, env);
      if (!user) {
        return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
          status: 401,
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            ...corsHeaders
          }
        });
      }

      let response;

      if (path === '/api/accounts' && method === 'GET') {
        response = await getAccounts(request, env, user);
      } else if (path === '/api/accounts' && method === 'POST') {
        response = await addAccount(request, env, user);
      } else if (path.startsWith('/api/accounts/') && method === 'PUT') {
        const accountId = path.split('/')[3];
        response = await updateAccount(request, env, user, accountId);
      } else if (path.startsWith('/api/accounts/') && method === 'DELETE') {
        const accountId = path.split('/')[3];
        response = await deleteAccount(request, env, user, accountId);
      } else if (path.startsWith('/api/accounts/') && path.endsWith('/code') && method === 'GET') {
        const accountId = path.split('/')[3];
        response = await generateCode(request, env, user, accountId);
      } else if (path === '/api/codes' && method === 'GET') {
        response = await generateAllCodes(request, env, user);
      } else if (path === '/api/webdav/configs' && method === 'GET') {
        response = await getWebDAVConfigs(request, env, user);
      } else if (path === '/api/webdav/configs' && method === 'POST') {
        response = await addWebDAVConfig(request, env, user);
      } else if (path.startsWith('/api/webdav/configs/') && method === 'DELETE') {
        const configId = path.split('/')[4];
        response = await deleteWebDAVConfig(request, env, user, configId);
      } else if (path === '/api/backup/create' && method === 'POST') {
        response = await createBackup(request, env, user);
      } else if (path === '/api/backup/restore' && method === 'POST') {
        response = await restoreBackup(request, env, user);
      } else if (path === '/api/backup/list' && method === 'GET') {
        response = await listBackups(request, env, user);
      } else if (path === '/api/export' && method === 'GET') {
        response = await exportAccounts(request, env, user);
      } else if (path === '/api/import' && method === 'POST') {
        response = await importAccounts(request, env, user);
      } else {
        response = new Response(JSON.stringify({ error: '接口不存在' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }

      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      console.error('请求处理错误:', error);
      return new Response(JSON.stringify({ 
        error: '服务器内部错误',
        message: error.message 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders
        }
      });
    }
  },
};
