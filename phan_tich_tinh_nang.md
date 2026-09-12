## Phân tích tính năng

### 1. Tổng quan top-down

Phần mềm được phân tích theo mô hình cây 3 lớp:
- **Layer 1**: Module chức năng lớn (6 module)
- **Layer 2**: Nhóm tính năng trong mỗi module
- **Layer 3**: Tính năng cụ thể, có thể triển khai thành 1 màn hình/1 flow

Từ 6 module Layer 1, 3 module được đánh giá là **giải quyết trực tiếp pain point cốt lõi** của người dùng (sinh viên) và được chọn để phân tích sâu, thiết kế UI/UX và database:

| Module | Pain point giải quyết | Đối tượng chính |
|---|---|---|
| Internship Discovery & Matching | "Tôi không biết thực tập nào phù hợp với mình, tốn thời gian lọc thủ công" | Sinh viên |
| Internship Application Management | "Tôi nộp đơn rồi nhưng không biết đang ở bước nào" | Sinh viên, Công ty |
| Internship Progress Management | "Giảng viên/công ty không thấy được sinh viên đang làm gì trong quá trình thực tập" | Sinh viên, Supervisor |

3 module còn lại (Evaluation, Organization, Monitoring & Reporting) là tính năng cần thiết cho hệ thống hoàn chỉnh nhưng thuộc nhóm **hạ tầng/quản trị** — không phải tính năng cốt lõi.

---

### 2. Phân tích chi tiết 3 tính năng cốt lõi

#### 2.1. Internship Discovery & Matching

**Mục tiêu**: Giúp sinh viên tìm được thực tập phù hợp nhanh hơn, chính xác hơn so với việc lọc thủ công qua danh sách dài.

| Tính năng con | Mô tả | Cần thiết? |
|---|---|---|
| Search & Filter | Tìm theo từ khóa, lọc theo ngành/địa điểm/thời lượng | Bắt buộc — baseline UX của mọi job board |
| Internship Details | Xem mô tả công việc, yêu cầu kỹ năng, thông tin công ty | Bắt buộc — sinh viên cần đủ thông tin để quyết định |
| Match Score | Tính % phù hợp giữa kỹ năng sinh viên và yêu cầu công việc | Cốt lõi — đây là yếu tố "smart" phân biệt sản phẩm |
| Recommendation Explanation | Giải thích bằng ngôn ngữ tự nhiên vì sao match/chưa match | Cốt lõi — tăng độ tin cậy của Match Score, có AI hỗ trợ |

**Logic xử lý**:
- Match Score = công thức trọng số (weighted overlap giữa `StudentSkill` và `InternshipSkill`) → không dùng AI, đảm bảo minh bạch, giải thích được.
- Recommendation Explanation = LLM sinh câu giải thích từ input có cấu trúc (matched skills, missing skills, tên vị trí).
- Search = kiến trúc hybrid (keyword + semantic embedding) — bản demo dùng keyword, semantic là định hướng mở rộng.

**Input/Output chính**:
- Input: `StudentProfile.skills`, `Internship.required_skills`, query text
- Output: danh sách internship đã rank theo relevance/match score, kèm giải thích

---

#### 2.2. Internship Application Management

**Mục tiêu**: Loại bỏ tình trạng "nộp đơn xong rồi mất dấu" — cho sinh viên và công ty cùng nhìn thấy trạng thái minh bạch, real-time.

| Tính năng con | Mô tả | Cần thiết? |
|---|---|---|
| Application Form | Form nộp đơn (cover note, thời gian rảnh) | Bắt buộc |
| CV/Document Upload | Đính kèm CV, chứng chỉ | Bắt buộc |
| Application Status | Trạng thái hiện tại (Submitted → Reviewing → Interview → Accepted/Rejected) | Cốt lõi — giải quyết trực tiếp pain point "không biết đang ở bước nào" |
| Status History | Lịch sử thay đổi trạng thái theo thời gian | Quan trọng — tạo tính minh bạch, tránh tranh chấp "ai đổi trạng thái khi nào" |

**Logic xử lý**:
- State machine đơn giản, không cần AI — độ tin cậy của quy trình quan trọng hơn "thông minh".
- Mỗi lần đổi status → ghi 1 dòng vào `ApplicationStatusHistory` (audit trail).

**Input/Output chính**:
- Input: `StudentProfile`, `Internship`, file CV, ghi chú
- Output: `Application` record với `status` hiện tại + lịch sử đầy đủ

---

#### 2.3. Internship Progress Management

**Mục tiêu**: Tạo kênh theo dõi tiến độ thực tập theo thời gian thực giữa sinh viên và supervisor, thay vì chỉ đánh giá 1 lần cuối kỳ.

| Tính năng con | Mô tả | Cần thiết? |
|---|---|---|
| Task Assignment | Supervisor giao task cho sinh viên | Bắt buộc |
| Task Progress | Trạng thái task (To Do/In Progress/Done) | Bắt buộc — cho cả 2 bên thấy tiến độ trực quan |
| Weekly Report | Sinh viên báo cáo hàng tuần | Cốt lõi — dữ liệu chính cho việc giám sát |
| Supervisor Feedback | Supervisor phản hồi từng báo cáo | Cốt lõi — tạo vòng lặp feedback 2 chiều |

**Logic xử lý**:
- Task status: cập nhật thủ công, không dùng AI (tránh AI đoán sai trạng thái công việc thật).
- Weekly Report: AI hỗ trợ tóm tắt (TL;DR) cho supervisor quản lý nhiều sinh viên cùng lúc — tính năng phụ trợ, không thay thế nội dung báo cáo gốc.

**Input/Output chính**:
- Input: `Task` (assignee, due date), `WeeklyReport` (nội dung, tuần thứ mấy)
- Output: Kanban view cho task, timeline view cho report + feedback

---

### 3. Phân tích 3 module còn lại

#### 3.1. Internship Evaluation

**Mục tiêu**: Chuẩn hóa quy trình đánh giá kết quả thực tập, làm căn cứ tính điểm/công nhận tín chỉ.

| Tính năng con | Mô tả | Cần thiết? |
|---|---|---|
| Self Assessment | Sinh viên tự đánh giá quá trình thực tập của mình | Cần thiết cho mục đích học thuật, không phải core UX |
| Learning Outcome | Ghi nhận kỹ năng/kiến thức đạt được sau kỳ thực tập | Hữu ích cho báo cáo nhà trường |
| Performance Rating | Supervisor chấm điểm hiệu suất sinh viên | Cần thiết nếu có tính điểm chính thức |
| Overall Score | Tổng hợp điểm cuối kỳ | Cần thiết nếu có tính tín chỉ |
| Completion Decision | Quyết định đạt/không đạt thực tập | Cần thiết cho mục đích học thuật |

---

#### 3.2. User & Internship Organization

**Mục tiêu**: Quản lý danh tính, hồ sơ, và phân quyền cho toàn hệ thống.

| Tính năng con | Mô tả | Cần thiết? |
|---|---|---|
| Student Profile | Thông tin cá nhân, học vấn của sinh viên | Bắt buộc — nhưng là nền tảng (đã ngầm định cần có để 3 module core hoạt động) |
| Skills & Preferences | Danh sách kỹ năng, sở thích ngành nghề | Bắt buộc — chính là input cho Match Score ở module Discovery |
| Company Profile | Thông tin công ty | Bắt buộc — nền tảng cho Internship Posting |
| Internship Posting | Công ty đăng tin tuyển thực tập | Bắt buộc — nguồn dữ liệu cho Search & Filter |
| Student Role | Phân quyền cho tài khoản sinh viên | Cần thiết về mặt hệ thống |
| Supervisor/Admin Role | Phân quyền cho supervisor/admin | Cần thiết về mặt hệ thống |

---

#### 3.3. Internship Monitoring & Reporting

**Mục tiêu**: Cung cấp góc nhìn tổng quan (dashboard, thống kê) cho vai trò quản lý — nhà trường, admin hệ thống.

| Tính năng con | Mô tả | Cần thiết? |
|---|---|---|
| Progress Overview | Dashboard tổng quan tiến độ thực tập của toàn bộ sinh viên | Hữu ích cho admin, không phải sinh viên |
| Application Overview | Thống kê tổng số đơn ứng tuyển, tỷ lệ trúng tuyển | Hữu ích cho công ty/admin ra quyết định |
| Deadline Reminder | Nhắc hạn nộp đơn, hạn báo cáo | Có giá trị UX cao, dễ triển khai bằng notification đơn giản |
| Status Notification | Thông báo khi trạng thái đơn/task thay đổi | Có giá trị UX cao, tăng engagement |
| Internship Statistics | Số liệu thống kê theo ngành, theo kỳ | Chỉ cần khi có đủ dữ liệu lịch sử |
| Performance Reports | Báo cáo hiệu suất tổng hợp | Dành cho admin/nhà trường |

---