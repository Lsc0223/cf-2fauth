// 部署管理 API

/**
 * 获取部署配置
 */
export async function getDeployConfig(request, env, user) {
  try {
    const configKey = `deploy_config:${user.id}`;
    const config = await env.USERS_KV.get(configKey, { type: 'json' });

    return new Response(JSON.stringify({
      config: config || null,
      hasConfig: !!config
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    console.error('获取部署配置失败:', error);
    return new Response(JSON.stringify({ error: '获取配置失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 保存部署配置
 */
export async function saveDeployConfig(request, env, user) {
  try {
    const body = await request.json();
    const { accountId, apiToken, workerName, kvNamespaceUsers, kvNamespaceRateLimit } = body;

    if (!accountId || !apiToken || !workerName) {
      return new Response(JSON.stringify({ error: '缺少必要的配置参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const config = {
      accountId,
      apiToken,
      workerName,
      kvNamespaceUsers,
      kvNamespaceRateLimit,
      updatedAt: Date.now()
    };

    const configKey = `deploy_config:${user.id}`;
    await env.USERS_KV.put(configKey, JSON.stringify(config));

    return new Response(JSON.stringify({
      success: true,
      message: '配置保存成功'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    console.error('保存部署配置失败:', error);
    return new Response(JSON.stringify({ error: '保存配置失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 创建 KV 命名空间
 */
export async function createKVNamespace(request, env, user) {
  try {
    const body = await request.json();
    const { accountId, apiToken, title } = body;

    if (!accountId || !apiToken || !title) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // 调用 Cloudflare API 创建 KV 命名空间
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('Cloudflare API 错误:', data);
      return new Response(JSON.stringify({
        error: '创建 KV 命名空间失败',
        details: data.errors || []
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      namespace: {
        id: data.result.id,
        title: data.result.title
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    console.error('创建 KV 命名空间失败:', error);
    return new Response(JSON.stringify({ error: '创建失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 部署 Worker
 */
export async function deployWorker(request, env, user) {
  try {
    const body = await request.json();
    const { accountId, apiToken, workerName, kvNamespaceUsers, kvNamespaceRateLimit } = body;

    if (!accountId || !apiToken || !workerName || !kvNamespaceUsers || !kvNamespaceRateLimit) {
      return new Response(JSON.stringify({ error: '缺少必要的部署参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // 读取当前 Worker 的脚本内容
    // 注意：在实际部署中，我们需要完整的脚本内容
    const workerScript = `// 此脚本将在实际环境中替换为完整的应用代码
// 请在本地使用 wrangler deploy 命令完成首次部署`;

    // 这里我们只是演示 API 调用流程
    // 实际部署需要使用 wrangler CLI 或完整的 Worker 脚本
    
    return new Response(JSON.stringify({
      success: true,
      message: '部署配置已保存。请使用以下命令完成部署：',
      deployCommand: `npx wrangler deploy`,
      wranglerConfig: {
        name: workerName,
        kv_namespaces: [
          {
            binding: 'USERS_KV',
            id: kvNamespaceUsers
          },
          {
            binding: 'RATE_LIMIT_KV',
            id: kvNamespaceRateLimit
          }
        ]
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    console.error('部署 Worker 失败:', error);
    return new Response(JSON.stringify({ error: '部署失败: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

/**
 * 获取部署状态
 */
export async function getDeployStatus(request, env, user) {
  try {
    const url = new URL(request.url);
    const accountId = url.searchParams.get('accountId');
    const apiToken = url.searchParams.get('apiToken');
    const workerName = url.searchParams.get('workerName');

    if (!accountId || !apiToken || !workerName) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // 查询 Worker 状态
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/services/${workerName}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return new Response(JSON.stringify({
        deployed: false,
        error: 'Worker 未部署或不存在'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    return new Response(JSON.stringify({
      deployed: true,
      worker: {
        name: data.result.id,
        environment: data.result.default_environment?.environment || 'production',
        createdOn: data.result.created_on,
        modifiedOn: data.result.modified_on
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    console.error('获取部署状态失败:', error);
    return new Response(JSON.stringify({
      deployed: false,
      error: error.message
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
