import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area"

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // // Kullanıcının profil bilgilerini Supabase'den alalım
  // const { data: profileData, error } = await supabase
  //   .from("profiles") // Profil tablosunun adı
  //   .select("created_images_url") // Kaydedilen profil resminin urlsini çekiyoruz
  //   .eq("id", user.id)
  //   .single();

  // Kullanıcının id'sine göre photos bucket'ındaki klasörden fotoğrafları çekelim
  const { data: images, error } = await supabase
    .storage
    .from("photos")
    .list(user.id, { limit: 100, offset: 0 });

  if (error) {
    console.error("Error fetching profile:", error.message);
  }
  return (
    <div className="flex flex-col items-center gap-8 p-6 justify-center">
      <h2 className="text-2xl font-bold">Profile Page</h2>

      {/* Display User ID and Email */}
      <div className="bg-gray-100 p-4 rounded shadow">
        <h3 className="font-bold text-xl">User Information</h3>
        <p>UserId: {user.id}</p>
        <p>Email: {user.email}</p>
      </div>

      {/* Gallery Section */}
      <div className="w-full flex flex-col justify-center">
        <h3 className="font-bold text-xl mb-4 text-center">AI-Generated Photo Gallery</h3>
        <ScrollArea className="h-64 w-full">
          <div className="flex gap-4">
            {images && images.length > 0 ? (
              images.map((image) => (
                <Image
                  key={image.id}
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${user.id}/${image.name}`}
                  alt={`Photo by ${user.email}`}
                  width={300}
                  height={300}
                  className="rounded"
                />
              ))
            ) : (
              // Eğer görsel yoksa placeholder
              <Image
                src="/placeholder.jpg"
                alt="Placeholder Image"
                width={150}
                height={150}
                className="rounded"
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}