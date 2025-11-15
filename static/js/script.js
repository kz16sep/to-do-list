// Toast Notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
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
    setTimeout(() => toast.classList.add('show'), 100);
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
let currentTaskId = null;
let subtasksData = [];

function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const taskForm = document.getElementById('taskForm');
    currentTaskId = taskId;
    subtasksData = [];
    
    if (taskId) {
        modalTitle.textContent = 'Edit Task';
        taskForm.action = `/edit_task/${taskId}`;
        
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
                
                subtasksData = data.subtasks || [];
                renderSubtasks();
                
                const statusGroup = document.getElementById('statusGroup');
                if (statusGroup) statusGroup.style.display = 'block';
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error loading task data', 'error');
            });
    } else {
        modalTitle.textContent = 'Add New Task';
        taskForm.action = '/add_task';
        taskForm.reset();
        subtasksData = [];
        renderSubtasks();
        
        const now = new Date();
        const defaultDate = new Date(now.getTime() + (60 * 60 * 1000));
        const defaultDateTime = defaultDate.toISOString().slice(0, 16);
        document.getElementById('due_date').value = defaultDateTime;
        document.getElementById('due_date').min = now.toISOString().slice(0, 16);
        
        const statusGroup = document.getElementById('statusGroup');
        if (statusGroup) statusGroup.style.display = 'none';
    }
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function renderSubtasks() {
    const container = document.getElementById('subtasksContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (subtasksData.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0" style="font-size: 14px;">No subtasks yet. Add one above!</p>';
        return;
    }
    
    subtasksData.forEach((subtask, index) => {
        const item = document.createElement('div');
        item.className = 'subtask-item';
        item.dataset.subtaskId = subtask.id;
        const subtaskId = subtask.id.toString().startsWith('temp_') ? index : subtask.id;
        item.innerHTML = `
            <label class="subtask-checkbox">
                <input type="checkbox" ${subtask.completed ? 'checked' : ''} 
                       onchange="toggleSubtaskInModal(${subtaskId}, this.checked, ${index})">
                <span class="subtask-title ${subtask.completed ? 'completed' : ''}">${escapeHtml(subtask.title)}</span>
            </label>
            <button type="button" class="btn btn-sm btn-link text-danger p-0" 
                    onclick="removeSubtaskFromModal(${index})" title="Delete subtask">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(item);
    });
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addSubtask() {
    const input = document.getElementById('newSubtaskInput');
    if (!input) return;
    
    const title = input.value.trim();
    if (!title) {
        showToast('Please enter a subtask title', 'error');
        return;
    }
    
    if (!currentTaskId) {
        subtasksData.push({
            id: 'temp_' + Date.now(),
            title: title,
            completed: false
        });
        renderSubtasks();
        input.value = '';
    } else {
        fetch(`/add_subtask/${currentTaskId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ title: title })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                subtasksData.push(data);
                renderSubtasks();
                input.value = '';
                showToast('Subtask added', 'success');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error adding subtask', 'error');
        });
    }
}

function removeSubtaskFromModal(index) {
    const subtask = subtasksData[index];
    if (!subtask) return;
    
    if (subtask.id.toString().startsWith('temp_')) {
        subtasksData.splice(index, 1);
        renderSubtasks();
    } else {
        if (confirm('Are you sure you want to delete this subtask?')) {
            fetch(`/delete_subtask/${subtask.id}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showToast(data.error, 'error');
                } else {
                    subtasksData.splice(index, 1);
                    renderSubtasks();
                    showToast('Subtask deleted', 'success');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error deleting subtask', 'error');
            });
        }
    }
}

function toggleSubtaskInModal(subtaskId, completed, index) {
    // Nếu là index (temp subtask), dùng index
    let subtask;
    if (typeof index !== 'undefined') {
        subtask = subtasksData[index];
    } else {
        subtask = subtasksData.find(st => st.id == subtaskId || st.id.toString() == subtaskId.toString());
    }
    
    if (!subtask) return;
    
    if (subtask.id.toString().startsWith('temp_')) {
        subtask.completed = completed;
        renderSubtasks();
    } else {
        fetch(`/toggle_subtask/${subtaskId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                subtask.completed = !completed;
                renderSubtasks();
            } else {
                subtask.completed = data.completed;
                renderSubtasks();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error updating subtask', 'error');
            subtask.completed = !completed;
            renderSubtasks();
        });
    }
}

// Update task status without refresh
function updateTaskStatus(taskId, newStatus, subtasksCount) {
    const select = document.getElementById(`statusSelect${taskId}`);
    const previousStatus = select.dataset.previousStatus || select.value;
    
    if (newStatus === 'completed' && subtasksCount > 0) {
        const taskCard = select.closest('.task-card-modern');
        const subtasksSection = taskCard ? taskCard.querySelector('.subtasks-section') : null;
        
        if (subtasksSection) {
            const completedCount = subtasksSection.querySelectorAll('.subtask-checkbox input[type="checkbox"]:checked').length;
            const totalCount = subtasksSection.querySelectorAll('.subtask-checkbox input[type="checkbox"]').length;
            
            if (completedCount < totalCount) {
                if (confirm(`This task has ${totalCount - completedCount} incomplete subtask(s). All subtasks will be marked as completed. Continue?`)) {
                    performStatusUpdate(taskId, newStatus, select);
                } else {
                    select.value = previousStatus;
                }
                return;
            }
        }
    }
    
    select.dataset.previousStatus = select.value;
    performStatusUpdate(taskId, newStatus, select);
}

function performStatusUpdate(taskId, newStatus, selectElement) {
    fetch(`/update_task_status/${taskId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
            selectElement.value = selectElement.dataset.previousStatus || 'pending';
        } else {
            showToast('Task status updated', 'success');
            
            // Update UI if needed
            const taskCard = selectElement.closest('.task-card-modern');
            if (taskCard && data.subtasks_total > 0) {
                // Update subtasks if all completed
                if (newStatus === 'completed') {
                    const subtasksSection = taskCard.querySelector('.subtasks-section');
                    
                    // Hiển thị tất cả subtasks (remove hidden class)
                    const allSubtaskItems = taskCard.querySelectorAll('.subtask-item');
                    allSubtaskItems.forEach(item => {
                        item.classList.remove('subtask-hidden');
                    });
                    
                    // Cập nhật nút "Show All" thành "Show Less"
                    const showAllBtn = taskCard.querySelector(`#showAllBtn${taskId}`);
                    if (showAllBtn) {
                        showAllBtn.innerHTML = `<i class="fas fa-chevron-up me-1"></i>Show Less`;
                    }
                    
                    // Đánh dấu tất cả checkboxes là checked
                    const checkboxes = taskCard.querySelectorAll('.subtask-checkbox input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        if (!cb.checked) {
                            cb.checked = true;
                            const titleSpan = cb.closest('.subtask-checkbox').querySelector('.subtask-title');
                            if (titleSpan) titleSpan.classList.add('completed');
                        }
                    });
                    
                    // Update progress
                    if (subtasksSection) {
                        updateSubtaskProgress(subtasksSection, data.subtasks_completed, data.subtasks_total);
                    }
                }
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error updating task status', 'error');
        selectElement.value = selectElement.dataset.previousStatus || 'pending';
    });
}

// Subtask functions for task cards
function toggleSubtask(subtaskId, completed, taskId) {
    fetch(`/toggle_subtask/${subtaskId}`, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
            location.reload();
        } else {
            const subtaskItem = document.querySelector(`[data-subtask-id="${subtaskId}"]`);
            if (subtaskItem) {
                const titleSpan = subtaskItem.querySelector('.subtask-title');
                if (data.completed) {
                    titleSpan.classList.add('completed');
                } else {
                    titleSpan.classList.remove('completed');
                }
                
                const subtasksSection = subtaskItem.closest('.subtasks-section');
                if (subtasksSection) {
                    updateSubtaskProgress(subtasksSection, data.completed_count, data.total_count);
                }
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error updating subtask', 'error');
        location.reload();
    });
}

function updateSubtaskProgress(section, completedCount, totalCount) {
    const progressBar = section.querySelector('.progress-bar');
    const progressText = section.querySelector('.progress-text small');
    const badge = section.querySelector('.badge');
    
    if (progressBar && progressText && badge) {
        const percentage = totalCount > 0 ? (completedCount / totalCount * 100) : 0;
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', completedCount);
        progressBar.setAttribute('aria-valuemax', totalCount);
        progressText.textContent = Math.round(percentage) + '% Complete';
        badge.textContent = `${completedCount}/${totalCount} Completed`;
        
        if (completedCount === totalCount) {
            progressBar.style.backgroundColor = '#28a745';
        } else {
            progressBar.style.backgroundColor = 'var(--primary-color)';
        }
    }
}

function deleteSubtask(subtaskId, taskId) {
    if (!confirm('Are you sure you want to delete this subtask?')) return;
    
    fetch(`/delete_subtask/${subtaskId}`, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Subtask deleted', 'success');
            location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error deleting subtask', 'error');
    });
}

// Delete task with custom modal
let deleteTaskId = null;

function showDeleteConfirm(taskId, taskTitle) {
    deleteTaskId = taskId;
    document.getElementById('deleteTaskTitle').textContent = taskTitle;
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', function() {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            if (deleteTaskId) {
                fetch(`/delete_task/${deleteTaskId}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'}
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        showToast(data.error, 'error');
                    } else {
                        showToast(data.message || 'Task deleted successfully', 'success');
                        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
                        modal.hide();
                        setTimeout(() => location.reload(), 500);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast('Error deleting task', 'error');
                });
            }
        });
    }
});

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

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('priorityFilter').value = 'all';
    document.getElementById('sortFilter').value = 'due_date';
    window.location.href = '/';
}

// Toggle show all subtasks
function toggleShowAllSubtasks(taskId, totalCount) {
    const list = document.getElementById(`subtasksList${taskId}`);
    const btn = document.getElementById(`showAllBtn${taskId}`);
    if (!list || !btn) return;
    
    const allItems = list.querySelectorAll('.subtask-item');
    const hiddenItems = list.querySelectorAll('.subtask-item.subtask-hidden');
    const isShowingAll = hiddenItems.length === 0;
    
    if (isShowingAll) {
        // Hide all except first 2
        allItems.forEach((item, index) => {
            if (index >= 2) {
                item.classList.add('subtask-hidden');
            } else {
                item.classList.remove('subtask-hidden');
            }
        });
        btn.innerHTML = `<i class="fas fa-chevron-down me-1"></i>Show All (${totalCount})`;
    } else {
        // Show all - remove hidden class from all items
        allItems.forEach(item => {
            item.classList.remove('subtask-hidden');
        });
        btn.innerHTML = `<i class="fas fa-chevron-up me-1"></i>Show Less`;
    }
}

// Validate estimated time
function validateEstimatedTime() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const msg = document.getElementById('timeValidationMsg');
    const submitBtn = document.querySelector('#taskForm button[type="submit"]');
    
    if (hours === 0 && minutes === 0) {
        if (msg) {
            msg.textContent = 'Please enter at least 1 minute';
            msg.className = 'text-danger';
        }
        if (submitBtn) {
            submitBtn.disabled = true;
        }
        return false;
    } else {
        if (msg) {
            const totalMinutes = hours * 60 + minutes;
            const displayHours = Math.floor(totalMinutes / 60);
            const displayMinutes = totalMinutes % 60;
            if (displayHours > 0) {
                msg.textContent = `Total: ${displayHours}h ${displayMinutes}m`;
            } else {
                msg.textContent = `Total: ${displayMinutes}m`;
            }
            msg.className = 'text-success';
        }
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        return true;
    }
}

// Submit task form với subtasks và validation
function submitTaskForm(event) {
    // Validate estimated time
    if (!validateEstimatedTime()) {
        event.preventDefault();
        showToast('Please enter estimated time (at least 1 minute)', 'error');
        return false;
    }
    
    const form = event.target;
    const subtasksInput = document.getElementById('subtasksData');
    
    if (subtasksInput) {
        // Chỉ gửi subtasks nếu là add new task (không có currentTaskId)
        // Vì edit task sẽ lưu subtasks riêng qua API
        if (!currentTaskId) {
            // Lọc bỏ các subtask tạm thời và chỉ lấy title và completed
            const subtasksToSave = subtasksData
                .filter(st => st.title && st.title.trim()) // Chỉ lấy subtasks có title
                .map(st => ({
                    title: st.title.trim(),
                    completed: st.completed || false
                }));
            subtasksInput.value = JSON.stringify(subtasksToSave);
        } else {
            // Edit mode - subtasks đã được lưu riêng qua API khi add/delete
            subtasksInput.value = '[]';
        }
    }
    
    return true; // Cho phép form submit bình thường
}

// Enter key to search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') applyFilters();
        });
    }
    
    const dueDateInput = document.getElementById('due_date');
    if (dueDateInput) {
        const now = new Date();
        dueDateInput.min = now.toISOString().slice(0, 16);
    }
    
    // Validate estimated time on load
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    if (hoursInput && minutesInput) {
        hoursInput.addEventListener('input', validateEstimatedTime);
        minutesInput.addEventListener('input', validateEstimatedTime);
    }
    
    // Task card animations
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
