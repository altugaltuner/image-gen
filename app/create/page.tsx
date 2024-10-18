import { createClient } from "@/utils/supabase/server"; // Supabase server client'ı
import ProfileImageUpload from "@/components/ProfileImageUpload"; // Profil resmi yükleme bileşeni

const supabase = createClient();

export default async function Page() {
    // Server-side kullanıcı bilgisi alınıyor
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return <div>Please log in to continue.</div>;
    }

    return (
        <div>
            <ProfileImageUpload user={user} />
        </div>
    );
}
