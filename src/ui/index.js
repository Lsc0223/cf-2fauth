// 前端 HTML 页面

export const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔐 2FA 安全管理系统</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary: #3b82f6;
      --primary-dark: #2563eb;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --bg: #f3f4f6;
      --card-bg: #ffffff;
      --text: #1f2937;
      --text-secondary: #6b7280;
      --border: #e5e7eb;
      --shadow: rgba(0, 0, 0, 0.1);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      background: var(--card-bg);
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow);
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .btn-success {
      background: var(--success);
      color: white;
    }

    .btn-danger {
      background: var(--danger);
      color: white;
    }

    .btn-secondary {
      background: var(--bg);
      color: var(--text);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .login-container {
      max-width: 400px;
      margin: 100px auto;
      padding: 40px;
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--shadow);
    }

    .login-container h2 {
      text-align: center;
      margin-bottom: 30px;
      font-size: 28px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
    }

    .card {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px var(--shadow);
      margin-bottom: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid var(--border);
    }

    .card-header h3 {
      font-size: 18px;
      font-weight: 600;
    }

    .search-bar {
      margin-bottom: 20px;
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .account-card {
      background: var(--card-bg);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s;
    }

    .account-card:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 12px var(--shadow);
    }

    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
    }

    .account-info h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .account-info p {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .account-actions {
      display: flex;
      gap: 8px;
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--bg);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: var(--border);
    }

    .code-display {
      background: var(--bg);
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      margin-bottom: 15px;
    }

    .code {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      color: var(--primary);
      margin-bottom: 8px;
    }

    .progress-bar {
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: var(--success);
      transition: width 1s linear;
    }

    .remaining-time {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }

    .modal.active {
      display: flex;
    }

    .modal-content {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .modal-header h3 {
      font-size: 20px;
      font-weight: 600;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--bg);
      border-radius: 6px;
      cursor: pointer;
      font-size: 20px;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--border);
    }

    .tab {
      padding: 10px 20px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }

    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .alert-success {
      background: #d1fae5;
      color: #065f46;
    }

    .alert-error {
      background: #fee2e2;
      color: #991b1b;
    }

    .alert-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .category-badge {
      display: inline-block;
      padding: 4px 12px;
      background: var(--bg);
      border-radius: 12px;
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 8px;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }

    .empty-state svg {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .accounts-grid {
        grid-template-columns: 1fr;
      }

      .header {
        flex-direction: column;
        gap: 15px;
      }

      .header-actions {
        width: 100%;
        flex-wrap: wrap;
      }

      .btn {
        flex: 1;
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <div id="app"></div>

  <script>
    const API_BASE = '';
    let authToken = localStorage.getItem('auth_token');
    let accounts = [];
    let codes = {};
    let categories = new Set(['未分类']);

    // 初始化应用
    async function init() {
      if (!authToken) {
        renderLogin();
        return;
      }

      try {
        await loadAccounts();
        renderApp();
        startCodeRefresh();
        
        // 检查是否是新用户首次登录
        const isNewUser = localStorage.getItem('is_new_user');
        if (isNewUser === 'true') {
          localStorage.removeItem('is_new_user');
          showWelcomeMessage();
        }
      } catch (error) {
        console.error('初始化失败:', error);
        localStorage.removeItem('auth_token');
        authToken = null;
        renderLogin();
      }
    }

    // 渲染登录页面
    function renderLogin() {
      document.getElementById('app').innerHTML = \`
        <div class="login-container">
          <h2>🔐 2FA 安全管理</h2>
          <p style="text-align: center; color: var(--text-secondary); margin-bottom: 20px;">
            使用 Linux.do 账户登录
          </p>
          <button class="btn btn-primary" onclick="window.location.href='/api/auth/oauth/login'" style="width: 100%;">
            🔑 使用 Linux.do 登录
          </button>
          <div id="login-error" style="margin-top: 15px;"></div>
        </div>
      \`;
    }

    // 渲染主应用
    function renderApp() {
      categories = new Set(['未分类', ...accounts.map(acc => acc.category)]);

      document.getElementById('app').innerHTML = \`
        <div class="container">
          <div class="header">
            <h1>🔐 2FA 安全管理系统</h1>
            <div class="header-actions">
              <button class="btn btn-primary" onclick="showAddModal()">➕ 添加账户</button>
              <button class="btn btn-secondary" onclick="showBackupModal()">☁️ 备份</button>
              <button class="btn btn-secondary" onclick="showImportModal()">📥 导入</button>
              <button class="btn btn-secondary" onclick="exportData()">📤 导出</button>
              <button class="btn btn-secondary" onclick="showSettingsModal()">⚙️ 设置</button>
              <button class="btn btn-secondary" onclick="logout()">🚪 退出</button>
            </div>
          </div>

          <div class="card">
            <div class="search-bar">
              <input type="text" class="form-control" id="search" placeholder="🔍 搜索账户..." onkeyup="filterAccounts()">
            </div>
            <div id="accounts-container"></div>
          </div>
        </div>

        <div id="modal-container"></div>
      \`;

      renderAccounts();
    }

    // 渲染账户列表
    function renderAccounts(filter = '') {
      const container = document.getElementById('accounts-container');
      
      let filtered = accounts;
      if (filter) {
        const lowerFilter = filter.toLowerCase();
        filtered = accounts.filter(acc => 
          acc.name.toLowerCase().includes(lowerFilter) ||
          (acc.issuer && acc.issuer.toLowerCase().includes(lowerFilter))
        );
      }

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <div style="font-size: 60px;">🔐</div>
            <h3>暂无账户</h3>
            <p>点击"添加账户"按钮开始添加</p>
          </div>
        \`;
        return;
      }

      container.innerHTML = \`
        <div class="accounts-grid">
          \${filtered.map(account => renderAccountCard(account)).join('')}
        </div>
      \`;
    }

    // 渲染账户卡片
    function renderAccountCard(account) {
      const code = codes[account.id] || { code: '------', remaining: 0, period: 30 };
      const progress = (code.remaining / code.period) * 100;

      return \`
        <div class="account-card">
          <div class="account-header">
            <div class="account-info">
              <h4>\${account.name}</h4>
              <p>\${account.issuer || '无发行者'}</p>
            </div>
            <div class="account-actions">
              <button class="icon-btn" onclick="editAccount('\${account.id}')" title="编辑">✏️</button>
              <button class="icon-btn" onclick="deleteAccount('\${account.id}')" title="删除">🗑️</button>
            </div>
          </div>
          <div class="code-display">
            <div class="code" onclick="copyCode('\${code.code}')" style="cursor: pointer;" title="点击复制">
              \${code.code}
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: \${progress}%"></div>
            </div>
            <div class="remaining-time">\${code.remaining} 秒后刷新</div>
          </div>
          <div class="category-badge">\${account.category}</div>
        </div>
      \`;
    }

    // 加载账户
    async function loadAccounts() {
      const response = await fetch(\`\${API_BASE}/api/accounts\`, {
        headers: { 'Authorization': \`Bearer \${authToken}\` }
      });

      if (!response.ok) throw new Error('加载失败');

      const data = await response.json();
      accounts = data.accounts || [];
    }

    // 加载验证码
    async function loadCodes() {
      try {
        const response = await fetch(\`\${API_BASE}/api/codes\`, {
          headers: { 'Authorization': \`Bearer \${authToken}\` }
        });

        if (response.ok) {
          const data = await response.json();
          codes = {};
          data.codes.forEach(item => {
            codes[item.accountId] = item;
          });
          renderAccounts(document.getElementById('search')?.value || '');
        }
      } catch (error) {
        console.error('加载验证码失败:', error);
      }
    }

    // 开始定时刷新验证码
    function startCodeRefresh() {
      loadCodes();
      setInterval(loadCodes, 1000);
    }

    // 过滤账户
    function filterAccounts() {
      const filter = document.getElementById('search').value;
      renderAccounts(filter);
    }

    // 复制验证码
    function copyCode(code) {
      navigator.clipboard.writeText(code).then(() => {
        showToast('已复制到剪贴板');
      });
    }

    // 显示添加模态框
    function showAddModal() {
      document.getElementById('modal-container').innerHTML = \`
        <div class="modal active">
          <div class="modal-content">
            <div class="modal-header">
              <h3>添加账户</h3>
              <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <form id="add-account-form">
              <div class="form-group">
                <label>账户名称 *</label>
                <input type="text" class="form-control" id="account-name" required>
              </div>
              <div class="form-group">
                <label>发行者</label>
                <input type="text" class="form-control" id="account-issuer">
              </div>
              <div class="form-group">
                <label>密钥 (Base32) *</label>
                <input type="text" class="form-control" id="account-secret" required placeholder="例如: JBSWY3DPEHPK3PXP">
              </div>
              <div class="form-group">
                <label>分类</label>
                <input type="text" class="form-control" id="account-category" value="未分类" list="categories">
                <datalist id="categories">
                  \${Array.from(categories).map(cat => \`<option value="\${cat}">\`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label>验证码位数</label>
                <select class="form-control" id="account-digits">
                  <option value="6">6 位</option>
                  <option value="8">8 位</option>
                </select>
              </div>
              <div class="form-group">
                <label>时间周期（秒）</label>
                <select class="form-control" id="account-period">
                  <option value="30">30 秒</option>
                  <option value="60">60 秒</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">添加</button>
            </form>
          </div>
        </div>
      \`;

      document.getElementById('add-account-form').addEventListener('submit', handleAddAccount);
    }

    // 处理添加账户
    async function handleAddAccount(e) {
      e.preventDefault();

      const data = {
        name: document.getElementById('account-name').value,
        issuer: document.getElementById('account-issuer').value,
        secret: document.getElementById('account-secret').value.replace(/\\s/g, ''),
        category: document.getElementById('account-category').value,
        digits: parseInt(document.getElementById('account-digits').value),
        period: parseInt(document.getElementById('account-period').value)
      };

      try {
        const response = await fetch(\`\${API_BASE}/api/accounts\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${authToken}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          await loadAccounts();
          renderApp();
          closeModal();
          showToast('账户添加成功');
        } else {
          const error = await response.json();
          alert(error.error || '添加失败');
        }
      } catch (error) {
        alert('网络错误');
      }
    }

    // 编辑账户
    function editAccount(id) {
      const account = accounts.find(acc => acc.id === id);
      if (!account) return;

      document.getElementById('modal-container').innerHTML = \`
        <div class="modal active">
          <div class="modal-content">
            <div class="modal-header">
              <h3>编辑账户</h3>
              <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <form id="edit-account-form">
              <div class="form-group">
                <label>账户名称 *</label>
                <input type="text" class="form-control" id="edit-account-name" value="\${account.name}" required>
              </div>
              <div class="form-group">
                <label>发行者</label>
                <input type="text" class="form-control" id="edit-account-issuer" value="\${account.issuer || ''}">
              </div>
              <div class="form-group">
                <label>分类</label>
                <input type="text" class="form-control" id="edit-account-category" value="\${account.category}" list="categories">
                <datalist id="categories">
                  \${Array.from(categories).map(cat => \`<option value="\${cat}">\`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label>验证码位数</label>
                <select class="form-control" id="edit-account-digits">
                  <option value="6" \${account.digits === 6 ? 'selected' : ''}>6 位</option>
                  <option value="8" \${account.digits === 8 ? 'selected' : ''}>8 位</option>
                </select>
              </div>
              <div class="form-group">
                <label>时间周期（秒）</label>
                <select class="form-control" id="edit-account-period">
                  <option value="30" \${account.period === 30 ? 'selected' : ''}>30 秒</option>
                  <option value="60" \${account.period === 60 ? 'selected' : ''}>60 秒</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">保存</button>
            </form>
          </div>
        </div>
      \`;

      document.getElementById('edit-account-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
          name: document.getElementById('edit-account-name').value,
          issuer: document.getElementById('edit-account-issuer').value,
          category: document.getElementById('edit-account-category').value,
          digits: parseInt(document.getElementById('edit-account-digits').value),
          period: parseInt(document.getElementById('edit-account-period').value)
        };

        try {
          const response = await fetch(\`\${API_BASE}/api/accounts/\${id}\`, {
            method: 'PUT',
            headers: {
              'Authorization': \`Bearer \${authToken}\`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            await loadAccounts();
            renderApp();
            closeModal();
            showToast('账户已更新');
          } else {
            const error = await response.json();
            alert(error.error || '更新失败');
          }
        } catch (error) {
          alert('网络错误');
        }
      });
    }

    // 删除账户
    async function deleteAccount(id) {
      if (!confirm('确定要删除这个账户吗？')) return;

      try {
        const response = await fetch(\`\${API_BASE}/api/accounts/\${id}\`, {
          method: 'DELETE',
          headers: { 'Authorization': \`Bearer \${authToken}\` }
        });

        if (response.ok) {
          await loadAccounts();
          renderApp();
          showToast('账户已删除');
        }
      } catch (error) {
        alert('删除失败');
      }
    }

    // 显示备份模态框
    function showBackupModal() {
      document.getElementById('modal-container').innerHTML = \`
        <div class="modal active">
          <div class="modal-content">
            <div class="modal-header">
              <h3>云端备份</h3>
              <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <div class="tabs">
              <button class="tab active" onclick="switchTab('backup-tab')">创建备份</button>
              <button class="tab" onclick="switchTab('restore-tab')">恢复备份</button>
              <button class="tab" onclick="switchTab('config-tab')">WebDAV 配置</button>
            </div>
            <div id="backup-tab" class="tab-content active">
              <p style="margin-bottom: 20px;">WebDAV 功能需要先配置存储账号</p>
              <button class="btn btn-primary" onclick="switchTab('config-tab')" style="width: 100%;">配置 WebDAV</button>
            </div>
            <div id="restore-tab" class="tab-content">
              <p>恢复功能开发中...</p>
            </div>
            <div id="config-tab" class="tab-content">
              <p style="margin-bottom: 15px; color: var(--text-secondary);">支持 Nextcloud、ownCloud、TeraCloud 等 WebDAV 服务</p>
              <form id="webdav-form">
                <div class="form-group">
                  <label>配置名称 *</label>
                  <input type="text" class="form-control" id="webdav-name" required>
                </div>
                <div class="form-group">
                  <label>WebDAV URL *</label>
                  <input type="url" class="form-control" id="webdav-url" required placeholder="https://example.com/remote.php/dav/files/username/">
                </div>
                <div class="form-group">
                  <label>用户名 *</label>
                  <input type="text" class="form-control" id="webdav-username" required>
                </div>
                <div class="form-group">
                  <label>密码 *</label>
                  <input type="password" class="form-control" id="webdav-password" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">保存配置</button>
              </form>
            </div>
          </div>
        </div>
      \`;

      document.getElementById('webdav-form')?.addEventListener('submit', handleAddWebDAV);
    }

    // 切换标签
    function switchTab(tabId) {
      document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      event.target.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    }

    // 处理添加 WebDAV
    async function handleAddWebDAV(e) {
      e.preventDefault();
      
      const data = {
        name: document.getElementById('webdav-name').value,
        url: document.getElementById('webdav-url').value,
        username: document.getElementById('webdav-username').value,
        password: document.getElementById('webdav-password').value
      };

      try {
        const response = await fetch(\`\${API_BASE}/api/webdav/configs\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${authToken}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          showToast('WebDAV 配置已保存');
          closeModal();
        } else {
          const error = await response.json();
          alert(error.error || '配置失败');
        }
      } catch (error) {
        alert('网络错误');
      }
    }

    // 显示导入模态框
    function showImportModal() {
      document.getElementById('modal-container').innerHTML = \`
        <div class="modal active">
          <div class="modal-content">
            <div class="modal-header">
              <h3>导入数据</h3>
              <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <form id="import-form">
              <div class="form-group">
                <label>选择文件</label>
                <input type="file" class="form-control" id="import-file" accept=".json,.txt,.encrypted">
              </div>
              <div class="form-group">
                <label>密码（如果是加密文件）</label>
                <input type="password" class="form-control" id="import-password">
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" id="import-merge"> 合并导入（不覆盖现有数据）
                </label>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">导入</button>
            </form>
          </div>
        </div>
      \`;

      document.getElementById('import-form').addEventListener('submit', handleImport);
    }

    // 处理导入
    async function handleImport(e) {
      e.preventDefault();

      const file = document.getElementById('import-file').files[0];
      if (!file) {
        alert('请选择文件');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', document.getElementById('import-password').value);
      formData.append('merge', document.getElementById('import-merge').checked);

      try {
        const response = await fetch(\`\${API_BASE}/api/import\`, {
          method: 'POST',
          headers: { 'Authorization': \`Bearer \${authToken}\` },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          await loadAccounts();
          renderApp();
          closeModal();
          showToast(\`成功导入 \${data.count} 个账户\`);
        } else {
          const error = await response.json();
          alert(error.error || '导入失败');
        }
      } catch (error) {
        alert('导入失败');
      }
    }

    // 导出数据
    async function exportData() {
      const password = prompt('输入导出密码（留空则不加密）：');
      
      try {
        let url = \`\${API_BASE}/api/export\`;
        if (password) {
          url += \`?password=\${encodeURIComponent(password)}\`;
        }

        const response = await fetch(url, {
          headers: { 'Authorization': \`Bearer \${authToken}\` }
        });

        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = password ? \`2fa-backup-\${Date.now()}.encrypted\` : \`2fa-backup-\${Date.now()}.json\`;
          a.click();
          showToast('导出成功');
        }
      } catch (error) {
        alert('导出失败');
      }
    }

    // 关闭模态框
    function closeModal() {
      document.getElementById('modal-container').innerHTML = '';
    }

    // 显示提示
    function showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'alert alert-success';
      toast.textContent = message;
      toast.style.position = 'fixed';
      toast.style.top = '20px';
      toast.style.right = '20px';
      toast.style.zIndex = '10000';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    // 显示欢迎消息（新用户首次登录）
    function showWelcomeMessage() {
      document.getElementById('modal-container').innerHTML = \`
        <div class="modal active">
          <div class="modal-content">
            <div class="modal-header">
              <h3>🎉 欢迎使用 2FA 安全管理系统</h3>
              <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <p style="margin-bottom: 15px;">您已成功注册并登录！</p>
              <p style="margin-bottom: 15px; color: var(--text-secondary);">
                这是一个安全的双因素认证(2FA)管理系统，您可以：
              </p>
              <ul style="margin-bottom: 20px; padding-left: 20px; color: var(--text-secondary);">
                <li style="margin-bottom: 8px;">📱 添加和管理您的 2FA 账户</li>
                <li style="margin-bottom: 8px;">🔐 生成 TOTP 验证码</li>
                <li style="margin-bottom: 8px;">☁️ 通过 WebDAV 云端备份</li>
                <li style="margin-bottom: 8px;">📥📤 导入和导出数据</li>
              </ul>
              <p style="margin-bottom: 20px; color: var(--text-secondary); font-size: 14px;">
                💡 提示：点击右上角 "➕ 添加账户" 开始添加您的第一个 2FA 账户
              </p>
              <button class="btn btn-primary" onclick="closeModal()" style="width: 100%;">
                开始使用
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    // 显示设置模态框
    async function showSettingsModal() {
      try {
        const response = await fetch(\`\${API_BASE}/api/user\`, {
          headers: {
            'Authorization': \`Bearer \${authToken}\`
          }
        });

        let userInfo = { username: '用户', accountCount: 0 };
        if (response.ok) {
          const data = await response.json();
          userInfo = data.user;
        }

        document.getElementById('modal-container').innerHTML = \`
          <div class="modal active">
            <div class="modal-content">
              <div class="modal-header">
                <h3>⚙️ 用户设置</h3>
                <button class="close-btn" onclick="closeModal()">×</button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>用户 ID</label>
                  <input type="text" class="form-control" value="\${userInfo.id || '-'}" readonly>
                </div>
                <div class="form-group">
                  <label>用户名</label>
                  <input type="text" class="form-control" value="\${userInfo.username || '-'}" readonly>
                </div>
                <div class="form-group">
                  <label>昵称</label>
                  <input type="text" class="form-control" value="\${userInfo.name || '-'}" readonly>
                </div>
                <div class="form-group">
                  <label>信任等级</label>
                  <input type="text" class="form-control" value="\${userInfo.trust_level !== undefined ? userInfo.trust_level : '-'}" readonly>
                </div>
                <div class="form-group">
                  <label>账户状态</label>
                  <input type="text" class="form-control" value="\${userInfo.active ? '活跃' : '非活跃'}" readonly>
                </div>
                <div class="form-group">
                  <label>2FA 账户数量</label>
                  <input type="text" class="form-control" value="\${userInfo.accountCount || 0}" readonly>
                </div>
                <div class="form-group">
                  <label>创建时间</label>
                  <input type="text" class="form-control" value="\${userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleString('zh-CN') : '-'}" readonly>
                </div>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--border);">
                <div class="form-group">
                  <label style="color: var(--danger); font-weight: bold;">⚠️ 危险操作</label>
                  <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 10px;">
                    删除账户将永久删除您的所有数据，包括所有 2FA 账户和 WebDAV 配置。此操作无法撤销！
                  </p>
                  <button class="btn btn-danger" onclick="deleteUserAccount()" style="width: 100%;">
                    🗑️ 删除我的账户
                  </button>
                </div>
              </div>
            </div>
          </div>
        \`;
      } catch (error) {
        alert('加载用户信息失败');
      }
    }

    // 删除用户账户
    async function deleteUserAccount() {
      const confirmed = confirm('⚠️ 警告：删除账户将永久删除所有数据！\\n\\n此操作无法撤销，确定要继续吗？');
      
      if (!confirmed) return;

      const doubleConfirm = confirm('⚠️ 最后确认：这是您的最后机会！\\n\\n删除后将清除：\\n- 所有 2FA 账户\\n- 所有 WebDAV 配置\\n- 所有备份记录\\n\\n确定删除吗？');
      
      if (!doubleConfirm) return;

      try {
        const response = await fetch(\`\${API_BASE}/api/user\`, {
          method: 'DELETE',
          headers: {
            'Authorization': \`Bearer \${authToken}\`
          }
        });

        if (response.ok) {
          alert('账户已成功删除');
          localStorage.removeItem('auth_token');
          authToken = null;
          location.reload();
        } else {
          const error = await response.json();
          alert(\`删除失败: \${error.error || '未知错误'}\`);
        }
      } catch (error) {
        alert('网络错误，请稍后重试');
      }
    }

    // 退出登录
    function logout() {
      if (confirm('确定要退出吗？')) {
        localStorage.removeItem('auth_token');
        authToken = null;
        location.reload();
      }
    }

    // 初始化
    init();
  </script>
</body>
</html>`;
