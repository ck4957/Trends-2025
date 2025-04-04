// FinanceHub - Personal Finance & Investing Website Scripts

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // Budget calculator functionality
    const budgetForm = document.getElementById('budget-calculator');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const income = parseFloat(document.getElementById('income').value);
            const expenses = parseFloat(document.getElementById('expenses').value);
            const savings = parseFloat(document.getElementById('savings').value);
            
            if (isNaN(income) || isNaN(expenses) || isNaN(savings)) {
                alert('Please enter valid numbers for all fields');
                return;
            }
            
            const remaining = income - expenses - savings;
            const savingsPercent = (savings / income * 100).toFixed(1);
            
            const resultElement = document.getElementById('budget-results');
            resultElement.innerHTML = `
                <h3>Budget Analysis</h3>
                <p>Total Income: $${income.toFixed(2)}</p>
                <p>Total Expenses: $${expenses.toFixed(2)}</p>
                <p>Total Savings: $${savings.toFixed(2)} (${savingsPercent}% of income)</p>
                <p>Remaining: $${remaining.toFixed(2)}</p>
                <div class="budget-advice">
                    ${getBudgetAdvice(savingsPercent, remaining)}
                </div>
            `;
            resultElement.style.display = 'block';
        });
    }
    
    // Investment calculator
    const investmentForm = document.getElementById('investment-calculator');
    if (investmentForm) {
        investmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const principal = parseFloat(document.getElementById('principal').value);
            const annualContribution = parseFloat(document.getElementById('annual-contribution').value);
            const years = parseInt(document.getElementById('years').value);
            const rate = parseFloat(document.getElementById('rate').value) / 100;
            
            if (isNaN(principal) || isNaN(annualContribution) || isNaN(years) || isNaN(rate)) {
                alert('Please enter valid numbers for all fields');
                return;
            }
            
            let futureValue = principal;
            let totalContributions = 0;
            
            for (let i = 0; i < years; i++) {
                futureValue = futureValue * (1 + rate) + annualContribution;
                totalContributions += annualContribution;
            }
            
            const interestEarned = futureValue - principal - totalContributions;
            
            const resultElement = document.getElementById('investment-results');
            resultElement.innerHTML = `
                <h3>Investment Projection</h3>
                <p>Initial Investment: $${principal.toFixed(2)}</p>
                <p>Total Contributions: $${totalContributions.toFixed(2)}</p>
                <p>Interest Earned: $${interestEarned.toFixed(2)}</p>
                <p><strong>Future Value: $${futureValue.toFixed(2)}</strong></p>
            `;
            resultElement.style.display = 'block';
        });
    }
});

// Helper function for budget advice
function getBudgetAdvice(savingsPercent, remaining) {
    let advice = '';
    
    if (savingsPercent < 10) {
        advice += '<p>Consider increasing your savings to at least 10% of your income.</p>';
    } else if (savingsPercent >= 20) {
        advice += '<p>Great job! You\'re saving a significant portion of your income.</p>';
    } else {
        advice += '<p>You\'re on the right track with your savings. Consider increasing if possible.</p>';
    }
    
    if (remaining < 0) {
        advice += '<p class="warning">Warning: You\'re spending more than you earn. Review your expenses.</p>';
    } else if (remaining > 0 && remaining <= 100) {
        advice += '<p>You have little remaining after expenses and savings. Consider reviewing your budget.</p>';
    } else if (remaining > 100) {
        advice += '<p>You have extra money that could be allocated to additional savings or investments.</p>';
    }
    
    return advice;
}