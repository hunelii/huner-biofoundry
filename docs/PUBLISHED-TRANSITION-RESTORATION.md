# Yayımlanmış hücre geçişinin geri alınması

26 Ekim 2026 · `feature/scientific-content`

## Doğrulanan kaynak

- GitHub'ın güncel `main` ve `experiment/organic-world` dalları `git ls-remote` ile okundu: ikisi de `b4a96ee3f3820698c83eb66e6b32fb8dea6ecf38`.
- `https://huner-biofoundry.vercel.app` Vercel üzerinden `dpl_XZ4QHipcGoodoxV3j5cMQELvAQZC` olarak çözüldü. Canlı tarayıcının indirdiği JavaScript ayrıca incelendi; kaynak dosyalarla aynı geçişi içeriyor.
- Vercel listesindeki daha yeni `dpl_DmMdwT1nF1Gh4M8v1FjmJ8Wx6hWY` kaydı referans seçilmedi. Esas alınan, kullanıcıya açık alan adının gerçekten sunduğu deneyimdir.
- Vercel yayını Git commit bilgisi içermiyor. GitHub ile Vercel'in aynı kayıt olduğu varsayılmadı.

## Bulunan fark ve düzeltme

GitHub'daki yeniden oluşturulmuş temel sürüm, kameranın yaklaşmasını %50'de tamamlıyor ve %70–98 arasında hücreyi yeniden kapatıp küçültüyordu. Canlı yayında kamera %76'ya kadar yaklaşmayı sürdürüyor; duvar %32–67 arasında açılıyor, son bölüm hücrenin içini incelemeye ayrılıyor. Hücre, sabit ekran noktasından değil, ziyaretçinin biyolojik alanındaki dolu bir noktadan doğuyor.

Canlı sürümün bu zamanlaması, alan ile hücrenin ortak odak noktası, renk/örtüşme hesabı ve sayfa çıkışındaki yumuşak kaybolma geri alındı. Modelin geometrisi yeniden yapılmadı. Yeni bilimsel içerik, gezinme ve iletişim bilgilerini gizleme kararı korundu. Organic World laboratuvarı ana sayfaya taşınmadı.

`materialPhoto` adı eski shader'dan gelir: bağlı veri bir fotoğraf dosyası değil, Three.js hücresinin çizildiği render texture'dır. Geçişe fotoğraf veya yeni dış medya eklenmedi.

## Dosya eşleşmesi

Aşağıdaki SHA-1 değerleri Vercel'in yayımlanmış kaynak dosyası kimlikleriyle birebir eşleşiyor:

| Dosya | SHA-1 |
| --- | --- |
| `living-foundry/material-transition.ts` | `30c0e5dede23b473e1d2142b168cad9b838720ce` |
| `living-foundry/journey.ts` | `e39a7d5d655ff5887d61fe875e1c5e3dc5fb4b21` |
| `living-foundry/LivingFoundryCanvas.tsx` | `499f56ba65bfcabb94bf04eb5dea8797b840d770` |
| `living-foundry/shaders.ts` | `7d8255fb0233c0bb02e1e705131ab86b0b62e193` |

Kısa dosyalar Vercel kaynak API'sinden alındı. Büyük shader yanıtı kesildiği için canlı JavaScript içindeki özgün shader metinleri ayrıştırıldı; yeniden oluşturulan dosyanın tam hash'i yukarıdaki Vercel kimliğiyle doğrulandı. Canvas dosyası, aynı hash'i taşıyan yerel arşivden kurtarıldı. `engine.ts` içindeki bağlantılar canlı JavaScript'in okunabilir karşılığıyla eşleştirildi; bu dosya için birebir kaynak hash'i iddia edilmiyor.

## Kontroller

- 32 test geçti; üretim derlemesi ve TypeScript başarılı.
- Canlı ve yerel masaüstü deneyiminde yedi aşama yakalandı: cultivation, threshold, approach, opening, close, interior, exit. Önce/sonra farkı görsel olarak incelendi.
- Telefon boyutunda yedi aşama kontrol edildi; hücre WebGL ile çiziliyor ve hedef kamera konumuna ulaşıyor. Tarayıcı hatası yok.
- Hızlı geçiş, koşul düğmesi, duraklatma, ek içerik bölümü, GPU kapalı, azaltılmış hareket ve JavaScript kapalı okuma kontrolleri geçti.
- Kanıtlar: çalışma alanındaki `output/published-transition-reference/` klasörü. Masaüstü canlı referans `live/`, önceki yerel sürüm `local-before/`, düzeltilen sürüm `local-after/`, telefon kontrolü `local-after-phone/`.

Alan canlı ve kullanıcı geçmişine bağlı olduğundan biyolojik desenin her çalıştırmada piksel piksel aynı olması beklenmez. Eşleştirilen şey geçiş zamanlaması, odak seçimi, hücre yaklaşması/açılması ve bölümden çıkış davranışıdır. Telefon kontrolü fiziksel cihaz performans ölçümü değildir.

Canlı yayın değiştirilmedi ve GitHub'a gönderim yapılmadı. Yerel inceleme: <http://localhost:3000/#cultivation>.
