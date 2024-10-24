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

  // Kullanıcının id'sine göre photos bucket'ındaki klasörden fotoğraflar çekiliyor
  const { data: images, error } = await supabase
    .storage
    .from("photos")
    .list(user.id, { limit: 100, offset: 0 });

  if (error) {
    console.error("Error fetching profile:", error.message);
  }
  return (
    <div className="flex flex-col items-center gap-8 p-3 justify-center">
      <h2 className="text-2xl font-normal">Profile Page</h2>

      <div className="bg-accent p-4 rounded shadow">
        <h3 className="font-medium text-xl">User Information</h3>
        <p>UserId: {user.id}</p>
        <p>Email: {user.email}</p>
      </div>

      <div className="w-full flex flex-col justify-center">
        <h3 className="font-normal text-xl mb-4 text-center">AI-Generated Photo Gallery</h3>
        <ScrollArea className="h-[38rem] w-full max-h-[750px] overflow-y-auto">
          <div className="flex flex-wrap gap-4 justify-center">
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
              <p>Your images will be listed here...</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}