# Phương Hiển IT — Premium SEO / GEO / UX V4

Bản V4 lấy **source portfolio gốc làm visual master**, không đổi thành template SEO. Jost + Space Grotesk, preloader, glass UI, custom cursor, magnetic button, tilt, GSAP, ScrollTrigger, Three.js, light/dark theme và responsive behavior được giữ lại hoặc tái sử dụng.

## Mục tiêu
- Cạnh tranh Top 10–20 cho `thiết kế website tphcm` và `thiết kế website nha trang` như KPI chiến lược, **không cam kết vị trí** vì ranking còn phụ thuộc cạnh tranh, authority, khoảng cách local và thuật toán.
- Tăng khả năng Google/AI hiểu đúng entity `Phương Hiển` ↔ `Thiết Kế Website Phương Hiển IT` ↔ dịch vụ ↔ 2 location ↔ case study.
- UI/UX premium nhưng nội dung và CTA phải đọc được trước khi Three.js/GSAP hoàn tất tải.

## Deploy
Website được host trên **Netlify**. Push code lên Git repo → Netlify tự động deploy. `index.html`, `netlify.toml`, `_redirects`, `robots.txt` và `sitemap.xml` phải nằm ở publish root.

## Performance strategy
- Nội dung SEO/GEO tồn tại sẵn trong HTML.
- Preloader không chờ `window.load` và chỉ chạy đầy đủ một lần mỗi session.
- GSAP/ScrollTrigger progressive enhancement; nếu CDN lỗi, heading/content vẫn hiển thị.
- Three.js tải khi browser idle, giảm particles/pixel ratio trên mobile và thiết bị RAM thấp, render khoảng 30fps và dừng khi tab ẩn.
- Full WebGL chỉ ở homepage; money/case pages dùng lite; article pages không cần WebGL.
- `prefers-reduced-motion` được tôn trọng.

## GA4
`assets/site.js` đang để `GA4_ID = ""`. Khi có Measurement ID dạng `G-...`, thay giá trị này hoặc gửi ID để cập nhật.

## Cache và cập nhật
Website không cần trang quản trị cache hoặc biến môi trường bảo mật. `netlify.toml` đặt `no-store` cho toàn bộ HTML, CSS, JavaScript và hình ảnh.

## Local SEO
- TP.HCM: 35/6H Ấp Hưng Lân, Hóc Môn, Hồ Chí Minh.
- Khánh Hòa: 223 Đường Bến Đò, Hòa Thắng, Khánh Hòa; **Nha Trang là service area**, không phải địa chỉ giả.

## Không làm
Không fake review, aggregateRating, traffic, doanh thu, ranking, địa chỉ, testimonial hoặc hàng loạt doorway page.
