        const SUPABASE_URL = 'https://ikoonalxzxseukvevyfu.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrb29uYWx4enhzZXVrdmV2eWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2OTY3MDUsImV4cCI6MjA1NjI3MjcwNX0.d9WXxn-H3c_ja_eUXD2ziA_bwSjIthl';
        
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('authModal');
            const closeBtn = document.getElementById('closeModal');
            const buyBtn = document.getElementById('buyBtn');
            const sellBtn = document.getElementById('sellBtn');
            const userWalletInfo = document.getElementById('userWalletInfo');
            const walletUserName = document.getElementById('walletUserName');
            const walletUserBalance = document.getElementById('walletUserBalance');
            const userBalanceElement = document.getElementById('userBalance');
            
            checkUserAndUpdateUI();
            
            async function checkUserAndUpdateUI() {
                const savedUser = localStorage.getItem('currentUser');
                
                if (!savedUser) {
                    modal.style.display = 'block';
                    userWalletInfo.style.display = 'none';
                    updateHeaderForGuest();
                    return;
                }

                try {
                    const user = JSON.parse(savedUser);
                    
                    const { data, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    
                    if (error || !data) {
                        localStorage.removeItem('currentUser');
                        modal.style.display = 'block';
                        userWalletInfo.style.display = 'none';
                        updateHeaderForGuest();
                    } else {
                        localStorage.setItem('currentUser', JSON.stringify(data));
                        
                        userWalletInfo.style.display = 'block';
                        walletUserName.textContent = data.first_name;
                        walletUserBalance.textContent = (data.scam_balance || 0) + ' $SCAM';
                        
                        const balanceSpan = userBalanceElement.querySelector('.scam-with-logo');
                        if (balanceSpan) {
                            balanceSpan.innerHTML = `${data.scam_balance || 0} <img src="лого.png" alt="лого">`;
                        }
                        
                        modal.style.display = 'none';
                        updateHeaderForUser(data);
                    }
                } catch (error) {
                    console.error('Помилка:', error);
                    localStorage.removeItem('currentUser');
                    modal.style.display = 'block';
                    userWalletInfo.style.display = 'none';
                    updateHeaderForGuest();
                }
            }
            
            function updateHeaderForGuest() {
                const accountBtnText = document.getElementById('accountBtnText');
                const accountDropdown = document.getElementById('accountDropdown');
                if (accountBtnText) accountBtnText.textContent = 'Кабінет';
                if (accountDropdown) accountDropdown.classList.remove('show');
            }
            
            function updateHeaderForUser(user) {
                const accountBtnText = document.getElementById('accountBtnText');
                if (accountBtnText) accountBtnText.textContent = user.first_name || 'Кабінет';
            }
            
            function openModal(e) {
                e.preventDefault();
                const savedUser = localStorage.getItem('currentUser');
                if (!savedUser) {
                    modal.style.display = 'block';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }
            
            function closeModalFunc() {
                modal.style.display = 'none';
            }
            
            if (buyBtn) buyBtn.addEventListener('click', openModal);
            if (sellBtn) sellBtn.addEventListener('click', openModal);
            if (closeBtn) closeBtn.addEventListener('click', closeModalFunc);
            
            window.addEventListener('click', function(event) {
                if (event.target == modal) {
                    closeModalFunc();
                }
            });

            const accountBtn = document.getElementById('accountBtn');
            const accountDropdown = document.getElementById('accountDropdown');
            const logoutBtn = document.getElementById('logoutBtn');
            
            if (accountBtn) {
                accountBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const savedUser = localStorage.getItem('currentUser');
                    if (!savedUser) {
                        window.location.href = 'login.html';
                    } else {
                        accountDropdown.classList.toggle('show');
                    }
                });
            }
            
            document.addEventListener('click', function() {
                if (accountDropdown) accountDropdown.classList.remove('show');
            });
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('currentUser');
                    window.location.reload();
                });
            }
            
            window.updateUserBalance = function(newBalance) {
                if (walletUserBalance) {
                    walletUserBalance.textContent = newBalance + ' $SCAM';
                }
                const balanceSpan = userBalanceElement.querySelector('.scam-with-logo');
                if (balanceSpan) {
                    balanceSpan.innerHTML = `${newBalance} <img src="лого.png" alt="лого">`;
                }
            };
        });