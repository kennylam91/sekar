import { describe, it, expect } from "vitest";
import { detectPostType } from "../post-type-detector";

describe("detectPostType", () => {
  it("passenger looking for shared ride from Ha Long", () => {
    expect(
      detectPostType("tối mai 28/2 7h e tìm xe ghép từ hạ long về ba chẽ ạ"),
    ).toBe("passenger");
  });

  it("passenger chartering a 7-seater with driver contact", () => {
    expect(
      detectPostType(
        "Mai mình cần bao xe 7 chỗ từ tế tiêu hà nội đi hoành bồ hạ long quảng ninh trong khung giờ 13h có bác tài nào tiên chuyến Lh 0974597941",
      ),
    ).toBe("passenger");
  });

  it("driver offering shared rides with hotline", () => {
    expect(
      detectPostType(
        "🚘Xe 5-7 chỗ tìm khách ghép - bao xe Sân Bay- Cẩm Phả - Hạ Long - Móng Cái - Vân Đồn - Hà nội-Hải Phòng\nNhận gửi hàng giá từ 150k ☎️LH 0387876966",
      ),
    ).toBe("driver");
  });

  it("driver advertising route with HOTLINE", () => {
    expect(
      detectPostType(
        "Xe Ghép Xe Tiện Chuyến Hà Nội - Hải Phòng -Quảng Ninh HOTLINE 0378749434",
      ),
    ).toBe("driver");
  });

  it("driver advertising service with fancy unicode text", () => {
    expect(
      detectPostType(
        "🚗 𝑿𝒆 𝒈𝒉𝒆́𝒑, 𝒕𝒊𝒆̣̂𝒏 𝒄𝒉𝒖𝒚𝒆̂́𝒏 24/7 𝑯𝒆̣̂ 𝒕𝒉𝒐̂́𝒏𝒈 𝒙𝒆 𝒈𝒉𝒆́𝒑 5–7 𝒄𝒉𝒐̂̃, 𝒙𝒆 𝒅𝒖 𝒍𝒊̣𝒄𝒉 9–16 𝒄𝒉𝒐̂̃ ☎️ Zalo: 𝟎𝟗𝟑𝟔.𝟗𝟑𝟑.𝟔𝟖𝟕 📍 Tuyến Hà Nội - Hải Phòng - Quảng Ninh & các tỉnh 🛫 Đưa đón sân bay 📦 Gửi hàng nhanh 🏝️ Xe du lịch - đi lễ - công tác 📌 𝐶𝑎̂̀𝑛 đ𝑖 𝑔𝑎̂́𝑝 𝑔𝑜̣𝑖 𝑛𝑔𝑎𝑦! 𝐶𝑎̂̀𝑛 đ𝑎̣̆𝑡 𝑙𝑖̣𝑐ℎ 𝑏𝑎́𝑜 𝑡𝑟𝑢̛𝑜̛́𝑐 đ𝑒̂̉ 𝑔𝑖𝑢̛̃ 𝑥𝑒! #xeghephaiphong #xegheptienchuyen #xeghephanoiquangninh #xeghephanoi #xeghephanoihalong #xeghephanoihalong",
      ),
    ).toBe("driver");
  });

  it("driver advertising route with HOTLINE (duplicate post)", () => {
    expect(
      detectPostType(
        "Xe Ghép Xe Tiện Chuyến Hà Nội - Hải Phòng -Quảng Ninh HOTLINE 0378749434",
      ),
    ).toBe("driver");
  });

  it("driver offering shared trip along a route", () => {
    expect(
      detectPostType(
        "Sáng mai 8h30-9h Móng cái Hải hà Đầm hà Tiên Yên- hạ long Hải Phòng Ai cần đi chuyển ib em ghép cho. Giá tốt 0984108077",
      ),
    ).toBe("driver");
  });

  it("passenger looking for shared ride to Yen Tu", () => {
    expect(
      detectPostType(
        "Chủ nhật có xe ghép nào đi từ Cẩm Phả, Hạ Long đi Yên Tử không ạ? E có 2 ng cần tìm xe ghép.",
      ),
    ).toBe("passenger");
  });

  it("passenger asking about convenient trip price", () => {
    expect(
      detectPostType(
        "Chiều mai 28. 3h bắt đầu. Hải Phòng Uông bí Hạ long Móng cái Ai đi ib em giá tiện chuyến thôi 0984198077",
      ),
    ).toBe("passenger");
  });

  it("passenger chartering a 4-seater, asking admin for price", () => {
    expect(
      detectPostType(
        "Sáng mai 5H mình cần bao xe bốn chỗ từ hà nội đi hạ long quang ninh  nhờ ad giá với ạ 0988678004",
      ),
    ).toBe("passenger");
  });

  it("passenger asking for convenient trip", () => {
    expect(
      detectPostType(
        "Em chào mn ạ, ngày 04/03 chiều 18h hai vợ chồng em từ May 10 về Cát Bi, HP. Hôm đó các bác có xe nào tiện chuyến không ạ?",
      ),
    ).toBe("passenger");
  });

  it("passenger asking for ride from HN to Uong Bi", () => {
    expect(detectPostType("Mai có xe nào từ HN về Uông Bí ko mn ơi?")).toBe(
      "passenger",
    );
  });

  it("driver offering pickup with Zalo contact", () => {
    expect(
      detectPostType(
        "Có xe ghép từ hải dương về ubi, hạ long, cp bây giờ . Có bác nào về không em đón ❤️❤️❤️Alo, zalo : 0923833834",
      ),
    ).toBe("driver");
  });

  it("passenger needing shared ride from My Dinh", () => {
    expect(
      detectPostType(
        "7h sáng mai 28-2 e cần xe ghép 2 ng từ bến mỹ đình về hạ long",
      ),
    ).toBe("passenger");
  });

  it("passenger asking for available car from Quang Yen", () => {
    expect(
      detectPostType(
        "Mai có bác nào xe trống từ quảng yên ra móng cái từ khung giờ 1 giờ kèm báo giá giúp e.",
      ),
    ).toBe("passenger");
  });

  it("driver advertising empty car from Ha Long", () => {
    expect(
      detectPostType(
        "Sáng chủ Nhật này Nhà em đi xe không từ Hạ Long lên Hưng yên . Ai cần xe Alo 0984176798 . Giá tiện chuyến",
      ),
    ).toBe("driver");
  });

  it("driver with 7-seater looking for passengers from Van Don", () => {
    expect(
      detectPostType(
        "chống nguyên xe 7 từ vân đồn về hưng yên bác nào cần xe tiện chuyến hay ghép về alo e 0966769994@",
      ),
    ).toBe("driver");
  });

  it("passenger asking if any car available from Thai Binh", () => {
    expect(
      detectPostType(
        "Mai có bác nào coa xe trống từ thái bình ra uông bí ib báo giá e ahh",
      ),
    ).toBe("passenger");
  });

  it("passenger needing immediate shared ride in HN", () => {
    expect(
      detectPostType(
        "Mình cần đi xe ghép từ nút giao Tân An đến Đống Đa HN . Cần đi ngay 0969937465",
      ),
    ).toBe("passenger");
  });

  it("passenger asking for one seat on shared ride from Van Don", () => {
    expect(
      detectPostType(
        "Ngày mai mùng 6 tết có xe ghép nào từ vân đồn đi Hải Phòng k ạ,cho e một ghế ghép về hải phòng với ạ",
      ),
    ).toBe("passenger");
  });

  it("driver announcing evening trip from HN", () => {
    expect(
      detectPostType(
        "6-7h tối nay mình có xe từ hà nội về uông bí quảng yên ai cần xe alo e",
      ),
    ).toBe("driver");
  });

  it("passenger looking for 3 seats on a specific route", () => {
    expect(
      detectPostType(
        "Ngày mai 22/2 e muốn ghép 2 ghế cho người lớn và 1 cháu nhỏ 1 tuổi đi từ trung tâm thị xã Quảng Yên đi về Ecopark Văn Giang- Hưng Yên. Bác tài nào chạy tuyến đó alo e với nha. SĐT 0981785438",
      ),
    ).toBe("passenger");
  });

  it("passenger chartering 4-seater HN to Quang Yen", () => {
    expect(detectPostType("Chiều 14/2, cần bao xe 4 chỗ HN- Quảng Yên")).toBe(
      "passenger",
    );
  });

  it("passenger wanting to send package from Quang Yen to HN", () => {
    expect(detectPostType("Mình cần gửi đồ từ quảng yên lên HN ạ")).toBe(
      "passenger",
    );
  });

  it("passenger asking for ride from Thanh Xuan to Cam Pha", () => {
    expect(
      detectPostType(
        "Sáng mai có xe nào từ Thanh Xuân Hà Nội về Cẩm Phả Mông Dương không ạ ? Cmt e ib hoặc cmt sdt hộ e với ạ !!",
      ),
    ).toBe("passenger");
  });

  it("passenger wanting to send banh trung from Gia Lam", () => {
    expect(
      detectPostType(
        "Em ở ocean park 1 gia lâm cần gửi 5c bánh trưng xuống mạo khê - đông triều QN Ai nhận dc ib e ạ",
      ),
    ).toBe("passenger");
  });

  it("driver with empty car inviting co-passengers", () => {
    expect(
      detectPostType(
        "Ngay bây giờ có xe trống từ đông triều về tiên yên đi qua uông bí, hạ long, cẩm phả, vân đồn có bác nào cùng đg góp xăng đi cho vui ko ạ? Sđt 09153003...",
      ),
    ).toBe("driver");
  });

  it("driver offering empty car on Noi Bai to Mong Cai route", () => {
    expect(
      detectPostType(
        "M6 khoảng 21-23h xe 7c không khách lộ trình Nội Bài - Móng cái, đường nào cũng đc tuỳ khách. Ace tiện chuyến/ bao xe 0977516585",
      ),
    ).toBe("driver");
  });

  it("driver with 7-seater from Noi Bai advertising trip", () => {
    expect(
      detectPostType(
        "16h30 mùng 10 âm mình có xe 7 chỗ từ nội bài về hoàng quế bạn nào bắc ninh bắc giang cần xe liên hệ cho mình ạ",
      ),
    ).toBe("driver");
  });

  it("driver announcing Mong Cai to HN route with contact", () => {
    expect(
      detectPostType(
        "Ngày mai mùng 7 (5h-6-h sáng )xe 7 chỗ từ MÓNG CÁI-HÀ NỘI khách bao xe-tiện chuyến Lh:0563233999",
      ),
    ).toBe("driver");
  });

  it("should be driver", () => {
    expect(
      detectPostType(`🚘Nhà Em Có Xe: 4 - 7 Chỗ Chạy Hàng Ngày
💥☎️ - ZaLo : 0981828618 
💥Chạy Liên Tục: Ghép Khách - Bao Xe - Gửi Đồ
💥Phục Vụ Quý Khách - Đưa Đón Tận Nơi 
💥Đội Ngũ Lái Xe Chuyên Nghiệp 
💥Hân Hạnh Được Phục Vụ Quý Khách 
💥Xin Liên Hệ: 0981828618`),
    ).toBe("driver");
  });

  it("should be passenger", () => {
    expect(
      detectPostType(`Hôm nay Có xe ghép nào từ Mai Động HN về Uông Bí k ạ
`),
    ).toBe("passenger");
  });
});
