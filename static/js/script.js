// Toast Notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        // Create toast container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Initialize toast from flash messages
document.addEventListener('DOMContentLoaded', function() {
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(msg => {
        const message = msg.textContent.trim();
        const type = msg.classList.contains('alert-danger') ? 'error' : 'success';
        showToast(message, type);
        msg.remove();
    });
});

// Task Modal Functions
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const taskForm = document.getElementById('taskForm');
    
    if (taskId) {
        // Edit mode
        modalTitle.textContent = 'Edit Task';
        taskForm.action = `/edit_task/${taskId}`;
        
        // Fetch task data
        fetch(`/edit_task/${taskId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('title').value = data.title;
                document.getElementById('description').value = data.description || '';
                document.getElementById('due_date').value = data.due_date;
                document.getElementById('hours').value = data.estimated_hours;
                document.getElementById('minutes').value = data.estimated_minutes;
                document.getElementById('priority').value = data.priority;
                document.getElementById('status').value = data.status;
                
                // Show status field for edit mode
                const statusGroup = document.getElementById('statusGroup');
                if (statusGroup) statusGroup.style.display = 'block';
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error loading task data', 'error');
            });
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Task';
        taskForm.action = '/add_task';
        taskForm.reset();
        
        // Set default values
        const now = new Date();
        const defaultDate = new Date(now.getTime() + (60 * 60 * 1000));
        const defaultDateTime = defaultDate.toISOString().slice(0, 16);
        document.getElementById('due_date').value = defaultDateTime;
        document.getElementById('due_date').min = now.toISOString().slice(0, 16);
        
        // Hide status field for add mode
        const statusGroup = document.getElementById('statusGroup');
        if (statusGroup) statusGroup.style.display = 'none';
    }
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    const bsModal = bootstrap.Modal.getInstance(modal);
    if (bsModal) bsModal.hide();
}

// Search and Filter
function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const status = document.getElementById('statusFilter').value;
    const priority = document.getElementById('priorityFilter').value;
    const sort = document.getElementById('sortFilter').value;
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status !== 'all') params.append('status', status);
    if (priority !== 'all') params.append('priority', priority);
    if (sort !== 'due_date') params.append('sort', sort);
    
    window.location.href = `/?${params.toString()}`;
}

// Clear filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('priorityFilter').value = 'all';
    document.getElementById('sortFilter').value = 'due_date';
    window.location.href = '/';
}

// Enter key to search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    // Set minimum date for due_date input
    const dueDateInput = document.getElementById('due_date');
    if (dueDateInput) {
        const now = new Date();
        dueDateInput.min = now.toISOString().slice(0, 16);
    }
});

// Delete task with confirmation
function deleteTask(taskId, taskTitle) {
    if (confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/delete_task/${taskId}`;
        // Add CSRF token if needed (Flask-WTF)
        document.body.appendChild(form);
        form.submit();
    }
}

// Task card animations
document.addEventListener('DOMContentLoaded', function() {
    const taskCards = document.querySelectorAll('.task-card-modern');
    taskCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
});

