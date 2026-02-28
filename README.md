# 🤝 TRUST-CHAIN: Công cụ minh bạch hóa từ thiện dựa trên Blockchain

<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Polygon-blueviolet" alt="Blockchain">
  <img src="https://img.shields.io/badge/Frontend-React.js-blue" alt="Frontend">
  <img src="https://img.shields.io/badge/Offline-Enabled-green" alt="Offline-First">
  <img src="https://img.shields.io/badge/License-MIT-brightgreen" alt="License">
</p>

---

## ⚡ Tổng quan dự án

**TRUST-CHAIN** là một nền tảng thiện nguyện phi tập trung được thiết kế để giải quyết khủng hoảng niềm tin trong hoạt động từ thiện tại Việt Nam. Dự án tận dụng sức mạnh của **Blockchain** để lưu trữ bằng chứng bất biến, kết hợp với kiến trúc **Offline-First** cho phép tình nguyện viên báo cáo thực địa ngay cả khi không có Internet.

### 🌐 Vấn đề chúng tôi giải quyết
1.  **Gian lận hình ảnh:** Tình trạng sử dụng ảnh mạng, ảnh cũ để báo cáo khống.
2.  **Mập mờ tài chính:** Sao kê giấy khó tra cứu, dễ bị chỉnh sửa.
3.  **Xâm phạm riêng tư:** Công khai danh tính người nghèo làm tổn thương nhân phẩm họ.
4.  **Rào cản hạ tầng:** Mất mạng 4G/Wifi tại vùng lũ khiến việc báo cáo bị ngưng trệ.

---

## 🚀 Tính năng cốt lõi

### 🔐 1. Smart Block & Blockchain Ledger
Mỗi chiến dịch từ thiện được khởi tạo dưới dạng một hợp đồng thông minh (Smart Contract) trên mạng **Polygon**. Mọi giao dịch được ghi nhận bất biến, không ai có thể sửa xóa.

### 📷 2. Sealed Offline Reporting (Báo cáo niêm phong)
* **Xử lý tại Client:** Sử dụng **IndexedDB** để lưu trữ dữ liệu (ảnh, GPS, thời gian) ngay trên thiết bị khi mất mạng.
* **Hashing thực địa:** Ảnh được băm (**SHA-256**) ngay tại chỗ và niêm phong cùng tọa độ GPS vệ tinh. Bằng chứng này không thể bị tráo đổi.

### 🤫 3. Hashed Identity (Định danh mã hóa)
Minh bạch hóa danh sách người nhận quà bằng cách sử dụng mã Hash, bảo mật hoàn toàn tên và thông tin cá nhân của người thụ hưởng.

### 🔍 4. Minh bạch hóa Tìm kiếm
Thanh tìm kiếm thông minh cho phép người quyên góp tra cứu mã giao dịch hoặc mã định danh người nhận để xác thực dòng tiền tức thì.

---

## 🏗️ Kiến trúc kỹ thuật



-   **Frontend:** React.js, Tailwind CSS (PWA)
-   **Backend/Database:** Firebase Realtime Database
-   **Blockchain:** Solidity, Polygon Network (Mumbai Testnet)
-   **Hashing Algorithm:** SHA-256 (CryptoJS)

---

## 🎬 Demo thực tế

Bạn có thể trải nghiệm sản phẩm tại đây:
👉 **[TRUST-CHAIN Live Demo](https://ais-pre-sjo4miu2odtathcwepebit-147180239991.asia-southeast1.run.app)**

---

## 🛠️ Hướng dẫn cài đặt địa phương (Local)

### Yêu cầu tiên quyết
-   Node.js (v14+)
-   MetaMask Wallet

### Các bước cài đặt
1.  **Clone repository:**
    ```bash
    git clone [https://github.com/your-username/trust-chain.git](https://github.com/your-username/trust-chain.git)
    cd trust-chain
    ```
2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```
3.  **Cấu hình biến môi trường (`.env`):**
    ```bash
    REACT_APP_FIREBASE_API_KEY=your_key
    REACT_APP_CONTRACT_ADDRESS=your_address
    ```
4.  **Chạy dự án:**
    ```bash
    npm start
    ```

---

## 👨‍💻 Đội ngũ phát triển (Team Exodia)

-   Nguyễn Lê Hoàng Nam
-   Nguyễn Quang Huy
-   Triệu Hoàng Triết

---

## 📄 Giấy phép
Dự án được phát hành theo giấy phép MIT.
