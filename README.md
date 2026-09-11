Họ tên: Đoàn Nhật Bình  
Bài tập ngày 11/09: Chọn chủ đề và phân tích phần mềm đã chọn với top down approach, sau đó chọn ra các tính năng quan trọng nhất để làm UI/UX và database design  

## Giới thiệu phần mềm: InternHub — Smart Internship Management System

### Bài toán
Sinh viên gặp khó khăn khi tìm kiếm việc thực tập phù hợp với năng lực bản thân, và thiếu một nền tảng tập trung để theo dõi trạng thái ứng tuyển, và duy trì kết nối minh bạch với công ty/giảng viên hướng dẫn trong suốt quá trình thực tập. InternHub được thiết kế để giải quyết các điểm nghẽn này thông qua một nền tảng tập trung.

### Phạm vi phân tích (Top-down approach)
Phần mềm được phân tích theo mô hình 3 lớp, gồm 6 module chính:

1. Internship Discovery & Matching
2. Internship Application Management
3. Internship Progress Management
4. Internship Evaluation
5. User & Internship Organization
6. Internship Monitoring & Reporting

Trong đó, **3 module cốt lõi** được chọn để thiết kế UI/UX và database:

- **Internship Discovery & Matching** — tìm kiếm, lọc, và gợi ý thực tập dựa trên mức độ phù hợp kỹ năng (Match Score), có giải thích gợi ý (Recommendation Explanation) bằng AI.
- **Internship Application Management** — nộp hồ sơ ứng tuyển và theo dõi trạng thái xử lý theo thời gian thực.
- **Internship Progress Management** — quản lý task được giao và báo cáo tiến độ hàng tuần giữa sinh viên và supervisor.

3 module còn lại (Evaluation, Organization, Monitoring & Reporting) được giữ trong mindmap như định hướng phát triển tương lai, không nằm trong phạm vi build UI/UX và database lần này.

### Ứng dụng AI
- **Match Score**: tính bằng công thức trọng số (không dùng AI) để đảm bảo minh bạch, có thể giải thích được.
- **Recommendation Explanation**: dùng LLM để diễn giải kết quả match một cách tự nhiên.
- **Search**: kiến trúc đề xuất là hybrid search (keyword + semantic embedding), hiện tại bản UI/UX sử dụng keyword search, semantic search là phần mở rộng.

### Công cụ sử dụng
- **Mindmap**: XMind
- **UI/UX prototype**: Figma
- **Database design**: DBdiagram

### Quick start
Để xem UI/UX, chạy lần lượt các lệnh sau:
```bash
cd InternHub
```

```bash
npm install
```

```bash
npm run dev
```
Để xem và tương tác với UI/UX của phần mềm mà không cần download code, anh có thể truy cập vào link: https://www.figma.com/make/G0R3nUP0L3fwgNQLG8RidV/Continue-InternHub-Development?t=8YxBoaR5xPYa230r-20&fullscreen=1

- [Top-down approach](./Topdown_approach.png) — Phân tích top-down được export từ XMind.
- [Database design](./database_design.png) — Thiết kế database của 3 module cốt lõi.