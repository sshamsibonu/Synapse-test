-- One-time import of the 6 existing Synapse articles (Uz + En)
-- REVIEW before running. Safe to re-run: upserts on slug.
-- status = published so they can appear after Slice F.
-- lesson_id left null (optional links can be set in admin).
--
-- NOTE: cognition-uzbekistan was category "research" on the old site.
-- Admin topics are only memory|attention|sleep|learning|emotion,
-- so it is imported as topic = learning. Edit that value below if needed.

begin;

-- forgetting-names
insert into public.articles (
  slug, topic, status,
  title_uz, title_en,
  summary_uz, summary_en,
  body_uz, body_en,
  lesson_id
) values (
  'forgetting-names',
  'memory',
  'published',
  $tuz$Nega ismni eshitganingizdan uch soniya keyin unutasiz$tuz$,
  $ten$Why you forget a name three seconds after hearing it$ten$,
  $suz$Bu kamdan-kam hollarda xotirangiz susayayotganini bildiradi. Ko'pincha ism umuman yozib olinmagan bo'ladi — sababi esa shaxsiy emas, tuzilmaviy.$suz$,
  $sen$It rarely means your memory is failing. Most of the time the name was never recorded in the first place — and the reason is structural, not personal.$sen$,
  $buz$Kimdir o'zini tanishtiradi. Siz ismni takrorlaysiz, qo'l berasiz va suhbat davom etganda u yo'qoladi. Odatdagi munosabat — biroz xijolat va xotira haqida ichki tashvish. Ikkalasi ham o'rinsiz.

Unutish ikki xil bo'ladi. Ba'zan ma'lumot saqlangan, lekin uni chiqarib bo'lmaydi. Ko'pincha esa u umuman yetarli darajada saqlanmagan. Ismlar — ikkinchi turning deyarli mukammal namunasi.

Siz tinglamagansiz, va bu normal

Tanishuv paytida diqqat juda band bo'ladi. Siz ko'z aloqasini boshqarasiz, keyin nima deyishni o'ylaysiz, suhbatdoshning muomalasini o'qiysiz va ko'pincha ilgari uchrashganmisiz degan savolni eslashga urinasiz. Ism aynan eng band bir necha soniyada keladi.

Xotirani kodlash passiv jarayon emas. U eslab qolinishi kerak bo'lgan narsaga qaratilgan diqqatni talab qiladi. Diqqat bo'linganda kodlash keskin yomonlashadi — shuning uchun ismni aniq eshitib turib ham uni umuman yozib olmaslik mumkin.

Ismlarni bog'lash g'ayrioddiy darajada qiyin

To'liq diqqat bilan ham ismlar odam haqidagi deyarli hamma narsadan qiyinroq. Xotira bog'lanish orqali ishlaydi: yangi material siz allaqachon bilgan narsaga ulanganda mustahkamlanadi. Kasbi, shahri yoki bog'dorchilik bilan shug'ullanishi — bularning barchasi mavjud katta bilim tarmoqlariga ulanadi.

Ism esa deyarli hech narsaga ulanmaydi. Bu ixtiyoriy yorliq. Kimningdir familiyasi Novvoy ekanini bilish u haqida hech narsa aytmaydi, ammo uning novvoy ekanini bilish butun bir manzarani uyg'otadi — un, erta tong, tandir. Tadqiqotchilar bu nomutanosiblikni ancha vaqtdan beri qayd etib kelishadi: bir xil so'z kasb sifatida familiyaga qaraganda sezilarli darajada osonroq eslab qolinadi.

Demak, bu axloqiy kamchilik emas. Tuzilma shunchaki o'z ishini bajarmoqda, ismlar esa unga eng yomon mos keladigan narsa.

Aslida nima yordam beradi

Yechimlar tashxisdan kelib chiqadi. Muammo kodlashda bo'lgani uchun, ismga bir soniyalik bo'linmagan diqqat ajratadigan har qanday narsa yordam beradi: javobingizda uni darhol ishlatish, javob berishdan oldin bir lahza to'xtash yoki qanday yozilishini so'rash.

Muammo bog'lanishda ham bo'lgani uchun, ismga ilinadigan narsa berish yanada foydali — shu ism bilan tanigan boshqa odam, insonning biror xususiyati, ixtiyoriy tovushni tarmoq qismiga aylantiradigan har qanday narsa.

Bularning hech biri xotirani yaxshilash hiylasi emas. Bu oddiy xotiraga kerakli sharoitni berish usuli.

Bu nimani anglatmaydi

Ismlarni kundalik unutish juda keng tarqalgan va o'z-o'zidan miya salomatligi haqida juda kam narsa aytadi. Klinik jihatdan ahamiyatli bo'lgan narsa — vaqt o'tishi bilan o'zgarish va kundalik hayotning buzilishi, ziyofatda ismni unutish emas.

Agar xotirangiz haqida xavotirda bo'lsangiz, bu veb-sayt bilan emas, malakali mutaxassis bilan bo'ladigan suhbat.$buz$,
  $ben$Someone introduces themselves. You repeat the name back, you shake hands, and by the time the conversation has moved on it is gone. The usual reaction is mild embarrassment and a private worry about one's memory. Both are misplaced.

Forgetting comes in two very different forms. Sometimes information is stored and cannot be retrieved. Far more often, it was never adequately stored to begin with. Names are an almost perfect case of the second kind.

You were not listening, and that is normal

At the moment of an introduction, attention is heavily occupied. You are managing eye contact, deciding what to say next, reading the other person's manner, and often trying to remember whether you have met before. The name arrives during the busiest few seconds of the encounter.

Encoding a memory is not passive. It requires attention directed at the thing to be remembered. When attention is divided, encoding degrades sharply — which is why you can hear a name clearly, and still never record it.

Names are unusually hard to attach

Even with full attention, names are harder than almost anything else about a person. Memory works by connection: new material sticks when it can be linked to what you already know. A person's job, city, or the fact that they garden all connect to large existing networks of knowledge.

A name connects to almost nothing. It is an arbitrary label. Knowing that someone is called Baker tells you nothing about them, whereas knowing they are a baker calls up a whole scene — flour, early mornings, an oven. Researchers have long noted this asymmetry, sometimes called the Baker/baker paradox: the identical word is markedly easier to remember as an occupation than as a surname.

So the failure is not moral. The architecture is simply working as designed, and names are the worst possible fit for it.

What actually helps

The remedies follow from the diagnosis. Because the problem is encoding, anything that buys the name a second of undivided attention helps: using it immediately in your reply, pausing before you respond, or asking how it is spelled.

Because the problem is also connection, giving the name something to attach to helps further — a association with someone else you know by that name, a feature of the person, anything that turns an arbitrary sound into part of a network.

None of this is a trick for a better memory. It is a way of giving an ordinary memory the conditions it needs.

A note on what this does not mean

Everyday forgetting of names is extremely common and, on its own, says very little about brain health. What tends to matter clinically is change over time and disruption to daily life — not the ordinary experience of losing a name at a party.

If you are worried about your memory, that is a conversation for a qualified professional, not a website.$ben$,
  null
)
on conflict (slug) do update set
  topic = excluded.topic,
  status = excluded.status,
  title_uz = excluded.title_uz,
  title_en = excluded.title_en,
  summary_uz = excluded.summary_uz,
  summary_en = excluded.summary_en,
  body_uz = excluded.body_uz,
  body_en = excluded.body_en,
  updated_at = now();

-- automatic-reading
insert into public.articles (
  slug, topic, status,
  title_uz, title_en,
  summary_uz, summary_en,
  body_uz, body_en,
  lesson_id
) values (
  'automatic-reading',
  'attention',
  'published',
  $tuz$O'qish avtomatik. Muammo ham aynan shunda.$tuz$,
  $ten$Reading is automatic. That is exactly the problem.$ten$,
  $suz$Rangli so'zlar bilan o'tkazilgan to'qson yillik tajriba noqulay haqiqatni ko'rsatadi: ongingiz qiladigan ishlarning katta qismi sizga bog'liq emas.$suz$,
  $sen$A ninety-year-old experiment with coloured words shows something uncomfortable: a great deal of what your mind does is not up to you.$sen$,
  $buz$Mana, arzimasdek tuyuladigan vazifa. Sizga rangli bo'yoqda chop etilgan so'zlar ko'rsatiladi va so'zning o'ziga e'tibor bermay, siyoh rangini aytish so'raladi. KO'K so'zi ko'k siyohda yozilganda bu oson. KO'K so'zi qizil siyohda yozilganda esa g'alati narsa yuz beradi: siz sekinlashasiz va xato qilasiz.

Bu — Strup effekti, birinchi marta 1935-yilda Jon Ridli Strup tomonidan tavsiflangan. U psixologiyadagi eng ishonchli takrorlanadigan natijalardan biri va bugungi kunda ham tadqiqot va klinik baholashda qo'llaniladi.

Kechikish nega yuz beradi

Ravon o'quvchi uchun o'qish qaror emas. Yillar davomidagi mashq uni avtomatik qilgan — so'zni ko'rganingizda, xohlaysizmi yo'qmi, uning ma'nosini ajratib olasiz. Rangni nomlash esa nisbatan ongli harakat.

Shu sababli ikki jarayon turli tezlikda keladi va so'z bilan siyoh mos kelmaganda, ular qarama-qarshi javob beradi. Siz sezayotgan kechikish — bu ziddiyatni aniqlash va kerak bo'lmagan javobni bostirish narxi.

Muhimi shundaki, siz shunchaki o'qimaslikni tanlay olmaysiz. Ko'rsatmalar buni o'chirmaydi. Avtomatik jarayon birinchi ishga tushadi, nazorat esa keyin kelib tozalaydi.

Bu diqqat haqida nima deydi

Diqqatni to'liq o'z buyrug'ingizdagi projektor deb tasavvur qilish jozibali. Strup vazifasi kamtaronaroq narsani taklif qiladi: sizga yetib keladigan narsaning katta qismi siz aralashguningizcha allaqachon hal bo'lgan, ixtiyoriy nazorat esa asosan boshlanib bo'lgan jarayonni bekor qilish orqali ishlaydi.

Bu nuqson emas. Avtomatizm mahoratni mumkin qiladi — ravon o'quvchi, tajribali haydovchi va tajribali jarroh mulohazani talab qilmaydigan jarayonlarga tayanadi. Narxi shuki, avtomatik jarayonlar foydasiz bo'lib qolganda ularni o'chirish qiyin.

Bu kitobdan tashqarida qayerda ko'rinadi

Xuddi shunday tuzilma yaxshi o'rganilgan javob niyat bilan to'qnashganda paydo bo'ladi: jiringlamagan telefonga qo'l cho'zish, dam olish kunida ish joyiga qarab haydash yoki o'zgartirishga qaror qilgan odatni davom ettirish.

Har bir holatda qiyinchilik nima qilishni bilmaslikda emas. Mulohazadan tezroq narsa u yerga birinchi yetib borganida.$buz$,
  $ben$Here is a task that sounds trivial. You are shown words printed in colour, and asked to name the colour of the ink while ignoring the word itself. When the word BLUE is printed in blue ink, this is effortless. When the word BLUE is printed in red ink, something strange happens: you slow down, and you make mistakes.

This is the Stroop effect, first described by John Ridley Stroop in 1935. It is one of the most reliably reproduced findings in psychology, and it is still used in research and clinical assessment today.

Why the delay happens

For a fluent reader, reading is not a decision. Years of practice have made it automatic — presented with a word, you extract its meaning whether or not you intend to. Naming a colour, by contrast, is comparatively deliberate.

So the two processes arrive at different speeds and, when the word and the ink disagree, they deliver conflicting answers. The delay you feel is the cost of detecting that conflict and suppressing the response you did not want.

The important part is that you cannot simply choose not to read. Instructions do not disable it. The automatic process runs first, and control arrives afterwards to clean up.

What it says about attention

It is tempting to imagine attention as a spotlight fully under your command. The Stroop task suggests something more modest: much of what reaches you is determined before you get a say, and voluntary control largely operates by overriding what is already underway.

This is not a flaw. Automaticity is what makes skill possible — a fluent reader, a practised driver, and an experienced surgeon all rely on processes that no longer require deliberation. The cost is that automatic processes are difficult to switch off when they become unhelpful.

Where this shows up off the page

The same structure appears whenever a well-learned response conflicts with an intention: reaching for a phone that did not buzz, driving toward your workplace on a day off, or continuing a habit you have decided to change.

In each case the difficulty is not knowing what you want to do. It is that something faster than deliberation got there first.$ben$,
  null
)
on conflict (slug) do update set
  topic = excluded.topic,
  status = excluded.status,
  title_uz = excluded.title_uz,
  title_en = excluded.title_en,
  summary_uz = excluded.summary_uz,
  summary_en = excluded.summary_en,
  body_uz = excluded.body_uz,
  body_en = excluded.body_en,
  updated_at = now();

-- sleep-and-memory
insert into public.articles (
  slug, topic, status,
  title_uz, title_en,
  summary_uz, summary_en,
  body_uz, body_en,
  lesson_id
) values (
  'sleep-and-memory',
  'sleep',
  'published',
  $tuz$Tungi smena: uyqu kuningiz bilan nima qiladi$tuz$,
  $ten$The night shift: what sleep does with your day$ten$,
  $suz$Uyqu — faoliyatning yo'qligi emas. Nimani eslab qolishingizni hal qiladigan ishning bir qismi siz diqqatni to'xtatganingizdan keyingina bajariladi.$suz$,
  $sen$Sleep is not the absence of activity. Some of the work that decides what you will remember happens only after you stop paying attention.$sen$,
  $buz$Uyquni bo'sh vaqt — kundan ayirilgan soatlar deb qarash oson. Tadqiqotlar buning teskarisini ko'rsatadi. Uyqu paytida miya juda faol bo'ladi va bu faoliyatning bir qismi bevosita undan oldingi kun bilan bog'liq.

Biror narsani o'rganganingizdan keyingi tun — o'rganishning bir qismi.

Mustahkamlanish

Yangi xotiralar doimiy holda kelmaydi. Ular mo'rt holatda boshlanadi va vaqt o'tishi bilan barqarorlashadi — bu jarayon konsolidatsiya deb ataladi. Uyqu unda katta rol o'ynaydi.

Chuqur, sekin to'lqinli uyqu davomida uyg'oqlikda qayd etilgan faollik naqshlari qayta ijro etiladi — bu hayvonlar ustidagi tadqiqotlarda aniqlangan va inson tadqiqotlari bilan qo'llab-quvvatlangan. Bu qayta ijro xotiralarning bardoshliroq bo'lishi va gippokampga kamroq bog'liq bo'lib, asta-sekin po'stloqdagi mavjud bilim bilan birlashishi bilan bog'liq.

Oddiy qilib aytganda: kun ko'rib chiqiladi, saralanadi va joylashtiriladi. Keyingi oyda ham bilib turadigan narsangizning katta qismi siz o'rganishni to'xtatganingizdan keyingi soatlarda hal bo'ladi.

Birinchi yo'qoladigan narsa — diqqat

Kam uxlashning eng tezkor narxi keskin xotira yo'qotish emas. Bu — diqqat.

Uyqusiz qolgan odamlarda uzilishlar kuzatiladi — odatda sezadigan narsaga javob bermaslikning qisqa lahzalari. Barqaror diqqat beqaror bo'lib qoladi va natija bir tekis sekinlashish o'rniga o'zgaruvchan bo'ladi. Shu sababli reaksiya vaqti testlari uyqu yetishmovchiligiga juda sezgir va shuning uchun bu haydovchilik uchun xavfli.

Ikkinchi muammo bor: uyqusiz odamlar o'z holatini ishonchli baholay olmaydilar. O'zini yetarli his qilish — yetarli ekanning dalili emas.

Bu nimaga ruxsat beradi va nimaga bermaydi

Kattalar uchun uyqu ehtiyoji odatda taxminan yetti-to'qqiz soat deb ta'riflanadi, lekin odamlar haqiqatan farq qiladi va yagona raqam muayyan inson uchun yomon yo'riqnoma.

Bu yerdagi amaliy da'vo torroq va yaxshiroq asoslangan: agar siz biror narsani o'rganayotgan bo'lsangiz va yana bir soat mutolaa bilan bir soat uyqu orasida tanlayotgan bo'lsangiz, uyqu — erkalik varianti emas. U ishning bir qismi.

Doimiy uyqu muammolarini yolg'iz hal qilishga urinmay, shifokorga aytish ma'qul.$buz$,
  $ben$It is easy to treat sleep as downtime — the hours subtracted from a day rather than part of it. The research points the other way. During sleep the brain is highly active, and some of that activity is directly concerned with the day that preceded it.

The night after learning something is part of learning it.

Consolidation

New memories do not arrive permanent. They begin in a fragile state and are stabilised over time, a process called consolidation. Sleep plays a substantial role in it.

During deep, slow-wave sleep, patterns of activity recorded during waking are replayed — a finding established in animal studies and supported by human work. This replay is associated with memories becoming more durable and less dependent on the hippocampus, gradually integrating with existing knowledge in the cortex.

Put simply: the day is reviewed, sorted, and filed. Much of what you will still know next month is decided in the hours after you stop trying to learn it.

Attention is the first thing to go

The most immediate cost of short sleep is not dramatic memory loss. It is attention.

Sleep-deprived people show lapses — brief failures to respond to something they would normally catch. Sustained attention becomes unstable, and performance grows more variable rather than uniformly slower. This is why reaction-time tasks are so sensitive to sleep loss, and why the effect is dangerous in driving.

There is a second problem: people are not reliable judges of their own impairment when sleep-deprived. Feeling adequate is not evidence of being adequate.

What this does and does not license

Adult sleep need is usually described as roughly seven to nine hours, but individuals genuinely vary, and a single number is a poor guide to any particular person.

The practical claim here is narrower and better supported: if you are learning something and choosing between another hour of study and an hour of sleep, the sleep is not the indulgent option. It is part of the work.

Persistent sleep problems are worth raising with a doctor rather than managing alone.$ben$,
  null
)
on conflict (slug) do update set
  topic = excluded.topic,
  status = excluded.status,
  title_uz = excluded.title_uz,
  title_en = excluded.title_en,
  summary_uz = excluded.summary_uz,
  summary_en = excluded.summary_en,
  body_uz = excluded.body_uz,
  body_en = excluded.body_en,
  updated_at = now();

-- rereading-illusion
insert into public.articles (
  slug, topic, status,
  title_uz, title_en,
  summary_uz, summary_en,
  body_uz, body_en,
  lesson_id
) values (
  'rereading-illusion',
  'learning',
  'published',
  $tuz$Nega qayta o'qish o'rganishdek tuyuladi$tuz$,
  $ten$Why re-reading feels like learning$ten$,
  $suz$Eng samarali his qilinadigan mutolaa usuli — eng kam samaralilardan biri. Muammo aynan o'sha hisda.$suz$,
  $sen$The study method that feels most productive is one of the least effective. The feeling is the problem.$sen$,
  $buz$Ko'pchilikdan qanday takrorlashini so'rasangiz, materialni qayta o'qishni, balki marker bilan belgilashni aytadi. Bu intuitiv yondashuv va u ishlayotgandek tuyuladi. Ikkinchi o'qish birinchisidan ravonroq, material tanish ko'rinadi va bu tanishlik tushunish sifatida qabul qilinadi.

Aynan shu his — tuzoq.

Ravonlik bilim emas

Qayta o'qish ishonchli tarzda ravonlik hosil qiladi — endigina o'qigan matnni qayta ishlash oson. Ongingiz bu yengillikni material o'zlashtirilgan belgisi deb talqin qiladi. Ammo tanib olish yengilligi va xotiradan biror narsani chiqarib berish qobiliyati — turli narsalar, imtihon, suhbat yoki klinik qaror esa deyarli doim ikkinchisini so'raydi.

Sahifani tanish oson. Sahifasiz uni qayta tiklash esa hech qachon mashq qilinmagan narsa.

Haqiqiy mexanizm — xotiradan chiqarish

Testlash effekti deb ataladigan katta hajmdagi tadqiqotlar shuni ko'rsatadiki, ma'lumotni xotiradan chiqarish keyingi eslab qolishni bir xil vaqt davomida qayta o'qishdan ko'ra ko'proq yaxshilaydi. Rodiger va Karpikning tajribalari eng ko'p iqtibos keltiriladigan namoyishlar orasida.

Kutilmagan jihati shundaki, xotiradan chiqarish mashqi jarayon davomida ko'pincha yomonroq his qilinadi. U kuch talab qiladi va bilmagan narsangizni ochib beradi. O'rganuvchilar uni ko'pincha qayta o'qishdan kamroq samarali deb baholaydilar — hatto keyingi natijalari buning teskarisini ko'rsatsa ham.

Vaqt bo'yicha taqsimlash ham shunga o'xshash: mutolaani kunlarga taqsimlash uni bitta seansga jamlashdan ustun, garchi jamlangan seans odatda ko'proq bajarilgandek tuyulsa ham.

Foydali qiyinchilik

Robert Bjork buni maqsadga muvofiq qiyinchiliklar deb ataydi — o'rganishni ayni damda sekinlashtirib, uzoq muddatli saqlanishni yaxshilaydigan sharoitlar. Xotiradan chiqarish va taqsimlash — eng aniq misollar.

Amaliy tarjimasi qisqa: kitobni yoping va unda nima borligini aytishga urinib ko'ring. Keyin tekshiring. Esga tushira olmaslikning noqulayligi usul ishlamayotganining belgisi emas; u ishlashining asosiy sababi.$buz$,
  $ben$Ask most people how they revise and they will describe reading the material again, perhaps with highlighting. It is the intuitive approach, and it feels like it is working. The second pass is smoother than the first, the material seems familiar, and that familiarity registers as understanding.

That feeling is the trap.

Fluency is not knowledge

Re-reading reliably produces fluency — text you have just read is easy to process. Your mind interprets that ease as a sign that the material is known. But ease of recognition and ability to produce something from memory are different capacities, and an exam, a conversation, or a clinical decision almost always asks for the second.

Recognising a page is easy. Reconstructing it without the page is the thing that was never practised.

Retrieval as the actual mechanism

A large body of work on what is called the testing effect shows that retrieving information from memory improves later retention more than restudying the same material for the same amount of time. Roediger and Karpicke's experiments are among the most cited demonstrations.

The counterintuitive part is that retrieval practice often feels worse while you are doing it. It is effortful, and it exposes what you do not know. Learners frequently rate it as less effective than re-reading even when their own later performance shows the opposite.

Spacing shows a similar pattern: distributing study across days outperforms massing it into one session, though the massed session usually feels more accomplished.

Difficulty that helps

Robert Bjork's term for this is desirable difficulties — conditions that slow learning down in the moment while improving durable retention. Retrieval and spacing are the clearest examples.

The practical translation is short: close the book and try to say what was in it. Then check. The discomfort of failing to recall is not a sign the method is not working; it is most of why it works.$ben$,
  null
)
on conflict (slug) do update set
  topic = excluded.topic,
  status = excluded.status,
  title_uz = excluded.title_uz,
  title_en = excluded.title_en,
  summary_uz = excluded.summary_uz,
  summary_en = excluded.summary_en,
  body_uz = excluded.body_uz,
  body_en = excluded.body_en,
  updated_at = now();

-- feeling-and-thinking
insert into public.articles (
  slug, topic, status,
  title_uz, title_en,
  summary_uz, summary_en,
  body_uz, body_en,
  lesson_id
) values (
  'feeling-and-thinking',
  'emotion',
  'published',
  $tuz$His qilish — fikrlashning bir qismi$tuz$,
  $ten$Feeling is part of thinking$ten$,
  $suz$His-tuyg'ular ko'pincha aql-idrokka xalaqit deb qaraladi. Dalillar esa uni ko'proq poydevor ekanini ko'rsatadi.$suz$,
  $sen$Emotion is often treated as interference in otherwise rational thought. The evidence suggests it is closer to infrastructure.$sen$,
  $buz$Aql va his-tuyg'u raqib degan uzoq davom etgan tasavvur bor: aniq fikrlash — bu his olib tashlanganda qoladigan narsa. Bu chiroyli hikoya va u klinik dalillar bilan to'qnashuvga bardosh bermaydi.

His olib tashlanganda nima bo'ladi

Nevrolog Antonio Damasio ventromedial prefrontal po'stloq shikastlangan bemorlarni tasvirlagan: ularning aql-zakovati, nutqi va xotirasi asosan saqlanib qolgan, ammo hissiy javoblari susaygan edi.

Klassik qarashga ko'ra ular yaxshiroq qaror qabul qiluvchiga aylanishi kerak edi. Ammo bunday bo'lmadi. Ular oddiy tanlovlarda qattiq qiynalar, arzimas variantlar ustida cheksiz mulohaza yuritar va ish hamda munosabatlariga zarar yetkazadigan qarorlar qabul qilar edi.

Damasioning somatik marker gipotezasi shuni taklif qiladiki, hissiy signallar variantlarni qiymat bilan belgilaydi va boshqarib bo'lmaydigan imkoniyatlar maydonini ko'rib chiqishga arziydigan bir nechtasiga toraytiradi. Buni olib tashlasangiz, sovuq aniqlik emas, falaj qoladi.

His-tuyg'u nimani saqlashingizni shakllantiradi

His-tuyg'u xotiraga ham ta'sir qiladi. Hissiy jihatdan qo'zg'atuvchi voqealar, umuman olganda, neytral voqealarga qaraganda yaxshiroq eslab qolinadi — bu effekt amigdalaning xotira konsolidatsiyasiga ta'siri bilan bog'lanadi.

Ammo yaxshiroq eslab qolish — aniq eslab qolish degani emas. Hayratlanarli xabarni bilib olish lahzasining yorqin xotiralari — «chaqmoq xotiralar» bo'yicha tadqiqotlar shuni aniqladiki, bunday xotiralarga ishonch yuqori qoladi, aniqligi esa suriladi. Nayser va Xarshning Challenger falokatidan keyingi tadqiqoti mashhur misol: hikoyalar vaqt o'tishi bilan sezilarli o'zgargan, ishonch esa o'zgarmagan.

Bu ustida to'xtalishga arziydi. Yorqinlik aniqlik dalilidek tuyuladi, lekin u emas.

Bu nega muhim

Agar his-tuyg'u xalaqit emas, poydevor bo'lsa, aniq fikrlashning maqsadi hisni yo'q qilish emas, balki u nima qilayotganini tushunish — qaysi variantlarni jimgina ilgari surayotganini va qaysilarini siz sezmasdan avval ko'rib chiqishdan chiqarib tashlaganini bilish.

Bu shunchaki oqilona bo'lishga urinishdan ko'ra qiyinroq intizom va halolroq yondashuv.$buz$,
  $ben$There is a long-standing picture in which reason and emotion are opponents: clear thinking is what remains once feeling is removed. It is a tidy story, and it does not survive contact with the clinical evidence.

What happens when feeling is removed

The neurologist Antonio Damasio described patients with damage to the ventromedial prefrontal cortex whose intelligence, language and memory remained largely intact, but whose emotional responses were blunted.

On the classical view they should have become better decision-makers. They did not. They struggled badly with ordinary choices, deliberating endlessly over trivial options and making decisions that damaged their work and relationships.

Damasio's proposal, the somatic marker hypothesis, is that emotional signals mark options with value, narrowing an unmanageable field of possibilities to a few worth considering. Strip that out and you are left not with cold clarity but with paralysis.

Emotion shapes what you keep

Emotion also influences memory. Emotionally arousing events are, in general, better remembered than neutral ones, an effect linked to the amygdala's influence on memory consolidation.

But better remembered is not the same as accurately remembered. Research on so-called flashbulb memories — vivid recollections of learning shocking news — has found that confidence in such memories stays high while their accuracy drifts. Neisser and Harsch's study following the Challenger disaster is the well-known example: accounts changed substantially over time, while certainty did not.

This is worth sitting with. Vividness feels like evidence of accuracy, and it is not.

Why it matters

If emotion is infrastructure rather than interference, then the goal of clear thinking is not to eliminate feeling but to understand what it is doing — which options it is quietly promoting, and which it has removed from consideration before you noticed.

That is a harder discipline than simply trying to be rational, and a more honest one.$ben$,
  null
)
on conflict (slug) do update set
  topic = excluded.topic,
  status = excluded.status,
  title_uz = excluded.title_uz,
  title_en = excluded.title_en,
  summary_uz = excluded.summary_uz,
  summary_en = excluded.summary_en,
  body_uz = excluded.body_uz,
  body_en = excluded.body_en,
  updated_at = now();

-- cognition-uzbekistan
insert into public.articles (
  slug, topic, status,
  title_uz, title_en,
  summary_uz, summary_en,
  body_uz, body_en,
  lesson_id
) values (
  'cognition-uzbekistan',
  'learning',
  'published',
  $tuz$O'zbekistonda kognitiv jarayonlar haqida hali nimani bilmaymiz$tuz$,
  $ten$What we do not yet know about cognition in Uzbekistan$ten$,
  $suz$Psixologiyaning inson ongi haqidagi da'volarining aksariyati insoniyatning tor bir qismiga tayanadi. O'zbekiston bu hikoyada g'ayrioddiy o'rin egallaydi.$suz$,
  $sen$Most of what psychology claims about the human mind rests on a narrow slice of humanity. Uzbekistan has an unusual place in that story.$sen$,
  $buz$Psixologiyada namuna olish muammosi bor va u kichik emas. 2010-yildagi ta'sirli maqolada Jozef Genrix, Stiven Xayn va Ara Norenzayan chop etilgan xulq-atvor tadqiqotlarining katta qismi G'arbiy, Ma'lumotli, Sanoatlashgan, Boy va Demokratik jamiyatlar ishtirokchilariga tayanishini ko'rsatdi — qisqartmasi WEIRD.

Ularning fikri bunday natijalar qadrsiz degani emas edi. Gap shundaki, inson ongini tasvirlashni da'vo qilgan fan vakillik qilmaydigan namunadan umumlashtirib kelgan va bir qator ko'rsatkichlar bo'yicha bu populyatsiyalar neytral asos emas, balki chetlanish hisoblanadi.

Kutilmagan mahalliy tarix

O'zbekiston bu savol tarixida alohida o'rin tutadi. 1930-yillar boshida sovet psixologi Aleksandr Luriya katta ijtimoiy o'zgarishlar — xususan savodxonlik va maktab ta'limining tarqalishi — odamlarning fikrlash tarzini o'zgartiradimi degan savolni o'rganish uchun O'zbekiston va Qirg'izistonga safar qildi.

U maktab ta'limi bilan turlicha darajada tanish guruhlarning tasniflash, mantiqiy sillogizmlar va ko'rish illyuziyalari bo'yicha javoblarini taqqosladi va muammolarga yondashuvda tizimli farqlarni qayd etdi: ba'zi ishtirokchilar vazifaning mavhum shartlaridan emas, bevosita amaliy tajribadan kelib chiqib fikr yuritgan.

Bu ish tanqiddan xoli emas va uning talqini o'shandan beri munozarali. U siyosiy sabablarga ko'ra bostirilgan va o'nlab yillar o'tgachgina to'liq nashr etilgan. Ammo u erta bir muhim narsani o'rnatdi: odamlarning fikrlash tarzi ular fikr yuritayotgan sharoit bilan shakllanadi.

O'sha tadqiqot shu yerda bo'lgan. O'shandan beri bu yerda juda kam tizimli kognitiv ma'lumot yig'ilgan.

Aslida nima yetishmayapti

Kognitiv vazifalar madaniy jihatdan neytral asboblar emas. Xotira, diqqat va qayta ishlash tezligi testlaridagi natijalarga maktab ta'limi, savodxonlik, til, test formatlari bilan tanishlik va vazifaning ishtirokchi ilgari qilgan narsalarga qanchalik o'xshashligi ta'sir qiladi.

Mahalliy tayanch ma'lumotlarsiz alohida natijani talqin qilish qiyin. Toshkentdagi odamni boshqa joyda talabalardan yig'ilgan me'yorlar bilan taqqoslash inson haqidagidan ko'ra mos kelmaslik haqida ko'proq gapirishi mumkin.

Synapse qayerda turadi

Aynan shu bo'shliq Synapse'ni qiziqtiradi va hozirgi holatimiz haqida aniq bo'lish kerak: biz boshlanish nuqtasidamiz. O'zbekistondagi kognitiv jarayonlarni tasvirlash uchun yetarli ma'lumot to'plamaganmiz va buni yashirmaymiz.

Qila oladigan narsamiz — boshidanoq ehtiyotkor bo'lish: sukut bo'yicha anonim, metodikada shaffof va bu yerdagi testlar tashxis vositasi emas, ta'lim vositasi ekanini aniq aytish. Chop etadigan har qanday raqamlarimiz o'z cheklovlari bilan birga beriladi.

Agar bu kamtarona da'vo bo'lib tuyulsa, bu ataylab shunday. Muqobili — kam ma'lumotdan ishonchli raqamlar chiqarish — haqiqiy bo'shliqning shovqin bilan to'ldirilish usuli.$buz$,
  $ben$Psychology has a sampling problem, and it is not a small one. In an influential 2010 paper, Joseph Henrich, Steven Heine and Ara Norenzayan pointed out that the great majority of published behavioural research drew on participants from Western, Educated, Industrialised, Rich and Democratic societies — abbreviated to WEIRD.

Their argument was not that such findings are worthless. It was that a discipline claiming to describe the human mind had been generalising from an unrepresentative sample, and that on several measures those populations are outliers rather than a neutral baseline.

An unexpected local history

Uzbekistan occupies a notable position in the history of this question. In the early 1930s the Soviet psychologist Alexander Luria travelled to Uzbekistan and Kyrgyzstan to study whether large social changes — particularly the spread of literacy and formal schooling — altered how people reasoned.

He compared responses across groups with differing exposure to schooling on tasks involving categorisation, logical syllogisms and visual illusions, and reported systematic differences in how problems were approached: some participants reasoned from direct practical experience rather than from the abstract terms of the task as posed.

The work is not without criticism, and its interpretation has been debated since. It was also suppressed for political reasons and not published in full until decades later. But it established something important early: how people reason is shaped by the conditions they reason in.

That research happened here. Very little systematic cognitive data has been gathered here since.

What is actually missing

Cognitive tasks are not culturally neutral instruments. Performance on tests of memory, attention and processing speed is influenced by schooling, literacy, language, familiarity with testing formats, and how much the task resembles anything a participant has done before.

Without local reference data, an individual result is difficult to interpret. Comparing someone in Tashkent against norms collected from undergraduates elsewhere may say more about the mismatch than about the person.

Where Synapse sits

This is the gap Synapse is interested in, and it is worth being precise about our current position: we are at the beginning. We have not collected enough data to describe cognition in Uzbekistan, and we will not pretend otherwise.

What we can do is be careful from the start — anonymous by default, transparent about method, and explicit that the tests here are educational instruments rather than diagnostic ones. Any figures we publish will be reported with their limitations attached.

If that sounds like a modest claim, it is deliberately so. The alternative — publishing confident numbers from thin data — is how a genuine gap gets filled with noise.$ben$,
  null
)
on conflict (slug) do update set
  topic = excluded.topic,
  status = excluded.status,
  title_uz = excluded.title_uz,
  title_en = excluded.title_en,
  summary_uz = excluded.summary_uz,
  summary_en = excluded.summary_en,
  body_uz = excluded.body_uz,
  body_en = excluded.body_en,
  updated_at = now();

commit;

select slug, topic, status,
  left(title_uz, 40) as title_uz,
  left(title_en, 40) as title_en
from public.articles
where slug in (
  'forgetting-names',
  'automatic-reading',
  'sleep-and-memory',
  'rereading-illusion',
  'feeling-and-thinking',
  'cognition-uzbekistan'
)
order by slug;