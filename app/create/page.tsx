import ImageCreate from "@/components/ImageCreate";
import { createClient } from "@/utils/supabase/server"; // Supabase server client'ı


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
            <ImageCreate user={user} />
        </div>
    );
}
