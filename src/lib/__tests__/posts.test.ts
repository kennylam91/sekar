import { describe, it, expect } from "vitest";
import { extractPhone } from "../posts";

describe("extractPhone", () => {
  it("should extract phone number", () => {
    expect(
      extractPhone(
        "Đầu giờ chiều nay 28/2 cần xe ghép,xe quay đầu 2 người từ bv đại học y về hạ long  đt 0974745393  ",
      ),
    ).toBe("0974745393");
    expect(
      extractPhone(
        "Mình cần xe ghép Sóc Sơn về TP Hạ Long, lượng hàng khoảng 4.5 khối. Liên hệ 0977807488",
      ),
    ).toBe("0977807488");

    expect(
      extractPhone(
        "Hôm nay 28/2 từ 15-17h xe 7 chỗ sản nhi-hạ long-móng cái 0334 883 678 Ưu tiên bao xe nhận gửi đồ",
      ),
    ).toBe("0334883678");

    expect(extractPhone("Hotline / zalo: 0789.23.23.32")).toBe("0789232332");
    expect(
      extractPhone(
        "Sáng chủ Nhật này 1/3 Nhà em đi xe không từ Hạ Long lên Hưng yên . Ai cần xe Alo 0984176798 . Giá tiện chuyến",
      ),
    ).toBe("0984176798");
    expect(extractPhone("ai có nhu cầu đi lại alo mình nhé 0943705582")).toBe(
      "0943705582",
    );

    expect(extractPhone("ĐT/Zalo : 0389 118 853")).toBe("0389118853");

    expect(extractPhone("☎️ĐẶT XE KHÁCH ĐƯA ĐÓN TẬN NƠI_1900.63.33.60")).toBe(
      "1900.63.33.60",
    );

    expect(
      extractPhone(
        "Hôm nay 28/2 mình có xe  tiện chuyến từ quảng ninh, hải phòng đi hà nội và ngược lại.  LH 0962974256",
      ),
    ).toBe("0962974256");

    expect(extractPhone("HOTLINE 0378749434.")).toBe("0378749434");

    expect(
      extractPhone(`Hàng ngày, Xe 5,7 chỗ tìm khách Ninh bình_nam định_hà nam__ hải phòng__hạ long & ngược lại. Nhận bao xe.
0399.162.893`),
    ).toBe("0399162893");

    expect(
      extractPhone(`Chiều nay 28-2 tầm 14h có xe bán tải chở gió từ đình lập lạng sơn về qua đh-hà cối. B nào gửi đồ hay về cùng lh:0376429458
`),
    ).toBe("0376429458");

    expect(
      extractPhone(`28/02/2026 Sẵn xe di chuyển từ Quảng Ninh về Thái Bình, ace cần liên hệ alo 0345358480
`),
    ).toBe("0345358480");
    expect(
      extractPhone(`xe mình tối Hà Nội về - Quảng yên quảng ninh. tìm khách ghép hoặc bao xe.  xe gd giá re
Lh 0383822468`),
    ).toBe("0383822468");
    expect(
      extractPhone(`🚘🚘 Xe ghép: Hà Nội - Hải Phòng - Quảng Ninh🚦
☎️ Hotline / zalo 096 6785179`),
    ).toBe("0966785179");
    expect(
      extractPhone(`🚘 Xe ghép – Xe chuyên tuyến: Nội Bài ⇄ Hà Nội ⇄ Hải Phòng ⇄ Hạ Long
☎️ Hotline/Zalo: 0348.384.368 – Gọi ngay để đặt xe!`),
    ).toBe("0348384368");
    expect(
      extractPhone(`Hôm nay 28/2 từ 15-17h xe 7 chỗ sản nhi-hạ long-móng cái 0334 883 678
Ưu tiên bao xe`),
    ).toBe("0334883678");
    expect(
      extractPhone(`Chiều mai ngày 3 1 mình có xe 5 chỗ từ Hưng Yên qua Hải Dương về Uông Bí. Ai cần xe inbox hoặc gọi số 0375692002. Mình cám ơn.
`),
    ).toBe("0375692002");
    expect(
      extractPhone(`18h30 hôm nay  cần bao xe 4 có cốp hoặc 7 chỗ sảnh quốc tế về mạo khê 800k liên hệ 0355880992
`),
    ).toBe("0355880992");
  });
});
