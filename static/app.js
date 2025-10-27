document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    let isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    function renderLogin() {
        mainContent.innerHTML = `
            <div class="login-container">
                <h2>登录</h2>
                <p>请使用您的 OAuth 提供商登录。</p>
                <div class="oauth-buttons">
                    <button id="login-btn">使用 OAuth 登录 (模拟)</button>
                </div>
            </div>
        `;
        document.getElementById('login-btn').addEventListener('click', handleLogin);
    }

    function renderDashboard() {
        mainContent.innerHTML = `
            <div class="dashboard-container">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2>仪表盘</h2>
                    <button id="logout-btn">退出登录</button>
                </div>
                <button id="add-account-btn">添加新账户</button>
                <div class="search-bar">
                     <input type="text" id="search-input" placeholder="搜索账户...">
                </div>
                <h3>您的 2FA 账户</h3>
                <ul id="account-list" class="account-list">
                    <!-- Accounts will be dynamically inserted here -->
                </ul>
            </div>
        `;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        fetchAndDisplayAccounts();
    }
    
    async function handleLogin() {
        // Simulate an OAuth login flow
        try {
            const response = await fetch('/api/login', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('jwt', data.token);
                isLoggedIn = true;
                renderDashboard();
            } else {
                alert('登录失败!');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('登录过程中发生错误。');
        }
    }

    function handleLogout() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('jwt');
        isLoggedIn = false;
        renderLogin();
    }

    async function fetchAndDisplayAccounts() {
        const accountList = document.getElementById('account-list');
        // Mock data
        const mockAccounts = [
            { id: 1, name: 'user@example.com', issuer: 'Google', secret: 'JBSWY3DPEHPK3PXP' },
            { id: 2, name: 'my-project', issuer: 'GitHub', secret: 'JBSWY3DPEHPK3PXP' },
            { id: 3, name: 'personal-server', issuer: 'Cloudflare', secret: 'JBSWY3DPEHPK3PXP' }
        ];

        accountList.innerHTML = mockAccounts.map(account => `
            <li class="account-item">
                <div class="account-info">
                    <span class="account-name">${account.issuer}</span>
                    <span class="account-issuer">${account.name}</span>
                </div>
                <div class="totp-section">
                    <span class="totp-code">123 456</span>
                    <div class="progress-bar"></div>
                </div>
            </li>
        `).join('');
    }

    if (isLoggedIn) {
        renderDashboard();
    } else {
        renderLogin();
    }
});
