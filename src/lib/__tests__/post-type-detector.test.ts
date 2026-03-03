import { describe, it, expect } from "vitest";
import { detectPostType } from "../post-type-detector";

describe("detectPostType", () => {
  it.each([
    ["tối mai 28/2 7h e tìm xe ghép từ hạ long về ba chẽ ạ", "passenger"],
    [
      "Mai mình cần bao xe 7 chỗ từ tế tiêu hà nội đi hoành bồ hạ long quảng ninh trong khung giờ 13h có bác tài nào tiên chuyến Lh 0974597941",
      "passenger",
    ],
    [
      "🚘Xe 5-7 chỗ tìm khách ghép - bao xe Sân Bay- Cẩm Phả - Hạ Long - Móng Cái - Vân Đồn - Hà nội-Hải Phòng\nNhận gửi hàng giá từ 150k ☎️LH 0387876966",
      "driver",
    ],
    [
      "Xe Ghép Xe Tiện Chuyến Hà Nội - Hải Phòng -Quảng Ninh HOTLINE 0378749434",
      "driver",
    ],
    [
      "🚗 𝑿𝒆 𝒈𝒉𝒆́𝒑, 𝒕𝒊𝒆̣̂𝒏 𝒄𝒉𝒖𝒚𝒆̂́𝒏 24/7 𝑯𝒆̣̂ 𝒕𝒉𝒐̂́𝒏𝒈 𝒙𝒆 𝒈𝒉𝒆́𝒑 5–7 𝒄𝒉𝒐̂̃, 𝒙𝒆 𝒅𝒖 𝒍𝒊̣𝒄𝒉 9–16 𝒄𝒉𝒐̂̃ ☎️ Zalo: 𝟎𝟗𝟑𝟔.𝟗𝟑𝟑.𝟔𝟖𝟕 📍 Tuyến Hà Nội - Hải Phòng - Quảng Ninh & các tỉnh 🛫 Đưa đón sân bay 📦 Gửi hàng nhanh 🏝️ Xe du lịch - đi lễ - công tác 📌 𝐶𝑎̂̀𝑛 đ𝑖 𝑔𝑎̂́𝑝 𝑔𝑜̣𝑖 𝑛𝑔𝑎𝑦! 𝐶𝑎̂̀𝑛 đ𝑎̣̆𝑡 𝑙𝑖̣𝑐ℎ 𝑏𝑎́𝑜 𝑡𝑟𝑢̛𝑜̛́𝑐 đ𝑒̂̉ 𝑔𝑖𝑢̛̃ 𝑥𝑒! #xeghephaiphong #xegheptienchuyen #xeghephanoiquangninh #xeghephanoi #xeghephanoihalong #xeghephanoihalong",
      "driver",
    ],
    [
      "Sáng mai 8h30-9h Móng cái Hải hà Đầm hà Tiên Yên- hạ long Hải Phòng Ai cần đi chuyển ib em ghép cho. Giá tốt 0984108077",
      "driver",
    ],
    [
      "Chủ nhật có xe ghép nào đi từ Cẩm Phả, Hạ Long đi Yên Tử không ạ? E có 2 ng cần tìm xe ghép.",
      "passenger",
    ],
    [
      "Chiều mai 28. 3h bắt đầu. Hải Phòng Uông bí Hạ long Móng cái Ai đi ib em giá tiện chuyến thôi 0984198077",
      "passenger",
    ],
    [
      "Sáng mai 5H mình cần bao xe bốn chỗ từ hà nội đi hạ long quang ninh  nhờ ad giá với ạ 0988678004",
      "passenger",
    ],
    [
      "Em chào mn ạ, ngày 04/03 chiều 18h hai vợ chồng em từ May 10 về Cát Bi, HP. Hôm đó các bác có xe nào tiện chuyến không ạ?",
      "passenger",
    ],
    ["Mai có xe nào từ HN về Uông Bí ko mn ơi?", "passenger"],
    [
      "Có xe ghép từ hải dương về ubi, hạ long, cp bây giờ . Có bác nào về không em đón ❤️❤️❤️Alo, zalo : 0923833834",
      "driver",
    ],
    [
      "7h sáng mai 28-2 e cần xe ghép 2 ng từ bến mỹ đình về hạ long",
      "passenger",
    ],
    [
      "Mai có bác nào xe trống từ quảng yên ra móng cái từ khung giờ 1 giờ kèm báo giá giúp e.",
      "passenger",
    ],
    [
      "Sáng chủ Nhật này Nhà em đi xe không từ Hạ Long lên Hưng yên . Ai cần xe Alo 0984176798 . Giá tiện chuyến",
      "driver",
    ],
    [
      "chống nguyên xe 7 từ vân đồn về hưng yên bác nào cần xe tiện chuyến hay ghép về alo e 0966769994@",
      "driver",
    ],
    [
      "Mai có bác nào coa xe trống từ thái bình ra uông bí ib báo giá e ahh",
      "passenger",
    ],
    [
      "Mình cần đi xe ghép từ nút giao Tân An đến Đống Đa HN . Cần đi ngay 0969937465",
      "passenger",
    ],
    [
      "Ngày mai mùng 6 tết có xe ghép nào từ vân đồn đi Hải Phòng k ạ,cho e một ghế ghép về hải phòng với ạ",
      "passenger",
    ],
    [
      "6-7h tối nay mình có xe từ hà nội về uông bí quảng yên ai cần xe alo e",
      "driver",
    ],
    [
      "Ngày mai 22/2 e muốn ghép 2 ghế cho người lớn và 1 cháu nhỏ 1 tuổi đi từ trung tâm thị xã Quảng Yên đi về Ecopark Văn Giang- Hưng Yên. Bác tài nào chạy tuyến đó alo e với nha. SĐT 0981785438",
      "passenger",
    ],
    ["Chiều 14/2, cần bao xe 4 chỗ HN- Quảng Yên", "passenger"],
    ["Mình cần gửi đồ từ quảng yên lên HN ạ", "passenger"],
    [
      "Sáng mai có xe nào từ Thanh Xuân Hà Nội về Cẩm Phả Mông Dương không ạ ? Cmt e ib hoặc cmt sdt hộ e với ạ !!",
      "passenger",
    ],
    [
      "Em ở ocean park 1 gia lâm cần gửi 5c bánh trưng xuống mạo khê - đông triều QN Ai nhận dc ib e ạ",
      "passenger",
    ],
    [
      "Ngay bây giờ có xe trống từ đông triều về tiên yên đi qua uông bí, hạ long, cẩm phả, vân đồn có bác nào cùng đg góp xăng đi cho vui ko ạ? Sđt 09153003...",
      "driver",
    ],
    [
      "M6 khoảng 21-23h xe 7c không khách lộ trình Nội Bài - Móng cái, đường nào cũng đc tuỳ khách. Ace tiện chuyến/ bao xe 0977516585",
      "driver",
    ],
    [
      "16h30 mùng 10 âm mình có xe 7 chỗ từ nội bài về hoàng quế bạn nào bắc ninh bắc giang cần xe liên hệ cho mình ạ",
      "driver",
    ],
    [
      "Ngày mai mùng 7 (5h-6-h sáng )xe 7 chỗ từ MÓNG CÁI-HÀ NỘI khách bao xe-tiện chuyến Lh:0563233999",
      "driver",
    ],
    [
      "🚘Nhà Em Có Xe: 4 - 7 Chỗ Chạy Hàng Ngày\n💥☎️ - ZaLo : 0981828618 \n💥Chạy Liên Tục: Ghép Khách - Bao Xe - Gửi Đồ\n💥Phục Vụ Quý Khách - Đưa Đón Tận Nơi \n💥Đội Ngũ Lái Xe Chuyên Nghiệp \n💥Hân Hạnh Được Phục Vụ Quý Khách \n💥Xin Liên Hệ: 0981828618",
      "driver",
    ],
    ["Hôm nay Có xe ghép nào từ Mai Động HN về Uông Bí k ạ\n", "passenger"],
    [
      "Sáng mai xe em 5c tầm 9h e lên hà nội có bác nào ghép cùng không",
      "driver",
    ],
    [
      "Cần 01 chuyến xe ghép 2 khách đón tại hạ long về hà nội lúc 22h30 tối 28/2. Inbox",
      "passenger",
    ],
    [
      "Có nhà xe nào từ khu công nghiệp đông mai lên Hà Nội không ạ ! Chuyến càng sớm càng tốt",
      "passenger",
    ],
    ["Cần 2 vé về từ ĐH Quốc Gia về Lập Lệ KCN Thuỷ Nguyên HP", "passenger"],
    [
      "Đêm nay vf6 từ Hạ Long đi Hà Nội có bác nào đi cùng không giá hạt dổi",
      "driver",
    ],
    [
      "Sáng mai xe em 5c tầm 9h e lên hà nội có bác nào ghép cùng không ",
      "driver",
    ],
    [
      "Cần 01 chuyến xe ghép 2 khách đón tại hạ long về hà nội lúc 22h30 tối 28/2. Inbox.",
      "passenger",
    ],
    [
      "Em 1 người cần 1 slot ghép từ UB về mỹ đình Hn ạ, giá 200k đc k ạ",
      "passenger",
    ],
    [
      `em có thùng đồ muốn gửi về 
đông ngũ - tiên yên - quảng ninh
chiều nay ai nhận ko ah`,
      "passenger",
    ],
    [
      `Mình đi quảng ninh còn chỗ ai về quảng ninh thì gọi cho mình nhé mình ở hà đông hà nội  đi luôn hôm nay 0988991913`,
      "passenger",
    ],
    [
      `Sáng mai em muốn tìm 1 xe lúc 3h-3h30 sáng đi từ chợ giếng đáy tới ngô quyền hải phòng thì có bên nào nhận không ạ`,
      "passenger",
    ],
    [
      `Mai mình có 1 người đi từ Hạ Long về Chợ Quý kim- Hải Phòng . ( gần nút giao cao tốc 353 ((0925543555))`,
      "passenger",
    ],
    [
      "X5 đang cửa khẩu móng cái rỗng về hp ace cần xe lh 0963987388 e đón ạ",
      "passenger",
    ],
    [
      "Hôm nay 18-19hxe 7chỗ Móng Cái- hải ha-đầm hả -Hạ long-sản nhi- Uông bí Ai cần bao xe tiện chuyến góp xăng cũng OK ib em hoặc 0984108077",
      "driver",
    ],
    [
      "Xe ghép 5-7c chạy hàng ngày các tỉnh HP-TB-NĐ-NBinh-HNam nhận gửi đồ giá rẻ.khách cần xe lh 0586776777",
      "driver",
    ],
    [
      "Bao xe giá rẻ đưa đón tận nơi🥰🥰🥰🥰TP Bắc Ninh <> Bắc Giang <> Hải Dương <> Hải Phòng <> Quảng Ninh🚕🚕🚕 xe chạy 24/24 alo là có mặt 🚕🚕🚕📱📱📱  Alo - ib - zalo 0913330151  📱📱📱Nhận thông tin chuyến đi giá xe bao xe ghép xe",
      "driver",
    ],
    [
      "Cần chuyển tài liệu từ đường Amata KCN Sông Khoai Hiệp Hoà về Lê Văn Lương Hà Nội Chuyển gấp báo phí giúp mk ạ",
      "passenger",
    ],
    [
      "Mình gửi đồ từ Hà Phong đi Hà Nội . Ai nhận k ( túi đồ nhỏ)",
      "passenger",
    ],
    [
      "23h mình có xe quay đầu từ Hp-hl giá tiện chuyến. Sdt bác tài 0398582223",
      "driver",
    ],
    [
      "🆘🆘 Mai 11h - 13h em có xe 7 chỗ trống trở gió từ Tiên Yên - Hạ Long - Uông Bí - Bắc Ninh - Hà Nội , ace nào cần xe tiện chuyến , bao xe ghép ghế alo em đón ạ 🚘🚗🚗🚗🚗",
      "driver",
    ],
    [
      "Hàng ngày bên em vẫn có xe 5&7 chỗ chạy Hạ Long đi  Hải phòng, Hà Nội và ngược lại. Nhận bao xe, ghép xe, gửi đồ giá rẻ.",
      "driver",
    ],
    ["mưa gió mọi người cần xe thì alo cho e nhaaa ☎️0349751489📲", "driver"],
    [
      "KÍNH CHÀO QUÝ KHÁCH Mời quý khách liên hệ đt #và zalo# ☎️ 0866.953.359 🚗 hàng ngày xe 5-7 chỗ nhận ghép khách-bao xe và gửi đồ hoả tốc uy tín đón trả tận nơi hai đầu",
      "driver",
    ],
    [
      "Xe tim khách ghép Xe ghép chuyên nghiệp uy tín Các bác cần xe thì ới em nha ☎️zalo/ sdt đặt xe nhanh 092.1508.555",
      "driver",
    ],
    [
      "Chiều mai 16-17h ngày 4/3 xe mình trống 4 ghế từ Hải phòng đi Hà Nội . Mn ai có cần xe cùng tuyến đường lh 0898472888 nhé . Giá yêu thương",
      "driver",
    ],
    [
      "Hàng ngày nhà xe vẫn có xe 5 chỗ & 7 chỗ tiện chuyến: Hà Nội-Thái Bình - Hải Phòng - Quảng Ninh.  Các bác cần cứ liên hệ đặt xe sớm ạ.  Rất vui phục vụ các bác: 0865322662-0865292662",
      "driver",
    ],
  ] as const)("%s", (input, expected) => {
    expect(detectPostType(input)).toBe(expected);
  });
});
