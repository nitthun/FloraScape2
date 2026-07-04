/**
 * FloraScape - Learning Mode (ระบบการเรียนรู้)
 * คลิกดอกไม้ → popup ขยายดอกไม้ → คลิกส่วนต่างๆ เพื่อดูชื่อและคำอธิบาย
 */

const FLOWER_INFO = {
    daisy: {
        name: 'เดซี่ (Daisy)',
        nameLatin: 'Bellis perennis',
        description: 'ดอกไม้สัญลักษณ์แห่งความบริสุทธิ์และความร่าเริง มีถิ่นกำเนิดในยุโรป',
        parts: {
            petals:  { th: 'กลีบดอก (Petals)', desc: 'กลีบขาวแผ่ออกรอบจาน ทำหน้าที่ดึงดูดแมลงผสมเกสร มีกลีบ 15–30 กลีบ' },
            center:  { th: 'จานกลาง (Disc Florets)', desc: 'ส่วนกลางสีเหลืองประกอบด้วยดอกย่อยนับร้อยดอก เป็นที่อยู่ของเกสรตัวผู้และตัวเมีย' },
            stem:    { th: 'ก้านดอก (Stem / Peduncle)', desc: 'ลำต้นกลวงเล็กๆ ลำเลียงน้ำและสารอาหารจากรากสู่ดอก' },
            leaf:    { th: 'ใบ (Leaf)', desc: 'ใบรูปช้อนเล็กๆ มีขนอ่อนๆ ทำหน้าที่สังเคราะห์แสงเพื่อผลิตพลังงาน' },
        }
    },
    tulip: {
        name: 'ทิวลิป (Tulip)',
        nameLatin: 'Tulipa gesneriana',
        description: 'ดอกไม้สัญลักษณ์ของเนเธอร์แลนด์ มีต้นกำเนิดในเอเชียกลาง มีมากกว่า 3,000 พันธุ์',
        parts: {
            petals:    { th: 'กลีบดอก (Tepals)', desc: 'ทิวลิปมี 6 กลีบ (3+3) ไม่แยกกลีบเลี้ยงออกชัดเจน เรียกว่า Tepal ห่อหุ้มอวัยวะสืบพันธุ์' },
            petalsDark:{ th: 'โคนกลีบ (Petal Base)', desc: 'ส่วนในสุดของกลีบมักมีสีต่างออกไป เป็นเส้นทางนำแมลงไปยังน้ำหวาน' },
            stem:      { th: 'ก้านช่อดอก (Scape)', desc: 'ก้านตั้งตรงแข็งแรง ยาว 10–70 ซม. ค้ำยันดอกขนาดใหญ่ให้ตั้งตรง' },
            leaf:      { th: 'ใบ (Leaf)', desc: 'ใบรูปหอกยาวสีเขียวอมน้ำเงิน มีไขเคลือบผิวเพื่อกันน้ำ' },
        }
    },
    rose: {
        name: 'กุหลาบ (Rose)',
        nameLatin: 'Rosa spp.',
        description: 'ราชินีแห่งดอกไม้ สัญลักษณ์แห่งความรัก มีมากกว่า 150 สายพันธุ์ทั่วโลก',
        parts: {
            petals:      { th: 'กลีบดอก (Petals)', desc: 'กลีบนุ่มซ้อนเหลื่อมกันเป็นชั้นๆ สร้างรูปทรงที่สวยงาม มีน้ำมันหอมระเหยในเซลล์' },
            petalsDark:  { th: 'กลีบชั้นนอก (Outer Petals)', desc: 'กลีบชั้นแรกมักมีสีเข้มกว่าเพื่อดึงดูดสายตาแมลงจากระยะไกล' },
            petalsLight: { th: 'กลีบชั้นใน (Inner Petals)', desc: 'กลีบชั้นในสีอ่อนกว่า ปกป้องเกสรตรงกลางจากแสงและฝน' },
            stem:        { th: 'ก้าน + หนาม (Stem & Thorns)', desc: 'หนามกุหลาบช่วยป้องกันสัตว์กินพืช ไม่ใช่กิ่งจริงๆ แต่เป็นส่วนนูนของเปลือก' },
            leaf:        { th: 'ใบ (Compound Leaf)', desc: 'ใบประกอบด้วยใบย่อย 5–7 ใบ ขอบใบหยัก มีต่อมน้ำมันหอมที่ผิวใบด้านล่าง' },
        }
    },
    sunflower: {
        name: 'ทานตะวัน (Sunflower)',
        nameLatin: 'Helianthus annuus',
        description: 'หันหน้าตามดวงอาทิตย์ (Heliotropism) เมล็ดอุดมด้วยน้ำมันและวิตามิน E',
        parts: {
            petals:     { th: 'กลีบรังสี (Ray Florets)', desc: 'กลีบสีเหลืองยาวๆ รอบนอก ไม่มีอวัยวะสืบพันธุ์ ทำหน้าที่ดึงดูดแมลงโดยเฉพาะ' },
            center:     { th: 'จาน (Disc Florets)', desc: 'ประกอบด้วยดอกย่อยนับพัน เรียงตามลำดับ Fibonacci Spiral เพื่อความหนาแน่นสูงสุด' },
            centerEdge: { th: 'ขอบจาน (Edge Ring)', desc: 'ดอกย่อยที่ขอบจะบานก่อนเพื่อดึงดูดแมลงเป็นระลอก ก่อนส่งต่อไปยังใจกลาง' },
            stem:       { th: 'ลำต้น (Stem)', desc: 'ลำต้นแข็งแรงสูง 1–3 เมตร มีขนแข็งปกคลุม บางพันธุ์ลำต้นเดี่ยว บางพันธุ์แตกแขนง' },
            leaf:       { th: 'ใบ (Leaf)', desc: 'ใบขนาดใหญ่รูปหัวใจถึงสามเหลี่ยม ผิวขรุขระมีขน รับแสงสังเคราะห์ได้มาก' },
        }
    },
    lavender: {
        name: 'ลาเวนเดอร์ (Lavender)',
        nameLatin: 'Lavandula angustifolia',
        description: 'สมุนไพรหอมจากทะเลเมดิเตอร์เรเนียน ช่วยผ่อนคลายและไล่แมลงได้',
        parts: {
            petals:      { th: 'ดอกย่อย (Florets)', desc: 'ดอกย่อยสีม่วงเล็กๆ เรียงเป็นชั้นรอบก้านตรงๆ บานจากล่างขึ้นบน' },
            petalsDark:  { th: 'กลีบเลี้ยง (Calyx)', desc: 'กลีบเลี้ยงสีม่วงเข้มปกป้องดอกย่อย ยังคงสีสวยแม้ดอกร่วงแล้ว' },
            petalsLight: { th: 'ปลายดอก (Tip Florets)', desc: 'ดอกที่ปลายช่อบานทีหลังสุด มีความหอมสูงที่สุดเนื่องจากได้รับแสงเต็มที่' },
            stem:        { th: 'ก้านช่อ (Stem)', desc: 'ก้านสี่เหลี่ยมแข็ง เป็นลักษณะเด่นของพืชวงศ์ Lamiaceae มีน้ำมันหอมระเหย' },
            leaf:        { th: 'ใบเข็ม (Needle Leaves)', desc: 'ใบเรียวยาวสีเขียวอมเงิน มีขนเงินช่วยสะท้อนแสงและลดการคายน้ำ' },
        }
    },
    lily: {
        name: 'ลิลลี่ (Lily)',
        nameLatin: 'Lilium spp.',
        description: 'สัญลักษณ์แห่งความบริสุทธิ์และการฟื้นฟู มีมากกว่า 100 สายพันธุ์ในเอเชียและยุโรป',
        parts: {
            petals:    { th: 'กลีบดอก (Tepals)', desc: 'ลิลลี่มี 6 กลีบแผ่บานคว่ำลงอย่างสง่างาม ผิวนุ่มเป็นมันและมักมีลายจุด' },
            petalsDark:{ th: 'เส้นกลีบ (Midrib)', desc: 'เส้นกลางกลีบช่วยส่งน้ำเลี้ยงและเป็นร่องนำแมลงเข้าหาเกสร' },
            center:    { th: 'อับเรณู (Anther)', desc: 'อับเรณูสีส้มหรือน้ำตาลแดงที่ปลายเกสรตัวผู้ บรรจุละอองเกสรสีสดเพื่อให้แมลงพา' },
            stem:      { th: 'ก้าน (Stem)', desc: 'ก้านตรงแข็งแรงยาว 60–150 ซม. ออกดอกได้ 2–32 ดอกต่อก้าน' },
            leaf:      { th: 'ใบ (Lanceolate Leaf)', desc: 'ใบรูปหอกเรียวยาว เรียงสลับรอบก้าน ไม่มีก้านใบ ดูดซับแสงแดดได้ทุกทิศ' },
        }
    },
    orchid: {
        name: 'กล้วยไม้ (Orchid)',
        nameLatin: 'Orchidaceae (family)',
        description: 'วงศ์พืชดอกที่ใหญ่ที่สุด มีมากกว่า 28,000 สายพันธุ์ วิวัฒนาการร่วมกับแมลงเฉพาะชนิด',
        parts: {
            petals:      { th: 'กลีบปีก (Lateral Petals)', desc: 'กลีบปีก 2 กลีบแผ่ออกคล้ายปีกผีเสื้อ ดึงดูดแมลงให้เข้าใกล้ดอก' },
            petalsDark:  { th: 'กลีบเลี้ยง (Sepals)', desc: 'กลีบเลี้ยง 3 กลีบสลับกับกลีบดอก มักสีสันสวยงามเหมือนกลีบดอก' },
            center:      { th: 'กลีบปาก (Labellum/Lip)', desc: 'กลีบปากพิเศษที่ไม่เหมือนกลีบอื่น ทำหน้าที่เป็นแท่นลงจอดของแมลงและนำทางสู่เกสร' },
            stem:        { th: 'ก้านดอก (Scape)', desc: 'ก้านช่อดอกยาวออกจากโคนต้น ดอกเรียงสวยบนก้านเดียวกัน บางพันธุ์มี 30+ ดอก' },
            leaf:        { th: 'ใบ (Leaf)', desc: 'ใบหนาอวบน้ำ ช่วยกักเก็บน้ำในฤดูแล้ง ผิวมันสะท้อนแสงเพื่อป้องกันความร้อน' },
        }
    },
    cosmos: {
        name: 'คอสมอส (Cosmos)',
        nameLatin: 'Cosmos bipinnatus',
        description: 'ดอกไม้แห่งฤดูร้อน ชอบแดดจัด ทนทาน โตเร็ว สัญลักษณ์ของความสุขและความเรียบง่าย',
        parts: {
            petals: { th: 'กลีบรังสี (Ray Petals)', desc: 'กลีบบางเรียว 8 กลีบ ปลายกลีบมีรอยหยักเล็กน้อย ไหวพริ้วในลมอย่างอ่อนช้อย' },
            center: { th: 'จานกลาง (Disc Center)', desc: 'ประกอบด้วยดอกย่อยขนาดเล็กสีเหลืองหรือส้ม บรรจุเกสรตัวผู้และตัวเมียในดอกเดียวกัน' },
            stem:   { th: 'ก้านเรียว (Thin Stem)', desc: 'ก้านเรียวบางยาวสูง 60–180 ซม. ไหวตามลมได้มาก เพิ่มโอกาสผสมเกสรโดยลม' },
            leaf:   { th: 'ใบขนนก (Pinnate Leaf)', desc: 'ใบแตกแขนงคล้ายขนนก ใบย่อยเรียวเล็ก ช่วยลดแรงต้านลมให้ก้านยืนได้นาน' },
        }
    },
    hydrangea: { name: 'ไฮเดรนเยีย (Hydrangea)', description: 'ดอกไม้แห่งฤดูฝน สีดอกเปลี่ยนตามความเป็นกรดด่างของดิน', parts: { petals: { th: 'กลีบดอกประดับ', desc: 'ส่วนที่เห็นเป็นสีสันคือใบประดับ ไม่ใช่กลีบดอกแท้' }, stem: { th: 'ลำต้น', desc: 'ลำต้นอวบน้ำและแตกกิ่งก้านเป็นพุ่ม' } } },
    marigold: { name: 'ดาวเรือง (Marigold)', description: 'ดอกไม้สีเหลืองทองสว่างไสว เชื่อว่านำโชคลาภ', parts: { petals: { th: 'กลีบดอกซ้อน', desc: 'กลีบดอกอัดแน่นเป็นก้อนกลมฟู' }, stem: { th: 'ลำต้น', desc: 'ลำต้นแข็งแรง ทนแดดได้ดีเยี่ยม' } } },
    sakura: { name: 'ซากุระ (Sakura/Cherry Blossom)', description: 'ดอกไม้ประจำชาติญี่ปุ่น สัญลักษณ์ของความงดงามและอายุขัยที่สั้น', parts: { petals: { th: 'กลีบดอก 5 กลีบ', desc: 'กลีบสีชมพูอ่อนบางเบา ร่วงหล่นตามสายลม' }, center: { th: 'เกสร', desc: 'เกสรสีแดงเข้มโดดเด่นตัดกับสีกลีบ' } } },
    lotus: { name: 'บัวหลวง (Lotus)', description: 'ราชินีแห่งไม้น้ำ สัญลักษณ์ของความบริสุทธิ์ในพระพุทธศาสนา', parts: { petals: { th: 'กลีบดอกขนาดใหญ่', desc: 'กลีบเรียงซ้อนกัน เคลือบด้วยแว็กซ์กันน้ำ' }, stem: { th: 'ก้านบัว', desc: 'ก้านชูพ้นน้ำ ภายในมีรูกลวงเพื่อหายใจ' } } },
    dandelion: { name: 'แดนดิไลออน (Dandelion)', description: 'ดอกไม้แห่งความหวัง เมื่อแก่เกสรจะเป็นปุยขาวปลิวตามลม', parts: { petals: { th: 'ปุยเกสร (Pappus)', desc: 'ส่วนปุยขนที่ช่วยพยุงเมล็ดให้ลอยไปตามลมได้ไกล' }, center: { th: 'เมล็ด', desc: 'เมล็ดเล็กๆ ที่พร้อมจะเติบโตในที่ใหม่' } } },
    bluebell: { name: 'บลูเบล (Bluebell)', description: 'ดอกไม้ป่ารูประฆัง มักบานพร้อมกันเป็นพรมสีน้ำเงินในป่าดิบชื้น', parts: { petals: { th: 'รูประฆัง (Bell)', desc: 'กลีบดอกหลอมรวมกันเป็นรูประฆังคว่ำ' }, stem: { th: 'ก้านโค้ง', desc: 'ก้านดอกโค้งงอลงด้านล่างอย่างอ่อนช้อย' } } },
    hibiscus: { name: 'ชบา (Hibiscus)', description: 'ดอกไม้เขตร้อนสีสันสดใส บานเต็มที่เพื่อรับแสงอาทิตย์', parts: { petals: { th: 'กลีบดอกใหญ่', desc: 'กลีบดอกบางและกว้าง มีสีสันฉูดฉาด' }, center: { th: 'หลอดเกสร', desc: 'เกสรตัวผู้และตัวเมียยื่นยาวออกมาเป็นหลอดเด่นชัด' } } },
    peony: { name: 'โบตั๋น (Peony)', description: 'ดอกไม้แห่งความมั่งคั่งและเกียรติยศ ดอกใหญ่และกลิ่นหอม', parts: { petals: { th: 'กลีบซ้อนหนา', desc: 'กลีบดอกซ้อนกันหลายชั้นดูหรูหรา' }, stem: { th: 'ก้านแข็งแรง', desc: 'ต้องแข็งแรงเพื่อรองรับน้ำหนักของดอกที่ใหญ่' } } },
    daffodil: { name: 'แดฟโฟดิล (Daffodil)', description: 'ดอกไม้สัญลักษณ์ของการเริ่มต้นใหม่และฤดูใบไม้ผลิ', parts: { petals: { th: 'กลีบรอง', desc: 'กลีบ 6 กลีบแผ่ออกเป็นแฉก' }, center: { th: 'มงกุฎดอก (Corona)', desc: 'ส่วนกลางยื่นออกมาคล้ายถ้วยหรือแตร' } } },
    carnation: { name: 'คาร์เนชั่น (Carnation)', description: 'ดอกไม้แห่งความรักและความหลงใหล กลีบดอกมีรอยหยัก', parts: { petals: { th: 'กลีบหยัก (Frilled Petals)', desc: 'กลีบซ้อนกันหนาแน่น ขอบกลีบมีรอยหยักเหมือนถูกตัด' }, stem: { th: 'ก้านเป็นข้อ', desc: 'ก้านดอกมีข้อปล้องชัดเจน' } } },
    morning_glory: { name: 'มอร์นิ่งกลอรี่ (Morning Glory)', description: 'ดอกผักบุ้งฝรั่ง บานรับแสงแดดยามเช้าและหุบในตอนบ่าย', parts: { petals: { th: 'ดอกรูปแตร', desc: 'กลีบดอกเชื่อมติดกันเป็นรูปแตรแผ่บาน' }, center: { th: 'ใจกลางสีสว่าง', desc: 'มักมีสีขาวหรือสีเหลืองเพื่อนำทางแมลง' } } },
    iris: { name: 'ไอริส (Iris)', description: 'ตั้งชื่อตามเทพีแห่งสายรุ้ง ดอกมีเอกลักษณ์ไม่เหมือนใคร', parts: { petals: { th: 'กลีบตกและกลีบตั้ง', desc: 'มีกลีบที่ตกลงมา (Falls) และกลีบที่ตั้งขึ้น (Standards)' }, center: { th: 'หนวด (Beard)', desc: 'แถบขนเล็กๆ บนกลีบตกเพื่อนำทางแมลง' } } },
    chrysanthemum: { name: 'เบญจมาศ (Chrysanthemum)', description: 'ดอกไม้แห่งฤดูใบไม้ร่วง มีความทนทานและอยู่ได้นาน', parts: { petals: { th: 'กลีบฝอย', desc: 'มีกลีบเรียวยาวเรียงซ้อนกันจำนวนมาก' }, stem: { th: 'ก้านดอกทนทาน', desc: 'ก้านแข็งและทนต่อสภาพอากาศเย็น' } } },
    poinsettia: { name: 'พอยน์เซตเทีย (Poinsettia)', description: 'ต้นคริสต์มาส ส่วนที่เห็นเป็นสีแดงคือใบประดับไม่ใช่ดอก', parts: { petals: { th: 'ใบประดับ (Bracts)', desc: 'ใบที่เปลี่ยนสีเป็นสีแดงเพื่อดึงดูดแมลง' }, center: { th: 'ดอกแท้ (Cyathia)', desc: 'ดอกที่แท้จริงมีขนาดเล็กสีเหลืองอยู่ตรงกลาง' } } },
    water_lily: { name: 'บัวสาย (Water Lily)', description: 'ดอกไม้แห่งสระน้ำ บานในเวลากลางวันและหุบในเวลากลางคืน', parts: { petals: { th: 'กลีบแหลม', desc: 'กลีบเรียวยาวเรียงซ้อนกันเป็นชั้นๆ บนผิวน้ำ' }, leaf: { th: 'ใบบัว', desc: 'ใบแบนราบลอยอยู่บนผิวน้ำ (Lily pad)' } } },
    poppy: { name: 'ป๊อปปี้ (Poppy)', description: 'ดอกไม้แห่งความทรงจำ กลีบดอกบางเบาคล้ายกระดาษสา', parts: { petals: { th: 'กลีบบอบบาง', desc: 'กลีบดอกบางและยับย่นเหมือนกระดาษ' }, center: { th: 'รังไข่สีเข้ม', desc: 'ส่วนกลางสีดำหรือเข้มโดดเด่น' } } },
    violet: { name: 'ไวโอเล็ต (Violet)', description: 'ดอกไม้ขนาดเล็กสีม่วงสดใส มักซ่อนตัวอยู่ตามพงหญ้า', parts: { petals: { th: 'กลีบรูปหัวใจ', desc: 'มี 5 กลีบ กลีบล่างสุดมักมีลวดลายนำทางแมลง' }, stem: { th: 'ก้านเล็กจิ๋ว', desc: 'ก้านดอกสั้นและบอบบาง' } } },
    zinnia: { name: 'บานชื่น (Zinnia)', description: 'ดอกไม้ปลูกง่าย โตเร็ว สีสันสดใสและทนความร้อนได้ดี', parts: { petals: { th: 'กลีบซ้อน', desc: 'กลีบดอกแข็งและเรียงซ้อนเป็นชั้นๆ' }, center: { th: 'ดอกย่อยกลาง', desc: 'เกสรตรงกลางมีลักษณะเป็นดอกย่อยเล็กๆ' } } },
    pansy: { name: 'แพนซี่ (Pansy)', description: 'ดอกไม้หน้าแมว ลวดลายบนกลีบดูคล้ายใบหน้าคนหรือสัตว์', parts: { petals: { th: 'กลีบ 5 กลีบ', desc: 'กลีบดอกซ้อนทับกันพร้อมลวดลายแต้มสีเข้มตรงกลาง' }, stem: { th: 'ลำต้นเตี้ย', desc: 'พุ่มเตี้ยเหมาะสำหรับคลุมดิน' } } },
    snapdragon: { name: 'สแนปดราก้อน (Snapdragon)', description: 'ดอกไม้รูปปากมังกร เมื่อบีบด้านข้าง ดอกจะอ้าออกเหมือนปาก', parts: { petals: { th: 'ดอกรูปปาก (Bilabiate)', desc: 'แบ่งเป็นกลีบบนและกลีบล่างซ้อนกันแน่นหนา' }, stem: { th: 'ช่อดอกแนวตั้ง', desc: 'ดอกบานไล่จากล่างขึ้นบนตามก้านช่อ' } } },
    aster: { name: 'แอสเตอร์ (Aster)', description: 'ดอกไม้รูปดาว (Aster = Star) สีสันสดใสบานสะพรั่งในช่วงปลายปี', parts: { petals: { th: 'กลีบเส้นเล็ก', desc: 'กลีบดอกเรียวเล็กเรียงตัวรอบจานกลางคล้ายดวงดาว' }, center: { th: 'จานกลางใหญ่', desc: 'ศูนย์กลางดอกสีเหลืองเด่นชัด' } } }
};

class LearningMode {
    constructor(canvas, flowers) {
        this.canvas = canvas;
        this.flowers = flowers;
        this.active = false;
        this.selectedFlower = null;

        // Offscreen canvas for the zoomed diagram
        this.offscreen = document.createElement('canvas');
        this.offscreen.width = 520;
        this.offscreen.height = 480;

        // Hit zones on the popup (populated each draw)
        this.hitZones = [];

        // Tooltip currently shown
        this.tooltip = null;

        // Overlay element
        this._createOverlay();
    }

    _createOverlay() {
        // Main modal
        this.modal = document.createElement('div');
        this.modal.id = 'learn-modal';
        this.modal.style.cssText = `
            display: none;
            position: fixed;
            inset: 0;
            z-index: 200;
            background: rgba(8, 8, 20, 0.82);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            animation: fadeIn .3s ease;
        `;

        // Card
        this.card = document.createElement('div');
        this.card.style.cssText = `
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: min(95vw, 860px);
            max-height: 90vh;
            background: rgba(18, 20, 42, 0.97);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 30px 80px rgba(0,0,0,0.7);
            font-family: 'Noto Sans Thai', 'Inter', sans-serif;
        `;

        // Header
        this.header = document.createElement('div');
        this.header.style.cssText = `
            padding: 20px 24px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        `;
        this.titleEl = document.createElement('div');
        this.closeBtn = document.createElement('button');
        this.closeBtn.innerHTML = '&times;';
        this.closeBtn.style.cssText = `
            background: rgba(255,255,255,0.08); border: none; color: #fff;
            width: 36px; height: 36px; border-radius: 50%; cursor: pointer;
            font-size: 22px; line-height: 36px; text-align: center;
            transition: background .2s; flex-shrink: 0;
        `;
        this.closeBtn.onmouseenter = () => this.closeBtn.style.background = 'rgba(255,255,255,0.18)';
        this.closeBtn.onmouseleave = () => this.closeBtn.style.background = 'rgba(255,255,255,0.08)';
        this.closeBtn.onclick = () => this.close();
        this.header.appendChild(this.titleEl);
        this.header.appendChild(this.closeBtn);

        // Body: diagram + info panel
        this.body = document.createElement('div');
        this.body.style.cssText = `
            display: flex; flex: 1; overflow: hidden;
            @media (max-width: 600px) { flex-direction: column; }
        `;

        // Diagram canvas
        this.diagramCanvas = document.createElement('canvas');
        this.diagramCanvas.width = 400;
        this.diagramCanvas.height = 440;
        this.diagramCanvas.style.cssText = `
            background: radial-gradient(ellipse at 50% 80%, rgba(34,197,94,0.08) 0%, transparent 65%),
                        linear-gradient(180deg, rgba(30,41,100,0.5) 0%, rgba(10,12,30,0.8) 100%);
            cursor: crosshair;
            flex-shrink: 0;
        `;

        // Info sidebar
        this.infoPanel = document.createElement('div');
        this.infoPanel.style.cssText = `
            flex: 1; padding: 20px; overflow-y: auto;
            display: flex; flex-direction: column; gap: 10px;
        `;
        this.hintEl = document.createElement('p');
        this.hintEl.style.cssText = 'color: rgba(255,255,255,0.4); font-size: 0.82rem; margin: 0;';
        this.hintEl.textContent = '👆 คลิกที่ส่วนต่างๆ ของดอกไม้บนภาพซ้ายเพื่อเรียนรู้';

        this.partList = document.createElement('div');
        this.partList.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 10px;';

        this.infoPanel.appendChild(this.hintEl);
        this.infoPanel.appendChild(this.partList);

        this.body.appendChild(this.diagramCanvas);
        this.body.appendChild(this.infoPanel);

        this.card.appendChild(this.header);
        this.card.appendChild(this.body);
        this.modal.appendChild(this.card);
        document.body.appendChild(this.modal);

        // Diagram click handler
        this.diagramCanvas.addEventListener('click', (e) => {
            const rect = this.diagramCanvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (this.diagramCanvas.width / rect.width);
            const my = (e.clientY - rect.top) * (this.diagramCanvas.height / rect.height);
            this._handleDiagramClick(mx, my);
        });
        this.diagramCanvas.addEventListener('mousemove', (e) => {
            const rect = this.diagramCanvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (this.diagramCanvas.width / rect.width);
            const my = (e.clientY - rect.top) * (this.diagramCanvas.height / rect.height);
            let hit = false;
            for (const z of this.hitZones) {
                const dx = mx - z.x, dy = my - z.y;
                if (Math.sqrt(dx*dx+dy*dy) < z.r) { hit = true; break; }
            }
            this.diagramCanvas.style.cursor = hit ? 'pointer' : 'crosshair';
        });
    }

    open(flower) {
        this.selectedFlower = flower;
        this.modal.style.display = 'block';
        const info = FLOWER_INFO[flower.species] || {};

        // Title
        this.titleEl.innerHTML = `
            <div style="color:#fff; font-size:1.2rem; font-weight:700">${info.name || flower.species}</div>
            <div style="color:rgba(255,255,255,0.4); font-size:0.8rem; font-style:italic; margin-top:2px">${info.nameLatin || ''}</div>
            <div style="color:rgba(255,255,255,0.6); font-size:0.82rem; margin-top:6px; max-width:420px">${info.description || ''}</div>
        `;

        // Build part list
        this.partList.innerHTML = '';
        const parts = info.parts || {};
        for (const [key, val] of Object.entries(parts)) {
            const chip = document.createElement('button');
            chip.dataset.part = key;
            chip.style.cssText = `
                width:100%; text-align:left; background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.1); border-radius:12px;
                padding:10px 14px; color:#e2e8f0; cursor:pointer;
                font-family:inherit; transition: all .2s;
            `;
            chip.innerHTML = `<div style="font-weight:600;font-size:0.88rem;color:#a78bfa">${val.th}</div>
                              <div style="font-size:0.78rem;color:rgba(255,255,255,0.5);margin-top:3px">${val.desc}</div>`;
            chip.onmouseenter = () => { chip.style.background = 'rgba(167,139,250,0.12)'; chip.style.borderColor = '#a78bfa'; };
            chip.onmouseleave = () => { chip.style.background = 'rgba(255,255,255,0.04)'; chip.style.borderColor = 'rgba(255,255,255,0.1)'; };
            chip.onclick = () => this._highlightPart(key);
            this.partList.appendChild(chip);
        }

        this._drawDiagram(null);
    }

    close() {
        this.modal.style.display = 'none';
        this.selectedFlower = null;
        this.hitZones = [];
    }

    _handleDiagramClick(mx, my) {
        for (const z of this.hitZones) {
            const dx = mx - z.x, dy = my - z.y;
            if (Math.sqrt(dx*dx+dy*dy) < z.r) {
                this._highlightPart(z.part);
                return;
            }
        }
    }

    _highlightPart(partKey) {
        // Highlight the chip in the list
        this.partList.querySelectorAll('button').forEach(b => {
            if (b.dataset.part === partKey) {
                b.style.background = 'rgba(167,139,250,0.2)';
                b.style.borderColor = '#a78bfa';
                b.style.boxShadow = '0 0 12px rgba(167,139,250,0.3)';
                b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                b.style.background = 'rgba(255,255,255,0.04)';
                b.style.borderColor = 'rgba(255,255,255,0.1)';
                b.style.boxShadow = 'none';
            }
        });
        this._drawDiagram(partKey);
    }

    _drawDiagram(highlightPart) {
        if (!this.selectedFlower) return;
        const ctx = this.diagramCanvas.getContext('2d');
        const W = this.diagramCanvas.width;
        const H = this.diagramCanvas.height;
        this.hitZones = [];

        ctx.clearRect(0, 0, W, H);

        // Ground line
        const groundY = H - 60;
        ctx.fillStyle = 'rgba(34,197,94,0.08)';
        ctx.fillRect(0, groundY, W, H - groundY);
        ctx.strokeStyle = 'rgba(34,197,94,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();
        ctx.setLineDash([]);

        const f = this.selectedFlower;
        const ox = W / 2;
        const oy = groundY;

        // --- Draw magnified flower ---
        // We create a temporary mock "env" with no wind, then draw
        const mockEnv = { windOffset: 0, windSpeed: 0, timeOfDay: 12, rainEnabled: false };

        // Scale up by 2.5x for detailed view
        const mag = 2.5;

        ctx.save();
        ctx.translate(ox, oy);
        ctx.scale(mag, mag);

        // Stem line
        const stemH = f.maxHeight / mag * 0.8;
        ctx.strokeStyle = f.colors.stem;
        ctx.lineWidth = 3.5 / mag;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -stemH);
        ctx.stroke();

        // Two leaves
        const leafScale = 0.8;
        const leafY = -stemH * 0.5;
        for (const dir of [-1, 1]) {
            ctx.fillStyle = f.colors.leaf;
            ctx.beginPath();
            ctx.moveTo(0, leafY);
            ctx.bezierCurveTo(dir * 18 * leafScale, leafY - 8 * leafScale, dir * 28 * leafScale, leafY + 8 * leafScale, dir * 20 * leafScale, leafY + 18 * leafScale);
            ctx.bezierCurveTo(dir * 10 * leafScale, leafY + 14 * leafScale, 0, leafY + 10 * leafScale, 0, leafY);
            ctx.closePath();
            ctx.fill();
        }

        // Flower head at top
        ctx.save();
        ctx.translate(0, -stemH);
        this.selectedFlower.drawFlowerHead(ctx, 1.0, mockEnv);
        ctx.restore();

        ctx.restore(); // undo scale+translate

        // ─── Hit zones (screen coords) ───────────────────────────
        const screenStemTopY = oy - stemH * mag;
        const screenStemMidY = oy - stemH * mag * 0.5;

        // Hit: Flower head / petals zone
        this.hitZones.push({ part: 'petals', x: ox, y: screenStemTopY, r: 55 });

        // Hit: Center zone (inner circle)
        this.hitZones.push({ part: 'center', x: ox, y: screenStemTopY, r: 16 });
        if (f.colors.petalsDark) this.hitZones.push({ part: 'petalsDark', x: ox, y: screenStemTopY - 18, r: 22 });
        if (f.colors.petalsLight) this.hitZones.push({ part: 'petalsLight', x: ox, y: screenStemTopY + 10, r: 18 });
        if (f.colors.centerEdge) this.hitZones.push({ part: 'centerEdge', x: ox, y: screenStemTopY, r: 28 });

        // Hit: Stem
        this.hitZones.push({ part: 'stem', x: ox, y: oy - stemH * mag * 0.3, r: 18 });

        // Hit: Leaf
        this.hitZones.push({ part: 'leaf', x: ox - 28, y: screenStemMidY, r: 24 });
        this.hitZones.push({ part: 'leaf', x: ox + 28, y: screenStemMidY, r: 24 });

        // ─── Draw label arrows ───────────────────────────────────
        this._drawLabel(ctx, ox, screenStemTopY, 60, -70, '🌸 กลีบดอก', highlightPart === 'petals');
        this._drawLabel(ctx, ox + 28, screenStemMidY, 70, 15, '🍃 ใบ', highlightPart === 'leaf');
        this._drawLabel(ctx, ox + 8, oy - stemH * mag * 0.3, 70, 30, '🌿 ก้านดอก', highlightPart === 'stem');
        if (f.colors.center || FLOWER_INFO[f.species]?.parts?.center) {
            this._drawLabel(ctx, ox, screenStemTopY, -65, -20, '⭐ ส่วนกลาง', highlightPart === 'center');
        }
    }

    _drawLabel(ctx, fromX, fromY, dx, dy, text, active) {
        const toX = fromX + dx;
        const toY = fromY + dy;

        ctx.save();
        ctx.strokeStyle = active ? '#a78bfa' : 'rgba(255,255,255,0.3)';
        ctx.fillStyle = active ? 'rgba(167,139,250,0.15)' : 'transparent';
        ctx.lineWidth = active ? 1.5 : 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label box
        const pad = 6;
        ctx.font = `${active ? 'bold' : 'normal'} 12px 'Noto Sans Thai', sans-serif`;
        const tw = ctx.measureText(text).width;
        const bx = dx > 0 ? toX + 2 : toX - tw - pad * 2 - 2;

        ctx.fillStyle = active ? 'rgba(167,139,250,0.22)' : 'rgba(15,20,45,0.7)';
        this._roundRect(ctx, bx, toY - 11, tw + pad * 2, 20, 6);
        ctx.fill();
        ctx.strokeStyle = active ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = active ? '#c4b5fd' : 'rgba(255,255,255,0.7)';
        ctx.fillText(text, bx + pad, toY + 2);
        ctx.restore();
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    /** Check if a point (clientX, clientY) hits a flower on the main canvas */
    hitTestFlowers(clientX, clientY, env) {
        for (const f of this.flowers) {
            if (f.lifecycle === 'growing' && f.growth < 0.5) continue;
            
            // Assume env exists, otherwise default scale to 1
            const scale = (env && env.getDepthScale) ? env.getDepthScale(f.y) : 1;
            
            const dx = clientX - f.x;
            const dy = clientY - (f.y - f.height * scale);
            const r = (22 + f.height * 0.15) * scale;
            if (Math.sqrt(dx * dx + dy * dy) < r) return f;
        }
        return null;
    }
}

window.LearningMode = LearningMode;
