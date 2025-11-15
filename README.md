# 📋 Task Manager - Ứng Dụng Quản Lý Công Việc

<div align="center">

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.2-green.svg)
![License](https://img.shields.io/badge/License-Educational-yellow.svg)

**Một ứng dụng quản lý công việc hiện đại, đầy đủ tính năng được xây dựng bằng Flask**

[Giới thiệu](#-giới-thiệu-dự-an) • [Tính năng](#-tính-năng-chính) • [Cài đặt](#-cài-đặt) • [Sử dụng](#-hướng-dẫn-sử-dụng) • [Cấu trúc](#-cấu-trúc-dự-án)

</div>

---

## 📋 Thông tin cá nhân

- **👤 Họ và Tên:** Huỳnh Long Hồ
- **🎓 Mã số sinh viên:** 21008411
- **📚 Môn học:** Phát triển ứng dụng web
- **🏫 Trường:** Đại học Công nghệ Thông tin

---

## 🎯 Giới thiệu dự án

**Task Manager** là một ứng dụng web quản lý công việc toàn diện, được phát triển bằng Flask framework. Ứng dụng giúp người dùng:

- ✅ Tổ chức và quản lý công việc hiệu quả
- 📊 Theo dõi tiến độ thông qua dashboard thống kê
- ✅ Quản lý subtasks và checklist chi tiết
- 🔍 Tìm kiếm và lọc tasks nhanh chóng
- 🎨 Giao diện hiện đại, thân thiện với người dùng
- 📱 Responsive design, tối ưu cho mọi thiết bị

---

## ✨ Tính năng chính

### 🔐 Xác thực người dùng

- **Đăng ký tài khoản mới**
  - Validation username (tối thiểu 3 ký tự)
  - Validation password (tối thiểu 6 ký tự)
  - Xác nhận password
  - Hash password an toàn với Werkzeug

- **Đăng nhập/Đăng xuất**
  - Session management với Flask-Login
  - Bảo vệ routes với `@login_required`
  - Tự động redirect sau đăng nhập

- **Quản lý Profile**
  - Upload và quản lý avatar cá nhân
  - Tự động resize ảnh về 200x200px
  - Hỗ trợ các định dạng: JPG, PNG, GIF
  - Badge hiển thị số task trễ hạn trên avatar

### 📊 Dashboard thống kê

- **Statistics Cards** với icon và màu sắc trực quan:
  - 📈 **Total Tasks:** Tổng số task của người dùng
  - ⏳ **Pending:** Số task đang chờ
  - 🔄 **In Progress:** Số task đang thực hiện
  - ✅ **Completed:** Số task đã hoàn thành

- **Overdue Tracking**
  - Hiển thị số task trễ hạn
  - Badge cảnh báo trên avatar
  - Tính toán tự động dựa trên due_date

### 📝 Quản lý Task

#### Tạo Task mới
- **Thông tin cơ bản:**
  - Title (bắt buộc)
  - Description (tùy chọn, hỗ trợ textarea)
  
- **Thời gian:**
  - Due Date (bắt buộc) - Date & Time picker
  - Estimated Time (bắt buộc) - Nhập giờ và phút riêng biệt
  - Validation: Tối thiểu 1 phút
  - Hiển thị tổng thời gian tự động

- **Phân loại:**
  - Priority: Low, Medium, High
  - Status: Pending, In Progress, Completed
  - Tự động gán user_id

#### Chỉnh sửa Task
- Modal form với dữ liệu đã điền sẵn
- Cập nhật mọi thông tin của task
- Giữ nguyên subtasks và progress

#### Xóa Task
- Custom confirmation modal
- Xóa vĩnh viễn task và tất cả subtasks liên quan
- Toast notification sau khi xóa
- AJAX request, không reload trang

#### Cập nhật trạng thái
- Dropdown selector trong task card
- **Real-time update** không cần reload
- **Auto-complete subtasks:** Khi chọn "Completed":
  - Hiển thị confirmation nếu có subtasks chưa hoàn thành
  - Tự động đánh dấu tất cả subtasks completed
  - Cập nhật UI ngay lập tức

### ✅ Subtasks/Checklist

#### Quản lý Subtasks
- **Thêm subtasks:**
  - Thêm khi tạo task mới (trong modal)
  - Thêm khi chỉnh sửa task
  - Input field với nút "Add" hoặc Enter
  - Xóa subtask với icon X

- **Tick/Untick Subtasks:**
  - Checkbox cho từng subtask
  - Real-time update không reload
  - Styling tự động khi completed

#### Progress Tracking
- **Progress Bar:**
  - Hiển thị phần trăm hoàn thành
  - Animation mượt mà
  - Màu xanh lá khi 100% hoàn thành
  - Màu xanh dương khi chưa hoàn thành

- **Badge hiển thị:**
  - Format: "X/Y Completed"
  - Cập nhật real-time khi tick/untick

- **Show All/Less:**
  - Mặc định hiển thị 2 subtasks đầu tiên
  - Nút "Show All (X)" khi có > 2 subtasks
  - Toggle để hiển thị/ẩn tất cả
  - Icon chevron thay đổi theo trạng thái

#### Auto-complete Feature
- Khi task status = "Completed":
  - Tự động hiển thị tất cả subtasks
  - Tự động tick tất cả checkboxes
  - Cập nhật progress bar lên 100%
  - Lưu vào database ngay lập tức

### 🔍 Tìm kiếm và Lọc

#### Tìm kiếm
- **Search Box:**
  - Tìm kiếm theo title và description
  - Real-time filtering
  - Case-insensitive search
  - Highlight kết quả

#### Bộ lọc nâng cao
- **Status Filter:**
  - All, Pending, In Progress, Completed
  
- **Priority Filter:**
  - All, High, Medium, Low

- **Sắp xếp:**
  - Due Date (mặc định)
  - Priority
  - Created Date
  - Title (A-Z)

- **Controls:**
  - Nút "Apply" để áp dụng filters
  - Nút "Clear" để reset tất cả
  - URL parameters để share filtered view

### 🎨 Giao diện hiện đại

#### Design Elements
- **Bootstrap 5** framework
- **Font Awesome** icons
- **Custom CSS** với animations
- **Color-coded** status và priority badges
- **Card-based** layout cho tasks

#### User Experience
- **Toast Notifications:**
  - Thay thế flash messages
  - Animation slide-in/slide-out
  - Auto-dismiss sau 3 giây
  - Success, Error, Info types

- **Modal Dialogs:**
  - Add/Edit Task modal
  - Delete confirmation modal
  - Smooth transitions

- **Responsive Design:**
  - Mobile-first approach
  - Breakpoints cho tablet và desktop
  - Touch-friendly buttons
  - Adaptive layout

#### Visual Feedback
- Hover effects trên buttons và cards
- Loading states
- Disabled states cho invalid forms
- Progress indicators

---

## 🖼️ Giao diện ứng dụng

### 📊 Dashboard và Thống kê

![Dashboard](screenshots/dashboard.png)
*Dashboard với các statistics cards hiển thị tổng số task, pending, in progress, completed và overdue tasks*

**Tính năng hiển thị:**
- 4 statistics cards với icon và màu sắc riêng biệt
- Badge hiển thị số task trễ hạn trên avatar
- Search bar và filter controls ở đầu trang
- Responsive layout cho mọi kích thước màn hình

---

### 📝 Task Cards

![Task Cards](screenshots/task-cards.png)
*Task cards với design hiện đại, hiển thị đầy đủ thông tin và subtasks*

**Thông tin hiển thị:**
- **Header:** Title, status badges (Overdue, Status, Priority)
- **Description:** Mô tả task (nếu có)
- **Subtasks Section:**
  - Progress bar với phần trăm hoàn thành
  - Badge "X/Y Completed"
  - Danh sách subtasks với checkboxes
  - Nút "Show All" khi có > 2 subtasks
- **Footer:** Created date, Due date, Estimated time, Status dropdown
- **Action buttons:** Edit (xanh) và Delete (đỏ)

**Màu sắc theo status:**
- 🔴 **Overdue:** Border đỏ bên trái
- ⏳ **Pending:** Border xám
- 🔄 **In Progress:** Border xanh dương
- ✅ **Completed:** Border xanh lá

---

### ➕ Modal Thêm/Sửa Task

![Add Task Modal](screenshots/add-task-modal.png)
*Modal form để thêm hoặc chỉnh sửa task với đầy đủ các trường*

**Các trường trong form:**
- **Title:** Input text (bắt buộc)
- **Description:** Textarea (tùy chọn)
- **Due Date:** Date & Time picker (bắt buộc)
- **Estimated Time:** 
  - Input HOURS và MINUTES riêng biệt
  - Hiển thị tổng thời gian tự động
  - Validation real-time
- **Priority:** Dropdown (Low, Medium, High) - bắt buộc
- **Status:** Dropdown (Pending, In Progress, Completed)
- **Subtasks/Checklist:**
  - Input field để thêm subtask
  - Danh sách subtasks với checkbox và nút xóa
  - Có thể tick/untick trực tiếp trong modal

**Buttons:**
- **Cancel:** Đóng modal, không lưu
- **Save Task:** Lưu task và đóng modal

---

### ✅ Subtasks và Progress

![Subtasks Progress](screenshots/subtasks-progress.png)
*Hiển thị chi tiết subtasks với progress bar và completion tracking*

**Tính năng:**
- **Progress Bar:**
  - Animation mượt mà khi cập nhật
  - Màu xanh dương khi chưa hoàn thành
  - Màu xanh lá khi 100% hoàn thành
  - Hiển thị phần trăm chính xác

- **Badge:** "X/Y Completed" cập nhật real-time

- **Subtask List:**
  - Checkbox để tick/untick
  - Styling gạch ngang khi completed
  - Nút X để xóa subtask
  - Mặc định hiển thị 2 subtasks đầu tiên

- **Show All/Less Button:**
  - Hiển thị khi có > 2 subtasks
  - Toggle để xem tất cả hoặc ẩn bớt
  - Icon chevron thay đổi theo trạng thái

---

### 🔍 Tìm kiếm và Lọc

![Search and Filter](screenshots/search-filter.png)
*Bộ lọc nâng cao với search, status filter, priority filter và sort options*

**Tính năng:**
- **Search Box:** Tìm kiếm real-time trong title và description
- **Filter Dropdown:**
  - Status Filter: All, Pending, In Progress, Completed
  - Priority Filter: All, High, Medium, Low
  - Sort By: Due Date, Priority, Created, Title
- **Action Buttons:**
  - Apply: Áp dụng filters
  - Clear: Reset tất cả filters

---

### 🗑️ Modal Xác nhận Xóa

![Delete Confirmation](screenshots/delete-modal.png)
*Modal xác nhận an toàn trước khi xóa task*

**Tính năng:**
- Hiển thị tên task sẽ bị xóa
- Warning message rõ ràng
- Buttons: Cancel (xám) và Delete (đỏ)
- Toast notification sau khi xóa thành công

---

### 🔔 Toast Notifications

![Toast Notifications](screenshots/toast-notifications.png)
*Hệ thống thông báo hiện đại thay thế flash messages*

**Các loại toast:**
- ✅ **Success:** Màu xanh lá (thêm/sửa/xóa thành công)
- ❌ **Error:** Màu đỏ (lỗi xảy ra)
- ℹ️ **Info:** Màu xanh dương (thông tin)

**Tính năng:**
- Animation slide-in từ góc trên bên phải
- Auto-dismiss sau 3 giây
- Có thể đóng thủ công bằng nút X
- Stack multiple toasts nếu có nhiều thông báo

---

### 👤 User Profile và Avatar

![User Profile](screenshots/user-profile.png)
*Phần quản lý profile với avatar upload*

**Tính năng:**
- Avatar hiển thị trong navbar (góc trên bên phải)
- Badge đỏ hiển thị số task trễ hạn (nếu có)
- Dropdown menu khi click vào avatar:
  - Username
  - Logout option
- Upload avatar section:
  - Choose File button
  - Upload Avatar button
  - Tự động resize về 200x200px
  - Preview avatar mới ngay lập tức

---

### 📱 Responsive Design

![Mobile View](screenshots/mobile-view.png)
*Giao diện tối ưu cho mobile và tablet*

**Tính năng responsive:**
- **Mobile (< 768px):**
  - Stack statistics cards theo cột
  - Full-width task cards
  - Touch-friendly buttons
  - Collapsible filter section

- **Tablet (768px - 1024px):**
  - 2 columns cho statistics cards
  - Task cards với layout tối ưu
  - Side-by-side filters

- **Desktop (> 1024px):**
  - 4 columns cho statistics cards
  - Full layout với sidebar (nếu có)
  - Hover effects và animations

---

### 🎨 Color Scheme và Styling

**Màu sắc chính:**
- **Primary:** Xanh dương (#007bff)
- **Success:** Xanh lá (#28a745)
- **Danger:** Đỏ (#dc3545)
- **Warning:** Vàng (#ffc107)
- **Info:** Xanh nhạt (#17a2b8)

**Status Colors:**
- **Pending:** Xám (#6c757d)
- **In Progress:** Xanh dương (#007bff)
- **Completed:** Xanh lá (#28a745)
- **Overdue:** Đỏ (#dc3545)

**Priority Colors:**
- **High:** Đỏ
- **Medium:** Vàng
- **Low:** Xanh lá

---

### ⌨️ Keyboard Shortcuts và Interactions

**Shortcuts:**
- **Enter** trong search box → Tìm kiếm
- **Enter** trong subtask input → Thêm subtask
- **Escape** → Đóng modal (sắp có)

**Interactions:**
- Hover effects trên buttons và cards
- Click animations
- Smooth transitions
- Loading states
- Disabled states cho invalid forms

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Flask 3.0.2** - Web framework
- **Flask-SQLAlchemy 3.1.1** - ORM cho database
- **Flask-Login 0.6.3** - User session management
- **Werkzeug 3.0.1** - Security utilities (password hashing)
- **Pillow 10.2.0** - Image processing (avatar resize)

### Frontend
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icon library
- **Vanilla JavaScript** - Client-side interactions
- **AJAX** - Asynchronous requests

### Database
- **SQLite** - Lightweight database
- **SQLAlchemy ORM** - Database abstraction

### Development Tools
- **Python 3.8+** - Programming language
- **pip** - Package manager

---

## 📦 Cài đặt

### Yêu cầu hệ thống

- **Python:** 3.8 trở lên
- **pip:** Python package installer
- **Git:** (tùy chọn, để clone repository)
- **OS:** Windows, Linux, hoặc macOS

### Bước 1: Chuẩn bị môi trường

#### Cài đặt Python

1. Truy cập [python.org](https://www.python.org/downloads/)
2. Tải và cài đặt Python phiên bản mới nhất
3. ✅ **Quan trọng:** Tích chọn "Add Python to PATH" khi cài đặt

#### Kiểm tra cài đặt

```bash
python --version
pip --version
```

### Bước 2: Tải mã nguồn

**Cách 1: Clone từ GitHub (khuyến nghị)**

```bash
git clone https://github.com/kz16sep/ptud-gk-de-2.git
cd ptud-gk-de-2
```

**Cách 2: Tải file ZIP**

1. Tải file ZIP từ repository
2. Giải nén vào thư mục mong muốn
3. Mở terminal/command prompt trong thư mục đã giải nén

### Bước 3: Tạo môi trường ảo

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

Sau khi activate, prompt sẽ hiển thị `(venv)` ở đầu dòng.

### Bước 4: Cài đặt dependencies

```bash
pip install -r requirements.txt
```

**Dependencies sẽ được cài đặt:**
- Flask==3.0.2
- Flask-SQLAlchemy==3.1.1
- Flask-Login==0.6.3
- Werkzeug==3.0.1
- python-dotenv==1.0.1
- Pillow==10.2.0

### Bước 5: Khởi tạo Database

Database sẽ **tự động được tạo** khi chạy ứng dụng lần đầu.

Nếu cần tạo thủ công:

```python
python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
...     print("Database created successfully!")
>>> exit()
```

### Bước 6: Chạy ứng dụng

```bash
python app.py
```

Bạn sẽ thấy thông báo:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Bước 7: Truy cập ứng dụng

Mở trình duyệt và truy cập: **http://localhost:5000**

---

## 📖 Hướng dẫn sử dụng

### 1. Đăng ký tài khoản

1. Truy cập http://localhost:5000
2. Click vào nút **"Register"** ở góc trên bên phải
3. Điền thông tin:
   - **Username:** Tối thiểu 3 ký tự (bắt buộc)
   - **Password:** Tối thiểu 6 ký tự (bắt buộc)
   - **Confirm Password:** Nhập lại password (bắt buộc)
4. Click **"Register"** để hoàn tất
5. Bạn sẽ được tự động chuyển đến trang đăng nhập

### 2. Đăng nhập

1. Nhập **Username** và **Password** đã đăng ký
2. Click **"Login"**
3. Bạn sẽ được chuyển đến Dashboard

### 3. Quản lý Task

#### ➕ Thêm Task mới

1. Click nút **"+ Add New Task"** (màu xanh, góc trên bên phải)
2. Modal sẽ hiển thị, điền thông tin:
   - **Title** (bắt buộc) - Tiêu đề task
   - **Description** (tùy chọn) - Mô tả chi tiết
   - **Due Date** (bắt buộc) - Chọn ngày và giờ hết hạn
   - **Estimated Time** (bắt buộc):
     - Nhập số giờ (HOURS)
     - Nhập số phút (MINUTES)
     - Tối thiểu 1 phút
     - Tổng thời gian hiển thị tự động
   - **Priority** (bắt buộc) - Low, Medium, High
   - **Status** - Pending, In Progress, Completed
3. **Thêm Subtasks (tùy chọn):**
   - Nhập tên subtask vào ô "Add subtask..."
   - Click **"Add"** hoặc nhấn **Enter**
   - Lặp lại để thêm nhiều subtasks
4. Click **"Save Task"** để lưu
5. Toast notification sẽ hiển thị xác nhận

#### ✏️ Chỉnh sửa Task

1. Tìm task cần chỉnh sửa trong danh sách
2. Click nút **Edit** (icon bút chì, màu xanh) trên task card
3. Modal sẽ mở với dữ liệu đã điền sẵn
4. Thay đổi thông tin cần thiết
5. **Quản lý Subtasks:**
   - Thêm subtask mới: Nhập và click "Add"
   - Tick/Untick subtask: Click checkbox
   - Xóa subtask: Click icon X bên cạnh
6. Click **"Save Task"** để cập nhật

#### 🗑️ Xóa Task

1. Click nút **Delete** (icon thùng rác, màu đỏ) trên task card
2. Modal xác nhận sẽ hiển thị với tên task
3. Click **"Delete"** để xác nhận hoặc **"Cancel"** để hủy
4. Toast notification sẽ hiển thị kết quả
5. Trang sẽ tự động reload sau 1 giây

#### 🔄 Cập nhật trạng thái

1. Tìm task cần cập nhật
2. Scroll xuống phần cuối task card
3. Chọn trạng thái từ dropdown **"Status"**
4. **Nếu chọn "Completed":**
   - Nếu có subtasks chưa hoàn thành, confirmation dialog sẽ hiển thị
   - Click **"OK"** để tự động đánh dấu tất cả subtasks completed
   - Click **"Cancel"** để giữ nguyên trạng thái cũ
5. Status sẽ cập nhật **real-time** không cần reload

### 4. Quản lý Subtasks

#### ✅ Tick/Untick Subtask

- Click vào **checkbox** bên cạnh tên subtask
- Progress bar sẽ tự động cập nhật
- Badge "X/Y Completed" sẽ thay đổi
- Phần trăm hoàn thành sẽ cập nhật
- Styling sẽ thay đổi (gạch ngang khi completed)

#### 👁️ Hiển thị tất cả Subtasks

- Mặc định chỉ hiển thị **2 subtasks đầu tiên**
- Nếu có > 2 subtasks, nút **"Show All (X)"** sẽ hiển thị
- Click để hiển thị tất cả subtasks
- Nút sẽ đổi thành **"Show Less"** với icon chevron-up
- Click lại để ẩn các subtasks từ thứ 3 trở đi

#### ➕ Thêm Subtask mới

**Cách 1: Khi tạo task mới**
- Thêm trong modal "Add New Task"
- Subtasks sẽ được lưu cùng với task

**Cách 2: Khi chỉnh sửa task**
- Mở modal Edit Task
- Thêm subtask trong phần "Subtasks / Checklist"
- Click "Save Task" để lưu

#### ❌ Xóa Subtask

- Click icon **X** (màu đỏ) bên cạnh subtask
- Confirmation dialog sẽ hiển thị
- Click **"OK"** để xóa
- Progress bar sẽ tự động cập nhật

### 5. Tìm kiếm và Lọc

#### 🔍 Tìm kiếm

1. Nhập từ khóa vào ô **"Search tasks..."** ở đầu trang
2. Kết quả sẽ **tự động filter** khi bạn gõ
3. Tìm kiếm trong cả **title** và **description**
4. Xóa text để hiển thị lại tất cả tasks

#### 🎯 Bộ lọc nâng cao

1. Click vào dropdown **"Filters"** ở đầu trang
2. Chọn các tùy chọn:
   - **Status Filter:** All, Pending, In Progress, Completed
   - **Priority Filter:** All, High, Medium, Low
   - **Sort By:** Due Date, Priority, Created, Title
3. Click **"Apply"** để áp dụng filters
4. Click **"Clear"** để reset tất cả filters

### 6. Upload Avatar

1. Scroll lên phần **"Your Avatar"** ở đầu trang (bên phải navbar)
2. Click **"Choose File"** và chọn ảnh từ máy tính
3. Hỗ trợ định dạng: JPG, PNG, GIF
4. Kích thước tối đa: 16MB
5. Click **"Upload Avatar"**
6. Ảnh sẽ tự động được resize về 200x200px
7. Avatar mới sẽ hiển thị ngay lập tức

### 7. Đăng xuất

1. Click vào **avatar** hoặc **username** ở góc trên bên phải
2. Chọn **"Logout"** từ dropdown menu
3. Bạn sẽ được chuyển về trang đăng nhập

---

## 🗂️ Cấu trúc dự án

```
ptud-gk-de-2/
│
├── app.py                      # File chính: Flask app, models, routes
├── requirements.txt            # Python dependencies
├── README.md                   # File hướng dẫn này
├── migrate_db.py              # Script migrate database (nếu cần)
│
├── instance/
│   └── tasks.db              # SQLite database (tự động tạo)
│
├── static/
│   ├── css/
│   │   └── style.css         # Custom CSS styles
│   ├── js/
│   │   └── script.js         # JavaScript cho interactions
│   └── avatars/              # Thư mục lưu avatar người dùng
│       └── default-avatar.png
│
└── templates/
    ├── base.html             # Base template với navbar
    ├── index.html            # Trang chủ: Dashboard + Task list
    ├── login.html            # Trang đăng nhập
    └── register.html         # Trang đăng ký
```

### Mô tả các file chính

#### `app.py`
- **Models:** User, Task, Subtask
- **Routes:** Authentication, CRUD tasks, Subtasks management
- **Database:** SQLAlchemy ORM với SQLite
- **Security:** Password hashing, session management

#### `static/js/script.js`
- **Toast notifications:** Custom toast system
- **Modal management:** Add/Edit/Delete task modals
- **AJAX requests:** Status updates, subtask operations
- **Form validation:** Client-side validation
- **UI interactions:** Search, filter, sort

#### `static/css/style.css`
- **Custom styles:** Extend Bootstrap
- **Animations:** Transitions, hover effects
- **Responsive design:** Mobile-first approach
- **Color schemes:** Status và priority colors

#### `templates/index.html`
- **Dashboard:** Statistics cards
- **Task cards:** Modern card design
- **Modals:** Add/Edit/Delete forms
- **Filters:** Search và filter controls

---

## 🔧 Xử lý lỗi thường gặp

### 1. Lỗi "No module named 'flask'"

**Nguyên nhân:** Chưa cài đặt dependencies hoặc chưa activate virtual environment.

**Giải pháp:**
```bash
# Đảm bảo đã activate venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Cài đặt lại dependencies
pip install -r requirements.txt
```

### 2. Lỗi database

**Nguyên nhân:** Database bị corrupt hoặc schema không đúng.

**Giải pháp:**
```bash
# Xóa database cũ
rm instance/tasks.db  # Linux/Mac
del instance\tasks.db  # Windows

# Chạy lại ứng dụng (database sẽ tự động được tạo)
python app.py
```

**Hoặc sử dụng migrate script:**
```bash
python migrate_db.py
```

### 3. Lỗi port 5000 đã được sử dụng

**Nguyên nhân:** Port 5000 đang được sử dụng bởi ứng dụng khác.

**Giải pháp 1:** Tắt ứng dụng đang sử dụng port 5000

**Giải pháp 2:** Đổi port trong `app.py`:
```python
if __name__ == '__main__':
    app.run(port=5001, debug=True)  # Đổi thành port khác
```

### 4. Lỗi upload avatar

**Nguyên nhân:** 
- Thư mục `static/avatars` không tồn tại
- Không có quyền ghi file
- File ảnh không hợp lệ

**Giải pháp:**
```bash
# Tạo thư mục nếu chưa có
mkdir static/avatars  # Linux/Mac
mkdir static\avatars  # Windows

# Kiểm tra quyền ghi file
# Đảm bảo file ảnh là JPG, PNG, hoặc GIF
# Kích thước tối đa: 16MB
```

### 5. Subtasks không hiển thị

**Nguyên nhân:** 
- Database chưa có bảng `subtask`
- JavaScript errors
- Cache browser

**Giải pháp:**
1. **Kiểm tra database:**
   ```python
   python
   >>> from app import app, db
   >>> with app.app_context():
   ...     from app import Subtask
   ...     print(Subtask.query.all())
   ```

2. **Refresh trang:** Ctrl+F5 (hard refresh)

3. **Kiểm tra console:** Mở Developer Tools (F12) và xem Console tab

4. **Chạy migrate script:**
   ```bash
   python migrate_db.py
   ```

### 6. Lỗi "Template not found"

**Nguyên nhân:** Thiếu file template hoặc đường dẫn sai.

**Giải pháp:**
- Đảm bảo thư mục `templates/` tồn tại
- Kiểm tra tên file template chính xác
- Đảm bảo đang chạy từ thư mục gốc của project

### 7. Lỗi validation form

**Nguyên nhân:** Chưa điền đầy đủ các trường bắt buộc.

**Giải pháp:**
- Kiểm tra các trường có dấu * (bắt buộc)
- Estimated Time phải có ít nhất 1 phút
- Username tối thiểu 3 ký tự
- Password tối thiểu 6 ký tự

---

## 💾 Backup dữ liệu

### Backup Database

```bash
# Windows
copy instance\tasks.db backup\tasks_backup.db

# Linux/Mac
cp instance/tasks.db backup/tasks_backup.db
```

### Backup Avatars

```bash
# Windows
xcopy static\avatars backup\avatars /E /I

# Linux/Mac
cp -r static/avatars backup/avatars
```

### Restore từ Backup

```bash
# Restore database
copy backup\tasks_backup.db instance\tasks.db  # Windows
cp backup/tasks_backup.db instance/tasks.db    # Linux/Mac

# Restore avatars
xcopy backup\avatars static\avatars /E /I  # Windows
cp -r backup/avatars static/avatars         # Linux/Mac
```

---

## 🚀 Tính năng nâng cao

### Keyboard Shortcuts

- **Enter** trong ô search → Tìm kiếm
- **Enter** trong ô subtask → Thêm subtask nhanh
- **Escape** → Đóng modal (sắp có)

### Real-time Updates

- ✅ Cập nhật trạng thái task không cần reload
- ✅ Progress bar tự động cập nhật khi tick subtask
- ✅ Toast notifications cho mọi thao tác
- ✅ Badge và statistics tự động refresh

### Auto-complete Subtasks

- Khi đánh dấu task là "Completed":
  - Hiển thị confirmation nếu có subtasks chưa hoàn thành
  - Tự động đánh dấu tất cả subtasks completed
  - Hiển thị tất cả subtasks (bỏ qua "Show All")
  - Cập nhật progress bar lên 100%
  - Lưu vào database ngay lập tức

### Smart Time Display

- **Overdue tasks:**
  - Hiển thị "Overdue by: X hours/days"
  - Màu đỏ để cảnh báo

- **Time remaining:**
  - Hiển thị "Time remaining: X hours/days/weeks"
  - Format thông minh:
    - < 24h: Hiển thị giờ
    - < 7 ngày: Hiển thị ngày
    - >= 7 ngày: Hiển thị tuần

### Progress Tracking

- Progress bar với animation
- Phần trăm hoàn thành chính xác
- Màu sắc thay đổi theo tiến độ:
  - Xanh dương: Chưa hoàn thành
  - Xanh lá: 100% hoàn thành

---

## 📝 Ghi chú kỹ thuật

### Database Schema

- **User Table:**
  - id, username, password_hash, role, avatar_path

- **Task Table:**
  - id, title, description, status, created_at, due_date, finished_at, estimated_hours, priority, user_id

- **Subtask Table:**
  - id, title, completed, task_id, created_at

### Security Features

- Password hashing với Werkzeug
- Session management với Flask-Login
- SQL injection protection với SQLAlchemy ORM
- File upload validation (type, size)
- XSS protection với Jinja2 auto-escaping

### Performance Optimizations

- Eager loading subtasks với `joinedload()` để tránh N+1 queries
- AJAX requests để giảm page reloads
- Database indexing trên các trường thường query

### Time Handling

- Tất cả thời gian được lưu theo UTC
- Hiển thị theo timezone local của user
- Task trễ hạn được tính tự động dựa trên due_date

---

## 🔄 Cập nhật ứng dụng

### Cập nhật từ Git

```bash
# Pull code mới
git pull origin main

# Cài đặt dependencies mới (nếu có)
pip install -r requirements.txt --upgrade

# Restart ứng dụng
python app.py
```

### Cập nhật Database Schema

Nếu có thay đổi models:

```python
python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()  # Tạo bảng mới nếu chưa có
...     print("Database updated!")
```

---

## 📄 License

Dự án này được tạo cho **mục đích học tập và nghiên cứu**.

---

## 👨‍💻 Tác giả

**Huỳnh Long Hồ**  
🎓 Mã số sinh viên: 21008411  
📚 Môn học: Phát triển ứng dụng web  
🏫 Trường: Đại học Công nghệ Thông tin

---

## 📞 Liên hệ & Hỗ trợ

Nếu gặp vấn đề hoặc có câu hỏi:
1. Kiểm tra phần [Xử lý lỗi thường gặp](#-xử-lý-lỗi-thường-gặp)
2. Xem lại [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
3. Kiểm tra console browser (F12) để xem lỗi JavaScript
4. Kiểm tra terminal để xem lỗi Python/Flask

---

<div align="center">

**Phiên bản:** 2.0  
**Cập nhật lần cuối:** 2025

Made with ❤️ using Flask

</div>
