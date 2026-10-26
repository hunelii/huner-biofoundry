# İçerik geliştirmesi — kontrol kaydı

26 Ekim 2026 · `feature/scientific-content`

**Sonraki düzeltme:** Bu ilk kontrol hücrenin son görüntüsünü doğruladı, fakat canlı yayındaki geçişi bütünüyle doğrulamamıştı. Kullanıcının düzeltmesi üzerine yaklaşma, açılma ve bölümden çıkış canlı sürümle eşleştirildi. Güncel kaynak ve kontrol kaydı: [Yayımlanmış geçişin geri alınması](PUBLISHED-TRANSITION-RESTORATION.md). Aşağıdaki ilk incelemeye ait GitHub erişim kısıtı da daha sonra Git CLI ile giderildi.

## Geliştirilen sürüm

Çalışma, GitHub'a son aktarıldığı doğrulanan `b4a96ee3f3820698c83eb66e6b32fb8dea6ecf38` kaydından devam eder. Ana sayfa mevcut `FoundryExperience` ve `LivingFoundryCanvas` kullanır. Organic World laboratuvarı ana sayfaya taşınmadı. Hücre geometrisi, malzemeleri, shader'ları, büyüme kuralları ve kamera güzergâhı değiştirilmedi.

Vercel'in canlı alan adı `dpl_XZ4QHipcGoodoxV3j5cMQELvAQZC` yayınına bağlıydı. Yayın kaydında Git SHA yok; mevcut GitHub erişimi de özel depodan güncel HEAD okumaya izin vermiyor. Bu yüzden GitHub'da daha yeni bir kayıt bulunmadığı iddia edilmiyor. Canlı hücre sahnesi ayrıca salt okunur tarayıcı karşılaştırmasıyla kontrol edildi.

`production/stable` ve `checkpoint/pre-higgsfield-final` hâlâ `bde2863`; `experiment/organic-world` hâlâ `b4a96ee`. Canlı siteye yayın, uzak depoya gönderim veya korunan sürümlerde değişiklik yapılmadı.

## Uygulandı ve doğrulandı

- Mevcut ana sayfada daha somut, erken araştırma aşamasını doğru yansıtan anlatım; uygulamalar sonrasında Process A/B, araştırma ve yöntem bölümleri.
- Approach, Research, iki aday araştırma programı, Applications, Progress, People, Collaborate, Journal ve Publications sayfaları.
- Klavye/dokunma ile süreç seçimi, yöntem açılımları, değişken açıklamaları, sözlük, ölçüm çerçevesi, kaynaklar ve ilgili okumalar.
- Journal araması ve kategori filtresi; boş arama sonucu; ilerleme kaydı filtresi; gerçek 404 sayfası.
- Üç eğitim yazısı ve bir perspektif taslağı, yalnızca açıkça etkinleştirilmiş yerel inceleme modunda. Normal yayın çıktısında taslaklar, yolları ve içerikleri bulunmuyor.
- İletişim bilgileri, e-posta bağlantıları ve organizasyon şemasındaki e-posta kaldırıldı. Yeni form veya takip sistemi eklenmedi.
- Yeni açılır menü karanlık hücre sahnesinde okunabilir; kısa yatay ekranlarda kaydırılabilir. Okuma sayfalarının üst menüsü metinle üst üste binmiyor.
- Hızlı kaydırmada boş hücre sahnesi oluşturan mevcut bir güncelleme koşulu düzeltildi: kamera ilerlemesi bitse bile bölüm geçişinin çizimi tamamlanıyor. Geometri ve kamera tasarımı aynı kaldı.

### Kontrol sonuçları

| Kontrol | Sonuç |
| --- | --- |
| Node 24 / Next 16.4.3 normal üretim derlemesi ve TypeScript | Başarılı |
| Birim ve mevcut model testleri | 32 geçti, 0 başarısız |
| Normal statik çıktı | 19 HTML, 441 yerel bağlantı/varlık kontrolü, 0 hata |
| Taslak inceleme çıktısı | 23 HTML, 593 yerel bağlantı/varlık kontrolü, 0 hata |
| Tarayıcı akışı | 31 durum kaydı; yakalanan uygulama hatası yok |
| Masaüstü ve dokunmatik ekran boyutları | 1440×900, 390×844, 820×1180, 1180×820, 844×390 |
| Okuma sayfaları | Tek H1, yatay taşma yok, iletişim ifşası yok, GPU sahnesi yüklenmiyor |
| Hücre ve mevcut etkileşim | Koşul düğmesi, hızlı hücre geçişi, duraklatma, içerik bölümüne devam doğrulandı |
| Canlı / yerel hücre karşılaştırması | Three.js r180; aynı açık hücrede 573.736 çizilen üçgen; görüntüler incelendi |
| Erişilebilir alternatifler | GPU kapalı, azaltılmış hareket ve JavaScript kapalı okuma akışları kontrol edildi |
| Approach otomatik erişilebilirlik kontrolü | axe WCAG 2 A/AA ihlali bulunmadı; tam site sertifikası değildir |
| Üretim bağımlılık denetimi | Güncelleme sonrası bilinen açık sayısı 0; genel güvenlik garantisi değildir |

Kanıtlar çalışma alanındaki `output/scientific-content-review/` klasöründe: `browser-results.json`, `browser-run.log`, `unit-tests.log`, `production-build.log`, `export-check.log` ve ekran görüntüleri. Son normal derleme `out/` içinde; yerel sunucu taslak inceleme modunda çalışıyor.

## Uygulandı; kullanıcı görsel incelemesi bekliyor

Yeni içerik yoğunluğu, başlıklar, ek sayfalar ve Process A/B açıklaması yerel olarak incelenebilir:

- Ana deneyim: <http://localhost:3000/>
- Hücre: <http://localhost:3000/#material>
- Eklenen içerik: <http://localhost:3000/#process>
- Yaklaşım: <http://localhost:3000/approach/>
- Taslak yazılar: <http://localhost:3000/journal/>

Geliştirme sırasında masaüstü, telefon ve tablet görüntüleri incelendi; kullanıcının içerik ve görsel kabulü ayrıca bekleniyor.

## Olgusal doğrulama bekleyen içerik

- Araştırma programlarının güncel kapsamı.
- Ekip listesinin güncelliği ve kişilerin görevleri.
- Başarı kayıtlarının kesin tarihleri ve paylaşılabilir kanıt bağlantıları.
- Eğitim yazılarının yazarlığı, bilimsel incelemesi ve yayın onayı.

İletişim bilgileri kullanıcının isteğiyle paylaşılmıyor; bu bir eksik bilgi talebi değildir. Seçilme/finalist olma kayıtları ödül kazanılması olarak sunulmuyor.

## Kanıt eksikliği nedeniyle ertelendi

Deneysel sonuç grafikleri, performans yüzdeleri, karşılaştırmalı üstünlük, doğrulanmış ticari hizmetler, onaylı yayın PDF'i ve tarihlendirilmiş başarı kronolojisi eklenmedi. Veri veya onay olmadan bunlar üretilmeyecek.

## Teknik sınırlar

Ekran boyutları ayrı bir başsız Chrome örneğinde denendi; fiziksel orta sınıf telefon veya iPad performansı ölçülmedi. Otomatik erişilebilirlik kontrolü bütün sitenin manuel ekran okuyucu denetimi değildir. Özel GitHub deposunun güncel uzak HEAD'i yeniden okunamadı. Yerel inceleme modu erişim kontrolü değildir ve onay olmadan internete yayımlanmamalıdır.
