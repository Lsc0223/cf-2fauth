// 速率限制工具

/**
 * 检查速率限制
 * @param {KVNamespace} kv - KV 命名空间
 * @param {string} key - 限制键
 * @param {number} limit - 限制次数
 * @param {number} window - 时间窗口（秒）
 */
export async function checkRateLimit(kv, key, limit = 10, window = 60) {
  const now = Date.now();
  const data = await kv.get(key, 'json');
  
  if (!data) {
    await kv.put(key, JSON.stringify({
      count: 1,
      resetTime: now + window * 1000
    }), { expirationTtl: window });
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (now > data.resetTime) {
    await kv.put(key, JSON.stringify({
      count: 1,
      resetTime: now + window * 1000
    }), { expirationTtl: window });
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (data.count >= limit) {
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter: Math.ceil((data.resetTime - now) / 1000)
    };
  }
  
  data.count++;
  await kv.put(key, JSON.stringify(data), { 
    expirationTtl: Math.ceil((data.resetTime - now) / 1000) 
  });
  
  return { allowed: true, remaining: limit - data.count };
}

/**
 * 获取客户端 IP
 */
export function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Real-IP') || 
         request.headers.get('X-Forwarded-For')?.split(',')[0] || 
         'unknown';
}
