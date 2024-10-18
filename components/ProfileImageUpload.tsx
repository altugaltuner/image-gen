"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { fal } from "@fal-ai/client";

// Supabase client (client-side)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Resmi Supabase bucket'a yükleme fonksiyonu
const uploadImageToSupabase = async (fileUrl: string, userId: string) => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    const fileName = `${new Date().getTime()}.png`;
    const folderPath = `${userId}/`; // Kullanıcının id'siyle bir klasör oluşturuyoruz

    const { error } = await supabase.storage
        .from("photos") // Bucket adı
        .upload(`${folderPath}${fileName}`, blob, {
            contentType: "image/png",
        });

    if (error) {
        console.error("Error uploading image:", error.message);
        return null;
    }

    // Yüklenen görselin public URL'sini döndür
    const { data } = supabase.storage.from("photos").getPublicUrl(`${folderPath}${fileName}`);

    return data.publicUrl;
};

// Kullanıcı profilini güncelleme fonksiyonu
const saveImageToUserProfile = async (imageUrl: string, userId: string) => {
    const { data, error } = await supabase
        .from("profiles")
        .update({ created_images_url: imageUrl })
        .eq("id", userId);

    if (error) {
        console.error("Error updating profile:", error.message);
    }
    return data;
};

fal.config({
    credentials: process.env.NEXT_PUBLIC_FAL_API_KEY,
});

const ProfileImageUpload = ({ user }: { user: any }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setImageUploaded(false);
        setIsLoading(true);
    };

    const handleSaveImage = async () => {
        if (!user) {
            alert("Please sign in to save the image.");
            return;
        }

        const uploadedImageUrl = await uploadImageToSupabase(imageUrl!, user.id);

        if (uploadedImageUrl) {
            await saveImageToUserProfile(uploadedImageUrl, user.id);
            alert("Image saved successfully!");
        }
    };

    useEffect(() => {
        const fetchImage = async () => {
            if (isLoading) {
                try {
                    const result = await fal.subscribe("fal-ai/fast-sdxl", {
                        input: { prompt: prompt },
                    });

                    const imageUrlFromResult = result.data.images[0].url;
                    setImageUrl(imageUrlFromResult);
                    setImageUploaded(true);
                } catch (error) {
                    console.error("Error fetching image:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchImage();
    }, [isLoading]);

    return (
        <div className="flex flex-col items-center gap-6 p-6">
            <h2 className="text-2xl font-bold">Profile Image Upload</h2>
            <div className="flex justify-center items-center bg-accent p-4 rounded shadow min-h-40">
                <p>Your image will be shown here.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center min-w-64">
                <Input
                    type="text"
                    placeholder="Enter image prompt"
                    className="w-full p-2 border rounded"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Submit"}
                </Button>
            </form>

            {imageUploaded && imageUrl && (
                <div className="mt-4 w-full">
                    <h3 className="font-bold text-xl mb-2">Created Image:</h3>
                    <ScrollArea className="h-48 w-full">
                        <div className="flex justify-center">
                            <Image src={imageUrl} alt="Generated image" width={300} height={300} className="rounded" />
                        </div>
                    </ScrollArea>
                </div>
            )}

            {imageUploaded && (
                <Button onClick={handleSaveImage}>
                    Save Image
                </Button>
            )}
        </div>
    );
};

export default ProfileImageUpload;
