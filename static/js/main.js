/**
 * Основной JavaScript файл для сайта
 * Обработка интерактивных элементов и анимаций
 */

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Плавное появление элементов при прокрутке
    initScrollAnimations();
    
    // Обработка форм
    initFormHandlers();
    
    // Инициализация tooltips Bootstrap
    initTooltips();

    // Инициализация виджета чат-бота
    initChatWidget();
});

/**
 * Инициализация анимаций при прокрутке
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Наблюдение за карточками кейсов
    document.querySelectorAll('.case-card').forEach(card => {
        observer.observe(card);
    });
}

/**
 * Обработка форм
 */
function initFormHandlers() {
    // Валидация формы обратной связи
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Дополнительная валидация на клиенте
            const phone = document.querySelector('[name="phone"]');
            if (phone && phone.value) {
                // Извлекаем только цифры из номера
                const digitsOnly = phone.value.replace(/\D/g, '');
                // Проверяем, что есть минимум 10 цифр (российский номер: 7 + 10 цифр = минимум 10)
                // Или если начинается с 7 или 8, то должно быть 11 цифр
                const isValid = digitsOnly.length >= 10 && digitsOnly.length <= 11;
                
                if (!isValid) {
                    e.preventDefault();
                    phone.classList.add('is-invalid');
                    const feedback = phone.nextElementSibling;
                    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
                        const div = document.createElement('div');
                        div.className = 'invalid-feedback';
                        div.textContent = 'Введите корректный номер телефона (минимум 10 цифр)';
                        phone.parentNode.appendChild(div);
                    }
                    return false;
                }
            }
        });
        
        // Автоматическое форматирование телефона
        const phoneInput = contactForm.querySelector('[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                // Убираем все нецифровые символы
                let value = e.target.value.replace(/\D/g, '');
                
                // Ограничиваем длину до 11 цифр
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                
                if (value.length > 0) {
                    // Если номер начинается с 8, заменяем на 7
                    if (value[0] === '8') {
                        value = '7' + value.substring(1);
                    }
                    // Если номер не начинается с 7 и длина меньше 11, добавляем 7
                    if (value[0] !== '7' && value.length < 11) {
                        value = '7' + value;
                    }
                    
                    // Форматируем номер: +7 (999) 123-45-67
                    let formatted = '+7';
                    if (value.length > 1) {
                        formatted += ' (' + value.substring(1, 4);
                    }
                    if (value.length >= 4) {
                        formatted += ') ' + value.substring(4, 7);
                    }
                    if (value.length >= 7) {
                        formatted += '-' + value.substring(7, 9);
                    }
                    if (value.length >= 9) {
                        formatted += '-' + value.substring(9, 11);
                    }
                    e.target.value = formatted;
                    
                    // Убираем класс ошибки при вводе
                    this.classList.remove('is-invalid');
                    const feedback = this.nextElementSibling;
                    if (feedback && feedback.classList.contains('invalid-feedback')) {
                        feedback.remove();
                    }
                }
            });
        }
    }
}

/**
 * Инициализация tooltips Bootstrap
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Плавная прокрутка к элементу
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Показать уведомление
 */
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

/**
 * Обработка ошибок AJAX запросов
 */
function handleAjaxError(xhr, status, error) {
    console.error('AJAX Error:', status, error);
    showNotification('Произошла ошибка при выполнении запроса', 'danger');
}

// Экспорт функций для использования в других скриптах
window.siteUtils = {
    scrollToElement,
    showNotification,
    handleAjaxError
};

/**
 * Инициализация виджета чат-бота
 */
function initChatWidget() {
    const launcher = document.getElementById('chat-launcher');
    const widget = document.getElementById('chat-widget');
    const closeBtn = widget ? widget.querySelector('.chat-close-btn') : null;
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('chat-typing');

    if (!launcher || !widget || !form || !input || !messagesContainer) {
        return;
    }

    function openWidget() {
        widget.classList.remove('closed');
        widget.classList.add('open');
        widget.setAttribute('aria-hidden', 'false');
        input.focus();
    }

    function closeWidget() {
        widget.classList.remove('open');
        widget.classList.add('closed');
        widget.setAttribute('aria-hidden', 'true');
    }

    launcher.addEventListener('click', function() {
        if (widget.classList.contains('open')) {
            closeWidget();
        } else {
            openWidget();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeWidget);
    }

    function appendMessage(text, from = 'bot') {
        const msg = document.createElement('div');
        msg.className = 'chat-message ' + (from === 'user' ? 'user' : 'bot');

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.textContent = text;

        msg.appendChild(bubble);
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage(message) {
        if (!message) return;

        appendMessage(message, 'user');
        input.value = '';

        if (typingIndicator) {
            typingIndicator.classList.remove('d-none');
        }

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    top_k: 3
                })
            });

            if (!response.ok) {
                throw new Error('Network error');
            }

            const data = await response.json();
            if (data.error) {
                appendMessage(data.error, 'bot');
            } else if (data.answer) {
                appendMessage(data.answer, 'bot');
            } else {
                appendMessage('Не удалось получить ответ от ассистента.', 'bot');
            }
        } catch (err) {
            console.error(err);
            appendMessage('Произошла ошибка при обращении к чат-боту.', 'bot');
        } finally {
            if (typingIndicator) {
                typingIndicator.classList.add('d-none');
            }
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        sendMessage(message);
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = input.value.trim();
            if (!message) return;
            sendMessage(message);
        }
    });
}

