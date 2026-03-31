// lang.js - мультиязычная поддержка
const translations = {
    uk: {
        // Навигация
        nav_home: "Головна",
        nav_crypto: "₿ Крипта",
        nav_about: "Про нас",
        nav_contacts: "Контакти",
        nav_account: "Кабінет",
        
        // Общие
        logout: "🚪 Вийти",
        dashboard: "📊 Панель керування",
        footer_left: "Misha Corporation © 2026",
        footer_center: "Довіряти нам — це ваше майбутнє, якщо ви мрієте про повну ніщету.",
        footer_right: "2026 рік — рік ваших мрій, які гарантовано не збудуться.",
        
        // Главная страница
        hero_title: "Misha Corp: Ми навчимо ваші гроші зникати швидше, ніж ви скажете «Де моя зарплата?».",
        hero_subtitle: "Глобальна екосистема для тих, хто втомився від стабільності та хоче справжнього фінансового екстриму.",
        hero_btn: "Стати партнером",
        hero_btn_hover: "Пізно відступати",
        tools_title: "Наші Фінансові Інструменти",
        tool1_title: "Депозит «Чорна Діра»",
        tool1_desc: "Ви вкладаєте кошти, і вони переходять в інший вимір. Ми гарантуємо, що ви їх більше не побачите в цьому всесвіті.",
        tool2_title: "Кредит «Дружній Шантаж»",
        tool2_desc: "Ви берете 100 грн, а віддаєте 1000 грн і пароль від свого Wi-Fi. Жодних прихованих комісій, тільки відкрите грабіжництво.",
        tool3_title: "Криптовалюта $SCAM",
        tool3_desc: "Валюта, яка забезпечена виключно чесним словом Михайла. Курс залежить від того, чи виспався сьогодні CEO.",
        reviews_title: "Відгуки",
        review1_author: "Степан «Щасливчик»",
        review1_text: "Раніше я думав, що 0 на балансі — це погано. Але в Misha Corp мені пояснили, що це просто початок нової подорожі. Тепер я живу в коробці від холодильника, і у мене чудовий краєвид на офіс компанії.",
        review2_author: "Артем",
        review2_text: "Я так сильно тиснув на кнопку 'Отримати бонус', що зламав палець. Зараз я в лікарні, пишу цей відгук лівою рукою. Лікарі кажуть, що палець зростеться, а от мої інвестиції — навряд чи. Ставлю 10 зламаних фаланг із 10.",
        review3_author: "Рік Естлі",
        review3_text: "Я ніколи не бачив такої відданості справі. Ця компанія ніколи не зрадить своїм принципам забирати все до останньої копійки.",
        rickroll_btn: "Подивитись відео-подяку Ріка",
        
        // Страница "О нас"
        about_title: "Про нас",
        mission_title: "Наша Місія",
        mission_text: "Ми віримо, що багатство — це стан душі, а не цифри в банку. Наша місія — звільнити вас від тягаря матеріальних цінностей.",
        history_title: "Історія Корпорації",
        history_2024: "Михайло знайшов 20 гривень і не купив на них булочку, а вклав у створення першого сервера з картонної коробки.",
        history_2025: "Компанія вийшла на ринок сусіднього району. Кількість клієнтів зросла до двох (Михайло та його уявний фінансовий консультант).",
        history_2026: "Ми стали настільки великими, що нас почали шукати не тільки інвестори, а й органи контролю.",
        team_title: "Команда Довіри",
        team_misha: "Михайло",
        team_misha_role: "Генеральний Директор всього",
        team_misha_desc: "Людина, яка вміє дивитися в майбутнє і бачити там тільки велике «Нічого».",
        team_murka: "Мурка",
        team_murka_role: "Бухгалтерка",
        team_murka_desc: "Відповідає за те, щоб усі документи були старанно подряпані та нечитабельні.",
        special_section: "Спеціальний розділ",
        debts_btn: "НАШІ БОРГИ",
        
        // Страница 404
        error_code: "404",
        error_message: "УВАГА! Переповнення бази даних боргами.",
        error_description: "Система виявила 450,000,000 несплачених кредитів. Через це сторінка важить більше, ніж весь інтернет. Процесор вашого пристрою починає плакати, будь ласка, вимкніть комп'ютер.",
        loading_text: "Завантаження боргів...",
        back_home: "На головну",
        
        // Страница контактов
        contacts_title: "Контакти",
        coordinates_title: "Наші Координати",
        address_label: "Адреса",
        address_value: "Офіс №0, провулок Офшорний, будівля у формі бублика (символізує ваші статки)",
        schedule_label: "Графік",
        schedule_value: "Працюємо, коли Михайлу нудно, зазвичай з 03:45 до 03:50 ночі",
        form_title: "Форма «Шанс на Мільйон»",
        form_name: "Ім'я",
        form_amount: "Сума інвестиції (в грн)",
        form_reason: "Причина, чому ви ще не віддали нам гроші",
        form_submit: "Надіслати",
        call_title: "Вашу заявку прийнято до розгляду (ні). Спробуйте зателефонувати нашому секретарю прямо зараз!",
        phone_disclaimer: "Ви нам дозвонитесь, якщо пощастить! Шанс вгадати номер: 1 до 999 трильйонів",
        guess_btn: "Я вгадав номер!",
        
        // Страница крипто
        crypto_title: "$SCAM",
        crypto_subtitle: "Валюта Scam Coin",
        stat_price: "Поточний курс",
        stat_cap: "Ринкова капіталізація",
        stat_volume: "Об'єм торгів (24 год)",
        stat_supply: "Максимальна пропозиція",
        chart_title: "Графік «Надія vs Реальність»",
        wallet_title: "Ваш криптогаманець",
        buy_title: "Купити $SCAM",
        buy_warning: "*Гроші не повертаються навіть уві сні",
        sell_title: "Продати $SCAM",
        sell_warning: "*Тільки якщо Михайло в гарному настрої",
        buy_btn: "Купити",
        sell_btn: "Продати",
        joke_btn: "Що каже Михайло про курс?",
        leaderboard_title: "ТОП холдерів $SCAM",
        
        // Модальное окно
        auth_modal_title: "Доступ до гаманця",
        auth_modal_text: "Для покупки, продажу та перегляду балансу $SCAM необхідно увійти в особистий кабінет",
        auth_modal_login: "Увійти",
        auth_modal_register: "Реєстрація"
    },
    
    en: {
        // Navigation
        nav_home: "Home",
        nav_crypto: "₿ Crypto",
        nav_about: "About Us",
        nav_contacts: "Contacts",
        nav_account: "Account",
        
        // Common
        logout: "🚪 Logout",
        dashboard: "📊 Dashboard",
        footer_left: "Misha Corporation © 2026",
        footer_center: "Trusting us is your future if you dream of complete poverty.",
        footer_right: "2026 is the year of your dreams that are guaranteed not to come true.",
        
        // Home page
        hero_title: "Misha Corp: We'll teach your money to disappear faster than you can say 'Where's my salary?'",
        hero_subtitle: "A global ecosystem for those tired of stability and seeking real financial extreme.",
        hero_btn: "Become a Partner",
        hero_btn_hover: "Too late to retreat",
        tools_title: "Our Financial Tools",
        tool1_title: "Black Hole Deposit",
        tool1_desc: "You invest funds, and they move to another dimension. We guarantee you won't see them again in this universe.",
        tool2_title: "Friendly Blackmail Loan",
        tool2_desc: "You borrow 100 UAH, and repay 1000 UAH plus your Wi-Fi password. No hidden fees, just open robbery.",
        tool3_title: "$SCAM Cryptocurrency",
        tool3_desc: "A currency backed solely by Misha's honest word. The rate depends on whether the CEO slept well today.",
        reviews_title: "Reviews",
        review1_author: "Stepan 'Lucky Guy'",
        review1_text: "I used to think having 0 balance was bad. But at Misha Corp, they explained it's just the beginning of a new journey. Now I live in a refrigerator box with a great view of the company office.",
        review2_author: "Artem",
        review2_text: "I pressed the 'Get Bonus' button so hard I broke my finger. Now I'm in the hospital writing this review with my left hand. Doctors say my finger will heal, but my investments probably won't. I rate it 10 broken phalanges out of 10.",
        review3_author: "Rick Astley",
        review3_text: "I've never seen such dedication to the cause. This company will never betray its principles of taking every last penny.",
        rickroll_btn: "Watch Rick's Thank You Video",
        
        // About page
        about_title: "About Us",
        mission_title: "Our Mission",
        mission_text: "We believe wealth is a state of mind, not numbers in a bank. Our mission is to free you from the burden of material values.",
        history_title: "Company History",
        history_2024: "Misha found 20 hryvnias and didn't buy a bun with them, but invested in creating the first server from a cardboard box.",
        history_2025: "The company entered the neighboring district market. The number of clients grew to two (Misha and his imaginary financial consultant).",
        history_2026: "We've become so big that not only investors but also regulatory authorities are looking for us.",
        team_title: "Trust Team",
        team_misha: "Misha",
        team_misha_role: "CEO of Everything",
        team_misha_desc: "A person who can look into the future and see only the great 'Nothing' there.",
        team_murka: "Murka",
        team_murka_role: "Accountant",
        team_murka_desc: "Responsible for ensuring all documents are diligently scratched and unreadable.",
        special_section: "Special Section",
        debts_btn: "OUR DEBTS",
        
        // 404 page
        error_code: "404",
        error_message: "WARNING! Database overflow with debts.",
        error_description: "The system detected 450,000,000 unpaid loans. Because of this, the page weighs more than the entire internet. Your device's processor starts crying, please turn off your computer.",
        loading_text: "Loading debts...",
        back_home: "Back to Home",
        
        // Contacts page
        contacts_title: "Contacts",
        coordinates_title: "Our Coordinates",
        address_label: "Address",
        address_value: "Office #0, Offshore Lane, Donut-shaped building (symbolizes your assets)",
        schedule_label: "Hours",
        schedule_value: "We work when Misha is bored, usually from 03:45 to 03:50 AM",
        form_title: "Million Chance Form",
        form_name: "Name",
        form_amount: "Investment amount (in UAH)",
        form_reason: "Why you haven't given us your money yet",
        form_submit: "Submit",
        call_title: "Your application has been accepted for review (not really). Try calling our secretary right now!",
        phone_disclaimer: "You'll get through if you're lucky! Chance to guess the number: 1 in 999 trillion",
        guess_btn: "I guessed the number!",
        
        // Crypto page
        crypto_title: "$SCAM",
        crypto_subtitle: "Scam Coin Currency",
        stat_price: "Current Price",
        stat_cap: "Market Cap",
        stat_volume: "Volume (24h)",
        stat_supply: "Max Supply",
        chart_title: "Hope vs Reality Chart",
        wallet_title: "Your Crypto Wallet",
        buy_title: "Buy $SCAM",
        buy_warning: "*Money is not returned even in dreams",
        sell_title: "Sell $SCAM",
        sell_warning: "*Only if Misha is in a good mood",
        buy_btn: "Buy",
        sell_btn: "Sell",
        joke_btn: "What does Misha say about the rate?",
        leaderboard_title: "TOP $SCAM Holders",
        
        // Auth modal
        auth_modal_title: "Wallet Access",
        auth_modal_text: "To buy, sell, and view your $SCAM balance, you need to log in to your personal account",
        auth_modal_login: "Login",
        auth_modal_register: "Register"
    }
};

let currentLang = 'uk';

// Функция для загрузки сохраненного языка
function loadLanguage() {
    const savedLang = localStorage.getItem('language');
    if (savedLang && (savedLang === 'uk' || savedLang === 'en')) {
        currentLang = savedLang;
    } else {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('en')) {
            currentLang = 'en';
        } else {
            currentLang = 'uk';
        }
    }
    return currentLang;
}

// Функция для переключения языка
function setLanguage(lang) {
    if (lang !== 'uk' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

// Функция для получения перевода
function t(key) {
    return translations[currentLang][key] || translations['uk'][key] || key;
}

// Функция для обновления всех текстов на странице
function updatePageLanguage() {
    // Обновляем все элементы с атрибутом data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.getAttribute('data-i18n-placeholder')) {
                    el.placeholder = translation;
                } else {
                    el.value = translation;
                }
            } else {
                el.innerHTML = translation;
            }
        }
    });
    
    // Обновляем плейсхолдеры отдельно
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translation = t(key);
        if (translation) {
            el.placeholder = translation;
        }
    });
    
    // Обновляем кнопку переключения языка
    const langSwitcher = document.getElementById('langSwitcher');
    if (langSwitcher) {
        langSwitcher.textContent = currentLang === 'uk' ? 'EN' : 'UA';
        langSwitcher.setAttribute('title', currentLang === 'uk' ? 'Switch to English' : 'Перейти на українську');
    }
    
    // Обновляем HTML lang атрибут
    document.documentElement.lang = currentLang === 'uk' ? 'uk' : 'en';
}

// Добавляем переключатель языка в хедер
function addLanguageSwitcher() {
    const headerContainer = document.querySelector('.header-container');
    if (!headerContainer) return;
    
    // Проверяем, есть ли уже переключатель
    if (document.getElementById('langSwitcher')) return;
    
    const langSwitcher = document.createElement('button');
    langSwitcher.id = 'langSwitcher';
    langSwitcher.className = 'lang-switcher';
    langSwitcher.textContent = currentLang === 'uk' ? 'EN' : 'UA';
    langSwitcher.setAttribute('title', currentLang === 'uk' ? 'Switch to English' : 'Перейти на українську');
    
    langSwitcher.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newLang = currentLang === 'uk' ? 'en' : 'uk';
        setLanguage(newLang);
    });
    
    headerContainer.appendChild(langSwitcher);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadLanguage();
    addLanguageSwitcher();
    updatePageLanguage();
});