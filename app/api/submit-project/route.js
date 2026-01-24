import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Burada veritabanına kaydetme veya email gönderme işlemi yapılabilir
    console.log('Yeni proje gönderimi:', data);
    
    // Şimdilik sadece başarılı yanıt dön
    return NextResponse.json({ success: true, message: 'Proje başarıyla alındı' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
