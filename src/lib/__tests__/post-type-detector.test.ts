import { describe, it, vi, expect } from "vitest";
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
    // [
    //   "Mai có bác nào xe trống từ quảng yên ra móng cái từ khung giờ 1 giờ kèm báo giá giúp e.",
    //   "passenger",
    // ],
    [
      "Sáng chủ Nhật này Nhà em đi xe không từ Hạ Long lên Hưng yên . Ai cần xe Alo 0984176798 . Giá tiện chuyến",
      "driver",
    ],
    [
      "chống nguyên xe 7 từ vân đồn về hưng yên bác nào cần xe tiện chuyến hay ghép về alo e 0966769994@",
      "driver",
    ],
    // [
    //   "Mai có bác nào coa xe trống từ thái bình ra uông bí ib báo giá e ahh",
    //   "passenger",
    // ],
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
      "Ngay bây giờ có xe trống từ đông triều về tiên yên đi qua uông bí, hạ long, cẩm phả, vân đồn có bác nào cùng đg góp xăng đi cho vui ko ạ? Sđt 09153003...",
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
    ["Hôm nay Có xe ghép nào từ Mai Động HN về Uông Bí k ạ", "passenger"],
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
      `em có thùng đồ muốn gửi về đông ngũ - tiên yên - quảng ninh chiều nay ai nhận ko ah`,
      "passenger",
    ],
    [
      `Sáng mai em muốn tìm 1 xe lúc 3h-3h30 sáng đi từ chợ giếng đáy tới ngô quyền hải phòng thì có bên nào nhận không ạ`,
      "passenger",
    ],
    // [
    //   `Mai mình có 1 người đi từ Hạ Long về Chợ Quý kim- Hải Phòng . ( gần nút giao cao tốc 353 ((0925543555))`,
    //   "passenger",
    // ],
    [
      "X5 đang cửa khẩu móng cái rỗng về hp ace cần xe lh 0963987388 e đón ạ",
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
    // [
    //   "Mình gửi đồ từ Hà Phong đi Hà Nội . Ai nhận k ( túi đồ nhỏ)",
    //   "passenger",
    // ],
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
    [
      "Sáng sớm t5 xe em từ HN về HL. Ai đi LH em giá góp xăng.0973603962",
      "driver",
    ],
    [
      `💥💥QUẢNG NINH  🔛   BẮC NINH         💥💥
💥💥QUẢNG NINH  🔛   BẮC GIANG      💥💥
💥💥QUẢNG NINH  🔛   THÁI NGUYÊN 💥💥
 🚐 Di Chuyển Bằng Xe 4 chỗ 7 Chỗ và Limousine 10 chỗ
👉 Vé Ghép 300K đến 500K tuỳ vào điểm đón 👉 Bao Cả Xe 1500K đến 1800K
—————————————————————
🚗Quảng Ninh - Bắc Ninh - Bắc Giang - Thái Nguyên ( và ngược lại )
👉🏻nhận đón trả khách tận nơi
🎁 Nhận Gửi Đồ
☎️ 0921020777   Zalo : 0921.020.777`,
      "driver",
    ],
    [
      "Hôm nay 6/3 mình có xe  tiện chuyến từ quảng ninh, hải phòng đi hà nội và ngược lại.  LH 0962974256",
      "driver",
    ],
    [
      `🇻🇳 𝐗𝐄 𝐆𝐇É𝐏 VĨNH YÊN 🇻🇳TAM ĐẢO
𝐕Ĩ𝐍𝐇 𝐏𝐇Ú𝐂↔️ 𝐍Ộ𝐈 𝐁À𝐈↔️ 𝐇À 𝐍Ộ𝐈↔️ VĨNH PHÚC 

        XE ĐIỆN CHẤT LƯỢNG CAO

☎️ 𝐇𝐨𝐭𝐥𝐢𝐧𝐞 : 0869588495

        📱ZALO 0869588495

💸: 𝟏ng= 𝟐𝟎𝟎𝐤 🔜 𝟐ng= 𝟯𝟓𝟎𝐤 🔜 𝟯ng= 𝟒𝟎𝟎𝐤 ( Đón trả 𝟏 điểm )

✅: Bao xe 5c = 𝟒𝟓𝟎𝐤 - 𝟓𝟎𝟎𝐤 TUỲ Điểm 

🚘: Bao xe 7c = 550k - 700𝐤 TUỲ ĐIỂM

🚙Hà nội - tt tam đảo ghép 350k 1ng -2ng500k 

Bao xe 5c 700k - 7c 800k 

🚚: 𝐒𝐇𝐈𝐏 𝐇À𝐍𝐆 𝐇𝐎Ả 𝐓Ố𝐂- Uy Tín. 𝟏𝟎𝟎𝐤

⏰ : Xe chạy liên tục 𝟯𝟎p/chuyến. 

Từ 𝟰h-𝟐𝟐h hàng ngày

🚕 : 𝐓𝐀𝐗𝐈 đi 𝐧𝐠𝐨𝐚̀𝐢 𝐭𝐢̉𝐧𝐡. 𝟏0k/km

          ☎️ 𝐇𝐨𝐭𝐥𝐢𝐧𝐞 : 0869588495`,
      "driver",
    ],
    [
      `Xe Ghép Hà Nội Hưng Yên Hải Dương Hải Phòng
Xe nhà mình chạy các khung giờ

Hà Nội - Hưng Yên - Hải Dương - Hải Phòng  và ngược lại...........

Nhận ghép xe,bao xe,gửi đồ

Liên hệ trực tiếp: 0911890616`,
      "driver",
    ],
    [
      `Xe Ghép Tiện Chuyến - 088.618.2345 /zalo
- Bao xe từ 900k
- Ghép từ 400k
- Gửi hàng hỏa tốc từ 150k`,
      "driver",
    ],
    [
      `📣📣  Xe Ghép - Tiện Chuyến 4-7 Chỗ
🚌 Xe Du Lịch 9-16-29-35-45 Chỗ, xe bán tải 
🚕 Xe Chạy: 𝗛𝗔̀ 𝗡𝗢̣̂𝗜 - 𝗤𝗨𝗔̉𝗡𝗚 𝗡𝗜𝗡𝗛 - 𝗛𝗔̉𝗜 𝗣𝗛𝗢̀𝗡𝗚- 𝗡𝗢̣̂𝗜 𝗕𝗔̀𝗜 ngược lại và các tỉnh lân cận.
👉 Xe đời mới đều có ở 2 đầu chạy cao tốc
👉 Ghép Ghế - Bao Xe - Gửi Đồ ( Chó, Mèo )
👉 Đón trả tận nơi,Gi.á rẻ tiện chuyến
👉 Đưa đón Sân bay,Bệnh Viện,Thẩm Mỹ
👉 Nhận lịch, Tuor Văn Phòng, Công Ty 
📲 Gọi/ Kết Bạn Zalo : 𝟎𝟗𝟐𝟔.𝟔𝟔𝟐.𝟖𝟖𝟐`,
      "driver",
    ],
    [
      `Tổng đài xe ghép,xe tiện chuyến 5-7 chỗ,nhận gửi hàng Quảng Ninh-Hải Phòng-Hà Nội & ngược lại.Xe chạy liên tục,giá rẻ.LH 0926.662.882☎️`,
      "driver",
    ],
    [
      `e cần tìm xe ghép ít hàng từ Thạch Thất- Hà Nội đến trại Hải Hà-Quảng Ninh, cách li 2 tiếng, ai có xe ib mình: 0987790004`,
      "passenger",
    ],
    [
      `☎️👉LH 0984136985💎0325383536❤️ 🚘👉( ib zalo đặt lịch)
Gọi là có: Xe 5-7 chỗ mới, sạch sẽ

👉 Đón tận nơi ♥️trả tận nhà ♥️ 

ĐÔNG TRIỀU<=> BẮC NINH <=> BẮC GIANG<=>HÀ NỘI<=>HẢI PHÒNG <=>HẠ LONG<=> MÓNG CÁI<=> CÁC TỈNH LN CẬN

🚗 Sẵn đầu xe 5-7 chỗ- 16- bán tải chạy liên tục 2 chiều

Nhận gửi hàng siêu tốc`,
      "driver",
    ],
    [
      `Sáng mai 9h sáng em có xe VF5 từ hạ long về hà nội ạ. Tiện chuyến về mọi người kết nối giúp em nhé`,
      "driver",
    ],
    [
      `Hằng ngày em có xe 5&7&chỗ
ghép, bao xe
Hà Nội ( Hải Phòng 👉  Quảng Ninh ) Quảng Ninh -Hải Phòng 👉 Hà nội ( Nội Bài)Và Liên Tỉnh
Call: 0961980808d`,
      "driver",
    ],
    [
      `XE GHÉP QUẢNG NINH - HÀ NỘI | GIÁ RẺ - ĐÚNG GIỜ

XE VIP ( VF8 SEDONA CANIVAL )

🚗 Chạy hàng ngày - Đưa đón tận nơi - Xe đời mới 🚗

✅ Cẩm Phả - Hà Nội, Sân Bay: 500k - 550k
✅ Hạ Long - Hà Nội: 450k
✅ Uông Bí - Hà Nội: 350k - 400k (tùy điểm)
✅ Mạo Khê, Đông Triều - Hà Nội: 250k - 300k
✅ Sao Đỏ - Hà Nội: 200 - 250k tuỳ điểm
✅ Bắc Ninh - Hà Nội: 200k

📞 Liên hệ đặt xe: 096 4220690 (Gọi/Zalo)
Nhanh chóng - An toàn - Giá cả hợp lý!`,
      "driver",
    ],
    [
      `Trưa hnay 8/3 e có xe 5 chỗ hạ long đi thái bình, giá tiện chuyến 0986808532`,
      "driver",
    ],
    [`Em cần xe 23h tối nay HN về QN 2 người`, "passenger"],
    [`🚛 𝑽𝒂̣̂𝒏 𝑻𝒂̉𝒊 𝑪𝒖̛𝒐̛̀𝒏𝒈 𝑻𝒉𝒊̣𝒏𝒉 🚛
✔️Nhận chở hàng chuyên tuyến : 🌱
𝙃𝒂̀ 𝑵𝙤̣̂𝒊 - 𝑯𝙖̉𝒊 𝑫𝙪̛𝒐̛𝙣𝒈 - 𝑸𝙪𝒂̉𝙣𝒈 𝑵𝙞𝒏𝙝 - 𝙈𝒐́𝙣𝒈 𝑪𝙖́𝒊 📣
* 𝘟𝑒 𝑐𝘩𝑎̣𝘺 đ𝑒̂̀𝘶 𝘤𝑎́𝘤 𝘯𝑔𝘢̀𝑦 🅿️ 𝘹𝑒 𝑔𝘰𝑚 𝑑𝑜̣𝑐 đ𝑢̛𝑜̛̀𝑛𝑔 𝘘𝐿5 ✅ 

📞: 𝟬𝟯𝟱𝟵.𝟬𝟭𝟭.𝟲𝟳𝟴 - 𝟬𝟯𝟵𝟰.𝟭𝟱.𝟲𝟲𝟲𝟲 📲
ʚɞ 𝐴𝘊𝐸 𝑐𝘰́ 𝘩𝑎̀𝘯𝑔 𝑎𝘭𝑜 𝑒𝘮 𝘯ℎ𝘦́ 𝘹𝑒 𝑛𝘩𝑎̀ 𝟐,𝟓-𝟕 𝘵𝑎̂́𝘯 👣
#xetaighep_xeghephang`, "driver"],
    [`9h - 13h. Ngày 8/3  em có xe 7c Tiện chuyến từ  Vân Đồn _ Hạ Long _  Quảng Yên _ Uông Bí _ Đông triều _ Hải Dương _ Bắc Ninh _ Hà Nội - Sân Bay Nội Bài. Mn góp xăng .0398922984`, "driver"],
    [`💥 Đặt xe nhanh 💥 0931.686.682
👉 Quảng Ninh <=> Hải Phòng
👉 Quảng Ninh <=> Hà Nội
👉 Hải Phòng <=> Hà Nội
🚘 Xe 5 chỗ, 7 chỗ chạy tất cả các ngày trong tuần
💥 Bao xe, ghép xe, gửi đồ
✅ Đón trả tận nơi
☎️: 0931.686.682`, 'driver'],
    [`Chiều nay 8/3, tầm 2h có xe 7c trống từ Vân Đồn đi Thái Bình, ai tiện chuyến giá rẻ liên hệ:
☎️0392166940`, 'driver'],
    [`Từ giờ tới 12h có chuyến nào từ nguyễn khuyến hà đông về vân đồn quảng ninh ko ạ e xin sdt với`, 'passenger'],
    [`Chiều mai thứ hai mình có xe gđ 7c trống từ Tb đi uông bí ai đi cùng alo mình đón giá tiện chuyến đt 0359894271`, 'driver'],
    [`Mai ngày 09/03 em có việc nên đi xe rỗng từ Hạ Long - Bắc Ninh và quay ngược về. Có bác nào muốn đi ghép tiện chyến giá rẻ không ạ?`, 'driver'],
    [`14-15h chiều nay cần xe 7 chỗ từ đông triều về quang hanh ai có xe liên hệ nhé ( 0866419568)`, 'passenger'],
    [`Tìm xe chiều nay 8/3 chạy Hạ Long - Hà Nội. 16h00 có mặt ở Hà Nội.`, 'passenger'],
    [`8/3 khung giờ 13h-14h x5 rỗng hl về đôg triều tiện chuyến giá rẻ 0567546888`, 'driver'],
    [`em cần xe đi cửa ông - quảng yên luôn chiều nay. ai đi ib em với ạ`, 'passenger'],
    [`Mai e có xe 5 chỗ từ quảng ninh về sơn la . Ai về cùng e lấy giá tiện chuyến thôi ạ 0326660336`, 'driver'],
    [`Mình cần tìm xe ghép cho 1ng từ Hòn Gai - Kinh Môn trưa hoặc chiều mai ạ`, 'passenger'],
    [`Sáng mai t4 11/3 (6-7h) trống 7 ghế THÁI BÌNH - HP -THUỶ NGUYÊN - UBI 
ai có nhu cầu ib hoặc lh 0359395022`, 'driver'],
    [`ngay bay h có xe từ sản nhi về hải hà đầm hà móng cái giá tiện chuyến bác nào cần ib hoặc gọi số 0981026080 giá tiện chuyến hoặc bao xe`, 'driver'],
    [`21h 
Hải hà - Móng cái
Giá tiện chuyến. Ai đi cùng ib em
0984108077`, 'driver'],
    [`Xe 5c tiện chuyến quảng yên- hạ long ace đi cùng lh 0866538972`, 'driver'],
    [`2h00( 11/3) xe 7c xuất phát vân đồn, cẩm phả,hạ long đi nội bài, trưa quay đầu. Ace cùng đường cần xe  liên hệ 0961619629 ( xe chạy cao tốc)`, 'driver'],
    [`bây giờ đến 13 giờ xe 7 chỗ mc đi bãi cháy 
bác bao xe ghép alo em đón alo 0563233999`, 'driver'],
    [`Xe tiện chuyến móng cái - hải phòng
Ngày nào em cũng móng cái đi  vân đồn - bệnh viện tỉnh - bãi cháy- sản nhi ai có nhu cầu alo em 0335518976  1 tiếng /1 chuyến`, 'driver'],
    [`🚗 𝐇𝐚̀ 𝐍𝐨̣̂𝐢 <=> 𝐇𝐚̉𝐢 𝐏𝐡𝐨̀𝐧𝐠 <=> 𝐇𝐚̣ 𝐋𝐨𝐧𝐠 <=> 𝐌𝐨́𝐧𝐠 𝐂𝐚́𝐢 & 𝐍𝐠𝐮̛𝐨̛̣𝐜 𝐋𝐚̣𝐢
☎️ / zalo :097 7210384 

💁🏻‍♂️ 𝐆𝐢𝐚́ 𝐗𝐞 𝐆𝐡𝐞́𝐩 :

👉 Hạ Long — Hà Nội : 𝟒𝟓𝟎𝐤 

👉 Hà Nội — Hải Phòng : 𝟒𝟎𝟎𝐤 

👉 Hạ Long — Hải Phòng : 𝟐𝟓𝟎𝐤

👉 Hạ Long — Móng Cái : 𝟑𝟓𝟎𝐤

👉 Hà Nội — Móng Cái : 𝟕𝟎𝟎𝐤

👉 Hà Nội — Cẩm Phả : 𝟓𝟎𝟎𝐤 - 𝟔𝟎𝟎𝐤

👉 Hà Nội — Uông Bí , Đông Triều : 𝟑𝟎𝟎𝐤 - 𝟒𝟎𝟎𝐤

💁🏻‍♂️ 𝐆𝐢𝐚́ 𝐁𝐚𝐨 𝐗𝐞 :

👉 Hạ Long — Hà Nội : 𝟏.𝟏𝟎𝟎𝐤 - 𝟏.𝟐𝟎𝟎𝐤

👉 Hà Nội — Hải Phòng : 𝟗𝟎𝟎𝐤 - 𝟏𝐭𝐫

👉 Hạ Long — Hải Phòng : 𝟓𝟎𝟎𝐤 - 𝟔𝟎𝟎𝐤

👉 Hạ Long — Móng Cái : 𝟗𝟎𝟎𝐤 - 𝟏.𝟏𝟎𝟎𝐤

👉 Hà Nội -- Vân Đồn : 𝟏.𝟓𝟎𝟎𝐤 - 𝟏.𝟔𝟎𝟎𝐤

👉 Hà Nội — Móng Cái : 𝟐.𝟐𝟎𝟎𝐤 - 𝟐.𝟑𝟎𝟎𝐤

🚘 𝐗𝐞 đ𝐢 𝐭𝐢̉𝐧𝐡 𝐠𝐢𝐚́ 𝐜𝐚̣𝐧𝐡 𝐭𝐫𝐚𝐧𝐡 𝐬𝐢𝐞̂𝐮 𝐭𝐨̂́𝐭…

👉 Khách đi 2 chiều có thoả thuận và có nhận yêu cầu dòng xe.

👉 Xe chạy full cao tốc. Không phát sinh thêm phí

🚛 Nhận gửi hàng chuyển phát nhanh có Cam kết đảm bảo.

📍Tiêu chí hoạt động của nhà xe: 𝑨𝑵 𝑻𝑶𝑨̀𝑵 - 𝑻𝑨̣̂𝑵 𝑻𝑨̂𝑴 - 𝑵𝑯𝑰𝑬̣̂𝑻 𝑻𝑰̀𝑵𝑯 - 𝑮𝑰𝑨́ 𝑪𝑨̉ 𝑪𝑨̣𝑵𝑯 𝑻𝑹𝑨𝑵𝑯 𝑻𝑰𝑬̂́𝑻 𝑲𝑰𝑬̣̂𝑴

📍Cam kết dàn xe đời mới, sạch sẽ, lái xe có nhiều năm kinh nghiệm.

☎️/ zalo : 097 7210384`, 'driver'],
    [`Sáng nay e có xe tải ghép hàng từ Hà Nội về Hưng Yên -Hải Dương -Hải Phòng Các bác cần gửi ghép hàng gì Alo em Nhé :0927685868 .E sỹ`, 'driver'],
    [`❗ Nhiều khách hỏi: “Sao đi xe này tiện thế?”
Vì đây là xe ghép – xe tiện chuyến, nên:
🚗 Không cần ra bến xe
🚗 Không phải chờ lâu
🚗 Xe đón tận nhà – trả tận nơi
🚗 Đi nhanh – thoải mái hơn xe khách
Chính vì vậy rất nhiều khách đã chuyển sang đi xe ghép thường xuyên.
🔥 Hiện chuyến hôm nay vẫn còn vài chỗ trống
📩 Ai cần đi ghép thì nhắn: 0339619080 ngay để giữ chỗ và nhận nhiều ưu đãi nhé!
#xeghep #tiệnchuyến #hànội #hảiphòng #quangrninh #nhanhchóng`, 'driver'],
    [`Em cần tìm bao xe cho 7 người đi từ Hà Nội xuống Vân Đồn, anh chị cho em xin giá với ạ. Nếu được em đặt 2 chiều cả đi và về ạ`, 'passenger'],
    [`Cần Gửi ít đồ từ Hà Nội đi - Hạ Long`, 'passenger'],
    [`cần tìm xe riêng đưa đón khứ hồi HN- Quảng Ninh trong ngày`, 'passenger'],
    [`Chiều tối mai (13/3). Xe 5 chỗ trống chạy tiện chuyến từ Cẩm Phả về Thái Bình. Ai cần LH: 0334230788`, 'driver'],
    [`Em tìm xe ghép từ Hạ Long lên Hà Nội có nhận cho mang theo mèo ạ`, 'passenger'],
    [`Em cần gửi hàng từ bát tràng về Phường Quang Hanh (phường Cẩm Thủy, TP Cẩm Phả cũ), tỉnh Quảng Ninh 0968193662`, 'passenger'],
    [`Xe tìm khach 11/3
15-18h chiều nay xe 5c tiện chuyến 
Ha long - Hà Nội 
0928766766`, 'driver'],
  ] as const)("%s", async (input, expected) => {
    const actual = await detectPostType(input);
    expect(actual.type).toBe(expected);
    expect(actual.usedLLM).toBe(false);
    expect(actual.fallback).toBe(false);
  });
});
