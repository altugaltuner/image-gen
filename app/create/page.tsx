"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { fal } from "@fal-ai/client";

// Supabase client'ınızı oluşturun
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Resmi Supabase bucket'a yükleme fonksiyonu
const uploadImageToSupabase = async (fileUrl: string, userId: string) => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    const fileName = `${userId}/${new Date().getTime()}.png`;

    const { error } = await supabase.storage
        .from("photos") // Bucket adı
        .upload(fileName, blob, {
            contentType: "image/png",
        });

    if (error) {
        console.error("Error uploading image:", error.message);
        return null;
    }

    // Yüklenen görselin public URL'sini döndür
    const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(fileName);
    return publicUrl;
};

// Kullanıcı profilini güncelleme fonksiyonu
const saveImageToUserProfile = async (imageUrl: string, userId: string) => {
    const { data, error } = await supabase
        .from("profiles")
        .update({ profile_image: imageUrl })
        .eq("id", userId);

    if (error) {
        console.error("Error updating profile:", error.message);
    }
    return data;
};

fal.config({
    credentials: process.env.NEXT_PUBLIC_FAL_API_KEY,
});

const Create = () => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null); // Kullanıcı bilgisini sakla

    // Kullanıcı oturum bilgisini al
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user:", error.message);
            } else if (user) {
                console.log("User fetched successfully:", user);
                setUser(user);
            } else {
                console.log("No user found. Please log in.");
                // Oturum açılmamışsa buradan oturum açma sayfasına yönlendirebilirsiniz
            }
        };

        fetchUser();
    }, []);

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

        console.log("User:", user);
        console.log("Image URL:", imageUrl);

        // Görseli Supabase bucket'a yükleyin
        const uploadedImageUrl = await uploadImageToSupabase(imageUrl!, user.id);

        if (uploadedImageUrl) {
            // Kullanıcının profilini güncelle
            await saveImageToUserProfile(uploadedImageUrl, user.id);
            alert("Image saved successfully!");
        }
    };

    useEffect(() => {
        const fetchImage = async () => {
            if (isLoading) {
                try {
                    const result = await fal.subscribe("fal-ai/fast-sdxl", {
                        input: {
                            prompt: prompt,
                        },
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

            {/* Information Message */}
            <div className="bg-accent p-4 rounded shadow">
                <p>Your image will be shown here.</p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-start">
                <Input
                    type="text"
                    placeholder="Enter image prompt"
                    className="w-full p-2 border rounded"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Submit"}
                </Button>
            </form>

            {/* Conditional Image Area */}
            {imageUploaded && imageUrl && (
                <div className="mt-4 w-full">
                    <h3 className="font-bold text-xl mb-2">Created Image:</h3>
                    <ScrollArea className="h-48 w-full">
                        <div className="flex justify-center">
                            <Image
                                src={imageUrl}
                                alt="Generated image"
                                width={300}
                                height={300}
                                className="rounded"
                            />
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Save Button */}
            {imageUploaded && (
                <Button onClick={handleSaveImage}>
                    Save Image
                </Button>
            )}
        </div>
    );
};

export default Create;
