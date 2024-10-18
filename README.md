Kullanıcı Görsel Üretim Platformu

Proje Tanımı:

Supabase ve Next.js kullanılarak, kullanıcıların kayıt ve giriş yapabildiği ve verdikleri prompt'lar doğrultusunda görseller oluşturabildiği bir platform geliştirildi. Kullanıcılar, oluşturdukları görselleri Supabase Storage'da saklıyor ve geçmişte oluşturdukları prompt'lar ile bu görsellere erişebiliyorlar. Görsel üretim işlemi Fal.ai API servisi ile yapılıyor, tüm veritabanı işlemleri sunucu tarafında yönetiliyor ve kullanıcı arayüzü shadcn bileşenleri ile tasarlanıyor. Kullanıcılara iki adet görsel üretme hakkı veriliyor, ardından hakları tükendiğinde bir uyarı gösteriliyor.

Özellikler:

1.	Kullanıcı Kayıt ve Giriş İşlemleri

o	Supabase Authentication entegrasyonu ile kullanıcıların kayıt ve giriş işlemleri yapılıyor.
o	Authentication işlemleri, Next.js app router yapısına uygun olarak sunucu tarafında yönetiliyor.
o	Kayıt işlemi sırasında e-posta ve şifre bilgisi alınıyor, bu bilgilerle giriş yapılabiliyor.
o	Giriş yapmış kullanıcılar, session bazlı kimlik doğrulaması ile kontrol ediliyor.

2.	Prompt Temelli Görsel Üretim

o	Fal.ai API Servisi entegrasyonu ile kullanıcılar, belirledikleri prompt'lar aracılığıyla görseller oluşturabiliyor.
o	Prompt'lar frontend’den sunucuya API çağrısı yapılarak Fal.ai servisine gönderiliyor ve dönen görsel kullanıcıya gösteriliyor.

3.	Veritabanı İşlemleri ve Saklama

o	Kullanıcıların oluşturduğu her bir görsel, Supabase storage modülünde saklanıyor.
o	Kullanıcıların daha önce girdiği prompt'lar ve üretilen görseller, veritabanında kullanıcı ile ilişkilendirilerek kaydediliyor.
o	Kullanıcılar, geçmişte girdiği prompt'lar ve oluşturduğu görselleri liste şeklinde görüntüleyebiliyor. Bu veriler, sunucu tarafında sorgulanıp frontend’e iletiliyor.

4.	Sunucu Tarafında Veritabanı İşlemleri

o	Tüm veritabanı işlemleri (create, read, update, delete) sunucu tarafında /api klasörü altında yönetiliyor.
o	Kullanıcıların prompt'larını ve oluşturdukları görselleri saklama ve erişim işlemleri güvenli bir şekilde sunucu tarafından gerçekleştiriliyor.

5.	Kullanıcı Arayüzü Geliştirme

o	Kullanıcı arayüzü shadcn bileşenleri ile tasarlanıyor.
o	Kayıt, giriş, prompt oluşturma ve geçmiş veriler gibi tüm sayfalar shadcn bileşenleri ile oluşturuluyor.

6.	Kullanıcı Hakları Yönetimi

o	Her bir kullanıcıya en fazla 2 adet görsel üretme hakkı veriliyor.
o	Kullanıcı 2 adet görsel ürettikten sonra, hakkının dolduğuna dair bir uyarı gösteriliyor ve daha fazla görsel üretimi engelleniyor.