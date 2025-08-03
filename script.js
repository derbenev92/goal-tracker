class GoalTracker {
    constructor() {
        this.currentScore = 0;
        this.goal = 100;
        this.history = [];
        this.wins = 0;
        this.losses = 0;
        
        this.initializeElements();
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        // Основные элементы
        this.goalInput = document.getElementById('goalInput');
        this.setGoalBtn = document.getElementById('setGoalBtn');
        this.addPositiveBtn = document.getElementById('addPositiveBtn');
        this.addNegativeBtn = document.getElementById('addNegativeBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // Элементы отображения
        this.currentScoreEl = document.getElementById('currentScore');
        this.goalScoreEl = document.getElementById('goalScore');
        this.goalDisplayEl = document.getElementById('goalDisplay');
        this.currentDisplayEl = document.getElementById('currentDisplay');
        this.remainingDisplayEl = document.getElementById('remainingDisplay');
        this.winsDisplayEl = document.getElementById('winsDisplay');
        this.lossesDisplayEl = document.getElementById('lossesDisplay');
        this.progressPercentageEl = document.getElementById('progressPercentage');
        this.historyListEl = document.getElementById('historyList');
        
        // Прогресс бар
        this.progressBarFill = document.getElementById('progressBarFill');
    }

    setupEventListeners() {
        this.setGoalBtn.addEventListener('click', () => this.setGoal());
        this.addPositiveBtn.addEventListener('click', () => this.addScore(25));
        this.addNegativeBtn.addEventListener('click', () => this.addScore(-25));
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Enter в поле ввода цели
        this.goalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setGoal();
            }
        });
    }

    setGoal() {
        const newGoal = parseInt(this.goalInput.value);
        if (newGoal > 0) {
            this.goal = newGoal;
            this.updateDisplay();
            this.saveToStorage();
            this.showNotification('Цель обновлена!', 'success');
        } else {
            this.showNotification('Цель должна быть больше 0!', 'error');
        }
    }

    addScore(points) {
        const oldScore = this.currentScore;
        this.currentScore += points;
        
        // Обновляем счетчики побед/поражений
        if (points > 0) {
            this.wins++;
        } else {
            this.losses++;
        }
        
        // Добавляем в историю
        const historyItem = {
            points: points,
            timestamp: new Date(),
            oldScore: oldScore,
            newScore: this.currentScore
        };
        
        this.history.unshift(historyItem);
        
        this.updateDisplay();
        this.updateHistory();
        this.saveToStorage();
        
        // Анимация кнопки
        const button = points > 0 ? this.addPositiveBtn : this.addNegativeBtn;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
        
        // Уведомление
        const message = points > 0 ? `+${points} pts добавлено!` : `${points} pts вычтено!`;
        this.showNotification(message, points > 0 ? 'success' : 'warning');
    }

    updateDisplay() {
        // Обновляем текстовые элементы
        this.currentScoreEl.textContent = this.currentScore;
        this.goalScoreEl.textContent = this.goal;
        this.goalDisplayEl.textContent = `${this.goal} pts`;
        this.currentDisplayEl.textContent = `${this.currentScore} pts`;
        
        const remaining = Math.max(0, this.goal - this.currentScore);
        this.remainingDisplayEl.textContent = `${remaining} pts`;
        
        // Обновляем счетчики побед/поражений
        this.winsDisplayEl.textContent = this.wins;
        this.lossesDisplayEl.textContent = this.losses;
        
        // Обновляем прогресс бар
        this.updateProgressBar();
    }

    updateProgressBar() {
        const progress = Math.min(this.currentScore / this.goal, 1);
        const percentage = progress * 100;
        
        // Обновляем ширину прогресс-бара
        this.progressBarFill.style.width = `${percentage}%`;
        
        // Обновляем процент в тексте
        this.progressPercentageEl.textContent = `${Math.round(percentage)}%`;
        
        // Обновляем цвет в зависимости от прогресса
        this.progressBarFill.className = 'progress-bar-fill';
        
        if (progress >= 1) {
            this.progressBarFill.classList.add('progress-complete');
        } else if (progress >= 0.7) {
            this.progressBarFill.classList.add('progress-high');
        } else if (progress >= 0.4) {
            this.progressBarFill.classList.add('progress-medium');
        } else {
            this.progressBarFill.classList.add('progress-low');
        }
    }

    updateHistory() {
        if (this.history.length === 0) {
            this.historyListEl.innerHTML = '<div class="history-empty">Нет записей. Добавьте первый результат!</div>';
            return;
        }

        this.historyListEl.innerHTML = this.history
            .map(item => this.createHistoryItem(item))
            .join('');
    }

    createHistoryItem(item) {
        const isPositive = item.points > 0;
        const sign = isPositive ? '+' : '';
        const time = this.formatTime(item.timestamp);
        
        return `
            <div class="history-item">
                <span class="history-score ${isPositive ? 'positive' : 'negative'}">
                    ${sign}${item.points} pts
                </span>
                <span class="history-time">${time}</span>
            </div>
        `;
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Меньше минуты
            return 'Только что';
        } else if (diff < 3600000) { // Меньше часа
            const minutes = Math.floor(diff / 60000);
            return `${minutes} мин назад`;
        } else if (diff < 86400000) { // Меньше дня
            const hours = Math.floor(diff / 3600000);
            return `${hours} ч назад`;
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    clearHistory() {
        if (confirm('Вы уверены, что хотите очистить всё? Это удалит историю, сбросит текущий результат и счетчики побед/поражений.')) {
            this.history = [];
            this.currentScore = 0;
            this.wins = 0;
            this.losses = 0;
            this.updateHistory();
            this.updateDisplay();
            this.saveToStorage();
            this.showNotification('Всё очищено! Результат и счетчики сброшены.', 'info');
        }
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        // Цвета в зависимости от типа
        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            warning: '#ed8936',
            info: '#4299e1'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    saveToStorage() {
        const data = {
            currentScore: this.currentScore,
            goal: this.goal,
            history: this.history,
            wins: this.wins,
            losses: this.losses
        };
        localStorage.setItem('goalTracker', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('goalTracker');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentScore = data.currentScore || 0;
                this.goal = data.goal || 100;
                this.history = data.history || [];
                this.wins = data.wins || 0;
                this.losses = data.losses || 0;
                
                // Обновляем поле ввода
                this.goalInput.value = this.goal;
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        }
    }
}

// Добавляем CSS для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new GoalTracker();
}); 