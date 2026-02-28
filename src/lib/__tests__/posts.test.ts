import { describe, it, expect } from "vitest";
import { extractPhone } from "../posts";

describe("extractPhone", () => {
  it.each([
    [
      "Đầu giờ chiều nay 28/2 cần xe ghép,xe quay đầu 2 người từ bv đại học y về hạ long  đt 0974745393  ",
      "0974745393",
    ],
    [
      "Mình cần xe ghép Sóc Sơn về TP Hạ Long, lượng hàng khoảng 4.5 khối. Liên hệ 0977807488",
      "0977807488",
    ],
    [
      "Hôm nay 28/2 từ 15-17h xe 7 chỗ sản nhi-hạ long-móng cái 0334 883 678 Ưu tiên bao xe nhận gửi đồ",
      "0334883678",
    ],
    ["Hotline / zalo: 0789.23.23.32", "0789232332"],
    [
      "Sáng chủ Nhật này 1/3 Nhà em đi xe không từ Hạ Long lên Hưng yên . Ai cần xe Alo 0984176798 . Giá tiện chuyến",
      "0984176798",
    ],
    ["ai có nhu cầu đi lại alo mình nhé 0943705582", "0943705582"],
    ["ĐT/Zalo : 0389 118 853", "0389118853"],
    ["☎️ĐẶT XE KHÁCH ĐƯA ĐÓN TẬN NƠI_1900.63.33.60", "1900.63.33.60"],
    [
      "Hôm nay 28/2 mình có xe  tiện chuyến từ quảng ninh, hải phòng đi hà nội và ngược lại.  LH 0962974256",
      "0962974256",
    ],
    ["HOTLINE 0378749434.", "0378749434"],
    [
      "Hàng ngày, Xe 5,7 chỗ tìm khách Ninh bình_nam định_hà nam__ hải phòng__hạ long & ngược lại. Nhận bao xe.\n0399.162.893",
      "0399162893",
    ],
    [
      "Chiều nay 28-2 tầm 14h có xe bán tải chở gió từ đình lập lạng sơn về qua đh-hà cối. B nào gửi đồ hay về cùng lh:0376429458\n",
      "0376429458",
    ],
    [
      "28/02/2026 Sẵn xe di chuyển từ Quảng Ninh về Thái Bình, ace cần liên hệ alo 0345358480\n",
      "0345358480",
    ],
    [
      "xe mình tối Hà Nội về - Quảng yên quảng ninh. tìm khách ghép hoặc bao xe.  xe gd giá re\nLh 0383822468",
      "0383822468",
    ],
    [
      "🚘🚘 Xe ghép: Hà Nội - Hải Phòng - Quảng Ninh🚦\n☎️ Hotline / zalo 096 6785179",
      "0966785179",
    ],
    [
      "🚘 Xe ghép – Xe chuyên tuyến: Nội Bài ⇄ Hà Nội ⇄ Hải Phòng ⇄ Hạ Long\n☎️ Hotline/Zalo: 0348.384.368 – Gọi ngay để đặt xe!",
      "0348384368",
    ],
    [
      "Hôm nay 28/2 từ 15-17h xe 7 chỗ sản nhi-hạ long-móng cái 0334 883 678\nƯu tiên bao xe",
      "0334883678",
    ],
    [
      "Chiều mai ngày 3 1 mình có xe 5 chỗ từ Hưng Yên qua Hải Dương về Uông Bí. Ai cần xe inbox hoặc gọi số 0375692002. Mình cám ơn.\n",
      "0375692002",
    ],
    [
      "18h30 hôm nay  cần bao xe 4 có cốp hoặc 7 chỗ sảnh quốc tế về mạo khê 800k liên hệ 0355880992\n",
      "0355880992",
    ],
  ] as const)("%s", (input, expected) => {
    expect(extractPhone(input)).toBe(expected);
  });
});
