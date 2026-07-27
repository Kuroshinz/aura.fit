const fs = require('fs');

function fixMojibake(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Login page fixes
  c = c.replace('TÃ i khoáº£n hoáº·c máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c.', 'Tài khoản hoặc mật khẩu không chính xác.');
  c = c.replace('Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ thÃ´ng tin.', 'Vui lòng nhập đầy đủ thông tin.');
  c = c.replace('placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"', 'placeholder="••••••••"');
  c = c.replace('Ä ANG Ä Ä‚NG NHáº¬P...', 'ĐANG ĐĂNG NHẬP...');
  c = c.replace('Ä Ä‚NG NHáº¬P', 'ĐĂNG NHẬP');
  c = c.replace('ChÆ°a cÃ³ tÃ i khoáº£n?', 'Chưa có tài khoản?');
  c = c.replace('Ä Äƒng kÃ½ ngay', 'Đăng ký ngay');

  // Register page fixes
  c = c.replace('TÃ i khoáº£n Ä‘Ã£ tá»“n táº¡i!', 'Tài khoản đã tồn tại!');
  c = c.replace('Ä ANG Ä Ä‚NG KÃ ...', 'ĐANG ĐĂNG KÝ...');
  c = c.replace('Ä Ä‚NG KÃ  TÃ€I KHOáº¢N', 'ĐĂNG KÝ TÀI KHOẢN');
  c = c.replace('Ä Ã£ cÃ³ tÃ i khoáº£n?', 'Đã có tài khoản?');
  c = c.replace('Ä Äƒng nháº­p', 'Đăng nhập');

  fs.writeFileSync(filePath, c, 'utf8');
}

fixMojibake('d:/Nexus/src/app/(auth)/login/page.tsx');
fixMojibake('d:/Nexus/src/app/(auth)/register/page.tsx');
console.log('Fixed!');
